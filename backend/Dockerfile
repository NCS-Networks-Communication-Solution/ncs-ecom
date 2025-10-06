# syntax=docker/dockerfile:1

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "start:dev"]

FROM deps AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
