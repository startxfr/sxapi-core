<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.2.25-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : AWS S3

This resource allow you to interact with the AWS S3 Webservice.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose AWS S3 data.

This resource is based on [aws-sdk npm module](https://www.npmjs.com/package/aws-sdk) 
[![npm](https://img.shields.io/npm/v/aws-sdk.svg)](https://www.npmjs.com/package/aws-sdk) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.0.8-blue.svg)](https://github.com/startxfr/sxapi-core).

- [Resource configuration](#resource-configuration)<br>
- [Resource methods](#resource-methods)<br>
- [Resource endpoints](#resource-endpoints)

## Resource configuration

To configure this resource, you must add a config key under the `resources`
section of your configuration profile. 
This key must be a unique string and will be considered as the resource id. The value 
must be an object who must have the [appropriate configuration parameters](#resource-config-parameters).

For a better understanting of the sxapi
configuration profile, please refer to the [configuration guide](../guides/2.Configure.md)

This config object will be passed to `require('aws-sdk').S3()` method of the nodejs aws-sdk module. 
[Read aws-sdk S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) 
for a complete list of the parameters that you can use in this config object.

### Resource config parameters

| Param               | Mandatory | Type   | default   | Description
|---------------------|:---------:|:------:|-----------|---------------
| **_class**          | yes       | string |           | module name. Must be **aws_s3** for this resource
| **ACCESS_ID**       | yes       | string |           | your AWS access key ID.
| **ACCESS_KEY**      | yes       | string |           | your AWS secret access key.
| **SESSION_TOKEN**   | no        | string |           | the optional AWS session token to sign requests with.
| **QueueUrl**        | no        | string |           | the default queue url used by this resource
| **region**          | no        | string | us-west-1 | the region to send service requests to. See AWS.S3.region for more information.
| **...**             | no        | N/A    |           | any S3 option. See [see aws-sdk S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property).

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "aws-s3-id": {
        "_class": "aws_s3",
        "ACCESS_ID": "xxxxxxxxxxx",
        "ACCESS_KEY" : "yyyyyyyyyyyy",
        "region" : "eu-west-1",
        "QueueUrl" : "https://s3.eu-west-1.amazonaws.com"
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('aws-s3-id')` where `aws-s3-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with several methods for manipulating aws S3 resources.

[1. read method](#method-read)<br>
[2. removeMessage method](#method-removemessage)<br>
[3. sendMessage method](#method-sendmessage)<br>
[4. listQueues method](#method-listqueues)<br>
[5. createQueue method](#method-createqueue)<br>
[6. deleteQueue method](#method-deletequeue)


### Method read

get a list of message for a list queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | no        | object   |         | Configuration option passed to the AWS S3.receiveMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#receiveMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url to read message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS S3 Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('aws-s3-id');
resource.read(
    {QueueUrl:"https://s3.eu-west-1.amazonaws.com"}, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method removeMessage

Remove a message from a list queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS S3.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteMessage-property)
| options.**ReceiptHandle**    | yes       | string   |         | the message Id to remove
| options.**QueueUrl**         | no        | string   |         | the queue url to delete message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS S3 Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this deletion


#### Example

```javascript
var resource = $app.resources.get('aws-s3-id');
resource.removeMessage(
    {ReceiptHandle:"df654s8#9d23s43f3mgh?66se63"}, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method sendMessage

Send a message to the given queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **message**                  | yes       | object   |         | The message object
| **options**                  | yes       | object   |         | Configuration option passed to the AWS S3.sendMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#sendMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url where message should be inserted. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS S3 Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-s3-id');
resource.sendMessage(
    { id : "msg1", "key" : "value" }, 
    { QueueUrl:"https://s3.eu-west-1.amazonaws.com" }, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method listQueues

get a list of all queues availables.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | no        | object   |         | Configuration option passed to the AWS S3.listQueues method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listQueues-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS S3 Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('aws-s3-id');
resource.listQueues({}, function (error, response) {
        console.log(error, response);
    });
```

### Method createQueue

Create a new message queue

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS S3.createQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS S3 Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-s3-id');
resource.createQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


### Method deleteQueue

Delete a message queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS S3.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS S3 Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-s3-id');
resource.deleteQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


## Resource endpoints

This module come with 4 endpoints who can interact with any aws_s3 method.

[1. listMessages endpoint](#listmessages-endpoint)<br>
[2. addMessage endpoint](#addmessage-endpoint)<br>
[3. deleteMessage endpoint](#deletemessage-endpoint)<br>
[4. listQueue endpoint](#listqueue-endpoint)<br>
[5. addQueue endpoint](#addQueue-endpoint)<br>
[6. deleteQueue endpoint](#deletequeue-endpoint)

### listMessages endpoint

The purpose of this endpoint is to make call to a AWS S3 Webservice and to return 
the a list of message from a given queue.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"
| **config**      | no        | string |         | Configuration object to pass to the read resource method ([see options](#method-read))

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_s3",
            "resource": "aws-s3-id",
            "endpoint": "listMessages",
            "config": {
                QueueUrl : "https://s3.eu-west-1.amazonaws.com"
            }
        }
    ]
}
```

### addMessage endpoint

The purpose of this endpoint is to insert a key into a AWS S3 Webservice. Document 
will be the HTTP body of the query.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"
| **config**      | no        | string |         | Configuration object to pass to the sendMessage resource method ([see options](#method-sendmessage))

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_s3/:id",
            "method": "POST",
            "resource": "aws-s3-id",
            "endpoint": "addMessage"
        }
    ]
}
```

### deleteMessage endpoint

The purpose of this endpoint is to delete a message from AWS S3 queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the AWS S3.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteMessage-property)

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_s3/:id",
            "method": "DELETE",
            "resource": "aws-s3-id",
            "endpoint": "deleteMessage"
        }
    ]
}
```

### listQueue endpoint

The purpose of this endpoint is to make call to a AWS S3 Webservice and to return 
the a list of availables queues.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"
| **config**      | no        | string |         | Configuration object to pass to the listQueues resource method ([see options](#method-listqueues))

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_s3",
            "resource": "aws-s3-id",
            "endpoint": "listQueue",
            "config": {
                QueueUrl : "https://s3.eu-west-1.amazonaws.com"
            }
        }
    ]
}
```

### addQueue endpoint

The purpose of this endpoint is to insert a key into a AWS S3 Webservice. Id 
is defined by the context.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"
| **config**      | no        | string |         | Configuration object to pass to the createQueue resource method ([see options](#method-createqueue))

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_s3/:id",
            "method": "POST",
            "resource": "aws-s3-id",
            "endpoint": "addQueue"
        }
    ]
}
```

### deleteQueue endpoint

The purpose of this endpoint is to delete a complete AWS S3 queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the AWS S3.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteQueue-property)

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_s3/:id",
            "method": "DELETE",
            "resource": "aws-s3-id",
            "endpoint": "deleteQueue"
        }
    ]
}
```





























# SXAPI Resource : aws_s3

This resource allow you to interact with a AWS S3 Storage service. Based on [AWS SDK 2.6](https://github.com/aws/aws-sdk-js). This resource can be used using `$app.resources.get('resource-id')` in your own modules. You can then use one of the [availables methods](#available-methods). AWS S3 resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `_class` **string** Must be aws_s3 for this resource
-   `ACCESS_ID` **string** AWS acess ID with credentials to the queue
-   `ACCESS_KEY` **string** AWS acess secret to use with ACCESS_ID
-   `SESSION_TOKEN` **string** token to use for authentication
-   `region` **string** AWS datacenter region
-   `Bucket` **string** Give the default Bucket name to use. Could be overwrited by xx_options or by an endpoint config
-   `read_options` **object** options used when reading an object from the AWS S3. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#receiveMessage-property) for more options
    -   `Bucket`  **string** Give the url of the AWS S3 endpoint to use. Could be overwrited by an endpoint config
-   `delete_options` **object** options used when deleting an object from the AWS S3. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteMessage-property) for more options
    -   `Bucket`  **string** Give the url of the AWS S3 endpoint to use. Could be overwrited by an endpoint config
-   `listObjects_options` **object** options used when listing an object list from an AWS S3 Bucket. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property) for more options
    -   `Bucket`  **string** Give the Bucket name to use. Could be overwrited by an endpoint config

### **Sample sxapi.json**

```javascript
"resources": {
    ...
    "s3-sample": {
        "_class": "aws_s3",
        "read_options": {
        },
        "delete_options": {
        },
        "send_options": {
        },
        "listObjects_options": {
        },
        "ACCESS_ID": "XXXX",
        "ACCESS_KEY": "XXXX/YYYYYYYYY+ZZZZZ",
        "SESSION_TOKEN": "",
        "region": "eu-west-1"
    },
    ...
}
```

## Available Methods

### Method listObjects

list objects in a given bucket. This method use `listObjects_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `bucket` **string** bucket name
-   `options` **object** options used to get object list. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS S3 cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.listObjects('bucketname',{}, function (error, response) {
    console.log(error, response);
});
```

### Method getObject

return an object given by it ID. This method use `getObject_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to get
-   `bucket` **string** bucket name
-   `options` **object** options used when reading a message to the AWS S3. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#receiveMessage-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS S3 cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.getObject('file.pdf','bucketname',{},function (error, response) {
    console.log(error, response);
});
```

### Method addObject

Add an object into a bucket. This method use `addObject_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to add
-   `content` **string** content (could be a Stream or Buffer) 
-   `bucket` **string** bucket name
-   `options` **object** options used for adding this object. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS S3 cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.addObject('file.txt','content sample','bucketname',{},function (error, response) {
    console.log(error, response);
});
```
```

### Method updateObject

Update an object into a bucket. This method use `updateObject_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to update
-   `content` **string** content (could be a Stream or Buffer) 
-   `bucket` **string** bucket name
-   `options` **object** options used for updating this object. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS S3 cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.updateObject('file.txt','content sample','bucketname',{},function (error, response) {
    console.log(error, response);
});
```

## Available Endpoints

### listObjects endpoint

List objects stored in a bucket

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_s3 resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name

#### **Sample code**

```javascript 
{
    "path": "/s3",
    "method": "GET",
    "resource": "s3-sample",
    "endpoint": "endpoints.listObjects",
    "bucket" : "sxapitest",
    "config": {
        "Bucket" : "sxapitest"
    }
}
```

#### **call this endpoint**

```bash
curl -X GET http://127.0.0.1:8080/s3
```

### getObject endpoint

Get one object stored in a bucket

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_s3 resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/s3/:id",
    "method": "GET",
    "resource": "s3-sample",
    "endpoint": "endpoints.getObject",
    "bucket" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X GET http://127.0.0.1:8080/s3/file.pdf
```

### addObject endpoint

Add one object into a bucket

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_s3 resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/s3/:id",
    "method": "POST",
    "resource": "s3-sample",
    "endpoint": "endpoints.addObject",
    "bucket" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X POST http://127.0.0.1:8080/s3/file.pdf
```

### updateObject endpoint

Update one object into a bucket

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_s3 resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS S3 documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/s3/:id",
    "method": "PUT",
    "resource": "s3-sample",
    "endpoint": "endpoints.updateObject",
    "bucket" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X PUT http://127.0.0.1:8080/s3/file.pdf
```