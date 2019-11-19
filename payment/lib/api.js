var log = require('inmoversis_common/logger').getLogger('payment'),
  conf = require('inmoversis_common/config'),
  manager = require('./payment_manager'),
  PendingKYC = require('inmoversis_common/models/pendingKYC');

var fileTypes = {
  id: 0,
  passport: 12,
  companyTitle: 7,
  companyProof: 11
}

function createWallet(request, response, callback) {
  var user = request.body;
  var data = {
    'wallet': user.id,
    'clientMail': user.email,
    'clientTitle': 'U',
    'clientFirstName': user.name,
    'clientLastName': user.lastName,
    'street': user.address,
    'postCode': user.postalCode,
    'city': user.city,
    'ctry': user.country,
    'phoneNumber': user.phoneNumber,
    'mobileNumber': user.mobileNumber,
    'birthdate': '',
    'isCompany': user.isCompany,
    'companyName': user.companyName,
    'companyWebsite': '',
    'companyDescription': '',
    'companyIdentificationNumber': user.companyId,
    'isDebtor': '0',
    'nationality': user.nationality,
    'birthcity': '',
    'birthcountry': '',
    'payerOrBeneficiary': '',
    'isOneTimeCustomer': '0'
  }

  manager.doRequest('RegisterWallet', data, user.ip, function(error, response, body) {
    if (error || response.statusCode != 200) {
      log.error("Failed to create wallet: " + error);
      log.error("Lemonway response: " + JSON.stringify(response));
      return callback(500);
    }

    var error = body.d.E;
    if (error && error.Code != "152") {
      log.error("Failed to create wallet: " + JSON.stringify(error))
      return callback(500);
    }

    uploadFiles(user.id, user.ip, user.documents, callback);
  });
}

function uploadFiles(walletId, userIp, documents, callback) {
  var files = [];
  for (var i = 0; i < documents.length; i++) {
    var doc = documents[i];
    files.push({
      'wallet': walletId,
      'fileName': doc.name,
      'type': fileTypes[doc.type],
      'buffer': doc.data,
      'sddMandateId': ''
    });
  }

  var sendKYC = function(files) {
    var file = files.shift();
    if (!file) {
      return callback(200, "ok");
    }

    manager.doRequest('UploadFile', file, userIp, function(error, response, body) {
      if (error || response.statusCode != 200 || body.d.E) {
        log.error("Failed to upload KYC: " + error);
        log.error("Lemonway response: " + JSON.stringify(response));
        return callback(500);
      }

      var pending = new PendingKYC();
      pending.user = walletId;
      pending.ip = userIp;
      pending.date = Date.now();
      pending.save(function(err) {
        if (err && err.code != 11000) {
          log.error('Error saving KYC upload timestamp: ' + err);
          return callback(500, false);
        }

        sendKYC(files);  
      });
    });
  }

  sendKYC(files);
}

function updateWallet(request, response, callback) {
  console.log("ok");
  var user = request.body;

  var data = {
    'wallet': user.id,
    'newEmail': user.email,
    'newTitle': '',
    'newFirstName': user.name,
    'newLastName': user.lastName,
    'newStreet': user.address,
    'newPostCode': user.postalCode,
    'newCity': user.city,
    'newCtry': user.country,
    'newIp': '',
    'newPhoneNumber': user.phoneNumber,
    'newMobileNumber': user.mobileNumber,
    'newBirthDate': '',
    'newIsCompany': user.isCompany,
    'newCompanyName': user.companyName,
    'newCompanyWebsite': '',
    'newCompanyDescription': '',
    'newCompanyIdentificationNumber': user.companyId,
    'newIsDebtor': '',
    'newNationality': user.nationality,
    'newBirthcity': '',
    'newBirthcountry': ''
  }

  manager.doRequest('UpdateWalletDetails', data, user.ip, function(error, response, body) {
    if (error || response.statusCode != 200) {
      log.error("Failed to update wallet: " + error);
      log.error("Lemonway response: " + JSON.stringify(response));
      return callback(500);
    }

    var error = body.d.E;
    if (error && error.Code != "152") {
      log.error("Failed to update wallet: " + JSON.stringify(error))
      return callback(500);
    }

    callback(200);
  });
}

module.exports.createWallet = createWallet;
module.exports.updateWallet = updateWallet;
