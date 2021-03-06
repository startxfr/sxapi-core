/* global module, require, process, $log, $app */

//'use strict';

var $ws = {
  config: {},
  urlList: {},
  lib: null,
  init: function (config) {
    if (config) {
      $ws.config = config;
    }
    $log.debug("Init core module : sxapi-core-ws", 4);
    if (!$ws.config) {
      throw new Error("no 'server' section in config");
    }
    if (!$ws.config.port) {
      $ws.config.port = "8077";
    }
    if ($ws.config.port) {
      $ws.config.port = $log.format($ws.config.port, process.env);
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
      var type = $ws.config.bodyParserJsonType || "*/json";
      var optBpj = $ws.config.bodyParserJsonOptions || {type: type};
      $ws.app.use(bodyParser.json(optBpj));
    }
    if ($ws.config.bodyParserText !== false) {
      var type = $ws.config.bodyParserTextType || "text/*";
      var optBpt = $ws.config.bodyParserTextOptions || {type: type};
      $ws.app.use(bodyParser.raw(optBpt));
    }
    if ($ws.config.bodyParserRaw !== false) {
      var type = $ws.config.bodyParserRawType || "*/*";
      var optBpr = $ws.config.bodyParserRawOptions || {type: type};
      $ws.app.use(bodyParser.raw(optBpr));
    }
    if ($ws.config.bodyParserUrl !== false) {
      var type = $ws.config.bodyParserUrlType || "*/*";
      var optBpu = $ws.config.bodyParserUrlOptions || {type: type, extended: true};
      $ws.app.use(bodyParser.urlencoded(optBpu));
    }
    if ($ws.config.useCors !== false) {
      var optCors = $ws.config.corsOptions || {
        origin: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        exposedHeaders: "*",
        credentials: true
      };
      $ws.app.use(require('cors')(optCors));
    }
    if (typeof $ws.config.lib === "string") {
      $log.debug("use webserver custom library " + $ws.config.lib, 4);
      try {
        require.resolve("../" + $ws.config.lib);
        $ws.lib = require("../" + $ws.config.lib);
        $log.debug("loaded webserver custom library ../" + $ws.config.lib, 4);
      } catch (e) {
        try {
          require.resolve($ws.config.lib);
          $ws.lib = require($ws.config.lib);
          $log.debug("loaded webserver custom library " + $ws.config.lib, 4);
        } catch (e) {
          try {
            require.resolve($app.config.app_path + "/" + $ws.config.lib);
            $ws.lib = require($app.config.app_path + "/" + $ws.config.lib);
            $log.debug("loaded webserver custom library " + $app.config.app_path + "/" + $ws.config.lib, 4);
          } catch (e) {
            throw new Error("webserver custom library " + $ws.config.lib + " could not be found or loaded");
          }
        }
      }
    }
    if (typeof $ws.config.static === "object") {
      $log.debug("use static route description ", 5);
      for (var i = 0; i < $ws.config.static.length; i++) {
        this._initStatic($ws.config.static[i]);
      }
    }
    return this;
  },
  _initStatic: function (config) {
    var path = config.path || '/static';
    var dir = config.dir || config.directory || '/webapp';
    if (path === "/") {
      $log.debug("Add static endpoint  [ALL]    [root] > " + dir, 3);
      $ws.app.use($ws.express.static($app.config.app_path + dir));
    }
    else {
      $log.debug("Add static endpoint  [ALL]    " + path + " > " + dir, 3);
      $ws.app.use(path, $ws.express.static($app.config.app_path + dir));
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
    var urlDescriptor = {
      path: config.path,
      type: (typeof handler === "string") ? "dynamic" : "static ",
      endpoint: "defaultEndpoint"
    };
    if (typeof config.description !== "undefined") {
      urlDescriptor.description = config.description;
    }
    if (typeof handler === "string") {
      urlDescriptor.type = "dynamic";
      urlDescriptor.endpoint = "diy::" + handler;
      handler = eval(handler);
    }
    else if (typeof handler === "undefined" && config.method !== "ROUTER") {
      if (typeof config.resource === "string" && typeof config.endpoint === "string") {
        urlDescriptor.type = "dynamic";
        urlDescriptor.endpoint = config.resource + "::" + config.endpoint;
        var rs = require('./resource').get(config.resource);
        handler = eval('rs.endpoints.' + config.endpoint);
      }
      else if (config.directory !== undefined) {
        $log.debug("Add static  endpoint  [ALL]    " + config.path + " > ./" + config.directory, 3);
        urlDescriptor.endpoint = "static::" + config.directory;
        $ws.app.use(config.path, $ws.express.static(config.directory));
        $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
        return this;
      }
      else {
        urlDescriptor.endpoint = "defaultEndpoint";
        handler = $ws.__defaultEndpointCb;
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
        urlDescriptor.method = "ROUTER";
        $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
        fct(config);
        break;
      case "POST":
        urlDescriptor.method = "POST";
        $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
        $log.debug("Add " + urlDescriptor.type + " endpoint  [POST]   " + config.path + " > " + urlDescriptor.endpoint, 3);
        $ws.app.post(config.path, handler(config));
        break;
      case "PUT":
        urlDescriptor.method = "PUT";
        $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
        $log.debug("Add " + urlDescriptor.type + " endpoint  [PUT]    " + config.path + " > " + urlDescriptor.endpoint, 3);
        $ws.app.put(config.path, handler(config));
        break;
      case "DELETE":
        urlDescriptor.method = "DELETE";
        $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
        $log.debug("Add " + urlDescriptor.type + " endpoint  [DELETE] " + config.path + " > " + urlDescriptor.endpoint, 3);
        $ws.app.delete(config.path, handler(config));
        break;
      default:
        config.method = "GET";
        urlDescriptor.method = "GET";
        $ws.urlList[this._initEndpointGenerateUrlSign(urlDescriptor)] = urlDescriptor;
        $log.debug("Add " + urlDescriptor.type + " endpoint  [GET]    " + config.path + " > " + urlDescriptor.endpoint, 3);
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
        var data = require('merge')($app.getConfig(), process.env);
        var content = config.body;
        if (Array.isArray(config.body)) {
          content = config.body.join("\n");
        }
        content = $log.format(content, data);
        var header = (config.header) ? config.header : {"Content-Type": "text/html"};
        res.writeHead(code, header);
        res.end(content);
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
      if ($ws.config.enableWebsockets === true) {
        this.websockets.start();
      }
      $ws.server.listen($ws.config.port || 8077);
    }
    catch (err) {
      $log.error('web server can\'t start because ' + err.message);
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
    if (endpoints) {
      for (var i = 0; i < endpoints.length; i++) {
        var config = require('merge').recursive(true, configs, endpoints[i]);
        $ws._initEndpointConfig(config);
      }
    }
    else {
      $log.warn("Router 'defaultRouter' for '" + configs.path + "' could not find endpoints in configuration");
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
  },
  websockets: {
    start: function () {
      if ($ws.config.enableWebsockets === true) {
        $log.debug("Enable websockets on port " + $ws.config.port, 2);
        $ws.io = require('socket.io').listen($ws.server);
        $ws.config.websockets = require('merge').recursive(true, {
          onConnection: "$ws.websockets.onConnectionDefaultCallback",
          events: []
        }, $ws.config.websockets || {});
        var connectionHandler = eval($ws.config.websockets.onConnection);
        if (!$ws.config.websockets.events) {
          throw new Error("no 'events' key found in config 'websockets' section");
        }
        if (!$ws.config.endpoints instanceof Array) {
          throw new Error("'events' key in config 'websockets' section should be an array");
        }
        if (typeof connectionHandler !== "function") {
          throw new Error("websockets connection callback " + $ws.config.websockets.onConnection + " could not be loaded");
        }
        else {
          $log.debug("enable websockets connection callback " + $ws.config.websockets.onConnection, 4);
          $ws.io.on('connection', connectionHandler);
        }
      }
      else {
        $log.debug("websockets is disabled ", 5);
      }
    },
    _initClientEventCallback: function (config, position, client) {
      if (!config.event || "" + config.event === "") {
        $log.warn("Disable websockets client endpoint n°" + position + " because 'event' is not valid");
      }
      else {
        if (!config.handler) {
          $log.warn("Disable websockets client endpoint " + config.event + " because 'handler' is not valid");
        }
        else {
          var connectionHandler = eval(config.handler);
          if (typeof connectionHandler !== "function") {
            $log.warn("Disable websockets client endpoint " + config.event + " because 'handler' could not be loaded");
          }
          else {
            $log.debug("Add websockets connection client endpoint " + config.event + " for client " + client.id, 4);
            client.on("" + config.event, connectionHandler(client, config));
          }
        }
      }
    },
    onConnectionDefaultCallback: function (client) {
      $log.debug("new websocket client for " + client.id, 3);
      for (var i = 0; i < $ws.config.websockets.events.length; i++) {
        $ws.websockets._initClientEventCallback($ws.config.websockets.events[i], i, client);
      }
      client.emit("connected", {id: client.id});
    },
    onMessageDefaultCallback: function (client, config) {
      return function (data) {
        console.log(client.id, config, data);
      };
    }
  }
};

module.exports = $ws;