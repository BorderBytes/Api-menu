let map;
let geocoder;
let markerA; // Si lo usas
let markerB;
let directionsService;
let directionsRenderer;
let centerMarker;  // Aquí está la definición en el ámbito global
let latitude = 0;
let longitude = 0;
$.ajax({
    type: "GET",
    url: "/public/business/location",
    success: function (response) {
        latitude = response.data[0].latitude;
        longitude = response.data[0].longitude;
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);
    }
});
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        window.googleMapsAPILoaded = function() {
            resolve(window.google);
        };

        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCrc4t-zWOMoqOfuh1C0yP9TrF2IFDUijc&libraries=places&callback=googleMapsAPILoaded';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onerror = reject;
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: latitude, lng: longitude},
        zoom: 18,
        disableDefaultUI: true,
        styles: [
            {
                featureType: 'poi.business',
                stylers: [{visibility: 'off'}]
            },
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{visibility: 'off'}]
            }
        ]
    });

    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    
    // Personalización del DirectionsRenderer
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Agrega esta línea para ocultar las marcas predeterminadas
        polylineOptions: {
            strokeColor: '#20A35D',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            icons: [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 2,
                    strokeColor: 'white'
                },
                offset: '100%',
                repeat: '50px'
            }]
        }
    });    
    
    directionsRenderer.setMap(map);

    let autocomplete = new google.maps.places.Autocomplete(document.getElementById("address-input"));
    autocomplete.bindTo('bounds', map);

    let centerIcon = {
        url: '/images/map-icon/1/marker.png',
        scaledSize: new google.maps.Size(90, 90)
    };
    
    markerA = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        icon: centerIcon
    });

    autocomplete.addListener('place_changed', function() {
        geocodeAndRoute(geocoder, map);
        $("#modal_direction").removeClass("hide-modal");
        let direction = $('#address-input').val();
        $('#direccion_entrega_label').text(direction);
        $('#search_view').val(direction);
        
        // Enviamos la dirección a un objeto global
        lat = autocomplete.getPlace().geometry.location.lat();
        lng = autocomplete.getPlace().geometry.location.lng();
        address = autocomplete.getPlace().formatted_address;

        let shippingAddress = {
            lat: lat,
            lng: lng,
            address: address
        };

        // Agregar la dirección al carrito
        cartInstance.addShippingAddress(shippingAddress);
    });
}
function checkStatusBeforeRouting() {
    return $.ajax({
        url: '/public//business/location',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            response.status = true; 
        },
    });
}

function geocodeAndRoute(geocoder, resultsMap) {
    let address = document.getElementById('address-input').value;

    // Primero realiza la petición AJAX
    checkStatusBeforeRouting().done(function(response) {
        if (response.status === true) {
            geocoder.geocode({'address': address}, function(results, status) {
                if (status === 'OK') {
                    let start = map.getCenter();
                    let end = results[0].geometry.location;

                    let request = {
                        origin: start,
                        destination: end,
                        travelMode: 'DRIVING'
                    };

                    directionsService.route(request, function(result, status) {
                        if (status == 'OK') {
                            directionsRenderer.setDirections(result);
                            
                            // Asegurarse de que el marcador del usuario (user.png) se mantenga en el punto de inicio
                            if (!centerMarker) {
                                centerMarker = new google.maps.Marker({
                                    position: start,
                                    map: map,
                                    icon: {
                                        url: '/images/map-icon/1/marker.png',  // Asume que este es el camino a tu ícono
                                        scaledSize: new google.maps.Size(90, 90) 
                                    }
                                });
                            } else {
                                centerMarker.setPosition(start);
                            }
                            // Marcador para el punto de entrega o destino
                            if (markerB) { // Si ya existe, elimínalo primero
                                markerB.setMap(null);
                            }
                            markerB = new google.maps.Marker({
                                position: end,
                                map: map,
                                icon: {
                                    url: '/images/map-icon/1/user.png',  // Cambia esto al camino de tu ícono de tienda/local
                                    scaledSize: new google.maps.Size(90, 90) 
                                }
                            });                          
                        } else {
                            alert('No se pudo obtener la dirección debido a: ' + status);
                        }
                    });
                } else {
                    alert('No se pudo geocodificar la dirección por la siguiente razón: ' + status);
                }
            });
        } else {
            alert('No se puede trazar la ruta en este momento. Intente más tarde.');
        }
    }).fail(function() {
        alert('Hubo un error al verificar el estado. Intente de nuevo.');
    });
}




$(document).on('click', '#cancelar_direccion_modal', function() {
    // Reestablecer el mapa al estado original
    map.setCenter({lat: 28.683113258693258, lng: -100.53495640526387});
    map.setZoom(18);
    if(markerB) {
        markerB.setMap(null);
        markerB = null;
    }
    directionsRenderer.setDirections({routes: []});

    // Ocultar el modal
    $("#modal_direction").addClass("hide-modal");
});
