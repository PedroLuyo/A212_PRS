# Etapa de construcción
FROM node:20.11.1 AS build

WORKDIR /usr/local/app
COPY ./ /usr/local/app
RUN npm install
RUN npm run build

# Etapa de producción
FROM nginx:latest
COPY --from=build /usr/local/app/dist/angular-17-firebase-crud /usr/share/nginx/html
EXPOSE 80