<!-- Creditos: AngeloLaMadrid -->
<h1 align="center">GastroConnect</h1>

![loog-og](https://github.com/PedroLuyo/A212_PRS/assets/101282128/5be25cc7-dfda-4519-9c6b-128976850d28)

## 📚 Ejecución rápida del proyecto (Clonar)

¿Deseas iniciar rápidamente con el proyecto? Este comando realiza todo el trabajo necesario:

```bash
git clone -b frontend https://github.com/PedroLuyo/A212_PRS.git && cd A212_PRS && npm install && npm install -g @angular/cli && ng serve --open
```
>Este comando realiza tres acciones importantes: clona el repositorio, instala las dependencias necesarias y posteriormente inicia el servidor de desarrollo de Angular,todo esto en un único paso, lo que nos permite comenzar a trabajar de manera rápida y eficiente. 🔥
>test

![image](https://github.com/PedroLuyo/A212_PRS/assets/101282128/15234c25-5cf5-450e-b6d6-2a6c0399eab7)

#
### 🚀 Paso 1: Clonar el Repositorio

```sh
git clone -b frontend https://github.com/PedroLuyo/A212_PRS.git
```
 🔄 Paso 2: Nos aseguramos de estar en la rama correcta
```sh
git checkout frontend
```
🧹 Paso 3: Descartar cambios locales no confirmados
```sh
git reset --hard
```
🌐 Paso 4: Sincronizar con la rama frontend
```sh
git fetch origin frontend
git reset --hard origin/frontend
```
✔️ Resumen
```sh
git checkout frontend
git reset --hard
git fetch origin frontend
git reset --hard origin/frontend
```
#
# 🐳 Wiki de Dockerización y Kubernetes

## 1️⃣ Dockerfile Estándar 📄

Para nuestras aplicaciones, utilizamos un Dockerfile adaptado y optimizado. Puedes encontrar el Dockerfile en el siguiente enlace: [Dockerfile optimizado](https://github.com/AngeloLaMadrid/DockerfileLiviano-JAVA-PYTHON-ANGULAR/blob/Dockerfile/Dockerfile_javaSpringBootLiviano).

Aquí tienes un ejemplo de cómo se ve:

```dockerfile
# Creditos: AngeloLaMadrid
# Repositorio: AngeloLaMadrid/DockerfileLiviano-JAVA-PYTHON-ANGULAR

# Instrucciones-----------------------------------------------------------------
# En este EJEMPLO tengo mi jar con el nombre "backend-old.jar" de puerto 8090 (cambiarlos al suyo), deben hacer los pasos:
# 1.-Cambiar por el nombre de su IMAGEN en las lineas: 43 y 49
# 2.-Cambiar el PUERTO al suyo en la linea: 46

# Etapa de construccion
FROM eclipse-temurin:17-jdk-alpine as packager

# Construir distribucion minima de modulos
RUN jlink \
    --verbose \
    --add-modules java.base,java.sql,java.naming,java.management,java.instrument,java.desktop \
    --compress 2 \
    --strip-debug \
    --no-header-files \
    --no-man-pages \
    --output /opt/jre

# Segunda etapa, configurar entorno minimo
FROM alpine:latest

# Instalar dependencias necesarias para ejecutar Java
RUN apk add --no-cache libc6-compat

# Copiar JRE personalizado desde la etapa de construccion
COPY --from=packager /opt/jre /opt/jre

# Configuracion del entorno y del PATH
ENV JAVA_HOME=/opt/jre
ENV PATH=$PATH:$JAVA_HOME/bin

# Directorio de trabajo para el JAR
WORKDIR /app

# Copiar el JAR (renombrar por el nombre de su jar) ***
COPY backend-old.jar .

# Exponer el puerto 8090 (cambiar si es necesario)
EXPOSE 8090

# Comando de inicio, IMPORTANTE renombrar el jar si tiene otro nombre ***
CMD ["java", "-jar", "backend-old.jar"]

# Imagen y Contenedor-------------------------------------------------
# Cambiar el nombre de la imagen y el puerto (si es necesario):
# 1.- docker build -t angelolm/backend-old .
# 2.- docker run -d --name contenedor -p 8090:8090 angelolm/backend-old



```
## 2️⃣ Estándar de Nombre de Imagen a DockerHub 🏷️
El estándar para nombrar nuestras imágenes es ```nombreDeUsuario/ms-nombreDeMicroservicio```. Aquí tienes algunos ejemplos:

- ```angelolm/ms-user```
- ```jhonnsotomayor/ms-role```
- ```alexito03/ms-platocarta```
- ```pedroluyo/ms-menurestaurant```
  
## 3️⃣ Puertos y Cambios 🚪
Para verificar si tu microservicio está funcionando correctamente, comparte la URL de tu servicio, por el momento se tienen las siguientes URLs que los compañeros han compartido:

```pedroluyo/ms-menurestaurant:```
```bash
http://localhost:8086/api/v1/products/obtener
```

```alexito03/ms-platocarta:```
```bash
http://localhost:9095/api/v1/presentacion/obtener/activo
```

>A los compañeros que falten pueden modificar este README y agregar sus rutas

## 4️⃣ Archivo YML Total 📁
Este es el archivo YAML completo que se esta usando en el PRS para su posterior despliegue de frontend y consumo de los microservicios:
```
# Frontend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: angelolm/unificado
        ports:
        - containerPort: 4200
        env:
        - name: BACKEND_URL
          value: "http://service-ms-platocarta:9095"  # URL del servicio backend usando el nombre del servicio
        - name: MENU_URL
          value: "http://service-ms-menurestaurant:8086"  # URL del servicio menu usando el nombre del servicio
---
# Frontend Service
apiVersion: v1
kind: Service
metadata:
  name: service-frontend
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 4200
      targetPort: 4200
      nodePort: 30000
  type: NodePort
---
# Backend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment-ms-platocarta
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: alexito03/ms-platocarta
        ports:
        - containerPort: 9095
---
# Backend Service
apiVersion: v1
kind: Service
metadata:
  name: service-ms-platocarta
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      name:service-ms-platocarta
      port: 9095
      targetPort: 9095
      nodePort: 30001  # NodePort para el backend
  type: NodePort
---
# Menu Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deployment-ms-menurestaurant
spec:
  replicas: 1
  selector:
    matchLabels:
      app: menu
  template:
    metadata:
      labels:
        app: menu
    spec:
      containers:
      - name: menu
        image: pedroluyo/ms-menurestaurant
        ports:
        - containerPort: 8086
---
# Menu Service
apiVersion: v1
kind: Service
metadata:
  name: service-ms-menurestaurant
spec:
  selector:
    app: menu
  ports:
    - protocol: TCP
      port: 8086
      targetPort: 8086
      nodePort: 30002  # NodePort para el menu
  type: NodePort
```

## 5️⃣ Salida de Kubernetes YML 📤
La salida de Kubernetes YML 📄 se refiere a cómo se configura la salida del balanceador de carga  y el puerto del nodo . 

En el ejemplo anterior, el servicio está configurado para usar el tipo NodePort , lo que significa que el servicio es accesible en el puerto especificado (30001) en todos los nodos del clúster 🌐.

Por ejemplo, tengo por el momento 2 imagenes de mis compañeros y sus enlaces🚏:

🔵```pedroluyo/ms-menurestaurant:``` [ir:🔗](http://localhost:30002/api/v1/products/obtener)
```bash
http://localhost:30002/api/v1/products/obtener
```

🔴```alexito03/ms-platocarta:``` [ir:🔗](http://localhost:30001/api/v1/presentacion/obtener/activo)
```bash
http://localhost:30001/api/v1/presentacion/obtener/activo
```
## 6️⃣ Conexión Localhost 🌐 (se explicará en DISCORD)
Para conectar a la aplicación desde localhost cuando se ejecuta en un contenedor Docker, puedes usar la dirección localhost seguida del puerto en el que se está ejecutando el servicio. Por ejemplo, si el servicio se está ejecutando en el puerto 30001, puedes acceder a él en http://localhost:30001.

>este readme aún está en mejora
