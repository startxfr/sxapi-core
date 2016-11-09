/* global module, require, process */
//'use strict';

/**
 * Adding colored prefix for console output
 * @param {type} pair
 */
[
    ['info', '\x1b[34m'],
    ['warn', '\x1b[33m'],
    ['error', '\x1b[41m'],
    ['log', '\x1b[30m']
].forEach(function (pair) {
    var method = pair[0],reset = '\x1b[0m',color = '\x1b[36m' + pair[1];
    console[method] = console[method].bind(console,color,method.toUpperCase(),reset);
});

/**
 * Log manager
 * @module log
 * @constructor
 * @type $log
 */
var $log = {
    config: {},
    isDebug: false,
    booted: false,
    /**
     * Initialise log according to the log section in sxapi.json. 
     * @param {type} config
     * @param {type} isDebug
     * @returns {log}
     */
    init: function (config, isDebug) {
        this.isDebug = (isDebug) ? true : false;
        if (config) {
            this.config = config;
        }
        if (this.config.filters) {
            if (typeof this.config.filters.type === "string") {
                this.config.filters.type = this.config.filters.type.split(",");
            }
            if (typeof this.config.filters.level === "string") {
                this.config.filters.level = this.config.filters.level.split(",");
            }
        }
        if (this.booted === false) {
            this.booted = true;
        }
        else {
            this.debug("Init core module : sxapi-core-log core", 2);
        }
        if (this.config.sqs) {
            this.sqs.init();
        }
        if (this.config.couchbase) {
            this.couchbase.init();
        }
        return this;
    },
    /**
     * Log a debug trace
     * @param {string} a debug trace
     * @param {integer} b level of this debug trace
     * @param {integer} duration duration of this action
     * @param {boolean} cancelBackend cancel log beeing send to backend record
     * @returns {$log}
     */
    debug: function (a, b, duration, cancelBackend) {
        var level = parseInt(b);
        var ident = (level > 0) ? Array(level).join("  ") + "- " : "- ";
        var dur = "";
        if (duration !== null && duration !== undefined) {
            dur += "  (" + duration + "ms)";
        }
        if (this.isDebug && !this.isExcluded("debug", level)) {
            console.log(ident + a + dur);
        }
        if (this.sqs.isActive && !this.isExcluded("debug", level) && cancelBackend !== true) {
            this.sqs.log(a, duration);
        }
        if (this.couchbase.isActive && !this.isExcluded("debug", level) && cancelBackend !== true) {
            this.couchbase.log(a, duration);
        }
        return this;
    },
    /**
     * Log a info trace
     * @param {string} a info trace
     * @param {integer} duration duration of this action
     * @param {boolean} cancelBackend cancel log beeing send to backend record
     * @returns {$log}
     */
    info: function (a, duration, cancelBackend) {
        var dur = "";
        if (duration !== null && duration !== undefined) {
            dur += "  (" + duration + "ms)";
        }
        if (!this.isExcluded("info", 0)) {
            console.info(a + dur);
        }
        if (this.sqs.isActive && !this.isExcluded('info', 0) && cancelBackend !== true) {
            this.sqs.log(a, duration, 'info');
        }
        if (this.couchbase.isActive && !this.isExcluded('info', 0) && cancelBackend !== true) {
            this.couchbase.log(a, duration, 'info');
        }
        return this;
    },
    /**
     * Log a warn trace
     * @param {string} a warn trace
     * @param {integer} duration duration of this action
     * @param {boolean} cancelBackend cancel log beeing send to backend record
     * @returns {$log}
     */
    warn: function (a, duration, cancelBackend) {
        var dur = "";
        if (duration !== null && duration !== undefined) {
            dur += "  (" + duration + "ms)";
        }
        if (!this.isExcluded("warn", 0)) {
            console.warn(a + dur);
        }
        if (this.sqs.isActive && !this.isExcluded('warn', 0) && cancelBackend !== true) {
            this.sqs.log(a, duration, 'warn');
        }
        if (this.couchbase.isActive && !this.isExcluded('warn', 0) && cancelBackend !== true) {
            this.couchbase.log(a, duration, 'warn');
        }
        return this;
    },
    /**
     * Log an error trace
     * @param {string} a error trace
     * @param {integer} duration duration of this action
     * @param {boolean} cancelBackend cancel log beeing send to backend record
     * @returns {$log}
     */
    error: function (a, duration, cancelBackend) {
        var dur = "";
        if (duration !== null && duration !== undefined) {
            dur += "  (" + duration + "ms)";
        }
        if (!this.isExcluded("error", 0)) {
            console.error(a + dur);
        }
        if (this.sqs.isActive && !this.isExcluded('error', 0) && cancelBackend !== true) {
            this.sqs.log(a, duration, 'error');
        }
        if (this.couchbase.isActive && !this.isExcluded('error', 0) && cancelBackend !== true) {
            this.couchbase.log(a, duration, 'error');
        }
        return this;
    },
    /**
     * test if type and level of a message allow him to be 
     * processed according to filter's defined in config
     * @param {string} type type of log trace (debug,info,warn,error)
     * @param {integer} level of this debug trace
     * @returns {boolean}
     */
    isExcluded: function (type, level) {
        if (this.config.filters) {
            var typeIsOk = true;
            var levelIsOk = true;
            if (this.config.filters.type) {
                typeIsOk = false;
                for (var i in this.config.filters.type) {
                    var t = this.config.filters.type[i];
                    if (t === type) {
                        typeIsOk = true;
                    }
                }
            }
            if (this.config.filters.level) {
                levelIsOk = false;
                for (var i in this.config.filters.level) {
                    var l = parseInt(this.config.filters.level[i]);
                    if (l === level) {
                        levelIsOk = true;
                    }
                }
            }
            if (levelIsOk && typeIsOk) {
                return false;
            }
            return true;
        }
        return false;
    },
    sqs: {
        isActive: false,
        /**
         * Initialise SQS queue using the $log.sqs section in sxapi.json. 
         * @returns {$log.sqs}
         */
        init: function () {
            $log.debug("adding sqs log backend", 3);
            var conf = $log.config.sqs;
            if (!conf.resource) {
                throw new Error("no 'resource' key found in log config 'sqs'");
            }
            if (!require('./resource').exist(conf.resource)) {
                throw new Error("resource '" + conf.resource + "' in log config 'sqs' doesn't exist");
            }
            this.resource = require('./resource').get(conf.resource);
            this.isActive = true;
            return this;
        },
        /**
         * Add a message in the SQS queue
         * @param {string} logmessage
         * @param {integer} duration duration of this action
         * @param {string} t
         * @returns {$log.sqs}
         */
        log: function (logmessage, duration, t) {
            var type = (t) ? t : 'debug';
            var message = {
                apptype: $log.config.apptype,
                type: type,
                message: logmessage,
                time: Date.now(),
                server: $log.config.appsign
            };
            if (duration !== null && duration !== undefined) {
                message.duration = parseInt(duration);
            }
            $log.sqs.resource.sendMessage(message, function (err) {
                if (err) {
                    $log.warn("error saving log  because "  + err.message, null, true);
                }
            });
            return this;
        }
    },
    couchbase: {
        isActive: false,
        /**
         * Initialise SQS queue using the $log.couchbase section in sxapi.json. 
         * @returns {$log.couchbase}
         */
        init: function () {
            $log.debug("adding couchbase log backend", 3, null, true);
            var conf = $log.config.couchbase;
            if (!conf.resource) {
                throw new Error("no 'resource' key found" + " in log config 'couchbase'");
            }
            if (!require('./resource').exist(conf.resource)) {
                throw new Error("resource '" + conf.resource + "' in log config 'couchbase' doesn't exist");
            }
            $log.couchbase.resource = require('./resource').get(conf.resource);
            $log.couchbase.isActive = true;
            return this;
        },
        /**
         * Add a message in the SQS queue
         * @param {string} logmessage
         * @param {integer} duration duration of this action
         * @param {string} t
         * @returns {$log.couchbase}
         */
        log: function (logmessage, duration, t) {
            var type = (t) ? t : 'debug';
            var doc = {
                apptype: $log.config.apptype,
                type: type,
                message: logmessage,
                time: Date.now(),
                server: $log.config.appsign
            };
            if (duration !== null && duration !== undefined) {
                doc.duration = parseInt(duration);
            }
            var key = require('uuid').v4();
            $log.couchbase.resource.insert(key, doc, function (key) {
                return function (coucherr, b) {
                    if (coucherr) {
                        console.warn(doc);
                        $log.warn("error saving log " + key + ' because ' + coucherr.message, null, true);
                    }
                };
            });
            return this;
        }
    }
};

module.exports = $log;