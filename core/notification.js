/* global module, require, process, res, $app, $log */
//'use strict';

/**
 * Notification manager
 * @module notification
 * @constructor
 * @type $notification
 */
var $notification = {
  config: {},
  pipeline: {},
  /**
   * Initialise notification according to the notification section in sxapi.json. 
   * @param {type} config
   * @returns {notification}
   */
  init: function (config) {
    if (config) {
      this.config = config;
    }
    $log.debug("Init core module : sxapi-core-notification", 4);
    for (var pipid in this.config) {
      var pconf = this.config[pipid];
      if (pconf.type === 'sqs') {
        $log.debug("adding sqs notification backend " + pipid, 3);
        this.pipeline[pipid] = this.sqsInit(pconf);
      }
      else if (pconf.type === 'couchbase') {
        $log.debug("adding couchbase notification backend " + pipid, 3);
        this.pipeline[pipid] = this.couchbaseInit(pconf);
      }
      else {
        $log.warn("type " + pconf.type + " is not supported. disable notification pipeline " + pipid);
      }
    }
    return this;
  },
  notif: function (config, data) {
    if (config && config.pipeline && config.event) {
      this.notify(config.pipeline, config.event, data);
    }
    return this;
  },
  /**
   * notification a debug trace
   * @param {string} pipelineID the notification pipelineID name
   * @param {string} event the event signature
   * @param {object} data object
   * @returns {$notification}
   */
  notify: function (pipelineID, event, data) {
    var isOK = false;
    for (var pipid in this.pipeline) {
      if (pipid === pipelineID) {
        isOK = true;
        $log.debug("notification event " + event + " was propagated to pipeline " + pipelineID, 4);
        this.pipeline[pipid].notify(event, data);
      }
    }
    if (isOK === false) {
      $log.debug("no active notification pipeline match event " + event, 4);
    }
    return this;
  },
  sqsInit: function (conf) {
    if (!conf.resource) {
      throw new Error("no 'resource' key found in notification config 'sqs'");
    }
    if (!require('./resource').exist(conf.resource)) {
      throw new Error("resource '" + conf.resource + "' in notification config 'sqs' doesn't exist");
    }
    var obj = {};
    obj.config = conf;
    obj.resource = require('./resource').get(conf.resource);
    obj.notify = function (event, data) {
      var message = {
        event: event,
        data: data,
        time: Date.now(),
        server: $log.config.appsign
      };
      obj.resource.sendMessage(message, {}, function (err) {
        if (err) {
          $log.warn("error saving notification because " + err.message, null, true);
        }
      }, true);
      return obj;
    };
    return obj;
  },
  couchbaseInit: function (conf) {
    if (!conf.resource) {
      throw new Error("no 'resource' key found" + " in notification config 'couchbase'");
    }
    if (!require('./resource').exist(conf.resource)) {
      throw new Error("resource '" + conf.resource + "' in notification config 'couchbase' doesn't exist");
    }
    var obj = {};
    obj.config = conf;
    obj.resource = require('./resource').get(conf.resource);
    obj.notify = function (event, data) {
      var doc = {
        event: event,
        data: data,
        time: Date.now(),
        server: $log.config.appsign
      };
      var key = require('uuid').v4();
      obj.resource.insert(key, doc, function (key) {
        return function (coucherr, b) {
          if (coucherr) {
            console.warn(doc);
            $log.warn("error saving notification " + key + ' because ' + coucherr.message, null, true);
          }
        };
      });
      return obj;
    };
    return obj;
  }
};

module.exports = $notification;