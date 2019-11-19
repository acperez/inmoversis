var User = require('inmoversis_common/models/user'),
  log = require('inmoversis_common/logger').getLogger('site'),
  LocalStrategy   = require('passport-local').Strategy,
  bCrypt = require('bcrypt-nodejs');

function init(passport) {
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  setLoginStrategy(passport);
  setSignupStrategy(passport);
}

function setLoginStrategy(passport) {
  var options = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
  };

  passport.use('login', new LocalStrategy(options, function(req, email, password, done) {
    User.findOne({ 'email':  { $in: [email] }}, function(err, user) {
      if (err) {
        log.err('Error in login: ' + err);
        return done(500, false);
      }

      if (!user || !isValidPassword(user, password)) {
        log.info('Invalid authentication for user ' + email);
        return done(401, false);
      }

      // Update last_seen
      user.lastSeen = Date.now();
      user.save(function(err) {
        if (err) log.error('Error updating user last_seen: ' + err);
      });
      return done(null, user);
    });
  }));
}

function isValidPassword(user, password) {
  return bCrypt.compareSync(password, user.password);
}

function setSignupStrategy(passport) {
  var options = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
  };

  passport.use('register', new LocalStrategy(options, function(req, email, password, done) {
    process.nextTick(function () {
      User.findOne({ 'email':  { $in: [email] }}, function(err, user) {
        if (err) {
          log.error('Error in SignUp: ' + err);
          return done(500, false);
        }

        if (user) {
          log.info('User already exists with email: ' + user.email);
          return done(409, false);
        }

        var newUser = new User();
        newUser.ip = req.headers['x-forwarded-for'];
        newUser.email = email;
        newUser.password = createHash(password);
        newUser.name = req.body.name[0].toUpperCase() + req.body.name.slice(1);
        newUser.creationDate = Date.now();
        newUser.lastSeen = newUser.creationDate;

        newUser.save(function(err) {
          if (err) {
            log.error('Error saving user: ' + err);
            return done(500, false);
          }
            
          log.debug('User Registration succesful');
          return done(null, newUser);
        });
      });
    });
  }));
}

function createHash(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function isValidPassword(user, password) {
  return bCrypt.compareSync(password, user.password);
}


module.exports.init = init;
module.exports.createHash = createHash;
