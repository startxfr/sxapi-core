/* global module, require, process, $log, $timer, $app */
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
        /**
         * Initiate the SQS queue resource and check resource config
         * @param {object} config the resource config object
         * @returns {$queue.sqs}
         */
        init: function (config) {
            var timerId = 'resource_aws.sqs_init_' + $sqs.id;
            $timer.start(timerId);
            if (config) {
                $sqs.config = config;
            }
            $log.tools.resourceDebug($sqs.id, "initializing", 3);
            if (!$sqs.config.ACCESS_ID) {
                throw new Error("no 'ACCESS_ID' key found in resource '" + $sqs.id + "' config");
            }
            if (!$sqs.config.ACCESS_KEY) {
                throw new Error("no 'ACCESS_KEY' key found in resource '" + $sqs.id + "' config");
            }
            $sqs.AWS = require('aws-sdk');
            $log.tools.resourceDebug($sqs.id, "initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Start the SQS queue resource as defined in the config
         * @param {function} callback to call when startup is done
         * @returns {$queue.sqs}
         */
        start: function (callback) {
            var timerId = 'resource_aws.sqs_start_' + $sqs.id;
            $log.tools.resourceDebug($sqs.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($sqs.id, "started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $sqs.open(cb);
            return this;
        },
        /**
         * Stop the SQS queue resource
         * @param {function} callback to call when stopped
         * @returns {$queue.sqs}
         */
        stop: function (callback) {
            $log.tools.resourceDebug($sqs.id, "Stopping", 2);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Open a connection the SQS queue defined in the resource config
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
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
            $log.tools.resourceDebug($sqs.id, "connected with '" + $sqs.config.ACCESS_ID + "'", 4, $timer.timeStop(timerId));
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Read the SQS queue defined in the config.queue section of sxapi.json
         * @param {object} options object with options to pass to the AWS receiveMessage method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        read: function (options, callback) {
            var timerId = 'resource_aws.sqs_read_' + $sqs.id;
            $timer.start(timerId);
            var QueueUrl = $sqs.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
            var config = {};
            config.QueueUrl = QueueUrl;
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
                QueueUrl = config.QueueUrl;
            }
            $log.tools.resourceInfo($sqs.id, "read SQS queue " + QueueUrl, 4, null, true);
            var cb = (typeof callback === "function") ? callback : $sqs.__readDefaultCallback;
            $sqs.sqsqueue.receiveMessage(config, function (error, response) {
                cb(error, response, cb, timerId);
            });
            return this;
        },
        /**
         * Default callback used for handling from the AWS SQS cluster
         * @param {object} error object returned by AWS SQS
         * @param {object} response object returned by AWS SQS
         * @param {function} callback to call when AWS answer
         * @param {object} timerId ID of the timer used for this read operation
         * @returns {$queue.sqs}
         */
        __readDefaultCallback: function (error, response, callback, timerId) {
            if (error) {
                $log.tools.resourceWarn($sqs.id, "error from AWS SQS queue because" + error.message, $timer.time(timerId));
                if (error.retryable) {
                    $log.tools.resourceDebug($sqs.id, 'retry to call this queue in ' + error.retryDelay + 'sec', 2, null, true);
                    var t = (error.retryDelay * 1000) - $sqs.config.frequency;
                    var timer = (t > 0) ? t : 30;
                    $sqs.stop();
                    $sqs.timer = setTimeout(function () {
                        $sqs.read(callback);
                    }, timer);
                }
                else {
                    $log.tools.resourceWarn($sqs.id, 'this queue error is not retryable', $timer.timeStop(timerId));
                    $sqs.stop();
                }
            }
            else {
                if (response.Messages) {
                    var nb = response.Messages.length;
                    $log.tools.resourceDebug($sqs.id, "received " + nb + " messages from AWS SQS queue", 4, $timer.timeStop(timerId));
                }
                else {
                    $log.tools.resourceDebug($sqs.id, "received an empty response from AWS SQS queue", 4, $timer.timeStop(timerId));
                }
            }
        },
        /**
         * Remove a message from the SQS queue
         * @param {object} options object with options to pass to the AWS deleteMessage method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        removeMessage: function (options, callback) {
            var timerId = 'resource_aws.sqs_removeMessage_' + $sqs.id + '::' + options.ReceiptHandle;
            $log.tools.resourceInfo($sqs.id, "remove message '" + options.ReceiptHandle + "'");
            $timer.start(timerId);
            var QueueUrl = ((options.config) ? options.config.QueueUrl : false) || options.QueueUrl || $sqs.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
            if ($sqs.config.delete_options && $sqs.config.delete_options.QueueUrl) {
                QueueUrl = $sqs.config.delete_options.QueueUrl;
            }
            var config = $sqs.config.delete_options || {};
            config.QueueUrl = QueueUrl;
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($sqs.id, 'message ' + config.ReceiptHandle + ' could not be removed because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($sqs.id, "removed AWS SQS message " + config.ReceiptHandle, 4, duration, true);
                }
            };
            $sqs.sqsqueue.deleteMessage(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * Read the SQS queue defined in the config.queue section of sxapi.json
         * @param {string} message body of the message whe want to send
         * @param {object} options object with options to pass to the AWS sendMessage method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        sendMessage: function (message, options, callback) {
            var messId = message.id;
            var timerId = 'resource_aws.sqs_sendMessage_' + $sqs.id + '::' + messId;
            $log.tools.resourceInfo($sqs.id, "send message '" + messId + "'");
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
                    $log.tools.resourceWarn($sqs.id, 'message ' + message.id + ' could not be send because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($sqs.id, "sended AWS SQS message " + response.MessageId, 4, duration, true);
                }
            };
            $sqs.sqsqueue.sendMessage(config, callback ? callback : defaultCallback);
            return this;
        },
        /**
         * get the list of available queue
         * @param {object} options object with options to pass to the AWS listQueues method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        listQueues: function (options, callback) {
            var timerId = 'resource_aws.sqs_listQueues_' + $sqs.id;
            $log.tools.resourceInfo($sqs.id, "list queues");
            $timer.start(timerId);
            var config = options || {};
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($sqs.id, 'could not list queue because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($sqs.id, response.QueueUrls.length + "queue(s) found ", 4, duration, true);
                }
            };
            $sqs.sqsqueue.listQueues(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * create a new queue
         * @param {object} options object with options to pass to the AWS createQueue method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        createQueue: function (options, callback) {
            var timerId = 'resource_aws.sqs_createQueue_' + $sqs.id;
            $log.tools.resourceInfo($sqs.id, "create queue");
            $timer.start(timerId);
            var config = options || {};
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($sqs.id, 'could not create queue because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($sqs.id, "AWS SQS queue created", 4, duration, true);
                }
            };
            $sqs.sqsqueue.createQueue(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * delete an existing queue
         * @param {object} options object with options to pass to the AWS deleteQueue method
         * @param {function} callback to call when AWS answer
         * @returns {$queue.sqs}
         */
        deleteQueue: function (options, callback) {
            var timerId = 'resource_aws.sqs_deleteQueue_' + $sqs.id;
            $log.tools.resourceInfo($sqs.id, "delete queue");
            $timer.start(timerId);
            var config = options || {};
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($sqs.id, 'could not delete queue because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($sqs.id, "AWS SQS queue deleted", 4, duration, true);
                }
            };
            $sqs.sqsqueue.deleteQueue(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * Define a list of available endpoint for AWS SQS service
         */
        endpoints: {
            /**
             * Endpoint who list message in a AWS SQS queue
             * @param {object} config object used to define where to get message from
             * @returns {function} the function used to handle the server response
             */
            listMessages: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($sqs.id, req, "listMessages()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.read(config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $sqs.id, req, "error reading queue because " + err.message);
                            }
                            else {
                                var ct = (reponse.Messages) ? reponse.Messages.length : 0;
                                $log.tools.endpointDebugAndAnswer(res, reponse, $sqs.id, req, "readding AWS SQS queue " + config.config.QueueUrl, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $sqs.id, req, config.resource);
                    }
                };
            },
            /**
             * Endpoint who send a message to the AWS SQS service
             * @param {object} config object used to define where and how to store the message
             * @returns {function} the function used to handle the server response
             */
            addMessage: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($sqs.id, req, "addMessage()", 1);
                    var data = req.body;
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var message = {
                            message: data,
                            time: Date.now(),
                            server: $log.config.appsign
                        };
                        rs.sendMessage(message, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $sqs.id, req, "error saving message because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse, $sqs.id, req, "recorded AWS SQS message in transaction " + reponse.ResponseMetadata.MessageId, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $sqs.id, req, config.resource);
                    }
                };
            },
            /**
             * Endpoint who delete a message stored in the AWS SQS service
             * @param {object} config object used to define where and how to store the message
             * @returns {function} the function used to handle the server response
             */
            deleteMessage: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($sqs.id, req, "deleteMessage()", 1);
                    var messageId = req.params.id || req.body.id || false;
                    if (messageId === false) {
                        $log.tools.endpointErrorAndAnswer(res, $sqs.id, req, "no id param found in request");
                    }
                    else {
                        var QueueUrl = config.config.QueueUrl || config.QueueUrl || $sqs.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
                        messageId = messageId.replace(/[ ]/g, '+');
                        var params = config.config || {};
                        params.QueueUrl = QueueUrl;
                        params.MessageId = messageId;
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            rs.removeMessage(params, function (err, reponse) {
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $sqs.id, req, "error deleting message because " + err.message);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $sqs.id, req, "deleted AWS SQS message in transaction " + reponse.ResponseMetadata.MessageId, 2);
                                }
                            });
                        }
                        else {
                            $log.tools.endpointWarnAndAnswerNoResource(res, $sqs.id, req, config.resource);
                        }
                    }
                };
            },
            /**
             * Endpoint who send a list of the queues available for your account
             * @param {object} config object used to define where to get queue list
             * @returns {function} the function used to handle the server response
             */
            listQueue: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($sqs.id, req, "listQueue()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.listQueues(config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $sqs.id, req, "error getting queue list because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.QueueUrls, $sqs.id, req, "founded " + reponse.QueueUrls.length + " queue(s) available ", 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $sqs.id, req, config.resource);
                    }
                };
            },
            /**
             * Endpoint who create a new message queue in AWS SQS service
             * @param {object} config object used to define the queue parameters
             * @returns {function} the function used to handle the server response
             */
            addQueue: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($sqs.id, req, "addQueue()", 1);
                    var queueId = req.params.id || req.body.id || config.config.QueueName || require('uuid').v1();
                    var params = config.config || {};
                    params.QueueName = queueId;
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.createQueue(params, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $sqs.id, req, "error creating AWS SQS queue because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.QueueUrl, $sqs.id, req, "new AWS SQS queue " + params.QueueName, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $sqs.id, req, config.resource);
                    }
                };
            },
            /**
             * Endpoint who delete a message queue in AWS SQS service
             * @param {object} config object used to define where and how to store the message
             * @returns {function} the function used to handle the server response
             */
            deleteQueue: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($sqs.id, req, "deleteQueue()", 1);
                    var queueId = req.params.id || req.body.id || "";
                    var queueUrlPath = config.queueUrlPrefix || config.QueueUrl || "https://sqs.us-west-1.amazonaws.com/xxxxxx/";
                    var params = config.config || {};
                    params.QueueUrl = queueUrlPath + queueId;
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.deleteQueue(params, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $sqs.id, req, "error deleting AWS SQS queue because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, true, $sqs.id, req, "deleted AWS SQS queue " + params.queueId, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $sqs.id, req, config.resource);
                    }
                };
            }
        }
    };
    $sqs.init(config);
    return $sqs;
};