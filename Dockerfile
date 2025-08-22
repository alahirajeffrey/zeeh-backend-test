# Build stage
FROM node:22-alpine AS builder

WORKDIR /zeeh

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run start:dev

# Production stage
FROM node:22-alpine

WORKDIR /zeeh

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /zeeh/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]