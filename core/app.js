/* global module, require, process */

//'use strict';
var $app = {
    package: {
        network_port: 19777
    },
    config: {
        ip: require("ip").address(),
        log: {}
    },
    onstopQueue: [],
    onstartQueue: [],
    /**
     * Main init function who start the application
     * @param {function} callback
     * @returns {$app}
     */
    init: function (callback) {
        var logger = require('./log');
        logger.info("init framework", require('./timer').time('app'));
        this._initCheckEnv();
        this._initLoadConfigFiles();
        logger.info("Init application ", require('./timer').time('app'));
        var afterResourceLoaded = function () {
            if ($app.config.events) {
                require("./event").init($app.config.events);
            }
            if ($app.config.server) {
                require("./ws").init($app.config.server);
                $app.onStart(function () {
                    require("./ws").start();
                });
                $app.onStop(function () {
                    require("./ws").stop();
                });
            }
            if (typeof callback === "function") {
                callback();
            }
        };
        if ($app.config.resources) {
            require('./resource')
                    .init($app.config.resources)
                    .starts(function () {
                        if ($app.config.cache) {
                            require("./cache").init($app.config.cache, afterResourceLoaded);
                        }
                        else {
                            afterResourceLoaded();
                        }
                    });
        }
        else {
            afterResourceLoaded();
        }
        return this;
    },
    /**
     * Check and load required env variable
     * @returns {$app}⋅
     */
    _initCheckEnv: function () {
        var logger = require('./log');
        if (process.env.HOSTNAME) {
            logger.debug("Hostname : " + process.env.HOSTNAME, 3);
            this.config.hostname = process.env.HOSTNAME;
        }
        else {
            logger.error('FATAL : environment variable HOSTNAME must be set');
            process.exit(5);
        }
        if (process.env.APP_PATH) {
            logger.debug("App path : " + process.env.APP_PATH, 3);
            this.config.app_path = process.env.APP_PATH;
            process.chdir(process.env.APP_PATH);
        }
        else {
            logger.error('FATAL : environment variable APP_PATH must be set');
            process.exit(5);
        }
        if (process.env.CONF_PATH) {
            logger.debug("Conf path : " + process.env.CONF_PATH, 3);
            this.config.conf_path = process.env.CONF_PATH;
        }
        else {
            logger.error('FATAL : environment variable CONF_PATH must be set');
            process.exit(5);
        }
        if (process.env.DATA_PATH) {
            logger.debug("Data path : " + process.env.DATA_PATH, 3);
            this.config.data_path = process.env.DATA_PATH;
        }
        else {
            logger.error('FATAL : environment variable DATA_PATH must be set');
            process.exit(5);
        }
        if (process.env.LOG_PATH) {
            logger.debug("Log path : " + process.env.LOG_PATH, 3);
            logger.config.log_path = process.env.LOG_PATH;
        }
        return this;
    },
    /**
     * Check and load required package and config file
     * @returns {$app}
     */
    _initLoadConfigFiles: function () {
        var fs = require('fs');
        var mg = require('merge');
        var logger = require('./log');
        var pkg_file = this.config.app_path + '/package.json';
        var cfg_file = this.config.conf_path + '/config.json';
        try {
            mg.recursive($app.package, JSON.parse(fs.readFileSync(pkg_file, 'utf-8')));
            logger.debug("package file : " + pkg_file + "  LOADED", 3);
        }
        catch (e) {
            require("./log").error("package file : " + pkg_file + " IS MISSING");
            process.exit(5);
        }
        try {
            mg.recursive($app.config, JSON.parse(fs.readFileSync(cfg_file, 'utf-8')));
            logger.debug("config file : " + cfg_file + " LOADED", 3);
        }
        catch (e) {
            require("./log").error("config file : " + cfg_file + " IS MISSING");
            process.exit(5);
        }
        logger.debug("framework : " + $app.package.name + ' v' + $app.package.version);
        logger.debug("container ip : " + $app.config.ip);
        logger.debug("service name : " + $app.config.name);
        logger.debug("service version : " + $app.config.version);
        logger.debug("service desc : " + $app.config.description);
        $app.config.appsign =
                $app.config.log.appsign =
                $app.config.name + '::' + $app.config.version + '::' + $app.config.ip;
        $app.config.log.apptype = $app.config.name + '-v' + $app.config.version;
        var logConf = JSON.parse(JSON.stringify($app.config.log));
        delete logConf['couchbase'];
        delete logConf['sqs'];
        logger.init(logConf, $app.config.debug);
        return this;
    },
    /**
     * Register an action to execute before starting the application
     * @param {function} callback
     * @returns {$app}
     */
    onStart: function (callback) {
        if (typeof callback === "function") {
            $app.onstartQueue.push(callback);
        }
        return this;
    },
    /**
     * Start the application
     * @param {function} callback
     * @returns {$app}
     */
    start: function (callback) {
        require("./log").debug("Starting application ", 1);
        for (var i in $app.onstartQueue) {
            $app.onstartQueue[i]();
        }
        if (typeof callback === "function") {
            callback();
        }
        return this;
    },
    /**
     * Register an action to execute before stopping the application
     * @param {function} callback 
     * @returns {$app}
     */
    onStop: function (callback) {
        if (typeof callback === "function") {
            $app.onstopQueue.push(callback);
        }
        return this;
    },
    /**
     * Stop the application
     * @param {function} callback
     * @returns {$app}
     */
    stop: function (callback) {
        require("./log").debug("Stopping application ", 1);
        for (var i in $app.onstopQueue) {
            $app.onstopQueue[i]();
        }
        if (typeof callback === "function") {
            callback();
        }
        require('./resource').stops();
        process.exit(0);
    },
    /**
     * init and start the application
     * @param {function} callback
     * @returns {$app}
     */
    launch: function (callback) {
        require("./log").info("Launch SXAPI microservice", require('./timer').time('app'));
        $app.init(function () {
            require("./log").info('application initialized ', require('./timer').time('app'));
            $app.start(callback);
        });
        return this;
    }
};

module.exports = $app;