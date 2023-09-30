const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const { exec } = require('child_process');

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
// Ruta para imagenes en una carpeta específica
app.get('/images/:folder', (req, res) => {
  const folderName = req.params.folder;
  const folderPath = path.join(__dirname, 'public', 'images', folderName);

  function getFolderTotalSize(folderPath) {
    let totalSize = 0;
    const files = fs.readdirSync(folderPath);
  
    files.forEach((file) => {
      const curFile = path.join(folderPath, file);
      if (fs.statSync(curFile).isDirectory()) {
        totalSize += getFolderTotalSize(curFile);
      } else {
        totalSize += fs.statSync(curFile).size;
      }
    });
  
    return totalSize;
  }
  
  function countFoldersInDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    let folderCount = 0;
    
    files.forEach((file) => {
      const curFile = path.join(directoryPath, file);
      if (fs.statSync(curFile).isDirectory()) {
        folderCount++;
      }
    });
    
    return folderCount;
  }
  
  if (folderName === 'total') {
    const imagesFolderPath = path.join(__dirname, 'public', 'images');
    const totalInfo = getTopLevelFolderInfo(imagesFolderPath);
    res.json(totalInfo);
    return;
  }
  
  function getTopLevelFolderInfo(folderPath) {
    let foldersInfo = [];
    let grandTotalSize = 0;
    const files = fs.readdirSync(folderPath);
  
    files.forEach((file) => {
      const curFile = path.join(folderPath, file);
      if (fs.statSync(curFile).isDirectory()) {
        const folderSize = getFolderTotalSize(curFile);
        const totalFolders = countFoldersInDirectory(curFile);
        const totalFiles = totalFolders * 4;  // Multiplica por 4
  
        grandTotalSize += folderSize;
        foldersInfo.push({ folder: file, size: folderSize, totalFiles: totalFiles });
      }
    });
  
    return { foldersInfo, grandTotalSize };
  }

  function getFolderTotalSize(folderPath) {
    let totalSize = 0;

    function walkDir(currentPath) {
      const files = fs.readdirSync(currentPath);

      for (const file of files) {
        const curFile = path.join(currentPath, file);

        if (fs.statSync(curFile).isFile()) {
          totalSize += fs.statSync(curFile).size;
        } else if (fs.statSync(curFile).isDirectory()) {
          walkDir(curFile);
        }
      }
    }

    walkDir(folderPath);
    return totalSize;
  }

  fs.access(folderPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Error accessing folder:', err.stack);
      res.status(404).send('Folder not found');
      return;
    }

    const folderContents = getFolderTotalSize(folderPath);
    res.json({
      folderName,
      totalSize: folderContents,
    });
  });
});

// Ver cuántos commits está por detrás y su ID
app.get('/api/git-status', (req, res) => {
  exec('git fetch && git rev-list HEAD...origin/main --count && git rev-parse origin/main', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${stderr}`);
    }
    const [commitsBehind, latestCommitId] = stdout.split('\n').map(s => s.trim());
    res.send({commitsBehind, latestCommitId});
  });
});


// Actualizar el repositorio (git pull)
app.get('/api/git-pull', (req, res) => {
  exec('git pull', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${stderr}`);
    }
    res.send(`Actualizado: ${stdout}`);
  });
});

// Regresar a un commit específico por su ID
app.get('/api/git-reset/:commitId', (req, res) => {
  const { commitId } = req.params;
  exec(`git reset --hard ${commitId}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${stderr}`);
    }
    res.send(`Regresado al commit: ${commitId}`);
  });
});

// Obtener los últimos commits que empiezan con "UPDATE:"
app.get('/api/git-last-commits', (req, res) => {
  exec('git log --pretty=format:"%H %s" | grep "^UPDATE:" | head -n 5', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${stderr}`);
    }
    const commits = stdout.split('\n').filter(line => line).map(line => {
      const [hash, ...messageParts] = line.split(' ');
      const message = messageParts.join(' ');
      return { hash, message };
    });
    res.send(commits);
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
