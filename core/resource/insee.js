/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * service info resource handler
 * @module resource/insee
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
  var $insee = {
    id: id,
    config: {},
    sirenapi: null,
    init: function (config) {
      var timerId = 'resource_insee_init_' + $insee.id;
      $timer.start(timerId);
      $log.tools.resourceDebug($insee.id, "initializing", 3);
      if (config) {
        $insee.config = config;
      }
      $log.tools.resourceDebug($insee.id, "initialized ", 1, $timer.timeStop(timerId));
      return this;
    },
    start: function (callback) {
      $log.tools.resourceDebug($insee.id, "Starting resource", 3);
      var cb = function () {
        $log.tools.resourceDebug($insee.id, "started ", 1);
        if (typeof callback === "function") {
          callback();
        }
      };
      $insee.open(cb);
      return this;
    },
    stop: function (callback) {
      $log.tools.resourceDebug($insee.id, "Stopping resource", 2);
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    open: function (callback) {
      $log.tools.resourceDebug($insee.id, "opened", 4);
      $insee.sirenapi = require('siren2tva');
      if ($insee.config.siren2tva) {
        $insee.sirenapi($insee.config.siren2tva);
      }
      if (typeof callback === "function") {
        callback(null, this);
      }
      return this;
    },
    /**
     * Read services informations from process and config
     * @param {string} code SIREN, SIRET or TVA number to read data from
     * @param {function} callback called when informations are returned
     * @returns {$insee}
     */
    read: function (code, callback) {
      var timerId = 'insee_read_' + $insee.id;
      $timer.start(timerId);
      $log.tools.resourceInfo($insee.id, "read()");
      var cb = (typeof callback === "function") ? callback : $insee.__readDefaultCallback;
      $insee.sirenapi.getInfo(code, cb);
      return $insee;
    },
    __readDefaultCallback: function (error, company) {
      $log.tools.resourceDebug($insee.id, "default callback", 4);
      console.log(error, company);
      return company;
    },
    /**
     * Convert SIRET to VAT number
     * @param {string} siret SIRET to convert
     * @returns {string}
     */
    convertSiret2Tva: function (siret) {
      $log.tools.resourceDebug($insee.id, "convertSiret2Tva()", 4);
      return $insee.sirenapi.siret2tva(siret);
    },
    /**
     * Convert SIREN to VAT number
     * @param {string} siren SIREN to convert
     * @returns {string}
     */
    convertSiren2Tva: function (siren) {
      $log.tools.resourceDebug($insee.id, "convertSiren2Tva()", 4);
      return $insee.sirenapi.siren2tva(siren);
    },
    /**
     * Convert VAT number to SIREN
     * @param {string} tva VAT number to convert
     * @returns {string}
     */
    convertTva2Siren: function (tva) {
      $log.tools.resourceDebug($insee.id, "convertTva2Siren()", 4);
      return $insee.sirenapi.tva2siren(tva);
    },
    /**
     * Test if SIRET is valid
     * @param {string} siret SIRET to test
     * @returns {bool}
     */
    isSIRET: function (siret) {
      $log.tools.resourceDebug($insee.id, "isSIRET()", 4);
      return $insee.sirenapi.isSIRET(siret);
    },
    /**
     * Test if SIREN is valid
     * @param {string} siren SIREN to test
     * @returns {bool}
     */
    isSIREN: function (siren) {
      $log.tools.resourceDebug($insee.id, "isSIREN()", 4);
      return $insee.sirenapi.isSIREN(siren);
    },
    /**
     * Test if VAT number is valid
     * @param {string} tva VAT number to test
     * @returns {bool}
     */
    isTVA: function (tva) {
      $log.tools.resourceDebug($insee.id, "isTVA()", 4);
      return $insee.sirenapi.isTVA(tva);
    },
    endpoints: {
      read: function (config) {
        /**
         * Callback called when a defined endpoint is called
         * @param {object} req
         * @param {object} res
         */
        return function (req, res) {
          var callback = function (err, reponse) {
            if (err) {
              $log.tools.endpointErrorAndAnswer(res, $insee.id, req, "error because " + (err.message || err));
            }
            else {
              if (config.notification !== undefined) {
                $app.notification.notif(config.notification, reponse);
              }
              $log.tools.endpointDebugAndAnswer(res, reponse, $insee.id, req, "return insee legals informations", 2);
            }
          };
          $log.tools.endpointDebug($insee.id, req, "read()", 1);
          if ($app.resources.exist(config.resource)) {
            var companyId = (req.params.id) ? req.params.id : req.body.id;
            $app.resources.get(config.resource).read(companyId, callback);
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $insee.id, req, config.resource);
          }
        };
      },
      siret2Tva: function (config) {
        /**
         * Callback called when a defined endpoint is called
         * @param {object} req
         * @param {object} res
         */
        return function (req, res) {
          $log.tools.endpointDebug($insee.id, req, "siret2Tva()", 1);
          if ($app.resources.exist(config.resource)) {
            var companyId = (req.params.id) ? req.params.id : req.body.id;
            var newCode = $app.resources.get(config.resource).convertSiret2Tva(companyId);
            if (newCode === false) {
              $log.tools.endpointErrorAndAnswer(res, $insee.id, req, "error because " + newCode + "is not a valid SIRET");
            }
            else {
              if (config.notification !== undefined) {
                $app.notification.notif(config.notification, {"old": companyId, "new": newCode});
              }
              $log.tools.endpointDebugAndAnswer(res, newCode, $insee.id, req, "return VAT number", 2);
            }
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $insee.id, req, config.resource);
          }
        };
      },
      siren2Tva: function (config) {
        /**
         * Callback called when a defined endpoint is called
         * @param {object} req
         * @param {object} res
         */
        return function (req, res) {
          $log.tools.endpointDebug($insee.id, req, "siren2Tva()", 1);
          if ($app.resources.exist(config.resource)) {
            var companyId = (req.params.id) ? req.params.id : req.body.id;
            var newCode = $app.resources.get(config.resource).convertSiren2Tva(companyId);
            if (newCode === false) {
              $log.tools.endpointErrorAndAnswer(res, $insee.id, req, "error because " + newCode + "is not a valid SIREN");
            }
            else {
              if (config.notification !== undefined) {
                $app.notification.notif(config.notification, {"old": companyId, "new": newCode});
              }
              $log.tools.endpointDebugAndAnswer(res, newCode, $insee.id, req, "return VAT number", 2);
            }
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $insee.id, req, config.resource);
          }
        };
      },
      tva2Siren: function (config) {
        /**
         * Callback called when a defined endpoint is called
         * @param {object} req
         * @param {object} res
         */
        return function (req, res) {
          $log.tools.endpointDebug($insee.id, req, "tva2Siren()", 1);
          if ($app.resources.exist(config.resource)) {
            var companyId = (req.params.id) ? req.params.id : req.body.id;
            var newCode = $app.resources.get(config.resource).convertTva2Siren(companyId);
            if (newCode === false) {
              $log.tools.endpointErrorAndAnswer(res, $insee.id, req, "error because " + newCode + "is not a valid VAT number");
            }
            else {
              if (config.notification !== undefined) {
                $app.notification.notif(config.notification, {"old": companyId, "new": newCode});
              }
              $log.tools.endpointDebugAndAnswer(res, newCode, $insee.id, req, "return SIREN", 2);
            }
          }
          else {
            $log.tools.endpointWarnAndAnswerNoResource(res, $insee.id, req, config.resource);
          }
        };
      }
    }
  };
  $insee.init(config);
  return $insee;
};