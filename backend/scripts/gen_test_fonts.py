"""Generate minimal TTF test fonts covering each language's test string."""

import os
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
from app.domain.font_coverage import TEST_STRINGS, LANGUAGE_FONT

OUT = "data/fonts"


def _build_cmap(codepoints):
    cmap = newTable("cmap")
    cmap.version = 0
    sub = CmapSubtable.__new__(CmapSubtable)
    sub.platformID = 3
    sub.platEncID = 10
    sub.language = 0
    sub.version = 0
    sub.cmap = {cp: f"c{cp}" for cp in codepoints}
    cmap.tables = [sub]
    return cmap


def _build_head(n_glyphs):
    head = newTable("head")
    head.tableVersion = 0x00010000
    head.fontRevision = 0x00010000
    head.checkSumAdjustment = 0
    head.magicNumber = 0x5F0F3CF5
    head.flags = 0x0003
    head.unitsPerEm = 1024
    head.created = 0
    head.modified = 0
    head.xMin = 0
    head.yMin = 0
    head.xMax = 1000
    head.yMax = 1000
    head.macStyle = 0
    head.lowestRecPPEM = 8
    head.fontDirectionHint = 2
    head.indexToLocFormat = 0
    head.glyphDataFormat = 0
    return head


def _build_hhea(n):
    hhea = newTable("hhea")
    hhea.tableVersion = 0x00010000
    hhea.ascent = 800
    hhea.descent = -200
    hhea.lineGap = 0
    hhea.advanceWidthMax = 1000
    hhea.minLeftSideBearing = 0
    hhea.minRightSideBearing = 0
    hhea.xMaxExtent = 1000
    hhea.caretSlopeRise = 1
    hhea.caretSlopeRun = 0
    hhea.caretOffset = 0
    hhea.reserved0 = 0
    hhea.reserved1 = 0
    hhea.reserved2 = 0
    hhea.reserved3 = 0
    hhea.reserved4 = 0
    hhea.metricDataFormat = 0
    hhea.numberOfHMetrics = n
    return hhea


def _build_maxp(n):
    maxp = newTable("maxp")
    maxp.tableVersion = 0x00010000
    maxp.numGlyphs = n
    maxp.maxPoints = 0
    maxp.maxContours = 0
    maxp.maxCompositePoints = 0
    maxp.maxCompositeContours = 0
    maxp.maxZones = 1
    maxp.maxTwilightPoints = 0
    maxp.maxStorage = 0
    maxp.maxFunctionDefs = 0
    maxp.maxInstructionDefs = 0
    maxp.maxStackElements = 0
    maxp.maxSizeOfInstructions = 0
    maxp.maxComponentElements = 0
    maxp.maxComponentDepth = 0
    return maxp


def _build_hmtx(names):
    hmtx = newTable("hmtx")
    hmtx.metrics = {name: (500, 50) for name in names}
    return hmtx


def _build_os2(codepoints):
    os2 = newTable("OS/2")
    os2.version = 4
    os2.xAvgCharWidth = 500
    os2.usWeightClass = 400
    os2.usWidthClass = 5
    os2.fsType = 0
    os2.ySubscriptXSize = 500
    os2.ySubscriptYSize = 500
    os2.ySubscriptXOffset = 0
    os2.ySubscriptYOffset = 0
    os2.ySuperScriptXSize = 500
    os2.ySuperScriptYSize = 500
    os2.ySuperScriptXOffset = 0
    os2.ySuperScriptYOffset = 0
    os2.yStrikeOutSize = 50
    os2.yStrikeOutPosition = 400
    os2.sFamilyClass = 0
    os2.panose = [0] * 10
    os2.ulUnicodeRange1 = 0
    os2.ulUnicodeRange2 = 0
    os2.ulUnicodeRange3 = 0
    os2.ulUnicodeRange4 = 0
    os2.achVendID = "TEST"
    os2.fsSelection = 0
    os2.usFirstCharIndex = min(codepoints) if codepoints else 0
    os2.usLastCharIndex = max(codepoints) if codepoints else 0
    os2.sTypoAscender = 800
    os2.sTypoDescender = -200
    os2.sTypoLineGap = 0
    os2.usWinAscent = 800
    os2.usWinDescent = 200
    os2.ulCodePageRange1 = 1
    os2.ulCodePageRange2 = 0
    return os2


def _make_font(path, codepoints, family):
    font = TTFont()
    glyph_names = [".notdef"] + [f"c{cp}" for cp in codepoints]
    font.setGlyphOrder(glyph_names)

    font["cmap"] = _build_cmap(codepoints)
    font["head"] = _build_head(len(glyph_names))
    font["hhea"] = _build_hhea(len(glyph_names))
    font["maxp"] = _build_maxp(len(glyph_names))
    font["hmtx"] = _build_hmtx(glyph_names)
    font["OS/2"] = _build_os2(codepoints)
    font["post"] = newTable("post")
    font["post"].formatType = 3.0
    font["name"] = newTable("name")
    font["name"].names = []

    font.save(path, reorderTables=False)
    print(f"Generated {path} with {len(codepoints)} glyphs")


def main():
    os.makedirs(OUT, exist_ok=True)

    latin_cps = sorted({ord(c) for c in TEST_STRINGS["en"] if not c.isspace()})
    _make_font(f"{OUT}/NotoSans-Regular.ttf", latin_cps, "NotoSans")
    _make_font(f"{OUT}/NotoSans-Bold.ttf", latin_cps, "NotoSans")

    for lang in TEST_STRINGS:
        family = LANGUAGE_FONT[lang]
        codepoints = sorted({ord(c) for c in TEST_STRINGS[lang] if not c.isspace()})
        codepoints = sorted(set(codepoints) | set(latin_cps))
        _make_font(f"{OUT}/{family}-Regular.ttf", codepoints, family)
        _make_font(f"{OUT}/{family}-Bold.ttf", codepoints, family)

    print(f"\nAll fonts in {OUT}/")


if __name__ == "__main__":
    main()
