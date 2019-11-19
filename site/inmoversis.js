var express = require('express'),
  passport = require('passport'),
  session = require('express-session'),
  mongoose = require('mongoose'),
  log4js = require('log4js'),
  bodyParser = require("body-parser"),
  redis   = require("redis"),
  redisStore = require('connect-redis')(session),
  multer = require('multer'),
  fs = require('fs-extra'),
  conf = require('inmoversis_common/config'),
  log = require('inmoversis_common/logger').getLogger('site'),
  passportHelper = require('./lib/passport_helper'),
  router = require('./lib/router');

var app = express();
app.set('port', conf.site_port || 3000);

var cookieParser = require('cookie-parser');

var client  = redis.createClient();

var redis_options = {
  client: client,
  host: conf.redis_host,
  port: conf.redis_port,
  pass: conf.redis_pass
};

// Configure Passport
app.disable('x-powered-by');
app.enable('trust proxy');
app.use(cookieParser());
app.use(session({
  key: 'session',
  secret: conf.session_secret,
  resave: false,
  saveUninitialized: false,
  store: new redisStore(redis_options),
  proxy: true,
  cookie: {
    maxAge: conf.session_timeout,
    secure: true
  }
}));

passportHelper.init(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure logger
app.use(log4js.connectLogger(log, { level: 'auto' }));

// Configure db
mongoose.connect(conf.db_url);

// Configure template engine
app.set('views', conf.sitePath);
app.set('view engine', 'hjs');
app.engine('hjs', require('hogan-express'));

// If upload folder is deleted while server is runing
// multer will not create it again, so we configure
// the creation each time an upload happens.
var multerPath = conf.siteUploadPath;
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirs(multerPath, err => cb(err, multerPath))
  }
})
var upload = multer({ storage: storage,
                      limits: { fileSize: conf.siteUploadMaxSize }
});

// Load routes
var routes = router.load(passport, upload);
app.use('/', routes);

app.listen(app.get('port'), function() {
  log.info('Server running on port ' + this.address().port);
});
