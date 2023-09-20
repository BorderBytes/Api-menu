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
  const filetypes = /jpeg|jpg|png|gif/; // Tipos de archivos permitidos
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
    if (uploadError) {
      console.error('Error uploading file:', uploadError.stack);
      sendJsonResponse(res, 'error', 'Error uploading file');
      return;
    }

    if (req.file) {
        const inputImagePath = path.join(__dirname, '..', 'public', 'images/categories', req.file.filename);
        const outputImagePath = path.join(__dirname, '..', 'public', 'images/categories', path.basename(req.file.filename, path.extname(req.file.filename)) + '.webp');

        try {
            await sharp(inputImagePath)
                .webp({ quality: 90 }) // Puedes ajustar la calidad según lo necesites
                .toFile(outputImagePath);

            // Opcional: Borrar la imagen original después de la conversión
            fs.unlinkSync(inputImagePath);
            
            // Actualizar el nombre del archivo para que incluya la nueva extensión .webp
            req.file.filename = path.basename(req.file.filename, path.extname(req.file.filename)) + '.webp';
        } catch (err) {
            console.error('Error converting image:', err.stack);
            sendJsonResponse(res, 'error', 'Error converting image');
            return;
        }
    }

    // Extraemos el nombre de la categoría y la imagen del cuerpo de la petición
    const { name } = req.body;
    const imageFilename = req.file ? req.file.filename : null;

    // Verificar si el nombre de la categoría ha sido proporcionado
    if (!name) {
      sendJsonResponse(res, 'error', 'Category name is required');
      return;
    }

    // Insertar la nueva categoría en la base de datos (ahora también insertando el nombre del archivo de imagen)
    connection.query('INSERT INTO categories (name, image) VALUES (?, ?)', [name, imageFilename], (error, results) => {
      
      // En caso de error al insertar
      if (error) {
        console.error('Error al insertar:', error.stack);
        sendJsonResponse(res, 'error', error.message);
        return;
      }

      // Enviar respuesta con el ID de la categoría creada
      sendJsonResponse(res, 'success', `Category created: ${results.insertId}`, { id: results.insertId });
    });
  });
};

// Función para actualizar una categoría
exports.updateCategory = (req, res) => {
  const id = req.params.id;

  upload.single('image')(req, res, async function (uploadError) {
    if (uploadError) {
      console.error('Error uploading file:', uploadError.stack);
      sendJsonResponse(res, 'error', 'Error uploading file');
      return;
    }

    let imageFilename = null;

    if (req.file) {
        const inputImagePath = path.join(__dirname, '..', 'public', 'images', req.file.filename);
        const outputImagePath = path.join(__dirname, '..', 'public', 'images', path.basename(req.file.filename, path.extname(req.file.filename)) + '.webp');

        try {
            await sharp(inputImagePath)
                .webp({ quality: 90 })
                .toFile(outputImagePath);

            // Opcional: Borrar la imagen original después de la conversión
            fs.unlinkSync(inputImagePath);

            imageFilename = path.basename(req.file.filename, path.extname(req.file.filename)) + '.webp';
        } catch (err) {
            console.error('Error converting image:', err.stack);
            sendJsonResponse(res, 'error', 'Error converting image');
            return;
        }
    }

    const { name } = req.body;

    if (!name && !imageFilename) {
      sendJsonResponse(res, 'error', 'Category name or image is required');
      return;
    }

    let updateQuery = 'UPDATE categories SET name = ?';
    let updateValues = [name];

    if (imageFilename) {
      updateQuery += ', image = ?';
      updateValues.push(imageFilename);
    }

    updateQuery += ' WHERE id = ?';
    updateValues.push(id);

    connection.query(updateQuery, updateValues, (error) => {
      if (error) {
        console.error('Error al actualizar:', error.stack);
        sendJsonResponse(res, 'error', error.message);
        return;
      }
      sendJsonResponse(res, 'success', 'Category updated successfully');
    });
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