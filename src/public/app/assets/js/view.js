function adjustView(targetStep) {
  let views = $('.view-container .view');

  views.each(function () {
      let view = $(this);
      let step = view.attr('data-step');

      if (step === targetStep) {
          if (step !== "0") {
              view.css('transform', 'translateX(-100%)');
          }
      } else if (step !== "0") {
          view.css('transform', 'translateX(0)');
      }
  });

  let matchedView = $(`.view[data-step="${targetStep}"]`);
  if (matchedView.length) {
      history.replaceState({ step: targetStep }, "", matchedView.attr('data-ref'));
  }
}

function handleViewChange(element) {
  let targetStep = $(element).attr('data-change');
  let targetView = $(`.view[data-step="${targetStep}"]`);

  if (targetView.length) {
      history.pushState({ step: targetStep }, "", targetView.attr('data-ref'));
      adjustView(targetStep);
  }
}

function toggleViewByUrl() {
  let currentURL = window.location.pathname;
  let targetView = $(`.view[data-ref="${currentURL}"]`);

  if (targetView.length) {
      adjustView(targetView.attr('data-step'));
  }
}
$(document).ready(function () {

  // Controlador de evento para [data-change]
  $(document).on('click', '[data-change]', function () {
      handleViewChange(this);
  });

  

  // Controlador de evento para popstate
  $(window).on('popstate', function (e) {
      if (e.originalEvent.state && e.originalEvent.state.step) {
          adjustView(e.originalEvent.state.step);
      }
  });

  var initialHeight = $('#image_product').height();
    
  $('.product-detail').scroll(function(){
      var scroll = $(this).scrollTop();
      
      var newHeight = initialHeight - scroll;
      if (newHeight >= 100) {  // 100px es el mínimo
          $('#image_product').css('max-height', newHeight + 'px');
      } else {
          $('#image_product').css('max-height', '100px');  // Se establece el mínimo en 100px
      }
  });
  // Establecer la vista inicial basada en la URL
  toggleViewByUrl();

});

