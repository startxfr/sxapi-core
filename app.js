/* global require, process, $log, $timer */

var $app = require("./core/app");

$app.launch(function () {
    $log.info("application started", $timer.time('app'));
});
