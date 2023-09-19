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
exports.getDetail = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    connection.query(
        "SELECT * FROM addon_details LIMIT ? OFFSET ?",
        [limit, offset],
        (error, results) => {
            const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución
            
            if (error) {
                console.error("Error executing query:", error.stack);
                sendJsonResponse(res, 'error', 'Error executing query', null, executionTime);
                return;
            }
            
            sendJsonResponse(res, 'success', 'addon_details fetched successfully', results, executionTime);
        }
    );
};

// Buscar addons
exports.searchAddonDetail = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const id = req.query.addon_id;
    const name = req.query.name;
    const status = req.query.status;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    let sql = 'SELECT * FROM addon_details WHERE ';

    const searchConditions = [];
    const searchValues = [];

    if (id) {
        searchConditions.push('addon_id LIKE ?');
        searchValues.push(`%${id}%`);
    }

    if (name) {
        searchConditions.push('name LIKE ?');
        searchValues.push(`%${name}%`);
    }

    if (status) {
        searchConditions.push('status LIKE ?');
        searchValues.push(`%${status}%`);
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

        sendJsonResponse(res, 'success', 'Addons Detail fetched successfully', results, executionTime);
    });
};

exports.getAddonDetailById = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador
    const id = req.params.id;

    connection.query(
        "SELECT * FROM addon_details WHERE id = ?",
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

// Crear un nuevo detalle
exports.createDetail = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador
    const id = req.params.id;
    const { name, price, status } = req.body; // Obtener los datos del cuerpo de la petición

    // Verificar que se proporcionen los datos requeridos
    if (!id || !name || !price || status === undefined) {
        sendJsonResponse(res, 'error', 'Todos los campos son requeridos');
        return;
    }

    // Construir la consulta SQL para la inserción en la tabla "addon_details"
    const insertAddonDetailsSQL = 'INSERT INTO addon_details (addon_id, name, price, status) VALUES (?, ?, ?, ?)';
    const addonDetailsValues = [id, name, price, status];

    // Ejecutar la consulta SQL para la inserción en la tabla "addon_details"
    connection.query(insertAddonDetailsSQL, addonDetailsValues, (error, results) => {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

        if (error) {
            console.error('Error while inserting addon details:', error.stack);
            sendJsonResponse(res, 'error', 'Error al insertar los detalles del addon', null, executionTime);
            return;
        }

        sendJsonResponse(res, 'success', 'Detalle del addon creado con éxito', { id: results.insertId }, executionTime);
    });
};

// Actualizar addon
exports.updateAddonDetail = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const id = req.params.id; // Obtener el ID del addon de los parámetros de ruta
    const { addon_id, name, price, status } = req.body; // Obtener los datos a actualizar del cuerpo de la petición

    // Verificar que al menos uno de los campos a actualizar esté presente en el cuerpo de la petición
    if (!addon_id && !name && !price && status === undefined) {
        sendJsonResponse(res, 'error', 'Least one field is required');
        return;
    }

    // Construir la consulta SQL dinámicamente
    let sql = 'UPDATE addon_details SET ';
    const updateFields = [];
    const updateValues = [];

    if (addon_id) {
        updateFields.push('addon_id = ?');
        updateValues.push(addon_id);
    }
    if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
    }

    if (price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(price);
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

        sendJsonResponse(res, 'success', 'Addon detail updated successfully', null, executionTime);
    });
};