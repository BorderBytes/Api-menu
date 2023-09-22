$(document).ready(function() {
    // Cargar la vista al recargar la página
    var vista = obtenerVistaDeURL();
    cargarVista(vista);
    
    // Escuchar clics en los enlaces y cambiar la URL y cargar la vista correspondiente
    $('a').on('click', function(e) {
        e.preventDefault();
        var href = $(this).attr('href');
        var vista = href.split('/').pop();
        cambiarURL(href);
        cargarVista(vista);
    });
    
    // Escuchar cambios en el historial del navegador y cargar la vista correspondiente
    $(window).on('popstate', function() {
        var vista = obtenerVistaDeURL();
        cargarVista(vista);
    });
    $(document).on('submit','#form',function(e){
        e.preventDefault();
        
        var formData = new FormData(this);
        $.ajax({
            url: '/categories', // URL del archivo que procesará el formulario.
            type: 'POST',
            data: formData,
            processData: false, // Importante: decirle a jQuery no procesar los datos.
            contentType: false, // Importante: no establecer el tipo de contenido, dejar que FormData lo haga.
            success: function(response){
                $('#tabla').DataTable().clear().destroy();
                cargarTabla();
            },
            error: function(err){
              console.error(err); // Manejar los errores.
            }
          });
      });

      $(document).on('click','#eliminar,#restaurar', function(e){
        e.preventDefault(); // Prevenir la acción predeterminada del enlace
        let id = $(this).data('id');
        $.ajax({
            url: '/categories/status/' + id, // URL del archivo que procesará el formulario.
            type: 'PATCH',
            success: function(response){
              let button = `<a href="javascript:void(0)" id="restaurar" class="btn btn-square btn-success-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${id}" title="" data-bs-original-title="Remove" aria-label="Remove"><i class="icon icon-reload  fs-13"></i></a>`;
              if(response.data === 0){
                button = `<a href="javascript:void(0)" id="eliminar" class="btn btn-square btn-danger-light me-1" data-bs-toggle="tooltip" data-bs-placement="top" data-id="${id}" title="" data-bs-original-title="Remove" aria-label="Remove"><i class="icon icon-trash  fs-13"></i></a>`
              }
                $(e.target).replaceWith(button);
            },
            error: function(err){
              console.error(err); // Manejar los errores.
            }
          });
      });
      let image = null;
      $(document).on('click','#editar', function(){
        let name = $(this).data('name');
        let image = $(this).data('image');
        
        $('input[name="name"]').val(name);
        
        // Destruye y Re-inicializa Dropify con la nueva imagen.
        let drInstance = $('input[name="image"]').dropify();
        drInstance = drInstance.data('dropify');
        drInstance.resetPreview();
        drInstance.clearElement();
        drInstance.destroy();
        drInstance.settings.defaultFile = image;
        drInstance.init();
    });
    
});
