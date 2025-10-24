# ----- deps -----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN corepack enable || true && npm ci

# ----- runtime -----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3001

# ใช้ npm start (ตรงกับ package.json)
# CMD ["npm", "start"]
CMD ["node", "server.js"]