const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

$(document).ready(function () {
  // Agregar un evento click al botón de inicio de sesión
  $("#login-button").click(function () {
      // Obtener los valores del correo electrónico y la contraseña
      var email = $("input[name='email']").val();
      var password = $("input[name='password']").val();

      // Realizar la solicitud POST utilizando jQuery.ajax
      $.ajax({
          type: "POST",
          url: "/auth/login",
          data: `email=${email}&password=${password}`,
          success: function (data) {
              if(data == 'success'){
                window.location.href = "/dashboard/";
              }
          },
          error: function (error) {
              console.error("Error en la solicitud.");
          }
      });
  });
});