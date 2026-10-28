"""Download Noto Sans fonts for all supported scripts.

Build-time helper (not runtime code). Populates data/fonts/ with the exact
TTF files the PDF service needs. Run before building the Docker image:

    python scripts/fetch_fonts.py

Sources: https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSans<Script>/unhinted/ttf/
"""

from pathlib import Path
import urllib.request

OUT = Path("data/fonts")
SCRIPTS = {
    "NotoSans": "Sans",
    "NotoSansDevanagari": "Devanagari",
    "NotoSansBengali": "Bengali",
    "NotoSansGurmukhi": "Gurmukhi",
    "NotoSansTamil": "Tamil",
    "NotoSansTelugu": "Telugu",
}

BASE = "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSans{script}/unhinted/ttf/"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for family, script in SCRIPTS.items():
        for weight in ("Regular", "Bold"):
            name = f"{family}-{weight}.ttf"
            url = BASE.format(script=script) + name
            dest = OUT / name
            print(f"Fetching {name} ...")
            try:
                urllib.request.urlretrieve(url, dest)
                print(f"  -> {dest} ({dest.stat().st_size} bytes)")
            except Exception as exc:
                print(f"  FAILED {url}: {exc}")
    print("\nDone. Place these files in data/fonts/ for production builds.")


if __name__ == "__main__":
    main()
