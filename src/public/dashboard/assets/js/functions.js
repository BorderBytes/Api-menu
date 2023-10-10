let tableInstance; // Instancia de la tabla
function cargarTabla() {
    $('#tabla').DataTable().clear().destroy();
    $('#tabla').DataTable({
        dom: "lBfrtip",
        buttons: [
            {
                extend: 'copy',
                exportOptions: {
                    columns: [0, 2, 3] // Solo exporta las columnas 0, 2, y 3
                }
            }, {
                extend: 'csv',
                exportOptions: {
                    columns: [0, 2, 3] // Solo exporta las columnas 0, 2, y 3
                }
            }, {
                extend: 'excel',
                exportOptions: {
                    columns: [0, 2, 3] // Solo exporta las columnas 0, 2, y 3
                }
            }, {
                extend: 'print',
                exportOptions: {
                    columns: [0, 2, 3] // Solo exporta las columnas 0, 2, y 3
                }
            }
        ],
        "columnDefs": [
            {
                "targets": [0], // Columna "id"
                "orderable": true // Permitir ordenar
            }, {
                "targets": [2], // Columna "name"
                "orderable": true, // Permitir ordenar
                "type": "string-ci" // Ignorar mayúsculas y minúsculas al ordenar
            }, {
                "targets": [
                    1, 3, 4
                ],
                "orderable": false // Otras columnas no se pueden ordenar
            }
        ],
        exportOptions: {
            columns: [0, 2, 3] // Solo exporta las columnas 0, 1, 2, y 3
        },
        lengthMenu: [
            [
                5, 10, 25
            ],
            [5, 10, 25] // Opciones para mostrar número de filas por página
        ],
        order: [
            [0, 'desc']
        ], // 0 es el índice de la primera columna
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/categories/search",
            "type": "GET"
        },
        "columns": [
            {
                "data": "id"
            },
            {
                "data": "image",
                "render": function (data, type, row) {
                    return `<img  class="img-responsive w-100 br-5" style="height:100px; width:100px;" src="/images/categories/${
                        row.image
                    }/${
                        row.originalImageName
                    }" alt="${
                        row.name
                    }">`;
                }
            },
            {
                "data": "name"
            },
            {
                "data": "status",
                "render": function (data, type, row) {
                    let info = '';
                    let estado = "";
                    if (data === 1) {
                        info = "checked";
                        estado = "";
                    }
                    return `<td >
                            <div class="form-check form-switch d-flex justify-content-center align-items-center" style="height:100px;">
                                <input class="form-check-input" type="checkbox" role="switch" id="SwitchCheck1"  data-id="${
                        row.id
                    }" ${info}>
                            </div>
                        </td>`;
                }
            }, {
                "data": "id",
                "render": function (data, type, row) {
                    return `<td>
                <div class="dropdown" data-name="${
                        row.name
                    }" data-image="/images/categories/${
                        row.image
                    }/${
                        row.originalImageName
                    }" data-id="${
                        row.id
                    }">
                    <a href="#" role="button" id="dropdownMenuLink1" data-bs-toggle="dropdown" aria-expanded="false" class="">
                        <i class="ri-more-2-fill"></i>
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink1" style="">
                        <li style="cursor:pointer;"><a class="dropdown-item" id="editar">Editar</a></li>
                        <li><a class="dropdown-item disabled " style="pointer-events:none;"><strike>Eliminar</strike></a></li>
                    </ul>
                    
                        </td>`;
                }
            },
        ],
        "drawCallback": function () {
            const tableWrapper = document.querySelector("#tabla");
            if (tableWrapper) {}

            // Aplicar GLightbox para las imágenes dentro de la tabla
            GLightbox({
                selector: "#tabla img",
                title: !1
            });
        }
    });
};
function cargarTablaComplementos() {
    $('#tablaAddons').DataTable().clear().destroy();
    $('#tablaAddons').DataTable({
        dom: "lBfrtip",
        buttons: [
            {
                extend: 'copy'
            }, {
                extend: 'csv'
            }, {
                extend: 'excel'
            }, {
                extend: 'print'
            }
        ],
        "columnDefs": [
            {
                "targets": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6
                ],
                "orderable": false // Otras columnas no se pueden ordenar
            }
        ],
        lengthMenu: [
            [
                5, 10, 25
            ],
            [5, 10, 25] // Opciones para mostrar número de filas por página
        ],
        order: [
            [0, 'desc']
        ], // 0 es el índice de la primera columna
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/addons/search",
            "type": "GET"
        },
        "columns": [
            {
                "data": "id"
            },
            {
                "data": "name"
            },
            {
                "data": "ingredients"
            },
            {
                "data": "min"
            }, {
                "data": "max"
            }, {
                "data": "status",
                "render": function (data, type, row) {
                    let info = '';
                    let estado = "";
                    if (data === 1) {
                        info = "checked";
                        estado = "";
                    }
                    return `<td >
                            <div class="form-check form-switch d-flex justify-content-center align-items-center" style="height:100px;">
                                <input class="form-check-input" type="checkbox" role="switch" id="SwitchCheck1"  data-id="${
                        row.id
                    }" ${info}>
                            </div>
                        </td>`;
                }
            }, {
                "data": "id",
                "render": function (data, type, row) {
                    return `<td>
                <div class="dropdown" data-name="${
                        row.name
                    }"  data-id="${
                        row.id
                    }">
                    <a href="#" role="button" id="dropdownMenuLink1" data-bs-toggle="dropdown" aria-expanded="false" class="">
                        <i class="ri-more-2-fill"></i>
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink1" style="">
                        <li style="cursor:pointer;"><a class="dropdown-item"  data-id="${
                        row.id
                    }" id="editar_addon">Editar</a></li>
                        <li><a class="dropdown-item disabled " style="pointer-events:none;"><strike>Eliminar</strike></a></li>
                    </ul>
                </td>`;
                }
            },
        ]
    });
}
function cargarTablaProductos() {
    $('#tablaProductos').DataTable().clear().destroy();
    $('#tablaProductos').DataTable({
        dom: "lBfrtip",
        buttons: [
            {
                extend: 'copy'
            }, {
                extend: 'csv'
            }, {
                extend: 'excel'
            }, {
                extend: 'print'
            }
        ],
        // "columnDefs": [
        //     {
        //         "targets": [0,1,2,3,4,5,6],
        //         "orderable": false // Otras columnas no se pueden ordenar
        //     }
        // ],
        lengthMenu: [
            [
                5, 10, 25
            ],
            [5, 10, 25] // Opciones para mostrar número de filas por página
        ],
        order: [
            [0, 'desc']
        ], // 0 es el índice de la primera columna
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/products/search",
            "type": "GET"
        },
        "columns": [
            {
                "data": "id"
            },
            {
                "data": "category_id"
            },
            {
                "data": "image",
                "render": function (data, type, row) {
                    return `<img  class="img-responsive w-100 br-5" style="height:100px; width:100px;" src="/images/products/${
                        row.image
                    }/${
                        row.originalImageName
                    }" alt="${
                        row.name
                    }">`;
                }
            },
            {
                "data": "name"
            }, {
                "data": "description"
            }, {
                "data": "preparation_time"
            }, {
                "data": "price"
            }, {
                "data": "price_per_kg"
            }, {
                "data": "status",
                "render": function (data, type, row) {
                    let info = '';
                    let estado = "";
                    if (data === 1) {
                        info = "checked";
                        estado = "";
                    }
                    return `<td>
                            <div class="form-check form-switch d-flex justify-content-center align-items-center" style="height:100px;">
                                <input class="form-check-input" type="checkbox" role="switch" id="SwitchCheck1"  data-id="${
                        row.id
                    }" ${info}>
                            </div>
                        </td>`;
                }
            }, {
                "data": "id",
                "render": function (data, type, row) {
                    return `<td>
                <div class="dropdown" data-name="${
                        row.name
                    }"  data-id="${
                        row.id
                    }">
                    <a href="#" role="button" id="dropdownMenuLink1" data-bs-toggle="dropdown" aria-expanded="false" class="">
                        <i class="ri-more-2-fill"></i>
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink1" style="">
                        <li style="cursor:pointer;"><a class="dropdown-item"  data-id="${
                        row.id
                    }" id="editar_producto">Editar</a></li>
                        <li><a class="dropdown-item disabled " style="pointer-events:none;"><strike>Eliminar</strike></a></li>
                    </ul>
                </td>`;
                }
            },
        ],
        "drawCallback": function () {
            const tableWrapper = document.querySelector("#tablaProductos");
            if (tableWrapper) {}

            // Aplicar GLightbox para las imágenes dentro de la tabla
            GLightbox({
                selector: "#tablaProductos img",
                title: !1
            });
        }
    });
}
function cargarTablaOrdenes() {
    if (!tableInstance) {
    tableInstance = $('#orderTable').DataTable().clear().destroy();
    $('#orderTable').DataTable({
        "lengthChange": false,
        "searching": false,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/orders/search",
            "type": "GET"
        },
        columns: [
            {
                "data": "id",
                "render": function (data, type, row) {
                    return '<div class="form-check"><input class="form-check-input" type="checkbox" id="checkAll" value="option"></div>';
                }
            },
            {
                'data': 'id',
                "render": function (data, row, type) {
                    return '<a href="apps-ecommerce-order-details.html" class="fw-medium link-primary">#VZ12</a>';
                }
            },
            {
                data: 'payment_method_name'
            },
            {
                data: 'order_type_name'
            }, {
                data: 'order_status_id',
                "render": function(data,type,row){
                    return estadoOrden(data);
                }
            }, {
                data: 'client_name'
            }, {
                data: 'address'
            }, {
                data: 'order_date',
                "render": function (data, type, row) {
                    date = data;
                    let fecha = new Date(date);
                    return formatDateToCustomFormat(fecha);

                }
            }, {
                data: 'shipping_cost'
            }, {
                data: 'total_order'
            }, {
                "data": "id",
                "render": function (data, type, row) {
                    return `<ul class="list-inline hstack gap-2 mb-0">
                    <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" aria-label="View" data-bs-original-title="View">
                        <a href="apps-ecommerce-order-details.html" class="text-primary d-inline-block">
                            <i class="ri-eye-fill fs-16"></i>
                        </a>
                    </li>
                    <li class="list-inline-item edit" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" aria-label="Edit" data-bs-original-title="Edit">
                        <a href="#showModal" data-bs-toggle="modal" class="text-primary d-inline-block edit-item-btn">
                            <i class="ri-pencil-fill fs-16"></i>
                        </a>
                    </li>
                    <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" aria-label="Remove" data-bs-original-title="Remove">
                        <a class="text-danger d-inline-block remove-item-btn" data-bs-toggle="modal" href="#deleteOrder">
                            <i class="ri-delete-bin-5-fill fs-16"></i>
                        </a>
                    </li>
                </ul>`;
                }
            }
        ]
    });
    } else {
        tableInstance.ajax.reload(null, false); // Recarga los datos sin cambiar de página.
    }
}
function formatDateToCustomFormat(date) {
    const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic"
    ];

    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `<td class="date">${day} ${month}, ${year} <small class="text-muted">${hours}:${minutes} ${
        hours < 12 ? 'AM' : 'PM'
    }</small></td>`;
}

function estadoOrden(estado) {
    // Define un objeto con los mensajes para cada estado.
    const mensajes = {
        1: {
            estado: 'warning',
            mensaje: "Revisar pago"
        },
        2: {
            estado: "warning",
            mensaje: "Pedido en espera"
        },
        3: {
            estado: "warning",
            mensaje: "Pedido aceptado"
        },
        4: {
            estado: "primary",
            mensaje: "Aceptado por repartidor"
        },
        5: {
            estado: "primary",
            mensaje: "Pedido listo"
        },
        6: {
            estado: "primary",
            mensaje: "Pedido en entrega"
        },
        7: {
            estado: "success",
            mensaje: "Pedido completado"
        },
        8: {
            estado: "danger",
            mensaje: "Cancelado por sucursal"
        },
        9: {
            estado: "danger",
            mensaje: "Cancelado por cliente"
        },
        10: {
            estado: "danger",
            mensaje: "Cancelado por repartidor, en espera"
        }
    };

    // Comprueba si el estado existe en el objeto de mensajes.
    if (estado in mensajes) {
        const mensajeEstado = mensajes[estado];
        const mensajeHTML = `<span class="badge bg-${mensajeEstado.estado}-subtle text-${mensajeEstado.estado} text-uppercase">${mensajeEstado.mensaje}</span>`;
        return mensajeHTML;
    } else {
        return "Estado desconocido"; // Un mensaje por defecto si el estado no se encuentra en el objeto.
    }
}

function limpiar_inputs() {
    $('#cancelar_editar').addClass('d-none');
    $('input').val('');
    $('#agregar').data('id', null);
    $('#crear_producto').data('id', null);
    $('#agregar').html('Crear registro');
    $('#crear_producto').html('Crear registro');
    // Obtén una referencia al elemento HTML donde se encuentra FilePond
    const filepondElement = document.querySelector('.filepond');

    // Si ya existe una instancia de FilePond, obtén esa instancia
    const existingInstance = FilePond.find(filepondElement);

    if (existingInstance) { // Elimina todos los archivos cargados
        existingInstance.removeFiles();
    }

    if ($('#detalle_complemento').length > 0) {
        $('#detalle_complemento').html(`
            <div class="row extra-row d-flex justify-content-center align-items-center">
                <div class="col-10">
                    <div class="mb-3">
                        <label for="extraName" class="form-label">Nombre del extra</label>
                        <input type="text" name="extraName" class="form-control" placeholder="Ej. Topping de chocolate" id="extraName">
                    </div>
                </div>
                <div class="col-2">
                    <div class="mb-3">
                        <label for="extraPrice" class="form-label">Precio</label>
                        <input type="text" name="extraPrice" class="form-control" placeholder="0" id="extraPrice">
                    </div>
                </div>
            </div>
        `);
    }
    destruirInputs();
    $('select').val(null).trigger('change');
    iniciarInputs();
}


// Función para cargar la vista
function cargarVista(vista) {
    $.ajax({
        url: '/dashboard/assets/views/' + vista + '.html',
        type: 'GET',
        success: function (data) {
            $('#contenido').html(data);

            // Ejecuta la función correspondiente a la vista cargada, si existe
            funcionesGenerales();
            if (funcionesVista[vista]) {
                funcionesVista[vista]();
            }
        },
        error: function (error) {
            console.error('Error al cargar la vista HTML:', error);
        }
    });
}
function funcionesGenerales() {
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
    'main': function () {
        charts();
    },
    'categories': function () {
        // Registrar plugins
        // Registrar plugins
        FilePond.registerPlugin(FilePondPluginFileEncode, FilePondPluginFileValidateSize, FilePondPluginImageExifOrientation, FilePondPluginImagePreview,);

        // Crear instancia FilePond
        FilePond.create(document.querySelector('.filepond'), {storeAsFile: true});
        cargarTabla();


    },
    'products': function () {
        cargarTablaProductos();
        // Registrar plugins
        FilePond.registerPlugin(FilePondPluginFileEncode, FilePondPluginFileValidateSize, FilePondPluginImageExifOrientation, FilePondPluginImagePreview,);

        // Crear instancia FilePond
        FilePond.create(document.querySelector('.filepond'), {storeAsFile: true});
        iniciarInputs();

    },
    'files': function () {
        $.ajax({
            type: "GET",
            url: "/images/total",
            success: function (response) {
                let mb = bytesTo(response.grandTotalSize);
                let mbBd = bytesTo(response.dbSize);
                console.log(response.dbSize);
                let percentage = calcPercentage(response.grandTotalSize, 104857600);
                $('#file_progress1').css('width', percentage + '%');
                let total = parseInt(mb + mbBd);
                $('#size_files').text(mb);
                $('#size_bd').text(mbBd);
                $('#actual_mb').text(total);
                let files = '';
                let folders = response.foldersInfo;
                let bdSize = response.dbSize;
                console.log(folders);
                for (let i = 0; i < folders.length; i++) {
                    let name = folders[i].folder;
                    let size = bytesTo(folders[i].size);
                    let totalFiles = folders[i].totalFiles;
                    files += `
                        <div class="col-xxl-3 col-6 folder-card">
                            <div class="card bg-light shadow-none" id="folder-1">
                                <div class="card-body">
                                    <div class="d-flex mb-1">
                                        <div class="form-check form-check-danger mb-3 fs-15 flex-grow-1">
                                            <input class="form-check-input" type="checkbox" value="" id="folderlistCheckbox_1" >
                                            <label class="form-check-label" for="folderlistCheckbox_1"></label>
                                        </div>
                                        <div class="dropdown">
                                            <button class="btn btn-ghost-primary btn-icon btn-sm dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i class="ri-more-2-fill fs-16 align-bottom"></i>
                                            </button>
                                            <ul class="dropdown-menu dropdown-menu-end">
                                                <li><a class="dropdown-item view-item-btn" href="javascript:void(0);">Open</a></li>
                                                <li><a class="dropdown-item edit-folder-list" href="#createFolderModal" data-bs-toggle="modal" role="button">Rename</a></li>
                                                <li><a class="dropdown-item" href="#removeFolderModal" data-bs-toggle="modal" role="button">Delete</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div class="text-center">
                                        <div class="mb-2">
                                            <i class="ri-folder-2-fill align-bottom text-warning display-5"></i>
                                        </div>
                                        <h6 class="fs-15 folder-name">${name}</h6>
                                    </div>
                                    <div class="hstack mt-4 text-muted">
                                        <span class="me-auto"><b>${totalFiles}</b> Files</span>
                                        <span><b>${size}</b></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                }
                $('#folderlist-data').html(files);
            }
        });
    },
    'update': function () {
        $.ajax({
            type: "GET", // Cambia "type" a GET si deseas realizar una solicitud GET
            url: "/git/git-history",
            success: function (response) {
                let table = '<table>';
                response.forEach(function (item) {
                    let inicials = getInitials(item.author.name);
                    let time = timeAgo(new Date(item.date));
                    table += `
                  <tr>
                    <td><button class="btn btn-success btn-sm" onclick="copyToClipboard()"><i class="mdi mdi-content-copy"></i></button> <a class="fw-medium">${
                        item.hash
                    }</a>
                    </td>
                    <td>
                        <div class="d-flex align-items-start">
                            <div class="flex-shrink-0 me-3">
                                <div>
                                    <div class="avatar-title bg-success-subtle text-success rounded-circle p-2">
                                        ${inicials}
                                    </div>
                                </div>
                            </div>

                            <div class="flex-grow-1 overflow-hidden">
                                <h5 class="contact-name fs-13 mb-1"><a href="#" class="link text-body">${
                        item.author.name
                    }</a></h5>
                                <p class="contact-born text-muted mb-0"> ${
                        item.author.email
                    }</p>
                            </div>
                        </div>
                    </td>
                    <td>${
                        item.message
                    }</td>
                    <td>${time}</td>
                    <td><button type="button" class="btn btn-warning btn-label waves-effect waves-light"><i class="ri-error-warning-line label-icon align-middle fs-16 me-2"></i> Restaurar</button></td>
                  </tr>`;
                });

                table += '</table>';

                $('#update_body').html(table);
            }
        });

    },
    'addons': function () {
        cargarTablaComplementos();
    },
    'profile': function () {
        $(document).on('input', '#name', function () {
            $('#title_name').html($(this).val());
        })
        $.ajax({
            type: "GET",
            url: "/business",
            success: function (response) {
                $('#name').val(response.name);
                $('#title_name').html(response.name);
                $('#image_profile').attr('src', `/images/business/${
                    response.image
                }/${
                    response.originalFileName
                }`);
                $('#cover_image').attr('src', `/images/business/${
                    response.image_cover
                }/${
                    response.originalCoverFileName
                }`);
                $('#phone').val(response.phone);
            }
        });
        $.ajax({
            type: "GET",
            url: "/business/directions",
            success: function (response) {
                $('#address').val(response.address);
                $('#latitude').val(response.latitude);
                $('#longitude').val(response.longitude);
            }
        });
        $.ajax({
            type: "GET",
            url: "/business/schedules",
            success: function (response) {
                let data = response.data;
                let combinedHTML = ""; // Aquí vamos a ir acumulando el HTML

                data.forEach((schedule, index) => { // Check if the schedule day is selected
                    let dayOptions = [
                        '0',
                        '1',
                        '2',
                        '3',
                        '4',
                        '5',
                        '6'
                    ].map(day => {
                        return `<option value="${day}" ${
                            day == schedule.day ? 'selected' : ''
                        }>${
                            [
                                'Domingo',
                                'Lunes',
                                'Martes',
                                'Miércoles',
                                'Jueves',
                                'Viernes',
                                'Sábado'
                            ][day]
                        }</option>`;
                    }).join('');

                    let deleteButtonHTML = index === 0 ? "" : `
                        <div class="mt-2">
                            <button type="button" class="btn btn-danger">-</button>
                        </div>
                    `;

                    combinedHTML += `<div class="row justify-content-center d-flex align-items-center">
                        <div class="col-lg-4">
                            <div class="mb-3">
                                <label for="day" class="form-label">Día</label>
                                <select name="day" class="form-control">
                                    ${dayOptions}
                                </select>
                            </div>
                        </div>
                        <div class="col-lg-3">
                            <div class="mb-3">
                                <label for="open_hour" class="form-label">Apertura</label>
                                <input name="open_hour" class="form-control" type="time" value="${
                        schedule.open_hour
                    }">
                            </div>
                        </div>
                        <div class="col-lg-3">
                            <div class="mb-3">
                                <label for="close_hour" class="form-label">Cierre</label>
                                <input name="close_hour" class="form-control" type="time" value="${
                        schedule.close_hour
                    }">
                            </div>
                        </div>
                        <div class="col-lg-2">
                        ${deleteButtonHTML}
                        </div>
                    </div>`;
                });

                // Ahora, puedes agregar el combinedHTML a algún contenedor de tu página. Por ejemplo:
                $('#elements').html(combinedHTML);
            }
        });

    },
    'orders': function () {
        initOrders();

        // Obten el elemento de entrada de fecha por su ID
        const fechaInput = document.getElementById("fecha_orden_select");

        // Inicializa Flatpickr
        flatpickr(fechaInput, {
            dateFormat: "Y-m-d",
            // Formato de fecha deseado (puedes ajustarlo según tus necesidades)
            // Otras opciones personalizadas aquí...
        });
    }
};
function initOrders() {
    // Conexión con Socket.io
    const socket = io.connect('http://localhost:3000');

    // Escuchar el evento 'updateOrders' desde el servidor.
    socket.on('updateOrders', (data) => {
        console.log('Evento updateOrders recibido:', data);
        
        if (tableInstance) {
            console.log('Recargando datos de la tabla...');
            tableInstance.ajax.reload(null, false); 
        } else {
            console.log('La instancia de la tabla aún no está disponible.');
        }
    });
    

    // No necesitas la función requestUpdatedOrders, así que la eliminamos.

    // Llamar a cargarTablaOrdenes al inicio para inicializar la tabla.
    cargarTablaOrdenes();

    // El código para manejar la fecha se mantiene igual.
    const fechaInput = document.getElementById("fecha_orden_select");
    flatpickr(fechaInput, {
        dateFormat: "Y-m-d",
        // Resto de opciones...
    });
}


function iniciarInputs() { // Inicializar el primer select (categories)
    const selectElementCategories = $('#category_id');
    selectElementCategories.select2({
        placeholder: 'Buscar categorías...',
        minimumInputLength: 2,
        ajax: {
            url: '/categories/search',
            type: 'GET',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    draw: 1,
                    start: 0,
                    length: 10,
                    search: {
                        value: params.term || ''
                    }, // Usa el término de búsqueda o una cadena vacía
                    'order[0][column]': 2,
                    'order[0][dir]': 'asc'
                };
            },
            processResults: function (response) {
                return {
                    results: response.data.map(item => {
                        return {id: item.id, text: item.name};
                    })
                };
            }
        }
    });

    // Inicializar el segundo select (addons)
    const selectElementAddons = $('#ingredients');
    selectElementAddons.select2({
        placeholder: 'Buscar addons...',
        minimumInputLength: 2,
        ajax: {
            url: '/addons/search',
            type: 'GET',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    draw: 1,
                    start: 0,
                    length: 10,
                    search: {
                        value: params.term || ''
                    }, // Usa el término de búsqueda o una cadena vacía
                    'order[0][column]': 2,
                    'order[0][dir]': 'asc'
                };
            },
            processResults: function (response) {
                return {
                    results: response.data.map(item => {
                        return {id: item.id, text: item.name};
                    })
                };
            }
        }
    });
}
function destruirInputs() {
    const selectElementCategories = $('#category_id');
    selectElementCategories.select2('destroy');
    const ingredients = $('#ingredients');
    ingredients.select2('destroy');
}
function timeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return "justo ahora";
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
        return minutes === 1 ? "hace 1 minuto" : `hace ${minutes} minutos`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return days === 1 ? "hace 1 día" : `hace ${days} días`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
    }

    const years = Math.floor(months / 12);
    return years === 1 ? "hace 1 año" : `hace ${years} años`;
}
function getInitials(name) { // Dividir el nombre en palabras
    const words = name.split(" ");

    // Obtener la primera letra del primer nombre
    const firstNameInitial = words[0].charAt(0);

    // Obtener la primera letra del segundo nombre o del apellido si existe
    const lastNameInitial = words.length > 1 ? words[1].charAt(0) : words[0].charAt(0);

    // Combinar las dos iniciales
    const initials = firstNameInitial + lastNameInitial;

    return initials.toUpperCase(); // Devuelve las iniciales en mayúsculas
}
function bytesTo(sizeInBytes) {
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;
    const tb = gb * 1024;

    if (sizeInBytes < kb) {
        return sizeInBytes.toFixed(0) + " B";
    } else if (sizeInBytes < mb) {
        return(sizeInBytes / kb).toFixed(0) + " KB";
    } else if (sizeInBytes < gb) {
        return(sizeInBytes / mb).toFixed(0) + " MB";
    } else if (sizeInBytes < tb) {
        return(sizeInBytes / gb).toFixed(2) + " GB";
    } else {
        return(sizeInBytes / tb).toFixed(2) + " TB";
    }
}
function calcPercentage(grandTotalSize, limit) {
    if (grandTotalSize < 0 || limit <= 0) {
        throw new Error("Ambos valores deben ser mayores que cero.");
    }

    const percentage = Math.round((grandTotalSize / limit) * 100);
    return percentage;
}

// Función para mostrar el toast
function notify(title, message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end', // Cambia la posición según prefieras ('top-end' es la esquina superior derecha)
        showConfirmButton: false,
        timer: 3000, // Duración del toast en milisegundos
        timerProgressBar: true, // Muestra la barra de progreso
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: title, // Cambia el ícono según prefieras ('success', 'error', 'info', etc.)
        title: message // Cambia el título del toast según prefieras
    });
}

function loaderButton(element) {
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

function ajaxForm(URL, TYPE, FORM_DATA = null, updateView = true) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: URL, // URL a la que se hará la petición.
            type: TYPE, // Método HTTP a usar.
            data: FORM_DATA, // Datos a enviar con la petición.
            processData: false, // Indica a jQuery no procesar los datos.
            contentType: false, // No establecer el tipo de contenido, dejar que FormData lo haga.
            success: function (response) {
                if (updateView) {
                    cargarTabla(); // Actualiza la tabla con los nuevos datos.
                    limpiar_inputs(); // Limpia los campos de entrada.
                }
                resolve(response); // Resuelve la promesa con la respuesta obtenida.
            },
            error: function (err) {
                console.error(err); // Muestra el error en la consola.
                reject(err); // Rechaza la promesa con el error obtenido.
            }
        });
    });
}

function cargarImagen(IMAGE_URL) { // Obtener el blob de la imagen a partir de la URL
    fetch(IMAGE_URL).then(response => response.blob()).then(blob => { // Convertir el blob en un objeto File
        const file = new File([blob], "nombre-de-imagen.jpg", {type: "image/jpeg"});
        // Asegúrate de usar el tipo MIME correcto

        // Añadir el objeto File a FilePond
        const pond = FilePond.find(document.querySelector('.filepond'));
        if (pond) {
            pond.addFile(file);
        }
    }).catch(error => {
        console.error("Hubo un error cargando la imagen:", error);
    });

    return true;
}

function resetButtonsForm() {
    $('[type="submit"]').html('Crear registro');
}
