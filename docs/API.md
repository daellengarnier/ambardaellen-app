# API v1 (Life-App)

Für Jarvis und die App selbst. Basis: `https://app.al-daellen.ch/api/v1`.

## Anmeldung

- **Jarvis**: `Authorization: Bearer jv_...`. Tokens erzeugt Alain in der App unter Profil → Jarvis-Zugang. Gespeichert wird nur der SHA-256-Hash, der Klartext ist nur beim Erzeugen sichtbar. Widerrufen ebenda.
- **App**: Session-Cookie `ad_session` nach `POST /api/auth/login`.
- Ohne gültige Anmeldung: `401`. Validierungsfehler: `400` mit `{ error, details }`. Unbekannte ID: `404`.

Datumsfelder sind `YYYY-MM-DD`, Zeitstempel ISO 8601 (UTC). "Heute" rechnet die API in Europe/Zurich.

## Bereiche

`GET /areas` → `{ areas: [{ key, name, world, sort }] }`

Die 13 Bereiche aus Jarvis, `world` ist `spinnerei` oder `privat`. Schlüssel z.B. `spinnerei-booking`, `privat-lernen`.

## Todos

Objekt:

```json
{
  "id": "uuid", "text": "…", "note": "", "area": "privat-lernen",
  "due": "2026-10-25", "prio": "hoch|normal|tief",
  "status": "offen|erledigt|verworfen", "plannedFor": "2026-10-18",
  "doneAt": null, "tags": [], "source": "app|jarvis|telegram|inbox|migration|orga-app",
  "sourceRef": "https://…", "createdBy": "alain|jarvis",
  "createdAt": "…", "updatedAt": "…"
}
```

- `GET /todos` Filter: `status` (kommagetrennt, Standard `offen`, `alle` für alles), `area`, `world`, `due_before` (inkl.), `planned_for`, `q` (Text und Notiz), `limit` (Standard 500, max. 2000). Sortiert nach Frist, dann neueste zuerst.
- `POST /todos` Body: `text` (Pflicht), optional `note`, `area`, `due`, `prio`, `plannedFor`, `tags`, `source`, `sourceRef`. → `201 { todo }`
- `GET /todos/:id` → `{ todo }`
- `PATCH /todos/:id` beliebige Felder wie bei POST plus `status`. `status: "erledigt"` setzt `doneAt`. `null` leert ein Feld (z.B. `plannedFor: null`). → `{ todo }`
- `DELETE /todos/:id` → `{ ok: true }`

"Für heute planen" heisst `plannedFor` auf das heutige Datum setzen.

## Inbox

Objekt: `{ id, text, source, createdBy, createdAt, processedAt, todoId }`

- `GET /inbox` nur unverarbeitete, `?all=1` alle (max. 500).
- `POST /inbox` Body `{ text, source? }` → `201 { item }`
- `PATCH /inbox/:id` Body `{ text?, processed? }`. `processed: true` = erledigt ohne Todo.
- `DELETE /inbox/:id`
- `POST /inbox/:id/process` Body wie `POST /todos`. Legt das Todo an (Quelle `inbox`) und markiert den Eintrag als verarbeitet, in einer Transaktion. → `201 { item, todo }`

## Tagesplan

- `GET /day-plans/:date` → `{ plan: { date, note, updatedBy, updatedAt } | null }`
- `PUT /day-plans/:date` Body `{ note }` → `{ plan }`. Die Notiz erscheint in der App oben auf "Heute".

## Heute

`GET /today[?date=YYYY-MM-DD]` →

```json
{
  "date": "2026-10-18",
  "plan": { "note": "…" },
  "planned": [],
  "overdue": [],
  "dueToday": [],
  "doneToday": [],
  "inboxOpen": 0
}
```

`planned`: offen und für den Tag geplant. `overdue` und `dueToday`: offen, nicht geplant, Frist vor bzw. am Tag. `doneToday`: am Tag erledigt (Zürcher Zeit).

## Tokens (nur Session, nicht per Token)

- `GET /tokens`, `POST /tokens` Body `{ name }` → `{ token, id, name, createdAt }`, `DELETE /tokens/:id` (widerruft).

## Nicht in v1

Einkauf, Aktivitäten, Reisen und Ziele laufen noch über `GET/PUT /api/sync` (JSON-Block der App). Sie bekommen in Phase 3 eigene Tabellen und Endpunkte.
