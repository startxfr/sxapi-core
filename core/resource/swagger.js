/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * swagger info resource handler
 * @module resource/swagger
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
  var $swgr = {
    id: id,
    config: {},
    init: function (config) {
      var timerId = 'resource_swgr_init_' + $swgr.id;
      $timer.start(timerId);
      $log.tools.resourceDebug($swgr.id, "initializing", 3);
      if (config) {
        $swgr.config = config;
      }
      $log.tools.resourceDebug($swgr.id, "initialized ", 1, $timer.timeStop(timerId));
      return this;
    },
    start: function (callback) {
      $log.tools.resourceDebug($swgr.id, "Starting resource", 3);
      var cb = function () {
        $log.tools.resourceDebug($swgr.id, "started ", 1);
        if (typeof callback === "function") {
          callback();
        }
      };
      $swgr.open(cb);
      return this;
    },
    stop: function (callback) {
      $log.tools.resourceDebug($swgr.id, "Stopping resource", 2);
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    open: function (callback) {
      $log.tools.resourceDebug($swgr.id, "opened", 4);
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    /**
     * Read services informations from process and config
     * @param {function} callback called when informations are returned
     * @returns {$swgr.swagger}
     */
    getManifest: function (callback) {
      var timerId = 'swgr_getManifest_' + $swgr.id;
      $timer.start(timerId);
      $log.tools.resourceInfo($swgr.id, "getManifest()");
      var cb = (typeof callback === "function") ? callback : $swgr.__getManifestDefaultCallback;
      var app = require("../app");
      var obj = {
        swagger: '2.0',
        info: {
          version: app.config.version || '0.0.0',
          title: app.config.name || 'My app',
          description: app.config.description || 'Description of my app.',
          termsOfService: app.config.termsOfService || 'My app terms of service',
          contact: {
            name: app.config.contactName || 'My app owner',
            email: app.config.contactMail || 'contact@example.com'
          },
          license: {
            name: app.config.license || 'Unknown',
            url: app.config.termsOfService || 'My app terms of service',
          }
        },
        basePath: '/',
        paths: {},
//        server: {},
//        endpoints: [],
//        service: {}
      };
      var ws = $app.ws;
      if (ws.urlList) {
        for (var urlID in ws.urlList) {
          if (!obj.paths.hasOwnProperty(ws.urlList[urlID].path)) {
            obj.paths[ws.urlList[urlID].path] = {};
          }
          obj.paths[ws.urlList[urlID].path][ws.urlList[urlID].method.toLowerCase()] = {
            tags: [],
            summary: ws.urlList[urlID].description || ws.urlList[urlID].method + " on " + ws.urlList[urlID].path,
            description: ws.urlList[urlID].description || ws.urlList[urlID].type + " on " + ws.urlList[urlID].path,
            produces: ["application/json"],
            responses:{
              "200":{
                "description":"successful operation"
              }
            },
            parameters: []
          };
        }
      }
      cb(null, obj);
      return this;
    },
    __getManifestDefaultCallback: function (error, swagger) {
      $log.tools.resourceDebug($swgr.id, "getManifest default callback", 4);
      console.log(error, swagger);
      return swagger;
    },
    endpoints: {
      manifest: function (config) {
        /**
         * Callback called when a defined endpoint is called
         * @param {object} req
         * @param {object} res
         */
        return function (req, res) {
          var callback = function (err, reponse) {
            if (err) {
              $log.tools.endpointErrorAndAnswer(res, $swgr.id, req, "error because " + err.message);
            }
            else {
              if (config.notification !== undefined) {
                $app.notification.notif(config.notification, reponse);
              }
              $log.tools.endpointDebugAndAnswer(res, reponse, $swgr.id, req, "return swagger maps", 2);
            }
          };
          $log.tools.endpointDebug($swgr.id, req, "manifest()", 1);
          if ($app.resources.exist(config.resource)) {
            $app.resources.get(config.resource).getManifest(callback);
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $swgr.id, req, config.resource);
          }
        };
      }
    }
  };
  $swgr.init(config);
  return $swgr;
};