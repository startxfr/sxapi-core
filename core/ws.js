/* global module, require, process */

//'use strict';

var $ws = {
    config: {},
    init: function (config) {
        if (config) {
            $ws.config = config;
        }
        require('./log').debug("Init ws module", 2);
        if (!$ws.config) {
            throw new Error("no 'server' section in config");
        }
        if (!$ws.config.port) {
            throw new Error("no 'port' key found in config 'server' section");
        }
        if (!$ws.config.endpoints) {
            throw new Error("no 'endpoints' key found in config 'server' section");
        }
        if (!$ws.config.endpoints instanceof Array) {
            throw new Error("'endpoints' key in config 'server' section should be an array");
        }
        this._initApp();
        this._initEndpoints($ws.config.endpoints, true);
        $ws.server = $ws.http.createServer($ws.app);
        if ($ws.config.io && $ws.config.io === true) {
            $ws.io = require('socket.io').listen($ws.server);
        }
        return this;
    },
    _initApp: function () {
        $ws.express = require('express');
        $ws.http = require('http');
        $ws.app = $ws.express();
        var bodyParser = require('body-parser');
        if ($ws.config.bodyParserJson && $ws.config.bodyParserJson === true) {
            $ws.app.use(bodyParser.json());
        }
        if ($ws.config.bodyParserUrl && $ws.config.bodyParserUrl === true) {
            $ws.app.use(bodyParser.urlencoded({extended: true}));
        }
        $ws.app.use(require('cors')({
            origin: true,
            methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
            exposedHeaders: "*",
            credentials: true
        }));
        if ($ws.config.static && $ws.config.static !== "") {
            $ws.app.use('/', $ws.express.static('webapp'));
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
        config.method = config.method ? config.method : 'GET';
        config.path = config.path ? config.path : '/';
        if (withRouting === true) {
            if (!$ws.routing[config.path]) {
                $ws.routing[config.path] = {};
            }
            if (!$ws.routing[config.path][config.method]) {
                $ws.routing[config.path][config.method] = config;
            }
            else {
                $ws.routing[config.path][config.method] =
                        require('merge').recursive(true,
                        $ws.routing[config.path][config.method],
                        config);
            }
        }
        var eptype = "static ";
        var ephdname = config.handler;
        if (typeof config.handler === "string") {
            eptype = "dynamic";
            config.handler = eval(config.handler);
        }
        else if (typeof config.handler === "undefined" && config.method !== "ROUTER") {
            ephdname = "$ws.__endpointCallback";
            config.handler = $ws.__endpointCallback;
        }
        switch (config.method) {
            case "ROUTER":
                var fct = null;
                if (typeof config.handler === "function") {
                    fct = config.handler;
                }
                else {
                    fct = $ws.defaultRouter;
                }
                fct(config);
                break;
            case "POST":
                require("./log").debug("Add " + eptype + " endpoint  [POST]   " + config.path + " > " + ephdname, 3);
                $ws.app.post(config.path, config.handler(config));
                break;
            case "PUT":
                require("./log").debug("Add " + eptype + " endpoint  [PUT]    " + config.path + " > " + ephdname, 3);
                $ws.app.put(config.path, config.handler(config));
                break;
            case "DELETE":
                require("./log").debug("Add " + eptype + " endpoint  [DELETE] " + config.path + " > " + ephdname, 3);
                $ws.app.delete(config.path, config.handler(config));
                break;
            default:
                require("./log").debug("Add " + eptype + " endpoint  [GET]    " + config.path + " > " + ephdname, 3);
                $ws.app.get(config.path, config.handler(config));
        }

        return this;
    },
    /**
     * Callback called when a defined endpoint is called
     * @param {object} config
     * @returns {undefined}
     */
    __endpointCallback: function (config) {
        /**
         * Callback called when a defined endpoint is called
         * @param {object} req
         * @param {object} res
         * @returns {undefined}
         */
        return function (req, res) {
            var path = req.url.split("?")[0];
            require("./log").debug("Endpoint '" + path + "' called", 1);
            if (config.body) {
                var code = (config.code) ? config.code : 200;
                var header = (config.header) ? config.header : {"Content-Type": "text/html"};
                res.writeHead(code, header);
                res.end(config.body);
                require("./log").info("Endpoint '" + path + "' answered static document [" + code + "]");
            }
            else {
                res.writeHead(404, {"Content-Type": "text/html"});
                res.end("<html><head></head><body><h1>Not Found</h1></body></html>");
                require("./log").warn("Endpoint " + req.method + " '" + path + "' not found");
            }
        }
    },
    start: function (callback) {
        require("./log").debug("Start web server on port " + $ws.config.port, 2);
        try {
            $ws.server.listen($ws.config.port);
        }
        catch (e) {
            require("./log").error('web server can\'t start because ' + e.message + ' [' + e.code + ']');
        }
        if (typeof callback === "function") {
            callback();
        }
        return this;
    },
    stop: function (callback) {
        require("./log").debug("Stop web server ", 2);
        if (typeof callback === "function") {
            callback();
        }
        return this;
    },
    okResponse: function (res, message, data) {
        return this.response(res, 'ok', message, data);
    },
    nokResponse: function (res, message, data) {
        return this.response(res, 'nok', message, data);
    },
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
                require("./log").debug("okResponse sended to client");
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
    dynamicRequestHandlerTest: function (config) {
        /**
         * Callback called when a hv endpoint is called
         * @param {object} req
         * @param {object} res
         * @returns {undefined}
         */
        return function (req, res) {
            res.writeHead(200);
            res.end("this text was generated with require('./ws').dynamicRequestHandlerTest. Le param_sample a été défini à " + config.param_sample);
            require("./log").debug("Endpoint '" + config.path + "' answered with dynamic document", 3);
            return this;
        };
    },
    defaultRouter: function (configs) {
        var $ws = require("./ws");
        var endpoints = configs.endpoints;
        delete configs.endpoints;
        require("./log").debug("Use router '$ws.defaultRouter' for '" + configs.path + "'", 2);
        for (var i = 0; i < endpoints.length; i++) {
            var config = require('merge').recursive(true, configs, endpoints[i]);
            var eptype = (typeof config.handler === "string") ? "dynamic" : "static ";
            var ephdname = (config.handler) ? config.handler : "$ws.__endpointCallback";
            if (typeof config.handler === "string") {
                config.handler = eval(config.handler);
            }
            else if (typeof config.handler === "undefined" && config.method !== "ROUTER") {
                config.handler = $ws.__endpointCallback;
            }
            if (config.method === "ROUTER") {
                var fct = null;
                if (typeof config.handler === "function") {
                    fct = config.handler;
                }
                else {
                    fct = $ws.defaultRouter;
                }
                fct(config);
            }
            else if (config.method === "POST") {
                require("./log").debug("Add " + eptype + " endpoint  [POST]   " + config.path + " > " + ephdname, 3);
                $ws.app.post(config.path, config.handler(config));
            }
            else if (config.method === "PUT") {
                require("./log").debug("Add " + eptype + " endpoint  [PUT]    " + config.path + " > " + ephdname, 3);
                $ws.app.put(config.path, config.handler(config));
            }
            else if (config.method === "DELETE") {
                require("./log").debug("Add " + eptype + " endpoint  [DELETE] " + config.path + " > " + ephdname, 3);
                $ws.app.delete(config.path, config.handler(config));
            }
            else {
                require("./log").debug("Add " + eptype + " endpoint  [GET]    " + config.path + " > " + ephdname, 3);
                $ws.app.get(config.path, config.handler(config));
            }
        }
    },
};

module.exports = $ws;