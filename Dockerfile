# 1) Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Adapte si besoin (Vite/CRA) :
RUN npm run build

# 2) Nginx statique
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# (optionnel) healthcheck simple
HEALTHCHECK CMD wget -qO- http://localhost/health || exit 1
