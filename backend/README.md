# FarmerX Backend

Soil-to-Action Execution Layer — a deterministic agronomic recommendation API with optional AI explanation, PDF export, market prices, news, and farm/profile management.

## Architecture Overview

| Phase | Ships | AI Dependency |
|-------|-------|---------------|
| **1 — Deterministic core** | Config repo, JsonStore, rule engine, POST /recommendations, `no_validated_rule`, audit log | None |
| **2 — NIM explainer** | summarize, answer, guardrails, cache, budget, degradation | Optional; `LLM_PROVIDER=none` works |
| **3 — Production** | PDF in 7 languages, market prices, news, farms/profile, admin audit, health, Docker | Still optional; PDF uses only the cached summary |

### Non-Goals (enforced)
- ❌ No dosage logic outside `domain/rule_engine.py` — PDF, feeds, and farms never touch quantities.
- ❌ No LLM call on the PDF path or the recommendation path.
- ❌ No hardcoded crop/region/stage/unit/language/fertilizer lists — everything is config-driven.
- ❌ No invented agronomic values, prices, or news.
- ❌ No fallback dose under any condition.
- ❌ No PyMongo / MongoDB dependency.

---

## Quick Start

### 1. Install dependencies
```bash
cd backend
pip install -e ".[dev]"
```

### 2. (Optional) Fetch real Noto fonts for PDF
The bundled test fonts are placeholders. For production, download real Noto fonts:

```bash
python scripts/fetch_fonts.py
# Populates data/fonts/ with NotoSans*, NotoSansDevanagari*, NotoSansBengali*,
# NotoSansGurmukhi*, NotoSansTamil*, NotoSansTelugu* (Regular + Bold)
```

### 3. Run the server (AI disabled — deterministic only)
```bash
uvicorn app.main:app --reload
```
Health: `http://localhost:8000/api/v1/health` → `"ai": {"status": "disabled"}`

### 4. Run with NIM (optional AI explanation)
```bash
export LLM_PROVIDER=nim
export NVIDIA_API_KEY="nvapi-..."
export NIM_MODEL="meta/llama-3.1-8b-instruct"
uvicorn app.main:app --reload
```

### 5. Run tests
```bash
pytest -q
```
Expected: **84 passed, 4 skipped** (skips are font-coverage tests that need real Noto fonts).

---

## API Endpoints

### Recommendations (Phase 1–2)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/v1/recommendations` | Create a soil-based fertilizer recommendation | `X-Farmer-Id` |
| `GET` | `/api/v1/recommendations/{rec_id}` | Get recommendation (with cached AI summary) | `X-Farmer-Id` |
| `POST` | `/api/v1/recommendations/{rec_id}/summary` | Generate AI summary (guardrailed, cached) | `X-Farmer-Id` |
| `GET` | `/api/v1/recommendations/{rec_id}/assistant` | Get assistant conversation history | `X-Farmer-Id` |
| `POST` | `/api/v1/recommendations/{rec_id}/assistant` | Ask a question scoped to the report | `X-Farmer-Id` |
| `GET` | `/api/v1/recommendations/{rec_id}/pdf?language=xx` | Export recommendation to PDF (7 languages) | `X-Farmer-Id` |

**Sample create request:**
```bash
curl -s -X POST localhost:8000/api/v1/recommendations \
  -H 'X-Farmer-Id: farmer_A' -H 'Content-Type: application/json' \
  -d '{"soil_values":{"N":100,"P":20,"K":150,"pH":6.8,"OC":0.4},
       "crop_id":"testcrop","region_id":"TESTREGION","stage_id":"basal",
       "area":{"value":2,"unit":"acre"},"language":"en"}'
```

### Market Prices (Phase 3)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/market-prices` | Query mandi prices (commodity, state, district, market, date range) | `X-Farmer-Id` |
| `GET` | `/api/v1/market-prices/commodities` | List available commodities | `X-Farmer-Id` |
| `GET` | `/api/v1/market-prices/trend?commodity=X` | Price trend over N days | `X-Farmer-Id` |

**Empty feed semantics:** Returns `items: []`, `reason: "MARKET_DATA_UNAVAILABLE"`, `stale: true` — never fabricated.

### News (Phase 3)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/news` | List news articles (filter by `category`) | `X-Farmer-Id` |
| `GET` | `/api/v1/news/{news_id}` | Get a single news item | `X-Farmer-Id` |

**Categories** (config-driven, `data/config/news_categories.json`): crops, government_schemes, weather, agri_tech, markets.

### Profile & Farms (Phase 3)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/profile` | Get farmer profile | `X-Farmer-Id` |
| `PUT` | `/api/v1/profile` | Upsert farmer profile | `X-Farmer-Id` |
| `GET` | `/api/v1/farms` | List farmer's farms | `X-Farmer-Id` |
| `POST` | `/api/v1/farms` | Create a farm | `X-Farmer-Id` |
| `GET` | `/api/v1/farms/{farm_id}` | Get a farm | `X-Farmer-Id` |
| `PUT` | `/api/v1/farms/{farm_id}` | Update a farm | `X-Farmer-Id` |
| `DELETE` | `/api/v1/farms/{farm_id}` | Delete a farm | `X-Farmer-Id` |

### Auth (Phase 3)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/device` | Issue anonymous device farmer_id (MVP, swap for JWT later) |

### Admin (Phase 1–3)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/admin/rule-sets` | List rule sets | `X-Admin-Key` |
| `POST` | `/api/v1/admin/rule-sets/reload` | Reload rule sets | `X-Admin-Key` |
| `GET` | `/api/v1/admin/audit/recommendations` | Audit log of recommendations | `X-Admin-Key` |
| `GET` | `/api/v1/admin/audit/ai` | AI guardrail violation events | `X-Admin-Key` |

### Config & Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Full subsystem status (ai, market_prices, news, rule_sets, store) |
| `GET` | `/api/v1/config/{crops\|regions\|stages\|units\|languages\|fertilizers\|soil-parameters}` | Config-driven reference data |
| `GET` | `/api/v1/docs` | Swagger/OpenAPI UI |

---

## Configuration

### `data/config/` (committed config files)
| File | Purpose |
|------|---------|
| `crops.json` | Crop registry (id, label_key, active) |
| `regions.json` | Region registry |
| `stages.json` | Growth stages with crop/region scoping |
| `fertilizers.json` | Fertilizer registry (id, label_key, unit) |
| `soil_parameters.json` | Soil parameters (N, P, K, pH, OC with ranges) |
| `soil_thresholds.json` | Per-region parameter thresholds (validated/unvalidated) |
| `rule_engine.json` | Rounding step, dose cap, caution keys |
| `rule_sets/*.json` | Approved/draft validated agronomic rules |
| `translations/en.json`, `hi.json` | UI strings including `ai.*` keys |
| `languages.json` | Supported language list |
| `units.json` | Area/quantity unit definitions with conversion factors |
| `ai.json` | `language_names` + `summary_max_sentences` |
| `news_categories.json` | Keyword→category mapping for news |

### `.env` (from `.env.example`)
```
# AI
LLM_PROVIDER=none              # none | nim
NVIDIA_API_KEY=
NIM_MODEL=meta/llama-3.1-8b-instruct
AI_DAILY_REQUEST_BUDGET=500
AI_USER_REQUESTS_PER_MINUTE=6
AI_CACHE_TTL_HOURS=168

# PDF
PDF_TEMPLATE_VERSION=1
PDF_FONT_DIR=data/fonts
PDF_CACHE_DIR=data/store/_pdf_cache

# Market prices
MARKET_INGEST_ENABLED=true
DATA_GOV_API_KEY=
DATA_GOV_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
MARKET_STALE_AFTER_HOURS=48

# News
NEWS_INGEST_ENABLED=true
NEWS_FEEDS=["https://www.pib.gov.in/...","https://www.thehindu.com/..."]
NEWS_STALE_AFTER_HOURS=24
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app, lifespan, wiring
│   ├── core/
│   │   ├── settings.py            # Pydantic settings (env-driven)
│   │   ├── errors.py              # ApiError, ErrorCode
│   │   ├── logging.py             # JSON logging, RequestIdMiddleware, TimingMiddleware
│   │   ├── pagination.py          # PageParams, envelope
│   │   └── security.py            # FarmerContext, get_current_farmer
│   ├── domain/
│   │   ├── rule_engine.py         # Deterministic rule evaluation (NO hardcoded doses)
│   │   ├── guardrails.py          # LLM output validation (ungrounded quantities, etc.)
│   │   ├── font_coverage.py       # fontTools glyph-coverage verification
│   │   ├── thresholds.py          # Threshold registry from config
│   │   ├── units.py               # Unit registry from config
│   │   └── snapshot.py            # Canonical JSON + input_hash
│   ├── providers/
│   │   ├── base.py                # LLMProvider protocol, LLMError, LLMResult
│   │   ├── nim.py                 # NVIDIA NIM provider
│   │   ├── none.py                # Null provider (AI disabled)
│   │   ├── prices_datagov.py      # data.gov.in market price provider
│   │   └── news_rss.py            # RSS news provider (PIB, The Hindu)
│   ├── repositories/
│   │   ├── config_repository.py   # Loads all config (ai.json, translations, news_categories)
│   │   ├── json_store.py          # File-per-record JSON store with locking
│   │   ├── rule_repository.py     # Rule set loading & validation
│   │   └── audit.py               # Audit log append
│   ├── services/
│   │   ├── ai_service.py          # AI summarize/answer with guardrails, cache, budget
│   │   ├── pdf_service.py         # PDF rendering from stored snapshots
│   │   ├── market_service.py      # Market price ingestion + queries
│   │   └── news_service.py        # News ingestion + queries
│   ├── api/v1/routers/
│   │   ├── recommendations.py     # POST/GET recs, summary, assistant, PDF
│   │   ├── market_prices.py       # Market price endpoints
│   │   ├── news.py                # News endpoints
│   │   ├── profile.py             # Farmer profile CRUD
│   │   ├── farms.py               # Farm CRUD (scoped to farmer)
│   │   ├── auth.py                # Device auth
│   │   ├── admin.py               # Admin audit + rule-set mgmt
│   │   ├── health.py              # Subsystem health
│   │   ├── config.py              # Config reference endpoints
│   │   └── soil_reports.py        # Soil report CRUD
│   └── templates/
│       └── recommendation.html    # PDF HTML template (WeasyPrint)
├── data/
│   ├── config/                    # Committed config (languages, translations, etc.)
│   ├── fonts/                     # Noto TTFs (build step: scripts/fetch_fonts.py)
│   ├── rule_sets/                 # Approved rule sets
│   └── store/                     # JSON runtime store (recommendations, ai_summaries, etc.)
├── scripts/
│   ├── fetch_fonts.py             # Downloads real Noto fonts (build step)
│   └── gen_test_fonts.py          # Generates placeholder test fonts
├── tests/
│   ├── conftest.py                # Shared fixtures (config, store, rec, market_service, news_service)
│   ├── fakes.py                   # FakeProvider for AI service tests
│   ├── test_*.py                  # Phase 1–3 test suites (84 tests)
│   └── fixtures/                  # Test config + rule sets
├── pyproject.toml
├── .env.example
└── Dockerfile / docker-compose.yml (not built here)
```

---

## Key Design Decisions

### AI is optional
- `LLM_PROVIDER=none` → `/health.ai.status == "disabled"`, recommendations still work 100%.
- `LLM_PROVIDER=nim` → NIM provider with guided JSON, seed, retry-without-guided_json, rate-limit handling.
- AIService degrades on provider failure, budget exhaustion, and guardrail blocks (uses safe deterministic fallback).

### Guardrails
Every LLM output is validated by `domain/guardrails.py` before reaching a farmer:
- Blocks ungrounded quantities (not in recommendation items/breakdown/soil)
- Blocks unknown fertilizers
- Blocks unsupported units (litres, etc.)
- Allows area context and soil values
- Violations → `guardrail_blocked` status + safe fallback summary

### PDF
- Renders strictly from the **stored immutable snapshot** — never recomputes the rule engine.
- Glyph coverage verified with fontTools before rendering (missing glyph → build error, not tofu).
- Cached by `rec_id + language + template_version`.
- Supports en, hi, bn, mr, pa, ta, te with script-specific Noto fonts.

### Market Prices & News
- Never fabricates data. Empty feed → `items: []` + `reason: *_UNAVAILABLE` + `stale: true`.
- Feed failure → serves last stored snapshot with `stale: true`.
- Dedupe by raw payload hash (market) / URL hash (news).
- Background ingestion loops (configurable interval).

### Single-writer storage
JSON file-per-record store with file locking. Horizontal scaling requires swapping `StorageBackend` (interface is stable). One writer instance documented in README/Docker.

---

## Testing

```bash
# Full suite
pytest -q

# Specific phase
pytest tests/test_rule_engine.py          # Phase 1
pytest tests/test_ai_service.py tests/test_api_assistant.py tests/test_guardrails.py tests/test_nim_provider.py  # Phase 2
pytest tests/test_pdf.py tests/test_market_prices.py tests/test_news.py tests/test_farms_profile.py tests/test_observability.py tests/test_font_coverage.py  # Phase 3
```

**Results:** 84 passed, 4 skipped.

---

## Docker (build manually)

```bash
docker compose up --build
```

Healthcheck gates readiness via `/api/v1/health`. Volumes persist `data/store`. Config, rule sets, and fonts are mounted read-only.

---

## Smoke Test (after starting server)

```bash
# 1. Create a recommendation
REC=$(curl -s -X POST localhost:8000/api/v1/recommendations \
  -H 'X-Farmer-Id: farmer_A' -H 'Content-Type: application/json' \
  -d '{"soil_values":{"N":100,"P":20,"K":150,"pH":6.8,"OC":0.4},
       "crop_id":"testcrop","region_id":"TESTREGION","stage_id":"basal",
       "area":{"value":2,"unit":"acre"},"language":"en"}' | jq -r .recommendation_id)

# 2. Export PDF in Hindi
curl -s -o rec_hi.pdf "localhost:8000/api/v1/recommendations/$REC/pdf?language=hi" \
  -H 'X-Farmer-Id: farmer_A'
file rec_hi.pdf   # PDF document, version 1.7

# 3. News (live feeds)
curl -s localhost:8000/api/v1/news -H 'X-Farmer-Id: farmer_A' | jq '{total,source,stale}'

# 4. Market (empty until key configured)
curl -s localhost:8000/api/v1/market-prices -H 'X-Farmer-Id: farmer_A' | jq '{total,reason,stale}'

# 5. Health (all subsystems)
curl -s localhost:8000/api/v1/health | jq '{ai:.ai.status, market:.market_prices.status, news:.news.status}'
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `none` | `none` \| `nim` |
| `NVIDIA_API_KEY` | `` | NIM API key |
| `NIM_MODEL` | `meta/llama-3.1-8b-instruct` | NIM model |
| `AI_DAILY_REQUEST_BUDGET` | `500` | Daily AI request budget |
| `AI_USER_REQUESTS_PER_MINUTE` | `6` | Per-user rate limit |
| `PDF_TEMPLATE_VERSION` | `1` | PDF cache busting |
| `PDF_FONT_DIR` | `data/fonts` | Noto TTF directory |
| `MARKET_INGEST_ENABLED` | `true` | Enable market ingestion |
| `DATA_GOV_API_KEY` | `` | data.gov.in API key |
| `NEWS_INGEST_ENABLED` | `true` | Enable news ingestion |
| `NEWS_FEEDS` | PIB + The Hindu RSS | JSON array of feed URLs |

---

## License

Internal project — FarmerX.
