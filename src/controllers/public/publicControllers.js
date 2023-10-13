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
exports.getProductById = (req, res) => {
    const startTime = performance.now();

    connection.query('SELECT * FROM products WHERE id = ?', [req.params.id], (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (error) {
            console.error('Error al ejecutar la consulta:', error.stack);
            return res.status(500).json({error: 'Error interno del servidor'});
        }

        if (results.length === 0) {
            return res.status(404).json({error: 'Producto no encontrado'});
        }

        const product = results[0];
        const imageName = product.image;
        const productPath = path.join(__dirname, '..', 'public', 'images', 'products', imageName);

        if (fs.existsSync(productPath)) {
            const files = fs.readdirSync(productPath);
            const originalFile = files.find(file => file.startsWith('original.'));

            if (originalFile) {
                product.originalImageName = originalFile;
            } else {
                product.originalImageName = null;
            }
        } else {
            product.originalImageName = null;
        }

        res.json({data: product, executionTimeMs: executionTimeMs});
    });
}