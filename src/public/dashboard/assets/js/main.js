vista = null;
$(document).ready(function () {
  // Cargar la vista al recargar la página
  vista = obtenerVistaDeURL();
  cargarVista(vista);
  loadListeners();


});
