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

      const insertCategory = () => {
        return new Promise((resolve, reject) => {
          connection.query('INSERT INTO categories (name) VALUES (?)', [name], (error, results) => {
            if (error) {
              reject(new Error('Error al insertar: ' + error.message));
            } else {
              resolve(results.insertId);
            }
          });
        });
      };

      const categoryId = await insertCategory();

      const categoryPath = path.join(__dirname, '..', 'public', 'images/categories', categoryId.toString());
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

      sendJsonResponse(res, 'success', `Categoria creada correctamente Id #: ${categoryId}`, { id: categoryId });
    });
  } catch (err) {
    handleErrors(res, err);
  }
};





exports.updateCategory = (req, res) => {
  upload.single('image')(req, res, async function (uploadError) {
      try {
          if (uploadError) {
              throw new Error('Error uploading file: ' + uploadError.message);
          }

          const { name } = req.body;
          const categoryId = req.params.id;

          if (!name) {
              throw new Error('Category name is required');
          }

          const categoryPath = path.join(__dirname, '..', 'public', 'images/categories', categoryId.toString());

          if (!fs.existsSync(categoryPath)) {
              mkdirp.sync(categoryPath);
          }

          if (req.file) {
              const ext = path.extname(req.file.filename).toLowerCase();
              const inputImagePath = path.join(categoryPath, 'original' + ext);

              fs.renameSync(req.file.path, inputImagePath);
              let mainImagePath = inputImagePath;

              if (ext !== '.webp') {
                  const outputImagePath = path.join(categoryPath, 'original.webp');

                  const writeStream = fs.createWriteStream(outputImagePath);
                  const imageStream = sharp(mainImagePath).webp({ quality: 90 });
                  imageStream.pipe(writeStream);

                  writeStream.on('finish', () => {
                      console.log('Archivo escrito correctamente.');
                  });

                  writeStream.on('error', (error) => {
                      console.error('Error al escribir el archivo:', error);
                  });

                  mainImagePath = outputImagePath;
              }

              const sizes = {
                  small: 100,
                  medium: 300,
                  big: 800
              };

              for (let size in sizes) {
                  const outputPath = path.join(categoryPath, `${size}.webp`);

                  const writeStreamSize = fs.createWriteStream(outputPath);
                  const imageSizeStream = sharp(mainImagePath)
                      .resize(sizes[size])
                      .webp({ quality: 90 });

                  imageSizeStream.pipe(writeStreamSize);

                  writeStreamSize.on('finish', () => {
                      console.log(`Archivo ${size} escrito correctamente.`);
                  });

                  writeStreamSize.on('error', (error) => {
                      console.error(`Error al escribir el archivo ${size}:`, error);
                  });
              }
          }

          connection.query('UPDATE categories SET name = ? WHERE id = ?', [name, categoryId], (error, results) => {
              if (error) {
                  throw new Error('Error al actualizar: ' + error.message);
              }
              sendJsonResponse(res, 'success', `Categoria actualizada correctamente Id #: ${categoryId}`, { id: categoryId });
          });

      } catch (err) {
          console.error(err.stack || err.message);
          sendJsonResponse(res, 'error', err.message);
      }
  });
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
  let search = req.query.search.value || ''; // Para filtrado global
  let orderColumn = req.query.order[0].column; // Índice de columna por la que se ordena
  let orderDir = req.query.order[0].dir; // Dirección de ordenación, asc o desc
  
  // Columnas que se pueden ordenar y filtrar.
  let columns = ['id', 'name'];
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
      (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);
  
        if (error) {
          console.error('Error al ejecutar la consulta:', error.stack);
          return res.status(500).json({ error: 'Error interno del servidor' });
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
