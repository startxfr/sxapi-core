/* global module, require, process */
//'use strict';

/**
 * couchbase resource handler
 * @module resource-couchbase
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
            if (config) {
                $cbdb.config = config;
            }
            require("./log").debug(
                    "init couchbase resource '" + $cbdb.id + "'", 3);
            if (!$cbdb.config.cluster) {
                throw new Error("no 'cluster' key found in config");
            }
            if (!$cbdb.config.bucket) {
                throw new Error("no 'bucket' key found in config");
            }
            $cbdb.cb = require("couchbase");
            if (typeof $cbCluster === 'undefined') {
                $cbCluster = [];
            }
            if (typeof $cbCluster[$cbdb.config.cluster] === 'undefined') {
                require("./log").debug("new link to couchbase cluster " + $cbdb.config.cluster, 4);
                $cbCluster[$cbdb.config.cluster] = new $cbdb.cb.Cluster($cbdb.config.cluster);
            }
            else {
                require("./log").debug("use previous link to couchbase cluster " + $cbdb.config.cluster, 4);
            }
            return $cbdb;
        },
        start: function (callback) {
            require("./log").debug("start resource-couchbase module", 3);
            $cbdb.open(callback);
            return $cbdb;
        },
        stop: function (callback) {
            require("./log").debug("stop resource-couchbase module", 3);
            if (typeof callback === "function") {
                callback(null, $cbdb);
            }
            return $cbdb;
        },
        open: function (callback) {
            require('./timer').start('open_bucket');
            if (typeof $cbBuckets === 'undefined') {
                $cbBuckets = [];
            }
            if (typeof $cbBuckets[$cbdb.config.bucket] === 'undefined') {
                require("./log").debug("new couchbase connection to bucket " + $cbdb.config.bucket, 4);
                $cbBuckets[$cbdb.config.bucket] = $cbCluster[$cbdb.config.cluster].openBucket($cbdb.config.bucket, $cbdb.__openHandler(callback));
//                $cbBuckets[$cbdb.config.bucket].operationTimeout = 60 * 1000;
            }
            else {
                require("./log").debug(
                        "use previous couchbase connection to bucket "
                        + $cbdb.config.bucket, 4);
                callback(null, $cbdb);
            }
            return $cbdb;
        },
        __openHandler: function (callback) {
            return function (bucketerr) {
                if (bucketerr) {
                    var message = 'EXITING because '
                            + bucketerr.message
                            + ' [' + bucketerr.code + ']';
                    require("./log").error(message);
                    process.exit(5);
                }
                require("./log").debug("couchbase bucket "
                        + $cbdb.config.bucket + " opened", 2,
                        require('./timer').timeStop('open_bucket'));
                if (typeof callback === "function") {
                    callback(null, $cbdb);
                }
            };
        },
        get: function (docId, callback) {
            require("./log").debug("get document " + docId
                    + " from couchbase bucket "
                    + $cbdb.config.bucket, 4);
            return $cbBuckets[$cbdb.config.bucket]
                    .get(docId, (callback) ? callback : $cbdb.__queryDefaultCallback);
        },
        query: function (n1ql, callback) {
            require("./log").debug("query N1QL from couchbase bucket " + $cbdb.config.bucket, 4);
            var N1qlQuery = require('couchbase').N1qlQuery;
            var query = N1qlQuery.fromString(n1ql);
            return $cbBuckets[$cbdb.config.bucket].query(query, (callback) ? callback : $cbdb.__queryDefaultCallback);
        },
        queryFree: function (query, callback) {
            require("./log").debug("query free view " + query.ddoc
                    + ":" + query.name + " from couchbase bucket "
                    + $cbdb.config.bucket, 4);
            return $cbBuckets[$cbdb.config.bucket]
                    .query(query, (callback) ? callback : $cbdb.__queryDefaultCallback);
        },
        __queryDefaultCallback: function (err, results) {
            if (err) {
                require("./log").error('query could not be executed because '+ err.message + ' [' + err.code + ']');
            }
            else {
                require("./log").debug(results);
            }
        },
        /**
         * Insert a new document into the couchbase storage
         * @param {string} key
         * @param {object} doc
         * @param {function} callback
         */
        insert: function (key, doc, callback) {
            require("./timer").start('record_document_' + key);
            var options = ($cbdb.config.insertOptions) ? $cbdb.config.insertOptions : {};
            $cbBuckets[$cbdb.config.bucket].insert(key, doc, options,
                    (callback) ? callback(key) : $cbdb.__insertDefaultCallback(key));
        },
        __insertDefaultCallback: function (key) {
            return function (coucherr, doc) {
                if (coucherr) {
                    require("./log").warn("error saving new document "
                            + key + ' because ' + coucherr.message
                            + ' [' + coucherr.code + ']',
                            require("./timer").timeStop('record_document_' + key));
                }
                else {
                    require("./log").debug("saved new document "
                            + key + " in couchbase bucket "
                            + $cbdb.config.bucket, 4,
                            require("./timer").timeStop('record_document_' + key));
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
            require("./timer").start('update_document_' + key);
            var options = ($cbdb.config.updateOptions) ?
                    $cbdb.config.updateOptions :
                    {};
            $cbBuckets[$cbdb.config.bucket].replace(key,
                    doc,
                    options,
                    (callback) ?
                    callback(key) :
                    $cbdb.__updateDefaultCallback(key));
        },
        __updateDefaultCallback: function (key) {
            return function (coucherr, doc) {
                if (coucherr) {
                    require("./log").warn(
                            "error updating document " + key
                            + ' because ' + coucherr.message
                            + ' [' + coucherr.code + ']',
                            require("./timer").timeStop('update_document_' + key));
                }
                else {
                    require("./log").debug("saved document "
                            + key + " in couchbase bucket "
                            + $cbdb.config.bucket, 4,
                            require("./timer").timeStop('update_document_' + key));
                }
            };
        },
        /**
         * delete a document into the couchbase storage
         * @param {string} key
         * @param {function} callback
         */
        delete: function (key, callback) {
            require("./timer").start('delete_document_' + key);
            var options = ($cbdb.config.deleteOptions) ?
                    $cbdb.config.deleteOptions :
                    {};
            $cbBuckets[$cbdb.config.bucket].remove(key,
                    options,
                    (callback) ?
                    callback(key) :
                    $cbdb.__deleteDefaultCallback(key));
        },
        __deleteDefaultCallback: function (key) {
            return function (coucherr) {
                if (coucherr) {
                    require("./log").warn(
                            "error deleting document " + key
                            + ' because ' + coucherr.message
                            + ' [' + coucherr.code + ']',
                            require("./timer").timeStop('delete_document_' + key));
                }
                else {
                    require("./log").debug("document "
                            + key + " deleted in couchbase bucket "
                            + $cbdb.config.bucket, 4,
                            require("./timer").timeStop('delete_document_' + key));
                }
            };
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
                            rs.query(config.n1ql, function (err, reponse) {
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
                    var docId = (req.params.id) ? req.params.id : ((req.body.id) ? req.body.id : require('uuid').v1());
                    require("./log").debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        require("./ws").nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        require("./log").warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.insert(docId, req.body, function (key) {
                                return function (err, reponse) {
                                    if (err) {
                                        require("./ws").nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        require("./log").warn(message_prefix + "error saving document because " + err.message);
                                    }
                                    else {
                                        require("./ws").okResponse(res, "document "+docId+" recorded", reponse).send();
                                        require("./log").info(message_prefix + "document " + docId);
                                    }
                                };
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
                            rs.update(docId, req.body, function (key) {
                                return function (err, reponse) {
                                    if (err) {
                                        require("./ws").nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        require("./log").warn(message_prefix + "error updating document because " + err.message);
                                    }
                                    else {
                                        require("./ws").okResponse(res, "document "+docId+" updated", reponse.value).send();
                                        require("./log").info(message_prefix + "document " + docId);
                                    }
                                };
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
                            rs.delete(docId, function (key) {
                                return function (err, reponse) {
                                    if (err) {
                                        require("./ws").nokResponse(res, "error because " + err.message).httpCode(500).send();
                                        require("./log").warn(message_prefix + "error deleting document because " + err.message);
                                    }
                                    else {
                                        require("./ws").okResponse(res, "document "+docId+" deleted", reponse).send();
                                        require("./log").info(message_prefix + "document " + docId);
                                    }
                                };
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
    $cbdb.init(config);
    return $cbdb;
};