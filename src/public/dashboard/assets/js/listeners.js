function loadListeners() { // Escuchar clics en los enlaces y cambiar la URL y cargar la vista correspondiente
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
        let id = $('[type="submit"]').data("id");
        // Para crear un nuevo registro
        let API = {
            url: `/${vista}`,
            type: "POST"
        };
        // Para editar un registro
        if (id > 0) {
            API = {
                url: `/${vista}/` + id,
                type: "PUT"
            };
        }
        // Tomar datos del formulario
        var formData = new FormData(this);
        ajaxForm(API.url, API.type, formData).then((response) => {
            notify(response.status, response.info);
            resetButtonsForm();
            id = 0;
        }).catch((error) => {
            console.error("Error:", error);
        });
    });


    $(document).on("change", "#SwitchCheck1", function (e) {
        let button_element = e.target;
        let id = $(button_element).data('id');
        let tabla = "";
        // Realiza la llamada AJAX y cuando se complete:
        ajaxForm(`/${vista}/status/${id}`, 'PATCH', null, false).then((response) => {
            let tag = '';
            let check = false;
            if (response.data == 1) {
                tag = ``;
                check = true;
            }
            $(button_element).next().text(tag);
            $(button_element).attr("checked", check);

        }).catch((error) => {
            console.error("Error:", error);
        });
    });
    let image = null;
    $(document).on("click", "#editar", function () {
        $('#cancelar_editar').removeClass('d-none');
        const INFO_ELEMENT = $(this).parent().parent().parent();
        console.log(INFO_ELEMENT);
        let name = INFO_ELEMENT.data("name");
        let image = INFO_ELEMENT.data("image");
        let id = INFO_ELEMENT.data("id");
        $('[type="submit"]').data("id", id);
        $('input[name="name"]').val(name);
        cargarImagen(image);
        $('[type="submit"]').addClass('btn-primary').removeClass('success').html('Editar');
    });
    $(document).on("click", "#editar_addon", function () {
        let id = $(this).data('id');
        $('#cancelar_editar').removeClass('d-none');
        $('#crear_addon').data("id", id);
        $('#crear_addon').addClass('btn-primary').removeClass('success').html('Editar');
        $.ajax({
            type: "GET",
            url: `/addons/${id}`,
            success: function (response) {
                let data = response.data;
                $('#complementName').val(data.name);
                $('#minValue').val(data.min);
                $('#maxValue').val(data.max);
                
                let details = data.details;
                let detailsHtml = '';
        
                for (let i = 0; i < details.length; i++) {
                    detailsHtml += `
                    <div class="row extra-row d-flex justify-content-center align-items-center">
                        <div class="col-7">
                            <div class="mb-3">
                                <label for="extraName" class="form-label">Nombre del extra</label>
                                <input type="text" name="extraName" class="form-control" value="${details[i].name}" placeholder="Nombre del extra....">
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="mb-3">
                                <label for="extraPrice" class="form-label">Precio</label>
                                <input type="text" name="extraPrice" class="form-control" value="${details[i].price}" placeholder="Precio">
                            </div>
                        </div>
                        <div class="col-2">
                            <button type="button" class="btn btn-danger remover_extra">-</button>  <!-- Cambiado a clase -->
                        </div>
                    </div>`;
                }
                $('#detalle_complemento').html(detailsHtml);
            }
        });        
    });
    $(document).on("click", "#cancelar_editar", function () {
        limpiar_inputs();
        $('#agregar').addClass('btn-success').removeClass('primary').html('Agregar');
    });

    $(document).on('click', '#agregar_input', function () {
        let html = `<div class="row d-flex align-items-center justify-content-between">
            <div class="col-md-7">
                <div class="form-group">
                    <label class="form-label">Nombre <span class="text-red">*</span></label>
                    <input type="text" class="form-control" name="name" placeholder="Nombre">
                </div>
            </div>
            <div class="col-md-3">
                <div class="form-group">
                    <label class="form-label">Precio</label>
                    <input type="number" class="form-control" name="price" placeholder="0.00">
                </div>
            </div>
            <div class="col-md-2">
              <button type="button" id="quitar_input" class="btn-danger btn mt-4 float-end">
                  <i class="fa fa-minus"></i>
              </button>
          </div>
        </div>`;
        $('#inputs_complementos').append(html);
    });

    $(document).on('click', '#quitar_input', function () {
        $(this).parent().parent().remove();
    });
    $(document).on('click', '#crear_addon', function () {
        let name = $('#complementName').val();
        let min = $('#minValue').val();
        let max = $('#maxValue').val();
        let details = [];
    
        // Iterar a través de cada fila de detalles en #detalle_complemento
        $('#detalle_complemento .row').each(function () {
            let extraName = $(this).find('input[name="extraName"]').val();
            let extraPrice = $(this).find('input[name="extraPrice"]').val();
            details.push({name: extraName, price: parseFloat(extraPrice)});
        });
    
        // Construir el cuerpo de la petición
        let data = {
            name: name,
            min: parseInt(min),
            max: parseInt(max),
            details: details
        };
    
        let ajaxURL = '/addons'; // URL por defecto
        let ajaxMethod = 'POST'; // Método por defecto
    
        // Si el botón tiene data-id y tiene un valor
        let id = $(this).data('id');
        if (id) {
            ajaxURL = `/addons/${id}`;
            ajaxMethod = 'PUT';
        }
    
        // Realizar la solicitud AJAX a la API
        $.ajax({
            url: ajaxURL,
            method: ajaxMethod,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                console.log(response);
                if (ajaxMethod === 'PUT') {
                    notify("warning","Registro actualizado");
                    limpiar_inputs();
                    cargarTablaComplementos();
                } else {
                    notify("warning","Registro creado");
                }
            },
            error: function (error) {
                console.error(error);
                alert('Hubo un error al procesar la solicitud');
            }
        });
    });    
    $(document).on("click", "#agregar_fila", function () {
        let new_row = `
        <div class="row extra-row d-flex justify-content-center align-items-center">
            <div class="col-7">
                <div class="mb-3">
                    <label for="extraName" class="form-label">Nombre del extra</label>
                    <input type="text" name="extraName" class="form-control" placeholder="Nombre del extra....">
                </div>
            </div>
            <div class="col-3">
                <div class="mb-3">
                    <label for="extraPrice" class="form-label">Precio</label>
                    <input type="text" name="extraPrice" class="form-control" placeholder="Precio">
                </div>
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-danger remover_extra">-</button>  <!-- Cambiado a clase -->
            </div>
        </div>
    `;
        $('#detalle_complemento').append(new_row);
    });

    $(document).on('click', ".remover_extra", function () {
        // Verifica si hay más de un elemento con la clase .extra-row
        if ($('.extra-row').length > 1) {
            $(this).closest('.extra-row').remove();
        } else {
            notify("warning","Se requiere al menos 1 extra");
              
        }
    });    
}
