const express = require('express');
const path = require('path');
const http = require('http'); // Importa el módulo http

// Credenciales
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = '0.0.0.0';

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
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    secure: false,
    httpOnly: true,
  },
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

// Rutas Dashboard (proteger)
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
const ordersRoutes = require('./routes/ordersRoutes');

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
app.use('/orders', ordersRoutes);

// Rutas publicas
const publicRoutes = require('./routes/public/publicRoutes');
app.use('/public', publicRoutes);
// Ruta para los assets de app
app.use('/app/assets', express.static(path.join(__dirname, 'public/app/assets')));

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

// Ruta para productos sin parámetros
app.get('/productos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/app/index.html'));
});

// Ruta para "producto/" seguido de cualquier número de parámetros
app.get('/producto/:params+', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/app/index.html'));
});
// Middleware para manejar rutas no definidas
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Crear un servidor HTTP independiente para los sockets
const server = http.createServer(app);

// Importa socket.io y vincúlalo al servidor HTTP
const socketConfig = require('./config/socket');
const io = socketConfig.init(server);
io.on('connection', (socket) => {
    // Verificar la ruta de referencia del cliente
    const referer = socket.request.headers.referer;

    if (referer && referer.includes('/dashboard')) { // Cambio aquí: usamos 'includes' en lugar de 'endsWith'
        socket.join('dashboardRoom');
        
        console.log('Un cliente desde /dashboard se ha conectado');

        

        socket.on('disconnect', () => {
            console.log('Un cliente desde /dashboard se ha desconectado');
            
        });
    } else {
        console.log('Un cliente se ha conectado (no desde /dashboard)');
    }
});

// Iniciar el servidor HTTP con sockets en el mismo puerto que Express
server.listen(3000, PORT, () => {
  console.log('Server running on port 3000');
});
