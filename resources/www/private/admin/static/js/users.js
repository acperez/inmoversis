'use strict';

var Users = (function() {

  var usersObj, usersMessageObj;

  var user_fields = {
    _id: 'Identificador',
    name: 'Nombre',
    lastName: 'Apellidos',
    nationalId: 'NIF',
    nationality: 'Nacionalidad',
    phone: 'Teléfono',
    address: 'Dirección',
    city: 'Ciudad',
    region: 'Municipio',
    postalCode: 'Código postal',
    country: 'País',
    creationDate: 'Fecha de registro',
    lastSeen: 'Última visita',
    investorType: 'Tipo de inversor',
    userStatus: 'Estado',
    wallet: 'Wallet ID',
    projects: 'proyectos'
  };

  function init() {
    usersMessageObj = document.createTextNode('');
    document.getElementById('users_message').appendChild(usersMessageObj);
    usersObj = document.getElementById('users');
    getUsers();
  }

  function refresh() {
    getUsers();
  }

  function getUsers() {
    usersMessageObj.nodeValue = '';

    while (usersObj.firstChild) {
      usersObj.removeChild(usersObj.firstChild);
    }

    HttpClient.sendRequest('users', 'GET', null, function(status, statusText, response) {
      if (status == 200) {
        showUsers(response);
      } else {
        reportError('Se ha producido un error, intenetalo mas tarde');
      }
    });
  }

function formatDate(date) {
  var dateStr = ('0' + date.getDate()).slice(-2) + '/' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();

  var timeStr = ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinutes()).slice(-2) + ':' +
    ('0' + date.getSeconds()).slice(-2);

  return dateStr + ' ' + timeStr;
}

  function showUsers(users) {
    for (var i = 0; i < users.length; i++) {
      var userData = users[i];
      var div = document.createElement("div");
      div.className = 'user';

      var user = document.createElement("h3");
      user.className = 'user_head';
      user.appendChild(document.createTextNode(userData.email));
      div.appendChild(user);

      if (userData.lastSeen) {
        userData.lastSeen = formatDate(new Date(userData.lastSeen));
      }

      if (userData.creationDate) {
        userData.creationDate = formatDate(new Date(userData.creationDate));
      }

      var list = document.createElement("dl");
      list.style.display = 'none';
      for (var field in user_fields) {
        var key = document.createElement("dt");
        key.appendChild(document.createTextNode(user_fields[field]));
        list.appendChild(key);

        var value = document.createElement("dd");
        value.appendChild(document.createTextNode(userData[field] || ''));
        list.appendChild(value);
      }

      var clear = document.createElement("div");
      clear.style.clear = 'both';

      var tools = document.createElement("div");
      var ul = document.createElement("ul");

      var tool_element = document.createElement("li");
      var tool_link = document.createElement("a");
      tool_link.style.cursor = 'pointer';
      var tool_link_image = document.createElement("img");
      tool_link_image.src = '/images/max.png';
      tool_link.appendChild(tool_link_image);
      tool_link.onclick = (function() {
        var content = list;
        var expanded = false;
        var image = tool_link_image;
        return function() {
          if (expanded) {
            expanded = false;
            content.style.display = 'none';
            image.src = '/images/max.png';
            return;
          }

          expanded = true;
          content.style.display = 'block';
          image.src = '/images/min.png';
        }
      })();

      tool_element.appendChild(tool_link);
      ul.appendChild(tool_element);

      tool_element = document.createElement("li");
      tool_link = document.createElement("a");
      tool_link.style.cursor = 'pointer';
      tool_link_image = document.createElement("img");
      tool_link_image.src = '/images/del.png';
      tool_link.appendChild(tool_link_image);
      tool_link.onclick = (function() {
        var userId = userData._id;
        var user_element = div;
        return function() {
          deleteUser(userId, user_element);
        }
      })();
      tool_element.appendChild(tool_link);
      ul.appendChild(tool_element);

      tools.appendChild(ul);
      div.appendChild(tools);

      div.appendChild(list);
      div.appendChild(clear);

      usersObj.appendChild(div);
    }
  }

  function deleteUser(user_id, user_div) {
    if (confirm('Estás seguro que quieres eliminar el usuario ' + user_id + '?') == true) {
      var params = {
        userId: user_id
      }

      HttpClient.sendRequest('user', 'DELETE', params, function(status, statusText, response) {
        if (status == 200) {
          refresh();
        } else {
          alert('Se ha producido un error y no se ha podido eliminar el usuraio ' +  user_id + '. Intenetalo mas tarde');
        }
      });
    }
  }

  function reportError(message) {
    usersMessageObj.nodeValue = message;
  }

  return {
    init: init,
    refresh: refresh
  };
}());
