/* global require, exports */

exports.app = require("./core/app");

exports.app.launch(function () {
    exports.app.log.info("application started", exports.app.timer.time('app'));
});
