var log = require('inmoversis_common/logger').getLogger('site'),
  mongoose = require('mongoose'),
  jsonschema = require('jsonschema').Validator,
  countries = require('countries').countries,
  gm = require('gm').subClass({imageMagick: true}),
  phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance(),
  utils = require('./utils');

var jsonValidator = new jsonschema();

function validate(action) {
  return validate[action] || (validate[action] = function(req, res, next) {

    var operation = validators[action];
    var data = req.body;
    if (operation.isQuery) {
      data = req.params;
    }

    try {
      jsonValidator.validate(data, operation.schema, {throwError: true});
    } catch(error) {
      log.error('Validation failed: ' + error.property + ' (' + error.instance + ') ' + error.message);
      return res.status(operation.errorCode).send();
    }

    next();
  })
}

function uploadDocs(upload) {
  var docUpload = upload.fields([{ name: 'id', maxCount: 1 },
                                 { name: 'passport', maxCount: 1 },
                                 { name: 'companyTitle', maxCount: 1 },
                                 { name: 'companyProof', maxCount: 1 }]);

  return  function(req, res, next) {
    docUpload(req, res, function (error) {
      if (error) {
        log.error('Upload docs error: ' + error.message + ' - "' + error.field + '"');
        return res.status(422).send();
      }

      var files = [];
      for (var name in req.files) {
        files.push({ name: req.files[name][0].originalname ,
                     path: req.files[name][0].path});
      }

      validateFileFormat(files, function(error) {
        if (error) {
          utils.delUploadFiles(req.files, function(err) {
            log.error('Failed to delete upload files: ' + err);
          });
          
          log.error(error);
          return res.status(422).send();
        }

        next();
      });
    });
  }
}

module.exports.validate = validate;
module.exports.uploadDocs = uploadDocs;

function loadSchemas() {

  var loginSchema = {
    'id': '/Login',
    'type': 'object',
    'properties': {
      'email': {'type': 'string', 'required': true, 'minLength': 6, 'maxLength': 256, 'format': 'email'},
      'password': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 40}
    },
    'additionalProperties': false
  }

  var registerSchema = {
    'id': '/Register',
    'type': 'object',
    'properties': {
      'email': {'type': 'string', 'required': true, 'minLength': 6, 'maxLength': 256, 'format': 'email'},
      'password': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 40},
      'name': {'type': 'string', 'required': true, 'minLength': 2, 'maxLength': 256}
    },
    'additionalProperties': false
  }

  var passwordSchema = {
    'id': '/Password',
    'type': 'object',
    'properties': {
      'password': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 40}
    },
    'additionalProperties': false
  }

  var companySchema = {
    'id': '/Company',
    'type': ['object', 'null'],
    'properties': {
      'name': {'type': 'string', 'required': true, 'minLength': 2, 'maxLength': 256},
      'cif': {'type': 'string', 'required': true, 'format': 'cif'},
      'address': {'type': 'string', 'required': true, 'minLength': 2, 'maxLength': 256},
      'postalCode': {'type': 'string', 'required': true, 'format': 'postalCode'},
      'city': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 140},
      'region': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 140},
      'country': {'type': 'string', 'required': true, 'minLength': 1, 'format': 'ISO3166'}
    },
    'additionalProperties': false
  };

  var userDataSchema = {
    'id': '/UserData',
    'type': 'object',
    'properties': {
      'name': {'type': 'string', 'required': true, 'minLength': 2, 'maxLength': 256},
      'lastName': {'type': 'string', 'required': true, 'minLength': 2, 'maxLength': 256},
      'nationality': {'type': 'string', 'required': true, 'minLength': 1, 'format': 'ISO3166'},
      'nationalId': {'type': 'string', 'required': true, 'format': 'nif'},
      'phoneNumber': {'type': 'string', 'required': true, 'format': 'phone'},
      'phoneLocation': {'type': 'string', 'required': true, 'format': 'ISO3166-2'},
      'address': {'type': 'string', 'required': true, 'minLength': 2, 'maxLength': 256},
      'postalCode': {'type': 'string', 'required': true, 'format': 'postalCode'},
      'city': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 140},
      'region': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 140},
      'country': {'type': 'string', 'required': true, 'minLength': 1, 'format': 'ISO3166'},
      'isCompany': {'type': 'boolean', 'required': true},
      'naturalUser': {'type': 'boolean', 'required': true},
      'company': {'$ref': '/Company'}
    },
    'additionalProperties': false
  };

  var updateCompanySchema = {
    'id': '/UpdateCompany',
    'type': ['object', 'null'],
    'properties': {
      'name': {'type': 'string', 'minLength': 2, 'maxLength': 256},
      'cif': {'type': 'string', 'format': 'cif'},
      'address': {'type': 'string', 'minLength': 2, 'maxLength': 256},
      'postalCode': {'type': 'string', 'format': 'postalCode'},
      'city': {'type': 'string', 'minLength': 1, 'maxLength': 140},
      'region': {'type': 'string', 'minLength': 1, 'maxLength': 140},
      'country': {'type': 'string', 'minLength': 1, 'format': 'ISO3166'}
    },
    'additionalProperties': false
  };

  var userUpdateSchema = {
    'id': '/UserData',
    'type': 'object',
    'properties': {
      'name': {'type': 'string', 'minLength': 2, 'maxLength': 256},
      'lastName': {'type': 'string', 'minLength': 2, 'maxLength': 256},
      'nationality': {'type': 'string', 'minLength': 1, 'format': 'ISO3166'},
      'nationalId': {'type': 'string', 'format': 'nif'},
      'phoneNumber': {'type': 'string', 'format': 'phone'},
      'phoneLocation': {'type': 'string', 'format': 'ISO3166-2'},
      'address': {'type': 'string', 'minLength': 2, 'maxLength': 256},
      'postalCode': {'type': 'string', 'format': 'postalCode'},
      'city': {'type': 'string', 'minLength': 1, 'maxLength': 140},
      'region': {'type': 'string', 'minLength': 1, 'maxLength': 140},
      'country': {'type': 'string', 'minLength': 1, 'format': 'ISO3166'},
      'isCompany': {'type': 'boolean', 'required': true},
      'company': {'$ref': '/UpdateCompany'}
    },
    'additionalProperties': false
  };

  var queryCommentsSchema = {
    'id': '/Comments',
    'type': ['object'],
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'page': {'type': 'string', 'required': true, 'format': 'queryNumber'}
    },
    'additionalProperties': false
  };

  var commentSchema = {
    'id': '/Comment',
    'type': ['object'],
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'text': {'type': 'string', 'required': true, 'minLength': 1},
      'threadId': {'type': ['string', 'null'], 'format': 'optionalObjectId'}
    },
    'additionalProperties': false
  };

  var projectSchema = {
    'id': '/Project',
    'type': ['object'],
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'}
    },
    'additionalProperties': false
  };

  var downloadSchema = {
    'id': '/Project',
    'type': ['object'],
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'version': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'doc': {'type': 'string', 'required': true, 'format': 'file'}
    },
    'additionalProperties': false
  }

  jsonValidator.addSchema(companySchema, '/Company');
  jsonValidator.addSchema(updateCompanySchema, '/UpdateCompany');

  return {
    'login': { schema: loginSchema, isQuery: false, errorCode: 422 },
    'register': { schema: registerSchema, isQuery: false, errorCode: 422 },
    'userDetails': { schema: userDataSchema, isQuery: false, errorCode: 422 },
    'updatePassword': { schema: passwordSchema, isQuery: false, errorCode: 422 },
    'updateUserDetails': { schema: userUpdateSchema, isQuery: false, errorCode: 422 },
    'comment': { schema: commentSchema, isQuery: false, errorCode: 422 },
    'showComments': { schema: queryCommentsSchema, isQuery: true, errorCode: 422 },
    'projectId': { schema: projectSchema, isQuery: true, errorCode: 422 },
    'download': { schema: downloadSchema, isQuery: true, errorCode: 404 }
  }
}

var validators = loadSchemas();

/* --------------------------------------------------------
 *                 Custom validators
 * --------------------------------------------------------
 */

jsonschema.prototype.customFormats.ISO3166 = function(input) {
  if (!input) return true;
  return input.toUpperCase() in countries;
};

jsonschema.prototype.customFormats['ISO3166-2'] = function(input) {
  if (!input) return true;
  return phoneUtil.getCountryCodeForRegion(input) != 0;
};

jsonschema.prototype.customFormats.file = function(input) {
  var expr = /^[a-zA-Z0-9_-]*\.[a-zA-Z0-9]*$/;
  return expr.test(input);
};

jsonschema.prototype.customFormats.queryNumber = function(input) {
  return !isNaN(input)
};

jsonschema.prototype.customFormats.UUIDv4 = function(input) {
  var expr = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return expr.test(input.toUpperCase());
};

jsonschema.prototype.customFormats.ObjectId = function(input) {
  return mongoose.Types.ObjectId.isValid(input);
};

jsonschema.prototype.customFormats.optionalObjectId = function(input) {
  if (!input) return true;
  return mongoose.Types.ObjectId.isValid(input);
};

jsonschema.prototype.customFormats.phone = function(input) {
  if (!input) return true;
  var phoneNumber = phoneUtil.parse(input);
  return phoneUtil.isValidNumber(phoneNumber);
};

jsonschema.prototype.customFormats.postalCode = function(input) {
  return /^[A-zÀ-ÿ\s\d-.]*$/.test(input);
};

jsonschema.prototype.customFormats.nif = function(input) {
  if (!input) return true;

  var nifExpr = /^(\d{8})([A-Z])$/;
  var nieExpr = /^[XYZ]\d{7,8}[A-Z]$/;
  var nifLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';

  input = input.toUpperCase();
  var nif = input;

  if (nieExpr.test(nif)) {
    var nie_prefix = nif.charAt(0);
    if (nie_prefix == 'X') {
      nie_prefix = 0;
    } else if (nie_prefix == 'Y') {
      nie_prefix = 1;
    } else if (nie_prefix == 'Z') {
      nie_prefix = 2;
    } else {
      return false;
    }

    nif = nie_prefix + nif.substr(1);
  }

  if (!nifExpr.test(nif)) {
    return false;
  }

  if (nif.charAt(8) != nifLetters.charAt(parseInt(nif, 10) % 23)) {
    return false;
  }

  return true;
};

jsonschema.prototype.customFormats.cif = function(input) {
  if (!input) return true;
  
  var _cif1 = /^[ABEH][0-9]{8}$/i;
  var _cif2 = /^[KPQS][0-9]{7}[A-J]$/i;
  var _cif3 = /^[CDFGJLMNRUVW][0-9]{7}[0-9A-J]$/i;
  
  input = input.toUpperCase();
  if (!_cif1.test(input) && !_cif2.test(input) && !_cif3.test(input)) {
    return false;
  }

  var control = input.charAt(input.length - 1);
  var sum_A = 0;
  var sum_B = 0;
  for (var i = 1; i < 8; i++) {
    if (i % 2 == 0) sum_A += parseInt(input.charAt(i));
    else {
      var t = (input.charAt(i) * 2) + "";
      var p = 0;
      for (var j = 0; j < t.length; j++) {
        p += parseInt(t.charAt(j));
      }
      sum_B += p;
    }
  }

  var sum_C = (sum_A + sum_B) + "";
  var sum_D = (10 - parseInt(sum_C.charAt(sum_C.length - 1))) % 10;
  var letters = "JABCDEFGHI";
  var result = false;
  if (control >= "0" && control <= "9") {
    result = (control == sum_D);
  } else {
    result = (control == letters.charAt(sum_D));
  }

  if (!result) {
    return false;
  }

  return true;
};

function validateFileFormat(fileArray, callback) {
  var file = fileArray.shift();

  if (!file) {
    return callback(null);
  }

  gm(file.path).format(function (err, format) {
    if (!/(PDF|PNG|JPEG|BMP|GIF)/.test(format)) {
      return callback('Upload docs error: invalid format for file "' + file.name + '"');
    }

    return validateFileFormat(fileArray, callback);
  });
}
