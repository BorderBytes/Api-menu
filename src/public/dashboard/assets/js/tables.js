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