# DeskMate Desktop (Webtop)

This service runs a browser-accessible Ubuntu XFCE desktop using LinuxServer Webtop.

How to deploy on Railway:
- Create a new service in the same Railway project (optimistic-clarity)
- Choose "Deploy from GitHub Repo"
- Select this repo and the path services/desktop
- Railway will detect the Dockerfile and build it
- Enable Public Networking and copy the public HTTPS domain

Recommended variables for the service:
- PUID=1000
- PGID=1000
- TZ=UTC
- PASSWORD=SetA-Strong-Password

Note:
- Do NOT set PORT on Railway. Railway injects PORT automatically. This image now binds nginx to the platform PORT and proxies internally to Webtop on 3002.
- A public /healthz endpoint is exposed (no auth) for Railway health checks.

Then set in your UI service (deskmate):
- NEXT_PUBLIC_DESKTOP_URL=https://<that-public-domain>

If the iframe is blocked:
- Ensure the desktop service is not sending X-Frame-Options: DENY
- If needed, add a small reverse proxy later to set:
  Content-Security-Policy: frame-ancestors 'self' https://deskmate-production.up.railway.app
