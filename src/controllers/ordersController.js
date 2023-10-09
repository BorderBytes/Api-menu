// Nos conectamos a la bd
const connection = require('../config/database.js');
// Incluimos las funciones
const { calculateExecutionTime, sendJsonResponse } = require('../utils/utilsCRUD.js');
// Mensaje estandar de error
const error_message = 'Error in mysql query';
// Mensaje estandar consulta completa
const success_message = null;
// Mensaje estanadar sin resultados
const no_data_message = null;

const path = require('path');
const fs = require('graceful-fs');

exports.searchOrders = (req, res) => {
  let draw = parseInt(req.query.draw);
  let start = parseInt(req.query.start) || 0;
  let length = parseInt(req.query.length) || 10;
  let search = (req.query.search && req.query.search.value) ? req.query.search.value : '';
  let orderColumn = req.query.order[0].column;
  let orderDir = req.query.order[0].dir;
  
  let columns = ['orders.id', 'payment_methods.name', 'order_types.name', 'order_statuses.name', 'clients.name', 'client_addresses.address', 'orders.order_date', 'orders.shipping_cost', 'orders.total_order'];
  let orderBy = columns[orderColumn];
  search = `%${search}%`;
  
  const startTime = performance.now();

  connection.query('SELECT COUNT(*) AS total FROM orders', (err, totalResult) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err.stack);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    let total = totalResult[0].total;

    connection.query(
      `SELECT orders.id, payment_methods.name AS payment_method_name, order_types.name AS order_type_name, order_statuses.name AS order_status_name, clients.name AS client_name, client_addresses.address, orders.order_date, orders.shipping_cost, orders.total_order 
      FROM orders 
      LEFT JOIN payment_methods ON orders.payment_method_id = payment_methods.id
      LEFT JOIN order_types ON orders.order_type_id = order_types.id
      LEFT JOIN order_statuses ON orders.order_status_id = order_statuses.id
      LEFT JOIN clients ON orders.client_id = clients.id
      LEFT JOIN client_addresses ON orders.address_id = client_addresses.id
      WHERE orders.id LIKE ? 
      ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
      [search, length, start],
      async (error, results) => {
        const executionTimeMs = Math.round(performance.now() - startTime);
  
        if (error) {
          console.error('Error al ejecutar la consulta:', error.stack);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        connection.query('SELECT COUNT(*) AS filtered FROM orders WHERE id LIKE ?', [search], (err, filteredResult) => {
          if (err) {
            console.error('Error al ejecutar la consulta:', err.stack);
            return res.status(500).json({ error: 'Error interno del servidor' });
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
      }
    );
  });
};


