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

### Method get

Get a document for the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId`**string** The document ID to find
-   `callback` **Function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **Boolean** True if and error occur. Response describe this error
    -   `response` **Object, Array** Content responded for the couchbase cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.get('my-doc-id', function (error, response) {
    console.log(error, response);
});
```

### Method query

Send a N1QL request to the query service of the couchbase cluster defined in the given resource. Use Query and Index node as well as Data Node according to your query. Take care of having theses services optimized for the kind of query you perform.

#### **Parameters**

-   `n1ql`**string** The N1QL request to send to the query node for the resource's cluster
-   `callback` **Function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **Boolean** True if and error occur. Response describe this error
    -   `response` **Object, Array** Content responded for the couchbase cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.query('SELECT * FROM `beer-sample` LIMIT 0, 5', function (error, response) {
    console.log(error, response);
});
```

### Method insert

Insert a document into the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId`**string** The document ID to create
-   `document`**string** The document body
-   `callback` **Function** Callback function used to handle the answer. If not provided, $cbdb.__insertDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **Boolean** True if and error occur. Response describe this error
    -   `response` **Object, Array** Content responded for the couchbase cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.insert('my-doc-id', {key:'value'}, function (error, response) {
    console.log(error, response);
});
```

### update

Update a document into the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId`**string** The document ID to create
-   `document`**string** The document body
-   `callback` **Function** Callback function used to handle the answer. If not provided, $cbdb.__updateDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **Boolean** True if and error occur. Response describe this error
    -   `response` **Object, Array** Content responded for the couchbase cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.update('my-doc-id', {key:'value'}, function (error, response) {
    console.log(error, response);
});
```

### delete

Remove a document into the bucket according to the given docId.  Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId`**string** The document ID to create
-   `callback` **Function** Callback function used to handle the answer. If not provided, $cbdb.__deleteDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **Boolean** True if and error occur. Response describe this error
    -   `response` **Object, Array** Content responded for the couchbase cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.delete('my-doc-id', function (error, response) {
    console.log(error, response);
});
```



## Available Endpoints

### list endpoint

#### **Config parameters**

-   `path`**string** Serveur path to bind this entrypoint to
-   `method`**string** http method to listen to
-   `resource`**string** define the couchbase resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler`**string** The resource handler to use. For this entrypoint, use ***"endpoints.list"***
-   `n1ql` **string** N1QL query to execute whent his entrypoint is called

#### **Sample code**

```json {
    "path": "/beer", "method": "GET",
    "resource": "couchbase-sample",
    "resource_handler": "endpoints.list",
    "n1ql": "SELECT * FROM `beer-sample` LIMIT 10"
}```

### get endpoint

#### **Config parameters**

-   `path`**string** Serveur path to bind this entrypoint to
-   `method`**string** http method to listen to
-   `resource`**string** define the couchbase resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler`**string** The resource handler to use. For this entrypoint, use ***"endpoints.get"***

#### **Sample code**

```json {
    "path": "/beer/:id", "method": "GET",
    "resource": "couchbase-sample",
    "resource_handler": "endpoints.get"
}```


### create endpoint

- resource : define the couchbase resource to use. Fill with a resource name as defined in the resource pool

### update endpoint

- resource : define the couchbase resource to use. Fill with a resource name as defined in the resource pool

### delete endpoint

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