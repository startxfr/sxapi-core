/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * localfs resource handler
 * @module resource/localfs
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
  var $fs = {
    id: id,
    pool: [],
    config: {},
    init: function (config) {
      var timerId = 'resource_localfs_init_' + $fs.id;
      $timer.start(timerId);
      if (config) {
        $fs.config = config;
      }
      $log.tools.resourceDebug($fs.id, "initializing", 3);
      if (!$fs.config.directory) {
        $fs.config.directory = "/tmp";
      }
      if (typeof $fs.pool[$fs.id] === 'undefined') {
        $log.tools.resourceDebug($fs.id, "initialize new localfs connection to " + $fs.config.directory, 4);
        $fs.pool[$fs.id] = require('fs');
      }
      else {
        $log.tools.resourceDebug($fs.id, "resource '" + $fs.id + "' : use existing connection to localfs " + $fs.config.directory, 4);
      }
      $log.tools.resourceDebug($fs.id, "initialized ", 1, $timer.timeStop(timerId));
      return $fs;
    },
    start: function (callback) {
      var timerId = 'resource_localfs_start_' + $fs.id;
      $log.tools.resourceDebug($fs.id, "Starting resource", 3);
      if (typeof callback === "function") {
        callback();
      }
      return $fs;
    },
    stop: function (callback) {
      $log.tools.resourceDebug($fs.id, "Stopping resource", 2);
      delete($fs.pool[$fs.id]);
      if (typeof callback === "function") {
        callback(null, $fs);
      }
      return $fs;
    },
    open: function (callback) {
      $log.tools.resourceDebug($fs.id, "connected to '" + $fs.config.directory + "'", 4);
      if (typeof callback === "function") {
        callback(null, $fs);
      }
      return $fs;
    },
    query: function (search, callback) {
      var timerId = 'localfs_query_' + search;
      $timer.start(timerId);
      $log.tools.resourceInfo($fs.id, "exec file search " + search + " in " + $fs.config.directory);
      require("glob")(search, {cwd: $fs.config.directory}, (callback) ? callback(timerId) : $fs.__queryDefaultCallback(timerId));
      return this;
    },
    __queryDefaultCallback: function (timerId) {
      return function (error, files) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceError("query could not be executed because " + error.message, duration);
        }
      };
    },
    /**
     * Read a document from the localfs storage
     * @param {string} filename
     * @param {function} callback
     */
    read: function (filename, callback) {
      var timerId = 'localfs_read_' + filename;
      $timer.start(timerId);
      return $fs.pool[$fs.id].readFile($fs.config.directory + filename, (callback) ? callback(timerId, filename) : $fs.__readDefaultCallback(timerId, filename));
    },
    __readDefaultCallback: function (timerId, filename) {
      return function (error, results) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($fs.id, "error reading file " + filename + " in localfs because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($fs.id, "reading file " + filename + " in localfs ", 4, duration);
        }
      };
    },
    /**
     * Insert a new document into the localfs storage
     * @param {string} filename
     * @param {object} data
     * @param {function} callback
     */
    insert: function (filename, data, callback) {
      var timerId = 'localfs_insert_' + filename;
      $timer.start(timerId);
      return $fs.pool[$fs.id].writeFile($fs.config.directory + filename, data, (callback) ? callback(timerId, filename) : $fs.__insertDefaultCallback(timerId, filename));
    },
    __insertDefaultCallback: function (timerId, filename) {
      return function (error, results) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($fs.id, "resource '" + $fs.id + "' : error inserting " + filename + " file because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($fs.id, "resource '" + $fs.id + "' : file " + filename + " added", 4, duration);
        }
      };
    },
    /**
     * Update a document into the localfs storage
     * @param {string} filename
     * @param {object} data
     * @param {function} callback
     */
    update: function (filename, data, callback) {
      var timerId = 'localfs_update_' + filename;
      $timer.start(timerId);
      return $fs.pool[$fs.id].writeFile($fs.config.directory + filename, data, (callback) ? callback(timerId, filename) : $fs.__updateDefaultCallback(timerId, filename));
    },
    __updateDefaultCallback: function (timerId, filename) {
      return function (error, results) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($fs.id, "resource '" + $fs.id + "' : error updating " + filename + " file because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($fs.id, "resource '" + $fs.id + "' : file " + filename + " updated", 4, duration);
        }
      };
    },
    /**
     * delete a document into the localfs storage
     * @param {string} filename
     * @param {function} callback
     */
    delete: function (filename, callback) {
      var timerId = 'localfs_delete_' + filename;
      $timer.start(timerId);
      return $fs.pool[$fs.id].unlink($fs.config.directory + filename, (callback) ? callback(timerId, filename) : $fs.__deleteDefaultCallback(timerId, filename));
    },
    __deleteDefaultCallback: function (timerId, filename) {
      return function (error, results) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($fs.id, "resource '" + $fs.id + "' : error deleting " + filename + " file because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($fs.id, "resource '" + $fs.id + "' : file " + filename + " deleted", 4, duration);
        }
      };
    },
    endpoints: {
      list: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($fs.id, req, "list()", 1);
          if ($app.resources.exist(config.resource)) {
            var params = $fs.tools.generateParams4Template(config, req);
            var search = params.id || "*";
            $app.resources
            .get(config.resource)
            .query(search, function (timerId) {
              return function (err, results) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not find " + search + " because " + err.message;
                  $log.tools.resourceError(message, duration);
                  $fs.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, results);
                  }
                  $log.tools.resourceDebug($fs.id, "resource '" + $fs.id + "' : search " + search + " found " + results.length + " item(s)", 4, duration);
                  $fs.tools.responseOK(res, results.length + ' items returned', results, req, duration, results.length);
                }
              };
            });
          }
          else {
            $fs.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      read: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($fs.id, req, "read()", 1);
          var docId = (req.params.id) ? req.params.id : req.body.id;
          if ($app.resources.exist(config.resource)) {
            var cb = function (timerId, filename) {
              return function (err, reponse) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not find " + docId + " in " + $fs.config.directory + " because " + err.message;
                  $log.tools.resourceWarn(message, duration);
                  $fs.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, reponse);
                  }
                  $log.tools.resourceDebug($fs.id, "endpoint '" + $fs.id + "' : read " + docId + " found ", 4, duration);
                  res.end(reponse);
                  $log.tools.endpointDebug($fs.id, req, "returned " + docId + ' item', 2, duration);
                }
              };
            };
            $app.resources.get(config.resource).read(docId, cb);
          }
          else {
            $fs.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      create: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($fs.id, req, "create()", 1);
          if ($app.resources.exist(config.resource)) {
            var docId = (req.params.id) ? req.params.id : req.body.id;
            var docData = req.body;
            if (typeof docData === 'object') {
              docData = JSON.stringify(docData);
            }
            $app.resources
            .get(config.resource)
            .insert(docId, docData, function (timerId) {
              return function (err) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not create file " + docId + " because " + err.message;
                  $log.tools.resourceWarn(message, duration);
                  $fs.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, docId);
                  }
                  $fs.tools.responseOK(res, "file " + docId + " created", docId, req, duration);
                }
              };
            });
          }
          else {
            $fs.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      update: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($fs.id, req, "update()", 1);
          var docId = (req.params.id) ? req.params.id : req.body.id;
          var docData = req.body;
          if (typeof docData === 'object') {
            docData = JSON.stringify(docData);
          }
          if ($app.resources.exist(config.resource)) {
            $app.resources
            .get(config.resource)
            .update(docId, docData, function (timerId) {
              return function (err) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not update " + docId + " because " + err.message;
                  $log.tools.resourceWarn(message, duration);
                  $fs.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, docId);
                  }
                  $fs.tools.responseOK(res, "document " + docId + " updated", docId, req, duration);
                }
              };
            });
          }
          else {
            $fs.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      delete: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($fs.id, req, "delete()", 1);
          var docId = (req.params.id) ? req.params.id : req.body.id;
          if ($app.resources.exist(config.resource)) {
            $app.resources
            .get(config.resource)
            .delete(docId, function (timerId) {
              return function (err) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not delete " + docId + " because " + err.message;
                  $log.tools.resourceWarn(message, duration);
                  $fs.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, docId);
                  }
                  $fs.tools.responseOK(res, "document " + docId + " deleted", docId, req, duration);
                }
              };
            });
          }
          else {
            $fs.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      }
    },
    tools: {
      generateParams4Template: function (config, req) {
        var params = require('merge').recursive({}, config);
        if (req.params) {
          require('merge').recursive(params, req.params);
        }
        if (req.body) {
          require('merge').recursive(params, req.body);
        }
        if (req.query) {
          require('merge').recursive(params, req.query);
        }
        return params;
      },
      responseResourceDoesntExist: function (req, res, resourceId) {
        $log.tools.endpointWarnAndAnswerNoResource(res, $fs.id, req, resourceId);
      },
      responseOK: function (res, message, response, req, duration, total) {
        var answser = $app.ws.okResponse(res, message, response);
        if (total) {
          answser.addTotal(total);
        }
        answser.send();
        $log.tools.endpointDebug($fs.id, req, message, 2, duration);
      },
      responseNOK: function (res, message, req, duration) {
        $log.tools.endpointErrorAndAnswer(res, $fs.id, req, message, duration);
      },
      format: $log.format
    }
  };
  $fs.init(config);
  return $fs;
};