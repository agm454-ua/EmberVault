FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && \
    npm prune --omit=dev && \
    npm cache clean --force

FROM nginx:latest
COPY --from=builder /app/dist /usr/share/nginx/html