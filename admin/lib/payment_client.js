var conf = require('inmoversis_common/config'),
    lemonway = require('inmoversis_common/lemonway_constants'),
    PendingKYC = require('inmoversis_common/models/pendingKYC'),
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

function _doRequest(service, data, ip, callback) {
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

function checkKYCUpdates() {
  //return tmp();

  PendingKYC.find({}, function(err, pendingKYCs) {
    pendingKYCs.forEach(function(pending) {
console.log(JSON.stringify(pending))
      var data = {
        walletUa: '',
        updateDate: (Math.floor(pending.date.getTime() / 1000) - (120 * 24 * 60 * 60)).toString()
        //updateDate: (Math.floor(pending.date.getTime() / 1000) - (2 * 60 * 60)).toString()
      }

      _doRequest('GetKycStatus', data, pending.ip, function(error, response, body) {
        if (error || response.statusCode != 200) {
          log.error("Failed to check pending KYC: " + error);
          log.error("Lemonway response: " + JSON.stringify(response));
          return callback(500);
        }

        var wallets = body.d.WALLETS.WALLET;
        var wallet = null;
        for (var index = 0; index < wallets.length; index++) {
          if (wallets[index].ID == pending.user) {
            wallet = wallets[index];
            break;
          }
        }

        if (!wallet) {
          log.error('Failed to check KYC update for: ' + JSON.stringify(pending));
          return;
        }

        if (wallet.S != lemonway.walletStatusDefault) {
          return processWalletStatus(walet);
        }

        var date = new Date(Number(wallet.DATE + '000'));
        // Fake validation OK
        //if (Date.now() - date > 24 * 60 * 60) {
          wallet.S = '6';
          return processWalletStatus(wallet, pending);
        //}
        if (Date.now() - date > lemonway.createWalletTimeout) {
          // borrar bbdd notificar big errorr!!!
        }
        console.log(wallet);
        console.log(lemonway.walletStatus[wallet.S]);
        console.log("------------------------------")
      });
    });
  });
}

function processWalletStatus(wallet, details) {
  if (wallet.S == '6' || wallet.S == '7') {
    // OK
    //console.log("pppppppproooooooooccceesss");
    //console.log(wallet);
    //console.log(lemonway.walletStatus[wallet.S]);
    console.log("::::::::::::::::::::::::::::::::::::::::::::::::")
   
    var data = {
      wallet: details.user,
      email: ''
    }

    _doRequest('GetWalletDetails', data, details.ip, function(error, response, body) {
      if (error || response.statusCode != 200) {
        log.error("Failed to check pending KYC: " + error);
        log.error("Lemonway response: " + JSON.stringify(body));
        return
      }
      console.log(JSON.stringify(body))
      console.log("");
    });
  }

  if (wallet.S == '3' || wallet.S =='2') {
    // Rejected or incomplete
  }

  if (wallet.S == '13') {
    // Updating from KYC2 to KYC3
  }
}

checkKYCUpdates();
