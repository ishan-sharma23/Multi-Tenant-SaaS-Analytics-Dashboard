FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json jest.config.ts ./
COPY src ./src
COPY tests ./tests

RUN npm run build

EXPOSE 4000
CMD ["node", "dist/server.js"]
