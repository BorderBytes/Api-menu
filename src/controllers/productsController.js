// Nos conectamos a la bd
const connection = require('../config/database.js');
// Incluimos las funciones
const {calculateExecutionTime, sendJsonResponse} = require('../utils/utilsCRUD');
// Mensaje estandar de error
const error_message = 'Error in mysql query';
// Mensaje estandar consulta completa
const success_message = null;
// Mensaje estanadar sin resultados
const no_data_message = null;
// Libreria de iamgenes
const multer = require('multer');
const sharp = require('sharp');
const mkdirp = require('mkdirp'); // Asegúrate de instalar este paquete para crear directorios de manera recursiva
const path = require('path');
const fs = require('graceful-fs');
const imagesDirectory = path.join(__dirname, '..', 'public', 'images/categories');
const {v4: uuidv4} = require('uuid');
// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDirectory) // Directorio donde se guardarán las imágenes.
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
const upload = multer({storage: storage, fileFilter: fileFilter});

exports.searchProducts = (req, res) => {
  let draw = parseInt(req.query.draw);
  let start = parseInt(req.query.start) || 0;
  let length = parseInt(req.query.length) || 10;
  let search = (req.query.search && req.query.search.value) ? req.query.search.value : ''; // Para filtrado global
  let orderColumn = req.query.order[0].column;
  let orderDir = req.query.order[0].dir;

  let columns = [
      'id',
      'category_id',
      'name',
      'description',
      'preparation_time',
      'price',
      'price_per_kg',
      'total_views',
      'total_purchases',
      'status'
  ];
  let orderBy = columns[orderColumn];

  search = `%${search}%`;

  const startTime = performance.now();

  connection.query('SELECT COUNT(*) AS total FROM products', (err, totalResult) => {
      if (err) {
          console.error('Error al ejecutar la consulta:', err.stack);
          return res.status(500).json({error: 'Error interno del servidor'});
      }

      let total = totalResult[0].total;

      connection.query(`SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`, [
          search, search, length, start
      ], (error, results) => {
          const executionTimeMs = Math.round(performance.now() - startTime);

          if (error) {
              console.error('Error al ejecutar la consulta:', error.stack);
              return res.status(500).json({error: 'Error interno del servidor'});
          }

          for (let i = 0; i < results.length; i++) {
              const imageName = results[i].image;
              const productPath = path.join(__dirname, '..', 'public', 'images', 'products', imageName);
      
              if (fs.existsSync(productPath)) {
                  const files = fs.readdirSync(productPath);
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

          connection.query('SELECT COUNT(*) AS filtered FROM products WHERE name LIKE ? OR description LIKE ?', [
              search, search
          ], (err, filteredResult) => {
              if (err) {
                  console.error('Error al ejecutar la consulta:', err.stack);
                  return res.status(500).json({error: 'Error interno del servidor'});
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
      });
  });
};

exports.createProduct = async (req, res) => {
  try {
      upload.single('image')(req, res, async function (uploadError) {
          if (uploadError) {
              throw new Error('Error uploading file: ' + uploadError.message);
          }

          const { category_id, name, description, preparation_time, price, price_per_kg, ingredients } = req.body;
          const addons = JSON.parse(ingredients || "[]");

          if (!name || !description || category_id === undefined || preparation_time === undefined || price === undefined || price_per_kg === undefined) {
              throw new Error('Some required fields are missing');
          }

          const uniqueFolderName = uuidv4();
          const productPath = path.join(__dirname, '..', 'public', 'images/products', uniqueFolderName);
          mkdirp.sync(productPath);

          if (req.file) {
              const ext = path.extname(req.file.originalname).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                  const inputImagePath = path.join(productPath, 'original' + ext);
                  fs.renameSync(req.file.path, inputImagePath);

                  console.log(`Processing images from: ${inputImagePath}`);
                  const sizes = {
                      small: 100,
                      medium: 300,
                      big: 800
                  };

                  for (let size in sizes) {
                      const outputPath = path.join(productPath, `${size}.webp`);
                      console.log(`Creating ${size} image at: ${outputPath}`);

                      await sharp(inputImagePath)
                          .resize(sizes[size])
                          .webp({ quality: 90 })
                          .toFile(outputPath);

                      console.log(`${size} file created successfully.`);
                  }
              } else {
                  console.error('Invalid file format. A valid image was expected.');
              }
          }

          const insertProduct = () => {
              return new Promise((resolve, reject) => {
                  connection.query(
                      'INSERT INTO products (category_id, name, image, description, preparation_time, price, price_per_kg) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      [category_id, name, uniqueFolderName, description, preparation_time, price, price_per_kg],
                      (error, results) => {
                          if (error) {
                              reject(new Error('Error on insert: ' + error.message));
                          } else {
                              resolve(results.insertId);
                          }
                      }
                  );
              });
          };

          const insertAddons = (productId, addons) => {
              return new Promise((resolve, reject) => {
                  if (addons.length === 0) {
                      resolve();
                      return;
                  }

                  const values = addons.map(addonId => [productId, addonId]);
                  connection.query('INSERT INTO product_addons (product_id, addon_id) VALUES ?', [values], error => {
                      if (error) {
                          reject(new Error('Error on inserting addons: ' + error.message));
                      } else {
                          resolve();
                      }
                  });
              });
          };

          const id = await insertProduct();
          await insertAddons(id, addons);

          sendJsonResponse(res, 'success', `Product created successfully. Id #: ${id}`, { id: id });
      });
  } catch (err) {
      handleErrors(res, err);
  }
};

exports.toggleProductStatus = (req, res) => {
  const id = req.params.id;

  // Primero, obtén el estado actual del producto
  connection.query('SELECT status FROM products WHERE id = ?', [id], (error, results) => {
    if (error || results.length === 0) {
      console.error('Error al obtener el estado del producto:', error?.stack);
      sendJsonResponse(res, 'error', 'Error al obtener el estado del producto');
      return;
    }

    // Cambia el estado: si es 1 ponlo en 0 y viceversa
    const newStatus = results[0].status === 1 ? 0 : 1;

    // Luego, actualiza el estado del producto con el nuevo valor
    connection.query('UPDATE products SET status = ? WHERE id = ?', [newStatus, id], (error) => {
      if (error) {
        console.error('Error al actualizar el estado del producto:', error.stack);
        sendJsonResponse(res, 'error', 'Error al actualizar el estado del producto');
        return;
      }
      sendJsonResponse(res, 'success', 'Estado del producto actualizado exitosamente',newStatus);
    });
  });
};
exports.getProductById = async (req, res) => {
  try {
      const productId = req.params.id; 

      if (!productId) {
          throw new Error('Se requiere el ID del producto');
      }

      const fetchProduct = () => {
          return new Promise((resolve, reject) => {
              connection.query(
                  'SELECT * FROM products WHERE id = ?',
                  [productId],
                  (error, results) => {
                      if (error) {
                          reject(new Error('Error al obtener el producto: ' + error.message));
                      } else {
                          resolve(results[0]); 
                      }
                  }
              );
          });
      };

      const fetchAddonsDetails = () => {
          return new Promise((resolve, reject) => {
              connection.query(
                  'SELECT addons.id, addons.name FROM product_addons JOIN addons ON product_addons.addon_id = addons.id WHERE product_addons.product_id = ?',
                  [productId],
                  (error, results) => {
                      if (error) {
                          reject(new Error('Error al obtener los detalles de los addons: ' + error.message));
                      } else {
                          const addonsDetails = results.map(row => ({ id: row.id, name: row.name }));
                          resolve(addonsDetails);
                      }
                  }
              );
          });
      };

      const product = await fetchProduct();

      if (!product) {
          res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
          return;
      }

      // Obtener el nombre de la imagen original
      const imageName = product.image;
      const productPath = path.join(__dirname, '..', 'public', 'images', 'products', imageName);
      let originalImageName = null;
      if (fs.existsSync(productPath)) {
          const files = fs.readdirSync(productPath);
          const originalFile = files.find(file => file.startsWith('original.'));
          if (originalFile) {
              originalImageName = originalFile;
          }
      }
      product.originalImageName = originalImageName;

      const addonsDetails = await fetchAddonsDetails();

      res.json({ status: 'success', data: { product, addons: addonsDetails } });
  } catch (err) {
      handleErrors(res, err);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    upload.single('image')(req, res, async function (uploadError) {
      if (uploadError) {
        throw new Error('Error uploading file: ' + uploadError.message);
      }

      const id = req.params.id; // Id del producto a editar
      const { category_id, name, description, preparation_time, price, price_per_kg, ingredients } = req.body;
      const addons = JSON.parse(ingredients || "[]");

      if (!id || !name || !description || category_id === undefined || preparation_time === undefined || price === undefined || price_per_kg === undefined) {
        throw new Error('Some required fields are missing');
      }

      // Obtener la imagen actual del producto
      let currentImageName;
      await new Promise((resolve, reject) => {
        connection.query('SELECT image FROM products WHERE id = ?', [id], (error, results) => {
          if (error) {
            reject(new Error('Error al consultar: ' + error.message));
          } else {
            if (results.length > 0) {
              currentImageName = results[0].image;
              resolve();
            } else {
              reject(new Error('No se encontró el producto con el id especificado.'));
            }
          }
        });
      });

      // Mover la carpeta existente a trash/ si se proporciona una nueva imagen
      if (req.file) {
        const oldFolderPath = path.join(__dirname, '..', 'public', 'images/products', currentImageName);
        const trashFolderPath = path.join(__dirname, '..', 'public', 'images/trash', currentImageName);
        if (fs.existsSync(oldFolderPath)) {
          fs.renameSync(oldFolderPath, trashFolderPath);
        }

        const uniqueFolderName = uuidv4();
        const productPath = path.join(__dirname, '..', 'public', 'images/products', uniqueFolderName);
        mkdirp.sync(productPath);

        const ext = path.extname(req.file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
          const inputImagePath = path.join(productPath, 'original' + ext);
          fs.renameSync(req.file.path, inputImagePath);

          const sizes = {
            small: 100,
            medium: 300,
            big: 800
          };

          for (let size in sizes) {
            const outputPath = path.join(productPath, `${size}.webp`);
            await sharp(inputImagePath)
              .resize(sizes[size])
              .webp({ quality: 90 })
              .toFile(outputPath);
          }

          currentImageName = uniqueFolderName; // Actualizar con el nombre de la nueva carpeta
        } else {
          throw new Error('Invalid file format. A valid image was expected.');
        }
      }

      await new Promise((resolve, reject) => {
        connection.query(
          'UPDATE products SET category_id = ?, name = ?, image = ?, description = ?, preparation_time = ?, price = ?, price_per_kg = ? WHERE id = ?',
          [category_id, name, currentImageName, description, preparation_time, price, price_per_kg, id],
          (error, results) => {
            if (error) {
              reject(new Error('Error on update: ' + error.message));
            } else {
              resolve();
            }
          }
        );
      });

      // Eliminar los antiguos addons
      await new Promise((resolve, reject) => {
        connection.query('DELETE FROM product_addons WHERE product_id = ?', [id], (error) => {
          if (error) {
            reject(new Error('Error deleting old addons: ' + error.message));
          } else {
            resolve();
          }
        });
      });

      // Insertar los nuevos addons
      await new Promise((resolve, reject) => {
        if (addons.length === 0) {
          resolve();
          return;
        }

        const values = addons.map(addonId => [id, addonId]);
        connection.query('INSERT INTO product_addons (product_id, addon_id) VALUES ?', [values], (error) => {
          if (error) {
            reject(new Error('Error on inserting addons: ' + error.message));
          } else {
            resolve();
          }
        });
      });

      res.json({ status: 'success', message: `Product updated successfully with id: ${id}` });
    });
  } catch (err) {
    handleErrors(res, err);
  }
};


