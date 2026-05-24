# Deployment auf VPS (Docker Compose + Caddy)

Voraussetzungen auf dem VPS: Ubuntu/Debian + Docker (inkl. `docker compose`).
Eine A/AAAA-DNS-Eintrag auf den VPS muss schon gesetzt sein für die Domain.

## 1. Repo klonen

```sh
ssh user@dein-vps
git clone https://github.com/daellengarnier/ambardaellen-app.git
cd ambardaellen-app
```

## 2. `.env` anlegen

```sh
cp .env.example .env
nano .env
```

Drei Werte setzen:

- `APP_DOMAIN` — z. B. `app.al-daellen.ch`
- `AUTH_SECRET` — `openssl rand -base64 48`
- `POSTGRES_PASSWORD` — `openssl rand -base64 32 | tr -d '/+=' | head -c 32`

## 3. Login bei GHCR (einmalig)

Das App-Image liegt unter `ghcr.io/daellengarnier/ambardaellen-app`.
Falls das Repository privat ist, brauchst du ein GitHub Personal Access
Token mit `read:packages`:

```sh
echo <GHCR_PAT> | docker login ghcr.io -u <github-user> --password-stdin
```

Für ein öffentliches Image entfällt das.

## 4. Starten

```sh
docker compose pull
docker compose up -d
```

Beim ersten Start:

- `db` initialisiert Postgres
- `app` läuft `scripts/entrypoint.sh` → wendet `drizzle/*.sql` an, startet Next.js
- `caddy` holt das TLS-Zertifikat von Let's Encrypt

Logs:

```sh
docker compose logs -f app
docker compose logs -f caddy
```

## 5. Update

```sh
git pull
docker compose pull       # holt das neueste GHCR-Image
docker compose up -d      # rolling restart
```

Neue Migrationen werden beim Start automatisch angewendet.

## Backup der DB

```sh
docker compose exec db pg_dump -U ambardaellen ambardaellen > backup-$(date +%F).sql
```

Wiederherstellen:

```sh
cat backup-2026-05-24.sql | docker compose exec -T db psql -U ambardaellen ambardaellen
```

## Fehlersuche

- App startet nicht → `docker compose logs app`. Häufig: `AUTH_SECRET`
  zu kurz, `DATABASE_URL` falsch, Migration schlägt fehl.
- TLS schlägt fehl → DNS prüfen. `caddy` versucht 10× bis es ein
  Zertifikat hat.
- Daten vom alten lokal-Storage in die Cloud übertragen: erfolgt
  automatisch beim ersten Login (sofern lokal noch Daten liegen).
