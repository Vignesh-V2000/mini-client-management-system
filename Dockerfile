FROM node:22-bookworm-slim AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ENV VITE_API_URL=/api
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app/server
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci --include=dev && npm run db:generate
COPY server/src ./src
COPY --from=frontend /app/client/dist /app/client/dist
ENV NODE_ENV=production HOST=0.0.0.0 SERVE_CLIENT=true
USER node
CMD ["node", "src/server.js"]
