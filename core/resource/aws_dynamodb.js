/* global module, require, process, $log, $timer, $app */
//'use strict';

/**
 * aws_dynamodb resource handler
 * @module resource/aws_dynamodb
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $ddb = {
        id: id,
        config: {},
        /**
         * Initiate the DynamoDB table resource and check resource config
         * @param {object} config the resource config object
         * @returns {$table.dynamodb}
         */
        init: function (config) {
            var timerId = 'resource_aws.dynamodb_init_' + $ddb.id;
            $timer.start(timerId);
            if (config) {
                $ddb.config = config;
            }
            $log.tools.resourceDebug($ddb.id, "initializing", 3);
            if (!$ddb.config.ACCESS_ID) {
                throw new Error("no 'ACCESS_ID' key found in resource '" + $ddb.id + "' config");
            }
            if (!$ddb.config.ACCESS_KEY) {
                throw new Error("no 'ACCESS_KEY' key found in resource '" + $ddb.id + "' config");
            }
            if (!$ddb.config.TableName) {
                throw new Error("no 'TableName' key found in resource '" + $ddb.id + "' config");
            }
            if (!$ddb.config.partitionKey) {
                throw new Error("no 'partitionKey' key found in resource '" + $ddb.id + "' config");
            }
            $ddb.AWS = require('aws-sdk');
            $log.tools.resourceDebug($ddb.id, "initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Start the DynamoDB table resource as defined in the config
         * @param {function} callback to call when startup is done
         * @returns {$table.dynamodb}
         */
        start: function (callback) {
            var timerId = 'resource_aws.dynamodb_start_' + $ddb.id;
            $log.tools.resourceDebug($ddb.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($ddb.id, "started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $ddb.open(cb);
            return this;
        },
        /**
         * Stop the DynamoDB table resource
         * @param {function} callback to call when stopped
         * @returns {$table.dynamodb}
         */
        stop: function (callback) {
            $log.tools.resourceDebug($ddb.id, "Stopping", 2);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Open a connection the DynamoDB table defined in the resource config
         * @param {function} callback to call when AWS answer
         * @returns {$table.dynamodb}
         */
        open: function (callback) {
            var timerId = 'resource_aws.dynamodb_open_' + $ddb.id;
            $timer.start(timerId);
            var config = {};
            if ($ddb.config.ACCESS_ID) {
                config.accessKeyId = $ddb.config.ACCESS_ID;
            }
            if ($ddb.config.ACCESS_KEY) {
                config.secretAccessKey = $ddb.config.ACCESS_KEY;
            }
            if ($ddb.config.SESSION_TOKEN) {
                config.sessionToken = $ddb.config.SESSION_TOKEN;
            }
            config.region = $ddb.config.region || "us-west-1";
            $ddb.AWS.config.update(config);
            $ddb.client = new $ddb.AWS.DynamoDB.DocumentClient();
            $log.tools.resourceDebug($ddb.id, "connected with '" + $ddb.config.ACCESS_ID + "'", 4, $timer.timeStop(timerId));
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Read the DynamoDB table defined in the config.table section of sxapi.json
         * @param {string} id object ID
         * @param {string} table table name
         * @param {object} options object with options to pass to the AWS receiveObject method
         * @param {function} callback to call when AWS answer
         * @returns {$table.dynamodb}
         */
        getObject: function (id, table, options, callback) {
            var timerId = 'resource_aws.dynamodb_getObject_' + $ddb.id;
            $timer.start(timerId);
            var config = $ddb.config.getObject_options || {Key:{}};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.TableName = table || config.TableName || $ddb.config.TableName;
            config.Key[$ddb.config.partitionKey] = id;
            $log.tools.resourceInfo($ddb.id, "Get object " + id + " in table " + config.TableName);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($ddb.id, 'could not get object ' + id + ' in table ' + config.TableName + ' because ' + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($ddb.id, "object " + id + " found in table " + config.TableName, 4, duration);
                }
            };
            var cb = (typeof callback === "function") ? callback : defaultCallback;
            $ddb.client.get(config, function (error, response) {
                cb(error, response, cb, timerId);
            });
            return this;
        },
        /**
         * get the list of availables objects in a table
         * @param {string} table table name
         * @param {object} options object with options to pass to the AWS listObjectsV2 method
         * @param {function} callback to call when AWS answer
         * @returns {$table.dynamodb}
         */
        listObjects: function (table, options, callback) {
            var timerId = 'resource_aws.dynamodb_listObjects_' + $ddb.id;
            $log.tools.resourceInfo($ddb.id, "list objects in table '" + config.TableName + "'");
            $timer.start(timerId);
            var config = $ddb.config.listObjects_options || {};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.TableName = table || config.TableName || $ddb.config.TableName;
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($ddb.id, 'could not list objects in table ' + config.TableName + ' because ' + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($ddb.id, "listed " + response.Contents.length + "objects in table " + config.TableName, 4, duration);
                }
            };
            $ddb.client.query(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * Add an object into an AWS DynamoDB table
         * @param {string} id object ID
         * @param {string} object body of the object whe want to send
         * @param {string} table table name
         * @param {object} options object with options to pass to the AWS putObject method
         * @param {function} callback to call when AWS answer
         * @returns {$table.dynamodb}
         */
        addObject: function (id, object, table, options, callback) {
            var messId = object.id;
            var timerId = 'resource_aws.dynamodb_addObject_' + $ddb.id + '::' + messId;
            $timer.start(timerId);
            var config = $ddb.config.addObject_options || {};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.TableName = table || config.TableName || $ddb.config.TableName;
            config.Item = (JSON.isSerializable(object)) ? JSON.serialize(object) : object;
            config.Item[$ddb.config.partitionKey] = id;
            $log.tools.resourceInfo($ddb.id, "add DynamoDB object " + id + " in table " + config.TableName);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($ddb.id, 'object ' + id + ' could not be send because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($ddb.id, "Adding AWS DynamoDB object " + id, 4, duration, true);
                }
            };
            $ddb.client.put(config, callback ? callback : defaultCallback);
            return this;
        },
        updateObject: this.addObject,
        /**
         * Delete an object from an AWS DynamoDB table
         * @param {string} id object ID
         * @param {string} table table name
         * @param {object} options object with options to pass to the AWS deleteObject method
         * @param {function} callback to call when AWS answer
         * @returns {$table.dynamodb}
         */
        deleteObject: function (id, table, options, callback) {
            var timerId = 'resource_aws.dynamodb_deleteObject_' + $ddb.id + '::' + id;
            $timer.start(timerId);
            var config = $ddb.config.deleteObject_options ||  {Key:{}};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.TableName = table || config.TableName || $ddb.config.TableName;
            config.Key[$ddb.config.partitionKey] = id;
            $log.tools.resourceInfo($ddb.id, "delete DynamoDB object " + id + " in table " + config.TableName);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($ddb.id, 'object ' + id + ' could not be deleted because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($ddb.id, "Deleting AWS DynamoDB object " + id, 4, duration, true);
                }
            };
            $ddb.client.delete(config, config, callback ? callback : defaultCallback);
            return this;
        },
        /**
         * Define a list of available endpoint for AWS DynamoDB service
         */
        endpoints: {
            /**
             * Endpoint who list object in a AWS DynamoDB table
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            listObjects: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($ddb.id, req, "listObjects()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var tableId = req.params.id || req.body.id || config.TableName || (config.config && config.config.TableName) ? config.config.TableName : "tablename";
                        rs.listObjects(tableId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $ddb.id, req, "error listing objects because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.Contents, $ddb.id, req, "readding AWS DynamoDB objects in table " + config.config.TableName, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $ddb.id, req, config.resource);
                    }
                };
            },
            /**
             * Endpoint who return a raw file stored into an AWS DynamoDB table
             * @param {object} config object used to define where to get object from
             * @returns {function} the function used to handle the server response
             */
            getObject: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($ddb.id, req, "getObject()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var tableId = req.params.bid || req.body.bid || config.TableName || ((config.config && config.config.TableName) ? config.config.TableName : "tablename");
                        var objectId = req.params.id || req.body.id || config.objectId || ((config.config && config.config.Key) ? config.config.Key : "objectId");
                        rs.getObject(objectId, tableId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $ddb.id, req, "error getting " + objectId + " object in table " + tableId + " because " + err.message);
                            }
                            else {
                                res.set("Content-Type", reponse.ContentType);
                                res.send(reponse.Body);
                                $log.tools.endpointInfo($ddb.id, req, "returned object " + objectId + " from table " + tableId);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $ddb.id, req, config.resource);
                    }
                };
            },
            /**
             * Endpoint who add an object to the AWS DynamoDB service
             * @param {object} config object used to define where and how to store the object
             * @returns {function} the function used to handle the server response
             */
            addObject: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($ddb.id, req, "addObject()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var tableId = req.params.bid || req.body.bid || config.TableName || ((config.config && config.config.TableName) ? config.config.TableName : "tablename");
                        var objectId = req.params.id || req.body.id || config.objectId || ((config.config && config.config.Key) ? config.config.Key : "objectId");
                        rs.addObject(objectId, req.body, tableId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $ddb.id, req, "error saving object because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.TableNames, $ddb.id, req, "recorded AWS DynamoDB object in transaction " + reponse.ResponseMetadata.ObjectId, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $ddb.id, req, config.resource);
                    }
                };
            },
            updateObject: this.addObject,
            /**
             * Endpoint who delete a object stored in the AWS DynamoDB service
             * @param {object} config object used to define where and how to store the object
             * @returns {function} the function used to handle the server response
             */
            deleteObject: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    $log.tools.endpointDebug($ddb.id, req, "deleteObject()", 1);
                    var objectId = req.params.id || req.body.id || config.config.receiptHandle || false;
                    if (objectId === false) {
                        $log.tools.endpointErrorAndAnswer(res, $ddb.id, req, "no id param found in request");
                    }
                    else {
                        var TableUrl = config.config.TableNameUrl || config.TableNameUrl || $ddb.config.TableNameUrl || "https://s3.eu-west-1.amazonaws.com";
                        objectId = objectId.replace(/[ ]/g, '+');
                        var params = config.config || {};
                        params.TableNameUrl = TableUrl;
                        params.ReceiptHandle = objectId;
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            rs.deleteObject(config.config || {}, function (err, reponse) {
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $ddb.id, req, "error saving object because " + err.message);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $ddb.id, req, "deleted AWS DynamoDB object in transaction " + reponse.ResponseMetadata.ObjectId, 2);
                                }
                            });
                        }
                        else {
                            $log.tools.endpointWarnAndAnswerNoResource(res, $ddb.id, req, config.resource);
                        }
                    }
                };
            }
        }
    };
    $ddb.init(config);
    return $ddb;
};