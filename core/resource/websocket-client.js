/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * websocket-client resource handler
 * @module resource/websocket-client
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
  var $skio = {
    id: id,
    pool: [],
    config: {},
    init: function (config) {
      var timerId = 'resource_websocket-client_init_' + $skio.id;
      $timer.start(timerId);
      if (config) {
        $skio.config = config;
      }
      console.log($skio.config)
      $log.tools.resourceDebug($skio.id, "initializing", 3);
      $skio.config._sign = $skio.id;
      if (!$skio.config.host) {
        throw new Error("no 'host' key found in resource '" + $skio.id + "' config");
      }
      if (typeof $skio.pool[$skio.config._sign] === 'undefined') {
        $log.tools.resourceDebug($skio.id, "initialize websocket-client connection to " + $skio.config._sign, 4);
        $skio.pool[$skio.config._sign] = require("socket.io-client");
      }
      else {
        $log.tools.resourceDebug($skio.id, "resource '" + $skio.id + "' : use existing websocket connection " + $skio.config._sign, 4);
      }
      $log.tools.resourceDebug($skio.id, "initialized ", 1, $timer.timeStop(timerId));
      return $skio;
    },
    start: function (callback) {
      var timerId = 'resource_websocket-client_start_' + $skio.id;
      if (typeof $skio.pool[$skio.config._sign] !== 'undefined') {
        $log.tools.resourceDebug($skio.id, "Starting resource " + $skio.config._sign, 3);
        $skio.pool[$skio.config._sign]($skio.config.host);
        $log.tools.resourceDebug($skio.id, "Connected to "+$skio.config.host, 1, $timer.timeStop(timerId));
      }
      else {
        $log.tools.resourceWarn($skio.id, "resource '" + $skio.id + "' is not initialized and could not be started", 4);
      }
      if (typeof callback === "function") {
        callback();
      }
      return $skio;
    },
    stop: function (callback) {
      $log.tools.resourceDebug($skio.id, "Stopping resource", 2);
      $skio.pool[$skio.config._sign].emit("disconnect");
      $skio.pool[$skio.config._sign] = null;
      if (typeof callback === "function") {
        callback(null, $skio);
      }
      return $skio;
    },
    on: function (event, callback) {
      $log.tools.resourceDebug($skio.id, "listening event " + event, 3);
      $skio.pool[$skio.config._sign].on(event, callback);
    },
    emit: function (event, data, callback) {
      $log.tools.resourceDebug($skio.id, "emiting event " + event, 5);
      if (typeof callback === "function") {
        $skio.pool[$skio.config._sign].emit(event, data, callback);
      }
      else {
        $skio.pool[$skio.config._sign].emit(event, data);
      }
    },
    endpoints: {
      emit: function (config) {
        return function (req, res) {
          $log.tools.endpointDebug($skio.id, req, "emit()", 1);
          if ($app.resources.exist(config.resource)) {
            var rs = $app.resources.get(config.resource);
            rs.emit(config.event, req.body, function (response) {
              if (config.notification !== undefined) {
                $app.notification.notif(config.notification, response);
              }
              $log.tools.endpointDebugAndAnswer(res, response, $skio.id, req, "event " + config.event + " emited", 2);
            });
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $skio.id, req, config.resource);
          }
        };
      }
    }
  };
  $skio.init(config);
  return $skio;
};