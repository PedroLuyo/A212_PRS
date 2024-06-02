# ⚡️ Clonación y Sincronización del Repositorio

Para clonar el repositorio y asegurar que tu copia local esté sincronizada con el estado actual del repositorio en GitHub, sigue estos pasos:

### 🚀 Paso 1: Clonar el Repositorio

```sh
git clone -b frontend https://github.com/PedroLuyo/A212_PRS.git
```
# 🔄 Paso 2: Nos aseguramos de estar en la rama correcta
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
