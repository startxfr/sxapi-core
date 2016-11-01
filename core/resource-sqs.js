/* global module, require, process */
//'use strict';

/**
 * sqs resource handler
 * @module resource-sqs
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
            if (config) {
                $sqs.config = config;
            }
            require("./log").debug("init sqs resource '" + $sqs.id + "'", 3);
            if (!$sqs.config.config) {
                throw new Error("no 'config' key found in config 'queue' section");
            }
            if (!$sqs.config.config.QueueUrl) {
                throw new Error("no 'QueueUrl' key found in config 'queue.config' section");
            }
            $sqs.AWS = require('aws-sdk');
            return this;
        },
        start: function (callback) {
            require("./log").debug("start resource-sqs module", 3);
            $sqs.open(callback);
            return this;
        },
        stop: function (callback) {
            require("./log").debug("stop resource-sqs module", 3);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        open: function (callback) {
            require('./timer').start('open_sqs_' + $sqs.config.config.QueueUrl);
            require("./log").debug("Open SQS queue " + $sqs.config.config.QueueUrl, 3);
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
            $sqs.__openHandler(callback);
            return this;
        },
        __openHandler: function (callback) {
            require("./log").debug("sqs queue "
                    + $sqs.config.config.QueueUrl + " opened", 2,
                    require('./timer')
                    .timeStop('open_sqs_' + $sqs.config.config.QueueUrl));
            if (typeof callback === "function") {
                callback(null, this);
            }
        },
        /**
         * Read the SQS queue  defined in the config.queue section of config.json
         * @returns {$queue.sqs}
         */
        read: function (callback) {
            require("./timer").start('sqs_read');
            require("./log").debug("Read SQS queue "
                    + $sqs.config.config.QueueUrl, 4, null, true);
            var cb = (typeof callback === "function") ? callback : $sqs.__readDefaultCallback;
            $sqs.sqsqueue.receiveMessage($sqs.config.config,
                    function (error, response) {
                        cb(error, response, cb);
                    });
            return this;
        },
        __readDefaultCallback: function (error, response, cb) {
            if (error) {
                require("./log").warn(
                        "error from SQS queue because" + error.message,
                        require("./timer").timeStop('sqs_read'));
                if (error.retryable) {
                    require("./log").debug(
                            'retry to call this queue in '
                            + error.retryDelay + 'sec', 2, null, true);
                    var t = (error.retryDelay * 1000) - $sqs.config.frequency;
                    var timer = (t > 0) ? t : 30;
                    $sqs.stop();
                    $sqs.timer = setTimeout(function () {
                        $sqs.read(cb);
                    }, timer);
                }
                else {
                    require("./log").error(
                            'this queue error is not retryable');
                    $sqs.stop();
                }
            }
            else {
                if (response.Messages) {
                    var nb = response.Messages.length;
                    require("./log").debug("received " + nb
                            + " messages from SQS queue", 4,
                            require("./timer").timeStop('sqs_read'));
                }
                else {
                    require("./log").debug(
                            "received an empty response from SQS queue", 4,
                            require("./timer").timeStop('sqs_read'));
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
            require("./timer").start('delete_message_'
                    + message.MessageId);
            var defaultCallback = function (error, doc) {
                if (error) {
                    require("./log").warn('message '
                            + message.MessageId
                            + ' could not be removed because '
                            + error.message + ' [' + error.code + ']',
                            require("./timer")
                            .timeStop('delete_message_' + message.MessageId), true);
                }
                else {
                    require("./log").debug("removed sqs message "
                            + message.MessageId, 4,
                            require("./timer")
                            .timeStop('delete_message_' + message.MessageId), true);
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
            require('./timer').start('send_event_' + messId);
            var $this = this;
            var params = {
                MessageBody: JSON.stringify(message),
                QueueUrl: $sqs.config.config.QueueUrl,
                DelaySeconds: 0
            };
            var defaultCallback = function (error, response) {
                if (error) {
                    require("./log").warn('message ' + message.id + ' could not be send because ' + error.message + ' [' + error.code + ']',
                            require("./timer").timeStop('send_event_' + messId),
                            true);
                }
                else {
                    require("./log").debug("sended sqs message "+ response.MessageId, 4,
                            require("./timer").timeStop('send_event_' + messId),
                            true);
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
                    var ress = require('./resource');
                    var message_prefix="Endpoint " + req.method + " '" + path + "' : ";
                    require("./log").debug(message_prefix+"called", 1); 
                    var data = req.body;
                    if (!config.resource) {
                        require("./ws").nokResponse(res, message_prefix+"resource is not defined for this endpoint").httpCode(500).send();
                        require("./log").warn(message_prefix+"resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var message = {
                                message: data,
                                time: Date.now(),
                                server: require("./log").config.appsign
                            };
                            rs.sendMessage(message, function (err, reponse) {
                                if (err) {
                                    require("./ws").nokResponse(res, message_prefix+"error because " + err.message).httpCode(500).send();
                                    require("./log").warn(message_prefix+"error saving log  because " + err.message);
                                }
                                else {
                                    require("./ws").okResponse(res, message_prefix+"recorded message " + reponse.MessageId, reponse).addTotal(reponse.length).send();
                                    require("./log").info(message_prefix+"returned "+ reponse.MessageId);
                                }
                            });
                        }
                        else {
                            require("./ws").nokResponse(res, message_prefix+"resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            require("./log").warn(message_prefix+"resource '" + config.resource + "' doesn't exist");
                        }
                    }
                }
            }
        }
    };
    $sqs.init(config);
    return $sqs;
};