$(document).ready(function () {
  // Cargar la vista al recargar la página
  var vista = obtenerVistaDeURL();
  cargarVista(vista);

  // Escuchar clics en los enlaces y cambiar la URL y cargar la vista correspondiente
  $("a").on("click", function (e) {
    e.preventDefault(); // Evitar el comportamiento predeterminado del enlace en todos los casos.

    var href = $(this).attr("href");

    if (href === "#") {
      return false; // Finaliza la función si el href es igual a "#".
    }

    var vista = href.split("/").pop();
    cambiarURL(href);
    cargarVista(vista);
  });

  // Escuchar cambios en el historial del navegador y cargar la vista correspondiente
  $(window).on("popstate", function () {
    if (!window.location.hash) {
      var vista = obtenerVistaDeURL();
      cargarVista(vista);
    }
  });

  // Listener para mostrar la galería al hacer click a cualquier imagen de la tabla
  $(document).on("click", "[data-imgGallery]", function () {
    let img = $(this).data("imggallery");
    $(`#lightgallery [data-src="${img}"]`).trigger("click");
  });

  $(document).on("submit", "#form", function (e) {
    e.preventDefault();
    let id = $("#agregar").data("id");
    // Para crear un nuevo registro
    let API = {
      url: "/categories",
      type: "POST",
    };
    // Para editar un regristro
    if (id > 0) {
      API = {
        url: "/categories/" + id,
        type: "PUT",
      };
    }
    // Tomar datos del formulario
    var formData = new FormData(this);
    ajaxForm(API.url, API.type, formData)
      .then((response) => {
        id = 0;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  $(document).on("click", "#eliminar,#restaurar", function (e) {
    let id = $(this).data("id");
    let button_element = e.target;
    loaderButton(button_element);
    ajaxForm("/categories/status/" + id, 'PATCH',null,false)
      .then((response) => {
        let tag = `<span class="badge bg-danger">Desactivada</span>`;
        let button = `<a href="javascript:void(0)" id="restaurar" class="btn btn-square btn-success-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${id}" title="" data-bs-original-title="Remove" aria-label="Remove"><i class="icon icon-reload  fs-13"></i></a>`;
        if (response.data == 1) {
          tag = `<span class="badge bg-success">Disponible</span>`;
          button = `<a href="javascript:void(0)" id="eliminar" class="btn btn-square btn-danger-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${id}" title="" data-bs-original-title="Remove" aria-label="Remove"><i class="icon icon-trash  fs-13"></i></a>`;
        }
        $(button_element).parent().prev().html(tag);
        $(button_element).replaceWith(button);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
  let image = null;
  $(document).on("click", "#editar", function () {
    $('#cancelar_editar').removeClass('d-none');
    let name = $(this).data("name");
    let image = $(this).data("image");
    let id = $(this).data("id");
    $("#agregar").data("id", id);
    $('input[name="name"]').val(name);
    cargarDropify(image);
    $('#agregar').addClass('btn-primary').removeClass('success').html('Editar');
  });

  $(document).on("click", "#cancelar_editar", function () {
    limpiar_inputs();
    $('#agregar').addClass('btn-success').removeClass('primary').html('Agregar');
  });

});
