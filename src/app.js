const express = require('express');
const path = require('path');

// Credenciales
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = 3000;

const session = require('express-session');

const passport = require('passport');

// Configuración de session y passport
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionToken',
  cookie: {
      maxAge: 24 * 60 * 60 * 1000,  // 1 día
      secure: false,
      httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Conexión de la base de datos
require('./config/database');

// Importa el middleware de autenticación
const { ensureAuthenticated } = require('./middlewares/authentication');

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
const imagesRoutes = require('./routes/imagesRoutes');
const productsRoutes = require('./routes/productsRoutes');
const businessRoutes = require('./routes/businessRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/categories', categoriesRoutes);
app.use('/clients', clientsRoutes);
app.use('/users', usersRoutes);
app.use('/addons/detail', addonsDetailRoutes);
app.use('/addons', addonsRoutes);
app.use('/email', emailRoutes);
app.use('/images', imagesRoutes);
app.use('/products', productsRoutes);
app.use('/auth', authRoutes);
app.use('/business', businessRoutes);

// Ruta para servir recursos para la plantilla de panel
app.use('/assets', express.static(path.join(__dirname, 'public/panel/assets')));

// Ruta para assets del dashboard
app.use('/dashboard/assets', express.static(path.join(__dirname, 'public/dashboard/assets')));

// Rutas protegidas de /dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard/index.html'));
});

app.get('/dashboard/*', ensureAuthenticated, (req, res) => {
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
