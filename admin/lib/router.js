var express = require('express'),
  conf = require('inmoversis_common/config'),
  api = require('./api'),
  path = require('path'),
  validate = require('./validators').validate,
  validateMultipart = require('./validators').validateMultipart,
  validateProjectAttachments = require('./validators').validateProjectAttachments,
  router = express.Router(),
  sanitize = require('./sanitizer').sanitize;

function load(passport, upload) {

  var publicFolder = path.join(conf.resources_path, 'private', 'admin');
  var htmlFolder = path.join(publicFolder, 'html');
  var staticFolder = path.join(publicFolder, 'static');
  var projectsFolder = path.join(publicFolder, 'projects');

  /* POST session (login)
   * Code:
   * 200 - User authenticated
   * 401 - User not authenticated
   */
  router.post(
    '/admin/session',
    validate('login'),
    function(req, res) {
      api.login(passport, req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* GET users
   * Code:
   * 200 - Users
   * 401 - User not authenticated
   * 500 - DB error
   */
  router.get(
    '/admin/users',
    authenticateAPI,
    function(req, res) {
      api.users(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* DELETE user
   * Code:
   * 200 - User deleted
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.delete(
    '/admin/user',
    authenticateAPI,
    validate('userId'),
    function(req, res) {
      api.deleteUser(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* GET projects
   * Code:
   * 200 - User authenticated
   * 401 - User not authenticated
   * 500 - DB error
   */
  router.get(
    '/admin/projects',
    authenticateAPI,
    function(req, res) {
      api.projects(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* GET project
   * Code:
   * 200 - User authenticated
   * 401 - User not authenticated
   * 404 - Project not found
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.get(
    '/admin/project/:projectId',
    authenticateAPI,
    validate('projectId'),
    function(req, res) {
      api.getProject(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* POST project - create project
   * Code:
   * 200 - Project created
   * 401 - User not authenticated
   * 413 - Request entity too large, max size is 40M
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.post(
    '/admin/project',
    authenticateAPI,
    upload.array('attachment'),
    validateMultipart('newProject'),
    validateProjectAttachments(),
    function(req, res) {
      api.newProject(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* PUT project - update project
   * Code:
   * 200 - Project updated
   * 401 - User not authenticated
   * 404 - Project not found
   * 413 - Request entity too large, max size is 40M
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.put(
    '/admin/project/:projectId',
    authenticateAPI,
    validate('projectId'),
    upload.array('attachment'),
    validateMultipart('updateProject'),
    validateProjectAttachments(),
    function(req, res) {
      api.updateProject(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* PUT project status - update project status
   * Code:
   * 200 - Project updated
   * 206 - Project updated but failed to clean old files
   * 401 - User not authenticated
   * 404 - Project not found
   * 422 - Invalid or missing params
   * 500 - DB error
   * 503 - Update failed and failed to clean
   */
  router.put(
    '/admin/project/:projectId/status/:status',
    authenticateAPI,
    validate('updateStatus'),
    function(req, res) {
      api.updateProjectStatus(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* DELETE project
   * Code:
   * 200 - Project deleted
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.delete(
    '/admin/project/:projectId',
    authenticateAPI,
    validate('projectId'),
    function(req, res) {
      api.deleteProject(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* GET Projects Page */
  router.get(
    '/admin/index',
    authenticate,
    function(req, res) {
      res.sendFile(path.join(htmlFolder, 'index.html'));
    }
  );

  /* GET Project Page Preview */
  router.get(
    '/admin/project/:projectId/:version/preview',
    authenticate,
    validate('preview'),
    function(req, res) {
      var file = path.join(projectsFolder, req.params.projectId, req.params.version, 'index.hjs');
      api.getProject(req, res, function(status, project) {
        if (!project) res.status(status).send();

        res.render(file, project);
      });
    }
  );

  router.get(
    '/admin/project/:projectId/:version/:resourceType/:resource',
    authenticateAPI,
    validate('resource'),
    function(req, res) {
      var file = path.join(projectsFolder, req.params.projectId, req.params.version, req.params.resourceType, req.params.resource);
      res.sendFile(file, function(err){
        if (err) res.status(404).send();
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
    '/admin/comments/:projectId/:page',
    authenticateAPI,
    validate('getComments'),
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
    '/admin/comment',
    authenticateAPI,
    validate('comment'),
    sanitize('newComment'),
    function(req, res) {
      api.publishComment(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* DELETE Comment thread
   * Code:
   * 200 - Comment deleted
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.delete(
    '/admin/comment/:projectId/:threadId',
    authenticateAPI,
    validate('delThread'),
    function(req, res) {
      api.deleteCommentThread(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* DELETE Comment child
   * Code:
   * 200 - Comment deleted
   * 401 - User not authenticated
   * 422 - Invalid or missing params
   * 500 - DB error
   */
  router.delete(
    '/admin/comment/:projectId/:threadId/:msgId',
    authenticateAPI,
    validate('delComment'),
    function(req, res) {
      api.deleteCommentChild(req, res, function(status, data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(status).send(data);
      });
    }
  );

  /* GET Login Page */
  router.get('/admin/login', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/admin/index');
      return
    }

    res.sendFile(path.join(htmlFolder, 'login.html'));
  });

  /* GET Logout */
  router.get('/admin/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('login');
  });

  /* GET static files */
  router.get('/admin/static/*', function(req, res) {
    res.sendFile(path.join(staticFolder, req.params[0]), function(err){
      if (err) res.status(404).send();
    });
  });

  /* Redirect unknown route to index */
  router.get('*', function(req, res) {
    res.redirect('/admin/index');
  });

  /* Auth helper functions */
  function authenticate(req, res, next){
    if (!req.isAuthenticated()) {
      res.redirect('/admin/login');
      return;
    }

    next();
  }

  function authenticateAPI(req, res, next){
    if (!req.isAuthenticated()) {
      req.session.destroy();
      res.status(401).send();
      return;
    }

    next();
  }

  return router;
}

module.exports.load = load;
