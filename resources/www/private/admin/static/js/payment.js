'use strict';

var Payment = (function() {
  var serviceObj, testBtnObj;
  var service = Mangopay;

  function init() {
    serviceObj = document.getElementById('payment_service');
    testBtnObj = document.getElementById('payment_test_btn');
    testBtnObj.addEventListener('click', function(evt) { service.test(); });

    serviceObj.appendChild(document.createTextNode(service.name));
    service.init();
  }

  function refresh() {
    service.refresh();
  }

  return {
    init: init,
    refresh: refresh
  };
}());
