# Webtop desktop service for Railway (embed-friendly)
# Docs: https://github.com/linuxserver/docker-webtop
# This image exposes a noVNC web UI on port 3000 by default.

FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Optional defaults – you can override in Railway Variables
ENV PUID=1000 \
    PGID=1000 \
    TZ=UTC \
    PASSWORD=deskmate-strong-password \
    # Move internal Webtop site off 3000/3001 to avoid conflicts
    CUSTOM_PORT=3002 \
    CUSTOM_HTTPS_PORT=3003

# Install default tools for productivity
RUN apt-get update && apt-get install -y \
    firefox \
    libreoffice \
    code \
    qpdf \
    p7zip-full \
    tesseract-ocr \
    tesseract-ocr-eng \
    curl \
    wget \
    git \
    nano \
    vim \
    htop \
    tree \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
RUN mkdir -p /config/workspace && \
    chown abc:abc /config/workspace

# Copy runtime init and config files
COPY rootfs/ /

# Railway will map this automatically when Public Networking is enabled
EXPOSE 3000

# Health check for Railway – hits our nginx /healthz on the platform port
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT:-3000}/healthz || exit 1

# No additional commands required – the base image starts web UI
