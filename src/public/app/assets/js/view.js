$(document).ready(function () {
    let lastScrollTop = 0;
    let scrollTimer;

    // Cambiar el selector para escuchar el evento de scroll en el contenedor específico
$('#scrollable-content').on('scroll', function () {
    let st = $(this).scrollTop();
    // Si el usuario está desplazándose hacia abajo y ha desplazado más de 50px
    if (st > lastScrollTop && st > 50) { // Ocultar el .fixed-top-group deslizándolo hacia arriba
      $('.fixed-top-group').css('transform', 'translateY(-60%)');
      // Ocultar el .fixed-footer deslizándolo hacia abajo
      $('.fixed-footer').css('transform', 'translateY(100%)');
    } else { // Mostrar el .fixed-top-group deslizándolo hacia abajo
      $('.fixed-top-group').css('transform', 'translateY(0)');
      // Mostrar el .fixed-footer deslizándolo hacia arriba
      $('.fixed-footer').css('transform', 'translateY(0)');
    }
    lastScrollTop = st;
  
    // Detectar cuando el scroll se detiene
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { // Mostrar el .fixed-top-group deslizándolo hacia abajo
      $('.fixed-top-group').css('transform', 'translateY(0)');
      // Mostrar el .fixed-footer deslizándolo hacia arriba
      $('.fixed-footer').css('transform', 'translateY(0)');
    }, 500); // Tiempo en milisegundos para esperar antes de determinar que el desplazamiento se ha detenido
  });
    $('#toggleView').on('click', function () {
        let container = $('.view-container');
        let currentStep = container.attr('data-step');

        if (currentStep === "1") { // Cambiar a la vista 2
            $('.view-1').css('transform', 'translateX(-100%)');
            $('.view-2').css('transform', 'translateX(-100%)');
            container.attr('data-step', '2');
            $('.fixed-top-group').hide();
        } else { // Regresar a la vista 1
            $('.view-1').css('transform', 'translateX(0)');
            $('.view-2').css('transform', 'translateX(0)');
            container.attr('data-step', '1');
        }
    });
});
