# MoneyWatch

A privacy-first, client-side financial dashboard. All data is stored exclusively in your browser's `localStorage` — no backend, no accounts, nothing leaves your device.

## Features

- **PortfolioWatch** – Track exchange-listed securities (stocks, ETFs) with lots and realised sales
- **PensionWatch** – Model pension income and project retirement scenarios
- **BudgetWatch** – Track monthly expenses with category budgets and distribution charts
- **AssetWatch** – Track non-exchange-listed investments (real estate, P2P lending, etc.)

## Live Demo

[https://spindev.github.io/MoneyWatch/](https://spindev.github.io/MoneyWatch/)

---

## Self-Hosting

MoneyWatch ships as a minimal static-file Docker image (~30 MB) published to the GitHub Container Registry.

### Quick Start with Docker Compose

1. Create a `docker-compose.yml` file with the following content:

```yaml
services:
  moneywatch:
    image: ghcr.io/spindev/moneywatch:latest
    ports:
      - "8080:3000"
    restart: unless-stopped
```

2. Start the container:

```bash
docker compose up -d
```

3. Open your browser at [http://localhost:8080](http://localhost:8080).

### Updating to a Newer Version

```bash
docker compose pull
docker compose up -d
```

### Using a Specific Version

Replace `latest` with any published version tag (e.g. `v1.1.0`):

```yaml
image: ghcr.io/spindev/moneywatch:v1.1.0
```

All available tags are listed on the [packages page](https://github.com/spindev/MoneyWatch/pkgs/container/moneywatch).

### Running with Plain Docker

```bash
docker run -d -p 8080:3000 --restart unless-stopped ghcr.io/spindev/moneywatch:latest
```

---

## Development

```bash
npm install     # install dependencies
npm run dev     # start Vite dev server
npm run build   # production build
npm run lint    # run ESLint
```

---

## Contributing

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) — the project uses **semantic-release** to automate versioning and changelog generation from commit messages.

| Prefix | Effect |
|---|---|
| `feat:` | new minor version |
| `fix:` / `perf:` | new patch version |
| `feat!:` or `BREAKING CHANGE:` footer | new major version |
| `chore:`, `docs:`, `refactor:`, etc. | no release |