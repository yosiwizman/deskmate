# Use Node.js official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY packages/ui/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY packages/ui/ .

# Build the application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application
CMD ["sh", "-c", "npm start"]
