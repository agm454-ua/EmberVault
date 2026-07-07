FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build && \
    pnpm prune --prod && \
    pnpm store prune


FROM nginx:latest

COPY --from=builder /app/dist /usr/share/nginx/html