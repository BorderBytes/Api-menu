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

// Función para buscar órdenes, compatible con data-tables
exports.searchOrders = (req, res) => {
  let draw = parseInt(req.query.draw);
  let start = parseInt(req.query.start) || 0;
  let length = parseInt(req.query.length) || 10;
  let search = (req.query.search && req.query.search.value) ? req.query.search.value : ''; // Para filtrado global
  let orderColumn = req.query.order[0].column; // Índice de columna por la que se ordena
  let orderDir = req.query.order[0].dir; // Dirección de ordenación, asc o desc
  // Columnas a ordenar, igual a datatables
  let columns = ['id','payment_method_id','order_type_id','order_status_id','client_id','address_id','order_date','shipping_cost','total_order'];
  let orderBy = columns[orderColumn];
  
  search = `%${search}%`; // Prepara el valor de búsqueda para el LIKE
  
  const startTime = performance.now();

  connection.query('SELECT COUNT(*) AS total FROM orders', (err, totalResult) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err.stack);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    let total = totalResult[0].total;

    connection.query(
      `SELECT * FROM orders WHERE id LIKE ? ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
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

