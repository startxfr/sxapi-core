/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * service info resource handler
 * @module resource/sendmail
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
  var $sdml = {
    id: id,
    config: {},
    mailer: null,
    transporter: null,
    init: function (config) {
      var timerId = 'resource_sdml_init_' + $sdml.id;
      $timer.start(timerId);
      $log.tools.resourceDebug($sdml.id, "initializing", 3);
      if (config) {
        $sdml.config = config;
      }
      if (!$sdml.config.transport) {
        throw new Error("no 'transport' key found in resource '" + $sdml.id + "' config");
      }
      if (!$sdml.config.transport.host) {
        throw new Error("no 'transport.host' key found in resource '" + $sdml.id + "' config");
      }
      if (!$sdml.config.transport.port) {
        $sdml.config.transport.port = 587;
      }
      if ($sdml.config.transport.secure === undefined) {
        $sdml.config.transport.secure = false;
      }
      if (!$sdml.config.messages) {
        $sdml.config.messages = {};
      }
      $log.tools.resourceDebug($sdml.id, "initialized ", 1, $timer.timeStop(timerId));
      return this;
    },
    start: function (callback) {
      $log.tools.resourceDebug($sdml.id, "starting", 3);
      $sdml.transporter = $sdml.mailer.createTransport($sdml.config.transport);
      $sdml.transporter.verify(function (error) {
        if (error) {
          throw new Error("error connecting resource '" + $sdml.id + "' because " + error.message);
        } else {
          $log.tools.resourceDebug($sdml.id, "started ", 1);
          if (typeof callback === "function") {
            callback();
          }
        }
      });
      return this;
    },
    stop: function (callback) {
      $log.tools.resourceDebug($sdml.id, "Stopping", 2);
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    /**
     * Read services informations from process and config
     * @param {object} mailOptions object with options describing mail to send
     * @param {function} callback called when informations are returned
     * @returns {$sdml.sendmail}
     */
    sendMail: function (mailOptions, callback) {
      var timerId = 'sdml_sendMail_' + $sdml.id;
      $timer.start(timerId);
      $log.tools.resourceInfo($sdml.id, "sendMail()");
      var cb = (typeof callback === "function") ? callback(timerId) : $sdml.__sendMailDefaultCallback(timerId);
      var mail = require('merge').recursive({}, $sdml.config.messages, mailOptions);
      $sdml.transporter.sendMail(mail, cb);
      return this;
    },
    __sendMailDefaultCallback: function (timerId) {
      return function (error, reponse) {
        var duration = $timer.timeStop(timerId);
        if (error) {
          $log.tools.resourceWarn($sdml.id, "error sending mail because " + error.message, duration);
        }
        else {
          $log.tools.resourceDebug($sdml.id, "mail " + reponse.messageId + " sended", 4, duration);
        }
      };
    },
    endpoints: {
      sendMail: function (config) {
        /**
         * Callback called when a defined endpoint is called
         * @param {object} req
         * @param {object} res
         */
        return function (req, res) {
          var mailOptions = require('merge').recursive({}, config);
          var callback = function (timerId) {
            return function (error, reponse) {
              var duration = $timer.timeStop(timerId);
              if (error) {
                $log.tools.endpointErrorAndAnswer(res, $sdml.id, req, "error because " + error.message, duration);
              }
              else {
                if (config.notification !== undefined) {
                  $app.notification.notif(config.notification, reponse);
                }
                $log.tools.endpointDebugAndAnswer(res, reponse, $sdml.id, req, "mail " + reponse.messageId + " sended", 2, duration);
              }
            };
          };
          $log.tools.endpointDebug($sdml.id, req, "sendMail()", 1);
          if ($app.resources.exist(config.resource)) {
            $app.resources.get(config.resource).sendMail(mailOptions, callback);
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $sdml.id, req, config.resource);
          }
        };
      }
    }
  };
  $sdml.mailer = require('nodemailer');
  $sdml.init(config);
  return $sdml;
};