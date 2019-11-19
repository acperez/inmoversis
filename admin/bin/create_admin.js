#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient,
    jsonschema = require('jsonschema').Validator,
    conf = require('inmoversis_common/config'),
    bCrypt = require('bcrypt-nodejs'),
    path = require('path');

var data = {
  email: process.argv[2],
  password: process.argv[3]
}

var loginSchema = {
  'id': '/Login',
  'type': 'object',
  'properties': {
    'email': {'type': 'string', 'required': true, 'minLength': 6, 'maxLength': 256, 'format': 'email'},
    'password': {'type': 'string', 'required': true, 'minLength': 1, 'maxLength': 40}
  },
  'additionalProperties': false
};

var jsonValidator = new jsonschema();

try {
  jsonValidator.validate(data, loginSchema, {throwError: true});
} catch(error) {
  console.log('Invalid params: ' + error.property + ' (' + error.instance + ') ' + error.message);
  console.log('Usage: ' + path.basename(process.argv[1]) + ' [email] [password]');
  return;
}

function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

MongoClient.connect(conf.db_url, function(err, db) {
  if (err) {
    throw(err)
  }

  var collection = db.collection('admins');
  var cursor = collection.find({'email': data.email})
  cursor.count(function(err, count) {
    if (err) {
      throw(err);
    }

    if (count > 0) {
      db.close();
      console.log('User already exists');
      return;
    }

    collection.insertOne({
      'email': data.email,
      'password': createHash(data.password)
    }, function(err, result) {
      if (err) {
        throw(err);
      }

      console.log("Admin created succesfully");

      db.close();
    });
  });
});
