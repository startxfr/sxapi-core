# SXAPI Resource : couchbase

This resource allow you to interact with a Couchbase Enterprise Server Cluster. 
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose couchbase data.

This resource is based on [couchbase npm module](https://www.npmjs.com/package/couchbase) 
[![couchbase SDK](https://img.shields.io/npm/v/couchbase.svg)](https://www.npmjs.com/package/couchbase) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.0.6-blue.svg)](https://github.com/startxfr/sxapi-core).

## Resource configuration

To configure this resource, you must add a config key under the ```resources```
section of your configuration profile. 
This key must be a unique string and will be considered as the resource id. The value 
must be an object who must have the [appropriate configuration parameters](#resource-config-parameters).

For a better understanting of the sxapi
configuration profile, please refer to the [configuration guide](../guides/2.Configure.md)

This config object will be passed to `couchbase.CreateClient()` method of the nodejs couchbase module. 
[Read node_couchbase documentation](https://github.com/NodeRedis/node_couchbase#options-object-properties) 
for a complete list of the parameters that you can use in this config object.

### Resource config parameters

| Param                           | Mandatory | Type   | default   | Description
|---------------------------------|:---------:|:------:|-----------|---------------
| **_class**                      | yes       | string |           | module name. Must be **couchbase** for this resource
| **cluster**                     | yes       | string |           | connection tring to the cluster. format is `couchbase://host[/bucket]` You have to give the full URL, with protocol (http or https) and port number (must be 8091) . If you wan to reach a cluster on the same machine using docker, don't forget to use the docker0 interface IP (like 172.17.x.x) using ```# ifconfig docker0``` and not localhost or 127.0.0.1. Example : http://172.17.42.1:8091. [read more on couchbase connection](https://developer.couchbase.com/documentation/server/4.1/developer-guide/connection-advanced.html)
| **bucket**                      | yes       | string |           | the bucket name to use. If you need to connect to several bucket, you'll have to create several resources
| **insertOptions**               | no        | object |           | options used when inserting a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#insert) for more informations
| **insertOptions.persist_to**    | no        | int    |           | Ensures this operation is persisted to this many nodes. Default is set to 0.






-   `insertOptions` **object** 
    -   `persist_to` **int** Ensures this operation is persisted to this many nodes. Default is set to 0.
    -   `replicate_to` **int** Ensures this operation is replicated to this many nodes. Default is set to 0.
    -   `expiry` **int** Set the initial expiration time for the document. A value of 0 represents never expiring. Default is set to 0.
-   `updateOptions` **object** options used when updating a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#replace) for more informations
    -   `persist_to` **int** Ensures this operation is persisted to this many nodes. Default is set to 0.
    -   `replicate_to` **int** Ensures this operation is replicated to this many nodes. Default is set to 0.
    -   `expiry` **int** Set the initial expiration time for the document. A value of 0 represents never expiring. Default is set to 0.
-   `deleteOptions` **object** options used when deleting a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#remove) for more informations
    -   `persist_to` **int** Ensures this operation is persisted to this many nodes. Default is set to 0.
    -   `replicate_to` **int** Ensures this operation is replicated to this many nodes. Default is set to 0.
    -   `expiry` **int** Set the initial expiration time for the document. A value of 0 represents never expiring. Default is set to 0.
























### Example

This is a sample configuration of this resource. You must add this section under 
the ```resources``` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "couchbase-id": {
        "_class" : "couchbase",
        "cluster": "couchbase://127.0.0.1",
        "bucket" : "bucket"
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('couchbase-id')` where `couchbase-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with several methods for manipulating couchbase dataset.

[1. Get method](#method-get)
[2. Query method](#method-query)
[3. Queryfree method](#method-queryfree)
[4. Insert method](#method-insert)
[5. Update method](#method-update)
[6. Delete method](#method-delete)


### Method get

get a couchbase value by it's given document ID.

#### Parameters

| Param           | Mandatory | Type     | default | Description
|-----------------|:---------:|:--------:|---------|---------------
| **docID**       | yes       | string   | null    | document ID to find
| **callback**    | no        | function | default | callback function to get the returned document. this function take 2 parameters:  <br>first is **error** (must be null, false or undefined if no error) <br>second is **document** object (if no error)<br>If not defined, dropped to a default function who output information to the debug console


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.get('docID', function (error, response) {
    console.log(error, response);
});
```

### Method insert

insert a couchbase document associated to the given ID.

#### Parameters

| Param           | Mandatory | Type     | default | Description
|-----------------|:---------:|:--------:|---------|---------------
| **docID**       | yes       | string   | null    | document ID to use
| **document**    | yes       | string   | null    | document associated to this ID
| **callback**    | no        | function | default | callback function to call when insertion is done. this function take 2 parameters:  <br>first is **error** (must be null, false or undefined if no error) <br>second is **document** object (if no error)<br>If not defined, dropped to a default function who output information to the debug console


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.insert('docID', 'my document', function (error, response) {
    console.log(error, response);
});
```

### Method update

update a couchbase value associated to the given document ID.

#### Parameters

| Param           | Mandatory | Type     | default | Description
|-----------------|:---------:|:--------:|---------|---------------
| **docID**       | yes       | string   | null    | document ID to update
| **document**    | yes       | string   | null    | the new document associated to this ID
| **callback**    | no        | function | default | callback function to call when insertion is done. this function take 2 parameters:  <br>first is **error** (must be null, false or undefined if no error) <br>second is **document** object (if no error)<br>If not defined, dropped to a default function who output information to the debug console


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.update('docID', 'my new document', function (error, response) {
    console.log(error, response);
});
```

### Method delete

delete a couchbase document ID and it associated value.

#### Parameters

| Param           | Mandatory | Type     | default | Description
|-----------------|:---------:|:--------:|---------|---------------
| **docID**       | yes       | string   | null    | document ID to delete
| **callback**    | no        | function | default | callback function to call when insertion is done. this function take 1 parameters:  <br>**error** (must be null, false or undefined if no error) <br>If not defined, dropped to a default function who output information to the debug console


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.delete('docID', function (error) {
    console.log(error);
});
```

## Resource endpoints

This module come with one single endpoint with can interact with any couchbase method.

[1. List endpoint](#list-endpoint)
[2. Get endpoint](#get-endpoint)
[3. Create endpoint](#create-endpoint)
[4. Update endpoint](#update-endpoint)
[5. Delete endpoint](#delete-endpoint)


### List endpoint

The purpose of this endpoint is to make call to a couchbase server and to return 
the value associated to the given document ID.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"
| **n1ql**        | yes       | string |         | the n1ql query to execute and get a result from

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase",
            "resource": "couchbase-id",
            "endpoint": "list",
            "n1ql": "SELECT name FROM `beer-sample` WHERE  brewery_id =\"mishawaka_brewing\";"
        }
    ]
}
```

### Get endpoint

The purpose of this endpoint is to make call to a couchbase server and to return 
the value associated to the given document ID.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase",
            "resource": "couchbase-id",
            "endpoint": "get"
        }
    ]
}
```

### Create endpoint

The purpose of this endpoint is to insert a document ID into a couchbase server. 
Document Id is defined by the context, and document will be the HTTP body of the query.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase/:id",
            "resource": "couchbase-id",
            "endpoint": "create"
        }
    ]
}
```


### Update endpoint

The purpose of this endpoint is to update a document into a couchbase server. 
Document Id is defined by the context, and document will be the HTTP body of the query.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "update"

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase/:id",
            "resource": "couchbase-id",
            "endpoint": "update"
        }
    ]
}
```

### Delete endpoint

The purpose of this endpoint is to delete a document into a couchbase server. 
Document Id is defined by the context.
by the context.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase/:id",
            "resource": "couchbase-id",
            "endpoint": "delete"
        }
    ]
}
```






















# SXAPI Resource : couchbase





## Resource configuration

### **Config parameters**

### **Sample sxapi.json**

```javascript
"resources": {
    ...
    "couchbase-sample": {
        "_class": "couchbase",
        "cluster": "http://172.17.42.1:8091",
        "bucket": "beer-sample",
        "insertOptions": {
            "persist_to": 1
        },
        "updateOptions": {
            "persist_to": 1
        },
        "deleteOptions": {
            "persist_to": 1
        }
    }
    ...
}
```

## Available Methods

### Method get

Get a document for the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to find
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the couchbase cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.get('my-doc-id', function (error, response) {
    console.log(error, response);
});
```

### Method query

Send a N1QL request to the query service of the couchbase cluster defined in the given resource. Use Query and Index node as well as Data Node according to your query. Take care of having theses services optimized for the kind of query you perform.

#### **Parameters**

-   `n1ql` **string** The N1QL request to send to the query node for the resource's cluster
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the couchbase cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.query('SELECT * FROM `beer-sample` LIMIT 0, 5', function (error, response) {
    console.log(error, response);
});
```

### Method insert

Insert a document into the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to create
-   `document` **string** The document body
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__insertDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the couchbase cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.insert('my-doc-id', {document ID:'value'}, function (error, response) {
    console.log(error, response);
});
```

### update

Update a document into the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to update
-   `document` **string** The document body
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__updateDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the couchbase cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.update('my-doc-id', {document ID:'value'}, function (error, response) {
    console.log(error, response);
});
```

### delete

Remove a document into the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to delete
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__deleteDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the couchbase cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.delete('my-doc-id', function (error, response) {
    console.log(error, response);
});
```



## Available Endpoints

### list endpoint

Return a list resulting from a N1ql query

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the couchbase resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.list***
-   `n1ql` **string** N1QL query to execute whent his entrypoint is called

#### **Sample code**

```javascript 
{
    "path": "/beer", "method": "GET",
    "resource": "couchbase-sample",
    "endpoint": "endpoints.list",
    "n1ql": "SELECT * FROM `beer-sample` LIMIT 10"
}
```

### get endpoint

Return a document coresponding to the given docId

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the couchbase resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.get***

#### **Sample code**

```javascript 
{
    "path": "/beer/:id", "method": "GET",
    "resource": "couchbase-sample",
    "endpoint": "endpoints.get"
}
```

### create endpoint

Insert a new document in the bucket. You could give and id or leave the system create one for you

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the couchbase resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.create***

#### **Sample code**

```javascript 
{
    "path": "/beer/:id", "method": "POST",
    "resource": "couchbase-sample",
    "endpoint": "endpoints.create"
}
```
```javascript
{
    "path": "/beer", "method": "POST",
    "resource": "couchbase-sample",
    "endpoint": "endpoints.create"
}
```

### update endpoint

Update the document coresponding to the given docId with the new document

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the couchbase resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.update***

#### **Sample code**

```javascript 
{
    "path": "/beer/:id", "method": "PUT",
    "resource": "couchbase-sample",
    "endpoint": "endpoints.update"
}
```

### delete endpoint

Remove the document coresponding to the given docId with the new document

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the couchbase resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.delete***

#### **Sample code**

```javascript 
{
    "path": "/beer/:id", "method": "DELETE",
    "resource": "couchbase-sample",
    "endpoint": "endpoints.delete"
}
```