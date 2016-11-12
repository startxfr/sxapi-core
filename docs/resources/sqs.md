# SXAPI Resource : sqs

This resource allow you to interact with a AWS SQS Message Bus. Based on [AWS SDK 2.6](https://github.com/aws/aws-sdk-js). This resource can be used using ```require('/app/core/resource').get('resource-id')``` in your own modules. You can then use one of the [availables methods](#available-methods). Couchbase resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `class` **string** Must be sqs for this resource
-   `ACCESS_ID` **string** AWS acess ID with credentials to the queue
-   `ACCESS_KEY` **string** AWS acess secret to use with ACCESS_ID
-   `SESSION_TOKEN` **string** token to use for authentication
-   `region` **string** AWS datacenter region
-   `config` **object** options used when inserting a document to the bucket. See [Couchbase Docs](http://docs.sqs.com/sdk-api/sqs-node-client-2.1.0/Bucket.html#insert) for more informations
    -   `QueueUrl` **int** Give the url of the endpoint to use for connecting to the queue
    -   `MaxNumberOfMessages` **int** give the number of message you wan't to receive from this request
    -   `VisibilityTimeout` **int** Set the time during received message won't be visible for other application
    -   `WaitTimeSeconds` **int** Set a pause time before starting to retreive a list of message

### **Sample sxapi.json**

```json
"resources": {
    ...
    "sqs-sample": {
        "_class": "sqs",
        "config": {
            "QueueUrl": "https://sqs.eu-west-1.amazonaws.com/XXXXXXXX/admin",
            "MaxNumberOfMessages": 10,
            "VisibilityTimeout": 10,
            "WaitTimeSeconds": 0
        },
        "ACCESS_ID": ">>>>>>YOUR ID<<<<<<",
        "ACCESS_KEY": ">>>>>>YOUR KEY<<<<<<",
        "SESSION_TOKEN": "",
        "region": "eu-west-1"
    },
    ...
}
```

## Available Methods

### Method read

read a bunch of message from the queue. This method use queue configuration as defined in the resource ```config``` section of ([resource configuration](#resource-configuration))

#### **Parameters**

-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the sqs cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.read(function (error, response) {
    console.log(error, response);
});

### Method sendMessage

sendMessage a message to the queue. Use it to broadcast a message throught all you applications. This method use queue endpoint as defined in the resource ```config.QueueUrl``` ([see resource configuration](#resource-configuration))

#### **Parameters**

-   `message` **object** The message to send to the queue
-   `message.id` **string** OPTIONAL define inside the message the ID of this message
-   `callback` **function** OPTIONAL Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the sqs cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.sendMessage({id:'test',key:'value'}, function (error, response) {
    console.log(error, response);
});
```

### Method removeMessage

Remove a message from the queue according to the given messageId. This method use queue endpoint as defined in the resource ```config.QueueUrl``` ([see resource configuration](#resource-configuration)). Use this method when a message is fully consumed by your services and other microservices API incharge of handling this kind of message.

#### **Parameters**

-   `message` **object** The message to remove
-   `message.MessageId` **string** The messageID of this message. Used to remove from the queue
-   `message.ReceiptHandle` **string** OPTIONAL Token used to remove from the queue
-   `callback` **function** Callback function used to handle the answer.  If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the sqs cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.removeMessage({MessageId:'test',ReceiptHandle:'value'}, function (error, response) {
    console.log(error, response);
});
```



## Available Endpoints

### addMessage endpoint

Add a message to the SQS queue

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the sqs resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler` **string** The resource handler to use. For this entrypoint, use ***endpoints.addMessage***

#### **Sample code**

```json 
{
    "path": "/message",
    "method": "POST",
    "resource": "sqs-sample",
    "resource_handler": "endpoints.addMessage"
}
```