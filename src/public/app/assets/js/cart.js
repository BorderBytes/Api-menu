// al cargar
$(document).ready(function () {
    document.getElementById("decrease").addEventListener("click", function() {
        let quantity = document.getElementById("quantity");
        let currentValue = parseInt(quantity.innerText);
        if (currentValue > 1) { // Para que no disminuya menos de 1
            quantity.innerText = currentValue - 1;
        }
    });
    
    document.getElementById("increase").addEventListener("click", function() {
        let quantity = document.getElementById("quantity");
        let currentValue = parseInt(quantity.innerText);
        quantity.innerText = currentValue + 1;
    });

});