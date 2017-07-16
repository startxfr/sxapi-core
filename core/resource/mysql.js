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
        config: {},
        init: function (config) {
            var timerId = 'resource_mysql_init_' + $mqdb.id;
            $timer.start(timerId);
            if (config) {
                $mqdb.config = config;
            }
            $log.debug("resource '" + $mqdb.id + "' : initializing", 3);
            if (!$mqdb.config.server) {
                throw new Error("no 'server' key found in resource '" + $mqdb.id + "' config");
            }
            if (!$mqdb.config.server.host) {
                throw new Error("no 'server.host' key found in resource '" + $mqdb.id + "' config");
            }
            if (!$mqdb.config.server.database) {
                throw new Error("no 'server.database' key found in resource '" + $mqdb.id + "' config");
            }
            $mqdb.config._sign = $mqdb.config.server.host + '::' + $mqdb.config.server.database;
            $mqdb.conn = require("mysql");
            if (typeof $mysqlPool === 'undefined') {
                $mysqlPool = [];
            }
            if (typeof $mysqlPool[$mqdb.config._sign] === 'undefined') {
                $log.debug("resource '" + $mqdb.id + "' : new connection to mysql " + $mqdb.config._sign, 4);
                $mysqlPool[$mqdb.config._sign] = $mqdb.conn.createConnection($mqdb.config.server);
            }
            else {
                $log.debug("resource '" + $mqdb.id + "' : use existing connection to mysql " + $mqdb.config._sign, 4);
            }
            $log.debug("resource '" + $mqdb.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return $mqdb;
        },
        start: function (callback) {
            var timerId = 'resource_mysql_start_' + $mqdb.id;
            $log.debug("resource '" + $mqdb.id + "' : starting", 3);
            var cb = function () {
                $log.debug("resource '" + $mqdb.id + "' : started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $mqdb.open(callback);
            return $mqdb;
        },
        stop: function (callback) {
            $log.debug("Stopping resource '" + $mqdb.id + "'", 2);
            $mysqlPool[$mqdb.config._sign].destroy();
            if (typeof callback === "function") {
                callback(null, $mqdb);
            }
            return $mqdb;
        },
        open: function (callback) {
            var timerId = 'mysql_open_' + $mqdb.id;
            $timer.start(timerId);
            $mysqlPool[$mqdb.config._sign].connect(function (err) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                    throw new Error("error connecting resource '" + $mqdb.id + "' to " + $mqdb.config._sign + ' : ' + err.message);
                }
                else {
                    $log.debug("resource '" + $mqdb.id + "' : connected to '" + $mqdb.config._sign + "'", 4, duration);
                }
                if (typeof callback === "function") {
                    callback(null, $mqdb);
                }
            });
            return $mqdb;
        },
        query: function (sql, callback) {
            var timerId = 'mysql_query_' + sql;
            $timer.start(timerId);
            $log.debug("resource '" + $mqdb.id + "' : exec sql " + sql, 4);
            return $mysqlPool[$mqdb.config._sign].query(sql, (callback) ? callback(timerId) : $mqdb.__queryDefaultCallback(timerId));
        },
        __queryDefaultCallback: function (timerId) {
            return function (error, results, fields) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.error("resource '" + $mqdb.id + "' : query could not be executed because " + error.message, duration);
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
            var connection = $mysqlPool[$mqdb.config._sign];
            var sqlFilter = '';
            if (typeof filter === 'object' && Object.keys(filter).length > 0) {
                for (var i in filter) {
                    sqlFilter += "`" + i + "` = " + connection.escape(filter[i]) + " AND";
                }
                var timerId = 'mysql_read_' + table + '_' + sqlFilter.slice(0, -3);
                $timer.start(timerId);
                var sql = "SELECT * FROM " + table + " WHERE " + sqlFilter.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback(timerId) : $mqdb.__readDefaultCallback(timerId));
            }
            else {
                $log.warn("error reading entry in mysql because no filter found (prevent reading all content in table)");
                return false;
            }
        },
        __readDefaultCallback: function (timerId) {
            return function (error, results, fields) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn("error reading entry in mysql because " + error.message, duration);
                }
                else {
                    $log.debug("reading entry in mysql ", 4, duration);
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
            $log.debug("resource '" + $mqdb.id + "' : adding new entry in table '" + table + "'", 4);
            var connection = $mysqlPool[$mqdb.config._sign];
            var fields = '';
            var vals = '';
            for (var i in data) {
                fields += "`" + i + "`,";
                vals += connection.escape(data[i]) + ",";
            }
            var sql = "INSERT INTO " + table + " (" + fields.slice(0, -1) + ") VALUES(" + vals.slice(0, -1) + ");";
            return connection.query(sql, (callback) ? callback(timerId) : $mqdb.__insertDefaultCallback(timerId));
        },
        __insertDefaultCallback: function (timerId) {
            return function (error, results, fields) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn("resource '" + $mqdb.id + "' : error adding new entry because " + error.message, duration);
                }
                else {
                    $log.debug("resource '" + $mqdb.id + "' : new entry added", 3, duration);
                }
            };
        },
        /**
         * Update a document into the mysql storage
         * @param {string} table
         * @param {object} data
         * @param {object} filter
         * @param {function} callback
         */
        update: function (table, data, filter, callback) {
            var connection = $mysqlPool[$mqdb.config._sign];
            var sqlFrag = '';
            var sqlFilter = '';
            if (typeof filter === 'object' && Object.keys(filter).length > 0) {
                for (var i in filter) {
                    sqlFilter += "`" + i + "` = " + connection.escape(filter[i]) + " AND";
                }
                var timerId = 'mysql_udpate_' + table + '_' + sqlFilter.slice(0, -3);
                $timer.start(timerId);
                for (var i in data) {
                    sqlFrag += "`" + i + "` = " + connection.escape(data[i]) + ",";
                }
                var sql = "UPDATE " + table + " SET " + sqlFrag.slice(0, -1) + " WHERE " + sqlFilter.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback(timerId) : $mqdb.__updateDefaultCallback(timerId));
            }
            else {
                $log.warn("error updating entry in mysql because no filter found (prevent updating all table)");
                return false;
            }
        },
        __updateDefaultCallback: function (timerId) {
            return function (error, results, fields) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn("error updating entry in mysql because " + error.message, duration);
                }
                else {
                    $log.debug("updating entry in mysql ", 4, duration);
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
            var connection = $mysqlPool[$mqdb.config._sign];
            var sqlFilter = '';
            if (typeof filter === 'object' && Object.keys(filter).length > 0) {
                for (var i in filter) {
                    sqlFilter += "`" + i + "` = " + connection.escape(filter[i]) + " AND";
                }
                var timerId = 'mysql_delete_' + table + '_' + sqlFilter.slice(0, -3);
                $timer.start(timerId);
                var sql = "DELETE FROM " + table + " WHERE " + sqlFilter.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback() : $mqdb.__deleteDefaultCallback());
            }
            else {
                $log.warn("error deleting entry in mysql because no filter found (prevent erasing all table)");
                return false;
            }
        },
        __deleteDefaultCallback: function (timerId) {
            return function (error, results, fields) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn("error deleting entry in mysql because " + error.message, duration);
                }
                else {
                    $log.debug("deleting entry in mysql ", 4, duration);
                }
            };
        },
        endpoints: {
            test: function () {
                return function (req, res) {
                    var message_prefix = $mqdb.tools.loadEndpoints(req);
                    $mqdb.tools.responseOK(res, "test message", {}, message_prefix);
                };
            },
            list: function (config) {
                return function (req, res) {
                    var message_prefix = $mqdb.tools.loadEndpoints(req);
                    if (!config.resource) {
                        $mqdb.tools.responseResourceNotDefined(message_prefix, res);
                    }
                    else {
                        if ($mqdb.tools.ress.exist(config.resource)) {
                            var params = $mqdb.tools.generateParams4Template(config, req);
                            var sql = $mqdb.tools.format(config.sql, params);
                            $mqdb.tools.ress
                                    .get(config.resource)
                                    .query(sql, function (timerId) {
                                        return function (err, results) {
                                            var duration = $timer.timeStop(timerId);
                                            if (err) {
                                                var message = "could not execute " + sql + " because " + err.message;
                                                $mqdb.tools.responseNOK(
                                                        res,
                                                        message,
                                                        message_prefix,
                                                        duration);
                                            }
                                            else {
                                                $mqdb.tools.responseOK(res,
                                                        results.length + ' items returned',
                                                        results,
                                                        message_prefix,
                                                        duration,
                                                        results.length);
                                            }
                                        };
                                    });
                        }
                        else {
                            $mqdb.tools.responseResourceNotDefined(message_prefix, res, config);
                        }
                    }
                };
            },
            get: function (config) {
                return function (req, res) {
                    var message_prefix = $mqdb.tools.loadEndpoints(req);
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    if (!config.resource) {
                        $mqdb.tools.responseResourceNotDefined(message_prefix, res);
                    }
                    else {
                        if ($mqdb.tools.ress.exist(config.resource)) {
                            var filter = {};
                            if (docId && config.id_field) {
                                eval("filter." + config.id_field + "=docId;");
                            }
                            $mqdb.tools.ress
                                    .get(config.resource)
                                    .read(config.table, filter, function (timerId) {
                                        return function (err, reponse) {
                                            var duration = $timer.timeStop(timerId);
                                            if (err) {
                                                var message = "could not find " + docId + " in " + config.table + " because " + err.message;
                                                $mqdb.tools.responseNOK(res,
                                                        message,
                                                        message_prefix,
                                                        duration);
                                            }
                                            else {
                                                $mqdb.tools.responseOK(res,
                                                        "returned " + reponse.length + ' item',
                                                        reponse,
                                                        message_prefix,
                                                        duration);
                                            }
                                        };
                                    });
                        }
                        else {
                            $mqdb.tools.responseResourceNotDefined(message_prefix, res, config);
                        }
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var message_prefix = $mqdb.tools.loadEndpoints(req);
                    if (!config.resource) {
                        $mqdb.tools.responseResourceNotDefined(message_prefix, res);
                    }
                    else {
                        if ($mqdb.tools.ress.exist(config.resource)) {
                            $mqdb.tools.ress
                                    .get(config.resource)
                                    .insert(config.table, req.body, function (timerId) {
                                        return function (err, reponse) {
                                            var duration = $timer.timeStop(timerId);
                                            if (err) {
                                                var message = "could not create record because " + err.message;
                                                $mqdb.tools.responseNOK(res,
                                                        message,
                                                        message_prefix,
                                                        duration);
                                            }
                                            else {
                                                $mqdb.tools.responseOK(res,
                                                        "document recorded in" + config.table,
                                                        reponse,
                                                        message_prefix,
                                                        duration);
                                            }
                                        };
                                    });
                        }
                        else {
                            $mqdb.tools.responseResourceNotDefined(message_prefix, res, config);
                        }
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var message_prefix = $mqdb.tools.loadEndpoints(req);
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    if (!config.resource) {
                        $mqdb.tools.responseResourceNotDefined(message_prefix, res);
                    }
                    else {
                        if ($mqdb.tools.ress.exist(config.resource)) {
                            var filter = {};
                            if (docId && config.id_field) {
                                eval("filter." + config.id_field + "=docId;");
                            }
                            $mqdb.tools.ress
                                    .get(config.resource)
                                    .update(config.table, req.body, filter, function (timerId) {
                                        return function (err, reponse) {
                                            var duration = $timer.timeStop(timerId);
                                            if (err) {
                                                var message = "could not update " + docId + " because " + err.message;
                                                $mqdb.tools.responseNOK(res,
                                                        message,
                                                        message_prefix,
                                                        duration);
                                            }
                                            else {
                                                $mqdb.tools.responseOK(res,
                                                        "document " + docId + " updated",
                                                        reponse.value,
                                                        message_prefix,
                                                        duration);
                                            }
                                        };
                                    });
                        }
                        else {
                            $mqdb.tools.responseResourceNotDefined(message_prefix, res, config);
                        }
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var message_prefix = $mqdb.tools.loadEndpoints(req);
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    if (!config.resource) {
                        $mqdb.tools.responseResourceNotDefined(message_prefix, res);
                    }
                    else {
                        if ($mqdb.tools.ress.exist(config.resource)) {
                            var filter = {};
                            if (docId && config.id_field) {
                                eval("filter." + config.id_field + "=docId;");
                            }
                            $mqdb.tools.ress
                                    .get(config.resource)
                                    .delete(config.table, filter, function (timerId) {
                                        return function (err, reponse) {
                                            var duration = $timer.timeStop(timerId);
                                            if (err) {
                                                var message = "could not delete " + docId + " because " + err.message;
                                                $mqdb.tools.responseNOK(res,
                                                        message,
                                                        message_prefix,
                                                        duration);
                                            }
                                            else {
                                                $mqdb.tools.responseOK(res,
                                                        "document " + docId + " deleted",
                                                        reponse,
                                                        message_prefix,
                                                        duration);
                                            }
                                        };
                                    });
                        }
                        else {
                            $mqdb.tools.responseResourceNotDefined(message_prefix, res, config);
                        }
                    }
                };
            }
        },
        tools: {
            ress: require('../resource'),
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
            loadEndpoints: function (req) {
                var path = req.url.split("?")[0];
                var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                $log.debug(message_prefix + "start", 1);
                return message_prefix;
            },
            responseResourceNotDefined: function (message_prefix, res) {
                var ws = require("../ws");
                ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                $log.warn(message_prefix + "resource is not defined for this endpoint");
            },
            responseResourceDoesntExist: function (message_prefix, res, config) {
                var ws = require("../ws");
                ws.nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
            },
            responseOK: function (res, message, response, message_prefix, duration, total) {
                var ws = require("../ws");
                var answser = ws.okResponse(res, message, response);
                if (total) {
                    answser.addTotal(total);
                }
                answser.send();
                $log.debug(message_prefix + message, 2, duration);
            },
            responseNOK: function (res, message, message_prefix, duration) {
                var ws = require("../ws");
                ws.nokResponse(res, "responded " + message).httpCode(500).send();
                $log.warn(message_prefix + "responded " + message, duration);
            },
            format: $log.format
        }
    };
    $mqdb.init(config);
    return $mqdb;
};