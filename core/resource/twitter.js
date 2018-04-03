/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * twitter resource handler
 * @module resource/twitter
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
  var $twt = {
    id: id,
    config: {},
    /**
     * Initiate the Twitter queue resource and check resource config
     * @param {object} config the resource config object
     * @returns {$twt.connection}
     */
    init: function (config) {
      var timerId = 'resource_twitter.init_' + $twt.id;
      $timer.start(timerId);
      if (config) {
        $twt.config = config;
      }
      $log.tools.resourceDebug($twt.id, "initializing", 3);
      if (!$twt.config.consumer_key) {
        throw new Error("no 'consumer_key' key found in resource '" + $twt.id + "' config");
      }
      if (!$twt.config.consumer_secret) {
        throw new Error("no 'consumer_secret' key found in resource '" + $twt.id + "' config");
      }
      $twt.config.consumer_key = $log.format("" + $twt.config.consumer_key, process.env);
      $twt.config.consumer_secret = $log.format("" + $twt.config.consumer_secret, process.env);
      if ($twt.config.access_token_key) {
        $twt.config.access_token_key = $log.format("" + $twt.config.access_token_key, process.env);
      }
      if ($twt.config.access_token_secret) {
        $twt.config.access_token_secret = $log.format("" + $twt.config.access_token_secret, process.env);
      }
      $twt.api = require('twitter');
      $log.tools.resourceDebug($twt.id, "initialized ", 1, $timer.timeStop(timerId));
      return this;
    },
    /**
     * Start the Twitter queue resource as defined in the config
     * @param {function} callback to call when startup is done
     * @returns {$twt.connection}
     */
    start: function (callback) {
      var timerId = 'resource_twitter.start_' + $twt.id;
      $log.tools.resourceDebug($twt.id, "Starting resource", 3);
      var cb = function () {
        $log.tools.resourceDebug($twt.id, "started ", 1, $timer.timeStop(timerId));
        if (typeof callback === "function") {
          callback();
        }
      };
      $twt.open(cb);
      return this;
    },
    /**
     * Stop the Twitter queue resource
     * @param {function} callback to call when stopped
     * @returns {$twt.connection}
     */
    stop: function (callback) {
      $log.tools.resourceDebug($twt.id, "Stopping resource", 2);
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    /**
     * Open a connection the Twitter queue defined in the resource config
     * @param {function} callback to call when Twitter answer
     * @returns {$twt.connection}
     */
    open: function (callback) {
      var timerId = 'resource_twitter.open_' + $twt.id;
      $timer.start(timerId);
      var config = {
        consumer_key: $twt.config.consumer_key,
        consumer_secret: $twt.config.consumer_secret
      };
      if ($twt.config.access_token_key) {
        config.access_token_key = $twt.config.access_token_key;
      }
      if ($twt.config.access_token_secret) {
        config.access_token_secret = $twt.config.access_token_secret;
      }
      if ($twt.config.access_token_secret) {
        config.bearer_token = $twt.config.bearer_token;
      }
      $twt.connection = new $twt.api(config);
      $log.tools.resourceDebug($twt.id, "connected with '" + $twt.config.access_token_key + "'", 4, $timer.timeStop(timerId));
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    /**
     * Read the Twitter stream defined in the config section of sxapi.json
     * @param {object} options object with options to pass to the Twitter readStream method
     * @param {function} callback to call when Twitter answer
     * @returns {$twt.connection.stream}
     */
    readStream: function (options, callback) {
      var timerId = 'resource_twitter.readStream_' + $twt.id;
      $timer.start(timerId);
      var subject = options.match || $twt.config.match || "#Paris";
      var cb = (typeof callback === "function") ? callback : $twt.__readStreamDefaultCallback;
      $log.tools.resourceInfo($twt.id, "read Twitter stream for " + subject, 4, null, true);
      $twt.connection.stream('statuses/filter', {track: subject},
      function (stream) {
        stream.on('data', function (tweet) {
          cb(null, tweet, timerId);
        });
        stream.on('error', function (error) {
          cb(error, null, timerId);
        });
      });
      return this;
    },
    /**
     * Default callback used for handling from the Twitter API cluster
     * @param {object} error object returned by Twitter API
     * @param {object} response object returned by Twitter API
     * @param {function} callback to call when Twitter answer
     * @param {object} timerId ID of the timer used for this readStream operation
     * @returns {$twt.connection}
     */
    __readStreamDefaultCallback: function (error, response, callback, timerId) {
      if (error) {
        $log.tools.resourceWarn($twt.id, "error from Twitter API queue because" + error.message, $timer.time(timerId));
      }
      else {
        $log.tools.resourceDebug($twt.id, "received tweet " + response.id_str + " from Twitter API stream", 4, $timer.timeStop(timerId));
      }
    },
//    /**
//     * Read the Twitter queue defined in the config.queue section of sxapi.json
//     * @param {object} options object with options to pass to the Twitter receiveMessage method
//     * @param {function} callback to call when Twitter answer
//     * @returns {$twt.connection}
//     */
//    read: function (options, callback) {
//      var timerId = 'resource_twitter.read_' + $twt.id;
//      $timer.start(timerId);
//      var QueueUrl = $twt.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
//      var config = {};
//      config.QueueUrl = QueueUrl;
//      if (typeof options === 'object') {
//        require('merge').recursive(config, options);
//        QueueUrl = config.QueueUrl;
//      }
//      $log.tools.resourceInfo($twt.id, "read Twitter queue " + QueueUrl, 4, null, true);
//      var cb = (typeof callback === "function") ? callback : $twt.__readDefaultCallback;
//      $twt.connection.receiveMessage(config, function (error, response) {
//        cb(error, response, cb, timerId);
//      });
//      return this;
//    },
//    /**
//     * Default callback used for handling from the Twitter API cluster
//     * @param {object} error object returned by Twitter API
//     * @param {object} response object returned by Twitter API
//     * @param {function} callback to call when Twitter answer
//     * @param {object} timerId ID of the timer used for this read operation
//     * @returns {$twt.connection}
//     */
//    __readDefaultCallback: function (error, response, callback, timerId) {
//      if (error) {
//        $log.tools.resourceWarn($twt.id, "error from Twitter API queue because" + error.message, $timer.time(timerId));
//        if (error.retryable) {
//          $log.tools.resourceDebug($twt.id, 'retry to call this queue in ' + error.retryDelay + 'sec', 2, null, true);
//          var t = (error.retryDelay * 1000) - $twt.config.frequency;
//          var timer = (t > 0) ? t : 30;
//          $twt.stop();
//          $twt.timer = setTimeout(function () {
//            $twt.read(callback);
//          }, timer);
//        }
//        else {
//          $log.tools.resourceWarn($twt.id, 'this queue error is not retryable', $timer.timeStop(timerId));
//          $twt.stop();
//        }
//      }
//      else {
//        if (response.Messages) {
//          var nb = response.Messages.length;
//          $log.tools.resourceDebug($twt.id, "received " + nb + " messages from Twitter API queue", 4, $timer.timeStop(timerId));
//        }
//        else {
//          $log.tools.resourceDebug($twt.id, "received an empty response from Twitter API queue", 4, $timer.timeStop(timerId));
//        }
//      }
//    },
//    /**
//     * Remove a message from the Twitter queue
//     * @param {object} options object with options to pass to the Twitter deleteMessage method
//     * @param {function} callback to call when Twitter answer
//     * @param {bool} mute is log muted
//     * @returns {$twt.connection}
//     */
//    removeMessage: function (options, callback, mute) {
//      var isMuted = (mute = true) ? true : false;
//      var displayId = options.MessageId || options.ReceiptHandle;
//      var timerId = 'resource_twitter.removeMessage_' + $twt.id + '::' + displayId;
//      if (!isMuted) {
//        $log.tools.resourceInfo($twt.id, "remove message '" + displayId + "'");
//      }
//      $timer.start(timerId);
//      var QueueUrl = ((options.config) ? options.config.QueueUrl : false) || options.QueueUrl || $twt.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
//      if ($twt.config.delete_options && $twt.config.delete_options.QueueUrl) {
//        QueueUrl = $twt.config.delete_options.QueueUrl;
//      }
//      var config = $twt.config.delete_options || {};
//      config.QueueUrl = QueueUrl;
//      if (typeof options === 'object') {
//        require('merge').recursive(config, options);
//      }
//      var defaultCallback = function (error, response) {
//        var duration = $timer.timeStop(timerId);
//        if (error) {
//          if (!isMuted) {
//            $log.tools.resourceWarn($twt.id, 'message ' + config.ReceiptHandle + ' could not be removed because ' + error.message, duration, true);
//          }
//        }
//        else {
//          if (!isMuted) {
//            $log.tools.resourceDebug($twt.id, "removed Twitter API message " + config.ReceiptHandle, 4, duration, true);
//          }
//        }
//      };
//      $twt.connection.deleteMessage(config, (callback) ? callback : defaultCallback);
//      return this;
//    },
//    /**
//     * Read the Twitter queue defined in the config.queue section of sxapi.json
//     * @param {string} message body of the message whe want to send
//     * @param {object} options object with options to pass to the Twitter sendMessage method
//     * @param {function} callback to call when Twitter answer
//     * @param {bool} mute is log muted
//     * @returns {$twt.connection}
//     */
//    sendMessage: function (message, options, callback, mute) {
//      var isMuted = (mute = true) ? true : false;
//      var messId = message.id || require('uuid').v4();
//      var timerId = 'resource_twitter.sendMessage_' + $twt.id + '::' + messId;
//      if (!isMuted) {
//        $log.tools.resourceInfo($twt.id, "send message '" + messId + "'");
//      }
//      $timer.start(timerId);
//      var QueueUrl = $twt.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
//      if ($twt.config.send_options && $twt.config.send_options.QueueUrl) {
//        QueueUrl = $twt.config.send_options.QueueUrl;
//      }
//      var config = require('merge').recursive({}, $twt.config.send_options || {});
//      config.QueueUrl = QueueUrl;
//      if (typeof options === 'object') {
//        require('merge').recursive(config, options);
//        QueueUrl = config.QueueUrl;
//      }
//      config.MessageBody = JSON.stringify(message);
//      var defaultCallback = function (error, response) {
//        var duration = $timer.timeStop(timerId);
//        if (error) {
//          if (!isMuted) {
//            $log.tools.resourceWarn($twt.id, 'message ' + messId + ' could not be send because ' + error.message, duration, true);
//          }
//        }
//        else {
//          if (!isMuted) {
//            $log.tools.resourceDebug($twt.id, "sended Twitter API message " + response.MessageId, 4, duration, true);
//          }
//        }
//      };
//      $twt.connection.sendMessage(config, callback ? callback : defaultCallback);
//      return this;
//    },
//    /**
//     * get the list of available queue
//     * @param {object} options object with options to pass to the Twitter listQueues method
//     * @param {function} callback to call when Twitter answer
//     * @returns {$twt.connection}
//     */
//    listQueues: function (options, callback) {
//      var timerId = 'resource_twitter.listQueues_' + $twt.id;
//      $log.tools.resourceInfo($twt.id, "list queues");
//      $timer.start(timerId);
//      var config = options || {};
//      var defaultCallback = function (error, response) {
//        var duration = $timer.timeStop(timerId);
//        if (error) {
//          $log.tools.resourceWarn($twt.id, 'could not list queue because ' + error.message, duration, true);
//        }
//        else {
//          $log.tools.resourceDebug($twt.id, response.QueueUrls.length + "queue(s) found ", 4, duration, true);
//        }
//      };
//      $twt.connection.listQueues(config, (callback) ? callback : defaultCallback);
//      return this;
//    },
//    /**
//     * create a new queue
//     * @param {object} options object with options to pass to the Twitter createQueue method
//     * @param {function} callback to call when Twitter answer
//     * @returns {$twt.connection}
//     */
//    createQueue: function (options, callback) {
//      var timerId = 'resource_twitter.createQueue_' + $twt.id;
//      $log.tools.resourceInfo($twt.id, "create queue");
//      $timer.start(timerId);
//      var config = options || {};
//      var defaultCallback = function (error, response) {
//        var duration = $timer.timeStop(timerId);
//        if (error) {
//          $log.tools.resourceWarn($twt.id, 'could not create queue because ' + error.message, duration, true);
//        }
//        else {
//          $log.tools.resourceDebug($twt.id, "Twitter API queue created", 4, duration, true);
//        }
//      };
//      $twt.connection.createQueue(config, (callback) ? callback : defaultCallback);
//      return this;
//    },
//    /**
//     * delete an existing queue
//     * @param {object} options object with options to pass to the Twitter deleteQueue method
//     * @param {function} callback to call when Twitter answer
//     * @returns {$twt.connection}
//     */
//    deleteQueue: function (options, callback) {
//      var timerId = 'resource_twitter.deleteQueue_' + $twt.id;
//      $log.tools.resourceInfo($twt.id, "delete queue");
//      $timer.start(timerId);
//      var config = options || {};
//      var defaultCallback = function (error, response) {
//        var duration = $timer.timeStop(timerId);
//        if (error) {
//          $log.tools.resourceWarn($twt.id, 'could not delete queue because ' + error.message, duration, true);
//        }
//        else {
//          $log.tools.resourceDebug($twt.id, "Twitter API queue deleted", 4, duration, true);
//        }
//      };
//      $twt.connection.deleteQueue(config, (callback) ? callback : defaultCallback);
//      return this;
//    },
//    /**
//     * Define a list of available endpoint for Twitter API service
//     */
//    endpoints: {
//      /**
//       * Endpoint who list message in a Twitter API queue
//       * @param {object} config object used to define where to get message from
//       * @returns {function} the function used to handle the server response
//       */
//      listMessages: function (config) {
//        /**
//         * Callback used when the endpoint is called
//         * @param {object} req request object from the webserver
//         * @param {object} res response object from the webserver
//         * @returns {undefined} 
//         */
//        return function (req, res) {
//          $log.tools.endpointDebug($twt.id, req, "listMessages()", 1);
//          if ($app.resources.exist(config.resource)) {
//            var rs = $app.resources.get(config.resource);
//            rs.read(config.config || {}, function (err, reponse) {
//              if (err) {
//                $log.tools.endpointErrorAndAnswer(res, $twt.id, req, "error reading queue because " + err.message);
//              }
//              else {
//                var ct = (reponse.Messages) ? reponse.Messages.length : 0;
//                if (config.notification !== undefined) {
//                  $app.notification.notif(config.notification, reponse);
//                }
//                $log.tools.endpointDebugAndAnswer(res, reponse, $twt.id, req, "readding Twitter API queue " + config.config.QueueUrl, 2);
//              }
//            });
//          }
//          else {
//            $log.tools.endpointWarnAndAnswerNoResource(res, $twt.id, req, config.resource);
//          }
//        };
//      },
//      /**
//       * Endpoint who send a message to the Twitter API service
//       * @param {object} config object used to define where and how to store the message
//       * @returns {function} the function used to handle the server response
//       */
//      addMessage: function (config) {
//        /**
//         * Callback used when the endpoint is called
//         * @param {object} req request object from the webserver
//         * @param {object} res response object from the webserver
//         * @returns {undefined} 
//         */
//        return function (req, res) {
//          $log.tools.endpointDebug($twt.id, req, "addMessage()", 1);
//          var data = req.body;
//          if ($app.resources.exist(config.resource)) {
//            var rs = $app.resources.get(config.resource);
//            var message = {
//              message: data,
//              time: Date.now(),
//              server: $log.config.appsign
//            };
//            rs.sendMessage(message, config.config || {}, function (err, reponse) {
//              if (err) {
//                $log.tools.endpointErrorAndAnswer(res, $twt.id, req, "error saving message because " + err.message);
//              }
//              else {
//                if (config.notification !== undefined) {
//                  $app.notification.notif(config.notification, reponse);
//                }
//                $log.tools.endpointDebugAndAnswer(res, reponse, $twt.id, req, "recorded Twitter API message in transaction " + reponse.ResponseMetadata.MessageId, 2);
//              }
//            });
//          }
//          else {
//            $log.tools.endpointWarnAndAnswerNoResource(res, $twt.id, req, config.resource);
//          }
//        };
//      },
//      /**
//       * Endpoint who delete a message stored in the Twitter API service
//       * @param {object} config object used to define where and how to store the message
//       * @returns {function} the function used to handle the server response
//       */
//      deleteMessage: function (config) {
//        /**
//         * Callback used when the endpoint is called
//         * @param {object} req request object from the webserver
//         * @param {object} res response object from the webserver
//         * @returns {undefined} 
//         */
//        return function (req, res) {
//          $log.tools.endpointDebug($twt.id, req, "deleteMessage()", 1);
//          var messageId = req.params.id || req.body.id || false;
//          if (messageId === false) {
//            $log.tools.endpointErrorAndAnswer(res, $twt.id, req, "no id param found in request");
//          }
//          else {
//            var QueueUrl = config.config.QueueUrl || config.QueueUrl || $twt.config.QueueUrl || "https://sqs.eu-west-1.amazonaws.com";
//            messageId = messageId.replace(/[ ]/g, '+');
//            var params = config.config || {};
//            params.QueueUrl = QueueUrl;
//            params.MessageId = messageId;
//            if ($app.resources.exist(config.resource)) {
//              var rs = $app.resources.get(config.resource);
//              rs.removeMessage(params, function (err, reponse) {
//                if (err) {
//                  $log.tools.endpointErrorAndAnswer(res, $twt.id, req, "error deleting message because " + err.message);
//                }
//                else {
//                  if (config.notification !== undefined) {
//                    $app.notification.notif(config.notification, reponse);
//                  }
//                  $log.tools.endpointDebugAndAnswer(res, reponse, $twt.id, req, "deleted Twitter API message in transaction " + reponse.ResponseMetadata.MessageId, 2);
//                }
//              });
//            }
//            else {
//              $log.tools.endpointWarnAndAnswerNoResource(res, $twt.id, req, config.resource);
//            }
//          }
//        };
//      },
//      /**
//       * Endpoint who send a list of the queues available for your account
//       * @param {object} config object used to define where to get queue list
//       * @returns {function} the function used to handle the server response
//       */
//      listQueue: function (config) {
//        /**
//         * Callback used when the endpoint is called
//         * @param {object} req request object from the webserver
//         * @param {object} res response object from the webserver
//         * @returns {undefined} 
//         */
//        return function (req, res) {
//          $log.tools.endpointDebug($twt.id, req, "listQueue()", 1);
//          if ($app.resources.exist(config.resource)) {
//            var rs = $app.resources.get(config.resource);
//            rs.listQueues(config.config || {}, function (err, reponse) {
//              if (err) {
//                $log.tools.endpointErrorAndAnswer(res, $twt.id, req, "error getting queue list because " + err.message);
//              }
//              else {
//                if (config.notification !== undefined) {
//                  $app.notification.notif(config.notification, reponse);
//                }
//                $log.tools.endpointDebugAndAnswer(res, reponse.QueueUrls, $twt.id, req, "founded " + reponse.QueueUrls.length + " queue(s) available ", 2);
//              }
//            });
//          }
//          else {
//            $log.tools.endpointWarnAndAnswerNoResource(res, $twt.id, req, config.resource);
//          }
//        };
//      },
//      /**
//       * Endpoint who create a new message queue in Twitter API service
//       * @param {object} config object used to define the queue parameters
//       * @returns {function} the function used to handle the server response
//       */
//      addQueue: function (config) {
//        /**
//         * Callback used when the endpoint is called
//         * @param {object} req request object from the webserver
//         * @param {object} res response object from the webserver
//         * @returns {undefined} 
//         */
//        return function (req, res) {
//          $log.tools.endpointDebug($twt.id, req, "addQueue()", 1);
//          var queueId = req.params.id || req.body.id || config.config.QueueName || require('uuid').v1();
//          var params = config.config || {};
//          params.QueueName = queueId;
//          if ($app.resources.exist(config.resource)) {
//            var rs = $app.resources.get(config.resource);
//            rs.createQueue(params, function (err, reponse) {
//              if (err) {
//                $log.tools.endpointErrorAndAnswer(res, $twt.id, req, "error creating Twitter API queue because " + err.message);
//              }
//              else {
//                if (config.notification !== undefined) {
//                  $app.notification.notif(config.notification, reponse);
//                }
//                $log.tools.endpointDebugAndAnswer(res, reponse.QueueUrl, $twt.id, req, "new Twitter API queue " + params.QueueName, 2);
//              }
//            });
//          }
//          else {
//            $log.tools.endpointWarnAndAnswerNoResource(res, $twt.id, req, config.resource);
//          }
//        };
//      },
//      /**
//       * Endpoint who delete a message queue in Twitter API service
//       * @param {object} config object used to define where and how to store the message
//       * @returns {function} the function used to handle the server response
//       */
//      deleteQueue: function (config) {
//        /**
//         * Callback used when the endpoint is called
//         * @param {object} req request object from the webserver
//         * @param {object} res response object from the webserver
//         * @returns {undefined} 
//         */
//        return function (req, res) {
//          $log.tools.endpointDebug($twt.id, req, "deleteQueue()", 1);
//          var queueId = req.params.id || req.body.id || "";
//          var queueUrlPath = config.queueUrlPrefix || config.QueueUrl || "https://sqs.us-west-1.amazonaws.com/xxxxxx/";
//          var params = config.config || {};
//          params.QueueUrl = queueUrlPath + queueId;
//          if ($app.resources.exist(config.resource)) {
//            var rs = $app.resources.get(config.resource);
//            rs.deleteQueue(params, function (err, reponse) {
//              if (err) {
//                $log.tools.endpointErrorAndAnswer(res, $twt.id, req, "error deleting Twitter API queue because " + err.message);
//              }
//              else {
//                if (config.notification !== undefined) {
//                  $app.notification.notif(config.notification, reponse);
//                }
//                $log.tools.endpointDebugAndAnswer(res, true, $twt.id, req, "deleted Twitter API queue " + params.queueId, 2);
//              }
//            });
//          }
//          else {
//            $log.tools.endpointWarnAndAnswerNoResource(res, $twt.id, req, config.resource);
//          }
//        };
//      }
//    }
  };
  $twt.init(config);
  return $twt;
};