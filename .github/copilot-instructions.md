# MoneyWatch – Copilot Instructions

## Project Overview

**MoneyWatch** is a privacy-first, client-side financial dashboard built with React, TypeScript, Vite, and Tailwind CSS. All data is stored exclusively in the browser's `localStorage`—no backend, no accounts, no data leaves the device.

### Sub-Applications
| App | Description |
|---|---|
| PortfolioWatch | Track exchange-listed securities (stocks, ETFs) with lots and sales |
| PensionWatch | Model pension income and project retirement scenarios |
| BudgetWatch | Track monthly expenses with category budgets |
| AssetWatch | Track non-exchange-listed investments (real estate, P2P, etc.) |

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool, base path `/MoneyWatch/` for GitHub Pages, `/` for Docker)
- **Tailwind CSS v3**
- **Recharts** (charting)

---

## Project Structure

```
src/
  apps/
    portfolio/   – PortfolioWatch sub-app
    pension/     – PensionWatch sub-app
    budget/      – BudgetWatch sub-app
    asset/       – AssetWatch sub-app
  components/    – Shared components (AppSwitcher, appDefinitions, etc.)
  services/      – Shared services (backupService, etc.)
.github/
  workflows/
    deploy.yml   – GitHub Pages deploy (hourly on weekdays for market data)
    docker.yml   – Docker build & push (triggered on version tags v*)
Dockerfile       – Multi-stage build (node:20-alpine → serve)
docker-compose.yml – Self-hosting example
```

---

## Build & Development

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # eslint
```

---

## localStorage Keys

| Key | App |
|---|---|
| `moneywatch_active_app` | global |
| `portfoliowatch_settings` | PortfolioWatch |
| `portfoliowatch_imported_lots` | PortfolioWatch |
| `portfoliowatch_imported_sales` | PortfolioWatch |
| `pensionwatch_settings` | PensionWatch |
| `pensionwatch_pensions` | PensionWatch |
| `budgetwatch_settings` | BudgetWatch |
| `budgetwatch_expenses` | BudgetWatch |
| `assetwatch_assets` | AssetWatch |
| `assetwatch_settings` | AssetWatch |

---

## Key Conventions

- **No backend, no auth** – everything runs in the browser
- **No test framework** – there are no unit/integration tests; validate changes via lint + build
- **AppId type** in `src/components/appDefinitions.tsx` is the single source of truth for sub-app registration
- Vite base path is `/MoneyWatch/` for GitHub Pages and `/` for Docker builds (set via `--base /` in Dockerfile)
- Finance data is fetched at **build time** via `scripts/fetch-finance-data.mjs` and baked into the static assets
- Docker image is published to **GitHub Container Registry (GHCR)**: `ghcr.io/spindev/moneywatch`
