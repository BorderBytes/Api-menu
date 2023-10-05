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
    const startTime = performance.now();

    const searchValue = req.query['search[value]'];
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;

    let sql = 'SELECT * FROM addons WHERE 1=1 ';  // "WHERE 1=1" facilita agregar condiciones adicionales

    const searchConditions = [];
    const searchValues = [];

    if (searchValue) {
        // Suponiendo que deseas buscar en las columnas 'name', 'min', 'max', y 'status'
        searchConditions.push('(name LIKE ? OR min LIKE ? OR max LIKE ? OR status LIKE ?)');
        searchValues.push(`%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`);
    }

    sql += searchConditions.join(' AND ');
    sql += ' LIMIT ? OFFSET ?';
    searchValues.push(length, start);

    connection.query(sql, searchValues, (error, results) => {
        if (error) {
            console.error('Error executing query:', error.stack);
            res.json({ error: 'Error executing query' });
            return;
        }

        // Suponiendo que necesites el total de registros sin filtrar
        connection.query('SELECT COUNT(*) as total FROM addons', (err, totalResult) => {
            if (err) {
                console.error('Error executing count query:', err.stack);
                res.json({ error: 'Error executing count query' });
                return;
            }

            res.json({
                draw: parseInt(req.query.draw),
                recordsTotal: totalResult[0].total, 
                recordsFiltered: results.length,  // En un caso real, esto también puede requerir una consulta separada
                data: results
            });
        });
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