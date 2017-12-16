/* global module, require, process, $log, $timer, $app */
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
            $log.tools.resourceDebug($gapid.id, "initializing", 3);
            $timer.start(timerId);
            if (config) {
                $gapid.config = config;
            }
            $log.tools.resourceDebug($gapid.id, "initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Start the Google Drive resource as defined in the config
         * @param {function} callback to call when startup is done
         * @returns {$gapid}
         */
        start: function (callback) {
            var timerId = 'resource_google_drive_start_' + $gapid.id;
            $log.tools.resourceDebug($gapid.id, "starting", 3);
            $gapid.service = $gapid.google.gapi.drive({
                version: 'v2',
                auth: $gapid.google.gapi_auth
            });
            $log.tools.resourceDebug($gapid.id, "started ", 1, $timer.timeStop(timerId));
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Stop the Google Drive resource
         * @param {function} callback to call when stopped
         * @returns {$gapid}
         */
        stop: function (callback) {
            $log.tools.resourceDebug($gapid.id, "Stopping", 2);
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
            $log.tools.resourceInfo($gapid.id, "get file '" + id + "' metadata");
            $timer.start(timerId);
            var config = options || {};
            config.fileId = id;
            $gapid.service.files.get(config, function (err, doc) {
                var duration = $timer.time(timerId);
                if (err) {
                    $log.tools.resourceWarn($gapid.id, 'could not get file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not get file metadata');
                }
                else {
                    $log.tools.resourceDebug($gapid.id, "file " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
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
            $log.tools.resourceInfo($gapid.id, "get file '" + id + "'");
            $timer.start(timerId);
            var config = options || {};
            config.fileId = id;
            config.fields = 'id,name,title,mimeType';
            $gapid.service.files.get(config, function (err, doc) {
                var duration = $timer.time(timerId);
                if (err) {
                    $log.tools.resourceWarn($gapid.id, 'could not get file ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not get file');
                }
                else {
                    $log.tools.resourceDebug($gapid.id, "file " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
                    config.alt = "media";
                    if (response) {
                        var outh = {
                            "Content-Type": 'application/octet-stream',
                            "Content-Disposition": 'attachment; filename=' + (doc.name || doc.title)
                        };
                        if (doc.mimeType) {
                            outh["Content-Type"] = doc.mimeType;
                        }
                        response.writeHead(200, outh);
                    }
                    var call = $gapid.service.files.get(config, function (err, content) {
                        var duration = $timer.timeStop(timerId);
                        if (err) {
                            $log.tools.resourceWarn($gapid.id, 'could not get file content ' + config.fileId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                            callback('could not get file content');
                        }
                        else {
                            if (!response) {
                                doc.Body = content;
                            }
                            $log.tools.resourceDebug($gapid.id, "file content " + config.fileId + " found in resource " + $gapid.id, 4, duration, true);
                            if (!response) {
                                callback(null, doc);
                            }
                        }
                    });
                    if (response) {
                        $log.tools.resourceDebug($gapid.id, "Streaming file content " + config.fileId + " started in resource " + $gapid.id, 4, duration, true);
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
            $log.tools.resourceInfo($gapid.id, "find file '" + id + "' metadata");
            $timer.start(timerId);
            var config = options || {};
            config.q = q;
//            config.fields='id,title,mimeType';
            $gapid.service.files.list(config, function (err, doc) {
                var duration = $timer.time(timerId);
                if (err) {
                    $log.tools.resourceWarn($gapid.id, 'could not execute search ' + q + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback(new Error('could not execute search ' + q));
                }
                else {
                    $log.tools.resourceDebug($gapid.id, "file found for search " + q + " found in resource " + $gapid.id, 4, duration, true);
                    callback(null, doc.items);
                }
            });
            return this;
        },
        /**
         * Add a file into a given directory
         * @param {string} name folder name
         * @param {string} parent folder ID
         * @param {string} mime the mimeTYpe of the document
         * @param {string} body file content (should be a Buffer for binary)
         * @param {object} options to use when retriving file
         * @param {function} callback to call for returning service
         * @returns {$gapid}
         */
        addFile: function (name, parent, mime, body, options, callback) {
            var timerId = 'resource_google_drive_addFile_' + $gapid.id + '_' + id;
            $log.tools.resourceInfo($gapid.id, "add file '" + id + "'");
            $timer.start(timerId);
            var config = options || {};
            config.uploadType = 'multipart';
            config.parents = [{id: parent}];
            var opt = {
                resource: {
                    title: name,
                    mimeType: 'text/plain'
                },
                media: {
                    mimeType: mime,
                    body: body
                },
                fields: 'id'
            };
            require('merge').recursive(config, opt);

            $gapid.service.files.insert(config, function (err, response) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                    $log.tools.resourceWarn($gapid.id, 'could not create file ' + config.title + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not create file');
                }
                else {
                    $log.tools.resourceDebug($gapid.id, "file " + config.title + " created in resource " + $gapid.id, 4, duration, true);
                    callback(null, response);
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
            $log.tools.resourceInfo($gapid.id, "get directory '" + id + "'");
            $timer.start(timerId);
            var config = options || {};
            config.folderId = id;
            config.fields = 'id,title,name,mimeType';
            $gapid.service.children.list(config, function (err, list) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                    $log.tools.resourceWarn($gapid.id, 'could not get directory ' + config.folderId + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not get file metadata');
                }
                else {
                    $log.tools.resourceDebug($gapid.id, "folder " + config.folderId + " found in resource " + $gapid.id, 4, duration, true);
                    var result = [];
                    require('async').each(list.items, function (file, cb) {
                        $gapid.service.files.get({fileId: file.id, fields: 'id,title,mimeType'}, function (err, fileinfo) {
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
            var timerId = 'resource_google_drive_addDirectory_' + $gapid.id + '_' + id;
            $log.tools.resourceInfo($gapid.id, "add directory '" + id + "'");
            $timer.start(timerId);
            var config = options || {};
            config.title = name;
            config.parents = [{id: parent}];
            config.mimeType = "application/vnd.google-apps.folder";
            $gapid.service.files.insert(config, function (err, response) {
                var duration = $timer.timeStop(timerId);
                if (err) {
                    $log.tools.resourceWarn($gapid.id, 'could not create directory ' + config.title + ' in resource ' + $gapid.id + ' because ' + err.message, duration, true);
                    callback('could not create directory');
                }
                else {
                    $log.tools.resourceDebug($gapid.id, "directory " + config.title + " created in resource " + $gapid.id, 4, duration, true);
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
                    $log.tools.endpointDebug($gapid.id, req, "getFile()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var fileId = req.params.id || req.body.id || config.fileId || "fileId";
                        rs.getService("drive").getFile(fileId, config.config || {}, res, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error getting " + fileId + " file in resource " + rs.id + " because " + err.message);
                            }
                            else {
                                res.end();
                                $log.tools.endpointInfo($gapid.id, req, "returned file " + fileId + " from resource " + rs.id);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
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
                    $log.tools.endpointDebug($gapid.id, req, "findFile()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var qr = req.params.q || req.body.q || config.q;
                        var q = "fullText contains '" + qr + "'";
                        rs.getService("drive").findFile(q, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error finding files matching " + q + " in resource " + rs.id + " because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "returned files matching " + q + " from resource " + rs.id, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
                    }
                };
            },
            /**
             * Endpoint who add a new directory into another one
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            addFile: function (config) {
                return function (req, res) {
                    $log.tools.endpointDebug($gapid.id, req, "addFile()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var name, mime;

                        var inspect = require('util').inspect;
                        var Busboy = require('busboy');
                        var busboy = new Busboy({headers: req.headers});
                        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                            $log.tools.endpointDebug($gapid.id, req, " received file " + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype, 2);
                            name = filename;
                            mime = mimetype;
                            file.on('data', function (data) {
                                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
                            });
                            file.on('end', function () {
                                console.log('File [' + fieldname + '] Finished');
                            });
                        });
                        busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                            console.log('Field [' + fieldname + ']: value: ' + inspect(val));
                        });
                        busboy.on('finish', function () {
                            console.log('Done parsing form!');
                            var fileName = req.params.name || name;
                            var parentId = req.params.parent || req.body.parent || config.parent || "root";
                            rs.getService("drive").addFile(fileName, parentId, mime, new Buffer(busboy), config.config || {}, function (err, reponse) {
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error adding " + fileName + " folder in resource " + rs.id + " because " + err.message);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "folder " + fileName + " created in resource ", 2);
                                }
                            });
                        });
                        req.pipe(busboy);
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
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
                    $log.tools.endpointDebug($gapid.id, req, "listDirectory()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var folderId = req.params.id || req.body.id || config.folderId || "root";
                        rs.getService("drive").getDirectory(folderId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error getting " + folderId + " folder in resource " + rs.id + " because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "returned folder " + folderId + " from resource " + rs.id, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
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
                    $log.tools.endpointDebug($gapid.id, req, "addDirectory()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var folderId = req.params.name || req.body.name || config.name || "folder name";
                        var parentId = req.params.parent || req.body.parent || config.parent || "root";
                        rs.getService("drive").addDirectory(folderId, parentId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $gapid.id, req, "error adding " + folderId + " folder in resource " + rs.id + " because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse, $gapid.id, req, "folder " + folderId + " created in resource " + rs.id, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $gapid.id, req, config.resource);
                    }
                };
            }
        }
    };
    $gapid.init(config);
    return $gapid;
};