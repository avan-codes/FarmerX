"""PDF rendering service.

Renders strictly from the stored immutable snapshot. The stored
recommendation is never recomputed; the cached AI summary (Phase 2) is
attached if present but is not regenerated here.
"""

import asyncio, hashlib, logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

from app.domain.font_coverage import LANGUAGE_FONT, assert_coverage

log = logging.getLogger("farmerx.pdf")


class PDFService:
    def __init__(self, *, template_dir: Path, font_dir: Path, cache_dir: Path,
                 template_version: str, config):
        self.template_dir = Path(template_dir)
        self.font_dir = Path(font_dir)
        self.cache_dir = Path(cache_dir)
        self.template_version = template_version
        self.config = config
        self._env = Environment(
            loader=FileSystemLoader(str(self.template_dir)),
            autoescape=select_autoescape(["html"]),
        )
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _font_paths(self, language: str) -> dict:
        family = LANGUAGE_FONT[language]
        regular = self.font_dir / f"{family}-Regular.ttf"
        bold = self.font_dir / f"{family}-Bold.ttf"
        latin = self.font_dir / "NotoSans-Regular.ttf"
        for path in (regular, bold, latin):
            if not path.exists():
                raise FileNotFoundError(f"Bundled font missing: {path}")
        return {"family": family, "regular": str(regular),
                "bold": str(bold), "latin": str(latin)}

    def _cache_path(self, recommendation_id: str, language: str) -> Path:
        key = hashlib.sha256(
            f"{recommendation_id}|{language}|{self.template_version}".encode()
        ).hexdigest()
        return self.cache_dir / f"{key}.pdf"

    async def render(self, recommendation: dict, *, language: str) -> Path:
        if language not in self.config.languages:
            language = "en"
        cached = self._cache_path(recommendation["recommendation_id"], language)
        if cached.exists():
            return cached

        fonts = self._font_paths(language)
        assert_coverage(fonts["regular"], language)

        # The AI summary is attached only if Phase 2 already produced it.
        ai_summary = recommendation.get("ai_summary") or {}
        html = self._env.get_template("recommendation.html").render(
            rec=recommendation,
            language=language,
            fonts=fonts,
            ai_text=ai_summary.get("text"),
            labels=self._labels(language),
        )

        def _render_sync() -> bytes:
            return HTML(string=html, base_url=str(self.font_dir)).write_pdf()

        pdf_bytes = await asyncio.to_thread(_render_sync)
        tmp = cached.with_suffix(".pdf.tmp")
        await asyncio.to_thread(tmp.write_bytes, pdf_bytes)
        tmp.replace(cached)
        return cached

    def _labels(self, language: str) -> dict:
        keys = [
            "pdf.title", "pdf.soil_summary", "pdf.plan", "pdf.fertilizer",
            "pdf.quantity", "pdf.timing", "pdf.method", "pdf.reason",
            "pdf.cautions", "pdf.source", "pdf.disclaimer", "pdf.generated",
            "pdf.report_id", "pdf.no_rule",
        ]
        return {key: self.config.translate(language, key) for key in keys}
