# Dash5 Production Deployment Runbook (tethysdash2)

This document helps restore and maintain dash5 (dash5.mbari.org and dash5-staging.mbari.org) on **tethysdash2** (the Ubuntu-migrated VM).

## Current State (per Carlos)

- **Host**: `tethysdash2.shore.mbari.org` (updated Ubuntu VM; tethysdash2-u was a temporary name and has been replaced by tethysdash2)
- **Container**: `dash5` (image `mbari/lrauv-dash-5:5`)
- **Port mapping**: `0.0.0.0:4050->80/tcp`
- **Location**: `~/lrauv-dash-5` on tethysdash2
- **Status**: Container is running but sites are not reachable until IS completes the cutover (DNS + reverse proxy)
- **Auth**: dash5 continues using traditional auth; the new TethysDash auth mechanism does not apply to dash5 yet

---

## Prerequisites for Production

1. **DNS cutover** – IS must point `dash5.mbari.org` and `dash5-staging.mbari.org` to tethysdash2's IP.
2. **Apache on the host** – Must proxy HTTPS requests to the container on `localhost:4050`.
3. **SSL certificates** – Valid certs for both hostnames (e.g. Let's Encrypt, or existing MBARI certs).
4. **Watchtower** – Configured on the host so GitHub Actions can trigger container updates.

---

## Accessing tethysdash2

**Hostname**: `tethysdash2.shore.mbari.org` (per Carlos; the updated Ubuntu VM)

If you cannot reach it:

| Cause        | What to try                                                                             |
| ------------ | --------------------------------------------------------------------------------------- |
| **VPN**      | Connect to the MBARI VPN first; the server is internal (`.shore.mbari.org`).            |
| **DNS**      | Run `ping tethysdash2.shore.mbari.org` to verify resolution.                            |
| **SSH key**  | Ensure your SSH public key is in `tethysadmin`'s `~/.ssh/authorized_keys` (ask Carlos). |
| **Firewall** | The host may allow SSH only from MBARI/VPN IPs; confirm with Carlos or IS.              |

---

## Step 1: Verify the Container

```bash
# SSH (VPN may be required for .shore.mbari.org)
ssh tethysadmin@tethysdash2.shore.mbari.org

# Check container status
cd ~/lrauv-dash-5
docker compose ps

# Test locally (from the host)
curl -s -o /dev/null -w "%{http_code}" http://localhost:4050/
# Expected: 200
```

---

## Step 2: Apache Virtual Hosts (Host-Side)

Apache on the **host** (tethysdash2) must proxy both hostnames to the container.

Reference configs in this repo:

- `docker/apache/dash5-vhost-production.conf` – dash5.mbari.org and dash5-staging.mbari.org
- `docker/apache/dash5-shore-vhost.conf` – dash5.shore.mbari.org (internal)

### Quick install for dash5.shore.mbari.org

On tethysdash2 as a user with sudo:

```bash
# 1. Get cert paths from existing tethysdash config
grep -E "SSLCertificate" /etc/apache2/sites-available/010-tethysdash.conf

# 2. Create the config (from repo, or SCP from your machine, or paste content)
#    If repo is in ~/lrauv-dash-5: sudo cp ~/lrauv-dash-5/docker/apache/dash5-shore-vhost.conf /etc/apache2/sites-available/020-dash5-shore.conf
#    Or SCP: scp docker/apache/dash5-shore-vhost.conf tethysadmin@tethysdash2.shore.mbari.org:/tmp/
#    Then on server: sudo cp /tmp/dash5-shore-vhost.conf /etc/apache2/sites-available/020-dash5-shore.conf
sudo nano /etc/apache2/sites-available/020-dash5-shore.conf   # Paste content, replace /path/to/ with actual cert paths

# 3. Enable modules and site
sudo a2enmod proxy proxy_http rewrite headers ssl
sudo a2ensite 020-dash5-shore

# 4. Test and reload
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Copy and customize, or create `/etc/apache2/sites-available/dash5.conf`:

```apache
# dash5.mbari.org (production)
<VirtualHost *:443>
    ServerName dash5.mbari.org
    SSLEngine on
    SSLCertificateFile /path/to/fullchain.pem
    SSLCertificateKeyFile /path/to/privkey.pem

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Host "dash5.mbari.org"

    ProxyPass        /  http://localhost:4050/
    ProxyPassReverse /  http://localhost:4050/

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)  ws://localhost:4050/$1 [P,L]

    ErrorLog ${APACHE_LOG_DIR}/dash5-error.log
    CustomLog ${APACHE_LOG_DIR}/dash5-access.log combined
</VirtualHost>

# dash5-staging.mbari.org (staging)
<VirtualHost *:443>
    ServerName dash5-staging.mbari.org
    SSLEngine on
    SSLCertificateFile /path/to/fullchain.pem
    SSLCertificateKeyFile /path/to/privkey.pem

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Host "dash5-staging.mbari.org"

    ProxyPass        /  http://localhost:4050/
    ProxyPassReverse /  http://localhost:4050/

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)  ws://localhost:4050/$1 [P,L]

    ErrorLog ${APACHE_LOG_DIR}/dash5-staging-error.log
    CustomLog ${APACHE_LOG_DIR}/dash5-staging-access.log combined
</VirtualHost>
```

**SSL paths**: Replace `/path/to/fullchain.pem` and `/path/to/privkey.pem` with the real cert paths (e.g. `/etc/letsencrypt/live/dash5.mbari.org/` or the MBARI cert location).

---

## Step 3: Enable Apache Modules and Site

```bash
sudo a2enmod proxy proxy_http rewrite headers ssl
sudo a2ensite dash5
sudo systemctl reload apache2
```

---

## Step 4: HTTP → HTTPS Redirect (Optional)

If Apache also listens on port 80, add redirects:

```apache
<VirtualHost *:80>
    ServerName dash5.mbari.org
    ServerAlias dash5-staging.mbari.org
    Redirect permanent / https://dash5.mbari.org/
</VirtualHost>
```

(Adjust the redirect target as needed if the request is for staging.)

---

## Step 5: Docker Compose (Port 4050)

The container must publish port 4050. In `~/lrauv-dash-5/docker-compose.yml` (or equivalent on the host):

```yaml
services:
  dash5:
    image: mbari/lrauv-dash-5:latest # or :5, :production, etc.
    ports:
      - '4050:80'
    container_name: dash5
    restart: always
    labels:
      - 'com.centurylinklabs.watchtower.enable=true'
```

- **Production**: Use `mbari/lrauv-dash-5:latest` or `mbari/lrauv-dash-5:production`.
- **Staging**: Use `mbari/lrauv-dash-5:staging` if you run separate containers; otherwise a single container serving both hostnames is fine (the app is the same).

---

## Step 6: Watchtower (Auto-Updates)

The release workflow calls Watchtower on the server. Ensure:

1. Watchtower is running on tethysdash2 with HTTP API enabled.
2. **GitHub repo secrets** (mbari-org/dash5):
   - `TETHYSDASH2_WATCHTOWER_ENDPOINT` – URL that triggers a Watchtower update (e.g. `http://localhost:8080/v1/update` or the external URL if exposed).
   - `WATCHTOWER_HTTP_API_TOKEN` – Bearer token for the Watchtower API.

Example Watchtower run:

```bash
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e WATCHTOWER_HTTP_API_UPDATE=true \
  -e WATCHTOWER_HTTP_API_TOKEN=your-token \
  -p 8080:8080 \
  containrrr/watchtower
```

---

## Step 7: Troubleshooting

| Issue                                                                               | Check                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 502 Bad Gateway                                                                     | Container running? `curl http://localhost:4050/` returns 200?                                                                                                                                                                                                    |
| Connection refused                                                                  | Apache `ProxyPass` points to `localhost:4050`?                                                                                                                                                                                                                   |
| DNS not resolving                                                                   | IS cutover; `dig dash5.mbari.org` to verify IP                                                                                                                                                                                                                   |
| SSL errors                                                                          | Certs valid and paths correct in Apache config                                                                                                                                                                                                                   |
| Old content after release                                                           | Watchtower pulling new image? Check Watchtower logs                                                                                                                                                                                                              |
| Container not updating                                                              | `TETHYSDASH2_WATCHTOWER_ENDPOINT` and token set in GitHub?                                                                                                                                                                                                       |
| `failed to initialize logging driver: dial tcp ... :514: connect: no route to host` | Docker daemon is configured to use a central syslog server (see `/etc/docker/daemon.json`). If the syslog host is unreachable, containers won't start. Contact Carlos/IS; they may need to open routing or temporarily switch to the default `json-file` driver. |

---

## Coordination Checklist

- [ ] **Carlos**: Confirm Apache is installed and configured with the vhost above.
- [ ] **Carlos**: Confirm SSL cert paths and that both hostnames are in the cert.
- [ ] **IS**: Point `dash5.mbari.org` and `dash5-staging.mbari.org` to tethysdash2.
- [ ] **salamy**: Verify `TETHYSDASH2_WATCHTOWER_ENDPOINT` points to tethysdash2.
- [ ] **Team**: Test both URLs after cutover.

---

## Manual Container Update (If Watchtower Fails)

```bash
cd ~/lrauv-dash-5
docker compose pull
docker compose up -d
```
