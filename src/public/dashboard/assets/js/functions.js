function cargarTabla(){
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
                return `<td><img src="/images/categories/${data}" alt="" class="cart-img"></td>`;
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
                if(row.status === 1){
                    td = `<a href="javascript:void(0)" id="restaurar" class="btn btn-square btn-success-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${data}" title="" data-bs-original-title="Remove" aria-label="Remove"><i class="icon icon-reload  fs-13"></i></a>`;
                }
                return `<td>
                            <a href="javascript:void(0)" id="editar" data-name="${row.name}" data-image="/images/categories/${row.image}" class="btn btn-square btn-primary-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${data}" title="" data-bs-original-title="Editar" aria-label="Editar"><i class="icon icon-pencil  fs-13"></i></a>
                            ${td}
                            
                        </td>`;
            }},
        ]
    });
};
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