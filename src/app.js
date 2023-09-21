const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Conexión de la base de datos
require('./config/database');

app.use(express.json());

// Middleware para servir archivos estáticos desde 'public/'
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rutas específicas
const categoriesRoutes = require('./routes/categoriesRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const addonsDetailRoutes = require('./routes/addonsDetailRoutes');
const addonsRoutes = require('./routes/addonsRoutes');

app.use('/categories', categoriesRoutes);
app.use('/clients', clientsRoutes);
app.use('/users', usersRoutes);
app.use('/addons/detail', addonsDetailRoutes);
app.use('/addons', addonsRoutes);

// Ruta para servir recursos para la plantilla de panel
app.use('/assets', express.static(path.join(__dirname, 'public/panel/assets')));

// Ruta para imagenes
app.get('/images/:folder/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'public', 'images', req.params.folder, req.params.filename);

  fs.access(filepath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Error accessing file:', err.stack);
      return res.status(404).send('Image not found');
    }
    res.sendFile(filepath);
  });
});

// Ruta para /dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard/index.html'));
});

// Ruta para la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/app/index.html'));
});

// Middleware para manejar rutas no definidas
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Iniciar servicio
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
