"""Import the data.gov.in market price CSV into the JsonStore.

CSV columns (from data.gov.in resource 9ef84268-...):
    State, District, Market, Commodity, Variety, Grade, Arrival_Date,
    Min_x0020_Price, Max_x0020_Price, Modal_x0020_Price

Usage (from backend/):
    .venv/bin/python scripts/import_market_csv.py \
        /home/pranjal/Downloads/9ef84268-d588-465a-a308-a864a43d0070.csv
"""

import asyncio, csv, json, sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.repositories.json_store import JsonStore
from app.core.settings import get_settings

settings = get_settings()
store = JsonStore(settings.store_dir, settings.file_lock_timeout)


def _parse_date(value: str) -> str | None:
    """DD/MM/YYYY -> YYYY-MM-DD."""
    value = (value or "").strip()
    if not value:
        return None
    try:
        return datetime.strptime(value, "%d/%m/%Y").date().isoformat()
    except ValueError:
        try:
            return datetime.strptime(value, "%Y-%m-%d").date().isoformat()
        except ValueError:
            return None


def _num(value) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _build_records(csv_path: str) -> dict:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    records_by_date: dict[str, list[dict]] = {}
    seen: set = set()

    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            price_date = _parse_date(row.get("Arrival_Date", ""))
            if not price_date:
                continue

            item = {
                "commodity": (row.get("Commodity") or "").strip(),
                "state": (row.get("State") or "").strip(),
                "district": (row.get("District") or "").strip(),
                "market": (row.get("Market") or "").strip(),
                "variety": (row.get("Variety") or "").strip(),
                "grade": (row.get("Grade") or "").strip(),
                "min_price": _num(row.get("Min_x0020_Price")),
                "max_price": _num(row.get("Max_x0020_Price")),
                "modal_price": _num(row.get("Modal_x0020_Price")),
                "unit": "quintal",   # data.gov.in prices are per quintal
                "price_date": price_date,
                "source": "data.gov.in",
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "stale": False,
                "is_sample": False,
            }
            if not item["commodity"] or not item["market"]:
                continue

            # Dedup identical rows for the same day.
            key = (price_date, item["commodity"], item["market"], item["modal_price"])
            if key in seen:
                continue
            seen.add(key)

            records_by_date.setdefault(price_date, []).append(item)

    return records_by_date


async def import_csv(csv_path: str) -> dict:
    await store.startup()
    records_by_date = _build_records(csv_path)

    total = 0
    latest_date = None
    for price_date in sorted(records_by_date):
        items = records_by_date[price_date]
        doc = {
            "price_date": price_date,
            "source": "data.gov.in",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "raw_hash": f"imported-{price_date}-{len(items)}",
            "items": items,
        }
        await store.write("market_prices", price_date, doc)
        total += len(items)
        latest_date = price_date

    # Update the market_prices cursor so reads pick up the imported snapshot.
    if latest_date:
        await store.write("_state", "market_prices", {
            "last_fetched_at": datetime.now(timezone.utc).isoformat(),
            "last_price_date": latest_date,
            "last_raw_hash": f"imported-{latest_date}",
        })

    return {"days": len(records_by_date), "records": total, "latest": latest_date}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: import_market_csv.py <path-to-csv>")
        sys.exit(1)
    result = asyncio.run(import_csv(sys.argv[1]))
    print(json.dumps(result, indent=2))
