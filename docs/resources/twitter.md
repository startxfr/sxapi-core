<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/testing/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : Twitter API

This resource allow you to interact with the Twitter API Webservice.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose Twitter API data.

This resource is based on [twitter npm module](https://www.npmjs.com/package/twitter) 
[![npm](https://img.shields.io/npm/v/twitter.svg)](https://www.npmjs.com/package/twitter) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.2.1-blue.svg)](https://github.com/startxfr/sxapi-core).

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

This config object will be passed to `require('twitter').Twitter()` method of the nodejs twitter module. 
[Read twitter Twitter documentation](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html) 
for a complete list of the parameters that you can use in this config object.

### Resource config parameters

| Param                   | Mandatory | Type   | default   | Description
|-------------------------|:---------:|:------:|-----------|---------------
| **_class**              | yes       | string |           | module name. Must be **twitter** for this resource
| **consumer_key**        | yes       | string |           | your Twitter consumer key.
| **consumer_secret**     | yes       | string |           | your Twitter consumer secret.
| **access_token_key**    | no        | string |           | your Twitter token key.
| **access_token_secret** | no        | string | us-west-1 | your Twitter token secret.
| **...**                 | no        | N/A    |           | any Twitter option. See [see twitter Twitter documentation](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#constructor-property).

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  twitter-id:
    _class: twitter
    consumer_key: xxxxxxxxxxx
    consumer_secret: yyyyyyyyyyyy
    access_token_key: xxxxxxxxxxx
    access_token_secret: yyyyyyyyyyyy
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('twitter-id')` where `twitter-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with several methods for manipulating aws Twitter resources.

[0. readStream method](#method-readstream)<br>
[1. read method](#method-read)<br>
[2. removeMessage method](#method-removemessage)<br>
[3. sendMessage method](#method-sendmessage)<br>
[4. listQueues method](#method-listqueues)<br>
[5. createQueue method](#method-createqueue)<br>
[6. deleteQueue method](#method-deletequeue)


### Method readStream

get a stream of tweet for a matching expression.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **match**                    | yes       | object   |         | the matching expression looking for
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the Twitter API Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('twitter-id');
resource.readStream(
    {match:"#paris"}, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method read

get a list of message for a list queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | no        | object   |         | Configuration option passed to the Twitter API.receiveMessage method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#receiveMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url to read message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the Twitter API Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('twitter-id');
resource.read(
    {QueueUrl:"https://sqs.eu-west-1.amazonaws.com"}, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method removeMessage

Remove a message from a list queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the Twitter API.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#deleteMessage-property)
| options.**ReceiptHandle**    | yes       | string   |         | the message Id to remove
| options.**QueueUrl**         | no        | string   |         | the queue url to delete message from. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the Twitter API Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this deletion


#### Example

```javascript
var resource = $app.resources.get('twitter-id');
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
| **options**                  | yes       | object   |         | Configuration option passed to the Twitter API.sendMessage method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#sendMessage-property)
| options.**QueueUrl**         | no        | string   |         | the queue url where message should be inserted. If not defined will use the default resource queueUrl
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the Twitter API Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('twitter-id');
resource.sendMessage(
    { id : "msg1", "key" : "value" }, 
    { QueueUrl:"https://sqs.eu-west-1.amazonaws.com" }, 
    function (error, response) {
        console.log(error, response);
    });
```

### Method listQueues

get a list of all queues availables.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | no        | object   |         | Configuration option passed to the Twitter API.listQueues method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#listQueues-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the Twitter API Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | a list of messages from the queue


#### Example

```javascript
var resource = $app.resources.get('twitter-id');
resource.listQueues({}, function (error, response) {
        console.log(error, response);
    });
```

### Method createQueue

Create a new message queue

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the Twitter API.createQueue method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#createQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the Twitter API Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('twitter-id');
resource.createQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


### Method deleteQueue

Delete a message queue.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | yes       | object   |         | Configuration option passed to the Twitter API.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#deleteQueue-property)
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the Twitter API Webservice. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | meta informations about the result of this insertion


#### Example

```javascript
var resource = $app.resources.get('twitter-id');
resource.deleteQueue({ }, function (error, response) {
        console.log(error, response);
    });
```


## Resource endpoints

This module come with 4 endpoints who can interact with any twitter method.

[1. listMessages endpoint](#listmessages-endpoint)<br>
[2. addMessage endpoint](#addmessage-endpoint)<br>
[3. deleteMessage endpoint](#deletemessage-endpoint)<br>
[4. listQueue endpoint](#listqueue-endpoint)<br>
[5. addQueue endpoint](#addQueue-endpoint)<br>
[6. deleteQueue endpoint](#deletequeue-endpoint)

### listMessages endpoint

The purpose of this endpoint is to make call to a Twitter API Webservice and to return 
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
  - path: "/twitter"
    resource: twitter-id
    endpoint: listMessages
    config: {}
```

### addMessage endpoint

The purpose of this endpoint is to insert a key into a Twitter API Webservice. Document 
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
  - path: "/twitter/:id"
    method: POST
    resource: twitter-id
    endpoint: addMessage
```

### deleteMessage endpoint

The purpose of this endpoint is to delete a message from Twitter API queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the Twitter API.deleteMessage method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#deleteMessage-property)

#### Example

```yaml
server:
  endpoints:
  - path: "/twitter/:id"
    method: DELETE
    resource: twitter-id
    endpoint: deleteMessage
```

### listQueue endpoint

The purpose of this endpoint is to make call to a Twitter API Webservice and to return 
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
  - path: "/twitter"
    resource: twitter-id
    endpoint: listQueue
    config: {}
```

### addQueue endpoint

The purpose of this endpoint is to insert a key into a Twitter API Webservice. Id 
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
  - path: "/twitter/:id"
    method: POST
    resource: twitter-id
    endpoint: addQueue
```

### deleteQueue endpoint

The purpose of this endpoint is to delete a complete Twitter API queue. Id is defined by the context.

#### Parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **path**                 | yes       | string |         | path used as client endpoint (must start with /)
| **resource**             | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**             | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **config**               | no        | object |         | Configuration option passed to the Twitter API.deleteQueue method. Read documentation for [more options](http://docs.aws.amazon.com/TwitterJavaScriptSDK/latest/Twitter/Twitter.html#deleteQueue-property)

#### Example

```yaml
server:
  endpoints:
  - path: "/twitter/:id"
    method: DELETE
    resource: twitter-id
    endpoint: deleteQueue
```