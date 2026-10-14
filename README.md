# Gestor de incidencias

🚧 **Estado del proyecto: En construcción**

Aplicación web para la gestión de incidencias, desarrollada como proyecto de aprendizaje con el objetivo de practicar el desarrollo backend, la gestión de bases de datos y la creación de interfaces web.

El proyecto se encuentra en desarrollo y se irán incorporando nuevas funcionalidades y mejoras progresivamente.

## ✨ Funcionalidades

- **Autenticación de usuarios:** inicio de sesión y gestión de sesiones mediante JSON Web Tokens (JWT).
- **Gestión de incidencias:** creación, consulta, modificación y eliminación de incidencias (CRUD).
- **Búsqueda de incidencias:** localización de incidencias mediante criterios de búsqueda.
- **Gestión de contraseñas:** almacenamiento seguro de contraseñas mediante hash y recuperación de contraseñas mediante tokens temporales.
- **Base de datos relacional:** almacenamiento de usuarios e incidencias en PostgreSQL.
- **Interfaz web:** páginas de inicio de sesión y panel de gestión con HTML, CSS y JavaScript.

## 🛠️ Tecnologías utilizadas

### Backend
- **Node.js:** entorno de ejecución de JavaScript.
- **Express.js:** framework para crear el servidor web y la API REST.
- **PostgreSQL:** sistema de gestión de bases de datos relacionales.
- **node-postgres (`pg`):** conexión e interacción con PostgreSQL.
- **bcrypt:** hash de contraseñas.
- **jsonwebtoken (`JWT`):** generación y verificación de tokens de autenticación.
- **dotenv:** gestión de variables de entorno.

### Frontend
- **HTML5:** estructura de las páginas.
- **CSS3:** diseño y estilos de la interfaz.
- **JavaScript:** interactividad y comunicación con el backend mediante `fetch`.

### Herramientas
- **Git y GitHub:** control de versiones y alojamiento del código.
- **Visual Studio Code:** entorno de desarrollo.

## 📋 Requisitos

Para ejecutar el proyecto en local necesitas:

- Node.js y npm.
- PostgreSQL.
- Git, si quieres clonar el repositorio.

## 🚀 Instalación y ejecución

1. Clona el repositorio:

   ```bash
   git clone URL_DE_TU_REPOSITORIO
   ```

2. Accede a la carpeta del proyecto:

   ```bash
   cd gestor-incidencias
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Configura las variables de entorno en un archivo `.env`, siguiendo la configuración que utiliza el proyecto.

5. Crea y configura la base de datos PostgreSQL con las tablas necesarias para la aplicación.

6. Inicia el servidor:

   ```bash
   node server.js
   ```

7. Abre en el navegador:

   `http://localhost:3000`

## 🔐 Seguridad

- Las contraseñas de los usuarios se almacenan mediante hash con bcrypt.
- La autenticación utiliza JWT.
- Las consultas a PostgreSQL utilizan parámetros para reducir el riesgo de inyección SQL.
- La configuración sensible debe mantenerse en variables de entorno.

**Importante:** no publiques el archivo `.env`, contraseñas, tokens, claves JWT ni otros datos sensibles. La recuperación de contraseña está en desarrollo y debe configurarse con un sistema de envío de correo electrónico antes de considerarse lista para producción.

## 🗺️ Próximas mejoras

- Dashboard con estadísticas y gráficos.
- Gestión de estados de las incidencias.
- Roles y permisos de usuarios.
- Historial de cambios y comentarios.
- Mejoras visuales y adaptación a dispositivos móviles.
- Finalización y refuerzo de la recuperación de contraseñas.

## 📚 Objetivo del proyecto

Este proyecto forma parte de mi aprendizaje en desarrollo web y tiene como objetivo mejorar mis conocimientos de JavaScript, Node.js, Express, PostgreSQL, autenticación y desarrollo de API REST.

## 📌 Estado

🚧 **En construcción.** El proyecto está en evolución y se actualizará a medida que se implementen y prueben nuevas funcionalidades.

