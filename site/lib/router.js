var express = require('express'),
  path = require('path'),
  conf = require('inmoversis_common/config'),
  api = require('./api'),
  router = express.Router(),
  validate = require('./validators').validate,
  uploadDocs = require('./validators').uploadDocs,
  sanitize = require('./sanitizer').sanitize;

function load(passport, upload) {

  /* POST session (login)
   * Code:
   * 200 - User authenticated
   * 401 - User not authenticated
   */
  router.post(
    '/api/session',
    validate('login'),
    function(req, res) {
      api.login(passport, req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* POST register
   * Code:
   * 200 - User created
   * 409 - User already exists
   * 422 - Invalid or missing params
   * 500 - Unknown error while connecting DB
   */
  router.post(
    '/api/user/',
    validate('register'),
    sanitize('register'),
    function(req, res) {
      api.register(passport, req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* POST user data
   * Code:
   * 200 - User updated
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - Unknown error while connecting DB
   */
  router.post(
    '/api/user/details',
    authenticateAPI,
    validate('userDetails'),
    sanitize('userDetails'),
    function(req, res) {
      api.saveUserData(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );
  
  /* PUT user data
   * Code:
   * 200 - Update user done
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.put(
    '/api/user/details',
    authenticateAPI,
    validate('updateUserDetails'),
    sanitize('updateUserDetails'),
    function(req, res) {
      api.updateUserData(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* GET user data
   * Code:
   * 200 - User data
   * 401 - User not authenticated
   * 500 - DB error
   */
  router.get(
    '/api/user',
    authenticateAPI,
    function(req, res) {
      api.getUserData(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* POST user docs
   * Code:
   * 200 - Docs processed
   * 401 - User not authenticated
   * 413 - Request entity too large, max size is 40M
   * 422 - Invalid or missing params
   * 500 - Unknown error while connecting DB
   */
  router.post(
    '/api/user/docs',
    authenticateAPI,
    uploadDocs(upload),
    function(req, res) {
      api.userDocs(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* PUT user password
   * Code:
   * 200 - Update user password done
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.put(
    '/api/user/pass',
    authenticateAPI,
    validate('updatePassword'),
    function(req, res) {
      api.updateUserPassword(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send();
      });
    }
  );

  /* GET Comments 
   * Code:
   * 200 - Comments
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - DB Error
   */
  router.get(
    '/project/api/comments/:projectId/:page',
    authenticateAPI,
    validate('showComments'),
    sanitize('showComments'),
    function(req, res) {
      api.getComments(req, function(status, comments) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(comments);
      });
    }
  );

  /* POST comment
   * Code:
   * 200 - Comment published
   * 401 - User not authenticated
   * 413 - Request entity too large, max size is 40M
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.post(
    '/project/api/comment',
    authenticateAPI,
    validate('comment'),
    sanitize('newComment'),
    function(req, res) {
    api.publishComment(req, res, function(status, data) {
      res.setHeader('Content-Type', 'application/json');
      res.status(status).send(data);
    });
  })

  /* GET Home Page */
  router.get('/index', function(req, res) {

    var data = { partials: { menu: 'templates/menu' }}

    if (req.isAuthenticated()) {
      data.user = req.user.name;
    }

    res.render('templates/index', data);
  });

  /* GET About Page */
  router.get('/about', function(req, res) {

    var data = { partials: { menu: 'templates/menu' }}

    if (req.isAuthenticated()) {
      data.user = req.user.name;
    }

    res.render('templates/about', data);
  });

  /* GET projects Page */
  router.get('/projects', function(req, res) {

    api.getProjectsHtml(res, function(err, projects) {
      var data = { partials: { menu: 'templates/menu' },
                   projects: projects };

      if (req.isAuthenticated()) {
        data.user = req.user.name;
      }

      res.render('templates/projects', data);
    });
  });

  /* GET Home Page */
  router.get('/home', function(req, res) {
    if (!req.isAuthenticated()) {
      return res.redirect('/index');
    }

    var data = { partials: { menu: 'templates/menu' }}
    data.user = req.user.name;
    var userStatus = req.user.userStatus;

    if (userStatus == 'member' || userStatus == 'updating' ||
        userStatus == 'validating' || userStatus == 'rejected') {
      res.render('templates/home', data);
      return;
    }

    if (userStatus == 'provisional') {
      res.redirect('');
      return;
    }

    return res.render('templates/home_register', data);
  });

  /* GET Project Page */
  router.get('/project/:projectId', validate('projectId'), function(req, res) {
    if (!req.isAuthenticated()) {
      return res.redirect('/projects');
    }

    api.getProjectHtml(req, res, function(err, html) {
      res.status(err).send(html);
    });
  });

  /* GET Project document */
  router.get('/project/:projectId/:version/documents/:doc', validate('download'), function(req, res) {
    if (!req.isAuthenticated()) {
      return res.redirect('/projects');
    }

    var file = path.join(conf.siteProjectsPath, req.params.projectId, req.params.version, 'documents', req.params.doc);
    res.sendFile(file, function(err){
      if (err) res.status(404).send();
    });
  });

  /* GET Register Page */
  router.get('/register', function(req, res) {

    var data = { partials: { menu: 'templates/menu' }}

    if (req.isAuthenticated()) {
      // TODO redirect to profile
      // data.user = req.user.name;
    }

    res.render('templates/register', data);
  });

  /* GET Login Page */
  router.get('/login', function(req, res) {

    var data = { partials: { menu: 'templates/menu' }}
  
    if (req.isAuthenticated()) {
      // TODO redirect to profile
      // data.user = req.user.name;
    }
  
    res.render('templates/login', data);
  });

  /* GET Logout */
  router.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/index');
  });

  /* GET Welcome Page */
  router.get('/welcome', function(req, res) {

    var data = { partials: { menu: 'templates/menu' }}

    if (!req.isAuthenticated()) {
      res.render('templates/login', data);
      return;
    }

    data.user = req.user.name;
    res.render('templates/welcome', data);
  });

  /* API 404 */
  router.get('/api/*', function(req, res) {
    res.status(404).send();
  });

  /* Redirect unknown route to index */
  router.get('*', function(req, res) {
    res.redirect('/index');
  });

  return router;
}

/* Auth helper functions */
function authenticate(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
}

function authenticateAPI(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.destroy();
    return res.status(401).send();
  }

  next();
}

module.exports.load = load;
