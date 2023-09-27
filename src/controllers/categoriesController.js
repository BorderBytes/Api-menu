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
const fs = require('fs');
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

  connection.query('SELECT id,name,image,status FROM categories LIMIT ? OFFSET ?', [limit, offset], (error, results) => {
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

exports.createCategory = (req, res) => {
    upload.single('image')(req, res, async function (uploadError) {
        try {
            if (uploadError) {
                throw new Error('Error uploading file: ' + uploadError.message);
            }

            const { name } = req.body;
            if (!name) {
                throw new Error('Category name is required');
            }

            connection.query('INSERT INTO categories (name) VALUES (?)', [name], async (error, results) => {
                if (error) {
                    throw new Error('Error al insertar: ' + error.message);
                }

                const categoryId = results.insertId;
                const categoryPath = path.join(__dirname, '..', 'public', 'images/categories', categoryId.toString());

                // Crear un directorio para la categoría basado en su ID
                mkdirp.sync(categoryPath);

                if (req.file) {
                    const ext = path.extname(req.file.filename).toLowerCase();
                    const inputImagePath = path.join(categoryPath, 'original' + ext);
                    
                    // Mover la imagen subida a la ubicación deseada
                    fs.renameSync(req.file.path, inputImagePath);

                    let mainImagePath = inputImagePath;

                    if (ext !== '.webp') {
                        const outputImagePath = path.join(categoryPath, 'original.webp');
                        
                        let buffer = await sharp(mainImagePath).webp({ quality: 90 }).toBuffer();
                        fs.writeFileSync(outputImagePath, buffer);
                        fs.unlinkSync(mainImagePath);

                        mainImagePath = outputImagePath;
                    }

                    console.log(`Procesando imágenes desde: ${mainImagePath}`);

                    // Crear versiones de diferentes tamaños
                    const sizes = {
                        small: 100,
                        medium: 300,
                        big: 800
                    };

                    for (let size in sizes) {
                        const outputPath = path.join(categoryPath, `${size}.webp`);
                        console.log(`Creando imagen ${size} en: ${outputPath}`);
                        
                        let buffer = await sharp(mainImagePath)
                            .resize(sizes[size])
                            .webp({ quality: 90 })
                            .toBuffer();
                        fs.writeFileSync(outputPath, buffer);
                    }
                }

                sendJsonResponse(res, 'success', `Category created: ${categoryId}`, { id: categoryId });
            });
        } catch (err) {
            console.error(err.stack || err.message);
            sendJsonResponse(res, 'error', err.message);
        }
    });
};


// Función para actualizar una categoría
exports.updateCategory = (req, res) => {
  const id = req.params.id;

  upload.single('image')(req, res, async function (uploadError) {
      try {
          if (uploadError) {
              throw new Error('Error uploading file: ' + uploadError.message);
          }

          const categoryPath = path.join(__dirname, '..', 'public', 'images/categories', id.toString());
          let newImageFilename = null;

          if (req.file) {
              const ext = path.extname(req.file.filename).toLowerCase();
              const inputImagePath = path.join(categoryPath, 'original' + ext);
              
              // Mover la imagen subida a la ubicación deseada
              fs.renameSync(req.file.path, inputImagePath);

              if (ext !== '.webp') {
                  const outputImagePath = path.join(categoryPath, 'original.webp');
                  
                  await sharp(inputImagePath).webp({ quality: 90 }).toBuffer();
                  fs.writeFileSync(outputImagePath, buffer);
                  fs.unlinkSync(inputImagePath);
              }

              // Mover imagen anterior a carpeta trash
              const oldImagePath = path.join(categoryPath, 'original.webp');
              if (fs.existsSync(oldImagePath)) {
                  const trashPath = path.join(__dirname, '..', 'public', 'images/trash', `${id}_old.webp`);
                  fs.renameSync(oldImagePath, trashPath);
              }
          }

          const { name } = req.body;

          if (!name && !newImageFilename) {
              throw new Error('Category name or image is required');
          }

          let updateQuery = 'UPDATE categories SET name = ?';
          let updateValues = [name];

          if (newImageFilename) {
              updateQuery += ', image = ?';
              updateValues.push(newImageFilename);
          }

          updateQuery += ' WHERE id = ?';
          updateValues.push(id);

          await new Promise((resolve, reject) => {
              connection.query(updateQuery, updateValues, (error) => {
                  if (error) reject(error);
                  resolve();
              });
          });

          sendJsonResponse(res, 'success', 'Category updated successfully');

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
