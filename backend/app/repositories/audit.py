import asyncio, json, os
from datetime import datetime, timezone
from pathlib import Path

from filelock import FileLock


class AuditLog:
    def __init__(self, store_root: Path, lock_timeout: float = 10.0):
        self.path = Path(store_root) / "_audit" / "recommendations.jsonl"
        self.lock_path = Path(store_root) / "_locks" / "_audit.lock"
        self.lock_timeout = lock_timeout

    async def append(self, record: dict) -> None:
        record = {"logged_at": datetime.now(timezone.utc).isoformat(), **record}
        line = json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n"
        await asyncio.to_thread(self._append_sync, line)

    def _append_sync(self, line: str) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with FileLock(str(self.lock_path), timeout=self.lock_timeout):
            with open(self.path, "a", encoding="utf-8") as fh:
                fh.write(line)
                fh.flush()
                os.fsync(fh.fileno())