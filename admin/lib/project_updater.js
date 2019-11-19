var fs = require('fs-extra'),
  path = require('path'),
  conf = require('inmoversis_common/config');

var publicFolder = path.join(conf.resources_path, 'private', 'admin');
var projectsFolder = path.join(publicFolder, 'projects');
var defaultPreviewPath = path.join(publicFolder, 'static', 'images', 'default_preview.jpg');
var defaultPreviewTarget = 'default_preview.jpg';
var publicProjectFolder = path.join(conf.resources_path, 'public', 'static');
var publicTemplatesFolder = path.join(conf.resources_path, 'private', 'site', 'projects');

var isPublic = false;

var tmpRootPath = null;
var backupPath = null;
var newPath = null;
var adminPath = null;
var sitePath = null;
var publicPath = null;
var adminBackupPath = null;
var siteBackupPath = null;
var publicBackupPath = null;
var adminDocumentsPath = null;
var siteDocumentsPath = null;
var siteDocumentsBackupPath = null;
var adminPhotosPath = null;
var adminImagesPath = null;
var publicPhotosPath = null;
var publicPhotosBackupPath = null;
var publicImagesPath = null;
var publicImagesBackupPath = null;

function _init(project) {
  isPublic = project.status != 'hidden' && project.status != 'finished';

  tmpRootPath = path.join(projectsFolder, 'tmp_' + project.projectId);
  backupPath = path.join(tmpRootPath, 'backup');

  adminPath = path.join(projectsFolder, project.projectId);
  sitePath = path.join(publicTemplatesFolder, project.projectId);
  publicPath = path.join(publicProjectFolder, project.projectId);

  adminBackupPath = path.join(backupPath, 'admin');
  siteBackupPath = path.join(backupPath, 'site');
  publicBackupPath = path.join(backupPath, 'public');

  adminDocumentsPath = path.join(adminPath, 'documents');
  siteDocumentsPath = path.join(sitePath, 'documents');
  siteDocumentsBackupPath = path.join(siteBackupPath, 'documents');

  adminPhotosPath = path.join(adminPath, 'photos');
  adminImagesPath = path.join(adminPath, 'images');
  publicPhotosPath = path.join(publicPath, 'photos');
  publicPhotosBackupPath = path.join(publicBackupPath, 'photos');
  publicImagesPath = path.join(publicPath, 'images');
  publicImagesBackupPath = path.join(publicBackupPath, 'images');
}

function _finish() {
  isPublic = false;

  tmpRootPath = null;
  backupPath = null;
  newPath = null;
  adminPath = null;
  sitePath = null;
  publicPath = null;
  adminBackupPath = null;
  siteBackupPath = null;
  publicBackupPath = null;
  adminDocumentsPath = null;
  siteDocumentsPath = null;
  siteDocumentsBackupPath = null;
  adminPhotosPath = null;
  adminImagesPath = null;
  publicPhotosPath = null;
  publicPhotosBackupPath = null;
  publicImagesPath = null;
  publicImagesBackupPath = null;
}

function _createBackup(source, target, callback) {
  fs.copy(source, target, {}, function(err) {
    if (err) return callback('Failed to create backup - ' + err);
    callback();
  });
}

function restoreAdmin(callback, err) {
  fs.remove(adminPath, function(error) {
    if (error) return callback(err + '\nrestoreAdmin delete - ' + error, true);
    fs.copy(adminBackupPath, adminPath, {}, function(error) {
      if (error) return callback(err + '\nrestoreAdmin copy - ' + error, true);

      done(callback, err);
    });
  });
}

function restoreSiteDocuments(callback,  err) {
  _syncFolders(siteDocumentsBackupPath, siteDocumentsPath, function(error, oldDocuments) {
    if (error) return callback(err + '\nrestoreSiteDocuments sync - ' + error, true);

    restoreAdmin(callback, err);
  });
}

function restorePublicResources(callback, err) {
  _syncFolders(publicPhotosBackupPath, publicPhotosPath, function(error, oldPhotos) {
    if (error) return callback(err + '\nrestorePublicResources sync photos - ' + error, true);

    _syncFolders(publicImagesBackupPath, publicImagesPath, function(error, oldImages) {
      if (error) return callback(err + '\nrestorePublicResources sync images - ' + error, true);

      _delFiles(oldPhotos.concat(oldImages), function(error, pendingFiles) {
        if (error) {
          var msg = err + '\nrestorePublicResources del sync - ' + error + '\nPending files to delete: ' + JSON.stringify(pendingFiles);
          return callback(msg, true);
        }

        restoreSiteDocuments(callback, err);
      });
    });
  });
}

function restoreSiteTemplates(callback, err) {
  _mv(path.join(adminBackupPath, 'public_index.hjs'), path.join(sitePath, 'index.hjs'), function(error) {
    if (error) return callback(err + 'restoreSiteTemplates mv index - ' + error, true);

    _mv(path.join(adminBackupPath, 'preview.hjs'), path.join(sitePath, 'preview.hjs'), function(error) {
      if (error) return callback(err + 'restoreSiteTemplates mv preview - ' + error, true);

      restorePublicResources(callback, err);
    });
  });
}

function done(callback, err) {
  var msg = err ? err : '';

  fs.remove(tmpRootPath, function(error) {
    if (error) {
      msg += '\nFailed to clear temporal folder, remove it manually - ' + error;
      return callback(msg, true);
    }

    if (err) return callback(msg);

    callback();
  });
}

function update(project, tmpProjectPath, callback) {
  newPath = tmpProjectPath;
  _init(project);

  createBackups(function(err) {
    if (err) return done(callback, 'createBackups failed - ' + err);

    updateAdmin(function(err) {
      if (err) return restoreAdmin(callback, 'updateAdmin failed - ' + err);

      if (!isPublic) return done(callback);

      updatePublicProject(callback);
    });
  });
}

function createBackups(callback) {
  _createBackup(adminPath, adminBackupPath, function(err) {
    if (err) return callback('admin - ' + err);

    if (!isPublic) return callback();

    _createBackup(sitePath, siteBackupPath, function(err) {
      if (err) return callback('site - ' + err);

      _createBackup(publicPath, publicBackupPath, function(err) {
        if (err) return callback('public - ' + err);
        callback();
      });
    });
  });
}

function updateAdmin( callback) {
  // Copy new to current admin
  fs.remove(adminPath, function(err) {
    if (err) return callback('delete - ' + err);

    fs.copy(newPath, adminPath, {}, function(err) {
      if (err) return callback('copy - ' + err);

      callback();
    });
  });
}

function updatePublicProject(callback) {
  // Update site documents
  _syncFolders(adminDocumentsPath, siteDocumentsPath, function(err, oldDocuments) {
    if (err) return restoreSiteDocuments(callback, 'update site documents failed - ' + err);

    updatePublicResources(function(err, oldResources) {
      if (err) return restorePublicResources(callback, 'update public resources failed - ' + err);

      updateSiteTemplates(function(err) {
        if (err) return restoreSiteTemplates(callback, 'update site templates failed ' + err);

        _delFiles(oldDocuments.concat(oldResources), function(err, pendingFiles) {
          if (err) return callback('Failed to clear temporal files - ' + err + '\nPending files to delete: ' + JSON.stringify(pendingFiles), true);

          done(callback);
        });
      });
    });
  });
}

function updatePublicResources(callback) {
  // Sync images and photos
  _syncFolders(adminPhotosPath, publicPhotosPath, function(err, oldPhotos) {
    if (err) return callback(err);

    _syncFolders(adminImagesPath, publicImagesPath, function(err, oldImages) {
      if (err) return callback(err);

      callback(null, oldPhotos.concat(oldImages));
    });
  });
}

function updateSiteTemplates(callback) {
  _mv(path.join(adminPath, 'public_index.hjs'), path.join(sitePath, 'index.hjs'), function(err) {
    if (err) return callback(err);

    _mv(path.join(adminPath, 'preview.hjs'), path.join(sitePath, 'preview.hjs'), function(err) {
      if (err) return callback(err);

      callback();
    });
  });
}

function _syncFolders(source, target, callback) {
  var filesToCopy = [];
  var filesToReplace = [];

  fs.readdir(source, function(err, sourceFiles) {
    if (err) return callback('Failed to ls source - ' + err);

    fs.readdir(target, function(err, targetFiles) {
      if (err) return callback('Failed to ls target - ' + err);

      // Determine sync tasks
      for (var i = 0; i < sourceFiles.length; i++) {
        var file = sourceFiles[i];
        var index = targetFiles.indexOf(file);
        if (index < 0) {
          filesToCopy.push([path.join(source, file), path.join(target, file)]);
          continue;
        }

        filesToReplace.push([path.join(source, file), path.join(target, file)]);
        targetFiles.splice(index, 1);
      }

      // Copy new files
      _copyFiles(filesToCopy, function(err) {
        if (err) return callback('Failed to copy files - ' + err);

        // Merge files
        _mergeFiles(filesToReplace, function(err) {
          if (err) return callback(err);

          // Check files to delete
          var filesToDelete = [];
          for (var i = 0; i < targetFiles.length; i++) {
            filesToDelete.push(path.join(target, targetFiles[i]));
          }

          callback(null, filesToDelete);
        });
      });
    });
  });
}

function _copyFiles(files, callback) {
  var params = files.shift();
  if (!params) {
    return callback();
  }

  fs.copy(params[0], params[1], function(err) {
    if (err) return callback(err);

    _copyFiles(files, callback);
  });
}

function _mergeFiles(files, callback) {
  var params = files.shift();
  if (!params) {
    return callback();
  }

  fs.stat(params[0], function(err, statsSource) {
    if (err) return callback('Failed to get source stats - ' + err);

    fs.stat(params[1], function(err, statsTarget) {
      if (err) return callback('Failed to get target stats - ' + err);

      if (statsSource.size != statsTarget.size) {
        _mv(params[0], params[1], function(err) {
          if (err) return callback('Failed to merge files' + err);
          _mergeFiles(files, callback);
        });
        return;
      }

      _mergeFiles(files, callback);
    });
  });
}

function _mv(oldPath, newPath, callback) {
  var tmpPath = newPath + '.tmp';
  fs.copy(oldPath, tmpPath, function(err) {
    if (err) return callback(err);

    fs.rename(tmpPath, newPath, function(err) {
      if (err) return callback(err);

      callback();
    });
  });
}

function _delFiles(files, callback) {
  var file = files.shift();
  if (!file) {
    return callback();
  }

  fs.remove(file, function(err) {
    if (err) return callback(err, files);

    _delFiles(files, callback);
  });
}

module.exports.update = update;
