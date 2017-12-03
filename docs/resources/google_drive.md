v0.0.9


# SXAPI Resource : google_drive

This resource allow you to interact with a Google Drive Storage service. Based on [Google SDK 2.6](https://github.com/google/google-sdk-js). This resource can be used using ```$app.resources.get('resource-id')``` in your own modules. You can then use one of the [availables methods](#available-methods). Google Drive resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `_class` **string** Must be google_drive for this resource
-   `ACCESS_ID` **string** Google acess ID with credentials to the queue
-   `ACCESS_KEY` **string** Google acess secret to use with ACCESS_ID
-   `SESSION_TOKEN` **string** token to use for authentication
-   `region` **string** Google datacenter region
-   `Bucket` **string** Give the default Bucket name to use. Could be overwrited by xx_options or by an endpoint config
-   `read_options` **object** options used when reading an object from the Google Drive. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#receiveMessage-property) for more options
    -   `Bucket`  **string** Give the url of the Google Drive endpoint to use. Could be overwrited by an endpoint config
-   `delete_options` **object** options used when deleting an object from the Google Drive. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#deleteMessage-property) for more options
    -   `Bucket`  **string** Give the url of the Google Drive endpoint to use. Could be overwrited by an endpoint config
-   `listObjects_options` **object** options used when listing an object list from an Google Drive Bucket. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#listObjectsV2-property) for more options
    -   `Bucket`  **string** Give the Bucket name to use. Could be overwrited by an endpoint config

### **Sample sxapi.json**

```javascript
"resources": {
    ...
    "drive-sample": {
        "_class": "google_drive",
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

list objects in a given bucket. This method use ```listObjects_options``` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `bucket` **string** bucket name
-   `options` **object** options used to get object list. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#listObjectsV2-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the Google Drive cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.listObjects('bucketname',{}, function (error, response) {
    console.log(error, response);
});
```

### Method getObject

return an object given by it ID. This method use ```getObject_options``` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to get
-   `bucket` **string** bucket name
-   `options` **object** options used when reading a message to the Google Drive. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#receiveMessage-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the Google Drive cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.getObject('file.pdf','bucketname',{},function (error, response) {
    console.log(error, response);
});
```

### Method addObject

Add an object into a bucket. This method use ```addObject_options``` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to add
-   `content` **string** content (could be a Stream or Buffer) 
-   `bucket` **string** bucket name
-   `options` **object** options used for adding this object. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#putObject-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the Google Drive cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.addObject('file.txt','content sample','bucketname',{},function (error, response) {
    console.log(error, response);
});
```
```

### Method updateObject

Update an object into a bucket. This method use ```updateObject_options``` configuration as defined in the ([resource configuration](#resource-configuration))

#### **Parameters**

-   `id` **string** object id to update
-   `content` **string** content (could be a Stream or Buffer) 
-   `bucket` **string** bucket name
-   `options` **object** options used for updating this object. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#putObject-property) for more options
-   `callback` **function** Callback function used to handle the answer. If not provided, use an internal default function. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content responded for the Google Drive cluster

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
-   `resource` **string** define the google_drive resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the Google endpoint. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name

#### **Sample code**

```javascript 
{
    "path": "/drive",
    "method": "GET",
    "resource": "drive-sample",
    "endpoint": "endpoints.listObjects",
    "bucket" : "sxapitest",
    "config": {
        "Bucket" : "sxapitest"
    }
}
```

#### **call this endpoint**

```bash
curl -X GET http://127.0.0.1:8080/drive
```

### getObject endpoint

Get one object stored in a bucket

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the google_drive resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the Google endpoint. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/drive/:id",
    "method": "GET",
    "resource": "drive-sample",
    "endpoint": "endpoints.getObject",
    "bucket" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X GET http://127.0.0.1:8080/drive/file.pdf
```

### addObject endpoint

Add one object into a bucket

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the google_drive resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the Google endpoint. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/drive/:id",
    "method": "POST",
    "resource": "drive-sample",
    "endpoint": "endpoints.addObject",
    "bucket" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X POST http://127.0.0.1:8080/drive/file.pdf
```

### updateObject endpoint

Update one object into a bucket

#### **Config parameters**

-   `path` **string** Server path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the google_drive resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.listObjects***
-   `config` **object** endpoint config object to send to the Google endpoint. [Google Drive documentation](http://docs.google.amazon.com/GoogleJavaScriptSDK/latest/Google/Drive.html#listObjectsV2-property) for more options
-   `bucket` **string** bucket name
-   `objectId` **string** ID of the object to get

#### **Sample code**

```javascript 
{
    "path": "/drive/:id",
    "method": "PUT",
    "resource": "drive-sample",
    "endpoint": "endpoints.updateObject",
    "bucket" : "sxapitest"
}
```

#### **call this endpoint**

```bash
curl -X PUT http://127.0.0.1:8080/drive/file.pdf
```