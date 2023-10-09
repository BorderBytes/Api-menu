// Nos conectamos a la bd
const connection = require("../config/database.js");
// Incluimos las funciones
const { calculateExecutionTime, sendJsonResponse } = require('../utils/utilsCRUD');
// Mensaje estandar de error
const error_message = 'Error in mysql query';
// Mensaje estandar consulta completa
const success_message = null;
// Mensaje estanadar sin resultados
const no_data_message = null;

// Función para obtener todos los usuarios
exports.getUsers = (req, res) => {
    const startTime = performance.now();
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    connection.query(
        "SELECT * FROM users LIMIT ? OFFSET ?",
        [limit, offset],
        (error, results) => {
            const executionTimeMs = Math.round(performance.now() - startTime);

            if (error) {
                console.error("Error ejecutando la consulta:", error.stack);
                sendJsonResponse(res, 'error', error_message, null, executionTimeMs);
                return;
            }

            sendJsonResponse(res, 'success', success_message, results, executionTimeMs);
        }
    );
};

// Obtener un usuario por ID
exports.getUserById = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador
    const id = req.params.id;

    connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id],
        (error, results) => {
            const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

            if (error || results.length === 0) {
                sendJsonResponse(res, 'error', 'User not found', null, executionTime);
                return;
            }
            sendJsonResponse(res, 'success', 'User retrieved successfully', results[0], executionTime);
        }
    );
};

// Buscar usuarios
exports.searchUsers = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador
    
    const level_id = req.query.level_id;
    const status_id = req.query.status_id;
    const email = req.query.email;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    let sql = 'SELECT id,level_id,status_id,email FROM users WHERE ';

    const searchConditions = [];
    const searchValues = [];

    if (level_id) {
        searchConditions.push('level_id = ?');
        searchValues.push(level_id);
    }

    if (status_id) {
        searchConditions.push('status_id = ?');
        searchValues.push(status_id);
    }

    if (email) {
        searchConditions.push('email LIKE ?');
        searchValues.push(`%${email}%`);
    }
    
    // Verificar si no se proporcionó ningún criterio de búsqueda válido
    if (searchConditions.length === 0) {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución
        sendJsonResponse(res, 'error', 'Se requieren parámetros de búsqueda válidos', null, executionTime);
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

        sendJsonResponse(res, 'success', 'Users retrieved successfully', results, executionTime);
    });
};


const bcrypt = require('bcryptjs'); 
const saltRounds = 10; 

exports.createUser = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const { level_id, status_id, email, password } = req.body;

    if (!level_id || !status_id || !email || !password) {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución
        sendJsonResponse(res, 'error', 'level_id, status_id, email, and password are required', null, executionTime);
        return;
    }

    // Encriptar la contraseña
    bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
        if (error) {
            const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución
            console.error('Error while hashing password:', error.stack);
            sendJsonResponse(res, 'error', 'Error while hashing password', null, executionTime);
            return;
        }

        // Insertar en la base de datos
        connection.query('INSERT INTO users (level_id, status_id, email, password) VALUES (?, ?, ?, ?)', [level_id, status_id, email, hashedPassword], (error, results) => {
            const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

            if (error) {
                console.error('Error while inserting:', error.stack);
                sendJsonResponse(res, 'error', 'Error while inserting user', null, executionTime);
                return;
            }

            sendJsonResponse(res, 'success', `User created with ID: ${results.insertId}`, null, executionTime);
        });
    });
};
exports.createBundleUser = (req, res) => {
    const startTime = performance.now(); // Start the timer

    const { level_id, status_id, email, password, name, phone } = req.body;

    if (!level_id || !status_id || !email || !password || !name || !phone) {
        const executionTime = calculateExecutionTime(startTime); // Calculate execution time
        sendJsonResponse(res, 'error', 'level_id, status_id, email, password, name, and phone are required', null, executionTime);
        return;
    }

    bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
        if (error) {
            const executionTime = calculateExecutionTime(startTime); // Calculate execution time
            console.error('Error while hashing password:', error.stack);
            sendJsonResponse(res, 'error', 'Error while hashing password', null, executionTime);
            return;
        }

        // Insert into the database
        connection.query('INSERT INTO users (level_id, status_id, email, password) VALUES (?, ?, ?, ?)', [level_id, status_id, email, hashedPassword], (error, results) => {
            if (error) {
                const executionTime = calculateExecutionTime(startTime); // Calculate execution time
                console.error('Error while inserting:', error.stack);
                sendJsonResponse(res, 'error', 'Error while inserting user', null, executionTime);
                return;
            }

            // Once the user is inserted successfully, now insert into clients table
            connection.query('INSERT INTO clients (user_id, name, phone) VALUES (?, ?, ?)', [results.insertId, name, phone], (error, clientResults) => {
                const executionTime = calculateExecutionTime(startTime); // Calculate execution time

                if (error) {
                    console.error('Error while inserting client:', error.stack);
                    sendJsonResponse(res, 'error', 'Error while inserting client', null, executionTime);
                    return;
                }

                sendJsonResponse(res, 'success', `User created with ID: ${results.insertId} and Client created with ID: ${clientResults.insertId}`, null, executionTime);
            });
        });
    });
};

exports.updateUser = (req, res) => {
    const startTime = performance.now(); // Iniciar el temporizador

    const id = req.params.id;
    const { level_id, status_id, email, password } = req.body;

    // Verificar si se proporcionó al menos un campo para actualizar
    if (!level_id && !status_id && !email && !password) {
        const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución
        sendJsonResponse(res, 'error', 'Se debe proporcionar al menos un campo para actualizar', null, executionTime);
        return;
    }

    const handleQueryExecution = (sql, values) => {
        connection.query(sql, values, (error) => {
            const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución

            if (error) {
                console.error('Error while updating:', error.stack);
                sendJsonResponse(res, 'error', 'Error while updating user', null, executionTime);
                return;
            }
            sendJsonResponse(res, 'success', 'User updated successfully', null, executionTime);
        });
    };

    // Encriptar la nueva contraseña si se proporciona
    if (password) {
        bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
            if (error) {
                const executionTime = calculateExecutionTime(startTime); // Calcular tiempo de ejecución
                console.error('Error while hashing password:', error.stack);
                sendJsonResponse(res, 'error', 'Error while hashing password', null, executionTime);
                return;
            }

            // Construir consulta SQL de actualización con la nueva contraseña encriptada
            const sql = 'UPDATE users SET ' +
                (level_id ? 'level_id = ?,' : '') +
                (status_id ? 'status_id = ?,' : '') +
                (email ? 'email = ?,' : '') +
                'password = ? ' +
                'WHERE id = ?';

            const values = [];
            if (level_id) values.push(level_id);
            if (status_id) values.push(status_id);
            if (email) values.push(email);
            values.push(hashedPassword, id);

            handleQueryExecution(sql, values);
        });
    } else {
        // Si no se proporciona nueva contraseña, actualizar los otros campos
        const sql = 'UPDATE users SET ' +
            (level_id ? 'level_id = ?,' : '') +
            (status_id ? 'status_id = ?,' : '') +
            (email ? 'email = ?,' : '') +
            'password = password ' +
            'WHERE id = ?';

        const values = [];
        if (level_id) values.push(level_id);
        if (status_id) values.push(status_id);
        if (email) values.push(email);
        values.push(id);

        handleQueryExecution(sql, values);
    }
};
