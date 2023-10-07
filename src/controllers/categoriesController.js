// Nos conectamos a la bd
const connection = require('../config/database.js');
// Incluimos las funciones
const { calculateExecutionTime, sendJsonResponse } = require('../utils/utilsCRUD');
// Mensaje estandar de error
const error_message = 'Error in mysql query';
// Mensaje estandar consulta completa
const success_message = null;
// Mensaje estanadar sin resultados
const no_data_message = null;
// Libreria de iamgenes
const multer  = require('multer');
const sharp = require('sharp');
const mkdirp = require('mkdirp'); // Asegúrate de instalar este paquete para crear directorios de manera recursiva
const path = require('path');
const fs = require('graceful-fs');
const imagesDirectory = path.join(__dirname, '..', 'public', 'images/categories');
const { v4: uuidv4 } = require('uuid');
// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, imagesDirectory)  // Directorio donde se guardarán las imágenes.
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) // Se genera un nombre de archivo único con timestamp + extensión original.
  }
})
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/; // Tipos de archivos permitidos
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
      return cb(null, true);
  } else {
      cb('Error: Solo se admiten imágenes.');
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

exports.getCategories = (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;
  const startTime = performance.now();

  connection.query('SELECT id,name,status FROM categories LIMIT ? OFFSET ?', [limit, offset], (error, results) => {
    if (error) {
      console.error('Error ejecutando la consulta:', error.stack);
      const executionTimeMs = calculateExecutionTime(startTime);
      sendJsonResponse(res, 'error', error_message, null, executionTimeMs);
      return;
    }

    connection.query('SELECT value FROM configuration WHERE name = "total_categories"', (error, configResults) => {
      const executionTimeMs = calculateExecutionTime(startTime);

      if (error) {
        console.error('Error ejecutando la consulta de configuración:', error.stack);
        sendJsonResponse(res, 'error', error_message, null, executionTimeMs);
        return;
      }

      const totalCategories = configResults.length > 0 ? configResults[0].value : null;

      sendJsonResponse(res, 'success', success_message, results, executionTimeMs, totalCategories);
    });
  });
};

// Función para obtener una categoría específica a partir de su ID
exports.getCategoryById = (req, res) => {
  // Extraer el ID de la categoría de los parámetros de la petición
  const id = req.params.id;

  // Registrar el tiempo inicial para calcular el tiempo de ejecución
  const startTime = performance.now();

  // Consultar la base de datos para obtener la categoría con el ID especificado
  connection.query('SELECT * FROM categories WHERE id = ?', [id], (error, results) => {
    const executionTimeMs = calculateExecutionTime(startTime); // Calcular el tiempo de ejecución

    // En caso de error en la consulta
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      sendJsonResponse(res, 'error', error_message, null, executionTimeMs);
      return;
    }

    // Si no se encuentra ningún resultado
    if (results.length === 0) {
      sendJsonResponse(res, 'error', no_data_message, null, executionTimeMs);
      return;
    }

    // Si se encuentra la categoría, enviar la respuesta con el resultado
    sendJsonResponse(res, 'success', success_message, results[0], executionTimeMs);
  });
};

exports.createCategory = async (req, res) => {
  try {
    upload.single('image')(req, res, async function (uploadError) {
      if (uploadError) {
        throw new Error('Error uploading file: ' + uploadError.message);
      }

      const { name } = req.body;
      if (!name) {
        throw new Error('Category name is required');
      }

      const uniqueFolderName = uuidv4(); // Genera un nombre único para la carpeta
      const categoryPath = path.join(__dirname, '..', 'public', 'images/categories', uniqueFolderName);
      mkdirp.sync(categoryPath);

      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase(); // Obtén la extensión del nombre original del archivo

        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) { // Verifica si la extensión es una imagen válida
          const inputImagePath = path.join(categoryPath, 'original' + ext);
          fs.renameSync(req.file.path, inputImagePath);

          console.log(`Procesando imágenes desde: ${inputImagePath}`);

          const sizes = {
            small: 100,
            medium: 300,
            big: 800
          };

          for (let size in sizes) {
            const outputPath = path.join(categoryPath, `${size}.webp`);
            console.log(`Creando imagen ${size} en: ${outputPath}`);

            await sharp(inputImagePath)
              .resize(sizes[size])
              .webp({ quality: 90 })
              .toFile(outputPath);

            console.log(`Archivo ${size} creado correctamente.`);
          }
        } else {
          console.error('Formato de archivo no válido. Se esperaba una imagen válida.');
        }
      }

      const insertCategory = () => {
        return new Promise((resolve, reject) => {
          connection.query('INSERT INTO categories (name, image) VALUES (?, ?)', [name, uniqueFolderName], (error, results) => {
            if (error) {
              reject(new Error('Error al insertar: ' + error.message));
            } else {
              resolve(results.insertId);
            }
          });
        });
      };

      const id = await insertCategory();

      sendJsonResponse(res, 'success', `Categoria creada correctamente Id #: ${id}`, { id: id });
    });
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    upload.single('image')(req, res, async function (uploadError) {
      try {
        if (uploadError) {
          throw new Error('Error uploading file: ' + uploadError.message);
        }

        const id = req.params.id;
        const { name } = req.body;

        if (!id || !name) {
          throw new Error('Both id and category name are required');
        }
        let currentImageName;
        await new Promise((resolve, reject) => {
          connection.query('SELECT image FROM categories WHERE id = ?', [id], (error, results) => {
            if (error) {
              reject(new Error('Error al consultar: ' + error.message));
            } else {
              if (results.length > 0) {
                currentImageName = results[0].image;
                resolve();
              } else {
                reject(new Error('No se encontró la categoría con el id especificado.'));
              }
            }
          });
        });
        // Intentar mover la carpeta existente a trash/
        const oldFolderPath = path.join(__dirname, '..', 'public', 'images/categories', currentImageName);
        const trashFolderPath = path.join(__dirname, '..', 'public', 'images/trash', currentImageName);

        console.log('Current directory:', __dirname);
        console.log('Checking existence of:', oldFolderPath);

        if (fs.existsSync(oldFolderPath)) {
          console.log(`Moving folder from ${oldFolderPath} to ${trashFolderPath}`);
          fs.renameSync(oldFolderPath, trashFolderPath);
          console.log('Successfully moved folder to trash.');
        } else {
          console.log('Old folder does not exist:', oldFolderPath);
        }

        // Crear una nueva carpeta
        const uniqueFolderName = uuidv4();
        const categoryPath = path.join(__dirname, '..', 'public', 'images/categories', uniqueFolderName);
        mkdirp.sync(categoryPath);

        // Código para manejar la imagen
        if (req.file) {
          const ext = path.extname(req.file.originalname).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            const inputImagePath = path.join(categoryPath, 'original' + ext);
            fs.renameSync(req.file.path, inputImagePath);

            const sizes = {
              small: 100,
              medium: 300,
              big: 800
            };

            for (let size in sizes) {
              const outputPath = path.join(categoryPath, `${size}.webp`);
              await sharp(inputImagePath)
                .resize(sizes[size])
                .webp({ quality: 90 })
                .toFile(outputPath);
            }
          } else {
            throw new Error('Invalid file format. Expected a valid image.');
          }
        }

        // Actualizar la base de datos
        await new Promise((resolve, reject) => {
          connection.query('UPDATE categories SET name = ?, image = ? WHERE id = ?', [name, uniqueFolderName, id], (error, results) => {
            if (error) {
              reject(new Error('Error al actualizar: ' + error.message));
            } else {
              resolve(results.affectedRows);
            }
          });
        });

        // Enviar respuesta al cliente
        res.json({ status: 'success', message: `Category updated successfully with id: ${id}` });

      } catch (innerErr) {
        console.error('Error dentro del callback de multer:', innerErr);
        res.status(500).json({ status: 'error', message: innerErr.message });
      }
    });
  } catch (err) {
    console.error('Error en el controlador:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
// Función para eliminar (actualizar el estado a 0) una categoría
// exports.deleteCategory = (req, res) => {
//   const id = req.params.id;

//   connection.query('UPDATE categories SET status = 0 WHERE id = ?', [id], (error) => {
//     if (error) {
//       console.error('Error al actualizar el estado:', error.stack);
//       sendJsonResponse(res, 'error', error_message);
//       return;
//     }
//     sendJsonResponse(res, 'success', success_message);
//   });
// };

// Función para reactivar una categoría
exports.toggleCategoryStatus = (req, res) => {
  const id = req.params.id;

  // Primero, obtén el estado actual de la categoría
  connection.query('SELECT status FROM categories WHERE id = ?', [id], (error, results) => {
    if (error || results.length === 0) {
      console.error('Error al obtener el estado de la categoría:', error?.stack);
      sendJsonResponse(res, 'error', 'Error al obtener el estado de la categoría');
      return;
    }

    // Cambia el estado: si es 1 ponlo en 0 y viceversa
    const newStatus = results[0].status === 1 ? 0 : 1;

    // Luego, actualiza el estado de la categoría con el nuevo valor
    connection.query('UPDATE categories SET status = ? WHERE id = ?', [newStatus, id], (error) => {
      if (error) {
        console.error('Error al actualizar el estado de la categoría:', error.stack);
        sendJsonResponse(res, 'error', 'Error al actualizar el estado de la categoría');
        return;
      }
      sendJsonResponse(res, 'success', 'Estado de la categoría actualizado exitosamente',newStatus);
    });
  });
};


// Función para buscar categorías, compatible con data-tables
exports.searchCategories = (req, res) => {
  let draw = parseInt(req.query.draw);
  let start = parseInt(req.query.start) || 0;
  let length = parseInt(req.query.length) || 10;
  let search = (req.query.search && req.query.search.value) ? req.query.search.value : ''; // Para filtrado global
  let orderColumn = req.query.order[0].column; // Índice de columna por la que se ordena
  let orderDir = req.query.order[0].dir; // Dirección de ordenación, asc o desc
  // Columnas a ordenar, igual a datatables
  let columns = ['id','image','name'];
  let orderBy = columns[orderColumn];
  
  search = `%${search}%`;
  
  const startTime = performance.now();

  connection.query('SELECT COUNT(*) AS total FROM categories', (err, totalResult) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err.stack);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    let total = totalResult[0].total;

    connection.query(
      `SELECT * FROM categories WHERE name LIKE ? ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
      [search, length, start],
      async (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);
  
        if (error) {
          console.error('Error al ejecutar la consulta:', error.stack);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Itera sobre los resultados para agregar el nombre completo de la imagen "original"
        for (let i = 0; i < results.length; i++) {
          const id = results[i].image; // Cambiado a "image" ya que ahora estamos almacenando el nombre único de la carpeta
          const categoryPath = path.join(__dirname, '..', 'public', 'images', 'categories', id);
        
          // Verifica si existe la carpeta de la categoría
          if (fs.existsSync(categoryPath)) {
            // Lee el directorio para buscar archivos en la carpeta
            const files = fs.readdirSync(categoryPath);
        
            // Busca el archivo "original" con cualquier extensión
            const originalFile = files.find(file => file.startsWith('original.'));
        
            if (originalFile) {
              results[i].originalImageName = originalFile;
            } else {
              results[i].originalImageName = null;
            }
          } else {
            results[i].originalImageName = null;
          }
        }

        connection.query('SELECT COUNT(*) AS filtered FROM categories WHERE name LIKE ?', [search], (err, filteredResult) => {
          if (err) {
            console.error('Error al ejecutar la consulta:', err.stack);
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
  
          let filtered = filteredResult[0].filtered;
          res.json({
            draw: draw,
            recordsTotal: total,
            recordsFiltered: filtered,
            data: results,
            executionTimeMs: executionTimeMs
          });
        });
      }
    );
  });
};
