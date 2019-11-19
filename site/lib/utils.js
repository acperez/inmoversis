var fs = require('fs-extra'),
  path = require('path'),
  conf = require('inmoversis_common/config');
  log = require('inmoversis_common/logger').getLogger('site');


var publicFolder = path.join(conf.resources_path, 'private', 'site');
var publicProjectsFolder = path.join(publicFolder, 'projects');

function getPreviews(projects, response, callback) {
  var previews = [];
  var index = -1;

  var read = function() {
    index = index + 1;
    if (index >= projects.length) {
      return callback(null, previews);
    }

    var project = projects[index];
    var target = path.join('projects', project.projectId, project.version, 'preview');
    project.progress = project.progress.toFixed(2);
    switch (project.status) {
      case 'published':
        project.published = true;
        break;
      case 'open':
        var daysElapsed = Math.floor((Date.now() - project.campaign_start.getTime()) / 1000 / 60 / 60 / 24);
        project.remaining = project.campaign_duration - daysElapsed;
        break;
      case 'closed':
        project.closed = true;
        break;
    }

    response.render(target, project, function(err, data) {
      if (err) {
        log.error('getPreviews error: ' + err);
        return callback(err, []);
      }
      previews.push({ html: data });
      read();
    });
  }

  read();
}

function getProjectHtml(username, project, response, callback) {
  var file = path.join('projects', project.projectId, project.version, 'index');

  project.partials = { menu: 'templates/menu' };
  project.user = username;

  var daysElapsed = Math.floor((Date.now() - project.campaign_start.getTime()) / 1000 / 60 / 60 / 24);
  project.remaining = project.campaign_duration - daysElapsed;

  response.render(file, project, callback);
}

function delUploadFiles(files, callback) {
  for (var name in files) {
    fs.remove(files[name][0].path, function (err) {
      if (err) callback(err);
    });
  }
}

function encodeUploads(rawFiles, callback) {
  var files = [];
  for (var i in rawFiles) {
    files.push({
      type: i,
      name: rawFiles[i][0].originalname,
      path: rawFiles[i][0].path
    })
  }

  var encodedFiles = [];
  _encodeDocs(files, encodedFiles, callback);
}

function _encodeDocs(files, encodedFiles, callback) {
  var file = files.shift();

  if (!file) {
    return callback(null, encodedFiles);
  }

  fs.readFile(file.path, function(err, data) {
    if (err) {
      return callback(err, null);
    }

    encodedFiles.push({
      type: file.type,
      name: file.name,
      data: data.toString('base64')
    });

    _encodeDocs(files, encodedFiles, callback);
  });
}

module.exports.getPreviews = getPreviews;
module.exports.getProjectHtml = getProjectHtml;
module.exports.delUploadFiles = delUploadFiles;
module.exports.encodeUploads = encodeUploads;
