# ---- Build Stage ----
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./

RUN --mount=type=secret,id=auth_lib_token,env=AUTH_LIB_TOKEN,required=true \
    echo "//npm.pkg.github.com/:_authToken=${AUTH_LIB_TOKEN}" >> ~/.npmrc && \
    pnpm install --frozen-lockfile && \
    rm -f /app/.npmrc


COPY . .

RUN --mount=type=secret,id=database_url,env=DATABASE_URL,required=true \
    pnpm run build && \
    pnpm prune --prod && \
    pnpm store prune


# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

RUN mkdir -p /app/logs && chown -R node:node /app/logs
USER node

CMD ["node", "dist/src/server.js"]