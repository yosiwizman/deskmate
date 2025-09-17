# Use Node.js official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY packages/ui/package*.json ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy all application files
COPY packages/ui/ .

# Set build-time environment variables as ARG
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

# Convert ARGs to ENV so they're available during build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Build the application with proper environment
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application
CMD ["sh", "-c", "npm start"]
