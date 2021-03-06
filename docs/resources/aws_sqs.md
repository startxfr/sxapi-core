# SXAPI Resource : AWS SQS

This resource allow you to interact with the AWS SQS Webservice.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose AWS SQS data.

This resource is based on [aws-sdk npm module](https://www.npmjs.com/package/aws-sdk) 
[![npm](https://img.shields.io/npm/v/aws-sdk.svg)](https://www.npmjs.com/package/aws-sdk) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
from [![sxapi](https://img.shields.io/badge/sxapi-v0.0.6-blue.svg)](https://github.com/startxfr/sxapi-core).

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

This config object will be passed to `require('aws-sdk').SQS()` method of the nodejs aws-sdk module. 
[Read aws-sdk SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html) 
for a complete list of the parameters that you can use in this config object.

### Resource config parameters

| Param               | Mandatory | Type   | default   | Description
|---------------------|:---------:|:------:|-----------|---------------
| **_class**          | yes       | string |           | module name. Must be **aws_sqs** for this resource
| **ACCESS_ID**       | yes       | string |           | your AWS access key ID.
| **ACCESS_KEY**      | yes       | string |           | your AWS secret access key.
| **SESSION_TOKEN**   | no        | string |           | the optional AWS session token to sign requests with.
| **QueueUrl**        | no        | string |           | the default queue url used by this resource
| **region**          | no        | string | us-west-1 | the region to send service requests to. See AWS.SQS.region for more information.
| **...**             | no        | N/A    |           | any SQS option. See [see aws-sdk SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#constructor-property).

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  aws-sqs-id:
    _class: aws_sqs
    ACCESS_ID: XXXXXXXXXXXXX
    ACCESS_KEY: XXXXXXXXXXXXX
    region: eu-west-3
    QueueUrl: https://sqs.eu-west-3.amazonaws.com
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('aws-sqs-id')` where `aws-sqs-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with several methods for manipulating aws SQS resources.

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
| **options**                  | no        | object   |         | Configuration option passed to the AWS SQS.receiveMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#receiveMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url to read message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS SQS Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('aws-sqs-id');
resource.read(
    {QueueUrl:"https://sqs.eu-west-3.amazonaws.com"}, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method removeMessage

Remove a message from a list queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS SQS.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#deleteMessage-property)
| options.**ReceiptHandle**    | yes       | string   |         | the message Id to remove
| options.**QueueUrl**         | no        | string   |         | the queue url to delete message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS SQS Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this deletion


#### Example

```javascript
var resource = $app.resources.get('aws-sqs-id');
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
| **options**                  | yes       | object   |         | Configuration option passed to the AWS SQS.sendMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url where message should be inserted. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS SQS Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-sqs-id');
resource.sendMessage(
    { id : "msg1", "key" : "value" }, 
    { QueueUrl:"https://sqs.eu-west-3.amazonaws.com" }, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method listQueues

get a list of all queues availables.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | no        | object   |         | Configuration option passed to the AWS SQS.listQueues method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#listQueues-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS SQS Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('aws-sqs-id');
resource.listQueues({}, function (error, response) {
        console.log(error, response);
    });
```

### Method createQueue

Create a new message queue

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS SQS.createQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#createQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS SQS Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-sqs-id');
resource.createQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


### Method deleteQueue

Delete a message queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the AWS SQS.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#deleteQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the AWS SQS Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('aws-sqs-id');
resource.deleteQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


## Resource endpoints

This module come with 4 endpoints who can interact with any aws_sqs method.

[1. listMessages endpoint](#listmessages-endpoint)<br>
[2. addMessage endpoint](#addmessage-endpoint)<br>
[3. deleteMessage endpoint](#deletemessage-endpoint)<br>
[4. listQueue endpoint](#listqueue-endpoint)<br>
[5. addQueue endpoint](#addQueue-endpoint)<br>
[6. deleteQueue endpoint](#deletequeue-endpoint)

### listMessages endpoint

The purpose of this endpoint is to make call to a AWS SQS Webservice and to return 
the a list of message from a given queue.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"
| **config**      | no        | string |         | Configuration object to pass to the read resource method ([see options](#method-read))

#### Example

```yaml
server:
  endpoints:
  - path: "/aws_sqs"
    resource: aws-sqs-id
    endpoint: listMessages
    config:
      QueueUrl: https://sqs.eu-west-3.amazonaws.com
```

### addMessage endpoint

The purpose of this endpoint is to insert a key into a AWS SQS Webservice. Document 
will be the HTTP body of the query.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"
| **config**      | no        | string |         | Configuration object to pass to the sendMessage resource method ([see options](#method-sendmessage))

#### Example

```yaml
server:
  endpoints:
  - path: "/aws_sqs/:id"
    method: POST
    resource: aws-sqs-id
    endpoint: addMessage
```

### deleteMessage endpoint

The purpose of this endpoint is to delete a message from AWS SQS queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the AWS SQS.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#deleteMessage-property)

#### Example

```yaml
server:
  endpoints:
  - path: "/aws_sqs/:id"
    method: DELETE
    resource: aws-sqs-id
    endpoint: deleteMessage
```

### listQueue endpoint

The purpose of this endpoint is to make call to a AWS SQS Webservice and to return 
the a list of availables queues.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"
| **config**      | no        | string |         | Configuration object to pass to the listQueues resource method ([see options](#method-listqueues))

#### Example

```yaml
server:
  endpoints:
  - path: "/aws_sqs"
    resource: aws-sqs-id
    endpoint: listQueue
    config:
      QueueUrl: https://sqs.eu-west-3.amazonaws.com
```

### addQueue endpoint

The purpose of this endpoint is to insert a key into a AWS SQS Webservice. Id 
is defined by the context.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"
| **config**      | no        | string |         | Configuration object to pass to the createQueue resource method ([see options](#method-createqueue))

#### Example

```yaml
server:
  endpoints:
  - path: "/aws_sqs/:id"
    method: POST
    resource: aws-sqs-id
    endpoint: addQueue
```

### deleteQueue endpoint

The purpose of this endpoint is to delete a complete AWS SQS queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the AWS SQS.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#deleteQueue-property)

#### Example

```yaml
server:
  endpoints:
  - path: "/aws_sqs/:id"
    method: DELETE
    resource: aws-sqs-id
    endpoint: deleteQueue
```