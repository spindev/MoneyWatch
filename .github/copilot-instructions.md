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
- **semantic-release** (automated versioning & changelog)

---

## Commit Conventions (Conventional Commits)

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/) because `semantic-release` derives the next version automatically from commit messages.

### Format
```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types & Version Bumps

| Type | Triggers | Description |
|---|---|---|
| `feat` | **minor** (e.g. 1.0.0 → 1.1.0) | A new feature |
| `fix` | **patch** (e.g. 1.0.0 → 1.0.1) | A bug fix |
| `perf` | **patch** | A performance improvement |
| `refactor` | no release | Code restructuring without feature/fix |
| `docs` | no release | Documentation only changes |
| `style` | no release | Formatting, whitespace |
| `test` | no release | Adding or updating tests |
| `chore` | no release | Maintenance tasks (deps, config) |
| `build` | no release | Build system or dependency changes |
| `ci` | no release | CI/CD pipeline changes |
| `revert` | patch | Reverts a previous commit |

**BREAKING CHANGE:** Append `!` after the type/scope OR add `BREAKING CHANGE:` in the footer to trigger a **major** version bump (e.g. 1.0.0 → 2.0.0).

### Examples
```
feat(budget): add percentage distribution chart
fix(portfolio): correct lot price calculation on import
perf(pension): memoize projection computations
chore(release): 1.2.0 [skip ci]
feat!: redesign localStorage schema for all apps

BREAKING CHANGE: all existing localStorage data must be migrated
```

---

## Semantic Release

The project uses **semantic-release** (configured in `.releaserc.json`) to automate:
1. Determining the next version from commits since the last tag
2. Generating release notes
3. Updating `CHANGELOG.md`
4. Bumping `package.json` version
5. Creating a GitHub Release + tag
6. Triggering the Docker build workflow

### Plugins (in order)
1. `@semantic-release/commit-analyzer` – parses commits, decides version bump
2. `@semantic-release/release-notes-generator` – generates release notes
3. `@semantic-release/changelog` – writes `CHANGELOG.md`
4. `@semantic-release/npm` – bumps `package.json` (no npm publish)
5. `@semantic-release/github` – creates GitHub Release
6. `@semantic-release/git` – commits `CHANGELOG.md` + `package.json` back with `chore(release): <version> [skip ci]`

> **Important:** The release commit uses `[skip ci]` to avoid re-triggering the workflow. Never manually edit `CHANGELOG.md` or bump versions in `package.json`.

### CI Workflow
- **Trigger:** push to `main`
- **File:** `.github/workflows/docker.yml`
- Semantic-release runs first; if a new version is published, the Docker image is built and pushed to `ghcr.io/spindev/moneywatch` with tags `latest` and `v<version>`.

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
    docker.yml   – Semantic-release + Docker build & push
.releaserc.json  – semantic-release configuration
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
