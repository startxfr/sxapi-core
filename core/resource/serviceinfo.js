/* global module, require, process, $log, $timer */
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
            $log.debug("resource '" + $svif.id + "' : initializing", 3);
            if (config) {
                $svif.config = config;
            }
            $log.debug("resource '" + $svif.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        start: function (callback) {
            $log.debug("resource '" + $svif.id + "' : starting", 3);
            var cb = function () {
                $log.debug("resource '" + $svif.id + "' : started ", 1);
                if (typeof callback === "function") {
                    callback();
                }
            };
            $svif.open(cb);
            return this;
        },
        stop: function (callback) {
            $log.debug("Stopping resource '" + $svif.id + "'", 2);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        open: function (callback) {
            $log.debug("resource '" + $svif.id + "' : opened", 4);
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
            $log.debug("Read service info ", 4);
            var cb = (typeof callback === "function") ? callback : $svif.__readDefaultCallback;
            var obj = {
                server: {}, 
                endpoints: [], 
                service: {}
            };
            var app = require("../app");
            var ws = require("../ws");
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
            $log.debug("return service info", 4);
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
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.read(function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error reading service info because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + " read service info ", reponse).send();
                                    $log.debug(message_prefix + "returned service info", 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, message_prefix + "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            }
        }
    };
    $svif.init(config);
    return $svif;
};