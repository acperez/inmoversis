var Admin = require('../models/admin'),
  log = require('inmoversis_common/logger').getLogger('admin');
  LocalStrategy   = require('passport-local').Strategy,
  bCrypt = require('bcrypt-nodejs');

function init(passport) {
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function(admin, done) {
    done(null, admin.id);
  });

  passport.deserializeUser(function(id, done) {
    Admin.findById(id, function(err, admin) {
      done(err, admin);
    });
  });

  setLoginStrategy(passport);
}

function setLoginStrategy(passport) {
  var options = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
  };

  passport.use('login', new LocalStrategy(options, function(req, email, password, done) {
    Admin.findOne({ 'email':  { $in: [email] }}, function(err, admin) {
      if (err) {
        log.err('Error in login: ' + err);
        return done(500, false);
      }

      if (!admin || !isValidPassword(admin, password)) {
        log.info('Invalid authentication for user ' + email);
        return done(401, false);
      }

      return done(null, admin);
    });
  }));
}

function isValidPassword(admin, password) {
  return bCrypt.compareSync(password, admin.password);
}

function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function isValidPassword(admin, password) {
  return bCrypt.compareSync(password, admin.password);
}

module.exports.init = init;
