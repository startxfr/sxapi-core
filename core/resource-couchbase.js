/* global module, require, process */
//'use strict';

/**
 * couchbase resource handler
 * @module resource-couchbase
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type $log
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
                require("./log").debug(
                        "new link to couchbase cluster "
                        + $cbdb.config.cluster, 4);
                $cbCluster[$cbdb.config.cluster] =
                        new $cbdb.cb.Cluster($cbdb.config.cluster);
            }
            else {
                require("./log").debug(
                        "use previous link to couchbase cluster "
                        + $cbdb.config.cluster, 4);
            }
            return $cbdb;
        },
        start: function (callback) {
            require("./log").debug(
                    "start resource-couchbase module", 3);
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
                require("./log").debug(
                        "new couchbase connection to bucket "
                        + $cbdb.config.bucket, 4);
                $cbBuckets[$cbdb.config.bucket] =
                        $cbCluster[$cbdb.config.cluster]
                        .openBucket($cbdb.config.bucket, $cbdb.__openHandler(callback));
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
        query: function (design, view, callback) {
            require("./log").debug("query view " + design
                    + ":" + view + " from couchbase bucket "
                    + $cbdb.config.bucket, 4);
            var query = $cbdb.cb.ViewQuery.from(design, view);
            return $cbBuckets[$cbdb.config.bucket]
                    .query(query, (callback) ? callback : $cbdb.__queryDefaultCallback);
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
                require("./log").error(
                        'query could not be executed because '
                        + err.message + ' [' + err.code + ']');
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
        }
    };
    $cbdb.init(config);
    return $cbdb;
};