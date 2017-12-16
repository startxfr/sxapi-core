/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * http resource handler
 * @module resource/http
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $htcli = {
        id: id,
        pool: [],
        config: {},
        init: function (config) {
            var timerId = 'resource_http_init_' + $htcli.id;
            $timer.start(timerId);
            if (config) {
                $htcli.config = config;
            }
            $log.tools.resourceDebug($htcli.id, "initializing", 3);
            $htcli.config._sign = $htcli.id;
            if (typeof $htcli.pool[$htcli.config._sign] === 'undefined') {
                $log.tools.resourceDebug($htcli.id, "initialize http connection to " + $htcli.config._sign, 4);
                $htcli.pool[$htcli.config._sign] = require("request");
            }
            else {
                $log.tools.resourceDebug($htcli.id, "resource '" + $htcli.id + "' : use existing connection to http " + $htcli.config._sign, 4);
            }
            $log.tools.resourceDebug($htcli.id, "initialized ", 1, $timer.timeStop(timerId));
            return $htcli;
        },
        start: function (callback) {
            var timerId = 'resource_http_start_' + $htcli.id;
            $log.tools.resourceDebug($htcli.id, "starting", 3);
            $log.tools.resourceDebug($htcli.id, "started ", 1, $timer.timeStop(timerId));
            if (typeof callback === "function") {
                callback();
            }
            return $htcli;
        },
        stop: function (callback) {
            $log.tools.resourceDebug($htcli.id, "Stopping", 2);
            $htcli.pool[$htcli.config._sign] = null;
            if (typeof callback === "function") {
                callback(null, $htcli);
            }
            return $htcli;
        },
        open: function (callback) {
            var timerId = 'http_open_' + $htcli.id;
            $timer.start(timerId);
            $log.tools.resourceDebug($htcli.id, "opening '" + $htcli.config._sign + "'", 4, $timer.timeStop(timerId));
            if (typeof callback === "function") {
                callback(null, $htcli);
            }
            return $htcli;
        },
        call: function (url, options, callback) {
            var timerId = 'http_query_' + require('uuid').v1();
            $timer.start(timerId);
            var opt = (typeof options === 'object') ? require('merge').recursive(true, $htcli.config, options) : $htcli.config;
            if (typeof url === "string") {
                opt.url = url;
            }
            $log.tools.resourceInfo($htcli.id, "call url " + opt.url);
            return $htcli.pool[$htcli.config._sign](opt, (callback) ? callback(timerId) : $htcli.__queryDefaultCallback(timerId));
        },
        __queryDefaultCallback: function (timerId) {
            return function (error, response, body) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceError("query could not be executed because " + error.message, duration);
                }
            };
        },
        __reader: function (content, response) {
            var r = {length: content.length, type: "string", content: content};
            var t = (response && response.headers && response.headers["content-type"]) ? response.headers["content-type"] : "";
            if (t.indexOf('application/javascript') !== -1) {
                eval("r.content = " + content);
                r.type = (Array.isArray(r.content)) ? 'array' : 'object';
                r.length = r.content.length + ((Array.isArray(r.content)) ? ' objects' : ' properties');
            }
            else if (t.indexOf('application/json') !== -1) {
                r.content = JSON.parse(content);
                r.type = (Array.isArray(r.content)) ? 'array' : 'object';
                r.length = r.content.length + ((Array.isArray(r.content)) ? ' objects' : ' properties');
            }
            return r;
        },
        endpoints: {
            call: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($htcli.id, req, "call()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.call(config.url, config, function (timerId) {
                            return function (err, response, body) {
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $htcli.id, req, "error because " + err.message);
                                }
                                else {
                                    var result = rs.__reader(body, response);
                                    var msg = "returned " + result.type + " with " + result.length;
                                    $log.tools.endpointDebugAndAnswer(res, result.content, $htcli.id, req, msg, 2, $timer.timeStop(timerId));
                                }
                            }
                            ;
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $htcli.id, req, config.resource);
                    }
                };
            }
        }
    };
    $htcli.init(config);
    return $htcli;
};