// Estructura del carrito
const cart = {
    items: [],
    total: 0.0
};

/**
 * Clase ShoppingCart para gestionar las operaciones del carrito de compras.
 */
class ShoppingCart {
    
    /**
     * Constructor para inicializar el carrito.
     * Carga los ítems del carrito desde localStorage si existen.
     */
    constructor() {
        this.items = [];      // Arreglo para almacenar los ítems en el carrito.
        this.total = 0.0;    // Valor total inicial del carrito.
        this.loadFromLocalStorage();  // Intenta cargar el carrito desde localStorage.
    }

    /**
     * Agrega un ítem al carrito.
     * Recalcula el total y guarda el carrito en localStorage.
     * 
     * @param {Object} item - El ítem a agregar.
     */
    addItem(item) {
        this.items.push(item);   // Agrega el ítem al arreglo.
        this.calculateTotal();  // Recalcula el total.
        this.saveToLocalStorage();  // Guarda el carrito en localStorage.
    }

    /**
     * Calcula el valor total del carrito basado en los ítems y sus cantidades.
     */
    calculateTotal() {
        this.total = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }

    /**
     * Guarda el carrito en localStorage.
     */
    saveToLocalStorage() {
        const cartString = JSON.stringify(this.items); // Convierte los ítems del carrito a una cadena JSON.
        localStorage.setItem('cart', cartString);     // Almacena la cadena en localStorage.
    }

    /**
     * Carga los ítems del carrito desde localStorage.
     * Si se encuentran ítems, recalcula el total del carrito.
     */
    loadFromLocalStorage() {
        const cartString = localStorage.getItem('cart');
        if (cartString) {
            this.items = JSON.parse(cartString);     // Convierte la cadena JSON a un arreglo de ítems.
            this.calculateTotal();  // Recalcula el total después de cargar los ítems.
        }
    }

    /**
     * Obtiene la cantidad total de ítems en el carrito.
     * 
     * @returns {number} - La cantidad total de ítems.
     */
    getTotalQuantity() {
        return this.items.reduce((acc, item) => acc + item.quantity, 0);
    }
}


// Instancia del carrito
const cartInstance = new ShoppingCart();

$(document).ready(function () {
    $("#agregar_producto").on("click", function() {
        const productContainer = $('[data-ref="/productos"]'); 
        
        const product = {
            id: $('.product-info').data("id"),
            name: productContainer.find("#name_product").text(),
            imgSrc: productContainer.find("#image_product").attr("src"),
            price: parseFloat(productContainer.find("#precio_producto").text()),
            quantity: parseInt(productContainer.find("#quantity").text()) || 1,
            extras: gatherExtras(productContainer) // Gather the selected extras
        };

        cartInstance.addItem(product);
        updateDataCantAttribute(product.id, product.quantity); // Updating the data-cant attribute
        // Hacemos back a la página anterior
        window.history.back();
        updateDOMTotals();
        updateFooterDisplay();
        console.log(cartInstance);
    });

    const productContainer = $("[data-ref='/productos']");
    if (productContainer.length > 0) {
        initializeQuantityHandlers();
        initializePriceUpdateEvents(productContainer);
    }
});
$(document).on('click', '#ver_carrito', function () {
    const cartContainer = $("#cart_container"); // Asumimos que este es el contenedor donde quieres mostrar los productos
    cartContainer.empty(); // Limpiamos el contenedor

    cartInstance.items.forEach(item => {
        const productHTML = `
            <div class="product-item d-flex justify-content-between align-items-center mb-3">
                <div class="col-4">
                    <div class="product-img">
                        <img src="${item.imgSrc}" alt="${item.name}" class="img-fluid">
                    </div>
                </div>
                <div class="col-4">
                    <div class="product-details">
                        <h6>${item.name}</h6>
                        <!-- Aquí puedes agregar más detalles si los tienes en tu objeto de producto -->
                        <div class="quantity-control d-flex align-items-center">
                            <button class="decrease-qty">
                                <i class="fa fa-minus"></i>
                            </button>
                            <input type="text" value="${item.quantity}" class="qty-input">
                            <button class="increase-qty">
                                <i class="fa fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-4 text-end">
                    <span class="product-price">$${item.price.toFixed(2)}</span>
                </div>
            </div>
        `;

        cartContainer.append(productHTML);
        $('#subtotal_carrito').text(cartInstance.total.toFixed(2));
        $('#total_carrito,#total_preview').text(cartInstance.total.toFixed(2));
    });
});

// SRP: Función específica para manejar los eventos de cantidad
function initializeQuantityHandlers() {
    const quantityElement = $("#quantity");

    $("#decrease").on("click", function () {
        adjustQuantity(quantityElement, -1);
    });

    $("#increase").on("click", function () {
        adjustQuantity(quantityElement, 1);
    });
}

// SRP: Ajusta la cantidad con un valor determinado.
function adjustQuantity(element, adjustment) {
    const currentValue = parseInt(element.text());
    const newValue = Math.max(currentValue + adjustment, 1); // No permitir valores inferiores a 1
    element.text(newValue);
}

// SRP: Inicializa eventos relacionados con la actualización del precio
function initializePriceUpdateEvents(container) {
    container.find(".form-check-input, #decrease, #increase").on("change click", function () {
        setTimeout(() => {
            const finalPrice = calculateFinalPrice(container);
            console.log("Precio Final: " + finalPrice.toFixed(2));
        }, 50);
    });
}

// SRP: Calcula el precio final
function calculateFinalPrice(container) {
    const basePrice = getBasePrice(container);
    const quantity = getQuantity(container);
    const extrasPrice = getExtrasPrice(container);

    return(basePrice + extrasPrice) * quantity;
}

// SRP: Obtiene el precio base
function getBasePrice(container) {
    return parseFloat(container.find("#precio_producto").text());
}

// SRP: Obtiene la cantidad
function getQuantity(container) {
    return parseInt(container.find("#quantity").text());
}

// SRP: Calcula el precio total de los extras seleccionados
function getExtrasPrice(container) {
    let total = 0;

    container.find(".form-check-input:checked").each(function () {
        const price = extractPriceFromCheckbox($(this), container);
        total += price;
    });

    return total;
}

// SRP: Extrae el precio de un checkbox específico
function extractPriceFromCheckbox(checkbox, container) {
    const checkboxId = checkbox.attr("id");
    const complementPriceText = container.find(`label[for='${checkboxId}']`).closest(".row").find(".col-8 p").text();
    return parseFloat(complementPriceText.split('+')[1]);
}
// SRP: Gather selected extras and return them as an array
function gatherExtras(container) {
    const extras = [];
    container.find(".form-check-input:checked").each(function () {
        const extra = {
            id: $(this).data("id"),
            name: $(this).data("name"), // Assuming you have a data-name attribute
            price: extractPriceFromCheckbox($(this), container)
        };
        extras.push(extra);
    });
    return extras;
}
// SRP: Update the data-cant attribute for the product with the given id
function updateDataCantAttribute(productId, addedQuantity) {
    const productElement = $(`[data-product="${productId}"]`);

    // If the product element exists
    if(productElement.length > 0) {
        let currentQuantity = productElement.data("cant") || 0; // Getting the current quantity from the data-cant attribute. If it doesn't exist, default to 0.
        let newQuantity = currentQuantity + addedQuantity; // Adding the new quantity
        
        productElement.attr("data-cant", newQuantity); // Updating the data-cant attribute with the new quantity
    }
    $('#quantity').text(1);
}
// SRP: Update the total number of products and total price in the DOM
function updateDOMTotals() {
    // Update total number of products
    const totalQuantity = cartInstance.getTotalQuantity();
    if(totalQuantity === 0) {
        $("#total-num-products").text("Sin productos");
    } else {
        $("#total-num-products").text(`${totalQuantity} productos`);
    }

    // Update total price of products
    $("#total-price-products").text(cartInstance.total.toFixed(2));
}
// SRP: Update the display of the footer based on the number of products in the cart
function updateFooterDisplay() {
    const totalProducts = cartInstance.getTotalQuantity();

    if (totalProducts > 0) {
        $("#footer_total").removeClass("d-none");
    } else {
        $("#footer_total").addClass("d-none");
    }
}