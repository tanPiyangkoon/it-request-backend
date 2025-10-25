# ----- deps -----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN corepack enable || true && npm ci

# ----- runtime -----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=staging

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3001
CMD ["node", "server.js"]