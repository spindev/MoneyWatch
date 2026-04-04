## [1.4.1](https://github.com/spindev/MoneyWatch/compare/v1.4.0...v1.4.1) (2026-04-04)


### Bug Fixes

* address code review – remove inline styles from modals, fix ExpenseModal label pattern ([c848655](https://github.com/spindev/MoneyWatch/commit/c8486555f35a6901bd9f8fb579ad7b27c98a2f67))

# [1.4.0](https://github.com/spindev/MoneyWatch/compare/v1.3.1...v1.4.0) (2026-04-03)


### Bug Fixes

* **review:** AppId aus appDefinitions importieren; historische Datei für Staleness-Prüfung verwenden ([b8236c1](https://github.com/spindev/MoneyWatch/commit/b8236c1031175ba89a76dbda8c7d21973afadee5))
* **ui:** iOS-Zoom bei Eingabefeldern in Portfolio- und Pension-Einstellungen beheben ([6db63e2](https://github.com/spindev/MoneyWatch/commit/6db63e200201b7e5dd87f5103f5aca48284d7b02))


### Features

* **backup:** Backup und Restore nur für die aktive App ([6f47041](https://github.com/spindev/MoneyWatch/commit/6f470410fd81ac38d5b9612152bcc9f37fcae16f))
* **docker:** Kursdaten in konfigurierbarem Intervall vom Server abrufen ([bd7b43f](https://github.com/spindev/MoneyWatch/commit/bd7b43ffec57257a0f6ef79addc99657169155de))
* **portfolio:** Kursdaten-Schaltfläche vom Einstellungs- in den Fußbereich verschieben ([37300cb](https://github.com/spindev/MoneyWatch/commit/37300cb9f3153fb814d89dcdefdb2c86b9eb9914))
* **ui:** neues Favicon für MoneyWatch (Euro-Münze mit Aufwärtstrend) ([388d0ba](https://github.com/spindev/MoneyWatch/commit/388d0bad63d8f3877b663d7a401868865e83aabb))

## [1.3.1](https://github.com/spindev/MoneyWatch/compare/v1.3.0...v1.3.1) (2026-04-03)


### Bug Fixes

* **pensionwatch:** UI improvements – layout, mobile zoom, settings restructure, Docker-only backup ([0c8108e](https://github.com/spindev/MoneyWatch/commit/0c8108e33cf11a951ae10714a540e4d35c46f280))
* re-add Datenverwaltung heading and fix Docker version injection ([b6c232a](https://github.com/spindev/MoneyWatch/commit/b6c232a910dbb8b06541b073f5287a7c1ab86675))

# [1.3.0](https://github.com/spindev/MoneyWatch/compare/v1.2.1...v1.3.0) (2026-04-03)


### Features

* add footer with version number and attribution to all pages ([19fa9ab](https://github.com/spindev/MoneyWatch/commit/19fa9abf9e3f45bba8df013f3b2c1cacdf5de216))
* replace auto-sync with manual backup/restore in settings ([a332d91](https://github.com/spindev/MoneyWatch/commit/a332d915bef30e3748dd1a43e0e51a54f021fb29))

## [1.2.1](https://github.com/spindev/MoneyWatch/compare/v1.2.0...v1.2.1) (2026-04-03)


### Bug Fixes

* **sync:** prevent empty-data push, prompt restore from server backup, fix offline flash on app switch ([9f71fd8](https://github.com/spindev/MoneyWatch/commit/9f71fd8313ff0088e0b442462f11e49e0668e13f))

# [1.2.0](https://github.com/spindev/MoneyWatch/compare/v1.1.0...v1.2.0) (2026-04-03)


### Features

* **sync:** add localStorage-to-SQLite server sync for Docker deployments ([312fda5](https://github.com/spindev/MoneyWatch/commit/312fda59dddd097d03da40f8052367bb533fdc75))
* **sync:** show offline icon, remove 60s polling, sync on data change ([46a1987](https://github.com/spindev/MoneyWatch/commit/46a1987f967b6fa316b3247dc92db7245a51877a))

# [1.1.0](https://github.com/spindev/MoneyWatch/compare/v1.0.0...v1.1.0) (2026-03-31)


### Features

* add ARM64 multi-platform Docker image support for Raspberry Pi 5 ([e9da0bf](https://github.com/spindev/MoneyWatch/commit/e9da0bf9c95861843eba6b4ccc61f44bb482be52))

# 1.0.0 (2026-03-29)


### Bug Fixes

* BudgetWatch mobile overlay, form layout, percentage order, monthly date ([f3769d6](https://github.com/spindev/MoneyWatch/commit/f3769d60cb08444144745ede50846a3aadfd8892))


### Features

* Add AssetWatch app for tracking non-exchange-listed investments ([464e74d](https://github.com/spindev/MoneyWatch/commit/464e74de883149361344efb754829f55b5a4a57e))
* **budget:** move ? button to Gesamtausgaben, add % distribution, compact date selects ([eda75a7](https://github.com/spindev/MoneyWatch/commit/eda75a7ab125b4867db07f73fd0823cae08b35b9))
* dockerize MoneyWatch – Dockerfile, nginx, docker-compose, CI workflows ([43493dd](https://github.com/spindev/MoneyWatch/commit/43493dde4fdb804b1a29c47d744f382bbcb1d050))
* merge PortfolioWatch and PensionWatch into unified MoneyWatch app ([6715bee](https://github.com/spindev/MoneyWatch/commit/6715beee626ff191102e1e87cc0e47f4e36b5967))
* per-app primary colors, AssetWatch overview filter, auto-date on save ([c1938c3](https://github.com/spindev/MoneyWatch/commit/c1938c371bf102330734f074cc326b4c35676de1))
* remove pr-check workflow, replace Caddy with node serve, strip docker-compose comments ([ae7f515](https://github.com/spindev/MoneyWatch/commit/ae7f515e97b64c7e49b6854132a7760eb2b38c1d))
* replace nginx with Caddy, replace github-tag-action with Semantic Release ([051f198](https://github.com/spindev/MoneyWatch/commit/051f198cce09ee41c8c62f9b1ee6ef5ba56726c8))
