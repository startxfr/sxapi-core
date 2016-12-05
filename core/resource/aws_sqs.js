/* global module, require, process, $log, $timer */
//'use strict';

/**
 * aws_sqs resource handler
 * @module resource/aws_sqs
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
            var timerId = 'resource_aws.sqs_init_' + $sqs.id;
            $timer.start(timerId);
            if (config) {
                $sqs.config = config;
            }
            $log.debug("resource '" + $sqs.id + "' : initializing", 3);
            if (!$sqs.config.config) {
                throw new Error("no 'config' key found in resource '" + $sqs.id + "' config");
            }
            if (!$sqs.config.ACCESS_ID) {
                throw new Error("no 'ACCESS_ID' key found in resource '" + $sqs.id + "' config");
            }
            if (!$sqs.config.ACCESS_KEY) {
                throw new Error("no 'ACCESS_KEY' key found in resource '" + $sqs.id + "' config");
            }
            if (!$sqs.config.SESSION_TOKEN) {
                throw new Error("no 'SESSION_TOKEN' key found in resource '" + $sqs.id + "' config");
            }
            $sqs.AWS = require('aws-sdk');
            $log.debug("resource '" + $sqs.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        start: function (callback) {
            var timerId = 'resource_aws.sqs_start_' + $sqs.id;
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
            var timerId = 'resource_aws.sqs_open_' + $sqs.id;
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
            $log.debug("resource '" + $sqs.id + "' : connected with '" + $sqs.config.ACCESS_ID + "'", 4, duration);
            if (typeof callback === "function") {
                callback(null, this);
            }
        },
        /**
         * Read the SQS queue  defined in the config.queue section of sxapi.json
         * @param {object} options object with options to pass to the AWS receiveMessage method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        read: function (options, callback) {
            var timerId = 'resource_aws.sqs_read_' + $sqs.id;
            $timer.start(timerId);
            var QueueUrl = $sqs.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
            if ($sqs.config.read_options && $sqs.config.read_options.QueueUrl) {
                QueueUrl = $sqs.config.read_options.QueueUrl;
            }
            var config = $sqs.config.read_options || {};
            config.QueueUrl = QueueUrl;
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
                QueueUrl = config.QueueUrl;
            }
            $log.debug("Read SQS queue " + QueueUrl, 4, null, true);
            var cb = (typeof callback === "function") ? callback : $sqs.__readDefaultCallback;
            $sqs.sqsqueue.receiveMessage(config, function (error, response) {
                cb(error, response, cb, timerId);
            });
            return this;
        },
        __readDefaultCallback: function (error, response, cb, timerId) {
            if (error) {
                $log.warn("error from AWS SQS queue because" + error.message, $timer.time(timerId));
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
                    $log.debug("received " + nb + " messages from AWS SQS queue", 4, $timer.timeStop(timerId));
                }
                else {
                    $log.debug("received an empty response from AWS SQS queue", 4, $timer.timeStop(timerId));
                }
            }
        },
        /**
         * Remove a message from the SQS queue
         * @param {object} message the ReceiptHandle of the message you want to remove 
         * @param {object} options object with options to pass to the AWS deleteMessage method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        removeMessage: function (message, options, callback) {
            var timerId = 'resource_aws.sqs_removeMessage_' + $sqs.id + '::' + message.MessageId;
            $timer.start(timerId);
            var QueueUrl = $sqs.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
            if ($sqs.config.delete_options && $sqs.config.delete_options.QueueUrl) {
                QueueUrl = $sqs.config.delete_options.QueueUrl;
            }
            var config = $sqs.config.delete_options || {};
            config.QueueUrl = QueueUrl;
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
                QueueUrl = config.QueueUrl;
            }
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('message ' + message.MessageId + ' could not be removed because ' + error.message, duration, true);
                }
                else {
                    $log.debug("removed AWS SQS message " + message.MessageId, 4, duration, true);
                }
            };
            $sqs.sqsqueue.deleteMessage({
                QueueUrl: $sqs.config.config.QueueUrl,
                ReceiptHandle: message.ReceiptHandle
            }, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * Read the SQS queue  defined in the config.queue section of sxapi.json
         * @param {string} message body of the message whe want to send
         * @param {object} options object with options to pass to the AWS sendMessage method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        sendMessage: function (message, options, callback) {
            var messId = message.id;
            var timerId = 'resource_aws.sqs_sendMessage_' + $sqs.id + '::' + messId;
            $timer.start(timerId);
            var QueueUrl = $sqs.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
            if ($sqs.config.send_options && $sqs.config.send_options.QueueUrl) {
                QueueUrl = $sqs.config.send_options.QueueUrl;
            }
            var config = $sqs.config.send_options || {};
            config.QueueUrl = QueueUrl;
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
                QueueUrl = config.QueueUrl;
            }
            config.MessageBody = JSON.stringify(message);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('message ' + message.id + ' could not be send because ' + error.message, duration, true);
                }
                else {
                    $log.debug("sended AWS SQS message " + response.MessageId, 4, duration, true);
                }
            };
            $sqs.sqsqueue.sendMessage(config, callback ? callback : defaultCallback);
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
                            rs.sendMessage(message, config, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error saving log  because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "recorded AWS SQS message " + reponse.MessageId, reponse).addTotal(reponse.length).send();
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