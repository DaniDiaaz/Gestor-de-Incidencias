// Importamos bcrypt para poder comparar una contraseña con el hash almacenado en la BD.
const bcrypt = require('bcrypt');

// Esta es la contraseña que queremos comprobar.
const password = '123456';
const hash = '$2b$10$yZX5qRHvN0xoF3PhHV0jd.hAaR04CSOBsIarQClsuZhMZaGRY0.NO';

// bcrypt.compare comprueba si la contraseña corresponde al hash almacenado. El resultado será
// true si coincide y false si no.
bcrypt.compare(password, hash, (error, coincide) => {
    // Si ocurre algún problema durante la comparación, mostramos el error.
    if (error) {
        console.error('Error al comprobar la contraseña:', error);
        return;
    }

    // Mostramos si la contraseña es correcta o incorrecta.
    console.log('¿La contraseña coincide?', coincide);
});