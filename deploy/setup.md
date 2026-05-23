# VPS Setup — Ambar & Dällen

Einmalige Einrichtung des VPS. Danach läuft alles automatisch über GitHub Actions.

> Werte die du vor der ersten Ausführung anpassen musst:
> - **DOMAIN** — z.B. `app.example.ch`
> - **VPS-IP** — IP deines Servers
> - **GHCR-User** — GitHub-Username/Org, hier `daellengarnier`

---

## 0 · Bevor du loslegst

- [ ] DNS A-Record für deine Domain zeigt auf die VPS-IP (Propagation kann bis zu 1h dauern, oft sofort)
- [ ] SSH-Login zum VPS funktioniert: `ssh ubuntu@VPS-IP`
- [ ] Du hast Sudo-Rechte auf dem VPS

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
scp deploy/docker-compose.yml deploy/Caddyfile ubuntu@VPS-IP:/opt/ambardaellen/
```

Dann auf dem VPS die Domain im Caddyfile eintragen:

```bash
cd /opt/ambardaellen
sed -i 's/DOMAIN_PLACEHOLDER/deine.domain.ch/' Caddyfile
cat Caddyfile   # zur Kontrolle
```

---

## 3 · GHCR-Login auf dem VPS (damit `docker compose pull` funktioniert)

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

## 4 · Erstes Image bauen & deployen

Der einfachste Weg: einmal manuell triggern, danach übernimmt CI.

**a) Image bauen (auf GitHub):**
Push einen Commit auf den Deploy-Branch (oder triggere den Workflow manuell via "Run workflow" im Actions-Tab). Workflow `deploy.yml` baut und pusht
`ghcr.io/daellengarnier/ambardaellen-app:latest`.

**b) Image auf dem VPS starten:**

```bash
cd /opt/ambardaellen
docker compose pull
docker compose up -d
docker compose logs -f --tail 50
```

Caddy startet, holt das Let's-Encrypt-Zertifikat (kurz Geduld beim ersten
Mal — du siehst "obtained certificate" in den Logs), dann ist die App auf
`https://deine.domain.ch` erreichbar.

---

## 5 · GitHub Actions: Auto-Deploy einrichten

Damit `git push` automatisch deployt, brauchst du **Repository Secrets**.
Im Repo: Settings → Secrets and variables → Actions → New repository secret:

| Secret-Name      | Wert                                                                |
|------------------|---------------------------------------------------------------------|
| `VPS_HOST`       | IP oder Hostname deines VPS                                        |
| `VPS_USER`       | `ubuntu`                                                            |
| `VPS_SSH_KEY`    | Inhalt deines PRIVATEN SSH-Keys (das ganze File, beginnend mit `-----BEGIN OPENSSH PRIVATE KEY-----`) |
| `VPS_PORT`       | optional, Default 22                                                |

> **Wichtig zum SSH-Key:** GENERIERE einen dedizierten Key NUR für Deploys,
> nicht deinen persönlichen. Auf deinem Laptop:
> ```bash
> ssh-keygen -t ed25519 -f ~/.ssh/ambardaellen_deploy -C "ambardaellen-deploy" -N ""
> ssh-copy-id -i ~/.ssh/ambardaellen_deploy.pub ubuntu@VPS-IP
> cat ~/.ssh/ambardaellen_deploy   # ← kopieren, in VPS_SSH_KEY einfügen
> ```

Workflow ist in `.github/workflows/deploy.yml` schon angelegt.

---

## 6 · Updates ab jetzt

Einfach: `git push` auf `main` (oder `claude/shared-org-app-IYZYF` falls du
noch da bist) → Workflow baut Image → SSH auf VPS → pull + restart. Du
musst nichts mehr machen.

Wenn etwas schiefgeht:

```bash
ssh ubuntu@VPS-IP
cd /opt/ambardaellen
docker compose logs --tail 200 -f
docker compose ps
docker compose restart       # weicher Reset
docker compose pull && docker compose up -d   # neueste Version forcieren
```

---

## Troubleshooting

**Caddy bekommt kein Zertifikat / "challenge failed":**
- A-Record zeigt nicht auf VPS-IP (`dig +short deine.domain.ch`)
- Port 80 nicht offen (UFW oder Provider-Firewall)
- Du hast Let's-Encrypt-Rate-Limit erreicht (max. 5 Zertifikate pro Domain
  pro Woche bei Fehlversuchen). Warten oder Staging-CA aktivieren.

**`docker compose pull` schlägt fehl mit "unauthorized":**
- GHCR-Login auf dem VPS abgelaufen — Schritt 3 wiederholen
- Image-Tag existiert nicht (im GitHub Actions Tab checken ob Build durchlief)
- Repo-Package ist Private → in den Package-Settings auf GitHub den VPS-User
  als Collaborator hinzufügen oder Package public machen

**App startet, aber 502 von Caddy:**
- App-Container crasht — `docker compose logs app`
- Falscher Container-Name im Caddyfile (`reverse_proxy app:3000`, nicht localhost)
