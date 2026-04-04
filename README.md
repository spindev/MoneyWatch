# MoneyWatch

Ein datenschutzorientiertes, clientseitiges Finanz-Dashboard. Alle Daten werden ausschließlich im `localStorage` deines Browsers gespeichert – kein Backend, keine Accounts, nichts verlässt dein Gerät.

## Features

- **PortfolioWatch** – ETF- und Aktien-Portfolio verwalten: Käufe, Verkäufe und Performance-Analyse
- **PensionWatch** – Rentenansprüche erfassen und Ruhestandsszenarien modellieren
- **BudgetWatch** – Monatliche Ausgaben mit Kategorie-Budgets und Verteilungsdiagrammen verfolgen
- **AssetWatch** – Nicht-börsengehandelte Investments verwalten (Immobilien, P2P-Kredite usw.)

## Live-Demo

[https://spindev.github.io/MoneyWatch/](https://spindev.github.io/MoneyWatch/)

---

## Self-Hosting

MoneyWatch wird als minimales Docker-Image (~30 MB) im GitHub Container Registry bereitgestellt und enthält einen eingebetteten Express-Server für persistente Backups und Live-Kursdaten.

### Schnellstart mit Docker Compose

1. Erstelle eine `docker-compose.yml` mit folgendem Inhalt:

```yaml
services:
  moneywatch:
    image: ghcr.io/spindev/moneywatch:latest
    ports:
      - "8080:3000"
    volumes:
      - moneywatch_data:/data
    environment:
      # Intervall (in Millisekunden) für die Aktualisierung der Tageskurse (Standard: 300000 = 5 Minuten)
      # FINANCE_QUOTE_INTERVAL_MS: 300000
      # Uhrzeit (0–23, lokale Serverzeit) für die tägliche Aktualisierung der historischen Daten (Standard: 3)
      # FINANCE_HISTORICAL_HOUR: 3
    restart: unless-stopped

volumes:
  moneywatch_data:
```

2. Container starten:

```bash
docker compose up -d
```

3. Browser öffnen unter [http://localhost:8080](http://localhost:8080).

### Auf eine neuere Version aktualisieren

```bash
docker compose pull
docker compose up -d
```

### Bestimmte Version verwenden

Ersetze `latest` durch einen beliebigen veröffentlichten Versions-Tag (z. B. `v1.1.0`):

```yaml
image: ghcr.io/spindev/moneywatch:v1.1.0
```

Alle verfügbaren Tags findest du auf der [Packages-Seite](https://github.com/spindev/MoneyWatch/pkgs/container/moneywatch).

### Starten mit reinem Docker

```bash
docker run -d -p 8080:3000 --restart unless-stopped ghcr.io/spindev/moneywatch:latest
```

### Kursdaten im Docker-Betrieb

Im Docker-Betrieb werden Marktdaten automatisch zur Laufzeit aktualisiert:

| Datentyp | Intervall | Konfiguration |
|---|---|---|
| Tageskurse (Quotes) | alle 5 Minuten (Standard) | `FINANCE_QUOTE_INTERVAL_MS` |
| Historische Kurse | täglich um 03:00 Uhr (Standard) | `FINANCE_HISTORICAL_HOUR` |

Beim ersten Start werden beide Datensätze sofort abgerufen, falls sie fehlen oder veraltet sind.

---

## Entwicklung

```bash
npm install     # Abhängigkeiten installieren
npm run dev     # Vite-Entwicklungsserver starten
npm run build   # Produktions-Build (tsc + vite)
npm run lint    # ESLint ausführen
```

---

## Mitmachen

Pull Requests und Issues sind willkommen. Releases werden manuell als GitHub Releases mit entsprechendem Tag (z. B. `v1.1.0`) veröffentlicht, woraufhin automatisch ein neues Docker-Image gebaut und gepusht wird.
