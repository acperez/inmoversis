#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient;
var conf = require('inmoversis_common/config');

MongoClient.connect(conf.db_url, function(err, db) {
  if (err) {
    throw(err)
  }

  var cursor = db.collection('admins').find();
  cursor.each(function(err, result) {
    if (err) {
      throw(err);
    }

    if (result != null) {
      console.log(result);
    } else {
      db.close();
    }
  });
});
