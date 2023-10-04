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

// Obtener todos los addons (addons)
exports.getAddons = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    connection.query(
        "SELECT * FROM addons LIMIT ? OFFSET ?",
        [limit, offset],
        (error, results) => {
            const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución
            
            if (error) {
                console.error("Error executing query:", error.stack);
                sendJsonResponse(res, 'error', 'Error executing query', null, executionTime);
                return;
            }
            
            sendJsonResponse(res, 'success', 'Addons fetched successfully', results, executionTime);
        }
    );
};

// Buscar addons
exports.searchAddons = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const name = req.query.name;
    const min = req.query.min;
    const max = req.query.max;
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    let sql = 'SELECT * FROM addons WHERE ';

    const searchConditions = [];
    const searchValues = [];

    if (name) {
        searchConditions.push('name LIKE ?');
        searchValues.push(`%${name}%`);
    }

    if (min !== undefined && !isNaN(min)) {
        searchConditions.push('min = ?');
        searchValues.push(parseInt(min));
    }

    if (max !== undefined && !isNaN(max)) {
        searchConditions.push('max = ?');
        searchValues.push(parseInt(max));
    }

    if (status !== undefined && (status === '0' || status === '1')) {
        searchConditions.push('status = ?');
        searchValues.push(parseInt(status));
    }

    // Verificar si no se proporcionó ningún criterio de búsqueda válido
    if (searchConditions.length === 0) {
        sendJsonResponse(res, 'error', '0 valid parameters');
        return;
    }

    sql += searchConditions.join(' AND ');

    // Agregar LIMIT y OFFSET a la consulta SQL
    sql += ' LIMIT ? OFFSET ?';
    searchValues.push(limit, offset);

    connection.query(sql, searchValues, (error, results) => {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

        if (error) {
            console.error('Error executing query:', error.stack);
            sendJsonResponse(res, 'error', 'Error executing query', null, executionTime);
            return;
        }

        sendJsonResponse(res, 'success', 'Addons fetched successfully', results, executionTime);
    });
};

// Actualizar addon
exports.updateAddon = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const id = req.params.id; // Obtener el ID del addon de los parámetros de ruta
    const { name, min, max, status } = req.body; // Obtener los datos a actualizar del cuerpo de la petición

    // Verificar que al menos uno de los campos a actualizar esté presente en el cuerpo de la petición
    if (!name && min === undefined && max === undefined && status === undefined) {
        sendJsonResponse(res, 'error', 'Least one field is required');
        return;
    }

    // Construir la consulta SQL dinámicamente
    let sql = 'UPDATE addons SET ';
    const updateFields = [];
    const updateValues = [];

    if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
    }

    if (min !== undefined) {
        updateFields.push('min = ?');
        updateValues.push(min);
    }

    if (max !== undefined) {
        updateFields.push('max = ?');
        updateValues.push(max);
    }

    if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
    }

    sql += updateFields.join(', ');
    sql += ` WHERE id = ?`;
    updateValues.push(id);

    // Ejecutar la consulta SQL
    connection.query(sql, updateValues, (error) => {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

        if (error) {
            console.error('Error while updating:', error.stack);
            sendJsonResponse(res, 'error', 'Error updating addon', null, executionTime);
            return;
        }

        sendJsonResponse(res, 'success', 'Addon updated successfully', null, executionTime);
    });
};


// Crear un nuevo addon

exports.createAddon = (req, res) => {
    const startTime = performance.now();

    const { name, min, max, details } = req.body; // Extrayendo campos desde req.body

    // Verificar que se proporcionen los datos requeridos
    if (!name || min === undefined || max === undefined || !details) {
        sendJsonResponse(res, 'error', 'Todos los campos son requeridos');
        return;
    }

    const sql = 'INSERT INTO addons (name, min, max) VALUES (?, ?, ?)';
    const values = [name, min, max];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error while inserting into addons:', error.stack);
            sendJsonResponse(res, 'error', 'Error al insertar el addon');
            return;
        }

        const addonId = results.insertId;
        const detailValues = details.map(detail => [addonId, detail.name, detail.price]);
        const detailSql = 'INSERT INTO addon_details (addon_id, name, price) VALUES ?';

        connection.query(detailSql, [detailValues], (detailError) => {
            const executionTime = calculateExecutionTime(startTime);

            if (detailError) {
                console.error('Error while inserting into addon_details:', detailError.stack);
                sendJsonResponse(res, 'error', 'Error al insertar los detalles del addon', null, executionTime);
                return;
            }

            sendJsonResponse(res, 'success', `Addon creado con ID: ${addonId}`, { id: addonId }, executionTime);
        });
    });
};


exports.getAddonById = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador
    const id = req.params.id;

    connection.query(
        "SELECT * FROM addons WHERE id = ?",
        [id],
        (error, results) => {
            const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

            if (error || results.length === 0) {
                sendJsonResponse(res, 'error', 'Addon no encontrado', null, executionTime);
                return;
            }
            sendJsonResponse(res, 'success', null, results[0], executionTime);
        }
    );
};

// Desactivar un addon (cambiar estado a 0)
exports.deleteAddon = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador
    const id = req.params.id; // Obtener el ID del addon de los parámetros de ruta

    // Construir la consulta SQL para cambiar el estado a 0
    const sql = 'UPDATE addons SET status = 0 WHERE id = ?';

    // Ejecutar la consulta SQL para cambiar el estado a 0
    connection.query(sql, [id], (error, results) => {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

        if (error) {
            console.error('Error while deleting:', error.stack);
            sendJsonResponse(res, 'error', 'Error al cambiar el estado del addon', null, executionTime);
            return;
        }

        // Verificar si se actualizó algún registro
        if (results.affectedRows === 0) {
            sendJsonResponse(res, 'error', 'Addon no encontrado', null, executionTime);
        } else {
            sendJsonResponse(res, 'success', 'Addon desactivado exitosamente', null, executionTime);
        }
    });
};

// Reactivar una addon
exports.reactivateAddon = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador
    const id = req.params.id; 

    connection.query('UPDATE addons SET status = 1 WHERE id = ?', [id], (error) => {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

        if (error) {
            console.error('Error while updating the status:', error.stack);
            sendJsonResponse(res, 'error', 'Error al reactivar el complemento', null, executionTime);
            return;
        }
        sendJsonResponse(res, 'success', 'Addon reactivado exitosamente', null, executionTime);
    });
};