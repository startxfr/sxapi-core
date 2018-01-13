/* global resConf, $log */

//'use strict';

var mylib = {
  crontLog: function (config) {
    var moment = require('moment');
    $log.info("cron task " + config.id + " executed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
  },
  myFunction: function (data, message, config) {
    var moment = require('moment');
    $log.info("sqs reader " + config.id + " executed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
    console.log(data);
  }
};

module.exports = mylib;