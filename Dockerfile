FROM node:20-alpine AS build
WORKDIR /app

# Copie du lock + npmrc avant l'install
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

# Copie du code
COPY . .

# --- Vars de build Vite ---
ARG VITE_API_BASE
ARG VITE_API_URL
ARG VITE_FILES_BASE

# Les exposer au process de build:
ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_API_URL=$VITE_API_URL \
    VITE_FILES_BASE=$VITE_FILES_BASE

RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK CMD wget -qO- http://localhost/health || exit 1
