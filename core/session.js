/* global module, require, process, $log, $timer */
//'use strict';


/**
 * Log manager
 * @module log
 * @constructor
 * @type $session
 */

var $sess = {
    cached: {},
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
            if (!this.config.auto_create) {
                this.config.auto_create = false;
            }
            if (!$sess.config.duration) {
                $sess.config.duration = 3600;
            }
            if (this.config.transport) {
                switch (this.config.transport.type) {
                    case "cookie" :
                        this.transports.cookie.init();
                        break;
                    case "token" :
                        this.transports.token.init();
                        break;
                    case "bearer" :
                        this.transports.bearer.init();
                        break;
                    default :
                        throw new Error("session transport of type '" + this.config.transport.type + "' doesn't exist");
                        break;
                }
            }
            else {
                $log.warn("no 'transport' key found in config 'session' section. Disabling session");
            }
            if (this.config.backend) {
                switch (this.config.backend.type) {
                    case "mysql" :
                        this.backends.mysql.init();
                        break;
                    case "postgres" :
                        this.backends.postgres.init();
                        break;
                    case "couchbase" :
                        this.backends.couchbase.init();
                        break;
                    case "memory" :
                        this.backends.memory.init();
                        break;
                    case "redis" :
                        this.backends.redis.init();
                        break;
                    case "memcache" :
                        this.backends.memcache.init();
                        break;
                    default:
                        throw new Error("session backend of type '" + this.config.backend.type + "' doesn't exist");
                        break;
                }
            }
            else {
                $log.warn("no 'backend' key found in config 'session' section. Disabling session");
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
            if (this.config.transport) {
                switch (this.config.transport.type) {
                    case "cookie" :
                        this.transports.cookie.start();
                        break;
                    case "token" :
                        this.transports.token.start();
                        break;
                    case "bearer" :
                        this.transports.bearer.start();
                        break;
                }
            }
            if (this.config.backend) {
                switch (this.config.backend.type) {
                    case "mysql" :
                        this.backends.mysql.start(callback);
                        break;
                    case "postgres" :
                        this.backends.postgres.start(callback);
                        break;
                    case "couchbase" :
                        this.backends.couchbase.start(callback);
                        break;
                    case "memory" :
                        this.backends.memory.start(callback);
                        break;
                    case "redis" :
                        this.backends.redis.start(callback);
                        break;
                    case "memcache" :
                        this.backends.memcache.start(callback);
                        break;
                    default:
                        if (typeof callback === "function") {
                            callback();
                        }
                        break;
                }
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
            if (this.config.transport) {
                switch (this.config.transport.type) {
                    case "cookie" :
                        this.transports.cookie.stop();
                        break;
                    case "token" :
                        this.transports.token.stop();
                        break;
                    case "bearer" :
                        this.transports.bearer.stop();
                        break;
                }
            }
            if (this.config.backend) {
                switch (this.config.backend.type) {
                    case "mysql" :
                        this.backends.mysql.stop(callback);
                        break;
                    case "postgres" :
                        this.backends.postgres.stop(callback);
                        break;
                    case "couchbase" :
                        this.backends.couchbase.stop(callback);
                        break;
                    case "memory" :
                        this.backends.memory.stop(callback);
                        break;
                    case "redis" :
                        this.backends.redis.stop(callback);
                        break;
                    case "memcache" :
                        this.backends.memcache.stop(callback);
                        break;
                    default:
                        if (typeof callback === "function") {
                            callback();
                        }
                        break;
                }
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
        if (req === undefined) throw "session.required require first param to be a request";
        if (res === undefined) throw "session.required require second param to be a response";
        var sess = this;
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
                if (sess.config.backend) {
                    switch (sess.config.backend.type) {
                        case "mysql" :
                            sess.backends.mysql.getSession(sid, cbGetSessionOK, cbGetSessionNOK);
                            break;
                        case "postgres" :
                            sess.backends.postgres.getSession(sid, cbGetSessionOK, cbGetSessionNOK);
                            break;
                        case "couchbase" :
                            sess.backends.couchbase.getSession(sid, cbGetSessionOK, cbGetSessionNOK);
                            break;
                        case "memory" :
                            sess.backends.memory.getSession(sid, cbGetSessionOK, cbGetSessionNOK);
                            break;
                        case "redis" :
                            sess.backends.redis.getSession(sid, cbGetSessionOK, cbGetSessionNOK);
                            break;
                        case "memcache" :
                            sess.backends.memcache.getSession(sid, cbGetSessionOK, cbGetSessionNOK);
                            break;
                        default :
                            fnNOK("backend type '" + sess.config.backend.type + "' is not implemented in required() method", 20);
                            break;
                    }
                }
                else {
                    fnOK({});
                }
            };
            var cbGetSIDNOK = function (message, code) {
                if (sess.config.auto_create) {
                    $log.warn("could not find a session ID because " + message);
                    if (sess.config.backend) {
                        switch (sess.config.backend.type) {
                            case "mysql" :
                                sess.backends.mysql.createSession(req, cbCreateSessionOK, cbCreateSessionNOK);
                                break;
                            case "postgres" :
                                sess.backends.postgres.createSession(req, cbCreateSessionOK, cbCreateSessionNOK);
                                break;
                            case "couchbase" :
                                sess.backends.couchbase.createSession(req, cbCreateSessionOK, cbCreateSessionNOK);
                                break;
                            case "memory" :
                                sess.backends.memory.createSession(req, cbCreateSessionOK, cbCreateSessionNOK);
                                break;
                            case "redis" :
                                sess.backends.redis.createSession(req, cbCreateSessionOK, cbCreateSessionNOK);
                                break;
                            case "memcache" :
                                sess.backends.memcache.createSession(req, cbCreateSessionOK, cbCreateSessionNOK);
                                break;
                            default :
                                fnNOK("backend type '" + sess.config.backend.type + "' is not implemented in required() method", 30);
                                break;
                        }
                    }
                    else {
                        $log.error("could not auto create a session because no backend is configured");
                        fnNOK(message, code);
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
                if (sess.config.transport) {
                    switch (sess.config.transport.type) {
                        case "token" :
                            sess.transports.token.setSID(sessId, session, req, res, cbSetSIDOK, cbSetSIDNOK);
                            break;
                        case "cookie" :
                            sess.transports.cookie.setSID(sessId, session, req, res, cbSetSIDOK, cbSetSIDNOK);
                            break;
                        case "bearer" :
                            sess.transports.bearer.setSID(sessId, session, req, res, cbSetSIDOK, cbSetSIDNOK);
                            break;
                        default :
                            fnNOK("transport type '" + this.config.transport.type + "' is not implemented in required() method", 30);
                            break;
                    }
                }
                else {
                    fnOK({});
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
            if (this.config.transport) {
                switch (this.config.transport.type) {
                    case "cookie" :
                        this.transports.cookie.getSID(req, res, cbGetSIDOK, cbGetSIDNOK);
                        break;
                    case "token" :
                        this.transports.token.getSID(req, res, cbGetSIDOK, cbGetSIDNOK);
                        break;
                    case "bearer" :
                        this.transports.bearer.getSID(req, res, cbGetSIDOK, cbGetSIDNOK);
                        break;
                    default :
                        fnNOK("transport type '" + this.config.transport.type + "' is not implemented in required() method", 10);
                        break;
                }
            }
            else {
                fnOK({});
            }
        }
    },
    transports: {
        bearer: {
            init: function () {
                $log.debug("Init 'bearer' session transport", 3);
                return this;
            },
            start: function () {
                $log.debug("Start 'bearer' session transport", 3);
                return this;
            },
            stop: function () {
                $log.debug("Stop 'bearer' session transport", 3);
                return this;
            },
            getSID: function (req, res, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.transports.bearer.getSID require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.transports.bearer.getSID require a callbackNOK";
                var result = req.get('Authorization') || '';
                $sess.transports.sessID = result.split(" ")[1];
                if ($sess.transports.sessID !== undefined) {
                    $log.debug("session bearer token is '" + $sess.transports.sessID + "'", 3);
                    callbackOK($sess.transports.sessID);
                }
                else {
                    $log.warn("could not find a session bearer token in request " + req.method + ' ' + req.url);
                    callbackNOK("could not find a session bearer token in your request", 110);

                }
                return this;
            },
            setSID: function (sid, session, req, res, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.transports.bearer.setSID require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.transports.bearer.setSID require a callbackNOK";
                $sess.transports.sessID = sid;
                res.set('Authorization', 'Bearer ' + sid);
                $log.debug("setting session bearer token '" + $sess.transports.sessID + "'", 3);
                callbackOK(session);
                return this;
            }
        },
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
                var cookies = new require("cookies")(req, res);
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
                var cookies = new require("cookies")(req, res);
                var cookieOpt = {maxAge: $sess.config.duration * 1000};
                if ($sess.config.transport.cookie_options) {
                    require('merge').recursive(cookieOpt, $sess.config.transport.cookie_options, cookieOpt);
                }
                cookies.set($sess.config.transport.cookie_name, sid, cookieOpt);
                $log.debug("setting session cookie '" + $sess.transports.sessID + "'", 3);
                callbackOK(session);
                return this;
            }
        },
        token: {
            init: function () {
                $log.debug("Init 'token' session transport", 3);
                if (!$sess.config.transport.param) {
                    $sess.config.transport.param = "_token";
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
                            callbackNOK("error reading session using 'mysql' backend", 210);
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
                                callbackNOK("could not find an existing session for " + sessID, 220);
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
        },
        postgres: {
            init: function () {
                $log.debug("Init 'postgres' session backend", 3);
                if (!$sess.config.backend.resource) {
                    throw new Error("no 'resource' key found in config 'session.backend.postgres'");
                }
                else if (!require('./resource').exist($sess.config.backend.resource)) {
                    throw new Error("resource '" + $sess.config.backend.resource + "' defined in config 'session.backend.postgres' doesn't exist");
                }
                if (!$sess.config.backend.table) {
                    throw new Error("no 'table' key found in config 'session.backend.postgres'");
                }
                if (!$sess.config.backend.sid_field) {
                    throw new Error("no 'sid_field' key found in config 'session.backend.postgres'");
                }
                return this;
            },
            start: function (callback) {
                $log.debug("Start 'postgres' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            stop: function (callback) {
                $log.debug("Stop 'postgres' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            getSession: function (sessID, callbackOK, callbackNOK) {
                if (sessID === undefined) throw "session.backends.postgres.getSession require a sessID";
                if (typeof callbackOK !== "function") throw "session.backends.postgres.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.postgres.getSession require a callbackNOK";
                var rs = require('./resource').get($sess.config.backend.resource);
                var query = "SELECT * FROM `" + $sess.config.backend.table + "` WHERE `" + $sess.config.backend.sid_field + "` = '" + sessID + "'";
                rs.query(query, function (timerId) {
                    return function (error, results) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            $log.warn("session '" + sessID + "' is not found because " + error.message, duration);
                            callbackNOK("error reading session using 'postgres' backend", 210);
                        }
                        else {
                            if (results.length === 1) {
                                var session = results[0];
                                if ($sess.config.backend.fields && $sess.config.backend.fields.stop) {
                                    var dateStop = session[$sess.config.backend.fields.stop];
                                    var moment = require('moment');
                                    if (moment(dateStop, 'YYYY-MM-DD HH:mm:ss').valueOf() - Date.now() > 0) {
                                        $log.debug("session '" + sessID + "' exist and is active in 'postgres' backend", 2, duration);
                                        callbackOK(session);
                                    }
                                    else {
                                        $log.warn("session '" + sessID + "' exist but is obsolete", duration);
                                        callbackNOK("session '" + sessID + "' exist but is obsolete", 230);
                                    }
                                }
                                else {
                                    $log.debug("session '" + sessID + "' exist in 'postgres' backend", 2, duration);
                                    callbackOK(session);
                                }
                            }
                            else {
                                $log.warn("session '" + sessID + "' doesn't exist in 'postgres' backend", duration);
                                callbackNOK("could not find an existing session for " + sessID, 220);
                            }
                        }
                    };
                });
                return this;
            },
            createSession: function (req, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.backends.postgres.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.postgres.getSession require a callbackNOK";
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
                            callbackNOK("error using 'postgres' session backend", 310);
                        }
                        else {
                            $log.debug("session '" + sessId + "' is created in 'postgres' backend", 2, duration);
                            callbackOK(sessId, session);
                        }
                    };
                });
                return this;
            }
        },
        couchbase: {
            init: function () {
                $log.debug("Init 'couchbase' session backend", 3);
                if (!$sess.config.backend.resource) {
                    throw new Error("no 'resource' key found in config 'session.backend.couchbase'");
                }
                else if (!require('./resource').exist($sess.config.backend.resource)) {
                    throw new Error("resource '" + $sess.config.backend.resource + "' defined in config 'session.backend.couchbase' doesn't exist");
                }
                return this;
            },
            start: function (callback) {
                $log.debug("Start 'couchbase' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            stop: function (callback) {
                $log.debug("Stop 'couchbase' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            getSession: function (sessID, callbackOK, callbackNOK) {
                if (sessID === undefined) throw "session.backends.couchbase.getSession require a sessID";
                if (typeof callbackOK !== "function") throw "session.backends.couchbase.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.couchbase.getSession require a callbackNOK";
                var rs = require('./resource').get($sess.config.backend.resource);
                var docID = sessID;
                if ($sess.config.backend.key_ns) {
                    docID = $sess.config.backend.key_ns + sessID;
                }
                rs.get(docID, function (timerId) {
                    return function (error, results) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            if (error.code === 13) {
                                $log.warn("session '" + sessID + "' doesn't exist in 'couchbase' backend", duration);
                                callbackNOK("could not find an existing session for " + sessID, 220);
                            }
                            else {
                                $log.warn("session '" + sessID + "' is not found because " + error.message, duration);
                                callbackNOK("error reading session using 'couchbase' backend", 210);
                            }
                        }
                        else {
                            if (results.value) {
                                var session = results.value;
                                if ($sess.config.backend.fields && $sess.config.backend.fields.stop) {
                                    var dateStop = session[$sess.config.backend.fields.stop];
                                    var moment = require('moment');
                                    if (moment(dateStop, 'YYYY-MM-DD HH:mm:ss').valueOf() - Date.now() > 0) {
                                        $log.debug("session '" + sessID + "' exist and is active in 'couchbase' backend", 2, duration);
                                        callbackOK(session);
                                    }
                                    else {
                                        $log.warn("session '" + sessID + "' exist but is obsolete", duration);
                                        callbackNOK("session '" + sessID + "' exist but is obsolete", 230);
                                    }
                                }
                                else {
                                    $log.debug("session '" + sessID + "' exist in 'couchbase' backend", 2, duration);
                                    callbackOK(session);
                                }
                            }
                            else {
                                $log.warn("session '" + sessID + "' doesn't exist in 'couchbase' backend", duration);
                                callbackNOK("could not find a valid session for " + sessID, 220);
                            }
                        }
                    };
                });
                return this;
            },
            createSession: function (req, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.backends.couchbase.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.couchbase.getSession require a callbackNOK";
                var rs = require('./resource').get($sess.config.backend.resource);
                var sessID = require('uuid').v4();
                var docID = sessID;
                if ($sess.config.backend.key_ns) {
                    docID = $sess.config.backend.key_ns + sessID;
                }
                var session = {};
                if ($sess.config.backend.fields) {
                    if ($sess.config.backend.fields.ip) {
                        session[$sess.config.backend.fields.ip] = req.headers['x-forwarded-for'] ||
                                req.connection.remoteAddress ||
                                req.socket.remoteAddress ||
                                req.connection.socket.remoteAddress;
                    }
                    if ($sess.config.backend.fields.token) {
                        session[$sess.config.backend.fields.token] = sessID;
                    }
                    var moment = require('moment');
                    if ($sess.config.backend.fields.start) {
                        session[$sess.config.backend.fields.start] = moment().format('YYYY-MM-DD HH:mm:ss');
                    }
                    if ($sess.config.backend.fields.stop) {
                        session[$sess.config.backend.fields.stop] = moment(Date.now() + ($sess.config.duration * 1000)).format('YYYY-MM-DD HH:mm:ss');
                    }
                }
                rs.insert(docID, session, function (timerId) {
                    return function (error) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            $log.warn("could not create session '" + sessID + "' is not valid because " + error.message, duration);
                            callbackNOK("error using 'couchbase' session backend", 310);
                        }
                        else {
                            $log.debug("session '" + sessID + "' is created in 'couchbase' backend", 2, duration);
                            callbackOK(sessID, session);
                        }
                    };
                });
                return this;
            }
        },
        memory: {
            init: function () {
                $log.debug("Init 'memory' session backend", 3);
                if (!$sess.config.backend.sid_field) {
                    $sess.config.backend.sid_field = "sid";
                }
                return this;
            },
            start: function (callback) {
                $log.debug("Start 'memory' session backend", 3);
                $sess.cached = {};
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            stop: function (callback) {
                $log.debug("Stop 'memory' session backend", 3);
                $sess.cached = {};
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            getSession: function (sessID, callbackOK, callbackNOK) {
                if (sessID === undefined) throw "session.backends.memory.getSession require a sessID";
                if (typeof callbackOK !== "function") throw "session.backends.memory.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.memory.getSession require a callbackNOK";
                if (!$sess.cached[sessID]) {
                    $log.warn("session '" + sessID + "' is not found in cache ");
                    callbackNOK("session '" + sessID + "' could not be found", 220);
                }
                else {
                    var session = $sess.cached[sessID];
                    if ($sess.config.backend.fields && $sess.config.backend.fields.stop) {
                        var dateStop = session[$sess.config.backend.fields.stop];
                        var moment = require('moment');
                        if (moment(dateStop, 'YYYY-MM-DD HH:mm:ss').valueOf() - Date.now() > 0) {
                            $log.debug("session '" + sessID + "' exist and is active in 'memory' backend", 2);
                            callbackOK(session);
                        }
                        else {
                            $log.warn("session '" + sessID + "' exist but is obsolete");
                            callbackNOK("session '" + sessID + "' exist but is obsolete", 230);
                        }
                    }
                    else {
                        $log.debug("session '" + sessID + "' exist in 'memory' backend", 2);
                        callbackOK(session);
                    }
                }
                return this;
            },
            createSession: function (req, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.backends.memory.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.memory.getSession require a callbackNOK";
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
                $sess.cached[sessId] = session;
                callbackOK(sessId, session);
                return this;
            }
        },
        redis: {
            init: function () {
                $log.debug("Init 'redis' session backend", 3);
                if (!$sess.config.backend.resource) {
                    throw new Error("no 'resource' key found in config 'session.backend.redis'");
                }
                else if (!require('./resource').exist($sess.config.backend.resource)) {
                    throw new Error("resource '" + $sess.config.backend.resource + "' defined in config 'session.backend.redis' doesn't exist");
                }
                if (!$sess.config.backend.sid_field) {
                    throw new Error("no 'sid_field' key found in config 'session.backend.redis'");
                }
                return this;
            },
            start: function (callback) {
                $log.debug("Start 'redis' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            stop: function (callback) {
                $log.debug("Stop 'redis' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            getSession: function (sessID, callbackOK, callbackNOK) {
                if (sessID === undefined) throw "session.backends.redis.getSession require a sessID";
                if (typeof callbackOK !== "function") throw "session.backends.redis.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.redis.getSession require a callbackNOK";
                var rs = require('./resource').get($sess.config.backend.resource);
                var key = $sess.config.backend.sid_field + "::" + sessID;
                rs.get(key, function (timerId) {
                    return function (error, session) {
                        var duration = $timer.timeStop(timerId);
                        var moment = require('moment');
                        if (JSON.isDeserializable(session)) {
                            session = JSON.parse(session);
                        }
                        if (error) {
                            $log.warn("session '" + sessID + "' is not found because " + error.message, duration);
                            callbackNOK("session '" + sessID + "' could not be found", 220);
                        }
                        else {
                            if (session !== null) {
                                if ($sess.config.backend.fields && $sess.config.backend.fields.stop && session[$sess.config.backend.fields.stop]) {
                                    var dateStop = session[$sess.config.backend.fields.stop];
                                    if (moment(dateStop, 'YYYY-MM-DD HH:mm:ss').valueOf() - Date.now() > 0) {
                                        $log.debug("session '" + sessID + "' exist and is active in 'redis' backend", 2, duration);
                                        callbackOK(session);
                                    }
                                    else {
                                        $log.warn("session '" + sessID + "' exist but is obsolete", duration);
                                        callbackNOK("session '" + sessID + "' exist but is obsolete", 230);
                                    }
                                }
                                else {
                                    $log.debug("session '" + sessID + "' exist in 'redis' backend", 2, duration);
                                    callbackOK(session);
                                }
                            }
                            else {
                                $log.warn("session '" + sessID + "' doesn't exist in 'redis' backend", duration);
                                callbackNOK("could not find an existing session for " + sessID, 220);
                            }
                        }
                    };
                });
                return this;
            },
            createSession: function (req, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.backends.redis.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.redis.getSession require a callbackNOK";
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
                var key = $sess.config.backend.sid_field + "::" + sessId;
                rs.insert(key, session, function (timerId) {
                    return function (error) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            $log.warn("could not create session '" + sessId + "' is not valid because " + error.message, duration);
                            callbackNOK("error using 'redis' session backend", 310);
                        }
                        else {
                            $log.debug("session '" + sessId + "' is created in 'redis' backend", 2, duration);
                            callbackOK(sessId, session);
                        }
                    };
                });
                return this;
            }
        },
        memcache: {
            init: function () {
                $log.debug("Init 'memcache' session backend", 3);
                if (!$sess.config.backend.resource) {
                    throw new Error("no 'resource' key found in config 'session.backend.memcache'");
                }
                else if (!require('./resource').exist($sess.config.backend.resource)) {
                    throw new Error("resource '" + $sess.config.backend.resource + "' defined in config 'session.backend.memcache' doesn't exist");
                }
                if (!$sess.config.backend.sid_field) {
                    throw new Error("no 'sid_field' key found in config 'session.backend.memcache'");
                }
                return this;
            },
            start: function (callback) {
                $log.debug("Start 'memcache' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            stop: function (callback) {
                $log.debug("Stop 'memcache' session backend", 3);
                if (typeof callback === "function") {
                    callback();
                }
                return this;
            },
            getSession: function (sessID, callbackOK, callbackNOK) {
                if (sessID === undefined) throw "session.backends.memcache.getSession require a sessID";
                if (typeof callbackOK !== "function") throw "session.backends.memcache.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.memcache.getSession require a callbackNOK";
                var rs = require('./resource').get($sess.config.backend.resource);
                var key = $sess.config.backend.sid_field + "::" + sessID;
                rs.get(key, function (timerId) {
                    return function (error, session) {
                        var duration = $timer.timeStop(timerId);
                        var moment = require('moment');
                        if (JSON.isDeserializable(session)) {
                            session = JSON.parse(session);
                        }
                        if (error) {
                            $log.warn("session '" + sessID + "' is not found because " + error.message, duration);
                            callbackNOK("session '" + sessID + "' could not be found", 220);
                        }
                        else {
                            if (session !== null) {
                                if ($sess.config.backend.fields && $sess.config.backend.fields.stop && session[$sess.config.backend.fields.stop]) {
                                    var dateStop = session[$sess.config.backend.fields.stop];
                                    if (moment(dateStop, 'YYYY-MM-DD HH:mm:ss').valueOf() - Date.now() > 0) {
                                        $log.debug("session '" + sessID + "' exist and is active in 'memcache' backend", 2, duration);
                                        callbackOK(session);
                                    }
                                    else {
                                        $log.warn("session '" + sessID + "' exist but is obsolete", duration);
                                        callbackNOK("session '" + sessID + "' exist but is obsolete", 230);
                                    }
                                }
                                else {
                                    $log.debug("session '" + sessID + "' exist in 'memcache' backend", 2, duration);
                                    callbackOK(session);
                                }
                            }
                            else {
                                $log.warn("session '" + sessID + "' doesn't exist in 'memcache' backend", duration);
                                callbackNOK("could not find an existing session for " + sessID, 220);
                            }
                        }
                    };
                });
                return this;
            },
            createSession: function (req, callbackOK, callbackNOK) {
                if (typeof callbackOK !== "function") throw "session.backends.memcache.getSession require a callbackOK";
                if (typeof callbackNOK !== "function") throw "session.backends.memcache.getSession require a callbackNOK";
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
                var key = $sess.config.backend.sid_field + "::" + sessId;
                rs.insert(key, session, function (timerId) {
                    return function (error) {
                        var duration = $timer.timeStop(timerId);
                        if (error) {
                            $log.warn("could not create session '" + sessId + "' is not valid because " + error.message, duration);
                            callbackNOK("error using 'memcache' session backend", 310);
                        }
                        else {
                            $log.debug("session '" + sessId + "' is created in 'memcache' backend", 2, duration);
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