/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * postgres resource handler
 * @module resource/postgres
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $pgdb = {
        id: id,
        pool: [],
        config: {},
        init: function (config) {
            var timerId = 'resource_postgres_init_' + $pgdb.id;
            $timer.start(timerId);
            if (config) {
                $pgdb.config = config;
            }
            $log.tools.resourceDebug($pgdb.id, "initializing", 3);
            if (!$pgdb.config.server) {
                throw new Error("no 'server' key found in resource '" + $pgdb.id + "' config");
            }
            if (!$pgdb.config.server.host) {
                throw new Error("no 'server.host' key found in resource '" + $pgdb.id + "' config");
            }
            if (!$pgdb.config.server.database) {
                throw new Error("no 'server.database' key found in resource '" + $pgdb.id + "' config");
            }
            $pgdb.config._sign = $pgdb.config.server.host + '::' + $pgdb.config.server.database;
            $pgdb.conn = require("pg").Client;
            if (typeof $pgdb.pool[$pgdb.config._sign] === 'undefined') {
                $log.tools.resourceDebug($pgdb.id, "initialize new postgresql connection to " + $pgdb.config._sign, 4);
                $pgdb.pool[$pgdb.config._sign] = new $pgdb.conn($pgdb.config.server);
            }
            else {
                $log.tools.resourceDebug($pgdb.id, "resource '" + $pgdb.id + "' : use existing connection to postgres " + $pgdb.config._sign, 4);
            }
            $log.tools.resourceDebug($pgdb.id, "initialized ", 1, $timer.timeStop(timerId));
            return $pgdb;
        },
        start: function (callback) {
            var timerId = 'resource_postgres_start_' + $pgdb.id;
            $log.tools.resourceDebug($pgdb.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($pgdb.id, "started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $pgdb.open(callback);
            return $pgdb;
        },
        stop: function (callback) {
            $log.tools.resourceDebug($pgdb.id, "Stopping", 2);
            $pgdb.pool[$pgdb.config._sign].end();
            if (typeof callback === "function") {
                callback(null, $pgdb);
            }
            return $pgdb;
        },
        open: function (callback) {
            var timerId = 'postgres_open_' + $pgdb.id;
            $timer.start(timerId);
            $pgdb.pool[$pgdb.config._sign].connect(function (err) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                    throw new Error("error connecting resource '" + $pgdb.id + "' to " + $pgdb.config._sign + ' : ' + err.message);
                }
                else {
                    $log.tools.resourceDebug($pgdb.id, "connected to '" + $pgdb.config._sign + "'", 4, duration);
                }
                if (typeof callback === "function") {
                    callback(null, $pgdb);
                }
            });
            return $pgdb;
        },
        query: function (sql, callback) {
            var timerId = 'postgres_query_' + sql;
            $timer.start(timerId);
            $log.tools.resourceInfo($pgdb.id, "exec sql " + sql);
            return $pgdb.pool[$pgdb.config._sign].query(sql, (callback) ? callback(timerId) : $pgdb.__queryDefaultCallback(timerId));
        },
        __queryDefaultCallback: function (timerId) {
            return function (error, results) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceError("query could not be executed because " + error.message, duration);
                }
            };
        },
        /**
         * Read a document from the postgres storage
         * @param {string} table
         * @param {object} filter
         * @param {function} callback
         */
        read: function (table, filter, callback) {
            var connection = $pgdb.pool[$pgdb.config._sign];
            var sqlFilter = '';
            if (typeof filter === 'object' && Object.keys(filter).length > 0) {
                for (var i in filter) {
                    sqlFilter += "`" + i + "` = " + connection.escape(filter[i]) + " AND";
                }
                var timerId = 'postgres_read_' + table + '_' + sqlFilter.slice(0, -3);
                $timer.start(timerId);
                $log.tools.resourceInfo($pgdb.id, "read table " + table);
                var sql = "SELECT * FROM " + table + " WHERE " + sqlFilter.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback(timerId) : $pgdb.__readDefaultCallback(timerId));
            }
            else {
                $log.tools.resourceWarn($pgdb.id, "error reading entry in postgres because no filter found (prevent reading all content in table)");
                return false;
            }
        },
        __readDefaultCallback: function (timerId) {
            return function (error, results) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($pgdb.id, "error reading entry in postgres because " + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($pgdb.id, "reading entry in postgres ", 4, duration);
                }
            };
        },
        /**
         * Insert a new document into the postgres storage
         * @param {string} table
         * @param {object} data
         * @param {function} callback
         */
        insert: function (table, data, callback) {
            var timerId = 'postgres_insert_' + table;
            $timer.start(timerId);
            $log.tools.resourceInfo($pgdb.id, "add new entry in table '" + table + "'");
            var connection = $pgdb.pool[$pgdb.config._sign];
            var fields = '';
            var vals = '';
            for (var i in data) {
                fields += "`" + i + "`,";
                vals += connection.escape(data[i]) + ",";
            }
            var sql = "INSERT INTO " + table + " (" + fields.slice(0, -1) + ") VALUES(" + vals.slice(0, -1) + ");";
            return connection.query(sql, (callback) ? callback(timerId) : $pgdb.__insertDefaultCallback(timerId));
        },
        __insertDefaultCallback: function (timerId) {
            return function (error, results) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($pgdb.id, "resource '" + $pgdb.id + "' : error adding new entry because " + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($pgdb.id, "resource '" + $pgdb.id + "' : new entry added", 3, duration);
                }
            };
        },
        /**
         * Update a document into the postgres storage
         * @param {string} table
         * @param {object} data
         * @param {object} filter
         * @param {function} callback
         */
        update: function (table, data, filter, callback) {
            var connection = $pgdb.pool[$pgdb.config._sign];
            var sqlFrag = '';
            var sqlFilter = '';
            $log.tools.resourceInfo($pgdb.id, "update entry in table '" + table + "'");
            if (typeof filter === 'object' && Object.keys(filter).length > 0) {
                for (var i in filter) {
                    sqlFilter += "`" + i + "` = " + connection.escape(filter[i]) + " AND";
                }
                var timerId = 'postgres_udpate_' + table + '_' + sqlFilter.slice(0, -3);
                $timer.start(timerId);
                for (var i in data) {
                    sqlFrag += "`" + i + "` = " + connection.escape(data[i]) + ",";
                }
                var sql = "UPDATE " + table + " SET " + sqlFrag.slice(0, -1) + " WHERE " + sqlFilter.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback(timerId) : $pgdb.__updateDefaultCallback(timerId));
            }
            else {
                $log.tools.resourceWarn($pgdb.id, "error updating entry in postgres because no filter found (prevent updating all table)");
                return false;
            }
        },
        __updateDefaultCallback: function (timerId) {
            return function (error, results) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($pgdb.id, "error updating entry in postgres because " + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($pgdb.id, "updating entry in postgres ", 4, duration);
                }
            };
        },
        /**
         * delete a document into the postgres storage
         * @param {string} table
         * @param {string} filter
         * @param {function} callback
         */
        delete: function (table, filter, callback) {
            var connection = $pgdb.pool[$pgdb.config._sign];
            var sqlFilter = '';
            $log.tools.resourceInfo($pgdb.id, "delete entry in table '" + table + "'");
            if (typeof filter === 'object' && Object.keys(filter).length > 0) {
                for (var i in filter) {
                    sqlFilter += "`" + i + "` = " + connection.escape(filter[i]) + " AND";
                }
                var timerId = 'postgres_delete_' + table + '_' + sqlFilter.slice(0, -3);
                $timer.start(timerId);
                var sql = "DELETE FROM " + table + " WHERE " + sqlFilter.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback() : $pgdb.__deleteDefaultCallback());
            }
            else {
                $log.tools.resourceWarn($pgdb.id, "error deleting entry in postgres because no filter found (prevent erasing all table)");
                return false;
            }
        },
        __deleteDefaultCallback: function (timerId) {
            return function (error, results) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($pgdb.id, "error deleting entry in postgres because " + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($pgdb.id, "deleting entry in postgres ", 4, duration);
                }
            };
        },
        endpoints: {
            list: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($pgdb.id, req, "list()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var params = $pgdb.tools.generateParams4Template(config, req);
                        var sql = $pgdb.tools.format(config.sql, params);
                        $app.ressources
                                .get(config.resource)
                                .query(sql, function (timerId) {
                                    return function (err, results) {
                                        var duration = $timer.timeStop(timerId);
                                        if (err) {
                                            var message = "could not execute " + sql + " because " + err.message;
                                            $pgdb.tools.responseNOK(
                                                    res,
                                                    message,
                                                    req,
                                                    duration);
                                        }
                                        else {
                                            $pgdb.tools.responseOK(res,
                                                    results.length + ' items returned',
                                                    results,
                                                    req,
                                                    duration,
                                                    results.length);
                                        }
                                    };
                                });
                    }
                    else {
                        $pgdb.tools.responseResourceDoesntExist(req, res, config.resource);
                    }
                };
            },
            get: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($pgdb.id, req, "get()", 1);
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    if ($app.resources.exist(config.resource)) {
                        var filter = {};
                        if (docId && config.id_field) {
                            eval("filter." + config.id_field + "=docId;");
                        }
                        $app.resources
                                .get(config.resource)
                                .read(config.table, filter, function (timerId) {
                                    return function (err, reponse) {
                                        var duration = $timer.timeStop(timerId);
                                        if (err) {
                                            var message = "could not find " + docId + " in " + config.table + " because " + err.message;
                                            $pgdb.tools.responseNOK(res,
                                                    message,
                                                    req,
                                                    duration);
                                        }
                                        else {
                                            $pgdb.tools.responseOK(res,
                                                    "returned " + reponse.length + ' item',
                                                    reponse,
                                                    req,
                                                    duration);
                                        }
                                    };
                                });
                    }
                    else {
                        $pgdb.tools.responseResourceDoesntExist(req, res, config.resource);
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($pgdb.id, req, "create()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources
                                .get(config.resource)
                                .insert(config.table, req.body, function (timerId) {
                                    return function (err, reponse) {
                                        var duration = $timer.timeStop(timerId);
                                        if (err) {
                                            var message = "could not create record because " + err.message;
                                            $pgdb.tools.responseNOK(res,
                                                    message,
                                                    req,
                                                    duration);
                                        }
                                        else {
                                            $pgdb.tools.responseOK(res,
                                                    "document recorded in" + config.table,
                                                    reponse,
                                                    req,
                                                    duration);
                                        }
                                    };
                                });
                    }
                    else {
                        $pgdb.tools.responseResourceDoesntExist(req, res, config.resource);
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($pgdb.id, req, "update()", 1);
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    if ($app.resources.exist(config.resource)) {
                        var filter = {};
                        if (docId && config.id_field) {
                            eval("filter." + config.id_field + "=docId;");
                        }
                        $app.resources
                                .get(config.resource)
                                .update(config.table, req.body, filter, function (timerId) {
                                    return function (err, reponse) {
                                        var duration = $timer.timeStop(timerId);
                                        if (err) {
                                            var message = "could not update " + docId + " because " + err.message;
                                            $pgdb.tools.responseNOK(res,
                                                    message,
                                                    req,
                                                    duration);
                                        }
                                        else {
                                            $pgdb.tools.responseOK(res,
                                                    "document " + docId + " updated",
                                                    reponse.value,
                                                    req,
                                                    duration);
                                        }
                                    };
                                });
                    }
                    else {
                        $pgdb.tools.responseResourceDoesntExist(req, res, config.resource);
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($pgdb.id, req, "delete()", 1);
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    if ($app.resources.exist(config.resource)) {
                        var filter = {};
                        if (docId && config.id_field) {
                            eval("filter." + config.id_field + "=docId;");
                        }
                        $app.resources
                                .get(config.resource)
                                .delete(config.table, filter, function (timerId) {
                                    return function (err, reponse) {
                                        var duration = $timer.timeStop(timerId);
                                        if (err) {
                                            var message = "could not delete " + docId + " because " + err.message;
                                            $pgdb.tools.responseNOK(res,
                                                    message,
                                                    req,
                                                    duration);
                                        }
                                        else {
                                            $pgdb.tools.responseOK(res,
                                                    "document " + docId + " deleted",
                                                    reponse,
                                                    req,
                                                    duration);
                                        }
                                    };
                                });
                    }
                    else {
                        $pgdb.tools.responseResourceDoesntExist(req, res, config.resource);
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
                $log.tools.endpointWarnAndAnswerNoResource(res, $pgdb.id, req, resourceId);
            },
            responseOK: function (res, message, response, req, duration, total) {
                var answser = $app.ws.okResponse(res, message, response);
                if (total) {
                    answser.addTotal(total);
                }
                answser.send();
                $log.tools.endpointDebug($pgdb.id, req, message, 2, duration);
            },
            responseNOK: function (res, message, req, duration) {
                $log.tools.endpointErrorAndAnswer(res, $pgdb.id, req, message, duration);
            },
            format: $log.format
        }
    };
    $pgdb.init(config);
    return $pgdb;
};