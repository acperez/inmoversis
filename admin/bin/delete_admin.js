#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient,
  jsonschema = require('jsonschema').Validator,
  conf = require('inmoversis_common/config'),
  path = require('path');

var data = {
	email: process.argv[2]
}

var emailSchema = {
  'id': '/Email',
  'type': 'object',
  'properties': {
    'email': {'type': 'string', 'required': true, 'minLength': 6, 'maxLength': 256, 'format': 'email'}
  },
  'additionalProperties': false
};

var jsonValidator = new jsonschema();

try {
  jsonValidator.validate(data, emailSchema, {throwError: true});
} catch(error) {
  console.log('Invalid params: ' + error.property + ' (' + error.instance + ') ' + error.message);
  console.log('Usage: ' + path.basename(process.argv[1]) + ' [email]');
  return;
}

MongoClient.connect(conf.db_url, function(err, db) {
  if (err) {
    throw(err)
  }

  db.collection('admins').deleteOne({'email': data.email}, function(err, result){
     console.log('User deleted succesfully');
    db.close();
  });
});
