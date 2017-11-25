# SXAPI Resource : aws_sqs

## Resource configuration
This resource allow you to interact with a AWS SQS Message Bus. Based on [AWS SDK 2.6](https://github.com/aws/aws-sdk-js). This resource can be used using ```require('/app/core/resource').get('resource-id')``` in your own modules. You can then use one of the [availables methods](#available-methods). AWS SQS resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `class` **string** Must be aws_sqs for this resource
-   `ACCESS_ID` **string** AWS acess ID with credentials to the queue
-   `ACCESS_KEY` **string** AWS acess secret to use with ACCESS_ID
-   `SESSION_TOKEN` **string** token to use for authentication
-   `region` **string** AWS datacenter region
-   `QueueUrl` **string** Give the url of the AWS SQS endpoint to use. Could be overwrited by xx_options or by an endpoint config
-   `read_options` **object** options used when reading a message to the AWS SQS. [AWS SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#receiveMessage-property) for more options
    -   `QueueUrl`  **string** Give the url of the AWS SQS endpoint to use. Could be overwrited by an endpoint config
-   `delete_options` **object** options used when deleting a message to the AWS SQS. [AWS SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#deleteMessage-property) for more options
    -   `QueueUrl`  **string** Give the url of the AWS SQS endpoint to use. Could be overwrited by an endpoint config
-   `send_options` **object** options used when sending a message to the AWS SQS. [AWS SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property) for more options
    -   `QueueUrl`  **string** Give the url of the AWS SQS endpoint to use. Could be overwrited by an endpoint config

### **Sample sxapi.json**

```json
"resources": {
    ...
    "sqs-sample": {
        "_class": "aws_sqs",
            "read_options": {
                "MaxNumberOfMessages": 10,
                "VisibilityTimeout": 10,
                "WaitTimeSeconds": 0
            },
            "delete_options": {
                "MaxNumberOfMessages": 10,
                "VisibilityTimeout": 10,
                "WaitTimeSeconds": 0
            },
            "send_options": {
                "DelaySeconds": 10,
                "MessageAttributes": {
                    "from": {
                        "DataType": "String",
                        "StringValue": "startx"
                    }
                }
            },
        "QueueUrl": "https://sqs.eu-west-1.amazonaws.com/XXXXXXX/admin",
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

read a bunch of message from the queue. This method use queue configuration as defined in the resource ```read_options``` section of ([resource configuration](#resource-configuration))

#### **Parameters**

-   `options` **object** options used when reading a message to the AWS SQS. [AWS SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#receiveMessage-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS SQS cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.read(function (error, response) {
    console.log(error, response);
});
```

### Method sendMessage

sendMessage a message to the queue. Use it to broadcast a message throught all you applications.  This method use queue configuration as defined in the resource ```send_options``` section of ([resource configuration](#resource-configuration))

#### **Parameters**

-   `message` **object** The message to send to the queue
-   `message.id` **string** OPTIONAL define inside the message the ID of this message
-   `options` **object** options used when sendding a message to the AWS SQS. [AWS SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property) for more options
-   `callback` **function** OPTIONAL Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS SQS cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.sendMessage({id:'test',key:'value'}, function (error, response) {
    console.log(error, response);
});
```

### Method removeMessage

Remove a message from the queue according to the given messageId.  This method use queue configuration as defined in the resource ```delete_options``` section of ([resource configuration](#resource-configuration))

#### **Parameters**

-   `message` **object** The message to remove
-   `message.MessageId` **string** The messageID of this message. Used to remove from the queue
-   `message.ReceiptHandle` **string** OPTIONAL Token used to remove from the queue
-   `options` **object** options used when deleting a message to the AWS SQS. [AWS SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#deleteMessage-property) for more options
-   `callback` **function** Callback function used to handle the answer.  If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the AWS SQS cluster

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
-   `resource` **string** define the aws_sqs resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.addMessage***
-   `...` **string** endpoint config object will be to configure the AWS SQS sending params. [AWS SQS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property) for more options

#### **Sample code**

```json 
{
    "path": "/message",
    "method": "POST",
    "resource": "sqs-sample",
    "endpoint": "endpoints.addMessage"
    "xxx": "XXX"
}
```