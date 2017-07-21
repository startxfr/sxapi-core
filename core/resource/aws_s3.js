/* global module, require, process, $log, $timer */
//'use strict';

/**
 * aws_s3 resource handler
 * @module resource/aws_s3
 * @constructor
 * @param {string} id
 * @param {object} config
 * @type resource
 */
module.exports = function (id, config) {
    var $s3 = {
        id: id,
        config: {},
        /**
         * Initiate the S3 bucket resource and check resource config
         * @param {object} config the resource config object
         * @returns {$bucket.s3}
         */
        init: function (config) {
            var timerId = 'resource_aws.s3_init_' + $s3.id;
            $timer.start(timerId);
            if (config) {
                $s3.config = config;
            }
            $log.debug("resource '" + $s3.id + "' : initializing", 3);
            if (!$s3.config.ACCESS_ID) {
                throw new Error("no 'ACCESS_ID' key found in resource '" + $s3.id + "' config");
            }
            if (!$s3.config.ACCESS_KEY) {
                throw new Error("no 'ACCESS_KEY' key found in resource '" + $s3.id + "' config");
            }
            $s3.AWS = require('aws-sdk');
            $log.debug("resource '" + $s3.id + "' : initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Start the S3 bucket resource as defined in the config
         * @param {function} callback to call when startup is done
         * @returns {$bucket.s3}
         */
        start: function (callback) {
            var timerId = 'resource_aws.s3_start_' + $s3.id;
            $log.debug("resource '" + $s3.id + "' : starting", 3);
            var cb = function () {
                $log.debug("resource '" + $s3.id + "' : started ", 1, $timer.timeStop(timerId));
                if (typeof callback === "function") {
                    callback();
                }
            };
            $s3.open(cb);
            return this;
        },
        /**
         * Stop the S3 bucket resource
         * @param {function} callback to call when stopped
         * @returns {$bucket.s3}
         */
        stop: function (callback) {
            $log.debug("Stopping resource '" + $s3.id + "'", 2);
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Open a connection the S3 bucket defined in the resource config
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        open: function (callback) {
            var timerId = 'resource_aws.s3_open_' + $s3.id;
            $timer.start(timerId);
            var config = {};
            if ($s3.config.ACCESS_ID) {
                config.accessKeyId = $s3.config.ACCESS_ID;
            }
            if ($s3.config.ACCESS_KEY) {
                config.secretAccessKey = $s3.config.ACCESS_KEY;
            }
            if ($s3.config.SESSION_TOKEN) {
                config.sessionToken = $s3.config.SESSION_TOKEN;
            }
            config.region = $s3.config.region || "us-west-1";
            $s3.s3bucket = new $s3.AWS.S3(config);
            $log.debug("resource '" + $s3.id + "' : connected with '" + $s3.config.ACCESS_ID + "'", 4, $timer.timeStop(timerId));
            if (typeof callback === "function") {
                callback(null, this);
            }
            return this;
        },
        /**
         * Read the S3 bucket defined in the config.bucket section of sxapi.json
         * @param {string} id object ID
         * @param {string} bucket bucket name
         * @param {object} options object with options to pass to the AWS receiveObject method
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        getObject: function (id, bucket, options, callback) {
            var timerId = 'resource_aws.s3_getObject_' + $s3.id;
            $timer.start(timerId);
            var config = $s3.config.getObject_options || {};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.Bucket = bucket || config.Bucket;
            config.Key = id || config.Key;
            $log.debug("Get S3 object " + config.Key + " in bucket " + config.Bucket, 4, null, true);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('could not get object ' + config.Key + ' in bucket ' + config.Bucket + ' because ' + error.message, duration, true);
                }
                else {
                    $log.debug("object " + config.Key + " found in bucket " + config.Bucket, 4, duration, true);
                }
            };
            var cb = (typeof callback === "function") ? callback : defaultCallback;
            $s3.s3bucket.getObject(config, function (error, response) {
                cb(error, response, cb, timerId);
            });
            return this;
        },
        /**
         * get the list of availables objects in a bucket
         * @param {string} bucket bucket name
         * @param {object} options object with options to pass to the AWS listObjectsV2 method
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        listObjects: function (bucket, options, callback) {
            var timerId = 'resource_aws.s3_listObjects_' + $s3.id;
            $timer.start(timerId);
            var config = $s3.config.listObjects_options || {};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.Bucket = bucket || config.Bucket;
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('could not list objects in bucket ' + config.Bucket + ' because ' + error.message, duration, true);
                }
                else {
                    $log.debug(response.Contents.length + "objects found in bucket " + config.Bucket, 4, duration, true);
                }
            };
            $s3.s3bucket.listObjectsV2(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * Add an object into an AWS S3 bucket
         * @param {string} id object ID
         * @param {string} object body of the object whe want to send
         * @param {string} bucket bucket name
         * @param {object} options object with options to pass to the AWS putObject method
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        addObject: function (id, object, bucket, options, callback) {
            var messId = object.id;
            var timerId = 'resource_aws.s3_addObject_' + $s3.id + '::' + messId;
            $timer.start(timerId);
            var config = $s3.config.addObject_options || {};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.Bucket = bucket || config.Bucket;
            config.Key = id || config.Key;
            config.Body = object;
            $log.debug("Add S3 object " + config.Key + " in bucket " + config.Bucket, 4, null, true);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('object ' + id + ' could not be send because ' + error.message, duration, true);
                }
                else {
                    $log.debug("Adding AWS S3 object " + id, 4, duration, true);
                }
            };
            $s3.s3bucket.putObject(config, callback ? callback : defaultCallback);
            return this;
        },
        updateObject : this.addObject,
        /**
         * Delete an object from an AWS S3 bucket
         * @param {string} id object ID
         * @param {string} bucket bucket name
         * @param {object} options object with options to pass to the AWS deleteObject method
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        deleteObject: function (id, bucket, options, callback) {
            var timerId = 'resource_aws.s3_deleteObject_' + $s3.id + '::' + id;
            $timer.start(timerId);
            var config = $s3.config.deleteObject_options || {};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.Bucket = bucket || config.Bucket;
            config.Key = id || config.Key;
            $log.debug("Delete S3 object " + config.Key + " in bucket " + config.Bucket, 4, null, true);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('object ' + id + ' could not be deleted because ' + error.message, duration, true);
                }
                else {
                    $log.debug("Deleting AWS S3 object " + id, 4, duration, true);
                }
            };
            $s3.s3bucket.deleteObject(config.Key, config.Bucket, config, callback ? callback : defaultCallback);
            return this;
        },
        /**
         * get the list of availables buckets
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        listBuckets: function (callback) {
            var timerId = 'resource_aws.s3_listBuckets_' + $s3.id;
            $timer.start(timerId);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('could not list bucket because ' + error.message, duration, true);
                }
                else {
                    $log.debug(response.BucketUrls.length + "bucket(s) found ", 4, duration, true);
                }
            };
            $s3.s3bucket.listBuckets((callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * information about a bucket
         * @param {object} options object with options to use for informations detail
         * @param {function} cb callback function to call when AWS answer
         * @returns {$bucket.s3}
         */
        infoBucket: function (options, cb) {
            var timerId = 'resource_aws.s3_infoBucket_' + $s3.id;
            $timer.start(timerId);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('could not get information about bucket because ' + error.message, duration, true);
                }
                else {
                    $log.debug("AWS S3 bucket informations", 4, duration, true);
                }
            };
            var params = {
                Bucket: options.Bucket
            };
            require('async').parallel({
                location: function (callback) {
                    $s3.s3bucket.getBucketLocation(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                tagging: function (callback) {
                    $s3.s3bucket.getBucketTagging(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                versioning: function (callback) {
                    $s3.s3bucket.getBucketVersioning(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                website: function (callback) {
                    $s3.s3bucket.getBucketWebsite(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                cors: function (callback) {
                    $s3.s3bucket.getBucketCors(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                acl: function (callback) {
                    $s3.s3bucket.getBucketAcl(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                replication: function (callback) {
                    $s3.s3bucket.getBucketReplication(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                policy: function (callback) {
                    $s3.s3bucket.getBucketPolicy(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                logging: function (callback) {
                    $s3.s3bucket.getBucketLogging(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                notification: function (callback) {
                    $s3.s3bucket.getBucketNotification(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                notificationConfiguration: function (callback) {
                    $s3.s3bucket.getBucketNotificationConfiguration(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                lifecycle: function (callback) {
                    $s3.s3bucket.getBucketLifecycle(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                lifecycleConfiguration: function (callback) {
                    $s3.s3bucket.getBucketLifecycleConfiguration(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                accelerateConfiguration: function (callback) {
                    $s3.s3bucket.getBucketAccelerateConfiguration(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                },
                requestPayment: function (callback) {
                    $s3.s3bucket.getBucketRequestPayment(params, function (err, data) {
                        if (err) callback(null, null);
                        else callback(null, data);
                    });
                }
            }, (cb) ? cb : defaultCallback);
            return this;
        },
        /**
         * create a new bucket
         * @param {object} options object with options to pass to the AWS createBucket method
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        createBucket: function (options, callback) {
            var timerId = 'resource_aws.s3_createBucket_' + $s3.id;
            $timer.start(timerId);
            var config = options || {};
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('could not create bucket because ' + error.message, duration, true);
                }
                else {
                    $log.debug("AWS S3 bucket created", 4, duration, true);
                }
            };
            $s3.s3bucket.createBucket(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * delete an existing bucket
         * @param {object} options object with options to pass to the AWS deleteBucket method
         * @param {function} callback to call when AWS answer
         * @returns {$bucket.s3}
         */
        deleteBucket: function (options, callback) {
            var timerId = 'resource_aws.s3_deleteBucket_' + $s3.id;
            $timer.start(timerId);
            var config = options || {};
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.warn('could not delete bucket because ' + error.message, duration, true);
                }
                else {
                    $log.debug("AWS S3 bucket deleted", 4, duration, true);
                }
            };
            $s3.s3bucket.deleteBucket(config, (callback) ? callback : defaultCallback);
            return this;
        },
        /**
         * Define a list of available endpoint for AWS S3 service
         */
        endpoints: {
            /**
             * Endpoint who list object in a AWS S3 bucket
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
                            var bucketId = req.params.id || req.body.id || config.Bucket || (config.config && config.config.Bucket) ? config.config.Bucket : "bucketname";
                            rs.listObjects(bucketId, config.config || {}, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error listing objects because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error listing objects because " + err.message);
                                }
                                else {
                                    var ct = (reponse.Contents) ? reponse.Contents.length : 0;
                                    ws.okResponse(res, message_prefix + "readding AWS S3 objects in bucket " + config.config.Bucket, reponse.Contents).addTotal(ct).send();
                                    $log.debug(message_prefix + "returned OK from transaction " + config.config.Bucket, 2);
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
             * Endpoint who return a raw file stored into an AWS S3 bucket
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
                            var bucketId = req.params.bid || req.body.bid || config.Bucket || ((config.config && config.config.Bucket) ? config.config.Bucket : "bucketname");
                            var objectId = req.params.id || req.body.id || config.objectId || ((config.config && config.config.Key) ? config.config.Key : "objectId");
                            rs.getObject(objectId, bucketId, config.config || {}, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error getting " + objectId+" object in bucket " + bucketId+" because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error getting " + objectId+" object in bucket " + bucketId+" because " + err.message);
                                }
                                else {
                                    res.set("Content-Type", reponse.ContentType);
                                    res.send(reponse.Body);
                                    $log.debug(message_prefix + "returned object " + objectId+" from bucket " + bucketId, 2);
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
             * Endpoint who add an object to the AWS S3 service
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
                            var bucketId = req.params.bid || req.body.bid || config.Bucket || ((config.config && config.config.Bucket) ? config.config.Bucket : "bucketname");
                            var objectId = req.params.id || req.body.id || config.objectId || ((config.config && config.config.Key) ? config.config.Key : "objectId");
                            rs.addObject(objectId, req.body, bucketId, config.config || {}, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error saving object because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error saving object because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "recorded AWS S3 object in transaction " + reponse.ResponseMetadata.ObjectId, reponse).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned OK from transaction " + reponse.ResponseMetadata.ObjectId, 2);
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
            updateObject : this.addObject,
            /**
             * Endpoint who delete a object stored in the AWS S3 service
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
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    var objectId = req.params.id || req.body.id || config.config.receiptHandle || false;
                    if (objectId === false) {
                        ws.nokResponse(res, message_prefix + "no id param found in request").httpCode(500).send();
                        $log.warn(message_prefix + "no id param found in request");
                    }
                    else if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        var BucketUrl = config.config.BucketUrl || config.BucketUrl || $s3.config.BucketUrl || "https://s3.eu-west-1.amazonaws.com";
                        objectId = objectId.replace(/[ ]/g, '+');
                        var params = config.config || {};
                        params.BucketUrl = BucketUrl;
                        params.ReceiptHandle = objectId;
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.deleteObject(config.config || {}, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error deleting object because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error saving object because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "deleted AWS S3 object in transaction " + reponse.ResponseMetadata.ObjectId, reponse).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned OK from transaction " + reponse.ResponseMetadata.ObjectId, 2);
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
             * Endpoint who send a list of the buckets availables for your account
             * @param {object} config object used to define where to get bucket list
             * @returns {function} the function used to handle the server response
             */
            listBuckets: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
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
                            rs.listBuckets(function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error getting bucket list because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error getting bucket list because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "founded " + reponse.Buckets.length + " bucket(s) available ", reponse.Buckets).addTotal(reponse.Buckets.length).send();
                                    $log.debug(message_prefix + "returned " + reponse.Buckets.length + " bucket(s) available ", 2);
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
             * Endpoint who get detail info for a AWS S3 bucket
             * @param {object} config object used to define the bucket parameters
             * @returns {function} the function used to handle the server response
             */
            infoBucket: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    var bucketId = req.params.id || req.body.id || config.Bucket || require('uuid').v1();
                    var params = config.config || {};
                    params.Bucket = bucketId;
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.infoBucket(params, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error getting info for AWS S3 bucket because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error getting info for bucket because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "information about AWS S3 bucket " + params.Bucket, reponse).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned OK", 2);
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
             * Endpoint who create a new object bucket in AWS S3 service
             * @param {object} config object used to define the bucket parameters
             * @returns {function} the function used to handle the server response
             */
            addBucket: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    var bucketId = req.params.id || req.body.id || config.config.BucketName || require('uuid').v1();
                    var params = config.config || {};
                    params.BucketName = bucketId;
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.createBucket(params, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error creating AWS S3 bucket because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error creating bucket because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "new AWS S3 bucket " + params.BucketName, reponse.BucketUrl).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned OK", 2);
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
             * Endpoint who delete a object bucket in AWS S3 service
             * @param {object} config object used to define where and how to store the object
             * @returns {function} the function used to handle the server response
             */
            deleteBucket: function (config) {
                /**
                 * Callback used when the endpoint is called
                 * @param {object} req request object from the webserver
                 * @param {object} res response object from the webserver
                 * @returns {undefined} 
                 */
                return function (req, res) {
                    var path = req.url.split("?")[0];
                    var ress = require('../resource');
                    var ws = require("../ws");
                    var message_prefix = "Endpoint " + req.method + " '" + path + "' : ";
                    $log.debug(message_prefix + "called", 1);
                    var bucketId = req.params.id || req.body.id || "";
                    var bucketUrlPath = config.bucketUrlPrefix || config.BucketUrl || "https://s3.us-west-1.amazonaws.com/xxxxxx/";
                    var params = config.config || {};
                    params.BucketUrl = bucketUrlPath + bucketId;
                    if (!config.resource) {
                        ws.nokResponse(res, message_prefix + "resource is not defined for this endpoint").httpCode(500).send();
                        $log.warn(message_prefix + "resource is not defined for this endpoint");
                    }
                    else {
                        if (ress.exist(config.resource)) {
                            var rs = ress.get(config.resource);
                            rs.deleteBucket(params, function (err, reponse) {
                                if (err) {
                                    ws.nokResponse(res, message_prefix + "error deleting AWS S3 bucket because " + err.message).httpCode(500).send();
                                    $log.warn(message_prefix + "error creating bucket because " + err.message);
                                }
                                else {
                                    ws.okResponse(res, message_prefix + "deleted AWS S3 bucket " + params.bucketId, true).addTotal(reponse.length).send();
                                    $log.debug(message_prefix + "returned OK", 2);
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
    $s3.init(config);
    return $s3;
};