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
const emailRoutes = require('./routes/emailRoutes');

app.use('/categories', categoriesRoutes);
app.use('/clients', clientsRoutes);
app.use('/users', usersRoutes);
app.use('/addons/detail', addonsDetailRoutes);
app.use('/addons', addonsRoutes);
app.use('/email', emailRoutes);

// Ruta para servir recursos para la plantilla de panel
app.use('/assets', express.static(path.join(__dirname, 'public/panel/assets')));

// Ruta para imagenes
app.get('/images/:folder/:id/:filename', (req, res) => {
  const folder = req.params.folder;
  const id = req.params.id;
  const filename = req.params.filename;

  // Construyendo la ruta para acceder a la imagen
  const filepath = path.join(__dirname, 'public', 'images', folder, id, filename);

  fs.access(filepath, fs.constants.F_OK, (err) => {
      if (err) {
          console.error('Error accessing file:', err.stack);
          
          // Ruta para la imagen predeterminada
          const defaultImagePath = path.join(__dirname, 'public', 'images', folder, 'default.webp');
          
          // Verificamos si la imagen predeterminada existe
          fs.access(defaultImagePath, fs.constants.F_OK, (defaultImageErr) => {
              if (defaultImageErr) {
                  console.error('Error accessing default image:', defaultImageErr.stack);
                  res.status(404).send('Image not found and default image is missing');
                  return;
              }
              
              // Enviar la imagen predeterminada
              res.sendFile(defaultImagePath);
          });
          
          return;
      }

      // Enviar la imagen solicitada
      res.sendFile(filepath);
  });
});


// Ruta para assets del dashboard
app.use('/dashboard/assets', express.static(path.join(__dirname, 'public/dashboard/assets')));

// Ruta para /dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard/index.html'));
});
// Ruta para /dashboard
app.get('/dashboard/*', (req, res) => {
  // Para cualquier otra ruta bajo /dashboard, enviar el archivo index.html
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
