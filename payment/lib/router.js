var express = require('express'),
  path = require('path'),
  api = require('./api'),
  router = express.Router();

function load() {

  /* POST user data
   * Code:
   * 200 - User updated
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - Unknown error while connecting DB
   */
  router.post(
    '/payment/wallet',
    function(req, res) {
      api.createWallet(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  router.put(
    '/payment/wallet',
    function(req, res) {
      api.updateWallet(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  return router;
}

module.exports.load = load;
