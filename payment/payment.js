var express = require('express'),
  mongoose = require('mongoose'),
  log4js = require('log4js'),
  bodyParser = require("body-parser"),
  fs = require('fs-extra'),
  conf = require('inmoversis_common/config'),
  log = require('inmoversis_common/logger').getLogger('payment'),
  router = require('./lib/router');

var app = express();
app.set('port', conf.payment_port || 3000);

app.use(bodyParser.json({limit: conf.paymentUploadMaxSize}));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure logger
app.use(log4js.connectLogger(log, { level: 'auto' }));

// Configure db
mongoose.connect(conf.db_url);

// Load routes
var routes = router.load();
app.use('/', routes);

app.listen(app.get('port'), function() {
  log.info('Server running on port ' + this.address().port);
});
