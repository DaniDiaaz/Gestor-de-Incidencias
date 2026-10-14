// Importamos Express para poder crear nuestro servidor HTTP.
const express = require('express');

// Importamos el pool de conexiones a PostgreSQL. Lo utilizaremos para ejecutar consultas
// contra nuestra base de datos.
const pool = require('./config/db');

// Importamos bcrypt para comprobar la contraseña introducida por el usuario contra
// el hash almacenado en PostgreSQL.
const bcrypt = require('bcrypt');

// Importamos jsonwebtoken para generar un token JWT después de autenticar correctamente
// al usuario.
const jwt = require('jsonwebtoken');

// Importamos el middleware encargado de comprobar si el usuario tiene un JWT válido.
const autenticarToken = require('./middleware/auth');

const crypto = require('crypto');
const { error } = require('console');

// Creamos una instancia de la aplicación Express.
// Esta variable será nuestro servidor.
const app = express();

// Permitimos que Express interprete automáticamente los cuerpos de las peticiones que vienen
// en formato JSON.
app.use(express.json());

// Indicamos a Express que la carpeta "public" contiene los archivos que puede mostrar
// directamente al navegador.
// Por ejemplo: public/index.html, se podrá abrir desde: http://localhost:3000/.
app.use(express.static('public'));

// Definimos el puerto en el que escuchará nuestro servidor.
// El puerto 3000 es muy común para aplicaciones Node.js.
const PORT = 3000;

// Creamos nuestra primera ruta.
// Cuando alguien haga una petición GET a "/", ejecutaremos esta función.
app.get('/', (req, res) => {
    // Enviamos una respuesta de texto al servidor
    res.send('¡Servidor funcionando!');
});

// Creamos un endpoint de nuestra API.
// Cuando alguien haga una petición GET a "/api/saludo", devolveremos información en formato JSON.
app.get('/api/saludo', (req, res) => {
    // Enviamos un objeto JS.
    // Express lo convierte automáticamente a JSON.
    res.json({
        mensaje: 'Hola desde nuestra API',
        proyecto: 'Gestor de incidencias'
    });
});

// Creamos una ruta que recibe un nombre directamente desde la URL.
// El ":nombre" indica que esa parte de la URL será un parámetro dinámico.
app.get('/api/saludo/:nombre', (req, res) => {
    // Obtenemos el valor del parámetro "nombre" que viene en la URL.
    const nombre = req.params.nombre;

    // Devolvemos el nombre dentro de una respuesta JSON.
    res.json({
        mensaje: `Hola ${nombre}`
    });
});

// Creamos un endpoint POST para recibir una nueva incidencia. Los datos enviados por el cliente
// estarán disponibles en req.body.
app.post('/api/incidencias', autenticarToken, async (req, res) => {
    // Extraemos los datos que nos ha enviado el cliente.
    const { titulo, prioridad } = req.body;

    // Obtenemos el ID del usuario. Nuestro middleware ha verificado el JWT y ha guardado
    // la información del usuario dentro de req.usuario.
    const usuarioId = req.usuario.id;

    // Comprobamos que el título y la prioridad existen. Si falta alguno, rechazamos la petición.
    if (!titulo || !prioridad) {
        return res.status(400).json({
            error: 'El título y la prioridad son obligatorios'
        });
    }

    // Comprobamos que el título no está solo compuesto por espacios.
    if (titulo.trim() === '') {
        return res.status(400).json({
            error: 'El título no puede estar vacío'
        });
    }

    // Comprobamos que el título no sea demasiado largo.
    if (titulo.length > 100) {
        return res.status(400).json({
            error: 'El título no puede superar los 100 caracteres'
        });
    }

    // Comprobamos que la prioridad sea una de las permitidas.
    const prioridadesPermitidas = [
        'baja',
        'media',
        'alta'
    ];

    if (!prioridadesPermitidas.includes(prioridad)) {
        return res.status(400).json({
            error: 'La prioridad debe ser baja, media o alta'
        });
    }

    try {
        // Insertamos la nueva incidencia directamente en PostgreSQL.
        // RETURNING * hace que PostgreSQL nos devuelva la fila que acaba de crear.
        const resultado = await pool.query(
            `
            INSERT INTO incidencias (titulo, prioridad, usuario_id)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [titulo, prioridad, usuarioId]
        );

        // Obtenemos la incidencia recién creada
        // PostgreSQL ya se encarga de generar su ID automáticamente.
        const incidencia = resultado.rows[0];

        // Indicamos que la incidencia se ha creado correctamente y devolvemos los datos
        // guardados en PostgreSQL.
        res.status(201).json({
            mensaje: 'Incidencia creada correctamente',
            incidencia
        });
    } catch (error) {
        // Si PostgreSQL devuelve algún error, lo mostramos en la consola y enviamos
        // una respuesta de error al cliente.
        console.error('Error al crear la incidencia:', error.message);

        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
  
});

// Creamos un endpoint GET para consultar una incidencia concreta mediante su ID.
// Ahora la búsqueda se realiza directamente en PostgreSQL.
app.get('/api/incidencias/:id', async (req, res) => {
    // Obtenemos el ID recibido en la URL.
    // Los parámetros de Express llegan inicialmente como texto.
    const id = Number(req.params.id);

    // Comprobamos que el ID recibido sea realmente un número.
    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número'
        });
    }

    try {
        // Buscamos en PostgreSQL la incidencia cuyo ID coincida.
        // $1 es un parámetro seguro que sustituimos por el valor de "id".
        const resultado = await pool.query(
            'SELECT * FROM incidencias WHERE id = $1',
            [id]
        );

        // Si PostgreSQL no devuelve ninguna fila, la incidencia no existe.
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                error: 'Incidencia no encontrada'
            });
        }

        // Devolvemos la incidencia encontrada.
        res.json(resultado.rows[0]);
    } catch (error) {
        // Mostramos el error en la consola para facilitar la depuración.
        console.error('Error al obtener la incidencia:', error.message);

        // Informamos al cliente de que ha ocurrido un error interno.
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }

});

// Creamos un endpoint PUT para modificar una incidencia existente. El ":id" indica que
// incidencia queremos modificar.
app.put('/api/incidencias/:id', autenticarToken, async (req, res) => {
    // Convertimos el ID recibido en la URL de texto a número.
    const id = Number(req.params.id);

    // Comprobamos que el ID recibido es un número.
    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número'
        });
    }

    // Extraemos los nuevos datos enviados por el cliente.
    const { titulo, prioridad } = req.body;

    // Comprobamos que se hayan enviado los datos obligatorios.
    if (!titulo || !prioridad) {
        return res.status(400).json({
            error: 'El título y la prioridad son obligatorios'
        });
    }

    // Comprobamos que el título no esté formado únicamente por espacios.
    if (titulo.trim() === '') {
        return res.status(400).json({
            error: 'El título no puede estar vacío'
        });
    }

    if (titulo.length > 100) {
        return res.status(400).json({
            error: 'El título no puede superar los 100 caracteres'
        });
    }

    // Definimos las únicas prioridades que permitimos.
    const prioridadesPermitidas = [
        'baja',
        'media',
        'alta'
    ];

    // Comprobamos que la prioridad recibida sea válida.
    if (!prioridadesPermitidas.includes(prioridad)) {
        return res.status(400).json({
            error: 'La prioridad debe ser baja, media o alta'
        });
    }

    // Obtenemos los datos del usuario autenticado.
    const usuarioId = req.usuario.id;
    const rol = req.usuario.rol;

    try {
        // Primero buscamos la incidencia que queremos editar.
        const resultado = await pool.query(
            `
            SELECT *
            FROM incidencias
            WHERE id = $1
            `,
            [id]
        );

        // Comprobamos que la incidencia existe.
        if (resultado.rows.length === 0) {
            return res.status(400).json({
                error: 'Incidencia no encontrada'
            });
        }

        // Guardamos la incidencia encontrada.
        const incidencia = resultado.rows[0];

        // Si el usuario no es ADMIN, comprobamos que la incidencia sea suya.
        if (rol !== 'admin' && incidencia.usuario.id !== usuarioId) {
            return res.status(403).json({
                error: 'No tienes permiso para editar esta incidencia'
            });
        }

        // Si llegamos aquí, el usuario tiene permiso para editarla.
        const actualizada = await pool.query(
            `
            UPDATE incidencias
            SET titulo = $1,
                prioridad = $2
            WHERE id = $3
            RETURNING *
            `,
            [titulo, prioridad, id]
        );

        // Obtenemos la incidencia actualizada.
        const incidenciaActualizada = actualizada.rows[0];

        // Devolvemos la incidencia actualizada.
        res.json({
            mensaje: 'Incidencia actualizada correctamente',
            incidencia: incidenciaActualizada
        });
    } catch (error) {
        // Mostramos el error en la consola para facilitar la depuración.
        console.error('Error al actualizar la incidencia', error.message);

        // Informamos al cliente de que ha ocurrido un error interno.
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Creamos un endpoint DELETE para eliminar una incidencia existente. El ":id" indica que
// incidencia queremos eliminar.
app.delete('/api/incidencias/:id', autenticarToken, async (req, res) => {
    // Convertimos el ID recibido en la URL de texto a número.
    const id = Number(req.params.id);

    // Comprobamos que el ID es realmente un número.
    if (Number.isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número'
        });
    }

    // Obtenemos los datos del usuario que están dentro del JWT.
    const usuarioId = req.usuario.id;
    const rol = req.usuario.rol;

    try {
        // Primero buscamos la incidencia que queremos eliminar.
        const resultado = await pool.query(
            `
            SELECT * FROM incidencias
            WHERE id = $1
            `,
            [id]
        );

        // Si PostgreSQL no ha eliminado ninguna fila, significa que no existe una
        // incidencia con ese ID.
        if (resultado.rows.length === 0) {
            return res.status(400).json({
                error: 'Incidencia no encontrada'
            });
        }

        // Guardamos la incidencia encontrada.
        const incidencia = resultado.rows[0];

        // Si el usuario no es ADMIN, comprobamos que la incidencia sea suya.
        if (rol !== 'admin' && incidencia.usuario.id !== usuarioId) {
            return res.status(403).json({
                error: 'No tienes permiso para eliminar esta incidencia'
            });
        }

        // Si llegamos aquí significa que el usuario tiene permisos.
        const eliminada = await pool.query(
            `
            DELETE FROM incidencias
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        // Recuperamos la incidencia eliminada.
        const incidenciaEliminada = eliminada.rows[0];

        // Respondemos al navegador.
        res.json({
            mensaje: 'Incidencia eliminada correctamemte',
            incidencia: incidenciaEliminada
        });
    } catch (error) {
        // Mostramos el error en la consola para facilitar la depuración.
        console.error('Error al eliminar la incidencia', error.message);

        // Informamos al cliente de que ha ocurrido un error interno.
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Creamos un endpoint GET para consultar todas las incidencias almacenadas.
// Ahora los datos se obtienen directamente desde PostgreSQL.
app.get('/api/incidencias', autenticarToken, async (req, res) => {
    try {
        // Ejecutamos una consulta SQL para obtener todas las incidencias.
        // ORDER BY id ASC hace que aparezcan ordenadas de la más antigua a la más reciente.
        const resultado = await pool.query(
            'SELECT * FROM incidencias ORDER BY id ASC'
        );

        // Devolvemos las filas obtenidas desde PostgreSQL en formato JSON.
        res.json(resultado.rows);
    } catch (error) {
        // Mostramos el error en la consola para poder localizar el problema.
        console.error('Error al obtener las incidencias:', error.message);

        // Informamos al cliente de que ha ocurrido un error interno.
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Creamos el endpoint POST /api/login. Este endpoint recibirá el email y la contraseña
// del usuario.
app.post('/api/login', async (req, res) => {
    // Extraemos email y password del cuerpo de la petición.
    const { email, password } = req.body;

    // Comprobamos que el cliente haya enviado los datos.
    if (!email || !password) {
        return res.status(400).json({
            error: 'El email y la contraseña son obligatorios'
        });
    }

    try {
        // Buscamos en PostgreSQL el usuario cuyo email coincida. $1 permite utilizar
        // una consulta parametrizada y evita introducir directamente el valor recibido
        // en el SQL.
        const resultado = await pool.query(
            `
            SELECT id, nombre, email, rol, password_hash
            FROM usuarios
            WHERE email = $1
            `,
            [email]
        );

        // Si no existe ningún usuario con ese email, rechazamos el inicio de sesión.
        if (resultado.rows.length === 0) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }

        // Obtenemos los datos del usuario encontrado
        const usuario = resultado.rows[0];

        // Comparamos la contraseña introducida con el hash almacenado en PostgreSQL.
        const coincide = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        // Si la contraseña no coincide, rechazamos el acceso.
        if (!coincide) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }

        // Creamos la información que queremos guardar dentro del JWT. No incluimos nunca
        // la contraseña ni su hash.
        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        // Firmamos el token utilizando la clave secreta almacenada en la variable
        // de entorno JWT_SECRET.
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                // El token será válido durante 1 hora.
                expiresIn: '1h'
            }
        );

        // Devolvemos el token y algunos datos públicos del usuario.
        res.json({
            mensaje: 'Login correcto',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        // Mostramos el error real en el servidor para poder depurarlo.
        console.error('Error durante el login', error.message);

        // Al cliente le devolvemos simplemente un mensaje genérico.
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Recuperar contraseña

app.post('/api/recuperar-password', async (req, res) => {

    console.log('Se ha recibido una solicitud de recuperación.');
    // Obtenemos el email enviado desde el formulario.
    const { email } = req.body;

    // Comprobamos que se haya enviado el email.
    if (!email) {
        return res.status(400).json({
            error: 'El email es obligatorio'
        });
    }

    try {
        // Buscamos al usuario por su email.
        const resultado = await pool.query(
            `
            SELECT id, nombre, email
            FROM usuarios
            WHERE email = $1
            `,
            [email]
        );

        // Si no existe ningún usuario con ese email, devolvemos un error por ahora.
        if (resultado.rows.length === 0) {
            return res.status(400).json({
                error: 'No existe ningún usuario con ese email'
            });
        }

        // Obtenemos los datos del usuario.
        const usuario = resultado.rows[0];

        // Generamos un token aleatorio difícil de adivinar.
        const token = crypto.randomBytes(32).toString('hex');

        // Calculamos el hash del token para no guardar el token original.
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Establecemos una caducidad de 15 min.
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

        // Guardamos el hash asociado al usuario en Postgre.
        await pool.query(
            `
            INSERT INTO tokens_recuperacion (
                usuario_id,
                token_hash,
                fecha_expiracion
            )
            VALUES ($1, $2, $3)
            `,
            [usuario.id, tokenHash, fechaExpiracion]
        );

        // Mostramos información para comprobar el funcionamiento.
        console.log('Solicitud de recuperación creada para:', usuario.email);

        // De momento solo guardamos el token, más adelante lo guardaremos
        // en la base de datos junto con una fecha de expiracuón.
        return res.json({
            mensaje: 'Solicitud de recuperación recibida',
            token: token
        });
    } catch (error) {
        console.error(
            'Error al solicitar recuperación:', error
        );

        return res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Ruta para cambiar la contraseña mediante un token de recuperación.
app.post('/api/cambiar-password', async (req, res) => {
    // Recibimos el token y la nueva contraseña del formulario.
    const { token, password } = req.body;

    // Comprobamos que se hayan enviado ambos datos.
    if (!token || !password) {
        return res.status(400).json({
            error: 'El token y la nueva contraseña son obligatorios.'
        });
    }

    // Exigimos una longitud mínima para la nueva contraseña.
    if (password.length < 8) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres.'
        });
    }

    // Calculamos el hash del token para buscarlo en Postgre.
    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    
    // Preparamos una conexión para realizar la conexión completa.
    const client = await pool.connect();

    try {
        // Iniciamos una transacción para actualizar los datos de forma segura.
        await client.query('BEGIN');

        // Buscamos el token y bloqueamos su fila para evitar usos simultáneos.
        const resultado = await client.query(
            `
            SELECT id, usuario_id
            FROM tokens_recuperacion
            WHERE token_hash = $1
              AND fecha_expiracion > CURRENT_TIMESTAMP
              AND utilizado = FALSE
            FOR UPDATE
            `,
            [tokenHash]
        );

        // Si el token no existe, ha caducado o ya se utilizó, no continuamos.
        if (resultado.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                error: 'El token no es válido, ha caducado o ya se ha utilizado.'
            });
        }

        // Obtenemos el usuario asociado al token.
        const usuarioId = resultado.rows[0].usuario_id;
        const tokenId = resultado.rows[0].id;

        // Generamos un hash seguro de la nueva contraseña con bcrypt.
        const passwordHash = await bcrypt.hash(password, 10);

        // Actualizamos la contraseña del usuario.
        await client.query(
            `
            UPDATE usuarios
            SET password_hash = $1
            WHERE id = $2
            `,
            [passwordHash, usuarioId]
        );

        // Marcamos el token como utilizado para impedir que se reutilice.
        await client.query(
            `
            UPDATE tokens_recuperacion
            SET utilizado = TRUE
            WHERE id = $1
            `,
            [tokenId]
        );

        // Confirmamos los cambios en Postgre.
        await client.query('COMMIT');

        // Informamos de que la contraseña se ha cambiado correctamente.
        return res.json({
            mensaje: 'Contraseña actualizada correctamente. Ya puedes inciar sesión.'
        });
    } catch (error) {
        // Deshacemos los cambios si ocurre algún error.
        await client.query('ROLLBACK');
        console.error('Error al cambiar la contraseña:', error);
        return res.status(500).json({
            error: 'No se ha podido cambiar la contraseña.'
        });
    } finally {
        // Liberamos la conexión para que pueda volver a utilizarse.
        client.release();
    }
});

// Ponemos el servidor a escuchar peticiones en el puerto indicado.
app.listen(PORT, () => {
    // Este mensaje aparecerá en el terminal cuando el servidor arranque correctamente.
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

