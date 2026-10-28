# FarmerX — Frontend (Phase 1)

FarmerX is a soil-to-action execution layer for Indian farmers. It turns
soil-test values into a crop-specific, stage-wise fertilizer action plan:
**Soil → Crop → Stage → Recommendation**.

> **Core principle.** Fertilizer quantities come from a validated agronomic
> rule engine. AI helps *explain* recommendations — it never decides or changes
> a dose.

This repository contains **Phase 1** of the frontend only: the project
foundation, design system, landing page, working navigation, and honest
placeholders for phases 2–5. There is no backend in this repository and no
fabricated agricultural, market, or news data.

---

## What is implemented in Phase 1

- Working React 18 + Vite 6 + JavaScript project.
- Tailwind CSS 4 (via `@tailwindcss/vite`) with a custom, agriculture-appropriate
  design system defined in `src/index.css`.
- React Router 6 with a route per planned page. Every link resolves to a real
  page.
- Sticky header with desktop navigation, mobile drawer (Escape / overlay close,
  body-scroll lock, route-change close), and a primary “New report” CTA.
- Footer with honest phase notes and simple useful links.
- Landing page with six intentional sections: Hero (with clearly-labelled
  sample report), the problem, the four-step workflow, product features,
  trust/transparency, and closing CTA.
- A foundation API client (`src/services/apiClient.js`) using Axios, reading
  `VITE_API_BASE_URL`, normalising errors, and left unwired until Phase 2.
- Reusable UI primitives: `Button`, `Container`, `PageHeader`, `EmptyState`,
  `ErrorState`, `LoadingState`, and layout components `AppShell`, `Header`,
  `Footer`, `Logo`, `ScrollToTop`.
- Accessible defaults: semantic landmarks, skip-to-content link, visible focus
  ring, `aria-current` on active links, labelled icon-only controls,
  `prefers-reduced-motion` handling, and honest empty states.

## What is intentionally **not** implemented yet

| Page | Phase | Why it is empty |
| --- | --- | --- |
| `/reports/new` | 2 | Soil input form + recommendation view — no rule engine integration available. |
| `/reports/:reportId` | 2 | Recommendation report — requires real rule-engine output. |
| `/dashboard` | 3 | Requires user records + backend persistence. |
| `/reports` (history) | 3 | Requires backend persistence. |
| `/profile` | 3 | Requires backend persistence. |
| `/market-prices` | 4 | Requires an approved price feed (AGMARKNET / data.gov.in). |
| `/news` | 4 | Requires approved RSS or API sources. |
| `/assistant` | 5 | Requires the backend AI service. |

None of these pages claim to be live. Each shows a clearly scoped “Coming in
Phase N” state and, where relevant, a link back to a working action.

---

## Technology stack

- **Vite 6** — dev server and build tool.
- **React 18** — JavaScript only (no TypeScript).
- **React Router 6** — routing with `createBrowserRouter`.
- **Tailwind CSS 4** — via the official `@tailwindcss/vite` plugin.
- **Axios** — API client foundation (unused at runtime in Phase 1).
- **Lucide React** — consistent icon library.

Recharts, daisyUI, and other third-party UI libraries are **not** installed
yet. They will be added only in the phase that actually needs them, so the
dependency tree reflects the code that exists.

---

## Project structure

```
.
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   └── router.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Logo.jsx
│   │   │   └── ScrollToTop.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Container.jsx
│   │       ├── EmptyState.jsx
│   │       ├── ErrorState.jsx
│   │       ├── LoadingState.jsx
│   │       └── PageHeader.jsx
│   ├── data/
│   │   └── navigation.js
│   ├── lib/
│   │   └── config.js
│   ├── pages/
│   │   ├── landing/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── ProblemSection.jsx
│   │   │   ├── WorkflowSection.jsx
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── TrustSection.jsx
│   │   │   ├── ClosingCTASection.jsx
│   │   │   └── SampleReportCard.jsx
│   │   ├── AssistantPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── MarketPricesPage.jsx
│   │   ├── NewReportPage.jsx
│   │   ├── NewsPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── ReportDetailPage.jsx
│   │   └── ReportsPage.jsx
│   ├── services/
│   │   └── apiClient.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## Prerequisites

- Node.js **20.19+** or **22.12+** (required by Vite 6).
- npm 10+ (or a compatible package manager).

---

## Install and run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

---

## Build and preview

```bash
# Production build — output goes to dist/
npm run build

# Preview the production build locally
npm run preview
```

Optional lint:

```bash
npm run lint
```

---

## Environment variables

Only one variable is read by the frontend, and only when a backend exists:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the FarmerX FastAPI service. If empty, Axios will use relative paths. |

Copy `.env.example` to `.env` and set a value when Phase 2 begins. **Never put
secrets here** — Vite exposes every `VITE_*` value to the browser.

---

## Customising content and assets

- **Navigation links** live in `src/data/navigation.js`.
- **Design tokens** (colour, typography, radii) are defined in the `@theme`
  block of `src/index.css`. Changing `--color-primary` or `--color-accent`
  updates the entire app.
- **Landing-page copy** is co-located with each section under
  `src/pages/landing/`. Each section is a self-contained component — edit only
  that section without touching the rest of the page.
- **Favicon** — replace `public/favicon.svg` (any browser-supported image
  format works; update the `href` in `index.html` accordingly).
- **Fonts** — Fraunces (display) and Inter (body) are loaded from Google Fonts
  in `index.html`. To self-host, replace the `<link>` tags with local
  `@font-face` rules and update `--font-display` / `--font-sans` in
  `src/index.css`.

---

## Frontend-only boundaries

- No backend, no database, no authentication flow, and no AI service is
  implemented in this repository.
- The “sample report” on the landing page is labelled **SAMPLE** and marked
  “Rule set v1.2 (illustrative)”. It does not represent any real rule, source,
  or farmer.
- Market prices, news, and the AI assistant are **not** displayed anywhere in
  Phase 1 — their pages show honest “coming in Phase N” states.
- No testimonials, statistics, partner logos, or third-party claims are shown,
  because none were verified in the source brief.

## Integration points for later phases

- **Phase 2** — `src/services/apiClient.js` is ready to send requests to
  `VITE_API_BASE_URL`. Add a `recommendations` service there once the FastAPI
  endpoints are confirmed.
- **Phase 3** — Persistence for reports, farms, and profile will need to go
  through the same client.
- **Phase 4** — Approved price and news sources must be added through the
  backend, never fetched directly by the browser from unofficial endpoints.
- **Phase 5** — The assistant will need a backend service; the frontend must
  never allow it to mutate dosage.

---

## Verification performed

See the phase report in the accompanying response — build, lint, and manual
browser checks (desktop, tablet, mobile) are reported exactly as executed, with
anything not verified (e.g. a live backend) stated explicitly.

## Credits

- Typography: [Fraunces](https://fonts.google.com/specimen/Fraunces) and
  [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts.
- Icons: [Lucide](https://lucide.dev/).
- Framework: [Vite](https://vite.dev/), [React](https://react.dev/),
  [React Router](https://reactrouter.com/), [Tailwind CSS](https://tailwindcss.com/).