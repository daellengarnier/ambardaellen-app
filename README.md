# Life-App

Alains persönliche Organisations-App (früher "Ambar & Dällen"), verbunden mit Jarvis.

- Heute, Inbox, Todo (nach Bereich), Ziele, Einkauf, Aktivitäten und Reisen.
- Jarvis liest und schreibt Todos, Inbox und Tagesplan über die API: siehe [docs/API.md](docs/API.md).
- Stack: Next.js 16, Postgres, Drizzle, Docker, Caddy. Deploy: siehe [DEPLOY.md](DEPLOY.md).

## Entwicklung

```bash
npm ci
npm run dev        # braucht DATABASE_URL und AUTH_SECRET
npm run db:generate  # Migration aus src/lib/db/schema.ts erzeugen
```

Migrationen in `drizzle/` laufen beim Container-Start automatisch (`scripts/entrypoint.sh`).

## Umbau 2026

`drizzle/0002_life_data_migration.sql` überführt die alte Paar-App: Todos in die Tabelle `todos`, der JSON-Block wird auf Alains Daten reduziert (ohne Einträge von Ambar, ohne Zyklus). Eine unveränderte Kopie liegt in `legacy_workspace_state`, bis sie gelöscht wird.
