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

# Build the application with proper environment
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application
CMD ["sh", "-c", "npm start"]
