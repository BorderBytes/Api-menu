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
