$(document).ready(function () {
    document.getElementById("full_screen").addEventListener("click", function() {
        if (document.fullscreenElement) {
          document.exitFullscreen().then(changeIcon);
        } else {
          document.documentElement.requestFullscreen().then(changeIcon);
        }
      });
      
      function changeIcon() {
        const btn = document.getElementById("full_screen");
        if (document.fullscreenElement) {
          btn.innerHTML = `<i class="fa-solid fa-compress"></i>`; // ícono para salir de pantalla completa
        } else {
          btn.innerHTML = `<i class="fa-solid fa-expand"></i>`; // ícono para pantalla completa
        }
      }
      
    $.ajax({
        type: "GET",
        url: "/public/business/publicInfo",
        success: function (response) {
            $('#titulo_header').html(response.data.name);
        }
    });
    $.ajax({
        type: "GET",
        url: "/public/categories",
        success: function (response) {
            response.data.forEach(category => {
                const card = buildCard(category);
                $('#categorias_content').append(card);
            });
        }
    });
    $.ajax({
        type: "GET",
        url: "/public/products",
        success: function (response) {
            response.data.forEach(product => {
                const card = buildCardProduct(product);
                $('#productos_container').append(card);
            });
        }
    });
    // Controlador de evento para [data-product]
    let globalId = 0;
    let skeleton = `<div class="skeleton-loader">
        <div class="skeleton-img"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-description small"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description short"></div>
    </div>`;
    $(document).on('click', '[data-product]', function () {
        const id_product = $(this).data('product');
        if(globalId === id_product) {
            return;
        }
        $('#product-detail').html(skeleton);
        globalId = id_product;
        $.ajax({
            type: "GET",
            url: `/public/products/${id_product}`,
            success: function (response) {
                console.log(response);
                let image = response.data.image;
                let name = response.data.name;
                let description = response.data.description;
                let price = response.data.price;
                let addon_array = response.data.addons;
    
                // Pre-carga de la imagen antes de mostrarla
                let img = new Image();
                img.src = `/images/products/${image}/big.webp`;
                img.onload = function() {
                    let html = crearElementoProducto(image, name, description, price, addon_array, id_product);
                    $('#product-detail').html(html);
                    cargarScrollImagen();
                }
            }
        });
    });    
    $(document).on('click', '.search-input', function () {
        loadGoogleMapsAPI().then(() => {
            initMap();
        }).catch(err => {
            console.error("Error al cargar Google Maps API: ", err);
        });
    });
    function crearElementoProducto(image, name, description, price, addons,id_product) {
        let addonHTML = '';
    
        if (addons && addons.length > 0) {
            addons.forEach(addon => {
                let detallesHTML = '';
                if (addon.detalle && addon.detalle.length > 0) {
                    addon.detalle.forEach(detalle => {
                        detallesHTML += `
                            <div class="row align-items-center justify-content-between my-2">
                                <div class="col-8">
                                    <p>${detalle.name} +${detalle.price}</p>
                                </div>
                                <div class="col-2 text-right">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" data-name="${detalle.name}" data-id="${detalle.id}" id="checkbox_${detalle.id}">
                                        <label class="form-check-label" for="checkbox_${detalle.id}"></label>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
    
                addonHTML += `
                    <div class="row">
                        <h3 class="bold d-flex justify-content-between align-items-center py-2">
                            ${addon.name}
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </h3>
                        <div class="content-row">
                            ${detallesHTML}
                        </div>
                    </div>
                `;
            });
        }
    
        return `
            <div class="product-image">
                <img id="image_product" src="/images/products/${image}/big.webp" alt="${name}">
            </div>
            <div class="product-info py-3 mt-3" data-id="${id_product}">
                <div class="badge bg-custom mb-2"><i class="fa-solid fa-dollar-sign"></i> <span class="ml-2" id="precio_producto">${price}</span></div>
                <div class="badge bg-custom mb-2"><i class="fas fa-clock"></i> <span class="ml-2">30 min</span></div>
                <h2 class="product-title" id="name_product">${name}</h2>
                <p class="product-description pb-2" id="desc_product">${description}</p>
                ${addonHTML}
            </div>
        `;
    }
function buildCard(category) {
    return `
        <div class="card card-category">
            <img class="image-category" src="/images/categories/${category.image}/medium.webp" alt="${category.name}">
            <div class="layer-black"></div>
            <div class="text-category bold">${category.name}</div>
        </div>
        `;
}
function buildCardProduct(product){
    return `
        <div class="card mt-3" data-change="1" data-product="${product.id}">
            <div class="row no-gutters ">
                <div class="col-md-4">
                    <img src="/images/products/${product.image}/medium.webp" alt="${product.name}" class="card-img card-img-left">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text">MXN $${product.price}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

});