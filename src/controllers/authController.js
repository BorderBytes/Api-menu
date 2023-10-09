// Nos conectamos a la bd
const connection = require('../config/database.js');
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Aquí van los métodos serializeUser y deserializeUser
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    connection.query('SELECT * FROM users WHERE id = ?', [id], function(error, results) {
        if (error) {
            done(error);
        } else {
            done(null, results[0]); // devuelve el usuario
        }
    });
});
exports.getView = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/auth/index.html'));
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
  
    // Cambiamos la consulta para obtener todos los datos del usuario
    const sqlQuery = 'SELECT * FROM users WHERE email = ?';
    console.log('req.body:', req.body);
    console.log('Consulta SQL:', sqlQuery,email); // Imprime la consulta SQL
  
    connection.query(sqlQuery, [email], (error, results) => {
        if (error) throw error;
  
        if (results.length > 0) {
            const user = results[0];
            console.log(user);
            const hash = user.password;
  
            bcrypt.compare(password, hash, (err, isMatch) => {
                if (err) throw err;
                
                if (isMatch) {
                    req.login(user, function(err) {
                        if (err) return next(err);
                        res.send('success');
                    });
                } else {
                    res.send('Contraseña incorrecta');
                }
            });
        } else {
            res.send('Usuario no encontrado');
        }
    });
};



exports.logout = (req, res) => {
    req.logout();
    res.redirect('/auth/login');
}