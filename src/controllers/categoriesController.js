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

// Función para obtener todas las categorías
exports.getCategories = (req, res) => {
  // Convertimos el parámetro limit y offset a entero o usamos valores por defecto
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;

  // Iniciamos el registro del tiempo
  const startTime = performance.now();

  connection.query('SELECT * FROM categories LIMIT ? OFFSET ?', [limit, offset], (error, results) => {
    const executionTimeMs = calculateExecutionTime(startTime); // Calculamos tiempo de ejecución

    // Manejo de errores de la consulta
    if (error) {
      console.error('Error ejecutando la consulta:', error.stack);
      sendJsonResponse(res, 'error', error_message, null, executionTimeMs);
      return;
    }

    // Enviamos respuesta en formato JSON
    sendJsonResponse(res, 'success', success_message, results, executionTimeMs);
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

// Función para crear una nueva categoría
exports.createCategory = (req, res) => {
  upload.single('image')(req, res, async function (uploadError) {
      try {
          if (uploadError) {
              throw new Error('Error uploading file: ' + uploadError.message);
          }

          if (req.file) {
            const ext = path.extname(req.file.filename).toLowerCase();
            const inputImagePath = path.join(__dirname, '..', 'public', 'images/categories', req.file.filename);
            
            if (ext !== '.webp') {
                const outputImagePath = path.join(__dirname, '..', 'public', 'images/categories', path.basename(req.file.filename, ext) + '.webp');
                
                await sharp(inputImagePath)
                    .webp({ quality: 90 }) 
                    .toFile(outputImagePath);
                
                fs.unlinkSync(inputImagePath); // Borrar la imagen original después de la conversión
                
                req.file.filename = path.basename(req.file.filename, ext) + '.webp';
            }
        }
        

          const { name } = req.body;
          if (!name) {
              throw new Error('Category name is required');
          }

          const imageFilename = req.file ? req.file.filename : null;

          connection.query('INSERT INTO categories (name, image) VALUES (?, ?)', [name, imageFilename], (error, results) => {
              if (error) {
                  throw new Error('Error al insertar: ' + error.message);
              }

              sendJsonResponse(res, 'success', `Category created: ${results.insertId}`, { id: results.insertId });
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

          let newImageFilename = null;

          if (req.file) {
            const ext = path.extname(req.file.filename).toLowerCase();
            const inputImagePath = path.join(__dirname, '..', 'public', 'images/categories/', req.file.filename);
            
            if (ext !== '.webp') {
                const outputImagePath = path.join(__dirname, '..', 'public', 'images/categories/', path.basename(req.file.filename, ext) + '.webp');
                
                await sharp(inputImagePath)
                    .webp({ quality: 90 })
                    .toFile(outputImagePath);
                
                fs.unlinkSync(inputImagePath);
                
                newImageFilename = path.basename(req.file.filename, ext) + '.webp';
            } else {
                newImageFilename = req.file.filename;
            }
        }
        

          if (newImageFilename) {
              const result = await new Promise((resolve, reject) => {
                  connection.query('SELECT image FROM categories WHERE id = ?', [id], (err, results) => {
                      if (err || !results[0]) reject(err);
                      resolve(results[0].image);
                  });
              });

              const oldImageFilename = result;
              if (oldImageFilename) {
                  const oldImagePath = path.join(__dirname, '..', 'public', 'images/categories', oldImageFilename);
                  const trashFolder = path.join(__dirname, '..', 'public', 'images/trash');
                  const trashFilename = 'old_' + id + '_' + oldImageFilename;
                  const trashPath = path.join(trashFolder, trashFilename);

                  const filesWithSameId = fs.readdirSync(trashFolder).filter(file => file.startsWith('old_' + id + '_')).sort((a, b) => {
                      return fs.statSync(path.join(trashFolder, a)).mtime.getTime() - fs.statSync(path.join(trashFolder, b)).mtime.getTime();
                  });

                  if (filesWithSameId.length >= 3) {
                      fs.unlinkSync(path.join(trashFolder, filesWithSameId[0]));
                  }

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
exports.deleteCategory = (req, res) => {
  const id = req.params.id;

  connection.query('UPDATE categories SET status = 0 WHERE id = ?', [id], (error) => {
    if (error) {
      console.error('Error al actualizar el estado:', error.stack);
      sendJsonResponse(res, 'error', error_message);
      return;
    }
    sendJsonResponse(res, 'success', success_message);
  });
};

// Función para reactivar una categoría
exports.reactivateCategory = (req, res) => {
  const id = req.params.id;

  connection.query('UPDATE categories SET status = 1 WHERE id = ?', [id], (error) => {
    if (error) {
      console.error('Error al reactivar la categoría:', error.stack);
      sendJsonResponse(res, 'error', error_message);
      return;
    }
    sendJsonResponse(res, 'success', success_message);
  });
};

// Función para buscar categorías
exports.searchCategories = (req, res) => {
  const search = `%${req.query.name}%`; // Usamos % para buscar subcadenas en SQL
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;

  const startTime = performance.now();

  connection.query('SELECT * FROM categories WHERE name LIKE ? LIMIT ? OFFSET ?', [search, limit, offset], (error, results) => {
    const executionTimeMs = Math.round(performance.now() - startTime);

    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      sendJsonResponse(res, 'error', error_message, null, executionTimeMs);
      return;
    }

    sendJsonResponse(res, 'success', success_message, { categories: results, total_results: results.length }, executionTimeMs);
  });
};