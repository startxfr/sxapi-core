/* global resConf, $log */

//'use strict';

var mylib = {
  myEndpointFunction: function (config) {
    return function (req, res) {
      res.writeHead(200);
      res.end("this text is an example param " + config.param_sample);
      $log.tools.endpointDebug("defaultEndpoint", req, " return dynamic example content", 2);
      return this;
    };
  },
  mySocketEndpointFunction: function (client, config) {
    return function (data) {
      console.log("------mySocketEndpointFunction");
      console.log(client.id, config, data);
      client.broadcast.emit("example", data);
      client.emit("example", data);
    };
  }
};

module.exports = mylib;