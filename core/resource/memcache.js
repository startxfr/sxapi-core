/* global module, require, process, $log, $timer, $rdCluster, $rdCluster, $app */
//'use strict';

/**
 * memcache resource handler
 * @module resource/memcache
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
            var timerId = 'resource_memcache_init_' + $rddb.id;
            $timer.start(timerId);
            if (config) {
                $rddb.config = config;
            }
            $log.tools.resourceDebug($rddb.id, "initializing", 3);
            if (!$rddb.config.host) {
                $log.tools.resourceWarn($rddb.id, "no 'host' found in resource '" + $rddb.id + "' config. Using default : 127.0.0.1");
                $rddb.config.host = "127.0.0.1";
            }
            if (!$rddb.config.port) {
                $log.tools.resourceDebug($rddb.id, "no 'port' found in resource '" + $rddb.id + "' config. Using default : 11211",3);
                $rddb.config.port = "11211";
            }
            $rddb.rd = require("memcache");
            if (typeof $rdCluster === 'undefined') {
                $rdCluster = [];
            }
            $log.tools.resourceDebug($rddb.id, "initialized ", 1, $timer.timeStop(timerId));
            return $rddb;
        },
        start: function (callback) {
            var timerId = 'resource_cb_start_' + $rddb.id;
            $log.tools.resourceDebug($rddb.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($rddb.id, "started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $rddb.open(cb);
            return $rddb;
        },
        stop: function (callback) {
            $log.tools.resourceDebug($rddb.id, "Stopping", 2);
            if (typeof callback === "function") {
                callback(null, $rddb);
            }
            return $rddb;
        },
        open: function (callback) {
            var timerId = 'memcache_open_' + $rddb.id;
            $timer.start(timerId);
            var clusID = $rddb.config.host || $rddb.config.port;
            if (typeof $rdCluster[clusID] === 'undefined') {
                $log.tools.resourceDebug($rddb.id, "new connection to memcache '" + clusID + "'", 4);
                $rdCluster[clusID] = $rddb.rd.Client($rddb.config.port,$rddb.config.host);
                $rdCluster[clusID].connect();
                callback(null, $rdCluster[clusID]);
            }
            else {
                $log.tools.resourceDebug($rddb.id, "connected with existing connection to memcache '" + clusID + "'", 4);
                callback(null, $rddb);
            }
            return $rddb;
        },
        get: function (key, callback) {
            $timer.start('memcache_get_' + key);
            var clusID = $rddb.config.host || $rddb.config.port;
            $log.tools.resourceInfo($rddb.id, "get key '" + key + "'");
            return $rdCluster[clusID].get(key, (callback) ? callback(key) : $rddb.__getDefaultCallback(key));
        },
        __getDefaultCallback: function (key) {
            return function (err, results) {
                var duration = $timer.timeStop('memcache_get_' + key);
                if (err) {
                    $log.tools.resourceError($rddb.id, "get could not be executed because " + err.message, duration);
                }
                else {
                    if (JSON.isDeserializable(results)) {
                        results = JSON.parse(results);
                    }
                    $log.tools.resourceDebug($rddb.id, "get returned " + results.length + " results", 3, duration);
                }
            };
        },
        /**
         * Insert a new document into the memcache storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        insert: function (key, doc, callback) {
            $timer.start('memcache_insert_' + key);
            $log.tools.resourceInfo($rddb.id, "adding new key '" + key + "'");
            var clusID = $rddb.config.host || $rddb.config.port;
            if (JSON.isSerializable(doc)) {
                doc = JSON.stringify(doc);
            }
            $rdCluster[clusID].set(key, doc, (callback) ? callback(key) : $rddb.__insertDefaultCallback(key));
        },
        __insertDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('memcache_insert_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($rddb.id, "resource '" + $rddb.id + "' : error adding new key '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($rddb.id, "resource '" + $rddb.id + "' : new key '" + key + "' added ", 3, duration);
                }
            };
        },
        /**
         * Update a document into the memcache storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        update: function (key, doc, callback) {
            $timer.start('memcache_update_' + key);
            $log.tools.resourceInfo($rddb.id, "updating document '" + key + "'");
            var clusID = $rddb.config.host || $rddb.config.port;
            if (JSON.isSerializable(doc)) {
                doc = JSON.stringify(doc);
            }
            $rdCluster[clusID].set(key, doc, (callback) ? callback(key) : $rddb.__updateDefaultCallback(key));
        },
        __updateDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('memcache_update_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($rddb.id, "resource '" + $rddb.id + "' : error adding new document '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($rddb.id, "resource '" + $rddb.id + "' : document '" + key + "' updated", 3, duration);
                }
            };
        },
        /**
         * delete a document into the memcache storage
         * @param {string} key
         * @param {function} callback
         */
        delete: function (key, callback) {
            $timer.start('memcache_delete_' + key);
            $log.tools.resourceInfo($rddb.id, "deleting document '" + key + "'");
            var clusID = $rddb.config.host || $rddb.config.port;
            $rdCluster[clusID].delete(key, (callback) ? callback(key) : $rddb.__deleteDefaultCallback(key));
        },
        __deleteDefaultCallback: function (key) {
            return function (coucherr) {
                var duration = $timer.timeStop('memcache_delete_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($rddb.id, "resource '" + $rddb.id + "' : error deleting key '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($rddb.id, "resource '" + $rddb.id + "' : key '" + key + "' deleted", 3, duration);
                }
            };
        },
        endpoints: {
            get: function (config) {
                return function (req, res) {
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var callback = function (key) {
                        return function (err, reponse) {
                            var duration = $timer.timeStop('memcache_get_' + key);
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $rddb.id, req, "error because " + err.message, duration);
                            }
                            else if (reponse === null) {
                                $log.tools.endpointWarnAndAnswer(res, $rddb.id, req, "could not find key " + docId, duration);
                            }
                            else {
                                if (JSON.isDeserializable(reponse)) {
                                    reponse = JSON.parse(reponse);
                                }
                                $log.tools.endpointDebugAndAnswer(res, reponse, $rddb.id, req, "return document " + docId, 2, duration);
                            }
                        };
                    };
                    $log.tools.endpointDebug($rddb.id, req, "get()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).get(docId, callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $rddb.id, req, config.resource);
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var docId = (req.params.id) ? req.params.id : ((req.body.id) ? req.body.id : require('uuid').v1());
                    var docBody = req.body;
                    $log.tools.endpointDebug($rddb.id, req, "create()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).insert(docId, docBody, function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('memcache_insert_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $rddb.id, req, "error because " + err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $rddb.id, req, "document " + docId + " recorded", 2, duration);
                                }
                            };
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $rddb.id, req, config.resource);
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var docBody = req.body;
                    $log.tools.endpointDebug($rddb.id, req, "update()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).update(docId, docBody, function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('memcache_update_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $rddb.id, req, "error because " + err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse.value, $rddb.id, req, "document " + docId + " updated", 2, duration);
                                }
                            };
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $rddb.id, req, config.resource);
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    $log.tools.endpointDebug($rddb.id, req, "delete()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).delete(docId, function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('memcache_delete_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $rddb.id, req, "error because " + err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $rddb.id, req, "document " + docId + " deleted", 2, duration);
                                }
                            };
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $rddb.id, req, config.resource);
                    }
                };
            }
        }
    };
    $rddb.init(config);
    return $rddb;
};