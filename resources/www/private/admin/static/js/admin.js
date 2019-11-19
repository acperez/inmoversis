'use strict';

var currentTab = null;

var tabs = [];

var refreshObj;

var authCallback = [];

function init() {
  currentTab = 0;
  addTab('tab-users', 'tab-users-content', showRefresh, Users);
  addTab('tab-projects', 'tab-projects-content', Projects.onShow, Projects);
  addTab('tab-payment', 'tab-payment-content', showRefresh, Payment);

  overWriteHttpClient();

  initRefresh();

  Users.init();
  Projects.init();
  Payment.init();
}

function addTab(tabId, panelId, action, object) {
  var tabObj = document.getElementById(tabId);
  var panelObj = document.getElementById(panelId);
  var index = tabs.length;
  tabObj.addEventListener('click', function(evt) { onTabClick(index); });
  tabs.push({ tab: tabObj,
              panel: panelObj,
              action: action,
              object: object });
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

function initRefresh() {
  refreshObj = document.getElementById('refresh');
  refreshObj.addEventListener('click', function(evt) { onRefresh() });
}

function showRefresh() {
  refreshObj.style.display = 'block';
}

function hideRefresh() {
  refreshObj.style.display = 'none';
}

function onRefresh() {
  tabs[currentTab].object.refresh();
}

function overWriteHttpClient() {
  HttpClient.loginRequest = function(errorObj, params, callback) {
    this.sendRequest('/admin/session', 'POST', params, function(status, statusText, response) {
      HttpClient.processLoginResponse(status, statusText, response, errorObj, callback);
    }, true);
  };
}
