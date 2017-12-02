/* global module, require, process, $log, $timer, $rdCluster, $rdCluster, $app */
//'use strict';

/**
 * redis resource handler
 * @module resource/redis
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $rddb = {
        id: id,
        config: {},
        init: function (config) {
            var timerId = 'resource_redis_init_' + $rddb.id;
            $timer.start(timerId);
            if (config) {
                $rddb.config = config;
            }
            $log.debug("resource '" + $rddb.id + "' : initializing", 3);
            if (!$rddb.config.host && !$rddb.config.url) {
                throw new Error("no 'host' or 'url' key found in resource '" + $rddb.id + "' config");
            }
            $rddb.rd = require("redis");
            if (typeof $rdCluster === 'undefined') {
                $rdCluster = [];
            }
            $log.debug("resource '" + $rddb.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return $rddb;
        },
        start: function (callback) {
            var timerId = 'resource_cb_start_' + $rddb.id;
            $log.debug("resource '" + $rddb.id + "' : starting", 3);
            var cb = function () {
                $log.debug("resource '" + $rddb.id + "' : started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $rddb.open(cb);
            return $rddb;
        },
        stop: function (callback) {
            $log.debug("Stopping resource '" + $rddb.id + "'", 2);
            if (typeof callback === "function") {
                callback(null, $rddb);
            }
            return $rddb;
        },
        open: function (callback) {
            var timerId = 'redis_open_' + $rddb.id;
            $timer.start(timerId);
            var clusID = $rddb.config.host || $rddb.config.url;
            if (typeof $rdCluster[clusID] === 'undefined') {
                $log.debug("resource '" + $rddb.id + "' : new connection to redis '" + clusID + "'", 4);
                $rdCluster[clusID] = $rddb.rd.createClient($rddb.config);
                callback(null, $rdCluster[clusID]);
            }
            else {
                $log.debug("resource '" + $rddb.id + "' : use existing connection to redis '" + clusID + "'", 4);
                callback(null, $rddb);
            }
            return $rddb;
        },
        get: function (docId, callback) {
            $timer.start('redis_get_' + docId);
            var clusID = $rddb.config.host || $rddb.config.url;
            $log.debug("resource '" + $rddb.id + "' : get key '" + docId + "'", 4);
            return $rdCluster[clusID].get(docId, (callback) ? callback(docId) : $rddb.__getDefaultCallback(docId));
        },
        __getDefaultCallback: function (key) {
            return function (err, results) {
                var duration = $timer.timeStop('redis_get_' + key);
                if (err) {
                    $log.error("resource '" + $rddb.id + "' : get could not be executed because " + err.message, duration);
                }
                else {
                    if (JSON.isParsable(results)) {
                        results = JSON.parse(results);
                    }
                    $log.debug("resource '" + $rddb.id + "' : get returned " + results.length + " results", 3, duration);
                }
            };
        },
        /**
         * Insert a new document into the redis storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        insert: function (key, doc, callback) {
            $timer.start('redis_insert_' + key);
            $log.debug("resource '" + $rddb.id + "' : adding new key '" + key + "'", 4);
            var clusID = $rddb.config.host || $rddb.config.url;
            if (typeof doc === 'object') {
                doc = JSON.stringify(doc);
            }
            $rdCluster[clusID].set(key, doc, (callback) ? callback(key) : $rddb.__insertDefaultCallback(key));
        },
        __insertDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('redis_insert_' + key);
                if (coucherr) {
                    $log.warn("resource '" + $rddb.id + "' : error adding new key '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.debug("resource '" + $rddb.id + "' : new key '" + key + "' added ", 3, duration);
                }
            };
        },
        /**
         * Update a document into the redis storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        update: function (key, doc, callback) {
            $timer.start('redis_update_' + key);
            $log.debug("resource '" + $rddb.id + "' : updating document '" + key + "'", 4);
            var clusID = $rddb.config.host || $rddb.config.url;
            $rdCluster[clusID].set(key, doc, (callback) ? callback(key) : $rddb.__updateDefaultCallback(key));
        },
        __updateDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('redis_update_' + key);
                if (coucherr) {
                    $log.warn("resource '" + $rddb.id + "' : error adding new document '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.debug("resource '" + $rddb.id + "' : document '" + key + "' updated", 3, duration);
                }
            };
        },
        /**
         * delete a document into the redis storage
         * @param {string} key
         * @param {function} callback
         */
        delete: function (key, callback) {
            $timer.start('redis_delete_' + key);
            $log.debug("resource '" + $rddb.id + "' : deleting document '" + key + "'", 4);
            var clusID = $rddb.config.host || $rddb.config.url;
            $rdCluster[clusID].del(key, (callback) ? callback(key) : $rddb.__deleteDefaultCallback(key));
        },
        __deleteDefaultCallback: function (key) {
            return function (coucherr) {
                var duration = $timer.timeStop('redis_delete_' + key);
                if (coucherr) {
                    $log.warn("resource '" + $rddb.id + "' : error deleting key '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.debug("resource '" + $rddb.id + "' : key '" + key + "' deleted", 3, duration);
                }
            };
        },
        endpoints: {
            get: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $rddb.id + ":get() ";
                    $log.debug(message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.warn(message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('redis_get_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.warn(message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        if (JSON.isParsable(reponse)) {
                                            reponse = JSON.parse(reponse);
                                        }
                                        $app.ws.okResponse(res, "return document " + docId, reponse).send();
                                        $log.debug(message_prefix + " return document " + docId, 2, duration);
                                    }
                                };
                            };
                            rs.get(docId, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.warn(message_prefix + message);
                        }
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : ((req.body.id) ? req.body.id : require('uuid').v1());
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $rddb.id + ":create() ";
                    $log.debug(message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.warn(message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('redis_insert_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.warn(message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        $app.ws.okResponse(res, "document " + docId + " recorded", reponse).send();
                                        $log.debug(message_prefix + " create document " + docId, 2, duration);
                                    }
                                };
                            };
                            rs.insert(docId, req.body, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.warn(message_prefix + message);
                        }
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $rddb.id + ":update() ";
                    $log.debug(message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.warn(message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('redis_update_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.warn(message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        $app.ws.okResponse(res, "document " + docId + " updated", reponse.value).send();
                                        $log.debug(message_prefix + " update document " + docId, 2, duration);
                                    }
                                };
                            };
                            rs.update(docId, req.body, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.warn(message_prefix + message);
                        }
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $rddb.id + ":delete() ";
                    $log.debug(message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.warn(message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('redis_delete_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.warn(message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        $app.ws.okResponse(res, "document " + docId + " deleted", reponse).send();
                                        $log.info(message_prefix + " delete document " + docId, 2, duration);
                                    }
                                };
                            };
                            rs.delete(docId, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.warn(message_prefix + message);
                        }
                    }
                };
            }
        }
    };
    $rddb.init(config);
    return $rddb;
};