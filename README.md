# FarmerX

Soil-to-Action platform for Indian farmers — a deterministic agronomic recommendation API (backend) with a React + Vite frontend (dashboard, farm registration, market prices, news, AI assistant, reports).

## Repo structure

```
FarmerX/
├── README.md            # this file (project overview)
├── .gitignore
├── backend/             # FastAPI recommendation API (Python)
│   ├── README.md        # backend-specific docs (architecture, API, env vars)
│   ├── app/             # FastAPI application
│   ├── data/            # config, rule sets, fonts, runtime store
│   ├── scripts/         # font download, market CSV import
│   ├── tests/           # Phase 1–3 test suite (+ fixtures)
│   ├── pyproject.toml
│   └── .env.example
└── Frontend/            # Vite + React + Tailwind SPA
    ├── README.md        # frontend-specific docs (if added later)
    ├── src/             # components, features, hooks, pages, services
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    └── .env.example
```

## Tech stack

| Layer | Stack |
|-------|-------|
| Backend | FastAPI, Python 3.11+, WeasyPrint (PDF), fontTools, pytest |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts, Axios, Lucide React |
| Config | JSON (crops, regions, stages, soil thresholds, translations, rule sets) |
| Storage | JSON file-per-record store with file locking (swap-able backend) |
| AI (optional) | NVIDIA NIM — disabled by default (`LLM_PROVIDER=none`) |

## Phases

| Phase | Ships | AI Dependency |
|-------|-------|---------------|
| **1 — Deterministic core** | Config repo, rule engine, `POST /recommendations`, audit log | None |
| **2 — NIM explainer** | AI summarize/answer, guardrails, cache, budget, degradation | Optional (`LLM_PROVIDER=none` works) |
| **3 — Production** | PDF in 7 languages, market prices, news, farms/profile, auth, admin audit | Still optional; PDF uses only cached summary |

## Quick Start

### Backend
```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload
```
Health: `http://localhost:8000/api/v1/health`

Run tests:
```bash
pytest -q
```
Expected: **84 passed, 4 skipped**.

Full backend docs: `backend/README.md`

### Frontend
```bash
cd Frontend
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm install
npm run dev
```
App: `http://localhost:5173`

Build:
```bash
npm run build
```

### Together
Start the backend first, then the frontend. The frontend calls `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`).

## Key design decisions

- **AI is optional.** With `LLM_PROVIDER=none` the API still works 100% deterministically.
- **No hardcoded agronomic values.** Everything (crops, regions, stages, thresholds, fertilizers, doses) is config-driven in `backend/data/config/` and `backend/data/rule_sets/`.
- **No fabricated data.** Market prices and news return empty feeds (`items: []`, `stale: true`) when unavailable — never invented values.
- **PDF renders from stored snapshots only**, never recomputes the rule engine.

## Conventional commits

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). Examples used in history:

```
feat(backend): add multi-region crop rule sets and config updates
feat(frontend): add FarmerX React frontend application
docs(backend): add README with architecture, API reference, and smoke test
```

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
Scopes: `backend`, `frontend`, `root`

## License

Internal project — FarmerX.
