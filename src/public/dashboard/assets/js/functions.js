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
function obtenerIdDeURL() {
    const parametrosURL = new URLSearchParams(window.location.search);
    return parametrosURL.get('orderId');
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

function initOrders() {
    

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
// Función para obtener los detalles del pedido basado en el ID proporcionado
function obtenerDetallesDelPedido(orderId) {
    $.ajax({
        type: "GET",
        url: `/orders/${orderId}`,
        success: function (response) {
            let data = response.data;

            // Mostrar detalles del pedido
            $('#id_orden').text(data.id);
            $('#costo_envio').text(data.shipping_cost);
            $('#subtotal').text(data.totalSubtotal);
            $('#total_orden').text(data.total);
        },
        error: function (error) {
            console.error("Error al obtener los detalles del pedido:", error);
        }
    });
}

// Función para obtener y mostrar los productos asociados con un ID de pedido dado
function obtenerProductosDelPedido(orderId) {
    $.ajax({
        type: "GET",
        url: `/orders/products/${orderId}/`,
        success: function (response) {
            let contenidoHtml = construirHtmlProductos(response.data);
            $('#productos_orden').prepend(contenidoHtml);
        },
        error: function (error) {
            console.error("Error al obtener los productos del pedido:", error);
        }
    });
}

// Función auxiliar para generar el HTML de los productos basado en los datos proporcionados
function construirHtmlProductos(productos) {
    let html = '';
    $.each(productos, function (i, producto) { 
        html += `
        <tr>
            <td>
                <div class="d-flex">
                    <div class="flex-shrink-0 avatar-md bg-light rounded p-1">
                        <img src="/images/products/${producto.product_image}/small.webp" alt="${producto.product_name}" class="img-fluid d-block">
                    </div>
                    <div class="d-flex align-items-center ms-3">
                        <h5 class="fs-15">
                            <a href="apps-ecommerce-product-details.html" class="link-primary">${producto.product_name}</a>
                        </h5>
                    </div>
                </div>
            </td>
            <td>$${producto.price}</td>
            <td>${producto.quantity}</td>
            <td>${producto.comments}</td>
            <td class="fw-medium text-end">$${producto.subtotal}</td>
        </tr>
        `;
    });
    return html;
}
