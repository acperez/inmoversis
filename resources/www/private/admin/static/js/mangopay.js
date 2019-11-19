'use strict';

var Mangopay = (function() {
  var name = 'MangoPay';

  function init() {
  }

  function refresh() {
  }

  function test() {
    HttpClient.sendRequest('payment/test', 'GET', null, function(status, statusText, response) {
      if (status == 200) {
        console.log(response);
      } else {
        console.log('Se ha producido un error, intenetalo mas tarde');
      }
    });
  }

  return {
    name: name,
    init: init,
    refresh: refresh,
    test: test
  };
}());
