/* global module, require, process, $log, $timer */
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
            $log.debug("Starting resource '" + $mqdb.id + "'", 2);
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
         * @param {string} key
         * @param {object} doc
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
         * @param {string} key
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
                    var ws = require("../ws");
                    var path = req.url.split("?")[0];
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "start", 4);
                    ws.okResponse(res, "test message ").send();
                    $log.debug(message_prefix + "returned test message", 2);
                };
            },
            list: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ws = require("../ws");
                    var ress = require('../resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "start", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.query(config.sql, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error saving log  because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, "returned " + reponse.length + 'items', reponse).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "list of " + reponse.length + " items", 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            get: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ws = require("../ws");
                    var ress = require('../resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    $log.debug(message_prefix + "start", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.get(config.table, docId, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error reading document because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, "returned " + reponse.length + 'items', reponse).send();
                                    $log.debug(message_prefix + "document " + docId, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ws = require("../ws");
                    var ress = require('../resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "start", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.insert(config.table, req.body, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error saving document because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, "document recorded in" + config.table, reponse).send();
                                    $log.debug(message_prefix + "document recorded in " + config.table, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ws = require("../ws");
                    var ress = require('../resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    $log.debug(message_prefix + "start", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var filter = {};
                            if (docId && config.id_field) {
                                eval("filter." + config.id_field + "=docId;");
                            }
                            rs.update(config.table, req.body, filter, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error updating document because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, "document " + docId + " updated", reponse.value).send();
                                    $log.debug(message_prefix + "document " + docId, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ws = require("../ws");
                    var ress = require('../resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    $log.debug(message_prefix + "start", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var filter = {};
                            if (docId && config.id_field) {
                                eval("filter." + config.id_field + "=docId;");
                            }
                            rs.delete(config.table, filter, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error deleting document because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, "document " + docId + " deleted", reponse).send();
                                    $log.debug(message_prefix + "document " + docId, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            }
        }
    };
    $mqdb.init(config);
    return $mqdb;
};