/* global module, require, process, $log, $timer, $app */
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
            $log.tools.resourceDebug($s3.id, "initializing", 3);
            if (!$s3.config.ACCESS_ID) {
                throw new Error("no 'ACCESS_ID' key found in resource '" + $s3.id + "' config");
            }
            if (!$s3.config.ACCESS_KEY) {
                throw new Error("no 'ACCESS_KEY' key found in resource '" + $s3.id + "' config");
            }
            $s3.AWS = require('aws-sdk');
            $log.tools.resourceDebug($s3.id, "initialized ", 1, $timer.timeStop(timerId));
            return this;
        },
        /**
         * Start the S3 bucket resource as defined in the config
         * @param {function} callback to call when startup is done
         * @returns {$bucket.s3}
         */
        start: function (callback) {
            var timerId = 'resource_aws.s3_start_' + $s3.id;
            $log.tools.resourceDebug($s3.id, "starting", 3);
            var cb = function () {
                $log.tools.resourceDebug($s3.id, "started ", 1, $timer.timeStop(timerId));
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
            $log.tools.resourceDebug($s3.id, "Stopping", 2);
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
            $log.tools.resourceDebug($s3.id, "connected with '" + $s3.config.ACCESS_ID + "'", 4, $timer.timeStop(timerId));
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
            $log.tools.resourceInfo($s3.id, "Get object " + config.Key + " in bucket " + config.Bucket);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'could not get object ' + config.Key + ' in bucket ' + config.Bucket + ' because ' + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($s3.id, "object " + config.Key + " found in bucket " + config.Bucket, 4, duration);
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
            $log.tools.resourceInfo($s3.id, "list objects in bucket '" + config.Bucket + "'");
            $timer.start(timerId);
            var config = $s3.config.listObjects_options || {};
            if (typeof options === 'object') {
                require('merge').recursive(config, options);
            }
            config.Bucket = bucket || config.Bucket;
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'could not list objects in bucket ' + config.Bucket + ' because ' + error.message, duration);
                }
                else {
                    $log.tools.resourceDebug($s3.id, "listed " + response.Contents.length + "objects in bucket " + config.Bucket, 4, duration);
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
            config.Body = (JSON.isSerializable(object)) ? JSON.serialize(object) : object;
            $log.tools.resourceInfo($s3.id, "add S3 object " + config.Key + " in bucket " + config.Bucket);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'object ' + id + ' could not be send because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($s3.id, "Adding AWS S3 object " + id, 4, duration, true);
                }
            };
            $s3.s3bucket.putObject(config, callback ? callback : defaultCallback);
            return this;
        },
        updateObject: this.addObject,
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
            $log.tools.resourceInfo($s3.id, "delete S3 object " + config.Key + " in bucket " + config.Bucket);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'object ' + id + ' could not be deleted because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($s3.id, "Deleting AWS S3 object " + id, 4, duration, true);
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
            $log.tools.resourceInfo($s3.id, "list buckets");
            $timer.start(timerId);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'could not list bucket because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($s3.id, response.BucketUrls.length + "bucket(s) found ", 4, duration);
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
            $log.tools.resourceInfo($s3.id, "get bucket '" + config.Bucket + "' informations");
            $timer.start(timerId);
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'could not get information about bucket because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($s3.id, "AWS S3 bucket informations", 4, duration);
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
            $log.tools.resourceInfo($s3.id, "create a bucket");
            $timer.start(timerId);
            var config = options || {};
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'could not create bucket because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($s3.id, "AWS S3 bucket created", 4, duration);
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
            $log.tools.resourceInfo($s3.id, "delete bucket '" + config.Bucket + "'");
            $timer.start(timerId);
            var config = options || {};
            var defaultCallback = function (error, response) {
                var duration = $timer.timeStop(timerId);
                if (error) {
                    $log.tools.resourceWarn($s3.id, 'could not delete bucket because ' + error.message, duration, true);
                }
                else {
                    $log.tools.resourceDebug($s3.id, "AWS S3 bucket deleted", 4, duration);
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
                    $log.tools.endpointDebug($s3.id, req, "listObjects()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var bucketId = req.params.id || req.body.id || config.Bucket || (config.config && config.config.Bucket) ? config.config.Bucket : "bucketname";
                        rs.listObjects(bucketId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error listing objects because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.Contents, $s3.id, req, "readding AWS S3 objects in bucket " + config.config.Bucket, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
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
                    $log.tools.endpointDebug($s3.id, req, "getObject()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var bucketId = req.params.bid || req.body.bid || config.Bucket || ((config.config && config.config.Bucket) ? config.config.Bucket : "bucketname");
                        var objectId = req.params.id || req.body.id || config.objectId || ((config.config && config.config.Key) ? config.config.Key : "objectId");
                        rs.getObject(objectId, bucketId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error getting " + objectId + " object in bucket " + bucketId + " because " + err.message);
                            }
                            else {
                                res.set("Content-Type", reponse.ContentType);
                                res.send(reponse.Body);
                                $log.tools.endpointInfo($s3.id, req, "returned object " + objectId + " from bucket " + bucketId);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
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
                    $log.tools.endpointDebug($s3.id, req, "addObject()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        var bucketId = req.params.bid || req.body.bid || config.Bucket || ((config.config && config.config.Bucket) ? config.config.Bucket : "bucketname");
                        var objectId = req.params.id || req.body.id || config.objectId || ((config.config && config.config.Key) ? config.config.Key : "objectId");
                        rs.addObject(objectId, req.body, bucketId, config.config || {}, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error saving object because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.Buckets, $s3.id, req, "recorded AWS S3 object in transaction " + reponse.ResponseMetadata.ObjectId, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
                    }
                };
            },
            updateObject: this.addObject,
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
                    $log.tools.endpointDebug($s3.id, req, "deleteObject()", 1);
                    var objectId = req.params.id || req.body.id || config.config.receiptHandle || false;
                    if (objectId === false) {
                        $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "no id param found in request");
                    }
                    else {
                        var BucketUrl = config.config.BucketUrl || config.BucketUrl || $s3.config.BucketUrl || "https://s3.eu-west-1.amazonaws.com";
                        objectId = objectId.replace(/[ ]/g, '+');
                        var params = config.config || {};
                        params.BucketUrl = BucketUrl;
                        params.ReceiptHandle = objectId;
                        if ($app.resources.exist(config.resource)) {
                            var rs = $app.resources.get(config.resource);
                            rs.deleteObject(config.config || {}, function (err, reponse) {
                                if (err) {
                                    $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error saving object because " + err.message);
                                }
                                else {
                                    $log.tools.endpointDebugAndAnswer(res, reponse, $s3.id, req, "deleted AWS S3 object in transaction " + reponse.ResponseMetadata.ObjectId, 2);
                                }
                            });
                        }
                        else {
                            $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
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
                    $log.tools.endpointDebug($s3.id, req, "listBuckets()", 1);
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.listBuckets(function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error getting bucket list because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.Buckets, $s3.id, req, "founded " + reponse.Buckets.length + " bucket(s) available ", 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
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
                    $log.tools.endpointDebug($s3.id, req, "infoBucket()", 1);
                    var bucketId = req.params.id || req.body.id || config.Bucket || require('uuid').v1();
                    var params = config.config || {};
                    params.Bucket = bucketId;
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.infoBucket(params, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error getting info for bucket because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse, $s3.id, req, "information about AWS S3 bucket " + params.Bucket, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
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
                    $log.tools.endpointDebug($s3.id, req, "addBucket()", 1);
                    var bucketId = req.params.id || req.body.id || config.config.BucketName || require('uuid').v1();
                    var params = config.config || {};
                    params.BucketName = bucketId;
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.createBucket(params, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error creating bucket because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, reponse.BucketUrl, $s3.id, req, "new AWS S3 bucket " + params.BucketName, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
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
                    $log.tools.endpointDebug($s3.id, req, "deleteBucket()", 1);
                    var bucketId = req.params.id || req.body.id || "";
                    var bucketUrlPath = config.bucketUrlPrefix || config.BucketUrl || "https://s3.us-west-1.amazonaws.com/xxxxxx/";
                    var params = config.config || {};
                    params.BucketUrl = bucketUrlPath + bucketId;
                    if ($app.resources.exist(config.resource)) {
                        var rs = $app.resources.get(config.resource);
                        rs.deleteBucket(params, function (err, reponse) {
                            if (err) {
                                $log.tools.endpointErrorAndAnswer(res, $s3.id, req, "error creating bucket because " + err.message);
                            }
                            else {
                                $log.tools.endpointDebugAndAnswer(res, true, $s3.id, req, "deleted AWS S3 bucket " + params.bucketId, 2);
                            }
                        });
                    }
                    else {
                        $log.tools.endpointWarnAndAnswerNoResource(res, $s3.id, req, config.resource);
                    }
                };
            }
        }
    };
    $s3.init(config);
    return $s3;
};