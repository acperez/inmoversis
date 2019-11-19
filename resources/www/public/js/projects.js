'use strict'

function loadProject(projectId) {
  var logged = document.getElementById('menu_name');
  if (logged) {
    location.href='/project/' + projectId;
    return;
  }

  alert("Para ver los detalles del proyecto necesitas estar registrado. Si ya tienes un usuario inicia sesión y si no lo tienes, registrate.");
}
