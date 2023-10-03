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
const imagesRoutes = require('./routes/imagesRoutes');
const gitRoutes = require('./routes/gitRoutes');

app.use('/categories', categoriesRoutes);
app.use('/clients', clientsRoutes);
app.use('/users', usersRoutes);
app.use('/addons/detail', addonsDetailRoutes);
app.use('/addons', addonsRoutes);
app.use('/email', emailRoutes);
app.use('/images', imagesRoutes);
app.use('/git', gitRoutes);
// Ruta para servir recursos para la plantilla de panel
app.use('/assets', express.static(path.join(__dirname, 'public/panel/assets')));


// // Ver cuántos commits está por detrás y su ID
// app.get('/api/git-status', (req, res) => {
//   exec('git fetch && git rev-list HEAD...origin/main --count && git rev-parse origin/main', (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).send(`Error: ${stderr}`);
//     }
//     const [commitsBehind, latestCommitId] = stdout.split('\n').map(s => s.trim());
//     res.send({commitsBehind, latestCommitId});
//   });
// });


// // Actualizar el repositorio (git pull)
// app.get('/api/git-pull', (req, res) => {
//   exec('git pull', (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).send(`Error: ${stderr}`);
//     }
//     res.send(`Actualizado: ${stdout}`);
//   });
// });

// // Regresar a un commit específico por su ID
// app.get('/api/git-reset/:commitId', (req, res) => {
//   const { commitId } = req.params;
//   exec(`git reset --hard ${commitId}`, (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).send(`Error: ${stderr}`);
//     }
//     res.send(`Regresado al commit: ${commitId}`);
//   });
// });

// // Obtener los últimos commits que empiezan con "UPDATE:"
// app.get('/api/git-last-commits', (req, res) => {
//   exec('git log -n 50 --pretty=format:"%H %s"', (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).send(`Error: ${stderr}`);
//     }
//     const allCommits = stdout.split('\n');
//     const filteredCommits = allCommits.filter(line => {
//       const [hash, ...messageParts] = line.split(' ');
//       const message = messageParts.join(' ');
//       // Reemplazar por UPDATE: en producción
//       return message.startsWith('');
//     }).slice(0, 5);

//     const commits = filteredCommits.map(line => {
//       const [hash, ...messageParts] = line.split(' ');
//       const message = messageParts.join(' ');
//       return { hash, message };
//     });
//     res.send(commits);
//   });
// });


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
