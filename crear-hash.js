// Importamos bcrypt.
// Esta librería nos permite convertir una contraseña normal en un hash seguro que
// podremos guardar en PostgreSQL.
const bcrypt = require('bcrypt');

// Esta es la contraseña que utilizaremos solo para esta prueba.
const password = '123456';

// Generamos el hash de la contraseña. El número 10 indica el coste de procesamiento
// utilizado por bcrypt. Cuanto mayor sea, más trabajo necesita calcular el hash.
bcrypt.hash(password, 10, (error, hash) => {
    // Si ocurre algún error durante la generación del hash, lo mostramos en la consola.
    if (error) {
        console.error('Error al crear el hash:', error);
        return;
    }

    // Mostramos el resultado para poder copiarlo posteriormente a nuestra base de datos.
    console.log('Hash generado:');
    console.log(hash);
});