/* global module, require */

//'use strict';

var $timer = {
    init: function () {
        this.timer = require('timer-machine');
        return this;
    },
    get: function (label) {
        if (label === null || label === undefined || label === "") {
            label = "default";
        }
        return this.timer.get(label);
    },
    start: function (label) {
        this.get(label).start();
        return this.get(label);
    },
    time: function (label) {
        return this.get(label).time();
    },
    timeStop: function (label) {
        var t = this.time(label);
        this.stop(label);
        return t;
    },
    stop: function (label) {
        if (label === null || label === undefined || label === "") {
            label = "default";
        }
        this.timer.destroy(label);
        return this;
    }
};

module.exports = $timer.init();