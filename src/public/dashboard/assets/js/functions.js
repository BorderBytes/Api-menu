function cargarTabla(){
    $('#tabla').DataTable().clear().destroy();
    $('#tabla').DataTable({
        dom: "lBfrtip",
        buttons: [
            {
                extend: 'copy',
                exportOptions: {
                    columns: [0,2,3] // Solo exporta las columnas 0, 2, y 3
                }
            },
            {
                extend: 'csv',
                exportOptions: {
                    columns: [0,2,3] // Solo exporta las columnas 0, 2, y 3
                }
            },
            {
                extend: 'excel',
                exportOptions: {
                    columns: [0,2,3] // Solo exporta las columnas 0, 2, y 3
                }
            },
            {
                extend: 'print',
                exportOptions: {
                    columns: [0,2,3] // Solo exporta las columnas 0, 2, y 3
                }
            }
        ],
        exportOptions: {
            columns: [0,2,3] // Solo exporta las columnas 0, 1, 2, y 3
        },
        lengthMenu: [
            [5, 10, 25],
            [5, 10, 25] // Opciones para mostrar número de filas por página
        ],
        order: [[0, 'desc']], // 0 es el índice de la primera columna
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/categories/search",
            "type": "GET",
        },
        "columns": [
            {"data": "id"},
            {"data": "id", "render": function(data, type, row) {
                
                
            return `<img  class="img-responsive w-100 br-5" src="/images/categories/${row.image}/${row.originalImageName}" alt="${row.name}">`;
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
                
                let option = `<li><a class="dropdown-item" id="toggle_status">Eliminar</a></li>`;
                if(row.status === 0){
                    td = `<li><a class="dropdown-item" id="toggle_status">Restaurar</a></li>`;
                }
                return `<td>
                <div class="dropdown" data-name="${row.name}" data-image="/images/categories/${row.image}/${row.originalImageName}" data-id="${row.id}">
                    <a href="#" role="button" id="dropdownMenuLink1" data-bs-toggle="dropdown" aria-expanded="false" class="">
                        <i class="ri-more-2-fill"></i>
                    </a>

                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink1" style="">
                        <li><a class="dropdown-item" id="editar">Editar</a></li>
                        ${option}
                    </ul>
                        </td>`;
            }},
        ],
        "drawCallback": function() {
            const tableWrapper = document.querySelector("#tabla");
            if (tableWrapper) {
                
            }
        
            // Aplicar GLightbox para las imágenes dentro de la tabla
            GLightbox({
                selector: "#tabla img",
                title: !1
            });
        }
    });
};

function limpiar_inputs(){
    $('#cancelar_editar').addClass('d-none');
    $('input').val('');
    $('#agregar').data('id',null);

    // Obtén una referencia al elemento HTML donde se encuentra FilePond
    const filepondElement = document.querySelector('.filepond');

    // Si ya existe una instancia de FilePond, obtén esa instancia
    const existingInstance = FilePond.find(filepondElement);

    if (existingInstance) {
        // Elimina todos los archivos cargados
        existingInstance.removeFiles();

        // Si necesitas cambiar alguna opción o configuración, hazlo aquí utilizando los métodos apropiados. Por ejemplo:
        // existingInstance.setOptions({ ... });
    }

}


// Función para cargar la vista
function cargarVista(vista) {
    $.ajax({
        url: '/dashboard/assets/views/' + vista + '.html',
        type: 'GET',
        success: function(data) {
            $('#contenido').html(data);
            
            // Ejecuta la función correspondiente a la vista cargada, si existe
            funcionesGenerales();
            if (funcionesVista[vista]) {
                funcionesVista[vista]();
            }
        },
        error: function(error) {
            console.error('Error al cargar la vista HTML:', error);
        }
    });
}
function funcionesGenerales(){
    cargarScript("assets/template/js/app.js");
}
// Función para obtener la vista de la URL
function obtenerVistaDeURL() {
    var partesURL = window.location.pathname.split('/');
    var indiceDashboard = partesURL.indexOf('dashboard');
    if (indiceDashboard !== -1 && indiceDashboard + 1 < partesURL.length && partesURL[indiceDashboard + 1] !== '') {
        return partesURL[indiceDashboard + 1];
    }
    return 'main'; // Retorna 'inicio' como vista por defecto si no se encuentra otra vista en la URL o si está vacía
}

// Función para cambiar la URL sin recargar la página
function cambiarURL(url) {
    window.history.pushState(null, null, url);
}
function cargarScript(url, callback) {
    var script = document.createElement("script");
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

var funcionesVista = {
    'main': function() {
        charts();
    },
    'categories': function() {
        // Registrar plugins
        // Registrar plugins
        FilePond.registerPlugin(
            FilePondPluginFileEncode,
            FilePondPluginFileValidateSize,
            FilePondPluginImageExifOrientation,
            FilePondPluginImagePreview,
        );

        // Crear instancia FilePond
        FilePond.create(document.querySelector('.filepond'), {
            storeAsFile: true,
        });
        cargarTabla();
        
        
    },
    'files': function(){
        $.ajax({
            type: "GET",
            url: "/images/total",
            success: function (response) {
                let mb = bytesTo(response.grandTotalSize);
                let percentage = calcPercentage(response.grandTotalSize,104857600);
                $('#file_progress').css('width',percentage + '%');
                $('#actual_mb').text(mb);
            }
        });
    }
};
function bytesTo(bytes, conversor = 'MB') {
    let size = bytes / 1048576;
    return size.toFixed(2); // Redondear a dos decimales
}
function calcPercentage(grandTotalSize, limit) {
    if (grandTotalSize < 0 || limit <= 0) {
        throw new Error("Ambos valores deben ser mayores que cero.");
    }

    const percentage = Math.round((grandTotalSize / limit) * 100);
    return percentage;
}

// Función para mostrar el toast
function notify(title,message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',  // Cambia la posición según prefieras ('top-end' es la esquina superior derecha)
        showConfirmButton: false,
        timer: 3000,  // Duración del toast en milisegundos
        timerProgressBar: true,  // Muestra la barra de progreso
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: title,  // Cambia el ícono según prefieras ('success', 'error', 'info', etc.)
        title: message  // Cambia el título del toast según prefieras
    });
}

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

function cargarImagen(IMAGE_URL) {
    // Obtener el blob de la imagen a partir de la URL
    fetch(IMAGE_URL)
        .then(response => response.blob())
        .then(blob => {
            // Convertir el blob en un objeto File
            const file = new File([blob], "nombre-de-imagen.jpg", { type: "image/jpeg" }); // Asegúrate de usar el tipo MIME correcto

            // Añadir el objeto File a FilePond
            const pond = FilePond.find(document.querySelector('.filepond'));
            if (pond) {
                pond.addFile(file);
            }
        })
        .catch(error => {
            console.error("Hubo un error cargando la imagen:", error);
        });

    return true;
}
