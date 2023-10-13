$(document).ready(function () {
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
});

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
        <div class="card mt-3">
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