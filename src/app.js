const express = require('express');
const app = express();
const PORT = 3000;
// Requiere la conexión de la base de datos
require('./config/database');

app.use(express.json());

// Ruta por defecto
app.get('/', (req, res) => {
  res.send(`
    <h1>API de users</h1>
    <p>Endpoints disponibles:</p>
    <ul>
      <li>GET /users</li>
      <li>POST /users</li>
      <li>PUT /users/:id</li>
      <li>DELETE /users/:id</li>
    </ul>
  `);
});

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

// Iniciar servicio
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
