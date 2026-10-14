// Importamos jsonwebtoken. Lo utilizaremos para comprobar si el JWT recibido por el usuario
// es válido.
const jwt = require('jsonwebtoken');

// Creamos nuestro middleware de autenticación. Es una función que se ejecuta antes de llegar
// a la ruta final.
function autenticarToken(req, res, next) {
    // Obtenemos la cabecera Authentication de la petición.
    const authHeader = req.headers.authorization;

    // Comprobamos si existe la cabecera y si empieza por "Bearer".
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Si no existe el token, rechazamos la petición.
        return res.status(401).json({
            error: 'Token requerido'
        });
    }

    // Extraemos solamente el JWT. [1] obtiene solamente el token.
    const token = authHeader.split(' ')[1];

    try {
        // Comprobamos el JWT utilizando el mismo secreto con el que lo generamos.
        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guardamos la información del usuario dentro de req.usuario. Así las rutas posteriores
        // podrán saber qué usuario está realizando la petición.
        req.usuario = usuario;

        // Continuamos con la siguiente función.
        next();
    } catch (error) {
        // Si el token es inválido o ha caducado, rechazamos la petición.
        return res.status(401).json({
            error: 'Token inválido o expirado'
        });
    }
}

// Exportamos nuestro middleware para poder utilizarlo desde server.js.
module.exports = autenticarToken;