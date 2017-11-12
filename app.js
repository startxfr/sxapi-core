/* global require, process, $log, $timer */

exports.app = require("./core/app");

$app.launch(function () {
    $log.info("application started", $timer.time('app'));
});
