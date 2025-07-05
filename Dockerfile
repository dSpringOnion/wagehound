# Use Node.js 18 LTS - Railway Docker Build v2
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Install dependencies with npm (simpler than pnpm for Railway)
RUN npm install --only=production

# Copy the server file
COPY server.js ./

# Create a simple health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:'+process.env.PORT+'/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Expose the port that Railway will assign
EXPOSE 8080

# Set environment
ENV NODE_ENV=production

# Start the server directly (no npm)
CMD ["node", "server.js"]