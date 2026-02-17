# Request: Restore dash5 Access on tethysdash2

**To:** Carlos (DevOps/Infrastructure), IS (Information Systems)  
**From:** Karen Salamy (LRAUV UX / dash5 maintainer)  
**Date:** February 11, 2026  
**Subject:** dash5 production/staging URLs unreachable – Apache + DNS configuration needed

---

## Summary

The dash5 application (LRAUV Dashboard v5) is running in a Docker container on tethysdash2.shore.mbari.org, but it is not reachable via any web URL. I’ve confirmed the container is healthy and serving on port 4050. The blocks are:

1. **Apache** – No virtual host exists to proxy web requests to the dash5 container.
2. **DNS** – `dash5.shore.mbari.org` has no DNS record (NXDOMAIN).

I’ve prepared the Apache config and deployment runbook in the dash5 repo. I need your help to finish the deployment.

---

## Current Status (verified Feb 11, 2026)

| Component                                 | Status                                                        |
| ----------------------------------------- | ------------------------------------------------------------- |
| Server                                    | tethysdash2.shore.mbari.org (134.89.31.85) – Ubuntu 24.04, up |
| dash5 container                           | Running, port 4050→80, returns HTTP 200                       |
| Apache                                    | Only `010-tethysdash.conf` enabled; no dash5 vhost            |
| DNS for dash5.shore.mbari.org             | NXDOMAIN (record does not exist)                              |
| dash5.mbari.org / dash5-staging.mbari.org | Per Carlos, depend on IS cutover – status unknown             |

---

## Request for Carlos

### 1. Install Apache virtual host for dash5.shore.mbari.org

The config file is in the dash5 repo at `docker/apache/dash5-shore-vhost.conf`. It proxies `dash5.shore.mbari.org` to `localhost:4050` and uses the snakeoil cert (suitable for internal use).

**Installation steps** (run as root or user with sudo):

```bash
# Option A: If you have the dash5 repo on tethysdash2
sudo cp /path/to/dash5/docker/apache/dash5-shore-vhost.conf /etc/apache2/sites-available/020-dash5-shore.conf

# Option B: Create the file and paste the config (content below)
sudo nano /etc/apache2/sites-available/020-dash5-shore.conf

# Then:
sudo a2enmod proxy proxy_http rewrite headers ssl
sudo a2ensite 020-dash5-shore
sudo apache2ctl configtest && sudo systemctl reload apache2
```

**Config file content** (paste into `020-dash5-shore.conf`):

```apache
# Apache virtual host config for dash5.shore.mbari.org on tethysdash2
# Proxies to the dash5 container on port 4050

<VirtualHost *:80>
    ServerName dash5.shore.mbari.org
    Redirect permanent / https://dash5.shore.mbari.org/
</VirtualHost>

<VirtualHost *:443>
    ServerName dash5.shore.mbari.org
    SSLEngine on
    SSLCertificateFile      /etc/ssl/certs/ssl-cert-snakeoil.pem
    SSLCertificateKeyFile   /etc/ssl/private/ssl-cert-snakeoil.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Host "dash5.shore.mbari.org"

    ProxyPass        /  http://localhost:4050/
    ProxyPassReverse /  http://localhost:4050/

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)  ws://localhost:4050/$1 [P,L]

    ErrorLog ${APACHE_LOG_DIR}/dash5-shore-error.log
    CustomLog ${APACHE_LOG_DIR}/dash5-shore-access.log combined
</VirtualHost>
```

### 2. (Optional) sudo access for dash5 maintenance

I can SSH as `tethysadmin` (key-based) and as `salamy`, but neither account can run sudo for Apache config changes. If it fits your policies, could you either:

- Grant limited sudo to `salamy` or `tethysadmin` for Apache config under `/etc/apache2/`, or
- Share the tethysadmin password (or a reset) so I can perform these changes directly?

---

## Request for IS

### 1. Create DNS record for dash5.shore.mbari.org

**Current:** `nslookup dash5.shore.mbari.org` returns NXDOMAIN.

**Requested:** Add a DNS record for `dash5.shore.mbari.org` pointing to tethysdash2’s IP (134.89.31.85), or to the canonical hostname for that server, consistent with other `*.shore.mbari.org` records.

### 2. Cutover for dash5.mbari.org and dash5-staging.mbari.org

Per earlier discussions, `dash5.mbari.org` (production) and `dash5-staging.mbari.org` (staging) are intended to be served from tethysdash2. Please advise:

- Whether these hostnames are already pointed at tethysdash2.
- If not, when the cutover can be done.
- What Apache/SSL configuration you expect on the server (e.g. if you terminate SSL elsewhere).

---

## Additional context

- **Full deployment runbook:** `docker/DEPLOYMENT-RUNBOOK.md` in the dash5 repo (https://github.com/mbari-org/dash5)
- **Apache configs in repo:**
  - `docker/apache/dash5-shore-vhost.conf` – dash5.shore.mbari.org (internal)
  - `docker/apache/dash5-vhost-production.conf` – dash5.mbari.org and dash5-staging.mbari.org (production/staging)
- **Container:** `mbari/lrauv-dash-5:5` on port 4050; Watchtower is configured for updates.

---

## Next steps after your changes

1. After DNS is added, verify: `nslookup dash5.shore.mbari.org`
2. After Apache vhost is enabled, verify: `https://dash5.shore.mbari.org/` (self-signed cert warning is expected for internal use)
3. I can then validate the app and coordinate any follow-up for production/staging URLs.

Thank you for your help. I’m happy to clarify or adjust any of this.

— Karen
