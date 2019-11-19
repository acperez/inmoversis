var conf = require('inmoversis_common/config'),
    request = require('request');

var baseUrl = conf.payment_url + ':' + conf.payment_port;

function _doRequest(path, method, data, callback) {
  request({
    url: baseUrl + path,
    method: method,
    headers: { 
      'Content-type': 'application/json; charset=utf-8'
    },
    json: data
  }, callback);
}

function createWallet(user, files, callback) {
  var data = {
    id: user._id,
    ip: user.ip,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    address: user.address,
    postalCode: user.postalCode,
    city: user.city,
    country: user.country,
    phoneNumber: user.phone.isMobile ? '' : user.phone.e164,
    mobileNumber: user.phone.isMobile ? user.phone.e164 : '',
    isCompany: user.company ? '1' : '0',
    companyName: user.company ? user.company[0].name : '',
    companyId: user.company ? user.company[0].cif : '',
    nationality: user.nationality,
    documents: files
  }

  _doRequest('/payment/wallet', 'POST', data, callback);
}

module.exports.createWallet = createWallet;
