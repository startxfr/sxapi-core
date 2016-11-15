/* global module, require, process, $log, $timer */
//'use strict';


/**
 * Log manager
 * @module log
 * @constructor
 * @type $session
 */

var $sess = {
    config: {},
    /**
     * Initialise log according to the log section in sxapi.json. 
     * @param {type} config
     * @returns {log}
     */
    init: function (config) {
        if (config) {
            this.config = config;
        }
        $log.debug("Init core module : sxapi-core-session", 4);
        if (this.config !== false && this.config !== undefined && this.config !== null && this.config !== 0) {
            if (!this.config.transport) {
                throw new Error("no 'transport' key found in config 'session' section");
            }
            if (!this.config.backend) {
                throw new Error("no 'backend' key found in config 'session' section");
            }
            switch (this.config.transport.type) {
                case "cookie" :
                    this.transports.cookie.init();
                    break;
                case "token" :
                    this.transports.token.init();
                    break;
                default :
                    throw new Error("session transport of type '" + this.config.transport.type + "' doesn't exist");
                    break;
            }
            switch (this.config.backend.type) {
                case "mysql" :
                    this.backends.mysql.init();
                    break;
                    throw new Error("session backend of type '" + this.config.transport.type + "' doesn't exist");
                    break;
            }
        }
        else {
            this.config = false;
        }
        return this;
    },
    /**
     * Start the webserver
     * @param callback {function} function to call after starting the webserver
     * @returns {object} the current object ($ws)
     */
    start: function (callback) {
        $log.debug("Start session ", 2);
        try {
            switch (this.config.transport.type) {
                case "cookie" :
                    this.transports.cookie.start();
                    break;
                case "token" :
                    this.transports.token.start();
                    break;
            }
            switch (this.config.backend.type) {
                case "mysql" :
                    this.backends.mysql.start(callback);
                    break;
                default:
                    if (typeof callback === "function") {
                        callback();
                    }
                    break;
            }

        }
        catch (error) {
            $log.error('session start returned error because ' + error.message);
        }
        return this;
    },
    /**
     * Stop the session
     * @param callback {function} function to call after stopping the webserver
     * @returns {object} the current object ($ws)
     */
    stop: function (callback) {
        $log.debug("Stop session ", 2);
        try {
            switch (this.config.transport.type) {
                case "cookie" :
                    this.transports.cookie.stop();
                    break;
                case "token" :
                    this.transports.token.stop();
                    break;
            }
            switch (this.config.backend.type) {
                case "mysql" :
                    this.backends.mysql.stop(callback);
                    break;
                default:
                    if (typeof callback === "function") {
                        callback();
                    }
                    break;
            }

        }
        catch (error) {
            $log.error('session stop returned error because ' + error.message);
        }
        return this;
    },
    /**
     * Stop the session
     * @param req {object} request object from the webserver
     * @param res {object} response object for the webserver
     * @param callbackOK {function} callback to execute if session is OK
     * @param callbackNOK {function} callback to execute if session is NOT OK
     * @returns {object} the current object ($ws)
     */
    required: function (req, res, callbackOK, callbackNOK) {
        $log.debug("Check session ", 2);
        try {
            switch (this.config.transport.type) {
                case "cookie" :
                    return this.transports.cookie.required(req, res, callbackOK, callbackNOK);
                    break;
                case "token" :
                    return this.transports.token.required(req, res, callbackOK, callbackNOK);
                    break;
            }
        }
        catch (error) {
            $log.error('session check returned error because ' + error.message);
        }
    },
    transports: {
        cookie: {
            init: function () {
                $log.debug("Init 'cookie' session transport", 3);
                if (!$sess.config.transport.cookie_name) {
                    $sess.config.transport.cookie_name = "sxapi-sess";
                }
                if (!$sess.config.transport.cookie_name) {
                    $sess.config.transport.cookie_duration = 3600;
                }
                return this;
            },
            start: function () {
                $log.debug("Start 'cookie' session transport", 3);
                return this;
            },
            stop: function () {
                $log.debug("Stop 'cookie' session transport", 3);
                return this;
            },
            required: function (req, res, callbackOK, callbackNOK) {
                var sessID = eval('req.query.' + $sess.config.transport.param);
                if (sessID !== undefined) {
                    $log.debug("session cookie is '" + sessID + "'", 3);
                    switch ($sess.config.backend.type) {
                        case "mysql" :
                            $sess.backends.mysql.check(sessID, res, callbackOK, callbackNOK);
                            break;
                    }
                }
                else {
                    $log.warn("could not find a session cookie in request " + req.method + ' ' + req.url);
                    if (typeof callbackNOK === 'function') {
                        callbackNOK();
                    }
                    else {
                        require("./ws").nokResponse(res, "could not find a session cookie in your request").httpCode(500).send();
                    }

                }
                return this;
            }
        },
        token: {
            init: function () {
                $log.debug("Init 'token' session transport", 3);
                if (!$sess.config.transport.param) {
                    $sess.config.transport.param = "token";
                }
                return this;
            },
            start: function () {
                $log.debug("Start 'token' session transport", 3);
                return this;
            },
            stop: function () {
                $log.debug("Stop 'token' session transport", 3);
                return this;
            },
            required: function (req, res, callbackOK, callbackNOK) {
                var sessID = eval('req.query.' + $sess.config.transport.param);
                if (sessID !== undefined) {
                    $log.debug("session token is '" + sessID + "'", 3);
                    switch ($sess.config.backend.type) {
                        case "mysql" :
                            $sess.backends.mysql.check(sessID, res, callbackOK, callbackNOK);
                            break;
                    }
                }
                else {
                    $log.warn("could not find a session token in request " + req.method + ' ' + req.url);
                    if (typeof callbackNOK === 'function') {
                        callbackNOK();
                    }
                    else {
                        require("./ws").nokResponse(res, "could not find a session token in your request").httpCode(500).send();
                    }

                }
                return this;
            }
        }
    },
    backends: {
        mysql: {
            init: function () {
                $log.debug("Init 'mysql' session backend", 3);
                if (!$sess.config.backend.resource) {
                    throw new Error("no 'resource' key found in config 'session.backend.mysql'");
                }
                else if (!require('./resource').exist($sess.config.backend.resource)) {
                    throw new Error("resource '" + $sess.config.backend.resource + "' defined in config 'session.backend.mysql' doesn't exist");
                }
                if (!$sess.config.backend.table) {
                    throw new Error("no 'table' key found in config 'session.backend.mysql'");
                }
                if (!$sess.config.backend.sid_field) {
                    throw new Error("no 'sid_field' key found in config 'session.backend.mysql'");
                }
                return this;
            },
            start: function (callback) {
                $log.debug("Start 'mysql' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            stop: function (callback) {
                $log.debug("Stop 'mysql' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            check: function (sessID, res, callbackOK, callbackNOK) {
                var ress = require('./resource');
                var rs = ress.get($sess.config.backend.resource);
                var query = "SELECT * FROM `" + $sess.config.backend.table + "` WHERE `" + $sess.config.backend.sid_field + "` = '" + sessID + "'";
                rs.query(query, function (timerId) {
                    return function (error, results) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            $log.warn("session '" + sessID + "' is not valid because " + error.message, duration);
                            if (typeof callbackNOK === "function") {
                                callbackNOK();
                            }
                            else {
                                require("./ws").nokResponse(res, "error using 'mysql' session backend").httpCode(500).send();
                            }
                        }
                        else {
                            if (results.length === 1) {
                                $log.debug("session '" + sessID + "' is valid in 'mysql' backend", 2, duration);
                                if (typeof callbackOK === "function") {
                                    callbackOK();
                                }
                            }
                            else {
                                $log.warn("session '" + sessID + "' doesn't exist in 'mysql' backend", duration);
                                if (typeof callbackNOK === "function") {
                                    callbackNOK();
                                }
                                else {
                                    require("./ws").nokResponse(res, "could not find a valid session for " + sessID).httpCode(500).send();
                                }
                            }
                        }
                    };
                });
                return this;
            }
        }
    }
};
module.exports = $sess;