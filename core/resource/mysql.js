/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * mysql resource handler
 * @module resource/mysql
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
  var $mqdb = {
    id: id,
    pool: [],
    config: {},
    init: function (config) {
      var timerId = 'resource_mysql_init_' + $mqdb.id;
      $timer.start(timerId);
      if (config) {
        $mqdb.config = config;
      }
      $log.tools.resourceDebug($mqdb.id, "initializing", 3);
      if (!$mqdb.config.server) {
        throw new Error("no 'server' key found in resource '" + $mqdb.id + "' config");
      }
      if (!$mqdb.config.server.host) {
        throw new Error("no 'server.host' key found in resource '" + $mqdb.id + "' config");
      }
      if (!$mqdb.config.server.database) {
        throw new Error("no 'server.database' key found in resource '" + $mqdb.id + "' config");
      }
      $mqdb.config.server.host = $log.format("" + $mqdb.config.server.host, process.env);
      $mqdb.config.server.database = $log.format("" + $mqdb.config.server.database, process.env);
      if ($mqdb.config.server.port) {
        $mqdb.config.server.port = $log.format("" + $mqdb.config.server.port, process.env);
      }
      if ($mqdb.config.server.user) {
        $mqdb.config.server.user = $log.format("" + $mqdb.config.server.user, process.env);
      }
      if ($mqdb.config.server.password) {
        $mqdb.config.server.password = $log.format("" + $mqdb.config.server.password, process.env);
      }
      $mqdb.config._sign = $mqdb.config.server.host + '::' + $mqdb.config.server.database;
      $mqdb.conn = require("mysql");
      if (typeof $mqdb.pool[$mqdb.config._sign] === 'undefined') {
        $log.tools.resourceDebug($mqdb.id, "initialize new mysql connection to " + $mqdb.config._sign, 4);
        $mqdb.pool[$mqdb.config._sign] = $mqdb.conn.createConnection($mqdb.config.server);
      }
      else {
        $log.tools.resourceDebug($mqdb.id, "resource '" + $mqdb.id + "' : use existing connection to mysql " + $mqdb.config._sign, 4);
      }
      $log.tools.resourceDebug($mqdb.id, "initialized ", 1, $timer.timeStop(timerId));
      return $mqdb;
    },
    start: function (callback) {
      var timerId = 'resource_mysql_start_' + $mqdb.id;
      $log.tools.resourceDebug($mqdb.id, "Starting resource", 3);
      var cb = function () {
        $log.tools.resourceDebug($mqdb.id, "started ", 1, $timer.timeStop(timerId));
        if (typeof callback === "function") {
          callback();
        }
      };
      $mqdb.open(callback);
      return $mqdb;
    },
    stop: function (callback) {
      $log.tools.resourceDebug($mqdb.id, "Stopping resource", 2);
      $mqdb.pool[$mqdb.config._sign].destroy();
      if (typeof callback === "function") {
        callback(null, $mqdb);
      }
      return $mqdb;
    },
    open: function (callback) {
      var timerId = 'mysql_open_' + $mqdb.id;
      $timer.start(timerId);
      $mqdb.pool[$mqdb.config._sign].connect(function (err) {
        var duration = $timer.timeStop(timerId);
        if (err) {
          throw new Error("error connecting resource '" + $mqdb.id + "' to " + $mqdb.config._sign + ' : ' + err.message);
        }
        else {
          $log.tools.resourceDebug($mqdb.id, "connected to '" + $mqdb.config._sign + "'", 4, duration);
        }
        if (typeof callback === "function") {
          callback(null, $mqdb);
        }
      });
      // permanent ping to keep connection alive
      var timelaps = $mqdb.config.keepAliveInterval || 20;
      setInterval(function () {
        $log.tools.resourceDebug($mqdb.id, "ping '" + $mqdb.config._sign + "' to keep connection alived", 4);
        $mqdb.pool[$mqdb.config._sign].query('SELECT 1');
      }, timelaps * 1000);
      return $mqdb;
    },
    query: function (sql, callback) {
      var timerId = 'mysql_query_' + sql;
      $timer.start(timerId);
      $log.tools.resourceInfo($mqdb.id, "exec sql " + sql);
      return $mqdb.pool[$mqdb.config._sign].query(sql, (callback) ? callback(timerId) : $mqdb.__queryDefaultCallback(timerId));
    },
    __queryDefaultCallback: function (timerId) {
      return function (error, results, fields) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceError("query could not be executed because " + error.message, duration);
        }
      };
    },
    /**
     * Read a document from the mysql storage
     * @param {string} table
     * @param {object} filter
     * @param {function} callback
     */
    read: function (table, filter, callback) {
      var connection = $mqdb.pool[$mqdb.config._sign];
      var sqlFilter = '';
      if (typeof filter === 'object' && Object.keys(filter).length > 0) {
        for (var i in filter) {
          sqlFilter += "`" + i + "` = " + $mqdb.__escapeFilter(filter[i]) + " AND";
        }
        var timerId = 'mysql_read_' + table + '_' + sqlFilter.slice(0, -3);
        $timer.start(timerId);
        $log.tools.resourceInfo($mqdb.id, "read table " + table);
        var sql = "SELECT * FROM " + table + " WHERE " + sqlFilter.slice(0, -3) + ";";
        return connection.query(sql, (callback) ? callback(timerId) : $mqdb.__readDefaultCallback(timerId));
      }
      else {
        $log.tools.resourceWarn($mqdb.id, "error reading entry in mysql because no filter found (prevent reading all content in table)");
        return false;
      }
    },
    __readDefaultCallback: function (timerId) {
      return function (error, results, fields) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($mqdb.id, "error reading entry in mysql because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($mqdb.id, "reading entry in mysql ", 4, duration);
        }
      };
    },
    /**
     * Insert a new document into the mysql storage
     * @param {string} table
     * @param {object} data
     * @param {function} callback
     */
    insert: function (table, data, callback) {
      var timerId = 'mysql_insert_' + table;
      $timer.start(timerId);
      $log.tools.resourceInfo($mqdb.id, "add new entry in table '" + table + "'");
      var connection = $mqdb.pool[$mqdb.config._sign];
      var fields = '';
      var vals = '';
      for (var i in data) {
        fields += "`" + i + "`,";
        vals += $mqdb.__escapeData(data[i]) + ",";
      }
      var sql = "INSERT INTO " + table + " (" + fields.slice(0, -1) + ") VALUES(" + vals.slice(0, -1) + ");";
      return connection.query(sql, (callback) ? callback(timerId) : $mqdb.__insertDefaultCallback(timerId));
    },
    __insertDefaultCallback: function (timerId) {
      return function (error, results, fields) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($mqdb.id, "resource '" + $mqdb.id + "' : error adding new entry because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($mqdb.id, "resource '" + $mqdb.id + "' : new entry added", 3, duration);
        }
      };
    },
    
    /**
     * Escape field data for SQL inclusion
     * @param {mixed} data 
     * @param {string} escaped data with SQL decoration
     */
    __escapeData: function (data) {
      var d = data;
      if(typeof data === "function") {
        d = data();
      }
      else if(data.constructor === Array) {
        d = data.join(',');
      }
      else if(typeof data === 'object') {
        d = JSON.stringify(data);
      }
      return $mqdb.pool[$mqdb.config._sign].escape(d);
    },
    /**
     * Escape field filter for SQL inclusion
     * @param {mixed} data 
     * @param {string} escaped filter with SQL decoration
     */
    __escapeFilter: function (data) {
      return $mqdb.__escapeData(data);
    },
    
    /**
     * Update a document into the mysql storage
     * @param {string} table
     * @param {object} data
     * @param {object} filter
     * @param {function} callback
     */
    update: function (table, data, filter, callback) {
      var connection = $mqdb.pool[$mqdb.config._sign];
      var sqlFrag = '';
      var sqlFilter = '';
      $log.tools.resourceInfo($mqdb.id, "update entry in table '" + table + "'");
      if (typeof filter === 'object' && Object.keys(filter).length > 0) {
        for (var i in filter) {
          sqlFilter += "`" + i + "` = " + $mqdb.__escapeFilter(filter[i]) + " AND";
        }
        var timerId = 'mysql_udpate_' + table + '_' + sqlFilter.slice(0, -3);
        $timer.start(timerId);
        for (var i in data) {
          sqlFrag += "`" + i + "` = " + $mqdb.__escapeData(data[i]) + ",";
        }
        var sql = "UPDATE " + table + " SET " + sqlFrag.slice(0, -1) + " WHERE " + sqlFilter.slice(0, -3) + ";";
        return connection.query(sql, (callback) ? callback(timerId) : $mqdb.__updateDefaultCallback(timerId));
      }
      else {
        $log.tools.resourceWarn($mqdb.id, "error updating entry in mysql because no filter found (prevent updating all table)");
        return false;
      }
    },
    __updateDefaultCallback: function (timerId) {
      return function (error, results, fields) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($mqdb.id, "error updating entry in mysql because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($mqdb.id, "updating entry in mysql ", 4, duration);
        }
      };
    },
    /**
     * delete a document into the mysql storage
     * @param {string} table
     * @param {string} filter
     * @param {function} callback
     */
    delete: function (table, filter, callback) {
      var connection = $mqdb.pool[$mqdb.config._sign];
      var sqlFilter = '';
      $log.tools.resourceInfo($mqdb.id, "delete entry in table '" + table + "'");
      if (typeof filter === 'object' && Object.keys(filter).length > 0) {
        for (var i in filter) {
          sqlFilter += "`" + i + "` = " + $mqdb.__escapeFilter(filter[i]) + " AND";
        }
        var timerId = 'mysql_delete_' + table + '_' + sqlFilter.slice(0, -3);
        $timer.start(timerId);
        var sql = "DELETE FROM " + table + " WHERE " + sqlFilter.slice(0, -3) + ";";
        return connection.query(sql, (callback) ? callback() : $mqdb.__deleteDefaultCallback());
      }
      else {
        $log.tools.resourceWarn($mqdb.id, "error deleting entry in mysql because no filter found (prevent erasing all table)");
        return false;
      }
    },
    __deleteDefaultCallback: function (timerId) {
      return function (error, results, fields) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($mqdb.id, "error deleting entry in mysql because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($mqdb.id, "deleting entry in mysql ", 4, duration);
        }
      };
    },
    endpoints: {
      list: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($mqdb.id, req, "list()", 1);
          if ($app.resources.exist(config.resource)) {
            var params = $mqdb.tools.generateParams4Template(config, req);
            var sql = $mqdb.tools.format(config.sql, params);
            $app.resources
            .get(config.resource)
            .query(sql, function (timerId) {
              return function (err, results) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not execute " + sql + " because " + err.message;
                  $mqdb.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, results);
                  }
                  $mqdb.tools.responseOK(res, results.length + ' items returned', results, req, duration, results.length);
                }
              };
            });
          }
          else {
            $mqdb.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      read: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($mqdb.id, req, "read()", 1);
          var docId = (req.params.id) ? req.params.id : req.body.id;
          if ($app.resources.exist(config.resource)) {
            var filter = {};
            if (docId && config.id_field) {
              filter[config.id_field] = docId;
            }
            var cb = function (timerId) {
              return function (err, reponse) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not find " + docId + " in " + config.table + " because " + err.message;
                  $mqdb.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, reponse);
                  }
                  $mqdb.tools.responseOK(res, "returned " + reponse.length + ' item', reponse, req, duration);
                }
              };
            };
            if (config.sql) {
              var params = $mqdb.tools.generateParams4Template(config, req);
              var sql = $mqdb.tools.format(config.sql, params);
              $app.resources.get(config.resource).query(sql, cb);
            }
            else {
              $app.resources.get(config.resource).read(config.table, filter, cb);
            }
          }
          else {
            $mqdb.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      readOne: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($mqdb.id, req, "readOne()", 1);
          var docId = (req.params.id) ? req.params.id : req.body.id;
          if ($app.resources.exist(config.resource)) {
            var filter = {};
            if (docId && config.id_field) {
              filter[config.id_field] = docId;
            }
            var cb = function (timerId) {
              return function (err, reponse) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not find " + docId + " in " + config.table + " because " + err.message;
                  $mqdb.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    $app.notification.notif(config.notification, reponse);
                  }
                  $mqdb.tools.responseOK(res, "returned 1 item", reponse[0], req, duration);
                }
              };
            };
            if (config.sql) {
              var params = $mqdb.tools.generateParams4Template(config, req);
              var sql = $mqdb.tools.format(config.sql, params);
              $app.resources.get(config.resource).query(sql, cb);
            }
            else {
              $app.resources.get(config.resource).read(config.table, filter, cb);
            }
          }
          else {
            $mqdb.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      create: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($mqdb.id, req, "create()", 1);
          if ($app.resources.exist(config.resource)) {
            $app.resources
            .get(config.resource)
            .insert(config.table, req.body, function (timerId) {
              return function (err, reponse) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not create record because " + err.message;
                  $mqdb.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    var filter = {};
                    filter[config.id_field] = reponse.insertId;
                    $app.resources
                    .get(config.resource)
                    .read(config.table, filter, function () {
                      return function (err, rep) {
                        if (err) {
                          $app.notification.notif(config.notification, reponse);
                        }
                        else {
                          $app.notification.notif(config.notification, rep[0]);
                        }
                      };
                    });
                  }
                  $mqdb.tools.responseOK(res, "document recorded in" + config.table, reponse, req, duration);
                }
              };
            });
          }
          else {
            $mqdb.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      update: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($mqdb.id, req, "update()", 1);
          var docId = (req.params.id) ? req.params.id : req.body.id;
          var ress = $app.resources.get(config.resource);
          if ($app.resources.exist(config.resource)) {
            var filter = {};
            if (docId && config.id_field) {
              eval("filter." + config.id_field + "=docId;");
            }
            ress.update(config.table, req.body, filter, function (timerId) {
              return function (err, reponse) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                  var message = "could not update " + docId + " because " + err.message;
                  $mqdb.tools.responseNOK(res, message, req, duration);
                }
                else {
                  if (config.notification !== undefined) {
                    var filter = {};
                    filter[config.id_field] = docId;
                    ress.read(config.table, filter, function () {
                      return function (err, rep) {
                        if (!err) {
                          $app.notification.notif(config.notification, rep[0] || reponse);
                        }
                      };
                    });
                  }
                  $mqdb.tools.responseOK(res, "document " + docId + " updated", reponse.value, req, duration);
                }
              };
            });
          }
          else {
            $mqdb.tools.responseResourceDoesntExist(req, res, config.resource);
          }
        };
      },
      delete: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($mqdb.id, req, "delete()", 1);
          var docId = (req.params.id) ? req.params.id : req.body.id;
          var ress = $app.resources.get(config.resource);
          if ($app.resources.exist(config.resource)) {
            var filter = {};
            filter[config.id_field] = docId;
            if (config.notification !== undefined) {
              ress.read(config.table, filter, function () {
                return function (errr, rep) {
                  $app.resources
                  .get(config.resource)
                  .delete(config.table, filter, function (timerId) {
                    return function (err, reponse) {
                      var duration = $timer.timeStop(timerId);
                      if (err) {
                        var message = "could not delete " + docId + " because " + err.message;
                        $mqdb.tools.responseNOK(res, message, req, duration);
                      }
                      else {
                        if (config.notification !== undefined) {
                          $app.notification.notif(config.notification, rep[0]);
                        }
                        $mqdb.tools.responseOK(res, "document " + docId + " deleted", reponse, req, duration);
                      }
                    };
                  });
                };
              });
            }
            else {
              ress.delete(config.table, filter, function (timerId) {
                return function (err, reponse) {
                  var duration = $timer.timeStop(timerId);
                  if (err) {
                    var message = "could not delete " + docId + " because " + err.message;
                    $mqdb.tools.responseNOK(res, message, req, duration);
                  }
                  else {
                    $mqdb.tools.responseOK(res, "document " + docId + " deleted", reponse, req, duration);
                  }
                };
              });
            }
          }
          else {
            $mqdb.tools.responseResourceDoesntExist(req, res, config.resource);
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
        $log.tools.endpointWarnAndAnswerNoResource(res, $mqdb.id, req, resourceId);
      },
      responseOK: function (res, message, response, req, duration, total) {
        var answser = $app.ws.okResponse(res, message, response);
        if (total) {
          answser.addTotal(total);
        }
        answser.send();
        $log.tools.endpointDebug($mqdb.id, req, message, 2, duration);
      },
      responseNOK: function (res, message, req, duration) {
        $log.tools.endpointErrorAndAnswer(res, $mqdb.id, req, message, duration);
      },
      format: $log.format
    }
  };
  $mqdb.init(config);
  return $mqdb;
};