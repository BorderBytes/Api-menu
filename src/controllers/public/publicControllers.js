// Nos conectamos a la bd
const connection = require('../../config/database.js');
// Incluimos las funciones
const {calculateExecutionTime, sendJsonResponse} = require('../../utils/utilsCRUD.js');
// Asegúrate de instalar este paquete para crear directorios de manera recursiva
const path = require('path');
const fs = require('graceful-fs');
exports.getProducts = (req, res) => {
    const startTime = performance.now();

    connection.query('SELECT * FROM products LIMIT 10', (error, results) => {
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

        res.json({data: results, executionTimeMs: executionTimeMs});
    });
};
exports.getCategories = (req, res) => {
    const startTime = performance.now();

    connection.query('SELECT * FROM categories LIMIT 10', (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (error) {
            console.error('Error al ejecutar la consulta:', error.stack);
            return res.status(500).json({error: 'Error interno del servidor'});
        }

        for (let i = 0; i < results.length; i++) {
            const id = results[i].image; // Cambiado a "image" ya que ahora estamos almacenando el nombre único de la carpeta
            const categoryPath = path.join(__dirname, '..', 'public', 'images', 'categories', id);

            if (fs.existsSync(categoryPath)) {
                const files = fs.readdirSync(categoryPath);
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

        res.json({data: results, executionTimeMs: executionTimeMs});
    });
};
exports.getProductById = async (req, res) => {
    try {
        const startTime = performance.now();

        const productResults = await query('SELECT * FROM products WHERE id = ?', [req.params.id]);

        if (productResults.length === 0) {
            return res.status(404).json({error: 'Producto no encontrado'});
        }

        const product = productResults[0];
        const imageName = product.image;
        const productPath = path.join(__dirname, '..', 'public', 'images', 'products', imageName);

        if (fs.existsSync(productPath)) {
            const files = fs.readdirSync(productPath);
            const originalFile = files.find(file => file.startsWith('original.'));
            product.originalImageName = originalFile || null;
        } else {
            product.originalImageName = null;
        }

        const addons = await query(`
            SELECT a.id, a.name, a.min, a.max, a.status
            FROM product_addons pa
            JOIN addons a ON pa.addon_id = a.id
            WHERE pa.product_id = ?`, [req.params.id]);

        const detailsPromises = addons.map(async addon => {
            const details = await query(`
                SELECT ad.id, ad.name, ad.price, ad.status
                FROM addon_details ad
                WHERE ad.addon_id = ?`, [addon.id]);
            addon.detalle = details;
        });

        await Promise.all(detailsPromises);

        product.addons = addons;

        const executionTimeMs = Math.round(performance.now() - startTime);
        res.json({data: product, executionTimeMs: executionTimeMs});

    } catch (error) {
        console.error('Error:', error.stack);
        res.status(500).json({error: 'Error interno del servidor'});
    }
}

function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

exports.getBusinessLocation = (req, res) => {
    const startTime = performance.now();

    connection.query('SELECT latitude,longitude FROM configuration', (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (error) {
            console.error('Error al ejecutar la consulta:', error.stack);
            return res.status(500).json({error: 'Error interno del servidor'});
        }

        res.json({data: results, executionTimeMs: executionTimeMs});
    });
}

exports.insertOrder = (req, res) => {
    const startTime = performance.now();

    const {
        payment_method_id,
        order_type_id,
        order_status_id,
        client_id,
        address_id,
        order_date,
        total_order,
        products // Asumiendo que products es un array de objetos { id, quantity, unit_kg, comments, addons }
    } = req.body;

    connection.query('SELECT shipping_cost FROM configuration LIMIT 1', (error, results) => {
        if (error) {
            console.error('Error al obtener el shipping_cost:', error.stack);
            return res.status(500).json({error: 'Error interno del servidor'});
        }

        const shipping_cost = results[0].shipping_cost;

        const query = `
            INSERT INTO orders (payment_method_id, order_type_id, order_status_id, client_id, address_id, order_date, shipping_cost, total_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        connection.query(query, [payment_method_id, order_type_id, order_status_id, client_id, address_id, order_date, shipping_cost, total_order], (error, insertResults) => {
            if (error) {
                console.error('Error al ejecutar la inserción:', error.stack);
                return res.status(500).json({error: 'Error interno del servidor'});
            }

            const orderId = insertResults.insertId;

            const productIds = products.map(product => product.id);
            connection.query(`SELECT id, price FROM products WHERE id IN (?)`, [productIds], (error, productResults) => {
                if (error) {
                    console.error('Error al obtener los precios de los productos:', error.stack);
                    return res.status(500).json({error: 'Error interno del servidor'});
                }

                const productDetails = {};
                productResults.forEach(product => {
                    productDetails[product.id] = product.price;
                });

                const orderProductsData = products.map(product => {
                    const price = productDetails[product.id];
                    const subtotal = price * product.quantity;
                    return [orderId, product.id, product.unit_kg, price, product.quantity, subtotal, product.comments];
                });

                connection.query(`INSERT INTO order_products (order_id, product_id, unit_kg, price, quantity, subtotal, comments) VALUES ?`, [orderProductsData], (error, orderProductsResults) => {
                    if (error) {
                        console.error('Error al insertar en order_products:', error.stack);
                        return res.status(500).json({error: 'Error interno del servidor'});
                    }

                    const orderProductIds = orderProductsResults.insertId;

                    const allAddonsPromises = products.map((product, index) => {
                        const orderProductId = orderProductIds + index;

                        if (!product.addons || product.addons.length === 0) {
                            return Promise.resolve();
                        }

                        const addonIds = product.addons.map(addon => addon.id);
                        return new Promise((resolve, reject) => {
                            connection.query(`SELECT id, price FROM addon_details WHERE id IN (?)`, [addonIds], (error, addonResults) => {
                                if (error) {
                                    return reject(error);
                                }

                                const addonDetails = {};
                                addonResults.forEach(addon => {
                                    addonDetails[addon.id] = addon.price;
                                });

                                const orderAddonsData = product.addons.map(addon => {
                                    const price = addonDetails[addon.id];
                                    const subtotal = price * addon.quantity;
                                    return [orderProductId, price, addon.quantity, subtotal];
                                });

                                connection.query(`INSERT INTO order_addons (order_product_id, price, quantity, subtotal) VALUES ?`, [orderAddonsData], (error) => {
                                    if (error) {
                                        return reject(error);
                                    }
                                    resolve();
                                });
                            });
                        });
                    });

                    Promise.all(allAddonsPromises)
                        .then(() => {
                            const executionTimeMs = Math.round(performance.now() - startTime);
                            res.json({ message: 'Orden, productos y addons insertados con éxito.', executionTimeMs: executionTimeMs });
                        })
                        .catch(error => {
                            console.error('Error al insertar los addons:', error.stack);
                            return res.status(500).json({error: 'Error interno del servidor'});
                        });
                });
            });
        });
    });
}

exports.getBussinessPublicInfo = (req, res) => {
    const startTime = performance.now();

    connection.query('SELECT id,name,image,phone,address,latitude,longitude,shipping_cost FROM configuration LIMIT 1', (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (error) {
            console.error('Error al ejecutar la consulta:', error.stack);
            return res.status(500).json({error: 'Error interno del servidor'});
        }

        res.json({data: results[0], executionTimeMs: executionTimeMs});
    });
}