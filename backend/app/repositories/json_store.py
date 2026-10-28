import asyncio, json, os, threading
from pathlib import Path
from typing import Any

from filelock import FileLock

from app.core.errors import ApiError, ErrorCode

_RESERVED = {"_index", "_locks", "_state", "_uploads", "_audit"}


def _atomic_write(path: Path, payload: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    with open(tmp, "w", encoding="utf-8") as fh:
        fh.write(payload)
        fh.flush()
        os.fsync(fh.fileno())
    os.replace(tmp, path)


class JsonStore:
    """File-per-record store. Single-node only — a single writer process.
    Horizontal scaling requires a StorageBackend swap (interface is stable)."""

    def __init__(self, root: Path, lock_timeout: float = 10.0):
        self.root = Path(root)
        self.lock_timeout = lock_timeout
        self._locks: dict[str, asyncio.Lock] = {}
        self._indexes: dict[str, dict[str, dict]] = {}
        self._guard = threading.Lock()

    # --- lifecycle --------------------------------------------------------
    async def startup(self) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        (self.root / "_index").mkdir(exist_ok=True)
        (self.root / "_locks").mkdir(exist_ok=True)
        for path in sorted(self.root.iterdir()):
            if path.is_dir() and path.name not in _RESERVED:
                await asyncio.to_thread(self._load_or_rebuild_index, path.name)

    def _lock(self, collection: str) -> asyncio.Lock:
        lock = self._locks.get(collection)
        if lock is None:
            lock = asyncio.Lock()
            self._locks[collection] = lock
        return lock

    async def _ensure(self, collection: str) -> None:
        if collection in self._indexes:
            return
        async with self._lock(collection):
            if collection not in self._indexes:
                await asyncio.to_thread(self._load_or_rebuild_index, collection)

    # --- paths ------------------------------------------------------------
    def _record_path(self, collection: str, doc_id: str) -> Path:
        return self.root / collection / f"{doc_id}.json"

    def _index_path(self, collection: str) -> Path:
        return self.root / "_index" / f"{collection}.json"

    def _lock_path(self, name: str) -> Path:
        return self.root / "_locks" / f"{name}.lock"

    # --- index (sync, runs in worker thread) ------------------------------
    def _load_or_rebuild_index(self, collection: str) -> None:
        coll_dir = self.root / collection
        coll_dir.mkdir(parents=True, exist_ok=True)
        files = sorted(p for p in coll_dir.glob("*.json"))

        index_path = self._index_path(collection)
        if index_path.exists():
            try:
                data = json.loads(index_path.read_text(encoding="utf-8"))
                if data.get("format") == 1 and data.get("count") == len(files):
                    with self._guard:
                        self._indexes[collection] = data["records"]
                    return
            except json.JSONDecodeError:
                pass                                    # fall through to rebuild

        records: dict[str, dict] = {}
        for file in files:
            try:
                records[file.stem] = json.loads(file.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue                                # skip a torn record, never crash
        with self._guard:
            self._indexes[collection] = records
        self._persist_index(collection)

    def _persist_index(self, collection: str) -> None:
        with self._guard:
            records = dict(self._indexes.get(collection, {}))
        payload = json.dumps(
            {"format": 1, "collection": collection,
             "count": len(records), "records": records},
            ensure_ascii=False, sort_keys=True, indent=2)
        with FileLock(str(self._lock_path(f"_index__{collection}")),
                      timeout=self.lock_timeout):
            _atomic_write(self._index_path(collection), payload)

    # --- public API -------------------------------------------------------
    async def read(self, collection: str, doc_id: str) -> dict | None:
        await self._ensure(collection)
        path = self._record_path(collection, doc_id)
        if not path.exists():
            return None
        return await asyncio.to_thread(
            lambda: json.loads(path.read_text(encoding="utf-8")))

    async def exists(self, collection: str, doc_id: str) -> bool:
        await self._ensure(collection)
        return self._record_path(collection, doc_id).exists()

    async def write(self, collection: str, doc_id: str, doc: dict) -> None:
        await self._ensure(collection)
        payload = json.dumps(doc, ensure_ascii=False, sort_keys=True, indent=2)
        async with self._lock(collection):              # in-process serialisation
            await asyncio.to_thread(self._write_sync, collection, doc_id, payload)
            with self._guard:
                self._indexes[collection][doc_id] = doc
            await asyncio.to_thread(self._persist_index, collection)

    def _write_sync(self, collection: str, doc_id: str, payload: str) -> None:
        # File lock is acquired and released entirely inside this worker thread —
        # it is never held across an `await`.
        with FileLock(str(self._lock_path(f"{collection}__{doc_id}")),
                      timeout=self.lock_timeout):
            _atomic_write(self._record_path(collection, doc_id), payload)

    async def delete(self, collection: str, doc_id: str) -> bool:
        await self._ensure(collection)
        async with self._lock(collection):
            path = self._record_path(collection, doc_id)
            if not path.exists():
                return False

            def _remove():
                with FileLock(str(self._lock_path(f"{collection}__{doc_id}")),
                              timeout=self.lock_timeout):
                    path.unlink(missing_ok=True)

            await asyncio.to_thread(_remove)
            with self._guard:
                self._indexes[collection].pop(doc_id, None)
            await asyncio.to_thread(self._persist_index, collection)
            return True

    async def list(self, collection: str, *, filters: dict | None = None,
                   sort: list[tuple[str, str]] | None = None,
                   page: int = 1, page_size: int = 20) -> tuple[list[dict], int]:
        await self._ensure(collection)
        docs, total = self._filter_sort(collection, filters, sort)
        start = (page - 1) * page_size
        return [dict(d) for d in docs[start:start + page_size]], total

    async def count(self, collection: str, *, filters: dict | None = None) -> int:
        await self._ensure(collection)
        return self._filter_sort(collection, filters, None)[1]

    def _filter_sort(self, collection: str, filters: dict | None,
                     sort: list[tuple[str, str]] | None) -> tuple[list[dict], int]:
        with self._guard:
            docs = list(self._indexes.get(collection, {}).values())
        if filters:
            docs = [d for d in docs
                    if all(_matches(d, k, v) for k, v in filters.items())]
        if sort:
            for key, direction in reversed(sort):
                docs.sort(key=lambda d, k=key: _sort_key(d.get(k)),
                          reverse=(direction == "desc"))
        return docs, len(docs)

    async def next_ref(self, prefix: str) -> str:
        """Human-readable sequential reference, e.g. SR-0001."""

        def _bump() -> str:
            path = self.root / "counters.json"
            with FileLock(str(self._lock_path("_counters")), timeout=self.lock_timeout):
                data = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
                data[prefix] = int(data.get(prefix, 0)) + 1
                _atomic_write(path, json.dumps(data, sort_keys=True, indent=2))
                return f"{prefix}-{data[prefix]:04d}"

        await self._ensure("_counters_placeholder") if False else None
        return await asyncio.to_thread(_bump)


def _matches(doc: dict, key: str, expected) -> bool:
    actual = doc.get(key)
    if isinstance(expected, (list, tuple, set)):
        return actual in expected
    return actual == expected


def _sort_key(value):
    return (value is None, value if not isinstance(value, (dict, list)) else str(value))