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
  },
  myEndpointFunction: function (config) {
    return function (req, res) {
      res.writeHead(200);
      res.end("this text is a test à " + config.param_sample);
      $log.tools.endpointDebug("defaultEndpoint", req, " return dynamic test content", 2);
      return this;
    };
  },
  mySocketEndpointFunction: function (client) {
      return function (data) {
        console.log("------mySocketEndpointFunction");
        console.log(client.id,data);
        client.broadcast.emit("test",data);
        client.emit("test",data);
      };
    }
};

module.exports = mylib;