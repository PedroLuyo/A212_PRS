<!-- Creditos: AngeloLaMadrid -->
<h1 align="center">GastroConnect</h1>

![loog-og](https://github.com/PedroLuyo/A212_PRS/assets/101282128/5be25cc7-dfda-4519-9c6b-128976850d28)
# ⚡️ Clonación y Sincronización del Repositorio

Para clonar el repositorio y asegurar que tu copia local esté sincronizada con el estado actual del repositorio en GitHub, sigue estos pasos:

## Ejecución rápida con un solo comando! 🚀

¿Quieres arrancar rápido con el proyecto? ¡Chévere! Este comando hace el trabajo pesado por ti:

```bash
git clone -b frontend https://github.com/PedroLuyo/A212_PRS.git && cd A212_PRS && npm install && npm install -g @angular/cli && ng serve --open

```
> **Fix:** Comando corregido para ejecutar en `Codespace`:

Este comando realiza tres acciones importantes: clona el repositorio, instala las dependencias necesarias y posteriormente inicia el servidor de desarrollo de Angular. Todo esto en un único paso, lo que nos permite comenzar a trabajar de manera rápida y eficiente. 🔥

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
