# Gestor de incidencias

Aplicación web para gestionar incidencias, desarrollada como proyecto de aprendizaje con Node.js, Express y PostgreSQL.

## Funcionalidades

- Inicio de sesión con autenticación mediante JWT.
- Gestión de incidencias: crear, consultar, editar y eliminar.
- Búsqueda de incidencias por título.
- Filtrado por prioridad: baja, media y alta.
- Panel con estadísticas y gráfico de prioridades.
- Control de permisos para determinadas operaciones.
- Cifrado hash de contraseñas con bcrypt.
- Recuperación de contraseña mediante tokens.
- Interfaz web con HTML, CSS y JavaScript.

## Tecnologías utilizadas

- **Backend:** Node.js y Express.
- **Base de datos:** PostgreSQL.
- **Conexión a la base de datos:** pg.
- **Autenticación:** JSON Web Token (jsonwebtoken).
- **Contraseñas:** bcrypt.
- **Configuración:** dotenv.
- **Frontend:** HTML, CSS y JavaScript.

## Requisitos previos

Antes de ejecutar el proyecto, necesitas tener instalado:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

## Instalación

1. Clona el repositorio:

   ```bash
   git clone URL_DE_TU_REPOSITORIO
   ```

2. Entra en la carpeta del proyecto:

   ```bash
   cd gestor-incidencias
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias.

   Ejemplo orientativo:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gestor_incidencias
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   JWT_SECRET=una_clave_secreta_larga_y_aleatoria
   ```

   **Importante:** los nombres de las variables deben coincidir con los que utiliza el código. Consulta `config/db.js` y `server.js` antes de configurar este archivo. No publiques tus credenciales ni el archivo `.env`.

5. Crea en PostgreSQL la base de datos y las tablas que necesita la aplicación.

   Los nombres de las tablas y sus columnas deben coincidir con las consultas SQL del proyecto.

## Ejecución

Inicia el servidor:

```bash
npm start
```

Abre la aplicación en el navegador:

http://localhost:3000

## Estructura del proyecto

```text
gestor-incidencias/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── public/
│   ├── css/
│   ├── js/
│   ├── dashboard.html
│   └── index.html
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

El archivo `.env` es local y no debe subirse al repositorio.

## Seguridad

- Las contraseñas se almacenan mediante hash con bcrypt.
- La autenticación utiliza tokens JWT.
- Las credenciales y las claves secretas deben configurarse mediante variables de entorno.
- Los tokens de recuperación deben tratarse como información sensible.

## Autor

Proyecto personal desarrollado con fines de aprendizaje y práctica de desarrollo web.

