import json
from pathlib import Path
from types import MappingProxyType

from app.domain.thresholds import ThresholdRegistry
from app.domain.units import UnitRegistry


class ConfigError(RuntimeError):
    pass


def _load(path: Path):
    if not path.exists():
        raise ConfigError(f"Missing config file: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _index_by_id(rows: list[dict], *, label: str) -> dict:
    out = {}
    for row in rows:
        rid = row.get("id")
        if not rid:
            raise ConfigError(f"{label}: entry missing 'id': {row!r}")
        if rid in out:
            raise ConfigError(f"{label}: duplicate id '{rid}'.")
        out[rid] = row
    return out


class ConfigRepository:
    """Read-only, loaded once at startup. Nothing here is hardcoded in code."""

    def __init__(self, config_dir: Path):
        self.config_dir = Path(config_dir)
        self._loaded = False

    def load(self) -> None:
        crops = _load(self.config_dir / "crops.json")
        regions = _load(self.config_dir / "regions.json")
        stages = _load(self.config_dir / "stages.json")
        units_doc = _load(self.config_dir / "units.json")
        languages = _load(self.config_dir / "languages.json")
        fertilizers = _load(self.config_dir / "fertilizers.json")
        soil_parameters = _load(self.config_dir / "soil_parameters.json")
        soil_thresholds = _load(self.config_dir / "soil_thresholds.json")
        engine_config = _load(self.config_dir / "rule_engine.json")

        self.crops = MappingProxyType(_index_by_id(crops["crops"], label="crops"))
        self.regions = MappingProxyType(_index_by_id(regions["regions"], label="regions"))
        self.stages = MappingProxyType(_index_by_id(stages["stages"], label="stages"))
        self.fertilizers = MappingProxyType(
            _index_by_id(fertilizers["fertilizers"], label="fertilizers"))
        self.soil_parameters = MappingProxyType(
            _index_by_id(soil_parameters["parameters"], label="soil_parameters"))
        self.languages = tuple(languages["languages"])

        ai_path = self.config_dir / "ai.json"
        ai_doc = (json.loads(ai_path.read_text(encoding="utf-8"))
                  if ai_path.exists()
                  else {"language_names": {lang: lang for lang in self.languages},
                        "summary_max_sentences": 5})
        self.ai = MappingProxyType(ai_doc)
        self.language_names = MappingProxyType(ai_doc["language_names"])

        self.units = UnitRegistry(units_doc)
        self.thresholds = ThresholdRegistry(soil_thresholds)

        translations = {}
        for lang in self.languages:
            path = self.config_dir / "translations" / f"{lang}.json"
            translations[lang] = MappingProxyType(
                json.loads(path.read_text(encoding="utf-8")) if path.exists() else {})
        self.translations = MappingProxyType(translations)

        self.engine_config = MappingProxyType(engine_config)

        news_categories = _load(self.config_dir / "news_categories.json")
        self.news_categories = MappingProxyType(news_categories["categories"])

        self._validate_cross_refs()
        self._loaded = True

    def _validate_cross_refs(self) -> None:
        for stage in self.stages.values():
            for crop_id in stage.get("crop_ids", []):
                if crop_id not in self.crops:
                    raise ConfigError(f"stage '{stage['id']}' references unknown crop '{crop_id}'.")
            for region_id in stage.get("region_ids", []):
                if region_id not in self.regions:
                    raise ConfigError(
                        f"stage '{stage['id']}' references unknown region '{region_id}'.")
        for fert in self.fertilizers.values():
            if fert.get("unit") not in {u["id"] for u in
                                        self.units._quantity.values()}:
                raise ConfigError(f"fertilizer '{fert['id']}' has unknown unit "
                                  f"'{fert.get('unit')}'.")

    # --- accessors --------------------------------------------------------
    def stage_for(self, stage_id: str, crop_id: str, region_id: str) -> dict | None:
        stage = self.stages.get(stage_id)
        if stage is None:
            return None
        if crop_id not in stage.get("crop_ids", []):
            return None
        if region_id not in stage.get("region_ids", []):
            return None
        return stage

    def stages_for(self, crop_id: str, region_id: str) -> list[dict]:
        return [s for s in self.stages.values()
                if crop_id in s.get("crop_ids", []) and region_id in s.get("region_ids", [])]

    def translate(self, lang: str, key: str, **params) -> str:
        table = self.translations.get(lang) or self.translations.get("en", {})
        fallback = self.translations.get("en", {})
        template = table.get(key) or fallback.get(key) or key
        try:
            return template.format(**params) if params else template
        except (KeyError, IndexError):
            return template

    def soil_param_range(self, param_id: str) -> tuple[float, float]:
        p = self.soil_parameters[param_id]
        return p["min"], p["max"]