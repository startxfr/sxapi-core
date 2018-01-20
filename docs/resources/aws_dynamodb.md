<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.0.92-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : AWS DynamoDB

This resource allow you to interact with the AWS DynamoDB Webservice.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose AWS DynamoDB data.

This resource is based on [aws-sdk npm module](https://www.npmjs.com/package/aws-sdk) 
[![npm](https://img.shields.io/npm/v/aws-sdk.svg)](https://www.npmjs.com/package/aws-sdk) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.0.69-blue.svg)](https://github.com/startxfr/sxapi-core).

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

This config object will be passed to `require('aws-sdk').DynamoDB()` method of the nodejs aws-sdk module. 
[Read aws-sdk DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html) 
for a complete list of the parameters that you can use in this config object.

### Resource config parameters

| Param               | Mandatory | Type   | default   | Description
|---------------------|:---------:|:------:|-----------|---------------
| **_class**          | yes       | string |           | module name. Must be **aws_dynamodb** for this resource
| **ACCESS_ID**       | yes       | string |           | your AWS access key ID.
| **ACCESS_KEY**      | yes       | string |           | your AWS secret access key.
| **SESSION_TOKEN**   | no        | string |           | the optional AWS session token to sign requests with.
| **QueueUrl**        | no        | string |           | the default queue url used by this resource
| **region**          | no        | string | us-west-1 | the region to send service requests to. See AWS.DynamoDB.region for more information.
| **...**             | no        | N/A    |           | any DynamoDB option. See [see aws-sdk DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "aws-dynamodb-id": {
        "_class": "aws_dynamodb",
        "ACCESS_ID": "xxxxxxxxxxx",
        "ACCESS_KEY" : "yyyyyyyyyyyy",
        "region" : "eu-west-1",
        "QueueUrl" : "https://dynamodb.eu-west-1.amazonaws.com"
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('aws-dynamodb-id')` where `aws-dynamodb-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with several methods for manipulating aws DynamoDB resources.

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
| **options**                  | no        | object   |         | Configuration option passed to the AWS DynamoDB.receiveMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#receiveMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url to read message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS DynamoDB Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('aws-dynamodb-id');
resource.read(
    {QueueUrl:"https://dynamodb.eu-west-1.amazonaws.com"}, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method removeMessage

Remove a message from a list queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS DynamoDB.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteMessage-property)
| options.**ReceiptHandle**    | yes       | string   |         | the message Id to remove
| options.**QueueUrl**         | no        | string   |         | the queue url to delete message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS DynamoDB Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this deletion


#### Example

```javascript
var resource = $app.resources.get('aws-dynamodb-id');
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
| **options**                  | yes       | object   |         | Configuration option passed to the AWS DynamoDB.sendMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#sendMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url where message should be inserted. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS DynamoDB Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-dynamodb-id');
resource.sendMessage(
    { id : "msg1", "key" : "value" }, 
    { QueueUrl:"https://dynamodb.eu-west-1.amazonaws.com" }, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method listQueues

get a list of all queues availables.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | no        | object   |         | Configuration option passed to the AWS DynamoDB.listQueues method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listQueues-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS DynamoDB Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('aws-dynamodb-id');
resource.listQueues({}, function (error, response) {
        console.log(error, response);
    });
```

### Method createQueue

Create a new message queue

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS DynamoDB.createQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS DynamoDB Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-dynamodb-id');
resource.createQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


### Method deleteQueue

Delete a message queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS DynamoDB.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS DynamoDB Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-dynamodb-id');
resource.deleteQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


## Resource endpoints

This module come with 4 endpoints who can interact with any aws_dynamodb method.

[1. listMessages endpoint](#listmessages-endpoint)<br>
[2. addMessage endpoint](#addmessage-endpoint)<br>
[3. deleteMessage endpoint](#deletemessage-endpoint)<br>
[4. listQueue endpoint](#listqueue-endpoint)<br>
[5. addQueue endpoint](#addQueue-endpoint)<br>
[6. deleteQueue endpoint](#deletequeue-endpoint)

### listMessages endpoint

The purpose of this endpoint is to make call to a AWS DynamoDB Webservice and to return 
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
            "path": "/aws_dynamodb",
            "resource": "aws-dynamodb-id",
            "endpoint": "listMessages",
            "config": {
                QueueUrl : "https://dynamodb.eu-west-1.amazonaws.com"
            }
        }
    ]
}
```

### addMessage endpoint

The purpose of this endpoint is to insert a key into a AWS DynamoDB Webservice. Document 
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
            "path": "/aws_dynamodb/:id",
            "method": "POST",
            "resource": "aws-dynamodb-id",
            "endpoint": "addMessage"
        }
    ]
}
```

### deleteMessage endpoint

The purpose of this endpoint is to delete a message from AWS DynamoDB queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the AWS DynamoDB.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteMessage-property)

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_dynamodb/:id",
            "method": "DELETE",
            "resource": "aws-dynamodb-id",
            "endpoint": "deleteMessage"
        }
    ]
}
```

### listQueue endpoint

The purpose of this endpoint is to make call to a AWS DynamoDB Webservice and to return 
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
            "path": "/aws_dynamodb",
            "resource": "aws-dynamodb-id",
            "endpoint": "listQueue",
            "config": {
                QueueUrl : "https://dynamodb.eu-west-1.amazonaws.com"
            }
        }
    ]
}
```

### addQueue endpoint

The purpose of this endpoint is to insert a key into a AWS DynamoDB Webservice. Id 
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
            "path": "/aws_dynamodb/:id",
            "method": "POST",
            "resource": "aws-dynamodb-id",
            "endpoint": "addQueue"
        }
    ]
}
```

### deleteQueue endpoint

The purpose of this endpoint is to delete a complete AWS DynamoDB queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the AWS DynamoDB.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteQueue-property)

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/aws_dynamodb/:id",
            "method": "DELETE",
            "resource": "aws-dynamodb-id",
            "endpoint": "deleteQueue"
        }
    ]
}
```





























# SXAPI Resource : aws_dynamodb

This resource allow you to interact with a AWS DynamoDB Storage service. Based on [AWS SDK 2.6](https://github.com/aws/aws-sdk-js). This resource can be used using `$app.resources.get('resource-id')` in your own modules. You can then use one of the [availables methods](#available-methods). AWS DynamoDB resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `_class` **string** Must be aws_dynamodb for this resource
-   `ACCESS_ID` **string** AWS acess ID with credentials to the queue
-   `ACCESS_KEY` **string** AWS acess secret to use with ACCESS_ID
-   `SESSION_TOKEN` **string** token to use for authentication
-   `region` **string** AWS datacenter region
-   `Table` **string** Give the default Table name to use. Could be overwrited by xx_options or by an endpoint config
-   `read_options` **object** options used when reading an object from the AWS DynamoDB. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#receiveMessage-property) for more options
    -   `Table`  **string** Give the url of the AWS DynamoDB endpoint to use. Could be overwrited by an endpoint config
-   `delete_options` **object** options used when deleting an object from the AWS DynamoDB. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteMessage-property) for more options
    -   `Table`  **string** Give the url of the AWS DynamoDB endpoint to use. Could be overwrited by an endpoint config
-   `listObjects_options` **object** options used when listing an object list from an AWS DynamoDB Table. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listObjectsV2-property) for more options
    -   `Table`  **string** Give the Table name to use. Could be overwrited by an endpoint config

### **Sample sxapi.json**

```javascript
"resources": {
    ...
    "dynamodb-sample": {
        "_class": "aws_dynamodb",
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

list objects in a given table. This method use `listObjects_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `table` **string** table name
-   `options` **object** options used to get object list. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listObjectsV2-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS DynamoDB cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.listObjects('tablename',{}, function (error, response) {
    console.log(error, response);
});
```

### Method getObject

return an object given by it ID. This method use `getObject_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to get
-   `table` **string** table name
-   `options` **object** options used when reading a message to the AWS DynamoDB. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#receiveMessage-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS DynamoDB cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.getObject('file.pdf','tablename',{},function (error, response) {
    console.log(error, response);
});
```

### Method addObject

Add an object into a table. This method use `addObject_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to add
-   `content` **string** content (could be a Stream or Buffer) 
-   `table` **string** table name
-   `options` **object** options used for adding this object. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putObject-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS DynamoDB cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.addObject('file.txt','content sample','tablename',{},function (error, response) {
    console.log(error, response);
});
```
```

### Method updateObject

Update an object into a table. This method use `updateObject_options` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to update
-   `content` **string** content (could be a Stream or Buffer) 
-   `table` **string** table name
-   `options` **object** options used for updating this object. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putObject-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS DynamoDB cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.updateObject('file.txt','content sample','tablename',{},function (error, response) {
    console.log(error, response);
});
```

## Available Endpoints

### listObjects endpoint

List objects stored in a table

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_dynamodb resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listObjectsV2-property) for more options
-   `table` **string** table name

#### **Sample code**

```javascript 
{
    "path": "/dynamodb",
    "method": "GET",
    "resource": "dynamodb-sample",
    "endpoint": "endpoints.listObjects",
    "table" : "sxapitest",
    "config": {
        "Table" : "sxapitest"
    }
}
```

#### **call this endpoint**

```bash
curl -X GET http://127.0.0.1:8080/dynamodb
```

### getObject endpoint

Get one object stored in a table

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_dynamodb resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listObjectsV2-property) for more options
-   `table` **string** table name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/dynamodb/:id",
    "method": "GET",
    "resource": "dynamodb-sample",
    "endpoint": "endpoints.getObject",
    "table" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X GET http://127.0.0.1:8080/dynamodb/file.pdf
```

### addObject endpoint

Add one object into a table

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_dynamodb resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listObjectsV2-property) for more options
-   `table` **string** table name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/dynamodb/:id",
    "method": "POST",
    "resource": "dynamodb-sample",
    "endpoint": "endpoints.addObject",
    "table" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X POST http://127.0.0.1:8080/dynamodb/file.pdf
```

### updateObject endpoint

Update one object into a table

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the aws_dynamodb resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the AWS endpoint. [AWS DynamoDB documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listObjectsV2-property) for more options
-   `table` **string** table name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/dynamodb/:id",
    "method": "PUT",
    "resource": "dynamodb-sample",
    "endpoint": "endpoints.updateObject",
    "table" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X PUT http://127.0.0.1:8080/dynamodb/file.pdf
```