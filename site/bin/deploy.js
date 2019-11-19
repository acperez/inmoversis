var http = require('https');
var fs = require('fs');
var path = require('path');
var conf = require('inmoversis_common/config');

function downloadCountryFile(callback) {
  var request = http.get(conf.countryFileUrl, function(response) {
    if (response.statusCode != 200) {
      return callback(null, 'Download error ' + response.statusCode);
    }

    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      return callback(body);
    });

  }).on('error', function(e) {
    return callback(null, e);
  });
}

function prepareCountryFile(callback) {
  fs.exists(path.join(conf.publicJsPath, conf.countryFilename), function(exists) {
    if (exists) {
      console.log('Countries file already exist. Nothing to do.')
      return callback(null);
    }

    downloadCountryFile(function (countryData, error) {
      if (error) {
        return callback(error);
      }

      countryData = countryData.replace(/\\/g,"\\\\");

      try {
        countryData = JSON.parse(countryData);
      } catch (e) {
        return callback(e);
      }

      var publicData = {};
      var nodeData = {};
      for (var index in countryData) {
        var country = countryData[index];

        publicData[country.cca2] = {
          c: country.cca3,
          n: country.translations.spa ? country.translations.spa.common : name.official
        }

        nodeData[country.cca3] = 1;
      }

      publicData = JSON.stringify(publicData).replace(/\\\\/g,"\\");
      publicData = 'var countries=' + publicData;

      nodeData = JSON.stringify(nodeData).replace(/\\\\/g,"\\");
      nodeData = 'exports.countries=' + nodeData;

      fs.mkdir(conf.publicJsPath, function (err) {
        fs.writeFile(path.join(conf.publicJsPath, conf.countryFilename), publicData, function(err) {
          if(err) {
            return callback(err);
          }

          fs.writeFile(path.join('node_modules', conf.countryFilename), nodeData, function(err) {
            if(err) {
              return callback(err);
            }

            return callback(null);
          });
        });
      });
    });
  });
}

function copyFile(source, target, callback) {
  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    callback(err);
  });

  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    callback(err);
  });

  wr.on("close", function(ex) {
    callback(null);
  });
  rd.pipe(wr);
}

function deploy() {
  prepareCountryFile(function (error) {
    if (error) {
      throw new Error(error);
    }

    var target = path.join(conf.publicJsPath, path.basename(conf.libphonenumberPath));
    copyFile(conf.libphonenumberPath, target, function(error) {
      if (error) {
        throw new Error(error);
      }
    });
  });    
}

deploy();
