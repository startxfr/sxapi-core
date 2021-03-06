/* global resConf, $log */

//'use strict';

var mylib = {
  myCronFunction: function (config) {
    var moment = require('moment');
    $log.info("cron task " + config.id + " executed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
  },
  myReaderFunction: function (data, message, config) {
    var moment = require('moment');
    $log.info("sqs reader " + config.id + " executed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
    console.log(data);
  },
  myTwitterFunction: function (data, message, config) {
    var moment = require('moment');
    $log.info("twitter reader " + config.id + " found tweet " + data.id_str);
//    console.log(data);
  }
};

module.exports = mylib;