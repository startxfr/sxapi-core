/* global module, require, process, $log */

//'use strict';

var $ws = {
    config: {},
    urlList: {},
    init: function (config) {
        if (config) {
            $ws.config = config;
        }
        $log.debug("Init core module : sxapi-core-ws", 4);
        if (!$ws.config) {
            throw new Error("no 'server' section in config");
        }
        if (!$ws.config.port) {
            $ws.config.port = 8080;
        }
        if (!$ws.config.endpoints) {
            throw new Error("no 'endpoints' key found in config 'server' section");
        }
        if (!$ws.config.endpoints instanceof Array) {
            throw new Error("'endpoints' key in config 'server' section should be an array");
        }
        this._initApp();
        this._initEndpoints($ws.config.endpoints, true);
        return this;
    },
    _initApp: function () {
        $ws.express = require('express');
        $ws.http = require('http');
        $ws.app = $ws.express();
        var bodyParser = require('body-parser');
        if ($ws.config.bodyParserJson !== false) {
            $ws.app.use(bodyParser.json());
        }
        if ($ws.config.bodyParserUrl !== false) {
            $ws.app.use(bodyParser.urlencoded({extended: true}));
        }
        if ($ws.config.useCors !== false) {
            $ws.app.use(require('cors')({
                origin: true,
                methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
                exposedHeaders: "*",
                credentials: true
            }));
        }
        if ($ws.config.static === true) {
            if ($ws.config.static_path === undefined) {
                $ws.config.static_path = '/static';
            }
            if ($ws.config.static_dir === undefined) {
                $ws.config.static_dir = 'webapp';
            }
            $log.debug("Add static endpoint  [ALL]    " + $ws.config.static_path + " > ./" + $ws.config.static_dir, 3);
            $ws.app.use($ws.config.static_path, $ws.express.static($ws.config.static_dir));
            if ($ws.config.static_path2 !== undefined && $ws.config.static_dir !== undefined) {
                $log.debug("Add static endpoint  [ALL]    " + $ws.config.static_path2 + " > ./" + $ws.config.static_dir2, 3);
                $ws.app.use($ws.config.static_path2, $ws.express.static($ws.config.static_dir2));
            }
        }
        return this;
    },
    _initEndpoints: function (endpoints, withRouting) {
        if (withRouting === true) {
            $ws.routing = {};
        }
        for (var i = 0; i < endpoints.length; i++) {
            this._initEndpoint(endpoints[i], withRouting);
        }
        return this;
    },
    _initEndpoint: function (config, withRouting) {
        var method = config.method || 'GET';
        var path = config.path || '/';
        if (withRouting === true) {
            if (!$ws.routing[path]) {
                $ws.routing[path] = {};
            }
            if (!$ws.routing[path][method]) {
                $ws.routing[path][method] = config;
            }
            else {
                $ws.routing[path][method] = require('merge').recursive(true, $ws.routing[path][method], config);
            }
        }
        $ws._initEndpointConfig(config);
        return this;
    },
    _initEndpointGenerateUrlSign: function (d) {
        return d.path + ':' + d.method + ':' + d.type + ':' + d.endpoint;
    },
    _initEndpointConfig: function (config) {
        var handler = config.handler;
        var eptype = (typeof handler === "string") ? "dynamic" : "static ";
        var ephdname = (handler) ? handler : "defaultEndpoint";
        if (typeof handler === "string") {
            eptype = "dynamic";
            handler = eval(handler);
        }
        else if (typeof handler === "undefined" && config.method !== "ROUTER") {
            if (typeof config.resource === "string" && typeof config.endpoint === "string") {
                eptype = "dynamic";
                var rs = require('./resource').get(config.resource);
                ephdname = config.resource + "::" + config.endpoint;
                handler = eval('rs.endpoints.' + config.endpoint);
            }
            else {
                ephdname = "defaultEndpoint";
                handler = $ws.__defaultEndpointCb;
            }
        }
        var urlDescriptor = {path: config.path, type: eptype, endpoint: ephdname, desc: config.desc};
        switch (config.method) {
            case "ROUTER":
                var fct = null;
                if (typeof handler === "function") {
                    fct = handler;
                }
                else {
                    fct = $ws.defaultRouter;
                }
                urlDescriptor.method = "ROUTER";
                $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
                fct(config);
                break;
            case "POST":
                urlDescriptor.method = "POST";
                $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
                $log.debug("Add " + eptype + " endpoint  [POST]   " + config.path + " > " + ephdname, 3);
                $ws.app.post(config.path, handler(config));
                break;
            case "PUT":
                urlDescriptor.method = "PUT";
                $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
                $log.debug("Add " + eptype + " endpoint  [PUT]    " + config.path + " > " + ephdname, 3);
                $ws.app.put(config.path, handler(config));
                break;
            case "DELETE":
                urlDescriptor.method = "DELETE";
                $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
                $log.debug("Add " + eptype + " endpoint  [DELETE] " + config.path + " > " + ephdname, 3);
                $ws.app.delete(config.path, handler(config));
                break;
            default:
                config.method = "GET";
                urlDescriptor.method = "GET";
                $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
                $log.debug("Add " + eptype + " endpoint  [GET]    " + config.path + " > " + ephdname, 3);
                $ws.app.get(config.path, handler(config));
        }
        return this;
    },
    /**
     * Method used to generate the callback function associated with an endpoint and with config of this endpoint is wrapped inside
     * @param {object} config
     * @returns {function} the callback function used as a default endpoint
     */
    __defaultEndpointCb: function (config) {
        /**
         * Callback called when a defined endpoint is received by express webserver
         * @param {object} req
         * @param {object} res
         * @returns {undefined}
         */
        return function (req, res) {
            $log.tools.endpointDebug("defaultEndpoint", req, " called", 2);
            if (config.body) {
                var code = (config.code) ? config.code : 200;
                var header = (config.header) ? config.header : {"Content-Type": "text/html"};
                res.writeHead(code, header);
                res.end(config.body);
                $log.tools.endpointDebug("defaultEndpoint", req, " return static document [" + code + "]", 2, 1);
            }
            else {
                res.writeHead(404, {"Content-Type": "text/html"});
                res.end("<html><head></head><body><h1>Not Found</h1></body></html>");
                $log.tools.endpointWarn("defaultEndpoint", req, "no body found", 0);
            }
        };
    },
    /**
     * Start the webserver
     * @param callback {function} function to call after starting the webserver
     * @returns {object} the current object ($ws)
     */
    start: function (callback) {
        $log.debug("Start web server on port " + $ws.config.port, 2);
        try {
            $ws.server = $ws.http.createServer($ws.app);
            if ($ws.config.websockets === true) {
                $ws.io = require('socket.io').listen($ws.server);
            }
            $ws.server.listen($ws.config.port || 8080);
        }
        catch (error) {
            $log.error('web server can\'t start because ' + error.message);
        }
        if (typeof callback === "function") {
            callback();
        }
        return this;
    },
    /**
     * Stop the webserver
     * @param callback {function} function to call after stopping the webserver
     * @returns {object} the current object ($ws)
     */
    stop: function (callback) {
        $log.debug("Stop web server ", 2);
        if (typeof callback === "function") {
            callback();
        }
        return this;
    },
    /**
     * Function used to get a sxapi-response object setting up with a OK response
     * @param res {object} the response object from the webserver
     * @param message {string} message describing these data
     * @param data {all} the data to return
     * @returns {object} response object ready to send a response (using send() method)
     */
    okResponse: function (res, message, data) {
        return this.response(res, 'ok', message, data);
    },
    /**
     * Function used to get a sxapi-response object setting up with a NOT OK response
     * @param res {object} the response object from the webserver
     * @param message {string} message describing the problem or error
     * @param data {all} additionals data usefull for error troubleshooting
     * @returns {object} response object ready to send a response (using send() method)
     */
    nokResponse: function (res, message, data) {
        return this.response(res, 'nok', message, data);
    },
    /**
     * Return a sxapi-response object
     * @param res {object} the response object from the webserver
     * @param type {string} ok or nok
     * @param message {string} message describing the problem or error
     * @param data {all} additionals data usefull for error troubleshooting
     * @returns {object} response object ready to send a response (using send() method)
     */
    response: function (res, type, message, data) {
        var obj = {
            res: res,
            httpcode: 200,
            httpheader: {"Content-Type": "application/json"},
            msg: {
                code: "ok"
            },
            send: function () {
                res.writeHead(this.httpcode, this.httpheader);
                res.end(JSON.stringify(this.msg));
                $log.debug(this.msg.code + "Response sended to client");
            },
            httpCode: function (code) {
                if (code) {
                    this.httpcode = code;
                }
                else {
                    this.httpcode = 200;
                }
                return this;
            },
            httpHeader: function (header) {
                if (header) {
                    this.httpheader = header;
                }
                return this;
            },
            addMessage: function (message) {
                if (message) {
                    this.msg.message = message;
                }
                else {
                    delete this.msg.message;
                }
                return this;
            },
            addData: function (data) {
                if (data) {
                    this.msg.data = data;
                }
                else {
                    delete this.msg.data;
                }
                return this;
            },
            addTotal: function (total) {
                if (total) {
                    this.msg.total = total;
                }
                else {
                    delete this.msg.total;
                }
                return this;
            },
            addDuration: function (duration) {
                if (duration) {
                    this.msg.duration = duration + 'ms';
                }
                else {
                    delete this.msg.duration;
                }
                return this;
            }
        };
        if (type === 'nok') {
            obj.httpcode = 400;
            obj.msg.code = 'nok';
        }
        if (message) {
            obj.addMessage(message);
        }
        if (data) {
            obj.addData(data);
        }
        return obj;
    },
    defaultRouter: function (configs) {
        var endpoints = configs.endpoints;
        delete configs.endpoints;
        $log.debug("Use router 'defaultRouter' for '" + configs.path + "'", 2);
        for (var i = 0; i < endpoints.length; i++) {
            var config = require('merge').recursive(true, configs, endpoints[i]);
            $ws._initEndpointConfig(config);
        }
    },
    dynamicRequestHandlerTest: function (config) {
        /**
         * Callback called when a hv endpoint is called
         * @param {object} req
         * @param {object} res
         * @returns {undefined}
         */
        return function (req, res) {
            require("./session").required(req, res, function () {
                res.writeHead(200);
                res.end("this text was generated with $app.ws.dynamicRequestHandlerTest. Le param_sample a été défini à " + config.param_sample);
                $log.tools.endpointDebug("defaultEndpoint", req, " return dynamic test content", 2);
            });
            return this;
        };
    }
};

module.exports = $ws;