FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy source code AND the .env file
COPY backend/ ./backend/
# If your .env is in the root of your project, use: COPY .env ./backend/.env

WORKDIR /app/backend

RUN npm run build

EXPOSE 3000

# Use the native Node 20 flag to load the environment variables
# Add the --dns-result-order flag
CMD ["node", "--dns-result-order=ipv4first", "--env-file=.env", "dist/index.js"]

