from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "local"
    log_level: str = "INFO"
    data_dir: Path = Path("data")
    config_dir: Path = Path("data/config")
    rules_dir: Path = Path("data/rule_sets")
    engine_version: str = "1.0.0"
    file_lock_timeout: float = 10.0
    page_size_default: int = 20
    page_size_max: int = 100
    cors_origins: str = "*"
    admin_api_key: str = "dev-admin-key"
    max_upload_bytes: int = 5_000_000
    llm_provider: str = "none"
    nvidia_api_key: str | None = None
    nim_base_url: str = "https://integrate.api.nvidia.com/v1"
    nim_model: str = "meta/llama-3.1-8b-instruct"
    nim_fallback_models: str = ""
    nim_guided_json: bool = True
    ai_max_tokens: int = 512
    ai_request_timeout_s: float = 30.0
    ai_connect_timeout_s: float = 5.0
    ai_daily_token_budget: int = 200_000
    ai_daily_request_budget: int = 500
    ai_user_requests_per_minute: int = 6
    ai_cache_ttl_hours: int = 168
    ai_max_history_messages: int = 12
    ai_max_message_chars: int = 2000
    ai_prompt_version: str = "2026-10-28.1"
    nim_cost_per_1k_input_usd: float = 0.0
    nim_cost_per_1k_output_usd: float = 0.0
    # --- PDF -----------------------------------------------------------------
    pdf_template_version: str = "1"
    pdf_font_dir: Path = Path("data/fonts")
    pdf_cache_dir: Path = Path("data/store/_pdf_cache")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Make PDF cache dir relative to data_dir
        if not self.pdf_cache_dir.is_absolute():
            self.pdf_cache_dir = self.data_dir / self.pdf_cache_dir
    # --- Market prices -------------------------------------------------------
    market_ingest_enabled: bool = True
    market_ingest_interval_minutes: int = 360
    data_gov_api_key: str | None = None
    data_gov_resource_id: str = "9ef84268-d588-465a-a308-a864a43d0070"
    data_gov_base_url: str = "https://api.data.gov.in"
    market_stale_after_hours: int = 48
    # --- News -----------------------------------------------------------------
    news_ingest_enabled: bool = True
    news_ingest_interval_minutes: int = 60
    news_feeds: list = [
        "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
        "https://www.thehindu.com/business/agri-business/feeder/default.rss",
    ]
    news_stale_after_hours: int = 24
    news_max_items_per_feed: int = 40

    @property
    def store_dir(self) -> Path:
        return self.data_dir / "store"


@lru_cache
def get_settings() -> Settings:
    return Settings()
