/* global module, require, process, $log, $timer */
//'use strict';

/**
 * google drive resource handler
 * @module resource/google_drive_drive
 * @constructor
 * @param {string} id the resource ID
 * @param {object} config the resource config
 * @param {object} google the google resource with auth
 * @type resource
 */
module.exports = function (id, config, google) {
    var $gapid = {
        id: id + ':drive',
        google: google,
        service: null,
        config: {},
        /**
         * Initiate the Google Drive resource and check resource config
         * @param {object} config the resource config object
         * @returns {$gapid}
         */
        init: function (config) {
            var timerId = 'resource_google_drive_init_' + $gapid.id;
            $timer.start(timerId);
            if (config) {
                $gapid.config = config;
            }
            $log.debug("resource '" + $gapid.id + "' : initializing", 3);
            $log.debug("resource '" + $gapid.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Start the Google Drive resource as defined in the config
         * @param {function} callback to call when startup is done
         * @returns {$gapid}
         */
        start: function (callback) {
            var timerId = 'resource_google_drive_start_' + $gapid.id;
            $log.debug("resource '" + $gapid.id + "' : starting", 3);
            $gapid.service = $gapid.google.gapi.drive({
                version: 'v2',
                auth: $gapid.google.gapi_auth
            });
            $log.debug("resource '" + $gapid.id + "' : started ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Stop the Google Drive resource
         * @param {function} callback to call when stopped
         * @returns {$gapid}
         */
        stop: function (callback) {
            $log.debug("Stopping resource '" + $gapid.id + "'", 2);
            $gapid.service = null;
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Get file metadata
         * @param {string} id file ID
         * @param {object} options to use when retriving file
         * @param {function} callback to call for returning service
         * @returns {$gapid}
         */
        getFileMeta: function (id, options, callback) {
            var timerId = 'resource_google_drive_getFileMeta_' + $gapid.id + '_' + id;
            $timer.start(timerId);
            var config = options || {};
            config.fileId = id;
            $gapid.service.files.get(config, function (err, doc) {
                var duration = $timer.time(timerId);
                if (err) {
                    $log.warn('could not get file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not get file metadata');
                }
                else {
                    $log.debug("file " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
                    callback(null, doc);
                }
            });
            return this;
        },
        /**
         * Get file content
         * @param {string} id file ID
         * @param {object} options to use when retriving file
         * @param {object} response the response object to use when streaming back file to browser
         * @param {function} callback to call for returning service
         * @returns {$gapid}
         */
        getFile: function (id, options, response, callback) {
            var timerId = 'resource_google_drive_getFile_' + $gapid.id + '_' + id;
            $timer.start(timerId);
            var config = options || {};
            config.fileId = id;
            config.fields='id,name,title,mimeType';
            $gapid.service.files.get(config, function (err, doc) {
                var duration = $timer.time(timerId);
                if (err) {
                    $log.warn('could not get file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not get file metadata');
                }
                else {
                    $log.debug("file " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
                    config.alt = "media";
                    if (response) {
                        var outh = {
                            "Content-Type": 'application/octet-stream',
                            "Content-Disposition": 'attachment; filename=' + (doc.name || doc.title)
                        };
                        if(doc.mimeType) {
                        outh["Content-Type"]=doc.mimeType;
                        }
                        response.writeHead(200, outh);
                    }
                    var call = $gapid.service.files.get(config, function (err, content) {
                        var duration = $timer.timeStop(timerId);
                        if (err) {
                            $log.warn('could not get file content ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                            callback('could not get file content');
                        }
                        else {
                            if (!response) {
                                doc.Body = content;
                            }
                            $log.debug("file content " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
                            callback(null, doc);
                        }
                    });
                    if (response) {
                        call.pipe(response);
                    }
                }
            });
            return this;
        },
        /**
         * Get file metadata
         * @param {string} q the search query 
         * @param {object} options to use when retriving file
         * @param {function} callback to call for returning service
         * @returns {$gapid}
         */
        findFile: function (q, options, callback) {
            var timerId = 'resource_google_drive_findFile_' + $gapid.id + '_' + id;
            $timer.start(timerId);
            var config = options || {};
            config.q = q;
//            config.fields='id,title,mimeType';
            $gapid.service.files.list(config, function (err, doc) {
                var duration = $timer.time(timerId);
                if (err) {
                    $log.warn('could not execute search ' + q + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback(new Error('could not execute search ' + q));
                }
                else {
                    $log.debug("file found for search " + q + " found in resource " + $gapid.id, 4, duration, true);
                    callback(null, doc.items);
                }
            });
            return this;
        },
        /**
         * Get file list of a given directory
         * @param {string} id file ID
         * @param {object} options to use when retriving file
         * @param {function} callback to call for returning service
         * @returns {$gapid}
         */
        getDirectory: function (id, options, callback) {
            var timerId = 'resource_google_drive_getDirectory_' + $gapid.id + '_' + id;
            $timer.start(timerId);
            var config = options || {};
            config.folderId = id;
            config.fields='id,title,name,mimeType';
            $gapid.service.children.list(config, function (err, list) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                    $log.warn('could not get directory ' + config.folderId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not get file metadata');
                }
                else {
                    $log.debug("folder " + config.folderId + " found in resource " + $gapid.id, 4, duration, true);
                    var result = [];
                    require('async').each(list.items, function (file, cb) {
                        $gapid.service.files.get({fileId: file.id,fields:'id,title,mimeType'}, function (err, fileinfo) {
                            if (err) {
                                result.push(file);
                                cb(null, file);
                            }
                            else {
                                result.push(fileinfo);
                                cb(null, fileinfo);
                            }
                        });
                    }, function () {
                        callback(null, result);
                    });
                }
            });
            return this;
        },
        /**
         * Get file list of a given directory
         * @param {string} name folder name
         * @param {string} parent folder ID
         * @param {object} options to use when retriving file
         * @param {function} callback to call for returning service
         * @returns {$gapid}
         */
        addDirectory: function (name, parent, options, callback) {
            var timerId = 'resource_google_drive_getDirectory_' + $gapid.id + '_' + id;
            $timer.start(timerId);
            var config = options || {};
            config.title = name;
            config.parents = [{id: parent}];
            config.mimeType = "application/vnd.google-apps.folder";
            $gapid.service.files.insert(config, function (err, response) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                    $log.warn('could not create directory ' + config.title + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not create directory');
                }
                else {
                    $log.debug("directory " + config.title + " created in resource " + $gapid.id, 4, duration, true);
                    callback(null, response);
                }
            });
            return this;
        },
        /**
         * Define a list of available endpoint for Google Drive service
         */
        endpoints: {
            /**
             * Endpoint who return a raw file stored into an Drive storage
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            getFile: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var fileId = req.params.id || req.body.id || config.fileId || "fileId";
                            rs.getService("drive").getFile(fileId, config.config || {}, res, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error getting " + fileId + " file in resource " + rs.id + " because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error getting " + fileId + " file in resource " + rs.id + " because " + err.message);
                                }
                                else {
                                    res.end();
                                    $log.debug(message_prefix + "returned file " + fileId + " from resource " + rs.id, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, message_prefix + "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            /**
             * Endpoint who perform a search to find file
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            findFile: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var qr = req.params.q || req.body.q || config.q;
                            var q = "fullText contains '"+qr+"'";
                            rs.getService("drive").findFile(q, config.config || {}, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error finding files matching " + q + " in resource " + rs.id + " because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error finding files matching " + q + " in resource " + rs.id + " because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "returned files matching " + q + " from resource " + rs.id, reponse).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned files matching " + q + " from resource " + rs.id, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, message_prefix + "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            /**
             * Endpoint who get the content of a directory
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            listDirectory: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var folderId = req.params.id || req.body.id || config.folderId || "root";
                            rs.getService("drive").getDirectory(folderId, config.config || {}, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error getting " + folderId + " folder in resource " + rs.id + " because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error getting " + folderId + " folder in resource " + rs.id + " because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "returned folder " + folderId + " from resource " + rs.id, reponse).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned folder " + folderId + " from resource " + rs.id, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, message_prefix + "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            },
            /**
             * Endpoint who add a new directory into another one
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            addDirectory: function (config) {
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            var folderId = req.params.name || req.body.name || config.name || "folder name";
                            var parentId = req.params.parent || req.body.parent || config.parent || "root";
                            rs.getService("drive").addDirectory(folderId, parentId, config.config || {}, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error adding " + folderId + " folder in resource " + rs.id + " because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error adding " + folderId + " folder in resource " + rs.id + " because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "folder " + folderId + " created in resource " + rs.id, reponse).send();
                                    $log.debug(message_prefix + "created folder " + folderId + " in resource " + rs.id, 2);
                                }
                            });
                        }
                        else {
                            ws.nokResponse(res, message_prefix + "resource '" + config.resource + "' doesn't exist").httpCode(500).send();
                            $log.warn(message_prefix + "resource '" + config.resource + "' doesn't exist");
                        }
                    }
                };
            }
        }
    };
    $gapid.init(config);
    return $gapid;
};