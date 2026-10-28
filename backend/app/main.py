import logging
from pathlib import Path

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.v1.routers import (
    admin, assistant, auth, config, farms, health, market_prices,
    news, profile, recommendations, soil_reports,
)
from app.core.errors import ApiError, ErrorCode
from app.core.logging import RequestIdMiddleware, TimingMiddleware, configure_logging, request_id_ctx
from app.core.settings import Settings, get_settings
from app.domain.rule_engine import RuleEngine
from app.providers.news_rss import RSSNewsProvider
from app.providers.nim import NimProvider
from app.providers.none import NullProvider
from app.providers.prices_datagov import DataGovMarketProvider
from app.repositories.audit import AuditLog
from app.repositories.config_repository import ConfigRepository
from app.repositories.json_store import JsonStore
from app.repositories.rule_repository import RuleRepository
from app.services.ai_service import AIService
from app.services.market_service import MarketService
from app.services.news_service import NewsService
from app.services.pdf_service import PDFService


def _build_provider(settings: Settings):
    if settings.llm_provider.lower() == "nim":
        if not settings.nvidia_api_key:
            logging.getLogger("farmerx.ai").warning(
                "LLM_PROVIDER=nim but NVIDIA_API_KEY is unset. AI disabled.")
            return NullProvider()
        fallbacks = [m.strip() for m in
                     settings.nim_fallback_models.split(",") if m.strip()]
        return NimProvider(
            api_key=settings.nvidia_api_key,
            base_url=settings.nim_base_url,
            model=settings.nim_model,
            fallback_models=fallbacks,
            timeout_s=settings.ai_request_timeout_s,
            connect_timeout_s=settings.ai_connect_timeout_s,
            guided_json=settings.nim_guided_json,
        )
    return NullProvider()


def _build_market_provider(settings):
    if not settings.market_ingest_enabled or not settings.data_gov_api_key:
        return None
    return DataGovMarketProvider(
        api_key=settings.data_gov_api_key,
        resource_id=settings.data_gov_resource_id,
        base_url=settings.data_gov_base_url)


def _build_news_provider(settings):
    if not settings.news_ingest_enabled:
        return None
    return RSSNewsProvider(feeds=settings.news_feeds)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        configure_logging(settings.log_level)
        config_repo = ConfigRepository(settings.config_dir)
        config_repo.load()
        rule_repo = RuleRepository(settings.rules_dir, config_repo)
        rule_repo.load()
        store = JsonStore(settings.store_dir, settings.file_lock_timeout)
        await store.startup()

        app.state.settings = settings
        app.state.config_repo = config_repo
        app.state.rule_repo = rule_repo
        app.state.store = store
        app.state.rule_engine = RuleEngine(config_repo, dict(config_repo.engine_config))
        app.state.audit = AuditLog(settings.store_dir, settings.file_lock_timeout)

        ai_service = AIService(provider=_build_provider(settings), store=store,
                               config=config_repo, settings=settings)
        app.state.ai_service = ai_service

        market_service = MarketService(
            provider=_build_market_provider(settings),
            store=store, settings=settings)
        news_service = NewsService(
            provider=_build_news_provider(settings),
            store=store, config=config_repo, settings=settings)
        pdf_service = PDFService(
            template_dir=Path("app/templates"),
            font_dir=settings.pdf_font_dir,
            cache_dir=settings.pdf_cache_dir,
            template_version=settings.pdf_template_version,
            config=config_repo)
        app.state.market_service = market_service
        app.state.news_service = news_service
        app.state.pdf_service = pdf_service

        await market_service.start()
        await news_service.start()
        try:
            yield
        finally:
            await news_service.stop()
            await market_service.stop()
            await ai_service.aclose()

    app = FastAPI(title="FarmerX API", version="0.1.0",
                  description="Soil-to-Action Execution Layer — Phase 1 (deterministic core)",
                  lifespan=lifespan)

    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(TimingMiddleware)
    app.add_middleware(CORSMiddleware,
                       allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
                       allow_methods=["*"], allow_headers=["*"])

    @app.exception_handler(ApiError)
    async def api_error_handler(_: Request, exc: ApiError):
        return JSONResponse(status_code=exc.status, content=exc.to_body(request_id_ctx.get()),
                            headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={
            "type": "about:blank", "title": "Validation failed", "status": 422,
            "detail": "Request body failed validation.",
            "code": ErrorCode.VALIDATION_ERROR,
            "errors": [{"field": ".".join(str(p) for p in e["loc"]),
                        "message": e["msg"]} for e in exc.errors()],
            "request_id": request_id_ctx.get(),
        })

    api = "/api/v1"
    for router in (health.router, config.router, auth.router, soil_reports.router,
                   recommendations.router, assistant.router, market_prices.router,
                   news.router, profile.router, farms.router, admin.router):
        app.include_router(router, prefix=api)

    @app.get(f"{api}/health", include_in_schema=False)
    async def _alias_health(request: Request):
        return await health.health(request.app.state.rule_repo, request.app.state.rule_engine)

    return app


app = create_app()
