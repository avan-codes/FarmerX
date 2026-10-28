import asyncio, json
from pathlib import Path
import pytest
from app.repositories.json_store import JsonStore


@pytest.fixture
async def store(tmp_path):
    s = JsonStore(tmp_path / "store", lock_timeout=5)
    await s.startup()
    return s


async def test_concurrent_writes_all_land(store):
    await asyncio.gather(*[
        store.write("things", f"t{i}", {"id": f"t{i}", "n": i}) for i in range(50)])
    items, total = await store.list("things", page=1, page_size=100)
    assert total == 50
    assert sorted(i["n"] for i in items) == list(range(50))


async def test_no_partial_files_left_behind(store, tmp_path):
    await asyncio.gather(*[store.write("things", f"t{i}", {"id": f"t{i}"}) for i in range(20)])
    leftovers = list((tmp_path / "store" / "things").glob("*.tmp"))
    assert leftovers == []


async def test_index_rebuild_after_deletion(store, tmp_path):
    for i in range(5):
        await store.write("things", f"t{i}", {"id": f"t{i}", "n": i})
    (tmp_path / "store" / "_index" / "things.json").unlink()
    fresh = JsonStore(tmp_path / "store", lock_timeout=5)
    await fresh.startup()
    _, total = await fresh.list("things", page=1, page_size=100)
    assert total == 5


async def test_read_returns_none_for_missing(store):
    assert await store.read("things", "nope") is None


async def test_corrupt_record_does_not_break_rebuild(store, tmp_path):
    await store.write("things", "good", {"id": "good"})
    (tmp_path / "store" / "things" / "bad.json").write_text("{ not json")
    (tmp_path / "store" / "_index" / "things.json").unlink()
    fresh = JsonStore(tmp_path / "store", lock_timeout=5)
    await fresh.startup()
    items, total = await fresh.list("things", page=1, page_size=100)
    assert total == 1 and items[0]["id"] == "good"


async def test_sequential_refs(store):
    assert await store.next_ref("SR") == "SR-0001"
    assert await store.next_ref("SR") == "SR-0002"