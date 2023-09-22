const { performance } = require('perf_hooks');

// Función para calcular tiempo de ejecución
exports.calculateExecutionTime = (startTime) => {
  const endTime = performance.now();
  return Math.round((endTime - startTime) * 100) / 100; // Redondeado a 2 decimales
};

// Función genérica para enviar respuestas en formato JSON
exports.sendJsonResponse = (res, status, message, data = null, executionTime = null,total_results = null) => {
  const response = {
    status: status,
    info: message,
    data: data
  };

  if (executionTime !== null) {
    response.execution_time_ms = executionTime;
  }

  if (total_results) {
    response.total_results = total_results;
  }

  res.json(response);
};