// Estructura del carrito
const cart = {
    items: [],
    total: 0.0
};

// Clase para manejar el carrito
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0.0;
    }

    addItem(item) {
        // Calculate the individual subtotal for the product including extras
        const extrasTotal = item.extras.reduce((acc, extra) => acc + extra.price, 0); // Sum of all extras' prices
        item.subTotal = (item.price + extrasTotal) * item.quantity;

        this.items.push(item);
        this.calculateTotal();
    }

    calculateTotal() {
        this.total = this.items.reduce((acc, item) => acc + item.subTotal, 0);
    }
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