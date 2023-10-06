// middlewares/authentication.js
module.exports.ensureAuthenticated = function (req, res, next) {
     if (req.isAuthenticated()) {
    // Si el usuario ha iniciado sesión, permite que la solicitud continúe.
    return next();
  }

  // Si el usuario no ha iniciado sesión, redirige al usuario a la página de inicio de sesión.
  res.redirect('/auth/login'); // Cambia "/login" a la ruta de tu página de inicio de sesión.
};