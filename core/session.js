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
            if (!this.config.auto_create) {
                this.config.auto_create = false;
            }
            if (!$sess.config.duration) {
                $sess.config.duration = 3600;
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
        if (req === undefined) throw "session.backends.mysql.getSession require first param to be a request";
        if (res === undefined) throw "session.backends.mysql.getSession require second param to be a response";
        var cbOK = function (result) {
            var message = 'found session';
            $log.info(message);
            require("./ws").okResponse(res, message, result).send();
        };
        var cbNOK = function (message, code) {
            require("./ws").nokResponse(res, message).httpCode(500).send();
        };
        if (this.config === false) {
            if (typeof callbackOK === "function") {
                callbackOK(null);
            }
        }
        else {
            var fnOK = callbackOK || cbOK;
            var fnNOK = callbackNOK || cbNOK;
            var cbGetSIDOK = function (sid) {
                switch ($sess.config.backend.type) {
                    case "mysql" :
                        $sess.backends.mysql.getSession(sid, cbGetSessionOK, cbGetSessionNOK);
                        break;
                    default :
                        fnNOK("backend type '" + this.config.backend.type + "' is not implemented in required() method", 20);
                        break;
                }
            };
            var cbGetSIDNOK = function (message, code) {
                if ($sess.config.auto_create) {
                    $log.warn("could not find a session ID because " + message);
                    switch ($sess.config.backend.type) {
                        case "mysql" :
                            $sess.backends.mysql.createSession(req, cbCreateSessionOK, cbCreateSessionNOK);
                            break;
                        default :
                            fnNOK("backend type '" + this.config.backend.type + "' is not implemented in required() method", 30);
                            break;
                    }
                }
                else {
                    $log.error("could not find a session ID because " + message);
                    fnNOK(message, code);
                }
            };
            var cbGetSessionOK = function (session) {
                fnOK(session);
            };
            var cbGetSessionNOK = function (message, code) {
                $log.error("could not find a session context because " + message);
                fnNOK(message, code);
            };
            var cbCreateSessionOK = function (sessId, session) {
                $log.info("auto created session " + sessId);
                switch ($sess.config.transport.type) {
                    case "token" :
                        $sess.transports.token.setSID(sessId, session, req, res, cbSetSIDOK, cbSetSIDNOK);
                        break;
                    case "cookie" :
                        $sess.transports.cookie.setSID(sessId, session, req, res, cbSetSIDOK, cbSetSIDNOK);
                        break;
                    default :
                        fnNOK("transport type '" + this.config.transport.type + "' is not implemented in required() method", 30);
                        break;
                }
            };
            var cbCreateSessionNOK = function (message, code) {
                $log.error("could not create a session context because " + message);
                fnNOK(message, code);
            };
            var cbSetSIDOK = function (session) {
                fnOK(session);
            };
            var cbSetSIDNOK = function (message, code) {
                $log.error("could not record a session ID because " + message);
                fnNOK(message, code);
            };
            switch (this.config.transport.type) {
                case "cookie" :
                    this.transports.cookie.getSID(req, res, cbGetSIDOK, cbGetSIDNOK);
                    break;
                case "token" :
                    this.transports.token.getSID(req, res, cbGetSIDOK, cbGetSIDNOK);
                    break;
                default :
                    fnNOK("transport type '" + this.config.transport.type + "' is not implemented in required() method", 10);
                    break;
            }
        }
    },
    transports: {
        cookie: {
            init: function () {
                $log.debug("Init 'cookie' session transport", 3);
                if (!$sess.config.transport.cookie_name) {
                    $sess.config.transport.cookie_name = "sxapi-sess";
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
            getSID: function (req, res, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.transports.cookie.getSID require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.transports.cookie.getSID require a callbackNOK";
                var Cookies = require("cookies");
                var cookies = new Cookies(req, res);
                $sess.transports.sessID = cookies.get($sess.config.transport.cookie_name);
                if ($sess.transports.sessID !== undefined) {
                    $log.debug("session cookie is '" + $sess.transports.sessID + "'", 3);
                    callbackOK($sess.transports.sessID);
                }
                else {
                    $log.warn("could not find a session cookie in request " + req.method + ' ' + req.url);
                    callbackNOK("could not find a session cookie in your request", 110);

                }
                return this;
            },
            setSID: function (sid, session, req, res, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.transports.cookie.setSID require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.transports.cookie.setSID require a callbackNOK";
                $sess.transports.sessID = sid;
                var Cookies = require("cookies");
                var cookies = new Cookies(req, res);
                var cookieOpt = {maxAge: $sess.config.duration * 1000};
                if ($sess.config.transport.cookie_options) {
                    require('merge').recursive(cookieOpt, $sess.config.transport.cookie_options, cookieOpt);
                }
                cookies.set($sess.config.transport.cookie_name, sid, cookieOpt);
                $sess.transports.sessID = sid;
                $log.debug("setting session cookie '" + $sess.transports.sessID + "'", 3);
                callbackOK(session);
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
            getSID: function (req, res, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.transports.token.getSID require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.transports.token.getSID require a callbackNOK";
                $sess.transports.sessID = eval('req.query.' + $sess.config.transport.param);
                if ($sess.transports.sessID !== undefined) {
                    $log.debug("session token is '" + $sess.transports.sessID + "'", 3);
                    callbackOK($sess.transports.sessID);
                }
                else {
                    $log.warn("could not find a session token in request " + req.method + ' ' + req.url);
                    callbackNOK("could not find a session token in your request", 120);

                }
                return this;
            },
            setSID: function (sid, session, req, res, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.transports.token.setSID require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.transports.token.setSID require a callbackNOK";
                $sess.transports.sessID = sid;
                $log.debug("setting session token '" + $sess.transports.sessID + "'", 3);
                callbackOK(session);
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
            getSession: function (sessID, callbackOK, callbackNOK) {
                if (sessID === undefined) throw "session.backends.mysql.getSession require a sessID";
                if (typeof callbackOK !== "function") throw "session.backends.mysql.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.mysql.getSession require a callbackNOK";
                var rs = require('./resource').get($sess.config.backend.resource);
                var query = "SELECT * FROM `" + $sess.config.backend.table + "` WHERE `" + $sess.config.backend.sid_field + "` = '" + sessID + "'";
                rs.query(query, function (timerId) {
                    return function (error, results) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            $log.warn("session '" + sessID + "' is not found because " + error.message, duration);
                            callbackNOK("error using 'mysql' session backend", 210);
                        }
                        else {
                            if (results.length === 1) {
                                var session = results[0];
                                if ($sess.config.backend.fields && $sess.config.backend.fields.stop) {
                                    var dateStop = session[$sess.config.backend.fields.stop];
                                    var moment = require('moment');
                                    if (moment(dateStop, 'YYYY-MM-DD HH:mm:ss').valueOf() - Date.now() > 0) {
                                        $log.debug("session '" + sessID + "' exist and is active in 'mysql' backend", 2, duration);
                                        callbackOK(session);
                                    }
                                    else {
                                        $log.warn("session '" + sessID + "' exist but is obsolete", duration);
                                        callbackNOK("session '" + sessID + "' exist but is obsolete", 230);
                                    }
                                }
                                else {
                                    $log.debug("session '" + sessID + "' exist in 'mysql' backend", 2, duration);
                                    callbackOK(session);
                                }
                            }
                            else {
                                $log.warn("session '" + sessID + "' doesn't exist in 'mysql' backend", duration);
                                callbackNOK("could not find a valid session for " + sessID, 220);
                            }
                        }
                    };
                });
                return this;
            },
            createSession: function (req, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.backends.mysql.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.mysql.getSession require a callbackNOK";
                var rs = require('./resource').get($sess.config.backend.resource);
                var sessId = require('uuid').v4();
                var session = {};
                session[$sess.config.backend.sid_field] = sessId;
                if ($sess.config.backend.fields) {
                    if ($sess.config.backend.fields.ip) {
                        session[$sess.config.backend.fields.ip] = req.headers['x-forwarded-for'] ||
                                req.connection.remoteAddress ||
                                req.socket.remoteAddress ||
                                req.connection.socket.remoteAddress;
                    }
                    var moment = require('moment');
                    if ($sess.config.backend.fields.start) {
                        session[$sess.config.backend.fields.start] = moment().format('YYYY-MM-DD HH:mm:ss');
                    }
                    if ($sess.config.backend.fields.stop) {
                        session[$sess.config.backend.fields.stop] = moment(Date.now() + ($sess.config.duration * 1000)).format('YYYY-MM-DD HH:mm:ss');
                    }
                }
                rs.insert($sess.config.backend.table, session, function (timerId) {
                    return function (error) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            $log.warn("could not create session '" + sessId + "' is not valid because " + error.message, duration);
                            callbackNOK("error using 'mysql' session backend", 310);
                        }
                        else {
                            $log.debug("session '" + sessId + "' is created in 'mysql' backend", 2, duration);
                            callbackOK(sessId, session);
                        }
                    };
                });
                return this;
            }
        }
    }
};
module.exports = $sess;