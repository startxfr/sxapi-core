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
            $log.tools.resourceInfo($svif.id, "read service info");
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
            if (typeof cb === "function") {
                cb(error, serviceinfo);
            }
            return serviceinfo;
        },
        endpoints: {
            info: function (config) {
                /**
                 * Callback called when a defined endpoint is called
                 * @param {object} req
                 * @param {object} res
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($svif.id, req, "called", 1);
                    if ($app.resources.exist(config.resource)) {
                        $app.resources.get(config.resource).read(function (err, reponse) {
                            if (err) {
                                $app.ws.nokResponse(res, "error because " + err.message).httpCode(500).send();
                                $log.tools.endpointWarn($svif.id, req, "error reading service info because " + err.message);
                            }
                            else {
                                $app.ws.okResponse(res, "return service informations", reponse).send();
                                $log.tools.endpointDebug($svif.id, req, "returned service info", 2);
                            }
                        });
                    }
                    else {
                        $app.ws.nokResponse(res, "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                        $log.tools.endpointWarn($svif.id, req, "resource '" + config.resource + "' doesn't exist");
                    }
                };
            }
        }
    };
    $svif.init(config);
    return $svif;
};