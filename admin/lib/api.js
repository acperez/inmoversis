var User = require('../models/admin'),
  LocalStrategy   = require('passport-local').Strategy,
  bCrypt = require('bcrypt-nodejs'),
  log = require('inmoversis_common/logger').getLogger('admin');
  User = require('inmoversis_common/models/user'),
  Project = require('inmoversis_common/models/project'),
  Comment = require('inmoversis_common/models/comment'),
  conf = require('inmoversis_common/config'),
  utils = require('./utils'),
  uuid = require('node-uuid');

function login(passport, request, response, callback) {
  passport.authenticate('login', function(error, admin, info) {
    if (!error && admin) {
      return _login(request, admin, callback);
    }

    callback(error, null);

  })(request, response);
}

function _login(request, admin, callback) {
  request.login(admin, function(err) {
    if (err) {
      return callback(500, null);
    }

    callback(200, null);
  });
}

function users(request, response, callback) {
  var usersProjection = { 
    __v: false,
    password: false
  };

  User.find({}, usersProjection, function(err, users) {
    if (err) {
      log.error('Error in users get: ' + err);      
      return callback(500, null);
    }

    callback(200, users);
  });
}

function deleteUser(request, response, callback) {
  User.findByIdAndRemove({$in: [request.body.userId]}, function(err, user) {
    if (err) {
      log.error('Error deleting user ' + request.body.userId + ': ' + err);
      return callback(500, null);
    }

    utils.createUserBackup(user, function(err) {
      if (err) {
        log.error('Error creating user backup: ' + err + '\n' + JSON.stringify(user));
      }

      return callback(200, null);
    });
  });
}

function projects(request, response, callback) {
  var projectsProjection = {
    __v: false,
    _id: false
  };

  Project.find({}, projectsProjection, function(err, projects) {
    if (err) {
      log.error('Error in users get: ' + err);
      return callback(500, null);
    }

    callback(200, projects);
  });
}

function getProject(request, response, callback) {
  var projectsProjection = {
    __v: false,
    _id: false
  };

  Project.findOne({ 'projectId': {$in: [request.params.projectId]}}, projectsProjection, function(err, project) {
    if (err) {
      log.error('Error in getProject: ' + err);
      return callback(500, null);
    }

    if (!project) {
      return callback(404, null);
    }

    callback(200, project);
  });
}

function newProject(request, response, callback) {
  var project = request.body;
  var files = request.files;

  // Create project folder and copy images with resize
  utils.createProject(project, files, response, function (error) {
    if (error) {
      utils.delUploadFiles(files, function(err) {
        if (err) log.error("Error deleting incomming files: " + err);
      });
      log.error('Create project - ' + error);
      return callback(500, null);
    }

    // Insert in database
    var projectDb = new Project(project);
    projectDb.save(function(err) {
      if (err) {
        log.error('Saving project: ' + err);
        return callback(500, false);
      }

      utils.delUploadFiles(files, function(err) {
        if (err) log.error("Error deleting incomming files: " + err);
      });
      return callback(200, null);
    });
  });
}

function updateProject(request, response, callback) {
  var reportError = function (error, status, callback) {
    log.error(error);
    utils.delUploadFiles(request.files, function(err) {
      if (err) log.error("Error deleting incomming files: " + err);
    });
    return callback(status, null);
  }

  var newProject = request.body;
  var projectId = request.params.projectId;

  Project.findOne({ 'projectId': {$in: [projectId]} }, function(err, project) {
    if (err) return reportError('Error in project find: ' + err, 500, callback);
    else if (!project) return reportError('Project not found ' + projectId, 404, callback);

    newProject.projectId = project.projectId;
    newProject.version = uuid.v4();

    utils.updateProject(newProject, request.files, response, function (error, isCriticalError) {
      if (error) {
        updateRollback(newProject, function(err) {
          if (err) return reportError('Update project version rollback error - ' + error, 503, callback);

          reportError('Update project version error - ' + error, 500, callback);
        });
        return;
      }

      // Avoid to update balance
      delete newProject.balance;
      Project.update({ 'projectId': {$in: [projectId]} }, newProject, function(err, numAffected) {
        if (err) {
          log.error('Error updating project in database\nOld Project: ' + JSON.stringify(project) + '\nNew project: ' + JSON.stringify(newProject));

          updateRollback(newProject, function(err) {
            if (err) return reportError('Update project db rollback error - ' + error, 503, callback);
            reportError("Error updating project: " + err, 500, callback);
          });
          return;
        }

        callback(200, null);
      });
    });
  });
}

function updateProjectStatus(request, response, callback) {
  var status = request.params.status;
  Project.findOne({ 'projectId': {$in: [request.params.projectId]} }, function(err, project) {
    if (err) {
      log.error('Error in project find: ' + err);
      return callback(500, null);
    }

    if (!project) {
      log.error('Project not found ' + request.params.projectId);
      return callback(404, null);
    }

    // hidden published open closed finished
    var isProjectPublic = (project.status == 'hidden' || project.status == 'finished') ? false : true;
    var isNewStatusPublic = (status == 'hidden' || status == 'finished') ? false : true;
    if (isProjectPublic == isNewStatusPublic) {
      if (project.status == status) return callback(200, null);

      project.status = status;
      project.save(function(err) {
        if (err) {
          log.error('Error updating project status: ' + err);
          return callback(500, null);
        }
        callback(200, null);
      });
      return;
    }

    project.status = status;
    if (!project.campaign_start && status == 'open') {
      project.campaign_start = Date.now();
      console.log(project.campaign_start)
    }

    if (isNewStatusPublic) {
      utils.publishProject(project, function (err) {
        if (err) {
          log.error('Error in filesystem during status update: ' + err);
          return callback(500, null);
        }
        project.save(function(err) {
          if (err) {
            log.error('Error updating project status: ' + err);
            return callback(500, null);
          }
          callback(200, null);
        });
      });
      return;
    }

    project.save(function(err) {
      if (err) {
        log.error('Error updating project status: ' + err);
        return callback(500, null);
      }
      utils.unpublishProject(project, function (err) {
        if (err) {
          log.error('Error in filesystem during status update: ' + err);
          return callback(500, null);
        }
        callback(200, null);
      });
    });
  });
}

function deleteProject(request, response, callback) {
  var projectId = request.params.projectId;
  Project.findOne({ 'projectId': {$in: [projectId]}}, function(err, project) {
    if (err) {
      log.error('Error in project find: ' + err);
      return callback(500, null);
    }

    if (!project) {
      log.error('Project not found ' + projectId);
      return callback(404, null);
    }

    var commentsProjection = {
      __v: false
    };

    Comment.find({ 'projectId': {$in: [projectId]}}, commentsProjection, {sort: { threadDate: -1 }}, function(err, comments) {
      if (err) {
        log.error('Error getting comments for backup: ' + err);
        return callback(500, null);
      }

      utils.createProjectBackup(project, comments, function(err) {
        if (err) {
          log.error('Error creating backup: ' + err);
          return callback(500, null);
        }

        Project.remove({ projectId: {$in: [projectId]}}, function (err) {
          if (err) {
            log.error('Error deleting project ' + projectId + ': ' + err);
            return callback(500, null);
          }

          // delete files
          utils.deleteProject(projectId, function(err) {
            if (err) log.error("CRITICAL - Error deleting files: " + err);

            // delete comments
            Comment.remove({ projectId: {$in: [projectId]}}, function (err) {
              if (err) {
                log.error('Error deleting comments for project ' + projectId + ': ' + err);
                return callback(500, null);
              }

              callback(200, null);
            });
          });
        });
      });
    });
  });
}

function getComments(request, callback) {
  var projectId = request.params.projectId;
  var page = request.params.page;

console.log(page);
console.log(typeof(page))

  var commentsProjection = {
    __v: false,
    'comments.user.user_id': false
  };

  Comment.find({ 'projectId': {$in: [projectId]} }, commentsProjection,
   {sort: { threadDate: -1 }, skip: page * conf.pageComments, limit: conf.pageComments}, function(err, comments) {
    if (err) {
      log.error('Error in comments get: ' + err);      
      return callback(500, null);
    }

    Comment.count({ 'projectId': {$in: [projectId]} }, function(err, total) {
      if (err) {
        log.error('Error in comments get: ' + err);      
        return callback(500, null);
      }

      var result = {
        comments: comments,
        pages: Math.ceil(total / conf.pageComments)
      }

      callback(200, result);
    });
  });
}

function publishComment(request, response, callback) {
  var projectId = request.body.projectId;
  var threadId = request.body.threadId;

  var comment = {
    date: Date.now(),
    text: request.body.text,
    user: {
      id: require('mongodb').ObjectID(conf.userId),
      name: conf.userName
    }
  }

  Project.findOne({ 'projectId': {$in: [projectId]} }, function(err, project) {
    if (err) {
      log.error('Error in project find for comment: ' + err);
      return callback(500);
    } else if (!project) {
      log.error('Project for comment not found ' + projectId);
      return callback(404);
    }

    if (!threadId) {
      return _createThread(projectId, comment, callback);
    }

    _addComment(threadId, comment, callback);
  });
}

function deleteCommentThread(request, response, callback) {
  var projectId = request.params.projectId;
  var threadId = request.params.threadId;

  Comment.remove({$and: [{projectId: projectId}, {_id: threadId}]}, function(err) {
    if (err) {
      log.error('Error deleting comment thread: ' + err);
      return callback(500, null);
    }

    callback(200, null);
  });
}

function deleteCommentChild(request, response, callback) {
  var projectId = request.params.projectId;
  var threadId = request.params.threadId;
  var msgId = request.params.msgId;

  Comment.update({$and: [{projectId: projectId}, {_id: threadId}]}, {$pull: {comments: {_id: msgId}}}, function(err) {

    if (err) {
      log.error('Error deleting comment child: ' + err);
      return callback(500, null);
    }

    callback(200, null);
  });
}

function _createThread(projectId, threadComment, callback) {
  var thread = {
    projectId: projectId,
    threadDate: threadComment.date,
    comments: [threadComment]
  };

  Comment.create(thread, function(err, comment) {
    if (err) {
      log.error('Create thread: ' + err);
      return callback(500);
    }

    comment = comment.toObject();
    delete comment.comments[0]._id;
    delete comment.comments[0].user.user_id;
    delete comment.__v;
    comment.threadId = comment._id;
    delete comment._id;

    callback(200, comment);
  });
}

function _addComment(threadId, comment, callback) {
  Comment.findByIdAndUpdate(threadId, {$push: {comments: comment}}, {safe: true, upsert: false, new : true}, function(err, response) {
    if (err) {
      log.error('Error in add comment: ' + err);
      return callback(500);
    } else if (!response) {
      log.error('Comment thread not found ' + comment.threadId);
      return callback(404);
    }

    response = response.toObject().comments.pop();
    delete response.user.user_id;

    callback(200, response);
  });
}

module.exports.login = login;
module.exports.users = users;
module.exports.deleteUser = deleteUser;
module.exports.projects = projects;
module.exports.getProject = getProject;
module.exports.newProject = newProject;
module.exports.updateProject = updateProject;
module.exports.updateProjectStatus = updateProjectStatus;
module.exports.deleteProject = deleteProject;
module.exports.getComments = getComments;
module.exports.publishComment = publishComment;
module.exports.deleteCommentThread = deleteCommentThread;
module.exports.deleteCommentChild = deleteCommentChild;
