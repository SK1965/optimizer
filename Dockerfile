FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/

WORKDIR /app/backend

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
