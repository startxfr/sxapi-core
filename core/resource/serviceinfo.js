/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * service info resource handler
 * @module resource/serviceinfo
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $svif = {
        id: id,
        config: {},
        init: function (config) {
            var timerId = 'resource_svif_init_' + $svif.id;
            $timer.start(timerId);
            $log.tools.resourceDebug($svif.id, "initializing", 3);
            if (config) {
                $svif.config = config;
            }
            $log.tools.resourceDebug($svif.id, "initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        start: function (callback) {
            $log.tools.resourceDebug($svif.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($svif.id, "started ", 1);
                if (typeof callback === "function") {
                    callback();
                }
            };
            $svif.open(cb);
            return this;
        },
        stop: function (callback) {
            $log.tools.resourceDebug($svif.id, "Stopping", 2);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        open: function (callback) {
            $log.tools.resourceDebug($svif.id, "opened", 4);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Read services informations from process and config
         * @param {function} callback called when informations are returned
         * @returns {$svif.serviceinfo}
         */
        read: function (callback) {
            var timerId = 'svif_read_' + $svif.id;
            $timer.start(timerId);
            $log.tools.resourceInfo($svif.id, "read()");
            var cb = (typeof callback === "function") ? callback : $svif.__readDefaultCallback;
            var obj = {
                server: {},
                endpoints: [],
                service: {}
            };
            var app = require("../app");
            var ws = $app.ws;
            if (process.env.HOSTNAME) {
                obj.server.hostname = process.env.HOSTNAME;
            }
            if (app.config.ip) {
                obj.server.ip = app.config.ip;
            }
            if (app.config.appsign) {
                obj.server.print = app.config.appsign;
            }
            if (app.config.name) {
                obj.service.name = app.config.name;
            }
            if (app.config.version) {
                obj.service.version = app.config.version;
            }
            if (app.config.description) {
                obj.service.description = app.config.description;
            }
            if (app.config.resources) {
                var ls = [];
                for (var id in app.config.resources) {
                    ls.push(id);
                }
                obj.service.resources = ls.join(", ");
            }
            if (ws.urlList) {
                for (var urlID in ws.urlList) {
                    obj.endpoints.push({
                        path: ws.urlList[urlID].path,
                        method: ws.urlList[urlID].method,
                        type: ws.urlList[urlID].type,
                        desc: ws.urlList[urlID].desc
                    });
                }
            }
            cb(null, obj);
            return this;
        },
        __readDefaultCallback: function (error, serviceinfo) {
            $log.tools.resourceDebug($svif.id, "default callback", 4);
            console.log(error, serviceinfo);
            return serviceinfo;
        },
        /**
         * Read health from process and config
         * @param {function} callback called when informations are returned
         * @returns {$svif.serviceinfo}
         */
        health: function (callback) {
            var timerId = 'svif_health_' + $svif.id;
            $timer.start(timerId);
            $log.tools.resourceInfo($svif.id, "health()");
            var cb = (typeof callback === "function") ? callback : $svif.__healthDefaultCallback;
            var obj = {status: "ok", health: "good"};
            cb(null, obj);
            return this;
        },
        __healthDefaultCallback: function (error, health) {
            $log.tools.resourceDebug($svif.id, "default callback", 4);
            console.log(error, health);
            return health;
        },
        endpoints: {
            info: function (config) {
                /**
                 * Callback called when a defined endpoint is called
                 * @param {object} req
                 * @param {object} res
                 */
                return function (req, res) {
                    var callback = function (err, reponse) {
                        if (err) {
                            $log.tools.endpointErrorAndAnswer(res, $svif.id, req, "error because " + err.message);
                        }
                        else {
                            $log.tools.endpointDebugAndAnswer(res, reponse, $svif.id, req, "return service informations", 2);
                        }
                    };
                    $log.tools.endpointDebug($svif.id, req, "info()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).read(callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $svif.id, req, config.resource);
                    }
                };
            },
            health: function (config) {
                /**
                 * Callback called when a defined endpoint is called
                 * @param {object} req
                 * @param {object} res
                 */
                return function (req, res) {
                    var callback = function (err, reponse) {
                        if (err) {
                            $log.tools.endpointErrorAndAnswer(res, $svif.id, req, "error because " + err.message);
                        }
                        else {
                            $log.tools.endpointDebugAndAnswer(res, reponse, $svif.id, req, "return service informations", 2);
                        }
                    };
                    $log.tools.endpointDebug($svif.id, req, "health()", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).health(callback);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $svif.id, req, config.resource);
                    }
                };
            }
        }
    };
    $svif.init(config);
    return $svif;
};