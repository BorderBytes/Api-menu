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
        const socket = io.connect(window.location.origin); // Esto se conectará a la URL actual, que debe ser '/dashboard'.
            //setInterval(function(){
              //  socket.emit('chat message', 1);
            //},5000);
            // En el archivo HTML del cliente, en el bloque de script
            socket.on('status', (msg) => {
                console.log(`Mensaje: ${msg}`);
            
                // Puedes hacer lo que desees con el número aquí
            });
    
          socket.on('chat message', function(msg){
            console.log(2);
          });
        initOrders();

        // Obten el elemento de entrada de fecha por su ID
        const fechaInput = document.getElementById("fecha_orden_select");

        // Inicializa Flatpickr
        flatpickr(fechaInput, {
            dateFormat: "Y-m-d",
            // Formato de fecha deseado (puedes ajustarlo según tus necesidades)
            // Otras opciones personalizadas aquí...
        });
    },
    'order': function () {
        // Obtener ID del pedido desde la URL
        let idPedido = obtenerIdDeURL();
        // Obtener y mostrar datos utilizando las funciones definidas
        obtenerDetallesDelPedido(idPedido);
        obtenerProductosDelPedido(idPedido);
        // Asumiendo que $ representa jQuery y que ha sido importado en tu proyecto
        // Obtener logs y status desde el servidor
const getLogs = $.get(`/orders/logs/${idPedido}`); // Cambia a la ruta real de tu servidor para logs
const getStatus = $.get("/orders/status"); // Cambia a la ruta real de tu servidor para el status

$.when(getLogs, getStatus)
.done(function(logsResponse, statusResponse) {
    console.log("Logs obtenidos:", logsResponse[0].data);
    console.log("Estados obtenidos:", statusResponse[0].data);

    const logs = logsResponse[0].data.reverse(); // Invertir el orden de los logs
    const statusData = statusResponse[0].data;

    let statusMap = {};
    statusData.forEach(status => {
        statusMap[status.id] = {
            name: status.name,
            text: status.text,
            icon: status.icon
        };
    });

    function createLogItem(log) {
        const date = new Date(log.date).toLocaleString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const statusInfo = statusMap[log.new_status];
        const iconName = statusInfo.icon; // Usa esto para renderizar el ícono apropiado
        let iconHtml = "";
        iconHtml = `<i class="${iconName}"></i>`;
        let clase = "bg-success";
        if (log.new_status === 7) {
            clase = `bg-light text-success`;
        }
        console.log(log);
        const item = $(`
            <div class="accordion-item border-0">
                <div class="accordion-header" id="heading${log.id}">
                    <a class="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#collapse${log.id}" aria-expanded="true" aria-controls="collapse${log.id}">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 avatar-xs">
                                <div class="avatar-title ${clase} rounded-circle">
                                    <i class="${iconName}"></i>
                                </div>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h6 class="fs-15 mb-0 fw-semibold">${statusInfo.name} - <span class="fw-normal">${date}</span></h6>
                            </div>
                        </div>
                    </a>
                </div>
                <div id="collapse${log.id}" class="accordion-collapse collapse show" aria-labelledby="heading${log.id}" data-bs-parent="#accordionFlushExample">
                    <div class="accordion-body ms-2 ps-5 pt-0">
                        <h6 class="mb-1">${statusInfo.text}</h6>
                        <p class="text-muted">${date}</p>
                    </div>
                </div>
            </div>
        `);

        return item;
    }

    logs.forEach(log => {
        const logItem = createLogItem(log);
        $('#accordionFlushExample').append(logItem);
    });

})
.fail(function() {
    console.error("Hubo un error al obtener los datos del servidor.");
});


    }
};