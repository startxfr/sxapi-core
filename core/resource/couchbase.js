/* global module, require, process, $log, $timer, $cbdb.pool, $cbBuckets, $app */
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
        pool: [],
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
            if (typeof $cbdb.pool[$cbdb.config.cluster] === 'undefined') {
                $log.tools.resourceDebug($cbdb.id, "open new connection to cluster " + $cbdb.config.cluster, 4);
                $cbdb.pool[$cbdb.config.cluster] = new $cbdb.cb.Cluster($cbdb.config.cluster);
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
                $log.tools.resourceDebug($cbdb.id, "use bucket '" + $cbdb.config.bucket + "'", 4);
                if (typeof $cbdb.config.user !== 'undefined' && typeof $cbdb.config.password !== 'undefined') {
                    $cbdb.pool[$cbdb.config.cluster].authenticate($cbdb.config.user, $cbdb.config.password);
                }
                $cbBuckets[$cbdb.config.bucket] = $cbdb.pool[$cbdb.config.cluster].openBucket($cbdb.config.bucket, $cbdb.__openHandler(callback, timerId));

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
            list: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($cbdb.id, req, "list()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var params = $cbdb.tools.generateParams4Template(config, req);
                        var n1ql = $cbdb.tools.format(config.n1ql, params);
                        var callback = function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('couchbase_query_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $cbdb.id, req, err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $cbdb.id, req, "returned " + reponse.length + ' items', 2, duration);
                                }
                            };
                        };
                        rs.query(n1ql, callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $cbdb.id, req, config.resource);
                    }
                };
            },
            get: function (config) {
                return function (req, res) {
                    var kid = (config.keyParam) ? config.keyParam : 'id';
                    var docId = (req.params[kid]) ? req.params[kid] : req.body[kid];
                    docId = (config.docPrefix) ? config.docPrefix + docId : docId;
                    $log.tools.endpointDebug($cbdb.id, req, "get()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var callback = function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('couchbase_get_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $cbdb.id, req, err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $cbdb.id, req, "return document " + docId, 2, duration);
                                }
                            };
                        };
                        rs.get(docId, callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $cbdb.id, req, config.resource);
                    }
                };
            },
            create: function (config) {
                return function (req, res) {
                    var kid = (config.keyParam) ? config.keyParam : 'id';
                    var docId = (req.params[kid]) ? req.params[kid] : ((req.body[kid]) ? req.body[kid] : require('uuid').v1());
                    docId = (config.docPrefix) ? config.docPrefix + docId : docId;
                    $log.tools.endpointDebug($cbdb.id, req, "create()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var callback = function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('couchbase_insert_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $cbdb.id, req, err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $cbdb.id, req, "document " + docId + " created", 2, duration);
                                }
                            };
                        };
                        rs.insert(docId, req.body, callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $cbdb.id, req, config.resource);
                    }
                };
            },
            update: function (config) {
                return function (req, res) {
                    var kid = (config.keyParam) ? config.keyParam : 'id';
                    var docId = (req.params[kid]) ? req.params[kid] : req.body[kid];
                    docId = (config.docPrefix) ? config.docPrefix + docId : docId;
                    $log.tools.endpointDebug($cbdb.id, req, "update()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var callback = function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('couchbase_update_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $cbdb.id, req, err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $cbdb.id, req, "document " + docId + " updated", 2, duration);
                                }
                            };
                        };
                        rs.update(docId, req.body, callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $cbdb.id, req, config.resource);
                    }
                };
            },
            delete: function (config) {
                return function (req, res) {
                    var kid = (config.keyParam) ? config.keyParam : 'id';
                    var docId = (req.params[kid]) ? req.params[kid] : req.body[kid];
                    docId = (config.docPrefix) ? config.docPrefix + docId : docId;
                    $log.tools.endpointDebug($cbdb.id, req, "delete()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var callback = function (key) {
                            return function (err, reponse) {
                                var duration = $timer.timeStop('couchbase_delete_' + key);
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $cbdb.id, req, err.message, duration);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $cbdb.id, req, "document " + docId + " deleted", 2, duration);
                                }
                            };
                        };
                        rs.delete(docId, callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $cbdb.id, req, config.resource);
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
            format: $log.format
        }
    };
    $cbdb.init(config);
    return $cbdb;
};