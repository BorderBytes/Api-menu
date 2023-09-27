function cargarTabla(){
    $('#lightgallery').html('');
    $('#tabla').DataTable().clear().destroy();
    $('#tabla').DataTable({
        order: [[0, 'desc']], // 0 es el índice de la primera columna
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/categories/search",
            "type": "GET",
        },
        "columns": [
            {"data": "id"},
            {"data": "image", "render": function(data, type, row) {
                if(data == null){
                    data = 'default.webp';
                }
                
            return `<img data-imggallery="/images/categories/${data}" class="img-responsive br-5" src="/images/categories/${data}" alt="Thumb-1">`;
            }},
            {"data": "name"},
            {"data": "status", "render": function(data, type, row) {
                let info = ["danger","Desactivada"];
                if(data === 1){
                    info = ["success","Disponible"]
                }
                return `<td><span class="badge bg-${info[0]}">${info[1]}</span></td>`;
            }},
            {"data": "id", "render": function(data, type, row) {
                let td = `<a href="javascript:void(0)" id="eliminar" class="btn btn-square btn-danger-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${data}" title="" data-bs-original-title="Remove" aria-label="Remove"><i class="icon icon-trash  fs-13"></i></a>`;
                if(row.status === 0){
                    td = `<a href="javascript:void(0)" id="restaurar" class="btn btn-square btn-success-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${data}" title="" data-bs-original-title="Remove" aria-label="Remove"><i class="icon icon-reload  fs-13"></i></a>`;
                }
                return `<td>
                            <a href="javascript:void(0)" id="editar" data-name="${row.name}" data-image="/images/categories/${row.image}" class="btn btn-square btn-primary-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${row.id}" title="" data-bs-original-title="Editar" aria-label="Editar"><i class="icon icon-pencil  fs-13"></i></a>
                            ${td}
                            
                        </td>`;
            }},
        ],
        "drawCallback": function() {
            var api = this.api();
            api.rows().every(function(){
                var data = this.data();
                var name = data.name;
                var image = data.image || 'default.webp';
                $('#lightgallery').append(`<li data-responsive="/images/categories/${image}" data-src="/images/categories/${image}" data-sub-html="<h4>${name}</h4><p> Categoria</p>">
                        <a href="">
                        <img class="img-responsive br-5" src="/images/categories/${image}" alt="${name}">
                        </a>
                    </li>`);
            });
            lightGallery(document.getElementById('lightgallery'));
        }
    });
};

function limpiar_inputs(){
    $('#cancelar_editar').addClass('d-none');
    $('input').val('');
    // Obtener la instancia de Dropify
    let drInstance = $('input[name="image"]').dropify();
    drInstance = drInstance.data('dropify');
    image = null;
    // Restablecer la imagen a su valor original
    drInstance.clearElement();
    drInstance.settings.defaultFile = drInstance.getFilePreview();
    $('#agregar').data('id',null);
    // Puedes reinicializar la instancia de Dropify si es necesario
    drInstance.init();
}

// Función para cargar la vista
function cargarVista(vista) {
    $.ajax({
        url: '/dashboard/assets/views/' + vista + '.html',
        type: 'GET',
        success: function(data) {
            $('#contenedor_inicio').html(data);
            
            // Ejecuta la función correspondiente a la vista cargada, si existe
            if (funcionesVista[vista]) {
                funcionesVista[vista]();
            }
        },
        error: function(error) {
            console.error('Error al cargar la vista HTML:', error);
        }
    });
}

// Función para obtener la vista de la URL
function obtenerVistaDeURL() {
    var partesURL = window.location.pathname.split('/');
    var indiceDashboard = partesURL.indexOf('dashboard');
    if (indiceDashboard !== -1 && indiceDashboard + 1 < partesURL.length && partesURL[indiceDashboard + 1] !== '') {
        return partesURL[indiceDashboard + 1];
    }
    return 'inicio'; // Retorna 'inicio' como vista por defecto si no se encuentra otra vista en la URL o si está vacía
}

// Función para cambiar la URL sin recargar la página
function cambiarURL(url) {
    window.history.pushState(null, null, url);
}

var funcionesVista = {
    'inicio': function() {
        // Código específico para nombreVista1
    },
    'categorias': function() {
        $('.dropify').dropify({
            messages: {
                'default': 'Drag and drop a file here or click',
                'replace': 'Drag and drop or click to replace',
                'remove': 'Remove',
                'error': 'Ooops, something wrong appended.'
            },
            error: {
                'fileSize': 'The file size is too big (2M max).'
            }
        });
        cargarTabla();
        
    },
};

function loaderButton(element){
    $(element).html(`<i class="fa fa-circle-o-notch fa-spin" data-bs-toggle="tooltip" title="" data-bs-original-title="fa fa-circle-o-notch" aria-label="fa fa-circle-o-notch"></i>`);
}

/**
 * Función para hacer una petición AJAX de manera asincrónica.
 *
 * @param {string} URL - La URL a la que se hará la petición.
 * @param {string} TYPE - El tipo de método HTTP (Ejemplos, "GET", "POST","PUT","PATCH","DELETE").
 * @param {object} FORM_DATA - Datos a enviar con la petición. Por defecto es null.
 * @returns {Promise} Una promesa que se resuelve con la respuesta de la petición o se rechaza con un error.
 */

function ajaxForm(URL, TYPE, FORM_DATA = null,updateView = true) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: URL,             // URL a la que se hará la petición.
            type: TYPE,           // Método HTTP a usar.
            data: FORM_DATA,      // Datos a enviar con la petición.
            processData: false,   // Indica a jQuery no procesar los datos.
            contentType: false,   // No establecer el tipo de contenido, dejar que FormData lo haga.
            success: function(response) {
                if(updateView){
                    cargarTabla();    // Actualiza la tabla con los nuevos datos.
                    limpiar_inputs(); // Limpia los campos de entrada.   
                }
                resolve(response); // Resuelve la promesa con la respuesta obtenida.
            },
            error: function(err) {
                console.error(err); // Muestra el error en la consola.
                reject(err);        // Rechaza la promesa con el error obtenido.
            }
        });
    });
}

function cargarDropify(IMAGE){
     // Destruye y Re-inicializa Dropify con la nueva imagen.
     let drInstance = $('input[name="image"]').dropify();
     drInstance = drInstance.data("dropify");
     drInstance.resetPreview();
     drInstance.clearElement();
     drInstance.destroy();
     drInstance.settings.defaultFile = IMAGE;
     drInstance.init();
}