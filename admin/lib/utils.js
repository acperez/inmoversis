var fs = require('fs-extra'),
  path = require('path'),
  conf = require('inmoversis_common/config'),
  uuid = require('node-uuid'),
  hogan = require('hogan-express'),
  archiver = require('archiver'),
  gm = require('gm').subClass({imageMagick: true}),
  projectUpdater = require('./project_updater');

function delUploadFiles(files, callback) {
  for (file in files) {
    fs.remove(files[file].file.path, function (err) {
      if (err) callback(err);
    });
  };
}

function createProjectImages(projectPath, project, files, callback) {
  var samePreview = project.image == project.preview;

  var source = conf.defaultPreviewPath;
  var target = conf.defaultPreviewTarget;
  if (project.image) {
    source = files[project.image].file.path;
    target = files[project.image].file.originalname;
  }

  project.image = path.join(conf.imagesFolder, target);
  gm(source).resize(conf.imageWidth, conf.imageHeight, '!').write(path.join(projectPath, conf.imagesFolder, target), function(err) {
    if (err) return callback(err);

    var source = conf.defaultPreviewPath;
    var target = conf.defaultPreviewTarget;
    if (project.preview) {
      source = files[project.preview].file.path; 
      target = files[project.preview].file.originalname;
    }

    if (samePreview) {
      target = 'thumb_' + target;
    }

    project.preview = path.join(conf.imagesFolder, target);
    gm(source).resize(conf.previewWidth, conf.previewHeight, '!').write(path.join(projectPath, conf.imagesFolder, target), callback);
  });
}

function createPhotos(projectPath, project, files, callback) {
  var _createPhotos = function (index) {
    index++;

    if (index >= project.house.photos.length) {
      callback(null);
      return;
    }

    var photo = project.house.photos[index].file;

    source = files[photo].file.path;
    target = files[photo].file.originalname;

    project.house.photos[index].file = path.join(conf.photosFolder, target);
    gm(source).resize(conf.photoWidth, conf.photoHeight).write(path.join(projectPath, conf.photosFolder, target), function (err) {
      if (err) return callback(err);
      _createPhotos(index);
    });
  }

  _createPhotos(-1);
}

function fileSizeSI(a,b,c,d,e) {
  return ((b=Math, c=b.log, d=1e3, e=c(a) / c(d) | 0, a / b.pow(d,e)).toFixed(2)
  + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes')).replace('.', ',')
}

function createDocuments(projectPath, project, files, callback) {
  var _createDocuments = function (index) {
    index++;

    if (index >= project.documents.length) {
      callback(null);
      return;
    }

    var doc = project.documents[index].filename;

    source = files[doc].file.path;
    target = files[doc].file.originalname;

    project.documents[index].filename = path.join(conf.docsFolder, target);
    project.documents[index].filesize = fileSizeSI(project.documents[index].filesize);
    fs.copy(source, path.join(projectPath, conf.docsFolder, target), function (err) {
      if (err) return callback(err);
      _createDocuments(index);
    });
  }

  _createDocuments(-1);
}

function createFolders(projectPath, callback) {
  fs.mkdirs(projectPath, function (err) {
    if (err) return callback(err);
    fs.mkdirs(path.join(projectPath, conf.imagesFolder), function (err) {
      if (err) return callback(err);
      fs.mkdirs(path.join(projectPath, conf.photosFolder), function (err) {
        if (err) return callback(err);
        fs.mkdirs(path.join(projectPath, conf.docsFolder), function (err) {
          if (err) return callback(err);
          callback(null);
        });
      });
    });
  });
}

function _createProject(projectPath, project, files, response, callback) {
  var reportError = function (err) {
    fs.remove(projectPath, function(error) {
      if (error) err += ' -- Rollback failed';
      return callback(err);
    });
  }

  createFolders(projectPath, function (err) {
    if (err) return reportError('create folders - ' + err);

    createProjectImages(projectPath, project, files, function (err) {
      if (err) return reportError('create preview - ' + err);
      createPhotos(projectPath, project, files, function (err) {
        if (err) return reportError('create photos - ' + err);

        createDocuments(projectPath, project, files, function (err) {
          if (err) return reportError('create documents - ' + err);

          createProjectHTML(projectPath, project, response, function (err) {
            if (err) return reportError('create project templates - ' + err);

            callback(null);
          });
        });
      });
    });
  });
}

function createProjectHTML(projectPath, project, response, callback) {
  renderProjectTemplate(project, 'project', response, function(err, html) {
    if (err) return callback('Generate project template for admin - ' + err, null);
    fs.outputFile(path.join(projectPath, 'index.hjs'), html, function(err) {
      if (err) return callback('Copy index.hjs: ' + err, null);

      project.public = true;
      renderProjectTemplate(project, 'project', response, function(err, html) {
        if (err) return callback('Generate project template for site - ' + err, null);

        fs.outputFile(path.join(projectPath, 'public_index.hjs'), html, function(err) {
          if (err) return callback('Copy public_index.hjs: ' + err, null);

          renderProjectTemplate(project, 'preview', response, function(err, html) {
            if (err) return callback('Generate preview html - ' + err, null);
            fs.outputFile(path.join(projectPath, 'preview.hjs'), html, callback);
          });
        });
      });
    });
  });
}

function renderProjectTemplate(project, template, response, callback) {
  project.progress = project.balance / project.finances.purchase.total_price * 100;
  if (project.progress > 100) project.progress = 100;

  for (var i = 0; i < project.documents.length; i++) {
    project.documents[i].position = i%2 ? 'right' : 'left';
  }

  project.lambdas = {
    formatMoney: function(cost) {
      return intl.format(Number(cost).toFixed(2));
    },
    formatPercent: function(value) {
      return Number(value).toFixed(2);
    }
  }

  response.render(template, project, callback);
}

function initProject(project) {
  project.projectId = uuid.v4();
  project.version = uuid.v4();
  project.balance = 0;
  project.progress = 0;
}

function createProject(project, files, response, callback) {
  initProject(project);
  var projectPath = path.join(conf.adminProjectsPath, project.projectId, project.version);
  _createProject(projectPath, project, files, response, callback);
}

function updateProject(project, files, response, callback) {
  var projectPath = path.join(conf.adminProjectsPath, project.projectId, project.version);
  _createProject(projectPath, project, files, response, function(err) {
    if (err) return callback(err);

    if(project.status == 'hidden' || project.status == 'finished') return callback();

    publishProject(project, callback);
  });
}

function updateRollback(project, callback) {
  var adminProjectPath = path.join(conf.adminProjectsPath, project.projectId, project.version);
  var siteProjectPath = path.join(conf.siteProjectsPath, project.projectId, project.version);
  var publicProjectPath = path.join(conf.publicStaticPath, project.projectId, project.version);

  fs.remove(adminProjectPath, function(err) {
    if (err) return callback(err);
    fs.remove(siteProjectPath, function(err) {
      if (err) return callback(err);
      fs.remove(publicProjectPath, callback);
    });
  });
}

function publishProject(project, callback) {
  var adminProjectPath = path.join(conf.adminProjectsPath, project.projectId, project.version);
  var siteProjectPath = path.join(conf.siteProjectsPath, project.projectId, project.version);
  var publicProjectPath = path.join(conf.publicStaticPath, project.projectId, project.version);

  var reportError = function(err) {
    fs.remove(siteProjectPath, function(error) {
      if (error) err += ' -- Rollback failed';
      fs.remove(publicProjectPath, function (error) {
        if (error) err += ' -- Rollback failed';
        return callback(err);
      });
    });
  }

  fs.copy(path.join(adminProjectPath, 'public_index.hjs'), path.join(siteProjectPath, 'index.hjs'), function(err) {
    if (err) return reportError(err);

    fs.copy(path.join(adminProjectPath, 'preview.hjs'), path.join(siteProjectPath, 'preview.hjs'), function(err) {
      if (err) return reportError(err);

      fs.copy(path.join(adminProjectPath, 'documents'), path.join(siteProjectPath, 'documents'), {}, function (err) {
        if (err) return reportError(err);

        fs.copy(path.join(adminProjectPath, 'images'), path.join(publicProjectPath, 'images'), {}, function (err) {
          if (err) return reportError(err);

          fs.copy(path.join(adminProjectPath, 'photos'), path.join(publicProjectPath, 'photos'), {}, function (err) {
            if (err) return reportError(err);
            callback();
          });
        });
      });
    });
  });
}

function unpublishProject(project, callback) {
  var siteProjectPath = path.join(conf.siteProjectsPath, project.projectId);
  var publicProjectPath = path.join(conf.publicStaticPath, project.projectId);

  fs.remove(siteProjectPath, function(err) {
    if (err) return callback(err);
    fs.remove(publicProjectPath, callback);
  });
}

function deleteProject(projectId, callback) {
  var adminProjectPath = path.join(conf.adminProjectsPath, projectId);
  var siteProjectPath = path.join(conf.siteProjectsPath, projectId);
  var publicProjectPath = path.join(conf.publicStaticPath, projectId);

  fs.remove(siteProjectPath, function(err) {
    if (err) return callback(err);

    fs.remove(publicProjectPath, function(err) {
      if (err) return callback(err);

      fs.remove(adminProjectPath, callback);
    });
  });
}

function createProjectBackup(project, commments, callback) {
  var projectPath = path.join(conf.adminProjectsPath, project.projectId);
  var zipRoot = project.name + '_' + project.subname + '_' + project.projectId;
  var zipPath = path.join(conf.adminProjectsBackupsPath, zipRoot + '.zip');

  fs.ensureDir(conf.adminProjectsBackupsPath, function (err) {
    if (err) return callback(err)

    var output = fs.createWriteStream(zipPath);
    var archive = archiver('zip');

    archive.on('error', function(err) {
      callback(err.message);
    });

    archive.on('end', function() {
      callback();
    });

    archive.pipe(output);

    archive.append(JSON.stringify(project), { name: path.join(zipRoot, 'project.json') });
    archive.append(JSON.stringify(commments), { name: path.join(zipRoot, 'comments.json') });

    archive.bulk([
      { expand: true, cwd: projectPath, src: ["**/*"], dest: path.join(zipRoot, 'files/') }
    ]);

    archive.finalize();
  });
}

function createUserBackup(user, callback) {
  var filePath = path.join(conf.adminUsersBackupsPath, user._id.toString() + '.json');

  fs.ensureDir(conf.adminUsersBackupsPath, function (err) {
    if (err) return callback(err);

    fs.writeJson(filePath, user, callback);
  });
}

var intl = new require('intl').NumberFormat('es-ES', { minimumFractionDigits: 2 });

module.exports.delUploadFiles = delUploadFiles;
module.exports.createProject = createProject;
module.exports.updateProject = updateProject;
module.exports.updateRollback = updateRollback;
module.exports.publishProject = publishProject;
module.exports.unpublishProject = unpublishProject;
module.exports.deleteProject = deleteProject;
module.exports.createProjectBackup = createProjectBackup;
module.exports.createUserBackup = createUserBackup;
