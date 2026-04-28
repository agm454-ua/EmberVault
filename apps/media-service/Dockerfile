# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

RUN --mount=type=secret,id=auth_lib_token \
    export AUTH_LIB_TOKEN=$(cat /run/secrets/auth_lib_token) && \
    npm ci

COPY . .

RUN --mount=type=secret,id=database_url \
    export DATABASE_URL=$(cat /run/secrets/database_url) && \
    npm run build && \
    npm prune --omit=dev && \
    npm cache clean --force


# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/logs && chown -R node:node /app/logs
USER node

CMD ["node", "dist/src/server.js"]