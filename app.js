/* global require, process, $log, $timer */

var $app = require("./core/app");


var $api = {
    /**
     * Callback called when a search endpoint is called
     * @param {object} config
     * @returns {undefined}
     */
    authEndpoint: function (config) {
        /**
         * Callback called when a hv endpoint is called
         * @param {object} req
         * @param {object} res
         * @returns {undefined}
         */
        return function (req, res) {
            $timer.start('authEndpoint');
            $log.debug("Start 'authEndpoint'", 2);
            var crypto = require('crypto');
            var login = req.body.login;
            var pwd = req.body.password;
            var pwdhash = crypto
                    .createHash(config.hashAlgorithm)
                    .update(pwd)
                    .digest(config.digest);

            // in db toto = MfemXjFVhqwZi9eYtmKc5JA9CJlHbVdBqfMuLlIbamY=
            // 1. dans cb créer la clef userpwd::toto::MfemXjFVhqwZi9eYtmKc5JA9CJlHbVdBqfMuLlIbamY=
            //    associé au doc suivant : {"type" : "userpwd" , "user" : "toto" , "hash" : "MfemXjFVhqwZi9eYtmKc5JA9CJlHbVdBqfMuLlIbamY=", "updated": 1430616693927}
            var responseCouchbase = {type: "userpwd", user: "toto", hash: "MfemXjFVhqwZi9eYtmKc5JA9CJlHbVdBqfMuLlIbamY=", updated: 1430616693927};

            if (responseCouchbase) {
                require("./core/ws")
                        .okResponse(res, "auth found", {
                            name: login,
                            hash: pwdhash
                        })
                        .addDuration($timer.timeStop('authEndpoint'))
                        .send();
                $log.info("Endpoint '" + config.path + "' answered OK");
            }
            else {
                require("./core/ws")
                        .nokResponse(res, "auth not found", {
                            name: login,
                            hash: pwdhash
                        })
                        .addDuration($timer.timeStop('authEndpoint'))
                        .httpCode(401)
                        .send();
                $log.warn("Endpoint '" + config.path + "' answered ERROR");
            }
        };
    },
    /**
     * Callback called when a search endpoint is called
     * @param {object} config
     * @returns {undefined}
     */
    registryEndpoint: function (config) {
        /**
         * Callback called when a hv endpoint is called
         * @param {object} req
         * @param {object} res
         * @returns {undefined}
         */
        return function (req, res) {
            $timer.start('registryEndpoint');
            $log.debug("Start 'registryEndpoint'", 2);
            if (!config.resource) {
                throw new Error("no 'resource' key found in 'registryEndpoint' config");
            }
            if (!require('./core/resource').exist(config.resource)) {
                throw new Error("resource '" + config.resource + "' found in 'registryEndpoint' config doesn't exist");
            }
            if (!config.query_view) {
                throw new Error("no 'query_view' key found in 'registryEndpoint' config");
            }
            if (typeof config.query_view !== 'string') {
                throw new Error("in 'registryEndpoint' config key 'query_view' must be a string (design:view)");
            }
            var view = config.query_view.split(":");
            var queryCallback = function (req, res) {
                return function (err, results) {
                    if (err) {
                        $log.error('query could not be executed because ' + err.message + ' [' + err.code + ']');
                    }
                    else {
                        var data = [];
                        $log.debug('Query with ' + results.length + " results", 3);
                        for (var i in results) {
                            data.push(require('merge').recursive(true, {"id": results[i].id}, results[i].value));
                        }
                        require("./core/ws")
                                .okResponse(res, results.length + " results found", data)
                                .addDuration($timer.timeStop('registryEndpoint'))
                                .addTotal(data.length)
                                .send();
                        $log.info("Endpoint '" + config.path + "' answered OK");
                    }
                };
            };
            require('./core/resource').get(config.resource).query(view[0], view[1], queryCallback(req, res));
        };
    },
    /**
     * Callback called when a session endpoint is called
     * @param {object} config
     * @returns {undefined}
     */
    sessionEndpoint: function (config) {
        /**
         * Callback called when a hv endpoint is called
         * @param {object} req
         * @param {object} res
         * @returns {undefined}
         */
        return function (req, res) {
            // normalement ici on va faire : 
            // 1. lecture des param de session passé en en-tete
            // 2.1 si pas de param, on créeer un session anonyme
            // 2.2 si param on verifie dans cb si elle existe
            //   2.2.1 on check si pas expiré
            //   2.2.2 si lié à un user, on l'importe
            $timer.start('sessionEndpoint');
            $log.debug("Start 'sessionEndpoint'", 2);
            require("./core/ws")
                    .okResponse(res, "session found", {
                        id: "sdqsfdgfgdhhdfghfgh",
                        start: 15464646,
                        end: 15464646,
                        duration: 3600,
                        user: null
                    })
                    .addDuration($timer.timeStop('sessionEndpoint'))
                    .send();
            $log.info("Endpoint '" + config.path + "' answered OK");
        };
    }
};
process.$api = $api;

$app
        .onStop(function () {
            $log.info('application stopped', $timer.time('app'));
            return this;
        })
        .launch(function () {
            $log.info("application started", $timer.time('app'));
        });
