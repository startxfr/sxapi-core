# SXAPI Resource : couchbase

This resource allow you to interact with a couchbase Enterprise Server Cluster. Based on [Couchase NodeJS SDK 2.1.8](http://developer.couchbase.com/documentation/server/4.1/sdks/node-2.0/introduction.html). This resource can be used using ```require('/app/core/resource-couchbase)``` in your own modules. You can then use one of the [availables methods](#available-methods). Couchbase resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `class` **string** Must be resource-couchbase for this resource
-   `cluster` **string** URL of the couchbase cluster to use. You have to give the full URL, with protocol (http or https) and port number (must be 8091) . If you wan to reach a cluster on the same machine, please use docker host IP (like 172.17.x.x). Example : http://172.17.42.1:8091
-   `bucket` **string** Bucket to use for this resource. If you need to connect to several bucket, you'll have to create several resources
-   `password` **string** Password used for this bucket
-   `insertOptions` **object** options used when inserting a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#insert) for more informations
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

### **Sample config**

```json
"resources": {
    ...
    "couchbase-sample": {
        "_class": "resource-couchbase",
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

### get

Get a document for the bucket according to the given docId

#### **Parameters**

-   `docId` **String** The document ID to find
-   `callback` **Function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **Boolean** True if and error occur. Response describe this error
    -   `response` **Object, Array** Content responded for the couchbase cluster

#### **Sample code**

```javascript
var rs = require('./resource');
if (rs.exist('resource-id')) {
    var resource = rs.get('resource-id');
    resource.get(docId, function (error, response) {
        console.log(error, response);
    });
}
```





#### **Return**

**Boolean** XXXXX





Params :
 :     
 :  


### query

### insert

### update

### delete



Available Endpoints
-------------------

### list

#### Config params

- resource : define the couchbase resource to use. Fill with a resource name as defined in the resource pool
- n1ql : N1QL request to execute when this endpoint is requested


### get

- resource : define the couchbase resource to use. Fill with a resource name as defined in the resource pool

### create

- resource : define the couchbase resource to use. Fill with a resource name as defined in the resource pool

### update

- resource : define the couchbase resource to use. Fill with a resource name as defined in the resource pool

### delete

- resource : define the couchbase resource to use. Fill with a resource name as defined in the resource pool


Sample config :

```json
...
"server": {
    "endpoints": [
        {
            "path": "/beer",
            "method": "ROUTER",
            "resource": "couchbase-sample",
            "endpoints": [
                {
                    "path": "/beer",
                    "method": "GET",
                    "resource_handler": "endpoints.list",
                    "n1ql": "SELECT * FROM `beer-sample` LIMIT 10"
                },
                {
                    "path": "/beer",
                    "method": "POST",
                    "resource_handler": "endpoints.create"
                },
                {
                    "path": "/beer/:id",
                    "method": "POST",
                    "resource_handler": "endpoints.create"
                },
                {
                    "path": "/beer/:id",
                    "method": "GET",
                    "resource_handler": "endpoints.get"
                },
                {
                    "path": "/beer/:id",
                    "method": "PUT",
                    "resource_handler": "endpoints.update"
                },
                {
                    "path": "/beer/:id",
                    "method": "DELETE",
                    "resource_handler": "endpoints.delete"
                }
            ]
        }
    ]
}
...
```