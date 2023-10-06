const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        { usernameField: 'email' }, // dado que estás usando email en lugar de username
        function(email, password, done) {
            // Buscar usuario en la base de datos por correo electrónico
            connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
                if (error) {
                    return done(error);
                }
                if (!results || results.length == 0) {
                    return done(null, false, { message: 'No user found with that email.' });
                }
                const user = results[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return done(err);
                    }
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect.' });
                    }
                });
            });
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        connection.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
            done(error, results[0]);
        });
    });
};
