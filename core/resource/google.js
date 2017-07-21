/* global module, require, process, $log, $timer */
//'use strict';

/**
 * google resource handler
 * @module resource/google
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $gapi = {
        id: id,
        config: {},
        services: {},
        /**
         * Initiate the Google Auth resource and check resource config
         * @param {object} config the resource config object
         * @returns {$gapi}
         */
        init: function (config) {
            var timerId = 'resource_google_init_' + $gapi.id;
            var fs = require("fs");
            $timer.start(timerId);
            if (config) {
                $gapi.config = config;
            }
            $log.debug("resource '" + $gapi.id + "' : initializing", 3);
            if (!$gapi.config.auth) {
                throw new Error("no 'auth' key found in resource '" + $gapi.id + "' config");
            }
            if (!$gapi.config.auth.method) {
                throw new Error("no 'auth.method' key found in resource '" + $gapi.id + "' config");
            }
            else {
                if ($gapi.config.auth.method === 'jwt') {
                    if (!$gapi.config.auth.jwt.private_key) {
                        throw new Error("no 'auth.jwt.private_key' key found in resource '" + $gapi.id + "' config");
                    }
                    if (!$gapi.config.auth.jwt.client_email) {
                        throw new Error("no 'auth.jwt.client_email' key found in resource '" + $gapi.id + "' config");
                    }
                    if (!$gapi.config.auth.jwt.client_id) {
                        throw new Error("no 'auth.jwt.client_id' key found in resource '" + $gapi.id + "' config");
                    }
                    $log.debug("resource '" + $gapi.id + "' : use JWT auth " + $gapi.config.auth.jwt.client_id, 1, $timer.time(timerId));
                }
                else {
                    throw new Error("'auth.method' key '" + $gapi.config.auth.method + "' is not implemented in resource '" + $gapi.id + "' config");
                }
            }
            if ($gapi.config.services) {
                Object.keys($gapi.config.services).forEach(function (service) {
                    var confmod = $gapi.config.services[service];
                    var modPath = 'google_' + service;
                    if (fs.existsSync('core/resource/' + modPath + '.js')) {
                        $gapi.services[service] = require('./' + modPath)($gapi.id, confmod, $gapi);
                        $gapi.endpoints[service] = $gapi.services[service].endpoints;
                    }
                    else {
                        throw new Error('no resource found for service \'' + service + "' because file doesn't exist");
                    }
                });
            }
            $gapi.gapi = require('googleapis');
            $log.debug("resource '" + $gapi.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Start the Google Auth resource as defined in the config
         * @param {function} callback to call when startup is done
         * @returns {$gapi}
         */
        start: function (callback) {
            var timerId = 'resource_google_start_' + $gapi.id;
            $log.debug("resource '" + $gapi.id + "' : starting", 3);
            var cb = function () {
                Object.keys($gapi.services).forEach(function (service) {
                    $gapi.services[service].start();
                });
                $log.debug("resource '" + $gapi.id + "' : started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $gapi.open(cb);
            return this;
        },
        /**
         * Stop the Google Auth resource
         * @param {function} callback to call when stopped
         * @returns {$gapi}
         */
        stop: function (callback) {
            $log.debug("Stopping resource '" + $gapi.id + "'", 2);
            Object.keys($gapi.services).forEach(function (service) {
                $gapi.services[service].stop();
            });
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Open a connection the Google Auth defined in the resource config
         * @param {function} callback to call when Google answer
         * @returns {$gapi}
         */
        open: function (callback) {
            var timerId = 'resource_google_open_' + $gapi.id;
            $timer.start(timerId);
            $gapi.gapi_auth = new $gapi.gapi.auth.JWT(
                    $gapi.config.auth.jwt.client_email, null,
                    $gapi.config.auth.jwt.private_key,
                    $gapi.config.auth.scopes, null);
            $gapi.gapi_auth.authorize(function (err, tokens) {
                if (err) {
                    throw new Error("error in authenticating resource '" + $gapi.id + "' because " + err.message);
                    return;
                }
                else {
                    $log.debug("resource '" + $gapi.id + "' : authenticated with token " + tokens.access_token, 4, $timer.timeStop(timerId));
                    if (typeof callback === "function") {
                        callback(null, this);
                    }
                }
            });
            return this;
        },
        /**
         * Get 
         * @param {string} service name to get
         * @returns {$gapi}
         */
        getService: function (service) {
            if (!service) {
                throw new Error('no service name found');
            }
            else if ($gapi.services[service] !== undefined) {
                return $gapi.services[service];
            }
            else {
                throw new Error('service not loaded');
            }
            return this;
        },
        /**
         * Define a list of available endpoint for Google Auth service
         */
        endpoints: {
            /**
             * Endpoint who return a json object with google auth token used
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            getToken: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
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
                            ws.okResponse(res, message_prefix + " returned auth token", rs.gapi_auth.credentials).send();
                            $log.debug(message_prefix + "returned token " + rs.gapi_auth.credentials.access_token, 2);
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
    $gapi.init(config);
    return $gapi;
};