/* global module, require, process */
//'use strict';

/**
 * mysql resource handler
 * @module resource-mysql
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
            if (config) {
                $mqdb.config = config;
            }
            require("./log").debug(
                    "init mysql resource '" + $mqdb.id + "'", 3);
            if (!$mqdb.config.server) {
                throw new Error("no 'server' key found in config");
            }
            if (!$mqdb.config.server.host) {
                throw new Error("no 'server.host' key found in config");
            }
            if (!$mqdb.config.server.database) {
                throw new Error("no 'server.database' key found in config");
            }
            $mqdb.config._sign = $mqdb.config.server.host + '::' + $mqdb.config.server.database;
            $mqdb.conn = require("mysql");
            if (typeof $mysqlPool === 'undefined') {
                $mysqlPool = [];
            }
            if (typeof $mysqlPool[$mqdb.config._sign] === 'undefined') {
                require("./log").debug("new link to mysql " + $mqdb.config._sign, 4);
                $mysqlPool[$mqdb.config._sign] = $mqdb.conn.createConnection($mqdb.config.server);
            }
            else {
                require("./log").debug("use previous link to mysql " + $mqdb.config._sign, 4);
            }
            return $mqdb;
        },
        start: function (callback) {
            require("./log").debug("start resource-mysql module", 3);
            $mqdb.open(callback);
            return $mqdb;
        },
        stop: function (callback) {
            require("./log").debug("stop resource-mysql module", 3);
            $mysqlPool[$mqdb.config._sign].destroy();
            if (typeof callback === "function") {
                callback(null, $mqdb);
            }
            return $mqdb;
        },
        open: function (callback) {
            require("./log").debug("open resource-mysql module", 3);
            $mysqlPool[$mqdb.config._sign].connect(function (err) {
                if (err) {
                    throw new Error('error connecting to ' + $mqdb.config._sign + ' : ' + err.stack);
                }
                else {
                    require("./log").debug('connected to ' + $mqdb.config._sign, 3);
                }
                if (typeof callback === "function") {
                    callback(null, $mqdb);
                }
            });
            return $mqdb;
        },
        query: function (sql, callback) {
            require("./log").debug("query SQL from mysql database " + $mqdb.config.server.database, 4);
            return $mysqlPool[$mqdb.config._sign].query(sql, (callback) ? callback : $mqdb.__queryDefaultCallback);
        },
        __queryDefaultCallback: function (error, results, fields) {
            if (error) {
                require("./log").error('query could not be executed because ' + error.message + ' [' + error.code + ']');
            }
        },
        /**
         * Insert a new document into the mysql storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        insert: function (table, data, callback) {
            var connection = $mysqlPool[$mqdb.config._sign];
            var fields = '';
            var vals = '';
            for (var i in data) {
                fields += "`" + i + "`,";
                vals += connection.escape(data[i]) + ",";
            }
            var sql = "INSERT INTO " + table + " (" + fields.slice(0, -1) + ") VALUES(" + vals.slice(0, -1) + ");";
            return connection.query(sql, (callback) ? callback : $mqdb.__insertDefaultCallback);
        },
        __insertDefaultCallback: function (error, results, fields) {
            if (error) {
                require("./log").warn("error saving new entry in mysql because " + error.message);
            }
            else {
                require("./log").debug("saved new entry in mysql ", 4);
            }
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
                for (var i in data) {
                    sqlFrag += "`" + i + "` = " + connection.escape(data[i]) + ",";
                }
                var sql = "UPDATE " + table + " SET " + sqlFrag.slice(0, -1) + " WHERE " + sqlFilter.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback : $mqdb.__updateDefaultCallback);
            }
            else {
                require("./log").warn("error updating entry in mysql because no filter found (prevent updating all table)");
                return false;
            }
        },
        __updateDefaultCallback: function (error, results, fields) {
            if (error) {
                require("./log").warn("error updating entry in mysql because " + error.message);
            }
            else {
                require("./log").debug("updating entry in mysql ", 4);
            }
        },
        /**
         * delete a document into the mysql storage
         * @param {string} key
         * @param {function} callback
         */
        delete: function (table, filter, callback) {
            var connection = $mysqlPool[$mqdb.config._sign];
            var sqlFrag = '';
            if (typeof filter === 'object' && Object.keys(filter).length > 0) {
                for (var i in filter) {
                    sqlFrag += "`" + i + "` = " + connection.escape(filter[i]) + " AND";
                }
                var sql = "DELETE FROM " + table + " WHERE " + sqlFrag.slice(0, -3) + ";";
                return connection.query(sql, (callback) ? callback : $mqdb.__deleteDefaultCallback);
            }
            else {
                require("./log").warn("error deleting entry in mysql because no filter found (prevent erasing all table)");
                return false;
            }
        },
        __deleteDefaultCallback: function (error, results, fields) {
            if (error) {
                require("./log").warn("error deleting entry in mysql because " + error.message);
            }
            else {
                require("./log").debug("deleting entry in mysql ", 4);
            }
        },
        endpoints: {
            test: function () {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    require("./log").debug(message_prefix + "called", 1);
                    require("./ws").okResponse(res, "test message ").send();
                    require("./log").info(message_prefix + "returned test message");
                };
            },
            list: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('./resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    require("./log").debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        require("./ws").nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        require("./log").warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.query(config.sql, function (err, reponse) {
                                if (err) {
                                    require("./ws").nokResponse(res, message_prefix + "error because " + err.message).httpCode(500).send();
                                    require("./log").warn(message_prefix + "error saving log  because " + err.message);
                                }
                                else {
                                    require("./ws").okResponse(res, "returned " + reponse.length + 'items', reponse).addTotal(reponse.length).send();
                                    require("./log").info(message_prefix + "list of " + reponse.length + " items");
                                }
                            });
                        }
                        else {
                            require("./ws").nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            require("./log").warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            get: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('./resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    require("./log").debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        require("./ws").nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        require("./log").warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.get(docId, function (err, reponse) {
                                if (err) {
                                    require("./ws").nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    require("./log").warn(message_prefix + "error reading document because " + err.message);
                                }
                                else {
                                    require("./ws").okResponse(res, "returned " + reponse.length + 'items', reponse).send();
                                    require("./log").info(message_prefix + "document " + docId);
                                }
                            });
                        }
                        else {
                            require("./ws").nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            require("./log").warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('./resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    require("./log").debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        require("./ws").nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        require("./log").warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.insert(config.table, req.body, function (err, reponse) {
                                if (err) {
                                    require("./ws").nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    require("./log").warn(message_prefix + "error saving document because " + err.message);
                                }
                                else {
                                    require("./ws").okResponse(res, "document recorded in" + config.table, reponse).send();
                                    require("./log").info(message_prefix + "document recorded in " + config.table);
                                }
                            });
                        }
                        else {
                            require("./ws").nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            require("./log").warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('./resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    require("./log").debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        require("./ws").nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        require("./log").warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var filter = {};
                            if (docId && config.id_fields) {
                                eval("filter." + config.id_fields + "=docId;");
                            }
                            rs.update(config.table, req.body, filter, function (err, reponse) {
                                if (err) {
                                    require("./ws").nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    require("./log").warn(message_prefix + "error updating document because " + err.message);
                                }
                                else {
                                    require("./ws").okResponse(res, "document " + docId + " updated", reponse.value).send();
                                    require("./log").info(message_prefix + "document " + docId);
                                }
                            });
                        }
                        else {
                            require("./ws").nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            require("./log").warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('./resource');
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    require("./log").debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        require("./ws").nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        require("./log").warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var filter = {};
                            if (docId && config.id_fields) {
                                eval("filter." + config.id_fields + "=docId;");
                            }
                            rs.delete(config.table, filter, function (err, reponse) {
                                if (err) {
                                    require("./ws").nokResponse(res, "error because " + err.message).httpCode(500).send();
                                    require("./log").warn(message_prefix + "error deleting document because " + err.message);
                                }
                                else {
                                    require("./ws").okResponse(res, "document " + docId + " deleted", reponse).send();
                                    require("./log").info(message_prefix + "document " + docId);
                                }
                            });
                        }
                        else {
                            require("./ws").nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            require("./log").warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            }
        }
    };
    $mqdb.init(config);
    return $mqdb;
};