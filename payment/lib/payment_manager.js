var url = require('url'),
  conf = require('inmoversis_common/config'),
  lemonway = require('inmoversis_common/lemonway_constants'),
  request = require('request');

var baseUrl = conf.lemonway_url;

var login = conf.lemonway_login;
var password = conf.lemonway_password;
var language = conf.lemonway_language;
var version = conf.lemonway_version;

function _createPostData(service, data, ip) {
  data['wlLogin'] = login;
  data['wlPass'] = password;
  data['language'] = language;
  data['version'] = lemonway.services[service];
  data['walletIp'] = ip;
  data['walletUa'] = '';

  return data;
}

function doRequest(service, data, ip, callback) {
  var body = _createPostData(service, data, ip);

  request({
    url: baseUrl + '/' + service,
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8'
    },
    json: body
  }, callback);
}

module.exports.doRequest = doRequest;
