/* global module, require, process, __dirname */

// import low level tools
require('./tools');

// declaring global variable $timer 
$timer = require('./timer');
$timer.start('app');

// declaring global variable $log
$log = require('./log');
$log.init({}, true);

//'use strict';
$app = {
    timer: $timer,
    log: $log,
    package: {
        network_port: 8080
    },
    config: {
        ip: require("ip").address(),
        log: {}
    },
    _onstopQueue: [],
    _onstartQueue: [],
    /**
     * Main init function who start the application
     * @param {function} callback
     * @returns {$app}
     */
    init: function (callback) {
        $log.debug("initializing sxapi-framework", 2, $timer.time('app'));
        this._initProcessSignals();
        this._initCheckEnv();
        this._initLoadConfigFiles();
        $log.info("initializing application " + $app.config.name + ' v' + $app.config.version, $timer.time('app'));
        $log.debug("container ip : " + $app.config.ip, 2);
        $log.debug("service name : " + $app.config.name, 2);
        $log.debug("service vers : " + $app.config.version, 2);
        $log.debug("service desc : " + $app.config.description, 2);
        if ($app.config.resources) {
            $log.debug("start initializing resources as part of the init process", 5, $timer.time('app'));
            $app.resources.init($app.config.resources);
        }
        if ($app.config.session) {
            $log.debug("start initializing session as part of the init process", 5, $timer.time('app'));
            $app.session.init($app.config.session);
            $app.onStart(function () {
                $app.session.start();
            });
            $app.onStop(function () {
                $app.session.stop();
            });
        }
        if ($app.config.server) {
            $log.debug("start initializing webserver as part of the init process", 5, $timer.time('app'));
            $app.ws.init($app.config.server);
            $app.onStart(function () {
                $app.ws.start();
            });
            $app.onStop(function () {
                $app.ws.stop();
            });
        }
        $log.info("application " + $app.config.name + ' v' + $app.config.version + " initialized", $timer.time('app'));
        if ($app.config.resources) {
            $log.debug("starting resources as part of the init process", 5, $timer.time('app'));
            $app.resources.starts(callback);
        }
        else if (typeof callback === "function") {
            callback();
        }
        return this;
    },
    /**
     * Check and load required env variable
     * @returns {$app}⋅
     */
    _initCheckEnv: function () {
        $log.debug("start checking env variable as part of the init process", 5, $timer.time('app'));
        if (process.env.HOSTNAME) {
            this.config.hostname = process.env.HOSTNAME;
        }
        else {
            this.fatalError('environment variable HOSTNAME must be set');
        }
        if (!process.env.APP_PATH) {
            process.env.APP_PATH = require('path').dirname(__dirname);
        }
        this.config.app_path = process.env.APP_PATH;
        process.chdir(this.config.app_path);
        if (!process.env.CONF_PATH) {
            process.env.CONF_PATH = process.env.APP_PATH;
        }
        this.config.conf_path = process.env.CONF_PATH;
        if (process.env.DATA_PATH) {
            this.config.data_path = process.env.DATA_PATH;
        }
        if (process.env.LOG_PATH) {
            $log.config.log_path = process.env.LOG_PATH;
        }
        $log.debug("Hostname     : " + this.config.hostname, 1);
        if (process.env.NODE_VERSION) {
            $log.debug("Engine       : NodeJS v" + process.env.NODE_VERSION, 1);
        }
        $log.debug("App path     : " + this.config.app_path, 2);
        $log.debug("Conf path    : " + this.config.conf_path, 2);
        $log.debug("Data path    : " + ((this.config.data_path) ? this.config.data_path : "NONE"), 2);
        $log.debug("Log path     : " + ((this.config.log_path) ? $log.config.log_path : "NONE"), 2);
        return this;
    },
    /**
     * Check and load required package and config file
     * @returns {$app}
     */
    _initLoadConfigFiles: function () {
        $log.debug("start checking config files as part of the init process", 5, $timer.time('app'));
        var fs = require('fs');
        var mg = require('merge');
        var pkg_file = this.config.app_path + '/package.json';
        var cfg_file = this.config.conf_path + '/sxapi.json';
        try {
            mg.recursive($app.package, JSON.parse(fs.readFileSync(pkg_file, 'utf-8')));
            $log.debug("Pkg source   : " + this.config.app_path + '/package.json', 2);
        }
        catch (e) {
            this.fatalError("package file " + pkg_file + " is missing");
        }
        if (process.env.SXAPI_CONF) {
            $log.debug("Cfg source   : SXAPI_CONF environment variable", 2);
            mg.recursive($app.config, JSON.parse(process.env.SXAPI_CONF));
        }
        else {
            try {
                mg.recursive($app.config, JSON.parse(fs.readFileSync(cfg_file, 'utf-8')));
                $log.debug("Cfg source   : " + this.config.conf_path + '/sxapi.json', 2);
            }
            catch (e) {
                $log.error("Cfg source   : is missing", 2);
                $log.debug("sxapi configuration could not be found", 3);
                $log.debug("add environment variable SXAPI_CONF or create /conf/sxapi.json config file", 3);
                this.fatalError('configuration file or variable is missing');
            }
        }
        if (!$app.config.name) {
            this.fatalError('sxapi configuration must have a "name" property');
        }
        if (!$app.config.name) {
            this.fatalError('sxapi configuration must have a "name" property');
        }
        if (!$app.config.version) {
            this.fatalError('sxapi configuration must have a "version" property');
        }
        $app.config.appsign = $app.config.log.appsign = $app.config.name + '::' + $app.config.version + '::' + $app.config.ip;
        $app.config.log.apptype = $app.config.name + '-v' + $app.config.version;
        var logConf = JSON.cleanObject($app.config.log);
        $log.debug("sxapi-core   : " + $app.package.name + ' v' + $app.package.version, 1);
        $log.debug("application  : " + $app.config.name + ' v' + $app.config.version, 1);
        if (process.env.npm_config_user_agent) {
            $log.debug("node engine  : " + process.env.npm_config_user_agent, 3);
            $log.config.npm_config_user_agent += " (" + $app.package.name + ' v' + $app.package.version + ")";
        }
        if (logConf.sqs || logConf.couchbase) {
            $log.tmpConf = mg.recursive({}, logConf);
        }
        delete logConf['sqs'];
        delete logConf['couchbase'];
        $log.init(logConf, $app.config.debug);
        return this;
    },
    /**
     * Check and load required package and config file
     * @returns {$app}
     */
    _initProcessSignals: function () {
        $log.debug("start registering to process signals as part of the init process", 5, $timer.time('app'));
        process.stdin.resume();
        process.__exitHandler = function (code) {
            $log.info("application " + $app.config.name + ' v' + $app.config.version + " exited " + code, $timer.time('app'));
        };
        process.__quitHandler = function (a, b, c, d) {
            $app.stop(function () {
                process.exit(a);
            });
        };
        process.__exceptionHandler = function (error) {
            $log.error("exception " + error.message);
            $log.debug(error.stack, 0);
            process.exit(0);
        };
        process.quit = process.__quitHandler;
        //do something when app is closing
        process.on('exit', process.__exitHandler);
        //docker kill --signal=SIGINT container
        process.on('SIGINT', process.__quitHandler);
        process.on('SIGHUP', process.__quitHandler);
        process.on('SIGQUIT', process.__quitHandler);
        // docker stop container
        process.on('SIGTERM', process.__quitHandler);
        //catches uncaught exceptions
        process.on('uncaughtException', process.__exceptionHandler);
        return this;
    },
    /**
     * Log an error and stop process
     * @param {string} message
     * @returns exit
     */
    fatalError: function (message) {
        $log.error("== FATAL ERROR ==");
        $log.error(message);
        process.exit(5);
    },
    /**
     * Register an action to execute before starting the application
     * @param {function} callback
     * @returns {$app}
     */
    onStart: function (callback) {
        if (typeof callback === "function") {
            $app._onstartQueue.push(callback);
        }
        return this;
    },
    /**
     * Start the application
     * @param {function} callback
     * @returns {$app}
     */
    start: function (callback) {
        $log.info("starting application " + $app.config.name + ' v' + $app.config.version, $timer.time('app'));
        var cbResources = function () {
            for (var i in $app._onstartQueue) {
                $app._onstartQueue[i]();
            }
            if (typeof callback === "function") {
                callback();
                if ($log.tmpConf !== undefined) {
                    setTimeout(function () {
                        $log.init($log.tmpConf, $app.config.debug);
                        delete $log['tmpConf'];
                    }, 300);
                }
            }
        };
        cbResources();
        return this;
    },
    /**
     * Register an action to execute before stopping the application
     * @param {function} callback 
     * @returns {$app}
     */
    onStop: function (callback) {
        if (typeof callback === "function") {
            $app._onstopQueue.push(callback);
        }
        return this;
    },
    /**
     * Stop the application
     * @param {function} callback
     * @returns {$app}
     */
    stop: function (callback) {
        $log.info("Stopping application " + $app.config.name + ' v' + $app.config.version, $timer.time('app'));
        var cb = function () {
            for (var i in $app._onstopQueue) {
                $app._onstopQueue[i]();
            }
            if (typeof callback === "function") {
                callback();
            }
        };
        $app.resources.stops(cb);
    },
    /**
     * init and start the application
     * @param {mixed} config
     * @param {function} callback
     * @returns {$app}
     */
    launch: function (config, callback) {
        $log.info("launching application " + $app.config.name + ' v' + $app.config.version, $timer.time('app'));
        if (typeof config === "function" && callback === undefined) {
            callback = config;
        }
        if (typeof config === "object") {
            process.env.SXAPI_CONF = JSON.stringify(config);
        }
        if (typeof config === "string") {
            $app.config.conf_path = config;
        }
        $app.init(function () {
            $app.start(callback);
        });
        return this;
    },
    resources: require('./resource'),
    session: require('./session'),
    ws: require('./ws')
};

module.exports = $app;