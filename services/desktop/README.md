# DeskMate Desktop (Webtop)

This service runs a browser-accessible Ubuntu XFCE desktop using LinuxServer Webtop.

How to deploy on Railway:
- Create a new service in the same Railway project (optimistic-clarity)
- Choose "Deploy from GitHub Repo"
- Select this repo and the path services/desktop
- Railway will detect the Dockerfile and build it
- Enable Public Networking and copy the public HTTPS domain

Recommended variables for the service:
- PORT=3000
- PUID=1000
- PGID=1000
- TZ=UTC
- PASSWORD=SetA-Strong-Password

Then set in your UI service (deskmate):
- NEXT_PUBLIC_DESKTOP_URL=https://<that-public-domain>

If the iframe is blocked:
- Ensure the desktop service is not sending X-Frame-Options: DENY
- If needed, add a small reverse proxy later to set:
  Content-Security-Policy: frame-ancestors 'self' https://deskmate-production.up.railway.app
