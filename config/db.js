// Cargamos las variables de entorno definidas en el archivo .env
// Esto permite mantener las contraseñas y otros datos sensibles fuera del código.
require('dotenv').config();

// Importamos Pool desde el paquete "pg".
// Pool nos permite gestionar varias conexiones con PostgreSQL sin tener que abrir y cerrar una
// conexión manualmente para cada consulta.
const { Pool } = require('pg');

// Creamos un grupo de conexiones hacia nuestra base de datos PostgreSQL.
// Los valores se obtienen ahora desde las variables de entorno.
const pool = new Pool({
    // Servidor donde está ejecutándose PostgreSQL.
    host: process.env.DB_HOST,

    // Puerto por defecto de PostgreSQL.
    port: process.env.DB_PORT,

    // Usuario que usaremos para conectarnos a Postgre.
    user: process.env.DB_USER,

    // Contraseña
    password: process.env.DB_PASSWORD,

    // Base de datos que creamos para nuestro proyecto.
    database: process.env.DB_NAME
});

// Exportamos el pool para poder utilizarlo desde server.js y desde otros archivos del backend.
module.exports = pool;