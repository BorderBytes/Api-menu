# Requisitos previos

- Node.js
- MySQL

## Instalación en local

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/GabrielVall/API---News
   cd {nombre del proyecto}
   ```

2. **Instalación de dependencias**

   ```bash
   npm install
   ```

3. **Configuración del archivo `.env`**

   En la raíz del proyecto, crea un archivo llamado `.env`. Este archivo almacenará las variables de entorno necesarias para el proyecto.
   Luego, abre este archivo en tu editor de texto y añade las siguientes variables con sus respectivos valores:

   ```env
   DB_HOST=TuServidorMySQL
   DB_USER=TuUsuarioMySQL
   DB_PASSWORD=TuContraseñaMySQL
   DB_NAME=NombreDeTuBaseDeDatos
   ```

   Asegúrate de reemplazar `TuServidorMySQL`, `TuUsuarioMySQL`, `TuContraseñaMySQL`, y `NombreDeTuBaseDeDatos` con tus propios valores de configuración de MySQL.

4. **Ejecución en local**

   Con todo configurado, puedes iniciar el servidor con:

   ```bash
   npm start
   ```

   Una vez que el servidor esté corriendo, deberías ver un mensaje indicando que está corriendo en `http://localhost:3000`.

5. **Estructura del proyecto
```lua
📂 proyecto
│
│-- 📂 node_modules          # Módulos y paquetes de Node.js
│
│-- 📂 src                   # Código fuente principal
│   │
│   │-- 📂 config            # Configuraciones del proyecto
│   │
│   │-- 📂 models            # Modelos (para bases de datos, ORM, etc.)
│   │
│   │-- 📂 routes            # Rutas del proyecto
│   │
│   │-- 📂 controllers       # Controladores (lógica detrás de las rutas)
│   │
│   │-- 📂 middlewares       # Middlewares (autenticación, logs, etc.)
│   │
│   │-- 📂 public            # Archivos estáticos (CSS, JS, imágenes)
│   │
│   │-- 📂 views             # Vistas o plantillas (si se usará algún motor de vistas)
│   │
│   │-- 📂 utils             # Funciones de utilidad
│   │
│   │-- 📂 services          # Servicios (lógica de negocio, API externas)
│   │
│   │-- 📂 tests             # Pruebas
│   │
│   └─ app.js               # Archivo principal de la aplicación
│
│-- 📂 logs                  # Archivos de logs
│
│-- package.json             # Metadatos del proyecto, scripts, dependencias
│
│-- package-lock.json        # Versiones exactas de las dependencias
│
│-- .gitignore               # Archivos/directorios ignorados por Git
│
│-- .env                     # Variables de entorno (¡no subir al control de versiones!)
│
└─ README.md                 # Documentación del proyecto
```
---
