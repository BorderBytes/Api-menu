function cargarScrollImagen(){
  var initialHeight = 300;  // Lo almacenamos como número para facilitar los cálculos
  
  $('.product-detail').scroll(function(){
      var scroll = $(this).scrollTop();
      
      if (scroll == 0) {
          $('#image_product').css('max-height', initialHeight + 'px');
      } else {
          var newHeight = initialHeight - scroll;
          if (newHeight >= 100) {  // 100px es el mínimo
              $('#image_product').css('max-height', newHeight + 'px');
          } else {
              $('#image_product').css('max-height', '100px');  // Se establece el mínimo en 100px
          }
      }
  });
  
}

$(document).ready(function () {
let lastScrollTop = 0;
  let scrollTimer;

  // Cambiar el selector para escuchar el evento de scroll en el contenedor específico
  $("#scrollable-content").on("scroll", function () {
    let st = $(this).scrollTop();
    // Si el usuario está desplazándose hacia abajo y ha desplazado más de 50px
    if (st > lastScrollTop && st > 50) {
      // Ocultar el .fixed-top-group deslizándolo hacia arriba
      $(".fixed-top-group").css("transform", "translateY(-50%)");
      // Ocultar el .fixed-footer deslizándolo hacia abajo
      $(".fixed-footer").css("transform", "translateY(100%)");
    } else {
      // Mostrar el .fixed-top-group deslizándolo hacia abajo
      $(".fixed-top-group").css("transform", "translateY(0)");
      // Mostrar el .fixed-footer deslizándolo hacia arriba
      $(".fixed-footer").css("transform", "translateY(0)");
    }
    lastScrollTop = st;

    // Detectar cuando el scroll se detiene
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      // Mostrar el .fixed-top-group deslizándolo hacia abajo
      $(".fixed-top-group").css("transform", "translateY(0)");
      // Mostrar el .fixed-footer deslizándolo hacia arriba
      $(".fixed-footer").css("transform", "translateY(0)");
    }, 800); // Tiempo en milisegundos para esperar antes de determinar que el desplazamiento se ha detenido
  });
  
  
});