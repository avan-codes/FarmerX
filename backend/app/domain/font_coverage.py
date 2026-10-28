"""Deterministic font glyph-coverage verification.

WeasyPrint silently falls back to another font (or tofu / .notdef) when a
glyph is missing, so we verify coverage ourselves with fontTools before
rendering. A missing glyph must fail the build test, never render tofu.
"""

from functools import lru_cache
from fontTools.ttLib import TTFont

# One representative string per supported script, containing the conjuncts,
# vowel signs, and digits most likely to be absent from a partial font.
TEST_STRINGS = {
    "en": "The quick brown fox jumps over the lazy dog 0123456789.",
    "hi": "नाइट्रोजन कम है इसलिए यूरिया दें। १२३४५६७८९०",
    "bn": "নাইট্রোজেন কম তাই ইউরিয়া দিন। ১২৩৪৫৬৭৮৯০",
    "mr": "नायट्रोजन कमी आहे म्हणून युरिया द्या. १२३४५६७८९०",
    "pa": "ਨਾਈਟ੍ਰੋਜਨ ਘੱਟ ਹੈ ਇਸ ਲਈ ਯੂਰੀਆ ਦਿਓ। ੧੨੩੪੫੬੭੮੯੦",
    "ta": "நைட்ரஜன் குறைவாக உள்ளது எனவே யூரியா இடவும். ௧௨௩௪௫௬௭௮௯௦",
    "te": "నైట్రోజన్ తక్కువగా ఉంది కాబట్టి యూరియా వేయండి. ౧౨౩౪౫౬౭౮౯౦",
}

# language -> font family used for the body of the PDF
LANGUAGE_FONT = {
    "en": "NotoSans", "hi": "NotoSansDevanagari",
    "bn": "NotoSansBengali", "mr": "NotoSansDevanagari",
    "pa": "NotoSansGurmukhi", "ta": "NotoSansTamil",
    "te": "NotoSansTelugu",
}


class GlyphCoverageError(RuntimeError):
    pass


@lru_cache(maxsize=None)
def _cmap(path: str) -> frozenset:
    font = TTFont(path, lazy=True)
    try:
        cmap: set = set()
        for table in font["cmap"].tables:
            cmap.update(table.cmap.keys())
        return frozenset(cmap)
    finally:
        font.close()


def assert_coverage(font_path: str, language: str) -> None:
    """Raise GlyphCoverageError if font_path lacks codepoints for language."""
    if language not in TEST_STRINGS:
        raise GlyphCoverageError(f"Unknown language '{language}'.")
    codepoints = _cmap(font_path)
    missing = sorted(
        {ord(ch) for ch in TEST_STRINGS[language]
         if ord(ch) not in codepoints and not ch.isspace()}
    )
    if missing:
        raise GlyphCoverageError(
            f"{font_path} is missing {len(missing)} codepoints for "
            f"'{language}': {[hex(c) for c in missing[:12]]}"
        )
