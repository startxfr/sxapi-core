/* global module, require, process, chris */

// declaring global variable $timer 
$timer = require('./timer');
$timer.start('app');

// declaring global variable $log
$log = require('./log');
$log.init({}, true);

//'use strict';
var $app = {
    package: {
        network_port: 8080
    },
    config: {
        test:'dsdsd',
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
        $log.info("init framework", $timer.time('app'));
        this._initCheckEnv();
        this._initLoadConfigFiles();
        $log.info("Init application ", $timer.time('app'));
        var afterResourceLoaded = function () {
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
                    .starts(afterResourceLoaded);
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
        if (process.env.HOSTNAME) {
            $log.debug("Hostname : " + process.env.HOSTNAME, 3);
            this.config.hostname = process.env.HOSTNAME;
        }
        else {
            $log.error('FATAL : environment variable HOSTNAME must be set');
            process.exit(5);
        }
        if (process.env.APP_PATH) {
            $log.debug("App path : " + process.env.APP_PATH, 3);
            this.config.app_path = process.env.APP_PATH;
            process.chdir(process.env.APP_PATH);
        }
        else {
            $log.error('FATAL : environment variable APP_PATH must be set');
            process.exit(5);
        }
        if (process.env.CONF_PATH) {
            $log.debug("Conf path : " + process.env.CONF_PATH, 3);
            this.config.conf_path = process.env.CONF_PATH;
        }
        else {
            $log.error('FATAL : environment variable CONF_PATH must be set');
            process.exit(5);
        }
        if (process.env.DATA_PATH) {
            $log.debug("Data path : " + process.env.DATA_PATH, 3);
            this.config.data_path = process.env.DATA_PATH;
        }
        else {
            $log.error('FATAL : environment variable DATA_PATH must be set');
            process.exit(5);
        }
        if (process.env.LOG_PATH) {
            $log.debug("Log path : " + process.env.LOG_PATH, 3);
            $log.config.log_path = process.env.LOG_PATH;
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
        var pkg_file = this.config.app_path + '/package.json';
        var cfg_file = this.config.conf_path + '/sxapi.json';
        try {
            mg.recursive($app.package, JSON.parse(fs.readFileSync(pkg_file, 'utf-8')));
            $log.debug("package file : " + pkg_file + "  LOADED", 3);
        }
        catch (e) {
            $log.error("package file : " + pkg_file + " IS MISSING");
            process.exit(5);
        }
        try {
            mg.recursive($app.config, JSON.parse(fs.readFileSync(cfg_file, 'utf-8')));
            $log.debug("config file : " + cfg_file + " LOADED", 3);
        }
        catch (e) {
            $log.error("config file : " + cfg_file + " IS MISSING");
            process.exit(5);
        }
        $log.debug("framework : " + $app.package.name + ' v' + $app.package.version);
        $log.debug("container ip : " + $app.config.ip);
        $log.debug("service name : " + $app.config.name);
        $log.debug("service version : " + $app.config.version);
        $log.debug("service desc : " + $app.config.description);
        $app.config.appsign =
                $app.config.log.appsign =
                $app.config.name + '::' + $app.config.version + '::' + $app.config.ip;
        $app.config.log.apptype = $app.config.name + '-v' + $app.config.version;
        var logConf = JSON.parse(JSON.stringify($app.config.log));
        delete logConf['couchbase'];
        delete logConf['sqs'];
        $log.init(logConf, $app.config.debug);
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
        $log.debug("Starting application ", 1);
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
        $log.debug("Stopping application ", 1);
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
        $log.info("Launch SXAPI microservice", $timer.time('app'));
        $app.init(function () {
            $log.info('application initialized ', $timer.time('app'));
            $app.start(callback);
        });
        return this;
    }
};

module.exports = $app;