# SXAPI Resource : couchbase
============================



## Resource configuration
-------------------------

### **Config parameters**

-   `class` **string** Must be resource-couchbase for this resource
-   `cluster` **string** URL of the couchbase cluster to use. You have to give the full URL, with protocol (http or https) and port number (must be 8091) . If you wan to reach a cluster on the same machine, please use docker host IP (like 172.17.x.x). Example : http://172.17.42.1:8091
-   `bucket` **string** Bucket to use for this resource. If you need to connect to several bucket, you'll have to create several resources
-   `insertOptions` **Object** options used when inserting a document to the bucket
    -   `persist_to` **[boolean]** If 1, wait for document to be persisted before returning result
    -   `replicate_to` **int** number of node to replicate data before geting a response from the cluster
-   `updateOptions` **Object** options used when updating a document to the bucket
    -   `persist_to` **[boolean]** If 1, wait for document to be persisted before returning result
    -   `replicate_to` **int** number of node to replicate data before geting a response from the cluster
-   `deleteOptions` **Object** options used when deleting a document to the bucket
    -   `persist_to` **[boolean]** If 1, wait for document to be persisted before returning result
    -   `replicate_to` **int** number of node to replicate data before geting a response from the cluster

### **Sample config**

```
"resources": {
    ...
    "couchbase-sample": {
        "_class": "resource-couchbase",
        "cluster": "http://172.17.42.1:8091",
        "bucket": "beer-sample",
        "insertOptions": {
            "persist_to": 1,
            "replicate_to": 1
        },
        "updateOptions": {
            "persist_to": 1,
            "replicate_to": 1
        },
        "deleteOptions": {
            "persist_to": 1,
            "replicate_to": 1
        }
    }
    ...
}
```


## Available Methods
--------------------

### get

Get a document for the bucket according to the given docId

#### **Parameters**

-   `docId` **String** The document ID to find
-   `callback` **Function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.

#### **Callback**

**Boolean** XXXXX

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

```
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