# Webtop desktop service for Railway (embed-friendly)
# Docs: https://github.com/linuxserver/docker-webtop
# This image exposes a noVNC web UI on port 3000 by default.

FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Optional defaults – you can override in Railway Variables
ENV PUID=1000 \
    PGID=1000 \
    TZ=UTC

# Railway will map this automatically when Public Networking is enabled
EXPOSE 3000

# No additional commands required – the base image starts web UI
