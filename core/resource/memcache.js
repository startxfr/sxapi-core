/* global module, require, process, $log, $timer, $mcdb.pool, $mcdb.pool, $app */
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
    var $mcdb = {
        id: id,
        pool: [],
        config: {},
        init: function (config) {
            var timerId = 'resource_memcache_init_' + $mcdb.id;
            $timer.start(timerId);
            if (config) {
                $mcdb.config = config;
            }
            $log.tools.resourceDebug($mcdb.id, "initializing", 3);
            if (!$mcdb.config.host) {
                $log.tools.resourceWarn($mcdb.id, "no 'host' found in resource '" + $mcdb.id + "' config. Using default : 127.0.0.1");
                $mcdb.config.host = "127.0.0.1";
            }
            if (!$mcdb.config.port) {
                $log.tools.resourceDebug($mcdb.id, "no 'port' found in resource '" + $mcdb.id + "' config. Using default : 11211", 3);
                $mcdb.config.port = 11211;
            }
            $log.tools.resourceDebug($mcdb.id, "initialized ", 1, $timer.timeStop(timerId));
            return $mcdb;
        },
        start: function (callback) {
            var timerId = 'resource_cb_start_' + $mcdb.id;
            var clusID = $mcdb.config.host || $mcdb.config.port;
            $log.tools.resourceDebug($mcdb.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($mcdb.id, "started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            var mc = require('memcache');
            $log.tools.resourceDebug($mcdb.id, "starting new connection to memcache '" + clusID + "'", 4);
            $mcdb.pool[clusID] = new mc.Client($mcdb.config.port, $mcdb.config.host);
            $mcdb.open(cb);
            return $mcdb;
        },
        stop: function (callback) {
            $log.tools.resourceDebug($mcdb.id, "Stopping", 2);
            if (typeof callback === "function") {
                callback(null, $mcdb);
            }
            return $mcdb;
        },
        open: function (callback) {
            var timerId = 'memcache_open_' + $mcdb.id;
            $timer.start(timerId);
            var clusID = $mcdb.config.host || $mcdb.config.port;
            if (typeof $mcdb.pool[clusID] === 'undefined') {
                $log.tools.resourceDebug($mcdb.id, "open new connection to memcache '" + clusID + "'", 4);
                $mcdb.pool[clusID].connect();
                callback(null, $mcdb.pool[clusID]);
            }
            else {
                $log.tools.resourceDebug($mcdb.id, "connected with existing connection to memcache '" + clusID + "'", 4);
                callback(null, $mcdb);
            }
            return $mcdb;
        },
        get: function (key, callback) {
            $timer.start('memcache_get_' + key);
            var clusID = $mcdb.config.host || $mcdb.config.port;
            $log.tools.resourceInfo($mcdb.id, "get key '" + key + "'");
            return $mcdb.pool[clusID].get(key, (callback) ? callback(key) : $mcdb.__getDefaultCallback(key));
        },
        __getDefaultCallback: function (key) {
            return function (err, results) {
                var duration = $timer.timeStop('memcache_get_' + key);
                if (err) {
                    $log.tools.resourceError($mcdb.id, "get could not be executed because " + err.message, duration);
                }
                else {
                    if (JSON.isDeserializable(results)) {
                        results = JSON.parse(results);
                    }
                    $log.tools.resourceDebug($mcdb.id, "get returned " + results.length + " results", 3, duration);
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
            $log.tools.resourceInfo($mcdb.id, "adding new key '" + key + "'");
            var clusID = $mcdb.config.host || $mcdb.config.port;
            if (JSON.isSerializable(doc)) {
                doc = JSON.stringify(doc);
            }
            $mcdb.pool[clusID].set(key, doc, (callback) ? callback(key) : $mcdb.__insertDefaultCallback(key));
        },
        __insertDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('memcache_insert_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($mcdb.id, "resource '" + $mcdb.id + "' : error adding new key '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($mcdb.id, "resource '" + $mcdb.id + "' : new key '" + key + "' added ", 3, duration);
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
            $log.tools.resourceInfo($mcdb.id, "updating document '" + key + "'");
            var clusID = $mcdb.config.host || $mcdb.config.port;
            if (JSON.isSerializable(doc)) {
                doc = JSON.stringify(doc);
            }
            $mcdb.pool[clusID].set(key, doc, (callback) ? callback(key) : $mcdb.__updateDefaultCallback(key));
        },
        __updateDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('memcache_update_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($mcdb.id, "resource '" + $mcdb.id + "' : error adding new document '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($mcdb.id, "resource '" + $mcdb.id + "' : document '" + key + "' updated", 3, duration);
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
            $log.tools.resourceInfo($mcdb.id, "deleting document '" + key + "'");
            var clusID = $mcdb.config.host || $mcdb.config.port;
            $mcdb.pool[clusID].delete(key, (callback) ? callback(key) : $mcdb.__deleteDefaultCallback(key));
        },
        __deleteDefaultCallback: function (key) {
            return function (coucherr) {
                var duration = $timer.timeStop('memcache_delete_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($mcdb.id, "resource '" + $mcdb.id + "' : error deleting key '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($mcdb.id, "resource '" + $mcdb.id + "' : key '" + key + "' deleted", 3, duration);
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
                                $log.tools.endpointErrorAndAnswer(res, $mcdb.id, req, "error because " + err.message, duration);
                            }
                            else if (reponse === null) {
                                $log.tools.endpointWarnAndAnswer(res, $mcdb.id, req, "could not find key " + docId, duration);
                            }
                            else {
                                if (JSON.isDeserializable(reponse)) {
                                    reponse = JSON.parse(reponse);
                                }
                                $log.tools.endpointDebugAndAnswer(res, reponse, $mcdb.id, req, "return document " + docId, 2, duration);
                            }
                        };
                    };
                    $log.tools.endpointDebug($mcdb.id, req, "get()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).get(docId, callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $mcdb.id, req, config.resource);
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var docId = (req.params.id) ? req.params.id : ((req.body.id) ? req.body.id : require('uuid').v1());
                    var docBody = req.body;
                    $log.tools.endpointDebug($mcdb.id, req, "create()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).insert(docId, docBody, function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('memcache_insert_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $mcdb.id, req, "error because " + err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $mcdb.id, req, "document " + docId + " recorded", 2, duration);
                                }
                            };
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $mcdb.id, req, config.resource);
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var docBody = req.body;
                    $log.tools.endpointDebug($mcdb.id, req, "update()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).update(docId, docBody, function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('memcache_update_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $mcdb.id, req, "error because " + err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse.value, $mcdb.id, req, "document " + docId + " updated", 2, duration);
                                }
                            };
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $mcdb.id, req, config.resource);
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    $log.tools.endpointDebug($mcdb.id, req, "delete()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).delete(docId, function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('memcache_delete_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $mcdb.id, req, "error because " + err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $mcdb.id, req, "document " + docId + " deleted", 2, duration);
                                }
                            };
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $mcdb.id, req, config.resource);
                    }
                };
            }
        }
    };
    $mcdb.init(config);
    return $mcdb;
};