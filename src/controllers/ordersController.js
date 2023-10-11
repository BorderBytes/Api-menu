// Nos conectamos a la bd
const connection = require('../config/database.js');
// Incluimos las funciones
const {calculateExecutionTime, sendJsonResponse} = require('../utils/utilsCRUD.js');
// Mensaje estandar de error
const error_message = 'Error in mysql query';
// Mensaje estandar consulta completa
const success_message = null;
// Mensaje estanadar sin resultados
const no_data_message = null;

const path = require('path');
const fs = require('graceful-fs');
const socketConfig = require('../config/socket.js');

// Enviar actualizacion a dash cada x cambio
//const io = socketConfig.getIO();
//io.to('dashboardRoom').emit('status', 'controlador');

exports.searchOrders = (req, res) => {
    let draw = parseInt(req.query.draw);
    let start = parseInt(req.query.start) || 0;
    let length = parseInt(req.query.length) || 10;
    let search = (req.query.search && req.query.search.value) ? req.query.search.value : '';
    let orderColumn = req.query.order[0].column;
    let orderDir = req.query.order[0].dir;

    let columns = [
        'orders.id',
        'payment_methods.name',
        'order_types.name',
        'order_statuses.id',
        'clients.name',
        'client_addresses.address',
        'orders.order_date',
        'orders.shipping_cost',
        'orders.total_order'
    ];
    let orderBy = columns[orderColumn];
    search = `%${search}%`;

    const startTime = performance.now();

    connection.query('SELECT COUNT(*) AS total FROM orders', (err, totalResult) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err.stack);
            return res.status(500).json({error: 'Error interno del servidor'});
        }

        let total = totalResult[0].total;

        connection.query(`SELECT orders.id, payment_methods.name AS payment_method_name, order_types.name AS order_type_name, order_statuses.id AS order_status_id, clients.name AS client_name, client_addresses.address, orders.order_date, orders.shipping_cost, orders.total_order 
      FROM orders 
      LEFT JOIN payment_methods ON orders.payment_method_id = payment_methods.id
      LEFT JOIN order_types ON orders.order_type_id = order_types.id
      LEFT JOIN order_statuses ON orders.order_status_id = order_statuses.id
      LEFT JOIN clients ON orders.client_id = clients.id
      LEFT JOIN client_addresses ON orders.address_id = client_addresses.id
      WHERE orders.id LIKE ? 
      ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`, [
            search, length, start
        ], async (error, results) => {
            const executionTimeMs = Math.round(performance.now() - startTime);

            if (error) {
                console.error('Error al ejecutar la consulta:', error.stack);
                return res.status(500).json({error: 'Error interno del servidor'});
            }

            connection.query('SELECT COUNT(*) AS filtered FROM orders WHERE id LIKE ?', [search], (err, filteredResult) => {
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
exports.getOrderById = (req, res) => {
    let orderId = req.params.id;
    if (!orderId) {
        return res.status(400).json({error: 'Order ID is required'});
    }

    const startTime = performance.now();

    connection.query(`SELECT orders.id, payment_methods.name AS payment_method_name, order_types.name AS order_type_name, order_statuses.id AS order_status_id, clients.name AS client_name, client_addresses.address, orders.order_date, orders.shipping_cost, orders.total_order 
      FROM orders 
      INNER JOIN payment_methods ON orders.payment_method_id = payment_methods.id
      INNER JOIN order_types ON orders.order_type_id = order_types.id
      INNER JOIN order_statuses ON orders.order_status_id = order_statuses.id
      INNER JOIN clients ON orders.client_id = clients.id
      INNER JOIN client_addresses ON orders.address_id = client_addresses.id
      WHERE orders.id = ?`, [
        orderId
    ], async (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (error) {
            console.error('Error executing the query:', error.stack);
            return res.status(500).json({error: 'Internal server error'});
        }

        if (results.length === 0) {
            return res.status(404).json({error: 'Order not found'});
        }

        // Getting the totalSubtotal
        const products = await getProductsByOrderIdHelper(orderId);
        const totalSubtotal = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);

        const total = totalSubtotal + results[0].shipping_cost;

        res.json({
            data: {...results[0], totalSubtotal, total},
            executionTimeMs: executionTimeMs
        });
    });
};

const getProductsByOrderIdHelper = (orderId) => {
    return new Promise((resolve, reject) => {
        connection.query(`
            SELECT order_products.id, order_products.product_id, products.name AS product_name, products.image AS product_image, order_products.unit_kg, order_products.price, order_products.quantity, order_products.comments,order_products.subtotal
            FROM order_products
            INNER JOIN products ON order_products.product_id = products.id
            WHERE order_products.order_id = ?`, [
            orderId
        ], (error, products) => {
            if (error) {
                reject(error);
            } else {
                resolve(products);
            }
        });
    });
};

exports.getProductsByOrderId = (req, res) => {
    // Assuming the order ID is passed as a query parameter
    let orderId = req.params.id;
    if (!orderId) {
        return res.status(400).json({error: 'Order ID is required'});
    }

    const startTime = performance.now();

    getProductsByOrderIdHelper(orderId).then(products => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (products.length === 0) {
            return res.status(404).json({error: 'No products found for the given order ID'});
        }

        res.json({
            data: products,
            executionTimeMs: executionTimeMs
        });
    }).catch(error => {
        console.error('Error executing the query:', error.stack);
        return res.status(500).json({error: 'Internal server error'});
    });
};

exports.getOrderLogsById = (req, res) => {
    // Extracting the order ID from request parameters
    let orderId = req.params.id;
    if (!orderId) {
        return res.status(400).json({error: 'Order ID is required'});
    }

    const startTime = performance.now();

    connection.query(`
      SELECT id, id_order, prev_status, new_status, date 
      FROM order_logs 
      WHERE id_order = ? 
      ORDER BY date DESC`, [
        orderId
    ], (error, logs) => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (error) {
            console.error('Error executing the query:', error.stack);
            return res.status(500).json({error: 'Internal server error'});
        }

        if (logs.length === 0) {
            return res.status(404).json({error: 'No logs found for the given order ID'});
        }

        res.json({
            data: logs,
            executionTimeMs: executionTimeMs
        });
    });
};

exports.getAllOrderStatuses = (req, res) => {
    const startTime = performance.now();

    connection.query(`
      SELECT * FROM order_statuses 
      ORDER BY id DESC`, [], (error, statuses) => {
        const executionTimeMs = Math.round(performance.now() - startTime);

        if (error) {
            console.error('Error executing the query:', error.stack);
            return res.status(500).json({error: 'Internal server error'});
        }

        if (statuses.length === 0) {
            return res.status(404).json({error: 'No order statuses found'});
        }

        res.json({
            data: statuses,
            executionTimeMs: executionTimeMs
        });
    });
};
