# Frontend Dockerfile — Production (Nginx static server)
# WHY serve React via Nginx (not Node):
#   React build output is static files (HTML/CSS/JS).
#   Nginx serves static files significantly faster than Node.js,
#   handles gzip compression, cache headers, and TLS termination.

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy Nginx config for React Router (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
