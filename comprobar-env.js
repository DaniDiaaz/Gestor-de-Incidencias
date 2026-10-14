// Cargamos las variables de entorno del archivo .env.
require('dotenv').config();

// Comprobamos si Node.js puede leer la variable JWT_SECRET. No mostramos su contenido
// por seguridad.
if (process.env.JWT_SECRET) {
    console.log('JWT_SECRET cargado correctamente');
} else {
    console.log('JWT_SECRET no está disponible');
}