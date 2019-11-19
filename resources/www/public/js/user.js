'use strict';

var User = (function() {
  var data = {
    email: '',
    password: '',
    name: '',
    lastName: '',
    nationality: '',
    nationalId: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    region: '',
    country: '',
    investorType: '',
    status: '',
    company: {
      name: '',
      cif: '',
      postalCode: '',
      city: '',
      region: '',
      country: ''
    }
  };

  var loadCallback = null;

  function init(callback) {
  	loadCallback = callback;
    loadData(false);
  }

  function reload() {
    loadData(true);
  }

  function loadData(showLoading) {
    HttpClient.sendRequest('/api/user', 'GET', null, function(status, statusText, response) {
      if (status == 200) {
        onDataReceived(response);
      } else {
        loadCallback(null);
      }
    });
  }

  function onDataReceived(user) {
    data = user;

    if (loadCallback) {
      loadCallback(data);
    }
  }

  function getData() {
    return data;
  }

  return {
    init: init,
    reload: reload,
    getData: getData
  };
}());
