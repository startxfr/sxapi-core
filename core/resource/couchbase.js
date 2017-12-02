/* global module, require, process, $log, $timer, $cbCluster, $cbBuckets, $app */
//'use strict';

/**
 * couchbase resource handler
 * @module resource/couchbase
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $cbdb = {
        id: id,
        config: {},
        init: function (config) {
            var timerId = 'resource_couchbase_init_' + $cbdb.id;
            $timer.start(timerId);
            if (config) {
                $cbdb.config = config;
            }
            $log.tools.resourceDebug($cbdb.id, "initializing", 3);
            if (!$cbdb.config.cluster) {
                throw new Error("no 'cluster' key found in resource '" + $cbdb.id + "' config");
            }
            if (!$cbdb.config.bucket) {
                throw new Error("no 'bucket' key found in resource '" + $cbdb.id + "' config");
            }
            $cbdb.cb = require("couchbase");
            if (typeof $cbCluster === 'undefined') {
                $cbCluster = [];
            }
            if (typeof $cbCluster[$cbdb.config.cluster] === 'undefined') {
                $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : new connection to cluster " + $cbdb.config.cluster, 4);
                $cbCluster[$cbdb.config.cluster] = new $cbdb.cb.Cluster($cbdb.config.cluster);
            }
            else {
                $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : use existing connection to cluster " + $cbdb.config.cluster, 4);
            }
            $log.tools.resourceDebug($cbdb.id, "initialized ", 1, $timer.timeStop(timerId));
            return $cbdb;
        },
        start: function (callback) {
            var timerId = 'resource_cb_start_' + $cbdb.id;
            $log.tools.resourceDebug($cbdb.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($cbdb.id, "started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $cbdb.open(cb);
            return $cbdb;
        },
        stop: function (callback) {
            $log.tools.resourceDebug($cbdb.id, "Stopping", 2);
            if (typeof callback === "function") {
                callback(null, $cbdb);
            }
            return $cbdb;
        },
        open: function (callback) {
            var timerId = 'couchbase_open_' + $cbdb.id;
            $timer.start(timerId);
            if (typeof $cbBuckets === 'undefined') {
                $cbBuckets = [];
            }
            if (typeof $cbBuckets[$cbdb.config.bucket] === 'undefined') {
                $log.tools.resourceDebug($cbdb.id, "new connection to bucket '" + $cbdb.config.bucket + "'", 4);
                if (typeof $cbdb.config.password === 'undefined') {
                    $cbBuckets[$cbdb.config.bucket] = $cbCluster[$cbdb.config.cluster].openBucket($cbdb.config.bucket, $cbdb.config.password, $cbdb.__openHandler(callback, timerId));
                }
                else {
                    $cbBuckets[$cbdb.config.bucket] = $cbCluster[$cbdb.config.cluster].openBucket($cbdb.config.bucket, $cbdb.__openHandler(callback, timerId));
                }
            }
            else {
                $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : use existing connection to bucket '" + $cbdb.config.bucket + "'", 4);
                callback(null, $cbdb);
            }
            return $cbdb;
        },
        __openHandler: function (callback, timerId) {
            return function (bucketerr) {
                var duration = $timer.timeStop(timerId);
                if (bucketerr) {
                    $log.tools.resourceError($cbdb.id, "failed opening bucket '" + $cbdb.config.bucket + "' because " + bucketerr.message, duration);
                    process.quit(5);
                }
                $log.tools.resourceDebug($cbdb.id, "connected to bucket '" + $cbdb.config.bucket + "'", 4, duration);
                if (typeof callback === "function") {
                    callback(null, $cbdb);
                }
            };
        },
        get: function (docId, callback) {
            $timer.start('couchbase_get_' + docId);
            $log.tools.resourceInfo($cbdb.id, "get document '" + docId + "'");
            return $cbBuckets[$cbdb.config.bucket].get(docId, (callback) ? callback(docId) : $cbdb.__getDefaultCallback(docId));
        },
        __getDefaultCallback: function (key) {
            return function (err, results) {
                var duration = $timer.timeStop('couchbase_get_' + key);
                if (err) {
                    $log.tools.resourceError("get could not be executed because " + err.message, duration);
                }
                else {
                    $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : get returned " + results.length + " results", 3, duration);
                }
            };
        },
        query: function (n1ql, callback) {
            $timer.start('couchbase_query_' + n1ql);
            $log.tools.resourceInfo($cbdb.id, "exec n1ql " + n1ql);
            var N1qlQuery = require('couchbase').N1qlQuery;
            var query = N1qlQuery.fromString(n1ql);
            return $cbBuckets[$cbdb.config.bucket].query(query, (callback) ? callback(n1ql) : $cbdb.__queryDefaultCallback(n1ql));
        },
        queryFree: function (query, callback) {
            var queryid = query.ddoc + ":" + query.name;
            $timer.start('couchbase_query_' + queryid);
            $log.tools.resourceInfo($cbdb.id, "query view " + queryid);
            return $cbBuckets[$cbdb.config.bucket].query(query, (callback) ? callback(queryid) : $cbdb.__queryDefaultCallback(queryid));
        },
        __queryDefaultCallback: function (key) {
            return function (err, results) {
                var duration = $timer.timeStop('couchbase_query_' + key);
                if (err) {
                    $log.tools.resourceError("query could not be executed because " + err.message, duration);
                }
                else {
                    $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : query returned " + results.length + " results", 3, duration);
                }
            };
        },
        /**
         * Insert a new document into the couchbase storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        insert: function (key, doc, callback) {
            $timer.start('couchbase_insert_' + key);
            $log.tools.resourceInfo($cbdb.id, "adding new document '" + key + "'");
            var options = ($cbdb.config.insertOptions) ? $cbdb.config.insertOptions : {};
            $cbBuckets[$cbdb.config.bucket].insert(key, doc, options, (callback) ? callback(key) : $cbdb.__insertDefaultCallback(key));
        },
        __insertDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('couchbase_insert_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($cbdb.id, "resource '" + $cbdb.id + "' : error adding new document '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : new document '" + key + "' added ", 3, duration);
                }
            };
        },
        /**
         * Update a document into the couchbase storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        update: function (key, doc, callback) {
            $timer.start('couchbase_update_' + key);
            $log.tools.resourceInfo($cbdb.id, "updating document '" + key + "'");
            var options = ($cbdb.config.updateOptions) ? $cbdb.config.updateOptions : {};
            $cbBuckets[$cbdb.config.bucket].replace(key, doc, options, (callback) ? callback(key) : $cbdb.__updateDefaultCallback(key));
        },
        __updateDefaultCallback: function (key) {
            return function (coucherr, doc) {
                var duration = $timer.timeStop('couchbase_update_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($cbdb.id, "resource '" + $cbdb.id + "' : error adding new document '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : document '" + key + "' updated", 3, duration);
                }
            };
        },
        /**
         * delete a document into the couchbase storage
         * @param {string} key
         * @param {function} callback
         */
        delete: function (key, callback) {
            $timer.start('couchbase_delete_' + key);
            $log.tools.resourceInfo($cbdb.id, "deleting document '" + key + "'");
            var options = ($cbdb.config.deleteOptions) ? $cbdb.config.deleteOptions : {};
            $cbBuckets[$cbdb.config.bucket].remove(key, options, (callback) ? callback(key) : $cbdb.__deleteDefaultCallback(key));
        },
        __deleteDefaultCallback: function (key) {
            return function (coucherr) {
                var duration = $timer.timeStop('couchbase_delete_' + key);
                if (coucherr) {
                    $log.tools.resourceWarn($cbdb.id, "resource '" + $cbdb.id + "' : error deleting document '" + key + "' because " + coucherr.message, duration);
                }
                else {
                    $log.tools.resourceDebug($cbdb.id, "resource '" + $cbdb.id + "' : document '" + key + "' deleted", 3, duration);
                }
            };
        },
        endpoints: {
            test: function () {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $cbdb.id + ":test() ";
                    $log.tools.endpointDebug($cbdb.id, req, message_prefix + "start", 4);
                    $app.ws.okResponse(res, "test message ").send();
                    $log.tools.endpointDebug($cbdb.id, req, message_prefix + " return test response", 2);
                };
            },
            list: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $cbdb.id + ":list() ";
                    $log.tools.endpointDebug($cbdb.id, req, message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('couchbase_query_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, message_prefix + "error because " + err.message).httpCode(500).send();
                                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        $app.ws.okResponse(res, "returned " + reponse.length + ' items', reponse).addTotal(reponse.length).send();
                                        $log.tools.endpointDebug($cbdb.id, req, message_prefix + " return list of " + reponse.length + " items", 2, duration);
                                    }
                                };
                            };
                            rs.query(config.n1ql, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.tools.endpointWarn($cbdb.id, req, message_prefix + message);
                        }
                    }
                };
            },
            get: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $cbdb.id + ":get() ";
                    $log.tools.endpointDebug($cbdb.id, req, message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('couchbase_get_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        $app.ws.okResponse(res, "return document " + docId, reponse).send();
                                        $log.tools.endpointDebug($cbdb.id, req, message_prefix + " return document " + docId, 2, duration);
                                    }
                                };
                            };
                            rs.get(docId, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.tools.endpointWarn($cbdb.id, req, message_prefix + message);
                        }
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : ((req.body.id) ? req.body.id : require('uuid').v1());
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $cbdb.id + ":create() ";
                    $log.tools.endpointDebug($cbdb.id, req, message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('couchbase_insert_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        $app.ws.okResponse(res, "document " + docId + " recorded", reponse).send();
                                        $log.tools.endpointDebug($cbdb.id, req, message_prefix + " create document " + docId, 2, duration);
                                    }
                                };
                            };
                            rs.insert(docId, req.body, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.tools.endpointWarn($cbdb.id, req, message_prefix + message);
                        }
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $cbdb.id + ":update() ";
                    $log.tools.endpointDebug($cbdb.id, req, message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('couchbase_update_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + "error because " + err.message, duration);
                                    }
                                    else {
                                        $app.ws.okResponse(res, "document " + docId + " updated", reponse.value).send();
                                        $log.tools.endpointDebug($cbdb.id, req, message_prefix + " update document " + docId, 2, duration);
                                    }
                                };
                            };
                            rs.update(docId, req.body, callback);
                        }
                        else {
                            var message = "resource '" + config.resource + "' doesn't exist";
                            $app.ws.nokResponse(res, message).httpCode(500).send();
                            $log.tools.endpointWarn($cbdb.id, req, message_prefix + message);
                        }
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var docId = (req.params.id) ? req.params.id : req.body.id;
                    var message_prefix = "Endpoint " + req.method + " " + path + " > " + $cbdb.id + ":delete() ";
                    $log.tools.endpointDebug($cbdb.id, req, message_prefix + "start", 4);
                    if (!config.resource) {
                        var message = "resource is not defined for this endpoint";
                        $app.ws.nokResponse(res, message).httpCode(500).send();
                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + " " + message);
                    }
                    else {
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            var callback = function (key) {
                                return function (err, reponse) {
                                    var duration = $timer.timeStop('couchbase_delete_' + key);
                                    if (err) {
                                        $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        $log.tools.endpointWarn($cbdb.id, req, message_prefix + "error because " + err.message, duration);
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
                            $log.tools.endpointWarn($cbdb.id, req, message_prefix + message);
                        }
                    }
                };
            }
        }
    };
    $cbdb.init(config);
    return $cbdb;
};