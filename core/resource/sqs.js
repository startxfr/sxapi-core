/* global module, require, process, $log, $timer */
//'use strict';

/**
 * sqs resource handler
 * @module resource/sqs
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $sqs = {
        id: id,
        config: {},
        init: function (config) {
            var timerId = 'resource_sqs_init_' + $sqs.id;
            $timer.start(timerId);
            if (config) {
                $sqs.config = config;
            }
            $log.debug("resource '" + $sqs.id + "' : initializing", 3);
            if (!$sqs.config.config) {
                throw new Error("no 'config' key found in resource '" + $sqs.id + "' config");
            }
            if (!$sqs.config.config.QueueUrl) {
                throw new Error("no 'QueueUrl' key found in resource '" + $sqs.id + "' config");
            }
            $sqs.AWS = require('aws-sdk');
            $log.debug("resource '" + $sqs.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        start: function (callback) {
            var timerId = 'resource_sqs_start_' + $sqs.id;
            $log.debug("Starting resource '" + $sqs.id + "'", 2);
            var cb = function () {
                $log.debug("resource '" + $sqs.id + "' : started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $sqs.open(cb);
            return this;
        },
        stop: function (callback) {
            $log.debug("Stopping resource '" + $sqs.id + "'", 2);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        open: function (callback) {
            var timerId = 'sqs_open_' + $sqs.id;
            $timer.start(timerId);
            var config = {};
            if ($sqs.config.ACCESS_ID) {
                config.accessKeyId = $sqs.config.ACCESS_ID;
            }
            if ($sqs.config.ACCESS_KEY) {
                config.secretAccessKey = $sqs.config.ACCESS_KEY;
            }
            if ($sqs.config.SESSION_TOKEN) {
                config.sessionToken = $sqs.config.SESSION_TOKEN;
            }
            config.region = $sqs.config.region || "us-west-1";
            $sqs.sqsqueue = new $sqs.AWS.SQS(config);
            $sqs.__openHandler(callback, timerId);
            return this;
        },
        __openHandler: function (callback, timerId) {
            var duration = $timer.timeStop(timerId);
            $log.debug("resource '" + $sqs.id + "' : connected to '" + $sqs.config.config.QueueUrl + "'", 4, duration);
            if (typeof callback === "function") {
                callback(null, this);
            }
        },
        /**
         * Read the SQS queue  defined in the config.queue section of sxapi.json
         * @returns {$queue.sqs}
         */
        read: function (callback) {
            var timerId = 'sqs_read_' + $sqs.id;
            $timer.start(timerId);
            $log.debug("Read SQS queue " + $sqs.config.config.QueueUrl, 4, null, true);
            var cb = (typeof callback === "function") ? callback : $sqs.__readDefaultCallback;
            $sqs.sqsqueue.receiveMessage($sqs.config.config,
                    function (error, response) {
                        cb(error, response, cb, timerId);
                    });
            return this;
        },
        __readDefaultCallback: function (error, response, cb, timerId) {
            if (error) {
                $log.warn("error from SQS queue because" + error.message, $timer.time(timerId));
                if (error.retryable) {
                    $log.debug('retry to call this queue in ' + error.retryDelay + 'sec', 2, null, true);
                    var t = (error.retryDelay * 1000) - $sqs.config.frequency;
                    var timer = (t > 0) ? t : 30;
                    $sqs.stop();
                    $sqs.timer = setTimeout(function () {
                        $sqs.read(cb);
                    }, timer);
                }
                else {
                    $log.warn('this queue error is not retryable', $timer.timeStop(timerId));
                    $sqs.stop();
                }
            }
            else {
                if (response.Messages) {
                    var nb = response.Messages.length;
                    $log.debug("received " + nb + " messages from SQS queue", 4, $timer.timeStop(timerId));
                }
                else {
                    $log.debug("received an empty response from SQS queue", 4, $timer.timeStop(timerId));
                }
            }
        },
        /**
         * Remove a message from the SQS queue
         * @param {object} message
         * @param {function} callback
         * @returns {$queue.sqs}
         */
        removeMessage: function (message, callback) {
            var timerId = 'sqs_delete_' + $sqs.id + '::' + message.MessageId;
            $timer.start(timerId);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('message ' + message.MessageId + ' could not be removed because ' + error.message, duration, true);
                }
                else {
                    $log.debug("removed sqs message " + message.MessageId, 4, duration, true);
                }
            };
            $sqs.sqsqueue.deleteMessage({
                QueueUrl: $sqs.config.config.QueueUrl,
                ReceiptHandle: message.ReceiptHandle
            }, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * Remove a message from the SQS queue
         * @param {object} message
         * @param {function} callback
         * @returns {$queue.sqs}
         */
        sendMessage: function (message, callback) {
            var messId = message.id;
            var timerId = 'send_event_' + $sqs.id + '::' + messId;
            $timer.start(timerId);
            var $this = this;
            var params = {
                MessageBody: JSON.stringify(message),
                QueueUrl: $sqs.config.config.QueueUrl,
                DelaySeconds: 0
            };
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('message ' + message.id + ' could not be send because ' + error.message, duration, true);
                }
                else {
                    $log.debug("sended sqs message " + response.MessageId, 4, duration, true);
                }
            };
            $sqs.sqsqueue.sendMessage(params, callback ? callback : defaultCallback);
            return this;
        },
        endpoints: {
            addMessage: function (config) {
                /**
                 * Callback called when a defined endpoint is called
                 * @param {object} req
                 * @param {object} res
                 * @returns {undefined}
                 */
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    var data = req.body;
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var message = {
                                message: data,
                                time: Date.now(),
                                server: $log.config.appsign
                            };
                            rs.sendMessage(message, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error saving log  because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "recorded message " + reponse.MessageId, reponse).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned " + reponse.MessageId, 2);
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
    $sqs.init(config);
    return $sqs;
};