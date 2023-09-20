const express = require('express');
const app = express();
const PORT = 3000;
// Requiere la conexión de la base de datos
require('./config/database');

app.use(express.json());

const path = require('path');

// Middleware para servir archivos estáticos desde 'public/'
app.use('/public', express.static(path.join(__dirname, 'public')));

// Ruta para categorias
const categoriesRoutes = require('./routes/categoriesRoutes');
app.use('/categories', categoriesRoutes);

// Ruta para clientes
const clientsRoutes = require('./routes/clientsRoutes');
app.use('/clients', clientsRoutes);

// Ruta para users
const usersRoutes = require('./routes/usersRoutes');
app.use('/users', usersRoutes);

// Ruta para detalles de addons (Antes de addons para que no haya problemas en el enrutamiento)
const addonsDetailRoutes = require('./routes/addonsDetailRoutes');
app.use('/addons/detail', addonsDetailRoutes);

// Ruta para addons
const addonsRoutes = require('./routes/addonsRoutes');
app.use('/addons', addonsRoutes);

// Ruta por defecto
// Middleware para manejar rutas no definidas. Si el archivo no existe en 'public/', redirige al inicio.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'), err => {
      if (err) {
          res.redirect('/');  // Si no se encuentra el archivo index.html, redirige al inicio.
      }
  });
});

// Iniciar servicio
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
