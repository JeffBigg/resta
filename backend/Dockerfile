# backend/Dockerfile
FROM node:20-alpine

# Instalamos dependencias del sistema necesarias para 'sharp' y otras libs
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install

COPY . .
RUN npm run build

EXPOSE 1337
CMD ["npm", "run", "start"]