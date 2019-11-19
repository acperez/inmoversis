'use strict';

var Projects = (function() {

  var currentTab = null;

  var tabs = [];

  var projectsObj, statusMessageObj, statusMessageTextObj, editErrorObj, editErrorTextObj, editSelectorObj;

  function init() {
    initProjectSelector();
    initElements();

    getProjects();

    currentTab = 0;
    addTab('tab-status', 'tab-status-content', showList);
    addTab('tab-edit', 'tab-edit-content', showEdit);
    addTab('tab-create', 'tab-create-content', showCreate);

    ProjectForm.init();

    loadGoogleMaps();
  }

  function refresh() {
    getProjects();
    if (currentTab != 0) {
      onTabClick(0);
    }
  }

  function addTab(tabId, panelId, action) {
    var tabObj = document.getElementById(tabId);
    var panelObj = document.getElementById(panelId);
    var index = tabs.length;
    tabObj.addEventListener('click', function(evt) { onTabClick(index); });
    tabs.push({ tab: tabObj,
                panel: panelObj,
                action: action });
  }

  function initProjectSelector() {
    document.getElementById('project_edit_button').addEventListener('click', function(evt) { editProject(); });
  }

  function initElements() {
    projectsObj = document.getElementById('projects');
    statusMessageObj = document.getElementById('status_message');
    statusMessageTextObj = document.createTextNode('');
    statusMessageObj.appendChild(statusMessageTextObj);
    editErrorObj = document.getElementById('edit_error');
    editErrorTextObj = document.createTextNode('');
    editErrorObj.appendChild(editErrorTextObj);
    editSelectorObj = document.getElementById('project');
  }

  function onTabClick(option) {
    if (option == currentTab) {
      return;
    }

    var current = tabs[currentTab];
    var next = tabs[option];

    current.tab.className = 'unselected';
    current.panel.style.display = 'none';

    next.tab.className = 'selected';
    next.panel.style.display = 'block';
    next.action();

    currentTab = option;
  }

  function showList() {
    ProjectForm.hide();
    showRefresh();
  }

  function showEdit() {
    ProjectForm.hide();
    hideRefresh();
    this.panel.style.paddingBottom = '0px';
  }

  function showCreate() {
    ProjectForm.show();
    hideRefresh();
  }

  function onShowComponent() {
    if (currentTab == 0) {
      showRefresh();
      return;
    }

    hideRefresh();
  }

  function getProjects() {
    while (projectsObj.firstChild) {
      projectsObj.removeChild(projectsObj.firstChild);
    }

    statusMessageObj.style.display = 'none';

    HttpClient.sendRequest('projects', 'GET', null, function(status, statusText, response) {
      if (status == 200) {
        onProjectsReceived(response);
      } else {
        showStatusError('Se ha producido un error, intenetalo mas tarde');
      }
    });
  }

  function deleteProject(projectId, projectDiv) {
    if (confirm('Estás seguro que quieres eliminar el proyecto?') == true) {
      HttpClient.sendRequest('project/' + projectId, 'DELETE', null, function(status, statusText, response) {
        if (status == 200) {
          refresh();
        } else {
          alert('No se ha podido eliminar el proyecto porque se ha producido un error conectando con el servidor, intenetalo mas tarde');
        }
      });
    }
  }

  function updateProjectStatus(projectId, statusObj) {
    HttpClient.sendRequest('project/' + projectId + '/status/' + statusObj.value, 'PUT', null, function(status, statusText, response) {
      if (status == 200) {
        refresh();
      } else {
        alert('No se ha podido actualizar el estado del proyecto porque se ha producido un error conectando con el servidor, intenetalo mas tarde');
      }
    });
  }

  function onProjectsReceived(projects) {
    updateStatus(projects);
    updateEdit(projects);
  }

  function loadGoogleMaps() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://maps.googleapis.com/maps/api/js?callback=ProjectForm.initGoogleMaps&language=es';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(script, x);
  }

  function showStatusError(message) {
    statusMessageTextObj.nodeValue = message;
    statusMessageObj.style.color = 'red';
    statusMessageObj.style.display = 'block';
  }

  function showStatusMessage(message) {
    statusMessageTextObj.nodeValue = message;
    statusMessageObj.style.color = 'black';
    statusMessageObj.style.display = 'block';
  }

  function updateStatus(projects) {
    if (projects.length == 0) {
      showStatusMessage('No hay proyectos');
      return;
    }

    for (var i = 0; i < projects.length; i++) {
      addPreview(projects[i], i);
    }
  }

  function addPreview(project, index) {
    var div = document.createElement('div');

    var preview = createPreview(project);
    var div_preview = document.createElement('div');
    div_preview.style.width = '58%';
    div_preview.style.float = 'left';
    div_preview.appendChild(preview);

    var options = createOptions(project, div);
    var div_options = document.createElement('div');
    div_options.style.width = '42%';
    div_options.style.float = 'right';
    div_options.appendChild(options);

    var clear = document.createElement('p');
    clear.className = 'clear';

    div.style.width = '100%';
    div.appendChild(div_preview);
    div.appendChild(div_options);
    div.appendChild(clear);
    if (index != 0) {
      div.style.marginTop = '40px';
    }

    projectsObj.appendChild(div);
  }

  function createPreview(project) {
    var div = document.createElement('div');
    div.className = 'preview';

    var h2 = document.createElement('h2');
    h2.className = 'preview_title';
    h2.appendChild(document.createTextNode(project.name));
    if (project.subname) {
      var span = document.createElement('span');
      span.id = "preview_subtitle";
      span.appendChild(document.createTextNode(project.name));
      h2.appendChild(span);
    }
  
    var preview_box = document.createElement('div');
    preview_box.className = 'preview_box';

    var preview_left = document.createElement('div');
    preview_left.className = 'preview_left';
    if (project.label) {
      var label = document.createElement('div');
      label.className = 'label';
      var label_p = document.createElement('p');
      label_p.appendChild(document.createTextNode(project.label));
      label.appendChild(label_p);
      preview_left.appendChild(label);
    }

    var image = document.createElement('img');
    image.src = '/admin/project/' + project.projectId + '/' + project.version + '/' + project.preview;
    preview_left.appendChild(image);
    preview_box.appendChild(preview_left);

    var preview_right = document.createElement('div');
    preview_right.className = 'preview_right';

    var status_div = document.createElement('div');
    status_div.style.padding = '8px 12px';

    var balance = document.createElement('p');
    balance.style.float = 'left';
    balance.appendChild(document.createTextNode(project.balance + ' €'));
    status_div.appendChild(balance);

    var cost = document.createElement('p');
    cost.style.float = 'right';
    cost.appendChild(document.createTextNode(project.finances.purchase.total_price + ' €'));
    status_div.appendChild(cost);

    var clear = document.createElement('p');
    clear.className = 'clear';
    status_div.appendChild(clear);

    var progress = project.progress.toFixed(2);
    var progressbar = document.createElement('div');
    progressbar.className = 'progressbar';
    var progressbar_inner = document.createElement('div');
    progressbar_inner.className = 'progressbar-inner';
    progressbar_inner.style.width = progress + '%';
    var progressbar_label = document.createElement('span');
    progressbar_label.appendChild(document.createTextNode(progress + '%'));
    progressbar_inner.appendChild(progressbar_label);
    progressbar.appendChild(progressbar_inner);
    status_div.appendChild(progressbar);

    var remaining = document.createElement('p');
    remaining.style.fontSize = '14px';
    remaining.style.textAlign = 'center';
    remaining.style.padding = '8px';
    var days = project.campaign_duration;
    if (project.campaign_start) {
      var daysElapsed = Math.floor((Date.now() - new Date(project.campaign_start).getTime()) / 1000 / 60 / 60 / 24);
      days = project.campaign_duration - daysElapsed;
      if (days < 0) days = 0;
    }
    remaining.appendChild(document.createTextNode('Faltan ' + days + ' días'));
    status_div.appendChild(remaining);

    var hr = document.createElement('hr');
    var preview_field = document.createElement('div');
    var preview_value = document.createElement('p');
    preview_field.appendChild(preview_value);
    var span = document.createElement('span');
    span.appendChild(document.createTextNode(project.finances.profitability.toFixed(2) + ' %'));
    preview_value.appendChild(document.createTextNode('Rentabilidad'));
    preview_value.appendChild(span);
    status_div.appendChild(hr);
    status_div.appendChild(preview_field);

    hr = document.createElement('hr');
    preview_field = document.createElement('div');
    preview_value = document.createElement('p');
    preview_field.appendChild(preview_value);
    span = document.createElement('span');
    span.appendChild(document.createTextNode(project.project_duration + ' años'));
    preview_value.appendChild(document.createTextNode('Duración'));
    preview_value.appendChild(span);
    status_div.appendChild(hr);
    status_div.appendChild(preview_field);

    hr = document.createElement('hr');
    preview_field = document.createElement('div');
    preview_value = document.createElement('p');
    preview_field.appendChild(preview_value);
    span = document.createElement('span');
    span.appendChild(document.createTextNode(project.finances.purchase.total_price + ' €'));
    preview_value.appendChild(document.createTextNode('Precio'));
    preview_value.appendChild(span);
    status_div.appendChild(hr);
    status_div.appendChild(preview_field);

    hr = document.createElement('hr');
    preview_field = document.createElement('div');
    preview_value = document.createElement('p');
    preview_field.appendChild(preview_value);
    span = document.createElement('span');
    span.appendChild(document.createTextNode('56 %'));
    preview_value.appendChild(document.createTextNode('Riesgo'));
    preview_value.appendChild(span);
    status_div.appendChild(hr);
    status_div.appendChild(preview_field);

    preview_right.appendChild(status_div);
    preview_box.appendChild(preview_right);

    clear = document.createElement('p');
    clear.className = 'clear';
    preview_box.appendChild(clear);

    div.appendChild(h2);
    div.appendChild(preview_box);

    return div;
  }

  function createOptions(project, container) {
    var div = document.createElement('div');
    div.style.padding = '18px';
    var select = { hidden: 'Oculto',
                   published: 'En estudio',
                   open: 'Abierto',
                   closed: 'Cerrado',
                   finished: 'Finalizado' };

    var status = document.createElement('p');
    status.appendChild(document.createTextNode('Proyecto ' + select[project.status]));
    status.style.textAlign = 'center';
    status.style.fontWeight = 'bold';
    status.style.marginBottom = '10px';
    status.style.fontSize = '18px';

    var statusLabel = document.createElement('p');
    statusLabel.appendChild(document.createTextNode('Estado'));
    statusLabel.className = 'admin_label_single';
    statusLabel.style.width = '25%';

    var selectList = document.createElement("select");
    for (var i in  select) {
      var option = document.createElement("option");
      option.value = i;
      option.text = select[i];
      selectList.appendChild(option);
    }
    selectList.value = project.status;
    selectList.className = 'admin_input';
    selectList.style.width = '75%';
    selectList.style.marginBottom = '10px';

    var update = document.createElement("button");
    update.appendChild(document.createTextNode('Actualizar estado'));
    update.className = 'button';
    update.type = 'button';
    update.onclick = (function() {
      var projectId = project.projectId;
      var statusObj = selectList;
      return function() {
        updateProjectStatus(projectId, statusObj);
      }
    })();

    var preview = document.createElement("button");
    preview.appendChild(document.createTextNode('Mostrar proyecto'));
    preview.className = 'button';
    preview.type = 'button';
    preview.onclick = (function() {
      var projectId = project.projectId;
      var version = project.version;
      return function() {
        window.open('project/' + projectId + '/' + version + '/preview');
      }
    })();

    var del = document.createElement("button");
    del.appendChild(document.createTextNode('Eliminar proyecto'));
    del.className = 'button';
    del.type = 'button';
    del.style.margin = '0';
    del.onclick = (function() {
      var projectId = project.projectId;
      var projectDiv = container;
      return function() {
        deleteProject(projectId, projectDiv);
      }
    })();

    div.appendChild(status);
    div.appendChild(statusLabel);
    div.appendChild(selectList);
    div.appendChild(update);
    div.appendChild(preview);
    div.appendChild(del);

    return div;
  }

  function updateEdit(projects) {
    while (editSelectorObj.firstChild) {
      editSelectorObj.removeChild(editSelectorObj.firstChild);
    }

    if (projects.length == 0) {
      return;
    }

    for (var i = 0; i < projects.length; i++) {
      var option = document.createElement("option");
      option.value = projects[i].projectId;
      option.text = projects[i].name + ' - ' + projects[i].subname;
      editSelectorObj.appendChild(option);
    }
  }

  function editProject() {
    var projectId = editSelectorObj.value;
    if (!projectId) {
      return;
    }

    editErrorObj.style.display = 'none';
    tabs[1].panel.style.paddingBottom = '0px';
    ProjectForm.hide();

    HttpClient.sendRequest('project/' + projectId, 'GET', null, function(status, statusText, response) {
      if (status == 200) {
        onProjectReceived(response);
      } else {
        showEditError(status);
      }
    });
  }

  function showEditError(status) {
    if (status == 404) {
      editErrorTextObj.nodeValue = 'El proyecto no existe, actualiza la lista de proyectos';
    } else {
      editErrorTextObj.nodeValue = 'Se ha producido un error conectando con el servidor, intenetalo mas tarde';
    }
    editErrorObj.style.display = 'block';
  }

  function onProjectReceived(project) {
    tabs[1].panel.style.paddingBottom = '30px';
    ProjectForm.show(project);
  }

  return {
    init: init,
    refresh: refresh,
    onShow: onShowComponent
  };
}());

