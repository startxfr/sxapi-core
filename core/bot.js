/* global module, require, process, $log, $app */

//'use strict';

var $bot = {
  config: {},
  cronlib: null,
  lib: null,
  timers: [],
  init: function (config) {
    if (config) {
      $bot.config = config;
    }
    $log.debug("Init core module : sxapi-core-bot", 4);
    if (!$bot.config) {
      throw new Error("no 'bot' section in config");
    }
    if (!$bot.config.lib) {
      throw new Error("no 'lib' key found in config 'bot' section");
    }
    else {
      $log.debug("use bot custom library ", 4);
      try {
        require.resolve("../" + $bot.config.lib);
        $bot.lib = require("../" + $bot.config.lib);
        $log.debug("loaded bot custom library ../" + $bot.config.lib, 4);
      } catch (e) {
        try {
          require.resolve($bot.config.lib);
          $bot.lib = require($bot.config.lib);
          $log.debug("loaded bot custom library " + $bot.config.lib, 4);
        } catch (e) {
          try {
            require.resolve($app.config.app_path + "/" + $bot.config.lib);
            $bot.lib = require($app.config.app_path + "/" + $bot.config.lib);
            $log.debug("loaded bot custom library " + $app.config.app_path + "/" + $bot.config.lib, 4);
          } catch (e) {
            throw new Error("bot custom library " + $bot.config.lib + " could not be found or loaded");
          }
        }
      }
    }
    if (!$bot.config.cron && !$bot.config.readers) {
      throw new Error("no 'readers' or 'cron' key found in config 'bot' section");
    }
    if ($bot.config.cron) {
      $bot.cronlib = require('node-cron');
      if (!$bot.config.cron instanceof Array) {
        throw new Error("'cron' key in config 'bot' section should be an array");
      }
      this._initCron();
    }
    if ($bot.config.readers) {
      if ($bot.config.readers.sqs && !$bot.config.readers.sqs instanceof Array) {
        throw new Error("'readers.sqs' key in config 'bot' section should be an array");
      }
      if ($bot.config.readers.twitter && !$bot.config.readers.twitter instanceof Array) {
        throw new Error("'readers.twitter' key in config 'bot' section should be an array");
      }
      this._initReaders();
    }
    return this;
  },
  _initCron: function () {
    var configOut = [];
    $log.debug("bot : init cron tasks ", 2);
    $bot.config.cron.forEach(function (crontask) {
      if (crontask.id && crontask.schedule && crontask.task) {
        if ($bot.taskExist(crontask.task)) {
          $log.debug("bot : cron : " + crontask.id + " init every " + crontask.schedule, 3);
          configOut.push(crontask);
        }
        else {
          $log.warn("Crontab " + crontask.id + " rejected because task " + crontask.task + " is not defined in lib");
        }
      }
      else {
        if (!crontask.id) {
          $log.warn("Crontab rejected because id is missing");
        }
        else if (!crontask.schedule) {
          $log.warn("Crontab " + crontask.id + " rejected because schedule is missing");
        }
        else if (!crontask.task) {
          $log.warn("Crontab " + crontask.id + " rejected because task is missing");
        }
      }
    });
    $bot.config.cron = configOut;
    return this;
  },
  _initReaders: function () {
    if ($bot.config.readers.sqs) {
      var configOut = [];
      $log.debug("bot : init sqs readers ", 2);
      $bot.config.readers.sqs.forEach(function (resConf) {
        if (resConf.resource) {
          if ($app.resources.exist(resConf.resource)) {
            $log.debug("bot : sqs : " + resConf.resource + " init ", 3);
            if (resConf.filters) {
              var configFiltersOut = [];
              resConf.filters.forEach(function (filter) {
                if (filter.id && filter.event && filter.task) {
                  if ($bot.taskExist(filter.task)) {
                    $log.debug("bot : sqs : " + resConf.resource + " : " + filter.id + " init event " + filter.event, 3);
                    configFiltersOut.push(filter);
                  }
                  else {
                    $log.warn("Bot reader SQS " + filter.id + " for resource " + resConf.resource + " rejected because task " + filter.task + " is not defined in lib");
                  }
                }
                else {
                  if (!filter.id) {
                    $log.warn("Bot reader SQS for resource " + resConf.resource + " rejected because id is missing");
                  }
                  else if (!filter.event) {
                    $log.warn("Bot reader SQS " + filter.id + " for resource " + resConf.resource + " rejected because event is missing");
                  }
                  else if (!filter.task) {
                    $log.warn("Bot reader SQS " + filter.id + " for resource " + resConf.resource + " rejected because task is missing");
                  }
                }
              });
              resConf.frequency = resConf.frequency || 10;
              resConf.filters = configFiltersOut;
              configOut.push(resConf);
            }
            else {
              $log.warn("Bot reader SQS for resource " + resConf.resource + " rejected because no filter found");
            }
          }
          else {
            $log.warn("Bot reader SQS for resource " + resConf.resource + " rejected because resource doesn't exist");
          }
        }
        else if (!resConf.resource) {
          $log.warn("Bot reader SQS rejected because resource is missing");
        }
      });
      $bot.config.sqs = configOut;
    }
    if ($bot.config.readers.twitter) {
      var configOut = [];
      $log.debug("bot : init twitter readers ", 2);
      $bot.config.readers.twitter.forEach(function (resConf) {
        if (resConf.resource) {
          if ($app.resources.exist(resConf.resource)) {
            $log.debug("bot : twitter : " + resConf.resource + " init ", 3);
            if (resConf.filters) {
              var configFiltersOut = [];
              resConf.filters.forEach(function (filter) {
                if (filter.id && filter.match && filter.task) {
                  if ($bot.taskExist(filter.task)) {
                    $log.debug("bot : twitter : " + resConf.resource + " : " + filter.id + " init match " + filter.match, 3);
                    configFiltersOut.push(filter);
                  }
                  else {
                    $log.warn("Bot reader twitter " + filter.id + " for resource " + resConf.resource + " rejected because task " + filter.task + " is not defined in lib");
                  }
                }
                else {
                  if (!filter.id) {
                    $log.warn("Bot reader twitter for resource " + resConf.resource + " rejected because id is missing");
                  }
                  else if (!filter.match) {
                    $log.warn("Bot reader twitter " + filter.id + " for resource " + resConf.resource + " rejected because match is missing");
                  }
                  else if (!filter.task) {
                    $log.warn("Bot reader twitter " + filter.id + " for resource " + resConf.resource + " rejected because task is missing");
                  }
                }
              });
              resConf.filters = configFiltersOut;
              configOut.push(resConf);
            }
            else {
              $log.warn("Bot reader twitter for resource " + resConf.resource + " rejected because no filter found");
            }
          }
          else {
            $log.warn("Bot reader twitter for resource " + resConf.resource + " rejected because resource doesn't exist");
          }
        }
        else if (!resConf.resource) {
          $log.warn("Bot reader twitter rejected because resource is missing");
        }
      });
      $bot.config.twitter = configOut;
    }
    return this;
  },
  taskExist: function (taskname) {
    return (typeof $bot.lib[taskname] === "function") ? true : false;
  },
  /**
   * Start the webserver
   * @param callback {function} function to call after starting the webserver
   * @returns {object} the current object ($bot)
   */
  start: function (callback) {
    $log.debug("Start bot behaviour ", 2);
    if ($bot.config.cron) {
      $bot.config.cron.forEach(function (crontask) {
        $log.debug("bot : cron : " + crontask.id + " start executing every " + crontask.schedule, 3);
        $bot.cronlib.schedule(crontask.schedule, function () {
          $bot.lib[crontask.task](crontask);
        });
      });
    }
    if ($bot.config.sqs) {
      $bot.config.sqs.forEach(function (resource) {
        $log.debug("bot : sqs : " + resource.resource + " : start reading every " + resource.frequency, 3);
        var rs = $app.resources.get(resource.resource);
        var intervalFn = function () {
          rs.read(resource.config || {}, function (err, reponse) {
            if (err) {
              $log.warn("Bot reader SQS " + resource.resource + " received error message " + err.message);
            }
            else {
              var ct = (reponse.Messages) ? reponse.Messages.length : 0;
              if (ct > 0) {
                reponse.Messages.forEach(function (message) {
                  if (JSON.isDeserializable(message.Body)) {
                    message.Body = JSON.parse(message.Body);
                  }
                  var messageMatch = false;
                  resource.filters.forEach(function (filter) {
                    var eventKey = filter.eventKey || 'event';
                    if (message.Body && filter.event === message.Body[eventKey]) {
                      messageMatch = true;
                      $log.debug("bot : sqs : " + resource.resource + " : " + filter.id + " match message " + message.MessageId, 3);
                      $bot.lib[filter.task](message.Body, message, filter);
                    }
                  });
                  if (messageMatch === false) {
                    $log.debug("bot : sqs : " + resource.resource + " : message " + message.MessageId + " not filtered", 4);
                  }
                });
              }
              else {
                $log.debug("bot : sqs : " + resource.resource + " received no message", 3);
              }
            }
          });
        };
        $bot.timers.push(setInterval(intervalFn, resource.frequency * 1000));
      });
    }
    if ($bot.config.twitter) {
      $bot.config.twitter.forEach(function (resource) {
        var rs = $app.resources.get(resource.resource);
        var intervalID = null;
        resource.filters.forEach(function (filter) {
          var opt = {match: filter.match};
          $log.debug("bot : twitter : " + resource.resource + " : start reading stream for " + filter.match, 3);
          var streamer = function (opt) {
            rs.readStream(opt, function (err, reponse) {
              if (err) {
                opt.interval = opt.interval * 2;
                $log.warn("Bot reader twitter " + resource.resource + " received error message " + err.message + " and comme back in " + opt.interval);
                clearInterval(intervalID);
                intervalID = setInterval(function () {
                  streamer(opt);
                }, opt.interval);
              }
              else {
                $log.debug("bot : twitter : " + resource.resource + " : " + filter.id + " match tweet " + reponse.id_str, 3);
                $bot.lib[filter.task](reponse, "tweet " + reponse.id_str + " match " + filter.match, filter);
              }
            });
          };
          opt.interval = 1000;
          streamer(opt);
        });
      });
    }
    if (typeof callback === "function") {
      callback();
    }
    return this;
  },
  /**
   * Stop the webserver
   * @param callback {function} function to call after stopping the webserver
   * @returns {object} the current object ($bot)
   */
  stop: function (callback) {
    $log.debug("Stop bot behaviour ", 2);
    $bot.timers.forEach(function (timer) {
      clearInterval(timer);
    });
    if (typeof callback === "function") {
      callback();
    }
    return this;
  }
};

module.exports = $bot;