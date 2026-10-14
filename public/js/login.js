// Mensaje de prueba para comprobar que el navegador
// está ejecutando este archivo JavaScript.
console.log('login.js se ha cargado correctamente');


// Obtenemos el formulario de login que hemos creado en index.html.
// document.getElementById() busca un elemento HTML utilizando el valor de su atributo "id".
const loginForm = document.getElementById('loginForm');

// Comprobamos qué elemento HTML hemos encontrado.
// Debería aparecer el elemento <form id="loginForm">.
console.log('Formulario encontrado:', loginForm);

// Obtenemos también el elemento donde mostraremos los mensajes al usuario.
const mensaje = document.getElementById('mensaje');

// Escuchamos el elemento "submit" del formulario.
loginForm.addEventListener('submit', async (event) => {

    // Comprobamos que el evento submit realmente está entrando
    // en nuestro código JavaScript.
    console.log('Evento submit detectado');

    // Por defecto, cuando se envía un formulario HTML, el navegador recarga la página. Esto es
    // para evitarlo.
    event.preventDefault();

    // Obtenemos el valor introducido en el campo email y password.
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Mostramos temporalmente un mensaje para saber que hemos recibido el formulario.
    mensaje.textContent = 'Comprobando credenciales...';

    try {
        console.log('Voy a enviar la petición de login al servidor');
        // Realizamos una petición HTTP POST a nuestro backend. POST http://localhost:3000/api/login
        const respuesta = await fetch('/api/login', {
            // Indicamos que utilizamos el método POST.
            method: 'POST',

            // Indicamos al servidor que estamos enviando información en formato JSON.
            headers: {
                'Content-Type': 'application/json'
            },

            // Convertimos nuestro objeto JS a JSON.
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Mostramos en la consola el código HTTP devuelto.
        console.log('Código HTTP:', respuesta.status);

        // Convertimos la respuesta del servidor en JSON a un objeto JS.
        const datos = await respuesta.json();

        // Comprobamos si el servidor ha respondido correctamente.
        if (respuesta.ok) {
            // Mostramos el mensaje que nos devuelve nuestro backend.
            mensaje.textContent = datos.mensaje;

            // Guardamos el token en el navegador.
            localStorage.setItem('token', datos.token);

            // También guardamos los datos básicos del usuario.
            localStorage.setItem('usuario', JSON.stringify(datos.usuario));

            // Mostramos por consola los datos del usuario.
            console.log('Usuario autenticado:', datos.usuario);

            // Mostramos también el token en la consola únicamente durante nuestras pruebas.
            console.log('Token recibido:', datos.token);

            // Comprobamos que realmente hemos guardado el token.
            console.log('Token guardado:', localStorage.getItem('token'));

            // Cuando el login es correcto, vamos al panel principal.
            window.location.href = '/dashboard.html';
        } else {
            // Si el backend devuelve un error, mostramos el mensaje recibido.
            mensaje.textContent = datos.error;
        }
    } catch (error) {
        // Si ocurre un problema con la conexión del servidor, llegaremos aquí.
        console.error('Error al realizar el login', error);
        mensaje.textContent = 'No se pudo conectar con el servidor.';
    }
});

// =========================================
// RECUPERACIÓN DE CONTRASEÑA
// =========================================

// Enlace "He olvidado mi contraseña".
const enlaceRecuperarPassword = document.getElementById('enlaceRecuperarPassword');

// Contenedor del formulario de recuperación.
const recuperarPassword = document.getElementById('recuperarPassword');

// Enlace para volver al login.
const volverLogin = document.getElementById('volverLogin');

// Cuando pulsamos "He olvidado mi contraseña".
enlaceRecuperarPassword.addEventListener('click', (event) => {
    // Evitamos que el navegador siga el enlace "#".
    event.preventDefault();

    // Ocultamos el formulario de login.
    loginForm.style.display = 'none';

    // Ocultamos el enlace de recuperación.
    enlaceRecuperarPassword.style.display = 'none';

    // Mostramos el formulario de recuperación.
    recuperarPassword.style.display = 'block';

});

// Cuando pulsamos "Volver al inicio de sesión"
volverLogin.addEventListener('click', (event) => {
    // Evitamos que el navegador siga el enlace "#".
    event.preventDefault();

    // Mostramos nuevamente el login.
    loginForm.style.display = 'block';

    // Volvemos a mostrar el enlace de recuperación.
    enlaceRecuperarPassword.style.display = 'block';

    // Ocultamos el formulario de recuperación.
    recuperarPassword.style.display = 'none';
});

// Enviar solicitud de recuperación.

// Obtenemos el formulario de recuperación.
const formRecuperarPassword = document.getElementById('formRecuperarPassword');

// Campo donde el usuario escriba su email.
const emailRecuperacion = document.getElementById('emailRecuperacion');

// Zona donde mostraremos el resultado.
const mensajeRecuperacion = document.getElementById('mensajeRecuperacion');

// Escuchamos el envío del formulario.
formRecuperarPassword.addEventListener('submit', async (event) => {
    // Evitamos que el navegador recargue la página.
    event.preventDefault();

    // Obtenemos el email y eliminamos espacios sobrantes.
    const email = emailRecuperacion.value.trim();

    // Mostramos un mensaje mientras procesamos la solicitud.
    mensajeRecuperacion.textContent = 'Procesando solicitud...';

    try {
        // Enviamos email al backend.
        const respuesta = await fetch('/api/recuperar-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        // Leemos la respuesta del servidor.
        const datos = await respuesta.json();
        console.log('ESTOY AQUÍ: respuesta recibida.');
        console.log('Datos recibidos:', datos);

        // Si el servidor devuelve un error, lo mostramos.
        if (!respuesta.ok) {
            mensajeRecuperacion.textContent = datos.error || 'No se ha podido procesar la solicitud.';
            mensajeRecuperacion.style.display = 'block';

            return;
        }

        // Mostramos la respuesta del servidor.
        mensajeRecuperacion.textContent = datos.mensaje || 'Solicitud procesada correctamente.';
        mensajeRecuperacion.style.display = 'block';

        // De momento, mostramos el token para hacer pruebas.
        console.log('Token de recuperación:', datos.token);

        // Mostramos el formulario para introducir el token y la nueva contraseña.
        document.getElementById('recuperarPassword').style.display = 'none';
        document.getElementById('nuevaPassword').style.display = 'block';
        console.log('Formulario de nueva contraseña:', document.getElementById('nuevaPassword'));

        // Ocultamos el enlace para evitar otra recuperación.
        document.getElementById('enlaceRecuperarPassword').style.display = 'none';

        // Copiamos el token generado al campo del formulario. Esto facilita las pruebas mientras
        // todavía ni enviamos emails.
        document.getElementById('tokenRecuperacion').value = datos.token;
    } catch (error) {
        // Informamos si no se puede contactar con el servidor.
        console.error('Error al recuperar contraseña:', error);
        mensajeRecuperacion.textContent = 'No se ha podido conectar con el servidor.';
    }
});

// Cambiar contraseña.

// Obtebnemos el formulario y sus campos.
const formNuevaPassword = document.getElementById('formNuevaPassword');
const tokenRecuperacion = document.getElementById('tokenRecuperacion');
const passwordNueva = document.getElementById('passwordNueva');
const mensajeNuevoPassword = document.getElementById('mensajeNuevoPassword');
const nuevaPassword = document.getElementById('nuevaPassword');

// Escuchamos el envío del formulario.
formNuevaPassword.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtenemos los valores introducidos.
    const token = tokenRecuperacion.value.trim();
    const password = passwordNueva.value;

    // Informamos al usuario de que estamos procesando la solicitud.
    mensajeNuevoPassword.textContent = 'Cambiando contraseña...';

    try {
        const respuesta = await fetch('/api/cambiar-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, password })
        });

        const datos = await respuesta.json();

        // Si el servidor devuelve un error, lo mostramos.
        if (!respuesta.ok) {
            mensajeNuevoPassword.textContent = datos.error || 'No se ha podido cambiar la contraseña';
            return;
        }

        // Mostramos el resultado de la operación.
        mensajeNuevoPassword.textContent = datos.mensaje;

        // Limpiamos los campos tras completar el cambio.
        formNuevaPassword.reset();
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        mensajeNuevoPassword.textContent = 'No se ha podido conectar con el servidor.';
    }
});
