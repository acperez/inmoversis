var log = require('inmoversis_common/logger').getLogger('admin'),
  mongoose = require('mongoose'),
  jsonschema = require('jsonschema').Validator;

var jsonValidator = new jsonschema();

function validate(action) {
  return validate[action] || (validate[action] = function(req, res, next) {
    var errorCode = _validate(action, req);
    if (errorCode) {
      return res.status(errorCode).send();
    }

    next();
  })
}

function validateMultipart(action) {
  return validateMultipart[action] || (validateMultipart[action] = function(req, res, next) {
    
    var error = function(errorCode, msg) {
      utils.delUploadFiles(req.files, function(err) {
        if (err) log.error('Error deleting incomming files: ' + err);
      });

      log.error(msg);
      return res.status(errorCode).send();
    }

    var files = {};
    req.files.forEach(function (file) {
      files[file.originalname] = {
        file: file,
        references: 0
      };
    });
    req.files = files;

    try {
      req.body = JSON.parse(req.body.data);
    } catch (e) {
      return error('422', 'Validation failed while parsing json: ' + e);
    }

    var errorCode = _validate(action, req, res, next);
    if (errorCode) return error(errorCode, 'Multipart validation error');

    next();
  })
}

function validateProjectAttachments(action) {
  return validateProjectAttachments[action] || (validateProjectAttachments[action] = function(req, res, next) {

    var error = function(msg) {
      utils.delUploadFiles(req.files, function(err) {
        if (err) log.error("Error deleting incomming files: " + err);
      });

      log.error('Validate attachments - ' + msg);
      return res.status(422).send();
    }

    var files = req.files;

    var project = req.body;
    var images = project.house.photos;
    if (project.image) images = images.concat(project.image);
    if (project.preview) images = images.concat(project.preview);
    for (var index = 0; index < images.length; index++) {
      var image = images[index];
      if (!files[image] || !files[image].file.mimetype.startsWith('image/')) {
        return error('Referenced image not found: ' + image);
      }
      files[image].references++;
    }

    var documents = project.documents;
    for (var index = 0; index < documents.length; index++) {
      var doc = documents[index].filename;
      if (!files[doc]) {
        return error('Referenced document not found: ' + doc);
      }
      files[doc].references++;
    }

    // Ensure that all files are referenced
    for (var file in files) {
      if (files[file].references == 0) {
        return error('Found attachment not being used: ' + file);
      }
    }

    req.files = files;

    next();
  })
}

function _validate(action, req) {
  var operation = validators[action];
  var data = req.body;
  if (operation.isQuery) {
    data = req.params;
  }

  try {
    jsonValidator.validate(data, operation.schema, {throwError: true});
  } catch(error) {
    log.error('Validation failed: ' + error.property + ' (' + error.instance + ') ' + error.message);
    return operation.errorCode;
  }

  return null;
}

module.exports.validate = validate;
module.exports.validateMultipart = validateMultipart;
module.exports.validateProjectAttachments = validateProjectAttachments;


function initSchemas() {

  var loginSchema = {
    'id': '/Login',
    'type': 'object',
    'properties': {
      'email': {'type': 'string', 'required': true, 'minLength': 6, 'maxLength': 256, 'format': 'email'},
      'password': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 40}
    },
    'additionalProperties': false
  };

  var userIdSchema = {
    'id': '/UserId',
    'type': 'object',
    'properties': {
      'userId': {'type': 'string', 'required': true, 'format': 'ObjectId'}
    },
    'additionalProperties': false
  };

  var projectIdSchema = {
    'id': '/ProjectId',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'}
    },
    'additionalProperties': false
  };

  var photosSchema = {
    'id': '/Photo',
    'type': 'object',
    'properties': {
      'file': {'type': 'string', 'required': true, 'minLength': 1}
    },
    'additionalProperties': false
  };

  var coordinatesSchema = {
    'id': '/Coordinates',
    'type': 'object',
    'properties': {
      'lat': {'type': 'number', 'required': true},
      'lon': {'type': 'number', 'required': true}
    },
    'additionalProperties': false
  };

  var houseSchema = {
    'id': '/House',
    'type': 'object',
    'properties': {
      'description': {'type': 'string', 'required': true, 'minLength': 1},
      'address': {'type': 'string', 'required': true, 'minLength': 1},
      'location': {'$ref': '/Coordinates'},
      'size': {'type': 'integer', 'required': true, 'minimum': 0},
      'rooms': {'type': 'integer', 'minimum': 0},
      'wc': {'type': 'integer', 'minimum': 0},
      'price_per_meter': {'type': 'integer', 'required': true, 'minimum': 0},
      'status': {'type': 'string', 'required': true, 'minLength': 1},
      'type': {'type': 'string', 'required': true, 'minLength': 1},
      'photos': {
        'type': 'array',
        'items': {'$ref': '/Photo'}
      }
    },
    'required': ['location', 'photos'],
    'additionalProperties': false
  };

  var financesPurchaseSchema = {
    'id': '/FinancesPurchase',
    'type': 'object',
    'properties': {
      'price': {'type': 'number', 'required': true},
      'taxes': {'type': 'number', 'required': true},
      'refurbishment': {'type': 'number', 'required': true},
      'unforeseen': {'type': 'number', 'required': true},
      'total_price': {'type': 'number', 'required': true}
    },
    'additionalProperties': false
  };

  var financesSellSchema = {
    'id': '/FinancesSell',
    'type': 'object',
    'properties': {
      'price': {'type': 'number', 'required': true},
      'profitability': {'type': 'number', 'required': true},
      'fee': {'type': 'number', 'required': true},
      'fee_nominal': {'type': 'number', 'required': true},
      'value_added_tax': {'type': 'number', 'required': true},
      'value_added_tax_nominal': {'type': 'number', 'required': true},
      'net_profitability': {'type': 'number', 'required': true},
      'corporate_tax': {'type': 'number', 'required': true},
      'corporate_tax_nominal': {'type': 'number', 'required': true},
      'corporate_profit': {'type': 'number', 'required': true},
      'management_fee': {'type': 'number', 'required': true},
      'management_fee_nominal': {'type': 'number', 'required': true},
      'developer_fee': {'type': 'number', 'required': true},
      'developer_fee_nominal': {'type': 'number', 'required': true},
      'platform_profit': {'type': 'number', 'required': true},
      'investor_profitability': {'type': 'number', 'required': true},
    },
    'additionalProperties': false
  };

  var financesRentSchema = {
    'id': '/FinancesRent',
    'type': 'object',
    'properties': {
      'payment': {'type': 'number', 'required': true},
      'profitability': {'type': 'number', 'required': true},
      'insurance': {'type': 'number', 'required': true},
      'home_insurance': {'type': 'number', 'required': true},
      'ibi': {'type': 'number', 'required': true},
      'community_expenses': {'type': 'number', 'required': true},
      'unforeseen': {'type': 'number', 'required': true},
      'earnings': {'type': 'number', 'required': true},
      'net_profitability': {'type': 'number', 'required': true},
      'amortization': {'type': 'number', 'required': true},
      'corporate_tax': {'type': 'number', 'required': true},
      'corporate_tax_nominal': {'type': 'number', 'required': true},
      'corporate_profit': {'type': 'number', 'required': true},
      'platform_fee': {'type': 'number', 'required': true},
      'platform_profit': {'type': 'number', 'required': true},
      'investor_profitability': {'type': 'number', 'required': true},
    },
    'additionalProperties': false
  };

  var financesSchema = {
    'id': '/Finances',
    'type': 'object',
    'properties': {
      'description': {'type': 'string', 'required': true, 'minLength': 1},
      'purchase': {'$ref': '/FinancesPurchase'},
      'sell_enabled': {'type': 'boolean', 'required': true},
      'sell': {'$ref': '/FinancesSell'},
      'rent_enabled': {'type': 'boolean', 'required': true},
      'rent': {'$ref': '/FinancesRent'},
      'profitability': {'type': 'number', 'required': true}
    },
    'required': ['purchase'],
    'additionalProperties': false
  };

  var documentSchema = {
    'id': '/Document',
    'type': 'object',
    'properties': {
      'text': {'type': 'string', 'required': true, 'minLength': 1},
      'filename': {'type': 'string', 'required': true, 'format': 'file'},
      'filesize': {'type': 'number', 'required': true}
    },
    'additionalProperties': false
  };

  var projectSchema = {
    'id': '/Project',
    'type': 'object',
    'properties': {
      'name': {'type': 'string', 'required':true, 'minLength': 1},
      'subname': {'type': 'string', 'minLength': 1},
      'label': {'type': 'string', 'minLength': 1},
      'campaign_duration': {'type': 'integer', 'required': true, 'minimum': 1},
      'key_points': {'type': 'string', 'minLength': 1},
      'project_duration': {'type': 'integer', 'required': true, 'minimum': 1},
      'status': {
        'enum': [
          'hidden', 'published', 'open', 'closed', 'finished'
        ]
      },
      'image': {'type': 'string'},
      'preview': {'type': 'string'},
      'house': {'$ref': '/House'},
      'finances': {'$ref': '/Finances'},
      'documents': {
        'type': 'array',
        'items': {'$ref': '/Document'},
      }
    },
    'required': ['house', 'finances', 'documents'],
    'additionalProperties': false
  };

  var projectUpdateSchema = {
    'id': '/Project',
    'type': 'object',
    'properties': {
      'name': {'type': 'string', 'required': true, 'minLength': 1},
      'subname': {'type': 'string', 'minLength': 1},
      'label': {'type': 'string', 'minLength': 1},
      'campaign_duration': {'type': 'integer', 'required': true, 'minimum': 1},
      'key_points': {'type': 'string', 'minLength': 1},
      'project_duration': {'type': 'integer', 'required': true, 'minimum': 1},
      'balance': {'type': 'integer', 'minimum': 0},
      'status': {
        'enum': [
          'hidden', 'published', 'open', 'closed', 'finished'
        ]
      },
      'image': {'type': 'string', 'minLength': 1},
      'preview': {'type': 'string', 'minLength': 1},
      'house': {'$ref': '/House'},
      'finances': {'$ref': '/Finances'},
      'documents': {
        'type': 'array',
        'items': {'$ref': '/Document'},
      }
    },
    'required': ['house', 'documents'],
    'additionalProperties': false
  };

  var statusSchema = {
    'id': '/Status',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'status': {
        'enum': [
          'hidden', 'published', 'open', 'closed', 'finished'
        ]
      },
    },
    'required': ['status'],
    'additionalProperties': false
  };

  var previewSchema = {
    'id': '/Preview',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'version': {'type': 'string', 'required': true, 'format': 'UUIDv4'}
    },
    'additionalProperties': false
  };

  var resourceSchema = {
    'id': '/Resource',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'version': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'resourceType': {
        'enum': [
          'documents', 'images', 'photos'
        ]
      },
      'resource': {'type': 'string', 'required': true, 'format': 'file'}
    },
    'additionalProperties': false
  };

  var commentsSchema = {
    'id': '/Comments',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'page': {'type': 'string', 'required': true, 'format': 'queryNumber'}
    },
    'additionalProperties': false
  };

  var commentSchema = {
    'id': '/Comment',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'text': {'type': 'string', 'required': true},
      'threadId': {'type': ['string', 'null'], 'format': 'optionalObjectId'}
    },
    'additionalProperties': false
  };

  var delCommentSchema = {
    'id': '/DelComment',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'threadId': {'type': 'string', 'required': true, 'format': 'ObjectId'},
      'msgId': {'type': 'string', 'required': true, 'format': 'ObjectId'}
    },
    'additionalProperties': false
  };

  var delThreadSchema = {
    'id': '/DelComment',
    'type': 'object',
    'properties': {
      'projectId': {'type': 'string', 'required': true, 'format': 'UUIDv4'},
      'threadId': {'type': 'string', 'required': true, 'format': 'ObjectId'}
    },
    'additionalProperties': false
  };

  jsonValidator.addSchema(photosSchema, '/Photo');
  jsonValidator.addSchema(coordinatesSchema, '/Coordinates');
  jsonValidator.addSchema(houseSchema, '/House');
  jsonValidator.addSchema(financesPurchaseSchema, '/FinancesPurchase');
  jsonValidator.addSchema(financesSellSchema, '/FinancesSell');
  jsonValidator.addSchema(financesRentSchema, '/FinancesRent');
  jsonValidator.addSchema(financesSchema, '/Finances');
  jsonValidator.addSchema(documentSchema, '/Document');

  return {
    'login': { schema: loginSchema, isQuery: false, errorCode: 422 },
    'userId': { schema: userIdSchema, isQuery: false, errorCode: 422 },
    'projectId': { schema: projectIdSchema, isQuery: true, errorCode: 422 },
    'newProject': { schema: projectSchema, isQuery: false, errorCode: 422 },
    'updateProject': { schema: projectUpdateSchema, isQuery: false, errorCode: 422 },
    'updateStatus': { schema: statusSchema, isQuery: true, errorCode: 422 },
    'preview': { schema: previewSchema, isQuery: true, errorCode: 422 },
    'resource': { schema: resourceSchema, isQuery: true, errorCode: 422 },
    'getComments': { schema: commentsSchema, isQuery: true, errorCode: 422 },
    'comment': { schema: commentSchema, isQuery: false, errorCode: 422 },
    'delComment': { schema: delCommentSchema, isQuery: true, errorCode: 422 },
    'delThread': { schema: delThreadSchema, isQuery: true, errorCode: 422 }
  }
}

var validators = initSchemas();

jsonschema.prototype.customFormats.spaces = function(input) {
  return !/\s/.test(input);
};

jsonschema.prototype.customFormats.ObjectId = function(input) {
  return mongoose.Types.ObjectId.isValid(input);
};

jsonschema.prototype.customFormats.optionalObjectId = function(input) {
  if (!input) return true;
  return mongoose.Types.ObjectId.isValid(input);
};

jsonschema.prototype.customFormats.UUIDv4 = function(input) {
  var expr = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return expr.test(input.toUpperCase());
}

jsonschema.prototype.customFormats.file = function(input) {
  var expr = /^[a-zA-Z0-9_-]*\.[a-zA-Z0-9]*$/;
  return expr.test(input);
}

jsonschema.prototype.customFormats.queryNumber = function(input) {
  return !isNaN(input) && Number(input) >= 0
}
