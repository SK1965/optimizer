FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and config files
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application
# --dns-result-order=ipv4first is used to resolve ENETUNREACH issues with database connections
# --env-file=.env is used to load environment variables as expected by the start script
CMD ["node", "--dns-result-order=ipv4first", "--env-file=.env", "dist/src/index.js"]
