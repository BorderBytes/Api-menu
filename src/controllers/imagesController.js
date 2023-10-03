const connection = require('../config/database.js');
const { calculateExecutionTime, sendJsonResponse } = require('../utils/utilsCRUD');
const error_message = 'Error in mysql query';
const success_message = null;
const no_data_message = null;
const fs = require('fs');
const path = require('path');

exports.getFolder = async (req, res) => {
    const folderName = req.params.folder;
    const folderPath = path.join(__dirname, '..', 'public', 'images', folderName);

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

    function getTopLevelFolderInfo(folderPath) {
        let foldersInfo = [];
        let grandTotalSize = 0;
        const files = fs.readdirSync(folderPath);

        files.forEach((file) => {
            const curFile = path.join(folderPath, file);
            if (fs.statSync(curFile).isDirectory()) {
                const folderSize = getFolderTotalSize(curFile);
                const totalFolders = countFoldersInDirectory(curFile);
                const totalFiles = totalFolders * 4;

                grandTotalSize += folderSize;
                foldersInfo.push({ folder: file, size: folderSize, totalFiles: totalFiles });
            }
        });

        return { foldersInfo, grandTotalSize };
    }

    async function getDatabaseSize(databaseName) {
      return new Promise((resolve, reject) => {
          if (typeof databaseName !== 'string') {
              reject(new Error('El nombre de la base de datos debe ser un string'));
              return;
          }
  
          // Utiliza la conexión exportada desde el archivo de configuración
          const query = `
              SELECT SUM(data_length + index_length) AS 'size'
              FROM information_schema.TABLES
              WHERE table_schema = '${databaseName}'
          `;
  
          connection.query(query, (err, results) => {
              if (err) {
                  console.error("Error en la consulta:", err);
                  reject(err);
                  return;
              }
  
              const sizeInBytes = results[0]?.size !== null ? results[0].size : 0;
              resolve(sizeInBytes);
          });
      });
  }
  
  

    if (folderName === 'total') {
        const imagesFolderPath = path.join(__dirname, '..', 'public', 'images');
        let totalInfo = getTopLevelFolderInfo(imagesFolderPath);

        try {
            const dbSize = await getDatabaseSize('borderbytes_menu_api');
            totalInfo.dbSize = dbSize;
        } catch (err) {
            console.error("Error al obtener el tamaño de la base de datos:", err);
        }

        res.json(totalInfo);
        return;
    }

    fs.access(folderPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Error al acceder a la carpeta:', err.stack);
            res.status(404).send('Carpeta no encontrada');
            return;
        }

        const folderContents = getFolderTotalSize(folderPath);
        res.json({
            folderName,
            totalSize: folderContents,
        });
    });
};

exports.getFile = (req, res) => {
    const folder = req.params.folder;
    const id = req.params.id;
    const filename = req.params.filename;

    const filepath = path.join(__dirname, '..', 'public', 'images', folder, id, filename);

    fs.access(filepath, fs.constants.F_OK, (err) => {
        if (err) {
            // Tu código para manejar errores aquí
            return;
        }

        res.sendFile(filepath);
    });
};