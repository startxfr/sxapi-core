/* global module, require */
//'use strict';

/**
 * Resource manager used to handle resources instances
 * @module resource
 * @constructor
 * @type resources
 */
var $resources = {
    config: {},
    /**
     * init method
     * @param {type} config
     * @returns {$resources}
     */
    init: function (config) {
        require('./log').debug("Init resource module", 2);
        if (config) {
            for (var id in config) {
                this.add(id, config[id]);
            }
        }
        return this;
    },
    /**
     * add a resource to the available pool
     * @param {type} id
     * @param {type} config
     * @returns {$resources}
     */
    add: function (id, config) {
        require('./log')
                .debug("Adding resource "
                        + id + " to resources pool", 2);
        if (typeof id !== "string") {
            throw new Error("resource 'id' must be a string");
        }
        if (config === undefined) {
            throw new Error("resource must have a config");
        }
        if (config._class === undefined) {
            throw new Error("resource must have a _class param");
        }
        this.config[id] = require('./'+config._class)(id, config);
        return this;
    },
    /**
     * Get a resource by it's ID
     * @param {type} id
     * @returns {$resources.config}
     */
    get: function (id) {
        return this.config[id];
    },
    /**
     * test if a resource exist
     * @param {type} id
     * @returns {Boolean}
     */
    exist: function (id) {
        return (this.config[id]) ? true : false;
    },
    /**
     * start all resources
     * @param {type} callback
     * @returns {$resources}
     */
    starts: function (callback) {
        require('./log')
                .debug("Starting all resources pool", 2);
        var series = [];
        for (var id in this.config) {
            if (this.config[id] &&
                    typeof this.config[id].start === "function") {
                series.push(this.config[id].start);
            }
        }
        require('async').series(series, callback);
        return this;
    },
    /**
     * Stop all resources
     * @param {type} callback
     * @returns {$resources}
     */
    stops: function (callback) {
        require('./log')
                .debug("Stopping all resources pool", 2);
        var series = [];
        for (var id in this.config) {
            if (this.config[id] &&
                    typeof this.config[id].stop === "function") {
                series.push(this.config[id].stop);
            }
        }
        require('async').series(series, callback);
        return this;
    },
    /**
     * Start a resource by it's ID
     * @param {type} id
     * @returns {$resources}
     */
    start: function (id) {
        require('./log')
                .debug("Starting '" + id + "' resources pool", 2);
        if (this.config[id] &&
                typeof this.config[id].start === "function") {
            this.config[id].start();
        }
        return this;
    },
    /**
     * Stop a resource by it's ID
     * @param {type} id
     * @returns {$resources}
     */
    stop: function (id) {
        require('./log')
                .debug("Stopping '" + id + "' resources pool", 2);
        if (this.config[id] &&
                typeof this.config[id].stop === "function") {
            this.config[id].stop();
        }
        return this;
    }
};

module.exports = $resources;