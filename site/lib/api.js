var LocalStrategy   = require('passport-local').Strategy,
  bCrypt = require('bcrypt-nodejs'),
  User = require('inmoversis_common/models/user'),
  Project = require('inmoversis_common/models/project'),
  Comment = require('inmoversis_common/models/comment'),
  uuid = require('node-uuid'),
  log = require('inmoversis_common/logger').getLogger('site'),
  utils = require('./utils'),
  passport_helper = require('./passport_helper'),
  conf = require('inmoversis_common/config'),
  payment = require('./payment_client');

function register(passport, request, response, callback) {
  passport.authenticate('register', function(error, user, info) {
    if (!error && user) return _login(request, user, callback);
    callback(error, {id: request.body.email});
  })(request, response);
}

function login(passport, request, response, callback) {
  passport.authenticate('login', function(error, user, info) {
    if (!error && user) return _login(request, user, callback);
    callback(error, {id: request.body.email});
  })(request, response);
}

function _login(request, user, callback) {
  request.login(user, function(err) {
    if (err) {
      callback(500, {id: request.body.email});
      return;
    }

    callback(200, {id: request.body.email});
  });
}

function getUserData(request, response, callback) {
  var data = request.user.toJSON();
  delete data._id;
  delete data.ip;
  delete data.__v;
  delete data.password;
  delete data.lastSeen;
  delete data.creationDate;
  if (data.phone) {
    data.phoneNumber = data.phone.number;
    data.phoneLocation = data.phone.country;
    delete data.phone;
  }
  if (data.company && data.company[0]) {
    var tmp = data.company[0];
    delete tmp._id;
    data.company = tmp;
  }
  delete data.projects;
  delete data.wallet;

  callback(200, data);
}

function saveUserData(request, response, callback) {
  request.body.userStatus = 'identified';
  updateUserData(request, response, callback);
}

function updateUserData(request, response, callback) {
  var fields = {
    '_id': false,
    '__v': false,
    'ip': false,
    'password': false,
    'lastSeen': false,
    'creationDate': false,
    'phone._id': false,
    'phone.e164': false,
    'company._id': false,
    'projects': false,
    'wallet': false
  }

  var options = {
    new: true,
    runValidators: true,
    select: fields
  }

  User.findOneAndUpdate({_id: {$in: [request.user._id]}}, {$set: request.body}, options, function(err, doc) {
    if (err) {
      log.error('Update user data error: ' + err);
      return callback(500);
    }

    doc = doc.toJSON();
    if (doc.phone) {
      doc.phoneNumber = doc.phone.number;
      doc.phoneLocation = doc.phone.country;
      delete doc.phone;
    }
    
    if (doc.company && doc.company[0]) {
      doc.company = doc.company[0];
    }

    callback(200, doc);
  });
}

function updateUserPassword(request, response, callback) {
  request.user.password = passport_helper.createHash(request.body.password);

  request.user.save(function(err) {
    if (err) {
      log.error('Update user password error: ' + err);
      return callback(500);
    }
    
    callback(200);
  });
}

function userDocs(request, response, callback) {
  var triggerError = function(msg) {
    log.error(msg);

    utils.delUploadFiles(request.files, function(err) {
      log.error('Failed to delete upload files: ' + err);
    });

    return callback(500);
  }

  utils.encodeUploads(request.files, function(error, files) {
    if (error) {
      return triggerError("Failed to encode user documents: " + error);
    }

    payment.createWallet(request.user, files, function(error, response, body) {
      if (error || response.statusCode != 200) {
        return triggerError("Payment create wallet request failed: " + error);
      }

      utils.delUploadFiles(request.files, function(err) {
        log.error('Failed to delete upload files: ' + err);
      });

      request.user.userStatus = 'validating';
      request.user.save(function(err) {
        if (err) log.error('Error updating user status: ' + err);
      });

      callback(200, {'result': 'ok'});
    });
  });
}

function getProjectsHtml(response, callback) {
  Project.find({ status: { $in: [ 'published', 'open', 'closed' ] }},
               'projectId version status balance progress campaign_start campaign_duration', function(err, projects) {
    if (err) {
      log.error('Find project error: ' + err);
      return callback(500, null);
    }

    utils.getPreviews(projects, response, callback);
  });
}

function getProjectHtml(request, response, callback) {
  var projectId = request.params.projectId;

  Project.findOne({ 'projectId': { $in: [projectId] }}, function(err, project) {
    if (err) {
      log.error('Error in project find: ' + err);
      return callback(500, null);
    }

    if (!project) {
      log.error('Project not found ' + projectId);
      return callback(404, null);
    }

    utils.getProjectHtml(request.user.name, project, response, function(err, html) {
      if (err) {
        log.error();
        return callback(500);
      }

      callback(200, html);
    });
  });
}

function getComments(request, callback) {
  var projectId = request.params.projectId;
  var page = request.params.page;

  var commentsProjection = {
    __v: false,
    'comments._id': false,
    'comments.user.id': false
  };

  Comment.find({ 'projectId': { $in: [projectId] }}, commentsProjection,
   {sort: { threadDate: -1 }, skip: page * conf.pageComments, limit: conf.pageComments}, function(err, comments) {

    if (err) {
      log.error('Error in comments get: ' + err);      
      return callback(500, null);
    }

    Comment.count({ 'projectId': projectId }, function(err, total) {
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
      id: request.user._id,
      name: request.user.name
    }
  }

  Project.findOne({ 'projectId': { $in: [projectId] }}, function(err, project) {
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

function _createThread(projectId, threadComment, callback) {
  var thread = {
    projectId: projectId,
    threadDate: threadComment.date,
    comments: [threadComment]
  };

  Comment.create(thread, function(err, comment) {
    if (err) {
      log.error('Create message thread: ' + err);
      return callback(500);
    }

    comment = comment.toObject();
    delete comment.comments[0]._id;
    delete comment.comments[0].user.id;
    delete comment.__v;
    comment.threadId = comment._id;
    delete comment._id;

    callback(200, comment);
  });
}

function _addComment(threadId, comment, callback) {
  //Comment.findByIdAndUpdate(threadId, {$push: {comments: comment}}, {safe: true, upsert: false, new : true}, function(err, response) {
  Comment.findByIdAndUpdate({ $in: [threadId] }, {$push: {comments: comment}}, {safe: true, upsert: false, new : true}, function(err, response) {
    if (err) {
      log.error('Error in add comment: ' + err);
      return callback(500);
    } else if (!response) {
      log.error('Comment thread not found ' + comment.threadId);
      return callback(404);
    }

    response = response.toObject().comments.pop();
    delete response._id;
    delete response.user.id;

    callback(200, response);
  });
}

module.exports.register = register;
module.exports.login = login;
module.exports.getUserData = getUserData;
module.exports.saveUserData = saveUserData;
module.exports.userDocs = userDocs;
module.exports.updateUserPassword = updateUserPassword;
module.exports.updateUserData = updateUserData;
module.exports.getProjectsHtml = getProjectsHtml;
module.exports.getProjectHtml = getProjectHtml;
module.exports.getComments = getComments;
module.exports.publishComment = publishComment;
