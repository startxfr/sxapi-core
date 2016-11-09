/* global module, require, process, $log */

//'use strict';

var $ws = {
    config: {},
    init: function (config) {
        if (config) {
            $ws.config = config;
        }
        $log.debug("Init ws module", 2);
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
        if ($ws.config.websockets && $ws.config.websockets === true) {
            $ws.io = require('socket.io').listen($ws.server);
        }
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
            $ws.app.use('/static', $ws.express.static('webapp'));
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
                $ws.routing[path][method] = require('merge').recursive(true,$ws.routing[path][method],config);
            }
        }
        $ws._initEndpointConfig(config);
        return this;
    },
    _initEndpointConfig: function (config) {
        var handler = config.handler || false;
        var eptype = (typeof handler === "string") ? "dynamic" : "static ";
        var ephdname = (handler) ? handler : "$ws.__endpointCallback";
        if (typeof handler === "string") {
            eptype = "dynamic";
            handler = eval(handler);
        }
        else if (typeof handler === "undefined" && config.method !== "ROUTER") {
            if (typeof config.resource === "string" && typeof config.resource_handler === "string") {
                eptype = "dynamic";
                var rs = require('./resource').get(config.resource);
                ephdname = config.resource+"::"+config.resource_handler;
                handler = eval('rs.'+config.resource_handler);
            }
            else {
                ephdname = "$ws.__endpointCallback";
                handler = $ws.__endpointCallback;
            }
        }
        switch (config.method) {
            case "ROUTER":
                var fct = null;
                if (typeof handler === "function") {
                    fct = handler;
                }
                else {
                    fct = $ws.defaultRouter;
                }
                fct(config);
                break;
            case "POST":
                $log.debug("Add " + eptype + " endpoint  [POST]   " + config.path + " > " + ephdname, 3);
                $ws.app.post(config.path, handler(config));
                break;
            case "PUT":
                $log.debug("Add " + eptype + " endpoint  [PUT]    " + config.path + " > " + ephdname, 3);
                $ws.app.put(config.path, handler(config));
                break;
            case "DELETE":
                $log.debug("Add " + eptype + " endpoint  [DELETE] " + config.path + " > " + ephdname, 3);
                $ws.app.delete(config.path, handler(config));
                break;
            default:
                $log.debug("Add " + eptype + " endpoint  [GET]    " + config.path + " > " + ephdname, 3);
                $ws.app.get(config.path, handler(config));
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
            $log.debug("Endpoint '" + path + "' called", 1);
            if (config.body) {
                var code = (config.code) ? config.code : 200;
                var header = (config.header) ? config.header : {"Content-Type": "text/html"};
                res.writeHead(code, header);
                res.end(config.body);
                $log.info("Endpoint '" + path + "' answered static document [" + code + "]");
            }
            else {
                res.writeHead(404, {"Content-Type": "text/html"});
                res.end("<html><head></head><body><h1>Not Found</h1></body></html>");
                $log.warn("Endpoint " + req.method + " '" + path + "' not found");
            }
        };
    },
    start: function (callback) {
        $log.debug("Start web server on port " + $ws.config.port, 2);
        try {
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
    stop: function (callback) {
        $log.debug("Stop web server ", 2);
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
                $log.debug("okResponse sended to client");
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
            $log.debug("Endpoint '" + config.path + "' answered with dynamic document", 3);
            return this;
        };
    },
    defaultRouter: function (configs) {
        var endpoints = configs.endpoints;
        delete configs.endpoints;
        $log.debug("Use router '$ws.defaultRouter' for '" + configs.path + "'", 2);
        for (var i = 0; i < endpoints.length; i++) {
            var config = require('merge').recursive(true, configs, endpoints[i]);
            $ws._initEndpointConfig(config);
        }
    }
};

module.exports = $ws;