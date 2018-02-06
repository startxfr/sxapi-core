/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * google drive resource handler
 * @module resource/google_drive_drive
 * @constructor
 * @param {string} id the resource ID
 * @param {object} config the resource config
 * @param {object} google the google resource with auth
 * @type resource
 */
exports = function (id, config, google) {
  var $gapid = {
    id: id + ':drive',
    google: google,
    service: null,
    config: {},
    /**
     * Initiate the Google Drive resource and check resource config
     * @param {object} config the resource config object
     * @returns {$gapid}
     */
    init: function (config) {
      var timerId = 'resource_google_drive_init_' + $gapid.id;
      $timer.start(timerId);
      $log.tools.resourceDebug($gapid.id, "initializing", 3);
      $timer.start(timerId);
      if (config) {
        $gapid.config = config;
      }
      $log.tools.resourceDebug($gapid.id, "initialized ", 1, $timer.timeStop(timerId));
      return this;
    },
    /**
     * Start the Google Drive resource as defined in the config
     * @param {function} callback to call when startup is done
     * @returns {$gapid}
     */
    start: function (callback) {
      var timerId = 'resource_google_drive_start_' + $gapid.id;
      $log.tools.resourceDebug($gapid.id, "starting", 3);
      $gapid.service = $gapid.google.gapi.drive({
        version: 'v3',
        auth: $gapid.google.gapi_auth
      });
      $log.tools.resourceDebug($gapid.id, "started ", 1, $timer.timeStop(timerId));
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    /**
     * Stop the Google Drive resource
     * @param {function} callback to call when stopped
     * @returns {$gapid}
     */
    stop: function (callback) {
      $log.tools.resourceDebug($gapid.id, "Stopping", 2);
      $gapid.service = null;
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    /**
     * Empty the trash bin directory
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    emptyTrash: function (options, callback) {
      var timerId = 'resource_google_drive_emptyTrash_' + $gapid.id;
      $log.tools.resourceInfo($gapid.id, "empty trash bin directory");
      $timer.start(timerId);
      var config = require('merge').recursive({}, options || {});
      $gapid.service.files.emptyTrash(config, function (err, doc) {
        var duration = $timer.time(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not execute empty trash in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback(new Error('could not execute search ' + q));
        }
        else {
          $log.tools.resourceDebug($gapid.id, "empty trash done in resource " + $gapid.id, 4, duration, true);
          callback(null, doc);
        }
      });
      return this;
    },
    /**
     * Get file metadata
     * @param {string} q the search query 
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    findFile: function (q, options, callback) {
      var timerId = 'resource_google_drive_findFile_' + $gapid.id + '_' + q;
      $log.tools.resourceInfo($gapid.id, "find file '" + q + "' metadata");
      $timer.start(timerId);
      var config = options || {};
      var config = require('merge').recursive({}, {
        q: q,
        fields: 'nextPageToken, files(id,name,mimeType,trashed)'
      }, options || {});
      $gapid.service.files.list(config, function (err, doc) {
        var duration = $timer.time(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not execute search ' + q + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback(new Error('could not execute search ' + q));
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file found for search " + q + " found in resource " + $gapid.id, 4, duration, true);
          callback(null, doc.items);
        }
      });
      return this;
    },
    /**
     * Get file content
     * @param {string} id file ID
     * @param {object} options to use when retriving file
     * @param {object} response the response object to use when streaming back file to browser
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    getFile: function (id, options, response, callback) {
      var timerId = 'resource_google_drive_getFile_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "get file '" + id + "'");
      $timer.start(timerId);
      var config = options || {};
      config.fileId = id;
      config.fields = 'id,name,name,mimeType';
      $gapid.service.files.get(config, function (err, doc) {
        var duration = $timer.time(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not get file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not get file');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
          config.alt = "media";
          if (response) {
            var outh = {
              "Content-Type": 'application/octet-stream',
              "Content-Disposition": 'attachment; filename=' + (doc.name || doc.title)
            };
            if (doc.mimeType) {
              outh["Content-Type"] = doc.mimeType;
            }
            response.writeHead(200, outh);
          }
          var call = $gapid.service.files.get(config, function (err, content) {
            var duration = $timer.timeStop(timerId);
            if (err) {
              $log.tools.resourceWarn($gapid.id, 'could not get file content ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
              callback('could not get file content');
            }
            else {
              if (!response) {
                doc.Body = content;
              }
              $log.tools.resourceDebug($gapid.id, "file content " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
              if (!response) {
                callback(null, doc);
              }
            }
          });
          if (response) {
            $log.tools.resourceDebug($gapid.id, "Streaming file content " + config.fileId + " started in resource " + $gapid.id, 4, duration, true);
            call.pipe(response);
          }
        }
      });
      return this;
    },
    /**
     * Get file metadata
     * @param {string} id file ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    getFileMeta: function (id, options, callback) {
      var timerId = 'resource_google_drive_getFileMeta_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "get file '" + id + "' metadata");
      $timer.start(timerId);
      var config = options || {};
      config.fileId = id;
      $gapid.service.files.get(config, function (err, doc) {
        var duration = $timer.time(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not get file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not get file metadata');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
          callback(null, doc);
        }
      });
      return this;
    },
    /**
     * Copy a given file into another directory
     * @param {string} source file ID
     * @param {string} destination parent destination folder ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    copyFile: function (source, destination, options, callback) {
      var timerId = 'resource_google_drive_copyFile_' + $gapid.id + '_' + source;
      $log.tools.resourceInfo($gapid.id, "copy file '" + source + "' into '" + destination + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        resource: {
          parents: [destination]
        },
        fields: 'id,name,mimeType',
        fileId: source
      }, options || {});
      $gapid.service.files.copy(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not copy file ' + source + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not copy file ' + source);
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + response.id + " copied from " + source + " in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Move the given file from one directory to another
     * @param {string} id directory ID
     * @param {string} from the directory where is located the directory to move
     * @param {string} to the directory where directory have to be moved
     * @param {object} options to use when deleting the file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    moveFile: function (id, from, to, options, callback) {
      var timerId = 'resource_google_drive_moveFile_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "move file '" + id + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        fileId: id,
        addParents:to,
        removeParents:from,
        fields: 'id,name,mimeType'
      }, options || {});
      $gapid.service.files.update(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not move file ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not update directory');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + id + " moved in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Add a file into a given directory
     * @param {string} name folder name
     * @param {string} body file content (should be a Buffer for binary)
     * @param {string} mime the mimeTYpe of the document
     * @param {string} parent folder ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    addFile: function (name, body, mime, parent, options, callback) {
      var timerId = 'resource_google_drive_addFile_' + $gapid.id + '_' + name;
      $log.tools.resourceInfo($gapid.id, "add file '" + name + "'");
      $timer.start(timerId);
      var config = require('merge').recursive(config, {
        resource: {
          name: name,
          mimeType: 'text/plain',
          parents: [parent]
        },
        media: {
          mimeType: mime,
          body: body
        },
        fields: 'id,name,mimeType',
        uploadType: 'multipart'
      }, options || {});
      $gapid.service.files.create(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not create file ' + config.resource.name + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not create file ' + config.resource.name);
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + config.resource.name + " created in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Update a file content
     * @param {string} fileId fthe file ID
     * @param {string} body file content (should be a Buffer for binary)
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    updateFile: function (fileId, body, options, callback) {
      var timerId = 'resource_google_drive_updateFile_' + $gapid.id + '_' + fileId;
      $log.tools.resourceInfo($gapid.id, "update file '" + fileId + "'");
      $timer.start(timerId);
      var config = require('merge').recursive(config, {
        media: {
          body: body
        },
        fields: 'id,name,mimeType',
        uploadType: 'multipart',
        fileId: fileId
      }, options || {});
      $gapid.service.files.update(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not update file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not update file ' + config.fileId);
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + config.fileId + " updated in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Export a file into another output and record it
     * @param {string} fileId fthe file ID
     * @param {string} mime imetype of the exported document
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    exportFile: function (fileId, mime, options, callback) {
      var timerId = 'resource_google_drive_exportFile_' + $gapid.id + '_' + fileId;
      $log.tools.resourceInfo($gapid.id, "export file '" + fileId + "'");
      $timer.start(timerId);
      var config = require('merge').recursive(config, {
        fields: 'id,name,mimeType',
        fileId: fileId,
        mimeType: mime
      }, options || {});
      $gapid.service.files.export(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not export file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not export file ' + config.fileId);
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + config.fileId + " exported in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Export a file into another output and record it
     * @param {string} fileId fthe file ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    deleteFile: function (fileId, options, callback) {
      var timerId = 'resource_google_drive_deleteFile_' + $gapid.id + '_' + fileId;
      $log.tools.resourceInfo($gapid.id, "delete file '" + fileId + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        fileId: fileId,
        trashed: true,
        resource: {
          trashed: true
        },
        fields: 'id,name,mimeType'
      }, options || {});
      $gapid.service.files.update(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not delete file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not delete file ' + config.fileId);
        }
        else {
          $log.tools.resourceDebug($gapid.id, "file " + config.fileId + " deleted in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Get file list of a given directory
     * @param {string} id file ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    getDirectory: function (id, options, callback) {
      var timerId = 'resource_google_drive_getDirectory_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "get directory '" + id + "'");
      $timer.start(timerId);
      var config = options || {};
      var config = require('merge').recursive({}, {
        q: " '" + id + "' in parents",
        fields: 'nextPageToken, files(id, name,mimeType)'
      }, options || {});
      $gapid.service.files.list(config, function (err, list) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not get directory ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not get directory content');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "folder " + id + " found in resource " + $gapid.id, 4, duration, true);
          callback(null, list);
        }
      });
      return this;
    },
    /**
     * Copy a given directory into another directory
     * @param {string} source folder ID
     * @param {string} destination parent destination folder ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    copyDirectory: function (source, destination, options, callback) {
      var timerId = 'resource_google_drive_copyDirectory_' + $gapid.id + '_' + source;
      $log.tools.resourceInfo($gapid.id, "copy directory '" + destination + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        resource: {
          parents: [destination]
        },
        fields: 'id,name,mimeType',
        fileId: source
      }, options || {});
      $gapid.service.files.copy(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not copy directory ' + source + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not copy directory ' + source);
        }
        else {
          $log.tools.resourceDebug($gapid.id, "directory " + response.id + " copied from " + source + " in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Add a directory into a parent
     * @param {string} name folder name
     * @param {string} parent folder ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    addDirectory: function (name, parent, options, callback) {
      var timerId = 'resource_google_drive_addDirectory_' + $gapid.id + '_' + name;
      $log.tools.resourceInfo($gapid.id, "add directory '" + name + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        resource: {
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parent]
        },
        fields: 'id,name,mimeType'
      }, options || {});
      $gapid.service.files.create(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not create directory ' + name + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not create directory');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "directory " + response.id + " created in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Update the given directory
     * @param {string} id directory ID
     * @param {string} name new name
     * @param {object} options to use when deleting the file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    updateDirectory: function (id, name, options, callback) {
      var timerId = 'resource_google_drive_updateDirectory_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "update directory '" + id + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        fileId: id,
        resource: {
          name: name
        },
        fields: 'id,name,mimeType'
      }, options || {});
      $gapid.service.files.update(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not update directory ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not update directory');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "directory " + id + " updated in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Move the given directory from one directory to another
     * @param {string} id directory ID
     * @param {string} from the directory where is located the directory to move
     * @param {string} to the directory where directory have to be moved
     * @param {object} options to use when deleting the file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    moveDirectory: function (id, from, to, options, callback) {
      var timerId = 'resource_google_drive_moveDirectory_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "move directory '" + id + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        fileId: id,
        addParents:to,
        removeParents:from,
        fields: 'id,name,mimeType'
      }, options || {});
      $gapid.service.files.update(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not move directory ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not update directory');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "directory " + id + " moved in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Delete the given directory
     * @param {string} id directory ID
     * @param {object} options to use when deleting the file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    deleteDirectory: function (id, options, callback) {
      var timerId = 'resource_google_drive_deleteDirectory_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "delete directory '" + id + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        fileId: id,
        trashed: true,
        resource: {
          trashed: true
        },
        fields: 'id,name,mimeType'
      }, options || {});
      $gapid.service.files.update(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not delete directory ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not delete directory');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "directory " + id + " deleted in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Get permissions of a given file
     * @param {string} fileId file ID
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    getPermissions: function (fileId, options, callback) {
      var timerId = 'resource_google_drive_getPermissions_' + $gapid.id + '_' + fileId;
      $log.tools.resourceInfo($gapid.id, "get permission for '" + fileId + "'");
      $timer.start(timerId);
      var config = options || {};
      var config = require('merge').recursive({}, {
        fileId: fileId
      }, options || {});
      $gapid.service.permissions.list(config, function (err, list) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not get permissions ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not get permission content');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "folder " + id + " found in resource " + $gapid.id, 4, duration, true);
          callback(null, list);
        }
      });
      return this;
    },
    /**
     * Add a permission into a parent
     * @param {string} fileId the file concernad by this permission
     * @param {string} user the user this permission is granted
     * @param {string} role permission level for this user
     * @param {object} options to use when retriving file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    addPermission: function (fileId, user, role, options, callback) {
      var timerId = 'resource_google_drive_addPermission_' + $gapid.id + '_' + fileId;
      $log.tools.resourceInfo($gapid.id, "add permission to '" + fileId + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        resource: {
          role: role,
          type: 'user',
          emailAddress: user
        },
        fileId: fileId
      }, options || {});
      $gapid.service.permissions.create(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not create permission on file ' + fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not create permission');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "permission for " + user + " on " + fileId + " created in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Update the given permission
     * @param {string} fileId file ID
     * @param {string} permId permission ID
     * @param {string} role new role name
     * @param {object} options to use when deleting the file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    updatePermission: function (fileId, permId, role, options, callback) {
      var timerId = 'resource_google_drive_updatePermission_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "update permission '" + id + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        resource: {
          role: role
        },
        fileId: fileId,
        permissionId: permId
      }, options || {});
      $gapid.service.permissions.update(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not update permission ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not update permission');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "permission " + id + " updated in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Delete the given permission
     * @param {string} fileId file ID
     * @param {string} permId permission ID
     * @param {object} options to use when deleting the file
     * @param {function} callback to call for returning service
     * @returns {$gapid}
     */
    deletePermission: function (fileId, permId, options, callback) {
      var timerId = 'resource_google_drive_deletePermission_' + $gapid.id + '_' + id;
      $log.tools.resourceInfo($gapid.id, "delete permission '" + id + "'");
      $timer.start(timerId);
      var config = require('merge').recursive({}, {
        fileId: fileId,
        permissionId: permId
      }, options || {});
      $gapid.service.permissions.delete(config, function (err, response) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          $log.tools.resourceWarn($gapid.id, 'could not delete permission ' + id + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
          callback('could not delete permission');
        }
        else {
          $log.tools.resourceDebug($gapid.id, "permission " + id + " deleted in resource " + $gapid.id, 4, duration, true);
          callback(null, response);
        }
      });
      return this;
    },
    /**
     * Define a list of available endpoint for Google Drive service
     */
    endpoints: {
      /**
       * Endpoint who return a raw file stored into an Drive storage
       * @param {object} config object used to define where to get object from
       * @returns {function} the function used to handle the server response
       */
      getFile: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($gapid.id, req, "getFile()", 1);
          if ($app.resources.exist(config.resource)) {
            var rs = $app.resources.get(config.resource);
            var fileId = req.params.id || req.body.id || config.fileId || "fileId";
            rs.getService("drive").getFile(fileId, config.config || {}, res, function (err, reponse) {
              if (err) {
                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error getting " + fileId + " file in resource " + rs.id + " because " + err.message);
              }
              else {
                res.end();
                if (config.notification !== undefined) {
                  $app.notification.notif(config.notification, req);
                }
                $log.tools.endpointInfo($gapid.id, req, "returned file " + fileId + " from resource " + rs.id);
              }
            });
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
          }
        };
      },
      /**
       * Endpoint who perform a search to find file
       * @param {object} config object used to define where to get object from
       * @returns {function} the function used to handle the server response
       */
      findFile: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($gapid.id, req, "findFile()", 1);
          if ($app.resources.exist(config.resource)) {
            var rs = $app.resources.get(config.resource);
            var qr = req.params.q || req.body.q || config.q;
            var q = "fullText contains '" + qr + "'";
            rs.getService("drive").findFile(q, config.config || {}, function (err, reponse) {
              if (err) {
                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error finding files matching " + q + " in resource " + rs.id + " because " + err.message);
              }
              else {
                if (config.notification !== undefined) {
                  $app.notification.notif(config.notification, reponse);
                }
                $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "returned files matching " + q + " from resource " + rs.id, 2);
              }
            });
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
          }
        };
      },
      /**
       * Endpoint who add a new directory into another one
       * @param {object} config object used to define where to get object from
       * @returns {function} the function used to handle the server response
       */
      addFile: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($gapid.id, req, "addFile()", 1);
          if ($app.resources.exist(config.resource)) {
            var rs = $app.resources.get(config.resource);
            var name, mime;

            var inspect = require('util').inspect;
            var Busboy = require('busboy');
            var busboy = new Busboy({headers: req.headers});
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
              $log.tools.endpointDebug($gapid.id, req, " received file " + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype, 2);
              name = filename;
              mime = mimetype;
              file.on('data', function (data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
              });
              file.on('end', function () {
                console.log('File [' + fieldname + '] Finished');
              });
            });
            busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
              console.log('Field [' + fieldname + ']: value: ' + inspect(val));
            });
            busboy.on('finish', function () {
              console.log('Done parsing form!');
              var fileName = req.params.name || name;
              var parentId = req.params.parent || req.body.parent || config.parent || "root";
              rs.getService("drive").addFile(fileName, parentId, mime, new Buffer(busboy), config.config || {}, function (err, reponse) {
                if (err) {
                  $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error adding " + fileName + " folder in resource " + rs.id + " because " + err.message);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, reponse);
                  }
                  $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "folder " + fileName + " created in resource ", 2);
                }
              });
            });
            req.pipe(busboy);
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
          }
        };
      },
      /**
       * Endpoint who get the content of a directory
       * @param {object} config object used to define where to get object from
       * @returns {function} the function used to handle the server response
       */
      listDirectory: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($gapid.id, req, "listDirectory()", 1);
          if ($app.resources.exist(config.resource)) {
            var rs = $app.resources.get(config.resource);
            var folderId = req.params.id || req.body.id || config.folderId || "root";
            rs.getService("drive").getDirectory(folderId, config.config || {}, function (err, reponse) {
              if (err) {
                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error getting " + folderId + " folder in resource " + rs.id + " because " + err.message);
              }
              else {
                if (config.notification !== undefined) {
                  $app.notification.notif(config.notification, reponse);
                }
                $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "returned folder " + folderId + " from resource " + rs.id, 2);
              }
            });
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
          }
        };
      },
      /**
       * Endpoint who add a new directory into another one
       * @param {object} config object used to define where to get object from
       * @returns {function} the function used to handle the server response
       */
      addDirectory: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($gapid.id, req, "addDirectory()", 1);
          if ($app.resources.exist(config.resource)) {
            var rs = $app.resources.get(config.resource);
            var folderId = req.params.name || req.body.name || config.name || "folder name";
            var parentId = req.params.parent || req.body.parent || config.parent || "root";
            rs.getService("drive").addDirectory(folderId, parentId, config.config || {}, function (err, reponse) {
              if (err) {
                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error adding " + folderId + " folder in resource " + rs.id + " because " + err.message);
              }
              else {
                if (config.notification !== undefined) {
                  $app.notification.notif(config.notification, reponse);
                }
                $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "folder " + folderId + " created in resource " + rs.id, 2);
              }
            });
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
          }
        };
      }
    }
  };
  $gapid.init(config);
  return $gapid;
};