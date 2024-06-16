# AngeloLaMadrid/AS212S6_T02_SolCoins
# Usando Node con versión 18 para construir la aplicación Angular
FROM node:18-alpine AS build

# Instalar Angular
RUN npm install -g @angular/cli

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar npm y construir el proyecto
RUN npm install
COPY . .
RUN ng build

# Usar nginx como base para el contenedor final
FROM nginx:alpine


# Copiar la carpeta de construcción al directorio correcto para nginx
# ---- IMPORTANTE reemplazar "CAMBIAME" por el nombre de la aplicacion----

COPY --from=build /app/dist/angular-17-firebase-crud/browser /usr/share/nginx/html

EXPOSE 4200

# Modificar la configuración de nginx para escuchar en el puerto 4200
RUN echo "server { listen 4200; root /usr/share/nginx/html; index index.html index.htm; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
