// Recuperamos el token que guardamos cuando el usuario inició sesión correctamente.
const token = localStorage.getItem('token');

// Recuperamos los datos del usuaario.
const usuarioGuardado = localStorage.getItem('usuario');

// Guardaremos aquí todas las incidencias recibidas del servidor.
let incidenciasActuales = [];

// Comprobamos si existe un token y también datos del usuario guardado.
if (!token || !usuarioGuardado) {
    // Si no existen, significa que el usuario no ha iniciado sesión.
    // Lo enviamos de nuevo a la página del login.
    window.location.href = '/';
} else {
    // Convertimos el texto guardado en localStorage nuevamente en un objeto JS.
    const usuario = JSON.parse(usuarioGuardado);

    // Buscamos el elemento donde mostraremos el nombre.
    const bienvenida = document.getElementById('bienvenida');

    // Mostramos el nombre del usuario.
    bienvenida.textContent = `Bienvenido, ${usuario.nombre}`;
}

// Buscamos el botón de cerrar sesión.
const cerrarSesion = document.getElementById('cerrarSesion');

// Escuchamos el click del botón.
cerrarSesion.addEventListener('click', () => {
    // Eliminamos el token guardado.
    localStorage.removeItem('token');

    // Eliminamos los datos del usuario.
    localStorage.removeItem('usuario');

    // Volvemos a la pantalla de login.
    window.location.href = '/';
});

// ------------------------------------------------------------
// CARGAR INCIDENCIAS
// ------------------------------------------------------------

// Creamos una función asíncrona para obtener las incidencias desde nuestro backend.
async function cargarIncidencias() {

    try {

        // Recuperamos el JWT que guardamos cuando el usuario inició sesión.
        const token = localStorage.getItem('token');

        // Realizamos una petición GET a nuestra API.
        const respuesta = await fetch('/api/incidencias', {

            // Enviamos el JWT dentro de la cabecera Authorization.
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Convertimos la respuesta del servidor de JSON a un objeto JS.
        const incidencias = await respuesta.json();
        console.log('Incidencias recibidas:', incidencias);
        console.log('Primera incidencia:', incidencias[0]);
        console.log('Prioridad de la primera:', incidencias[0]?.prioridad);

        // Si el servidor responde con 401, significa que el token ha caducado o es inválido.
        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario')
            window.location.href = '/';

            return;
        }

        // Buscamos el elemento donde mostraremos el contador.
        const contadorIncidencias = document.getElementById('contadorIncidencias');

        // Mostramos el número total de incidencias.
        contadorIncidencias.textContent = `Incidencias: ${incidencias.length}`;

        // Contamos cuántas incidencias hay de cada prioridad.
        const contadorBaja = incidencias.filter(
            (incidencia) => incidencia.prioridad === 'baja'
        ).length;

        const contadorMedia = incidencias.filter(
            (incidencia) => incidencia.prioridad === 'media'
        ).length;

        const contadorAlta = incidencias.filter(
            (incidencia) => incidencia.prioridad === 'alta'
        ).length;

        // Mostramos los resultados en el HTML.
        document.getElementById('contadorBaja').textContent = `Baja: ${contadorBaja}`;
        document.getElementById('contadorMedia').textContent = `Media: ${contadorMedia}`;
        document.getElementById('contadorAlta').textContent = `Alta: ${contadorAlta}`;

        // Guardamos todas las incidencias recibidas.
        // Después podremos filtrarlas sin volver a consultar al servidor.
        incidenciasActuales = incidencias;

        // Actualizamos el gráfico con las incidencias recibidas del servidor.
        actualizarGraficoPrioridades(incidencias);

        // Buscamos el contenedor HTML donde mostraremos las incidencias.
        const listaIncidencias =
            document.getElementById('listaIncidencias');

        // Limpiamos el contenedor por si ya tenía información.
        listaIncidencias.innerHTML = '';

        // Recorremos todas las incidencias que nos ha enviado el backend.
        incidencias.forEach((incidencia) => {

            // Creamos un elemento div.
            const elemento = document.createElement('div');
            elemento.classList.add('tarjeta-incidencia');

            // Guardamos la prioridad de esta incidencia en el elemento HTML.
            // Después podremos utilizarla para aplicar el filtro.
            elemento.dataset.prioridad = incidencia.prioridad; 

            // Introducimos la información de la incidencia.
            elemento.innerHTML = `
                <h3>${incidencia.titulo}</h3>

                <p>
                    Prioridad:
                    <span class="etiqueta-prioridad prioridad-${incidencia.prioridad}">
                    ${incidencia.prioridad}
                    </span
                </p>

                <p>
                    Usuario ID:
                    ${incidencia.usuario_id}
                </p>

                <div class="acciones-incidencia">
                    <button class="btnEditar" data-id="${incidencia.id}">
                        Editar
                    </button>

                    <button class="btnEliminar" data-id="${incidencia.id}">
                        Eliminar
                    </button>
                </div>

            `;

            // Añadimos la incidencia al contenedor.
            listaIncidencias.appendChild(elemento);

            // Buscamos el botón Eliminar de esta incidencia.
            const botonEliminar =
                elemento.querySelector('.btnEliminar');
            console.log('Botón eliminar', botonEliminar);

            // Cuando se pulse, llamamos a eliminarIncidencia().
            botonEliminar.addEventListener('click', () => {
                eliminarIncidencia(incidencia.id);
            });

            // Buscamos el botón Editar de esta incidencia.
            const botonEditar =
                elemento.querySelector('.btnEditar');
            console.log('Botón editar', botonEditar);

            // Cuando se pulse el botón Editar...
            botonEditar.addEventListener('click', () => {

                // Sustituimos temporalmente el contenido
                // por un formulario de edición.
                elemento.innerHTML = `
                    <h3>Editar incidencia</h3>

                    <div>
                        <label for="tituloEditar-${incidencia.id}">
                            Título:
                        </label>

                        <input
                            type="text"
                            id="tituloEditar-${incidencia.id}"
                            value="${incidencia.titulo}"
                            maxlength="100"
                        >
                    </div>

                    <br>

                    <div>
                        <label for="prioridadEditar-${incidencia.id}">
                            Prioridad:
                        </label>

                        <select id="prioridadEditar-${incidencia.id}">

                            <option value="baja"
                                ${incidencia.prioridad === 'baja' ? 'selected' : ''}>
                                Baja
                            </option>

                            <option value="media"
                                ${incidencia.prioridad === 'media' ? 'selected' : ''}>
                                Media
                            </option>

                            <option value="alta"
                                ${incidencia.prioridad === 'alta' ? 'selected' : ''}>
                                Alta
                            </option>

                        </select>
                    </div>

                    <br>

                    <button class="btnGuardarEdicion btn-guardar">
                        Guardar
                    </button>

                    <button class="btnCancelarEdicion btn-cancelar">
                        Cancelar
                    </button>

                    <hr>
                `;

                // Buscamos el botón Guardar que acabamos de crear.
                const botonGuardar =
                    elemento.querySelector('.btnGuardarEdicion');

                // Buscamos el botón Cancelar.
                const botonCancelar =
                    elemento.querySelector('.btnCancelarEdicion');

                // Cuando se pulse Guardar...
                botonGuardar.addEventListener('click', () => {

                    // Recuperamos el nuevo título.
                    const nuevoTitulo =
                        elemento.querySelector(
                            `#tituloEditar-${incidencia.id}`
                        ).value;

                    // Recuperamos la nueva prioridad.
                    const nuevaPrioridad =
                        elemento.querySelector(
                            `#prioridadEditar-${incidencia.id}`
                        ).value;

                    // Llamamos a nuestra función de edición.
                    editarIncidencia(
                        incidencia.id,
                        nuevoTitulo,
                        nuevaPrioridad
                    );
                });

                // Si pulsamos Cancelar...
                botonCancelar.addEventListener('click', () => {

                    // Volvemos a cargar las incidencias originales.
                    cargarIncidencias();
                });
            });
        });

    } catch (error) {

        // Si ocurre un problema de conexión,
        // lo mostramos en la consola.
        console.error(
            'Error al cargar las incidencias',
            error
        );
    }
}


/**
 * Dibuja las barras horizontales con el número de incidencias
 * de cada prioridad.
 */
function actualizarGraficoPrioridades(incidencias) {

    // Buscamos el contenedor del gráfico.
    const contenedor = document.getElementById('graficoPrioridades');

    // Si no existe, no hacemos nada.
    if (!contenedor) {
        return;
    }

    // Definimos las prioridades que queremos representar.
    const prioridades = [
        { nombre: 'Alta', valor: 'alta', clase: 'barra-alta' },
        { nombre: 'Media', valor: 'media', clase: 'barra-media' },
        { nombre: 'Baja', valor: 'baja', clase: 'barra-baja' }
    ];

    // Contamos las incidencias de cada prioridad.
    const cantidades = prioridades.map(prioridad =>
        incidencias.filter(incidencia =>
            incidencia.prioridad?.toLowerCase() === prioridad.valor
        ).length
    );

    // Obtenemos la cantidad más alta.
    const cantidadMaxima = Math.max(...cantidades);

    // Si no hay incidencias, mostramos un mensaje.
    if (cantidadMaxima === 0) {
        contenedor.innerHTML = `
            <p class="grafico-vacio">
                Todavía no hay incidencias para mostrar.
            </p>
        `;
        return;
    }

    // Creamos las filas del gráfico.
    contenedor.innerHTML = prioridades.map((prioridad, indice) => {

        // Recuperamos la cantidad ya calculada para esta prioridad.
        const cantidad = cantidades[indice];

        // Calculamos el ancho de la barra respecto a la mayor.
        const porcentaje = (cantidad / cantidadMaxima) * 100;

        return `
            <div class="fila-grafico">

                <div class="info-grafico">
                    <span>${prioridad.nombre}</span>
                    <span class="valor-grafico">${cantidad}</span>
                </div>

                <div class="fondo-barra">
                    <div
                        class="barra-grafico ${prioridad.clase}"
                        style="width: ${porcentaje}%"
                    ></div>
                </div>

            </div>
        `;
    }).join('');
}


// Buscamos el selector de prioridad que hemos creado en dashboard.html.
const filtroPrioridad = document.getElementById('filtroPrioridad');

// Buscamos los elementos del filtro, el buscador y el contador.
const buscarIncidencia = document.getElementById('buscarIncidencia');
console.log('Campo de búsqueda:', buscarIncidencia);
const contadorResultados = document.getElementById('contadorResultados');

// Aplicamos conjuntamente la búsqueda y el filtro de prioridad.
function aplicarFiltros() {
    // Obtenemos la prioridad seleccionada.
    const prioridadSeleccionada = filtroPrioridad.value;

    // Obtenemos el texto escrito y lo convertimos a minúsculas.
    const textoBuscado = buscarIncidencia.value.trim().toLowerCase();
    console.log('Texto escrito:', textoBuscado);

    // Recuperamos todas las tarjetas de incidencias.
    const incidencias = document.querySelectorAll(
        '#listaIncidencias > .tarjeta-incidencia'
    );
    console.log('Tarjetas encontradas:', incidencias.length);
    console.log('Primera tarjeta:', incidencias[0]?.querySelector('h3')?.textContent);

    // Contamos las incidencias que quedan visibles.
    let incidenciasVisibles = 0;

    // Recorremos todas las tarjetas.
    incidencias.forEach((incidencia) => {
        // Obtenemos la prioridad guardada en la tarjeta.
        const prioridad = incidencia.dataset.prioridad;

        // Obtenemos el título de la incidencia.
        const elementoTitulo = incidencia.querySelector('h3');
        const titulo = elementoTitulo
            ? elementoTitulo.textContent.toLowerCase() : '';

        // Comprobamos si coincide con la prioridad seleccionada.
        const coincidePrioridad =
            prioridadSeleccionada === 'todas' ||
            prioridad === prioridadSeleccionada;

        // Comprobamos si coincide con el texto buscado.
        const coincideBusqueda = titulo.includes(textoBuscado);

        // Solo mostramos la tarjeta si cumple ambos criterios.
        if (coincidePrioridad && coincideBusqueda) {
            incidencia.style.display = '';
            incidenciasVisibles++;
        } else {
            incidencia.style.display = 'none';
        }
    });

    // Actualizamos el mensaje del contador.
    if (incidencias.length === 0) {
        contadorResultados.textContent = 'Todavía no hay incidencias registradas.';
    } else if (incidenciasVisibles === 0) {
        contadorResultados.textContent = 'No se encontraron incidencias con esos criterios.';
    } else {
        contadorResultados.textContent = `Mostrando ${incidenciasVisibles} de ${incidencias.length} incidencias`;
    }
}

// Actualizamos los resultados cuando cambia la prioridad.
filtroPrioridad.addEventListener('change', aplicarFiltros);

// Actualizamos los resultados cada vez que se escribe.
buscarIncidencia.addEventListener('input', aplicarFiltros);


// Función que elimina una incidencia.
async function eliminarIncidencia(id) {
    // Pedimos confirmación antes de eliminarla.
    const confirmar = confirm(
        '¿Seguro que quieres eliminar esta incidencia?'
    );

    // Si el usuario pulsa "cancelar", no hacemos nada.
    if (!confirmar) {
        return;
    }

    // Recuperamos el token JWT guardado en el navegador.
    const token = localStorage.getItem('token');

    try {
        // Enviamos la petición DELETE al servidor.
        const respuesta = await fetch(`/api/incidencias/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Convertimos la respuesta del servidor a JSON.
        const datos = await respuesta.json();

        // Si el servidor responde con 401, el token ya no es válido o ha caducado.
        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            alert(
                'Tu sesión ha caducado. Volviendo al login...'
            );
            
            window.location.href = '/';
            return;
        }
        // Si la eliminación ha sido correcta...
        if (respuesta.ok) {
            console.log(datos.mensaje);

            // Volvemos a cargar la lista de incidencias para que desparezca la eliminada.
            cargarIncidencias();
        } else {
            // Mostramos el error recibido del servidor.
            console.error(
                'No se pudo eliminar',
                datos.error
            );

            alert(datos.error);
        }
    } catch (error) {
        // Error de conexión con el servidor.
        console.error(
            'Error al eliminar la incidencia',
            error
        );

        alert(
            'No se pudo conectar con el servidor'
        );
    }
}

// Función para editar una incidencia.
async function editarIncidencia(id, titulo, prioridad) {
    // Recuperamos el token JWT.
    const token = localStorage.getItem('token');

    try {
        // Enviamos los nuevos datos al backend.
        const respuesta = await fetch(`/api/incidencias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                titulo: titulo,
                prioridad: prioridad
            })
        });

        // Convertimos la respuesta del servidor a JSON.
        const datos = await respuesta.json();

        // Si el servidor responde 401, el token ya no es válido o ha caducado.
        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            alert(
                'Tu sesión ha caducado. Volviendo al login...'
            );

            // Volvemos al login.
            window.location.href = '/';
            return;
        }
        // Si la edición ha sido correcta...
        if (respuesta.ok) {
            console.log(datos.mensaje);
            cargarIncidencias();
        } else {
            // Mostramos el error enviado por el servidor.
            console.error(
                'No se pudo editar',
                datos.error
            );

            alert(datos.error);
        }
    } catch (error) {
        // Error de conexión con el servidor.
        console.error(
            'Error al editar la incidencia',
            error
        );

        alert(
            'No se pudo conectar con el servidor'
        );
    }
}

// ------------------------------------------------------------
// EJECUTAMOS LA FUNCIÓN
// ------------------------------------------------------------

// Cargamos las incidencias cuando se abre el dashboard.
cargarIncidencias();

// ------------------------------------------------------------
// CREAR UNA NUEVA INCIDENCIA
// ------------------------------------------------------------

// Buscamos el formulario que hemos creado en dashboard.html.
const incidenciaForm = document.getElementById('incidenciaForm');

// Buscamos el elemento donde mostraremos mensajes.
const mensajeIncidencia = document.getElementById('mensajeIncidencia');

// Escuchamos el evento submit del formulario.
incidenciaForm.addEventListener('submit', async (event) => {
    // Evitamos que el navegador recargue la página al enviar el formulario.
    event.preventDefault();

    // Obtenemos el título y la prioridad que ha escrito el usuario.
    const titulo = document.getElementById('titulo').value;
    const prioridad = document.getElementById('prioridad').value;

    // Recuperamos el JWT guardado en localStorage.
    const token = localStorage.getItem('token');

    // Mostramos un mensaje mientras realizamos la petición al servidor.
    mensajeIncidencia.textContent = 'Creando incidencia...';

    try {
        // Enviamos una petición POST al backend.
        const respuesta = await fetch('/api/incidencias', {
            // Indicamos que queremos crear una nueva incidencia
            method: 'POST',

            // Enviamos las cabeceras necesarias
            headers: {
                // Indicamos que el contenido está enviado en formato JSON.
                'Content-Type': 'application/json',
                // Enviamos nuestro JWT. El middleware del servidor utilizará este token
                // para comprobar nuestra identidad.
                Authorization: `Bearer ${token}`
            },

            // Convertimos nuestros datos JS a formato JSON.
            body: JSON.stringify({
                titulo: titulo,
                prioridad: prioridad
            })
        });

        // Convertimos la respuesta del servidor de JSON a un objeto JS.
        const datos = await respuesta.json();

        // Si el servidor responde 401, el token ya no es válido o ha caducado.
        if (respuesta.status === 401) {
            // Eliminamos el token caducado.
            localStorage.removeItem('token');

            // Eliminamos los datos del usuario.
            localStorage.removeItem('usuario');

            // Avisamos al usuario.
            mensajeIncidencia.textContent = 'Tu sesión ha caducado, volviendo al login...';

            // Esperamos un momento para que pueda leer el mensaje.
            setTimeout(() => {
                window.location.href = '/'
            }, 1000);
            return;
        }
        
        // Si la creación ha sido correcta...
        if (respuesta.ok) {
            // Mostramos el mensaje recibido.
            mensajeIncidencia.textContent = 'Incidencia creada correctamente.';

            // Aplicamos el estilo de mensaje correcto.
            mensajeIncidencia.className = 'mensaje-exito';

            // Limpiamos el formulario después de crear correctamente la incidencia.
            incidenciaForm.reset();

            // Volvemos a cargar la lista de incidencias para que aparezca directamente la nueva.
            cargarIncidencias();
        } else {
            // Si el servidor devuelve un error, mostramos el mensaje.
            mensajeIncidencia.textContent = datos.error || 'No se pudo crear la incidencia';

            mensajeIncidencia.className = 'mensaje-error';
        }
    } catch (error) {
        // Si tenemos un error de conexión, mostramos el error en la consola.
        console.error(
            'Error al crear la incidencia',
            error
        );
        mensajeIncidencia.textContent = 'No se pudo conectar con el servidor';
    }
});
