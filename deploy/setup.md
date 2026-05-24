# VPS Setup — Ambar & Dällen

Einmalige Einrichtung des VPS. Danach läuft alles automatisch über GitHub Actions.

**Konkrete Werte für dieses Projekt:**
- **App-Domain**: `app.al-daellen.ch` (löst Caddy mit Let's-Encrypt-HTTPS auf)
- **SSH-Host**: `ssh ubuntu@app.felsenau.org` (zeigt auf VPS-IP `185.143.100.53`)
- **GHCR-Image**: `ghcr.io/daellengarnier/ambardaellen-app`

> SSH-Host und App-Domain sind verschiedene Subdomains, beide zeigen aber
> auf den **gleichen VPS** (IP `185.143.100.53`).

---

## 0 · Bevor du loslegst

- [x] DNS für `app.felsenau.org` → `185.143.100.53` (bereits gesetzt, nur für SSH)
- [ ] **DNS-Record für `app.al-daellen.ch` setzen** — neuer `A`-Record
  bei deinem DNS-Provider: `app` (Subdomain von `al-daellen.ch`) →
  `185.143.100.53`. TTL 300s. Check nach 1–5 Min:
  ```bash
  getent ahosts app.al-daellen.ch   # muss 185.143.100.53 zeigen
  ```
- [ ] SSH-Login funktioniert: `ssh ubuntu@app.felsenau.org`
- [ ] Du hast Sudo-Rechte auf dem VPS
- [ ] **Port 80 ist frei** — aktuell antwortet dort noch was (HTTP 403). Vermutlich der Default-Webserver des Hosters. Vor dem ersten `docker compose up` stoppen:
  ```bash
  # Falls Nginx oder Apache läuft:
  sudo systemctl stop nginx 2>/dev/null || true
  sudo systemctl disable nginx 2>/dev/null || true
  sudo systemctl stop apache2 2>/dev/null || true
  sudo systemctl disable apache2 2>/dev/null || true
  # Check ob Port 80 jetzt frei:
  sudo ss -tlnp | grep ':80 '
  ```

---

## 1 · VPS vorbereiten (einmalig, auf dem VPS)

SSH zum VPS und führe diese Blöcke aus:

```bash
# System-Updates
sudo apt update && sudo apt upgrade -y

# Docker installieren (offizielles Skript)
curl -fsSL https://get.docker.com | sudo sh

# Eigenen User der docker-Group hinzufügen, damit du ohne sudo Docker bedienen kannst
sudo usermod -aG docker $USER
# Re-login, damit die Gruppe greift:
exit
# … neuer SSH-Login …

# Verifizieren
docker compose version
docker run --rm hello-world
```

Firewall: Ports 80 und 443 öffnen (UFW als Beispiel):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp   # HTTP/3
sudo ufw --force enable
sudo ufw status
```

---

## 2 · App-Ordner anlegen & Compose-Dateien hinterlegen

```bash
sudo mkdir -p /opt/ambardaellen
sudo chown $USER:$USER /opt/ambardaellen
cd /opt/ambardaellen
```

`docker-compose.yml` und `Caddyfile` aus diesem `deploy/`-Ordner auf den
VPS kopieren — am einfachsten per `scp` von deinem Laptop:

```bash
# Von deinem lokalen Repo aus (NICHT vom VPS):
scp deploy/docker-compose.yml deploy/Caddyfile ubuntu@app.felsenau.org:/opt/ambardaellen/
```

Verifikation auf dem VPS — die Domain steht bereits im Caddyfile, nichts zu ersetzen:

```bash
cd /opt/ambardaellen
cat Caddyfile | head -3
# → muss zeigen: "app.al-daellen.ch {"
```

---

## 3 · `.env` mit Secrets anlegen

Die App + die Datenbank brauchen zwei Secrets. Auf dem VPS in `/opt/ambardaellen/.env`:

```bash
cd /opt/ambardaellen
cat > .env <<EOF
AUTH_SECRET=$(openssl rand -base64 48)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
EOF
chmod 600 .env
cat .env   # einmal anschauen, beide Werte sollten zufällig sein
```

> **Wichtig**: Diese Datei niemals committen, niemals weitergeben.
> Wenn du das `AUTH_SECRET` änderst, sind alle bestehenden Login-Sessions
> ungültig (jeder muss sich neu anmelden). `POSTGRES_PASSWORD` darfst du
> nach dem ersten `docker compose up` NICHT mehr ändern, sonst kommst du
> nicht mehr an die DB.

---

## 4 · GHCR-Login auf dem VPS (damit `docker compose pull` funktioniert)

Damit der VPS Images aus GitHub Container Registry ziehen kann, brauchst
du ein **Personal Access Token (classic)** mit Scope `read:packages`:

1. Auf GitHub: Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token (classic)
2. Note: "ambardaellen vps pull", Scope nur `read:packages` ankreuzen
3. Token kopieren

Auf dem VPS einloggen:

```bash
echo "GHCR_TOKEN_HIER" | docker login ghcr.io -u DEIN_GITHUB_USERNAME --password-stdin
```

Docker speichert das Login dauerhaft in `~/.docker/config.json`.

---

## 5 · Erstes Image bauen & deployen

Der einfachste Weg: einmal manuell triggern, danach übernimmt CI.

**a) Image bauen (auf GitHub):**
Push einen Commit auf den Deploy-Branch (oder triggere den Workflow manuell via "Run workflow" im Actions-Tab). Workflow `deploy.yml` baut und pusht
`ghcr.io/daellengarnier/ambardaellen-app:latest`.

**b) Image auf dem VPS starten:**

```bash
cd /opt/ambardaellen
docker compose pull
docker compose up -d
docker compose logs -f --tail 80
```

Was passiert beim ersten Start:
1. Postgres-Container startet, legt die DB an.
2. App-Container startet, `scripts/entrypoint.sh` wendet die
   Drizzle-Migrationen an (Tabellen werden angelegt).
3. App lauscht auf Port 3000 (nur intern).
4. Caddy startet, holt das Let's-Encrypt-Zertifikat für
   `app.al-daellen.ch` (kurz Geduld beim ersten Mal — Log zeigt
   "obtained certificate"), dann ist die App auf
   **https://app.al-daellen.ch** erreichbar.

---

## 6 · GitHub Actions: Auto-Deploy einrichten

Damit `git push` automatisch deployt, brauchst du **Repository Secrets**.
Im Repo: Settings → Secrets and variables → Actions → New repository secret:

| Secret-Name      | Wert                                                                |
|------------------|---------------------------------------------------------------------|
| `VPS_HOST`       | `app.felsenau.org`                                                  |
| `VPS_USER`       | `ubuntu`                                                            |
| `VPS_SSH_KEY`    | Inhalt deines PRIVATEN SSH-Keys (das ganze File, beginnend mit `-----BEGIN OPENSSH PRIVATE KEY-----`) |
| `VPS_PORT`       | optional, Default 22                                                |

> **Wichtig zum SSH-Key:** GENERIERE einen dedizierten Key NUR für Deploys,
> nicht deinen persönlichen. Auf deinem Laptop:
> ```bash
> ssh-keygen -t ed25519 -f ~/.ssh/ambardaellen_deploy -C "ambardaellen-deploy" -N ""
> ssh-copy-id -i ~/.ssh/ambardaellen_deploy.pub ubuntu@app.felsenau.org
> cat ~/.ssh/ambardaellen_deploy   # ← kopieren, in VPS_SSH_KEY einfügen
> ```

Workflow ist in `.github/workflows/deploy.yml` schon angelegt.

---

## 7 · Updates ab jetzt

Einfach: `git push` auf `main` (oder den Branch den der Deploy-Workflow
beobachtet) → Workflow baut Image → SSH auf VPS → pull + restart.
Migrationen laufen automatisch beim Container-Start mit (idempotent).

Wenn etwas schiefgeht:

```bash
ssh ubuntu@app.felsenau.org
cd /opt/ambardaellen
docker compose logs --tail 200 -f
docker compose ps
docker compose restart       # weicher Reset
docker compose pull && docker compose up -d   # neueste Version forcieren
```

---

## Backups

Postgres-Datenvolume sichern (ab und zu vom VPS auf deinen Laptop):

```bash
# Auf dem VPS — pg_dump im Container ausführen, Output über stdout:
cd /opt/ambardaellen
docker compose exec -T db pg_dump -U ambardaellen ambardaellen \
  | gzip > backup-$(date +%Y-%m-%d).sql.gz

# Auf den Laptop ziehen:
scp ubuntu@app.felsenau.org:/opt/ambardaellen/backup-*.sql.gz ./
```

Restore (wenn nötig):

```bash
# DB neu anlegen, dann importieren
gunzip < backup-2026-05-24.sql.gz \
  | docker compose exec -T db psql -U ambardaellen ambardaellen
```

---

## Troubleshooting

**Caddy bekommt kein Zertifikat / "challenge failed":**
- A-Record zeigt nicht auf VPS-IP (`getent ahosts app.al-daellen.ch`)
- Port 80 nicht offen (UFW oder Provider-Firewall, ODER ein anderer
  Webserver belegt ihn noch — siehe Schritt 0)
- Du hast Let's-Encrypt-Rate-Limit erreicht (max. 5 Zertifikate pro Domain
  pro Woche bei Fehlversuchen). Warten oder Staging-CA aktivieren.

**`docker compose pull` schlägt fehl mit "unauthorized":**
- GHCR-Login auf dem VPS abgelaufen — Schritt 4 wiederholen
- Image-Tag existiert nicht (im GitHub Actions Tab checken ob Build durchlief)
- Repo-Package ist Private → in den Package-Settings auf GitHub den VPS-User
  als Collaborator hinzufügen oder Package public machen

**App startet, aber 502 von Caddy:**
- App-Container crasht — `docker compose logs app`
  - Oft DB-Connection: prüfe ob `db`-Container healthy ist (`docker compose ps`)
  - Oder `AUTH_SECRET` fehlt in `.env`
- Falscher Container-Name im Caddyfile (`reverse_proxy app:3000`, nicht localhost)

**Login funktioniert nicht / "Account nicht gefunden":**
- Du hast vorher die lokale localStorage-Variante benutzt — der lokale
  Account ist nicht auf dem Server. Registriere dich nochmal mit der
  gleichen E-Mail; deine lokalen App-Daten werden beim Login einmalig
  in die Cloud migriert.

**Migration läuft nicht durch / DB-Fehler im App-Log:**
- DB-Container noch nicht fertig — `docker compose logs db`
- `entrypoint.sh` retry-loopt 10× mit 2 s Pause, wenn das nicht reicht,
  startet die App nicht. Dann manuell: `docker compose restart app`
- Beim ersten Start kann es 5–10 s dauern, bis Postgres bereit ist.
