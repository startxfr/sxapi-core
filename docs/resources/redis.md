# SXAPI Resource : redis

This resource allow you to interact with a redis Enterprise Server Cluster. Based on [Node_redis 2.6.3](https://github.com/NodeRedis/node_redis). This resource can be used using ```require('/app/core/resource').get('resource-id')``` in your own modules. You can then use one of the [availables methods](#available-methods). Redis resource also come with [various entrypoints](#available-endpoints) ready to use in your API.


## Resource configuration

This config object will be used by node_redis package when executing `redis.CreateClient()`. [Read node_redis documentation](https://github.com/NodeRedis/node_redis#options-object-properties) for a complete list of the parameters that you can use in this config objects.

### **Config parameters**

-   `class` **string** Must be redis for this resource
-   `url` **string** connection url to the cluster. format is `redis://[[user][:password@]]host[:port][/db-number]` [see node_redis documentation](https://github.com/NodeRedis/node_redis#options-object-properties)
-   `password` **string** Password used for this redis cluster
-   `...` any node_redis createClient configuration parameter

### **Sample sxapi.json**

```json
"resources": {
    ...
    "redis-sample": {
        "_class": "redis",
        "url": "redis://172.17.42.1:6379",
        "password": "123"
        "..." : "..."
    }
    ...
}
```

## Available Methods

### Method get

Get a document for the bucket according to the given docId.  Use KV capabilities of Redis and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to find
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the redis cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.get('my-doc-id', function (error, response) {
    console.log(error, response);
});
```

### Method query

Send a N1QL request to the query service of the redis cluster defined in the given resource. Use Query and Index node as well as Data Node according to your query. Take care of having theses services optimized for the kind of query you perform.

#### **Parameters**

-   `n1ql` **string** The N1QL request to send to the query node for the resource's cluster
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the redis cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.query('SELECT * FROM `beer-sample` LIMIT 0, 5', function (error, response) {
    console.log(error, response);
});
```

### Method insert

Insert a document into the bucket according to the given docId.  Use KV capabilities of Redis and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to create
-   `document` **string** The document body
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__insertDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the redis cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.insert('my-doc-id', {key:'value'}, function (error, response) {
    console.log(error, response);
});
```

### update

Update a document into the bucket according to the given docId.  Use KV capabilities of Redis and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to update
-   `document` **string** The document body
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__updateDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the redis cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.update('my-doc-id', {key:'value'}, function (error, response) {
    console.log(error, response);
});
```

### delete

Remove a document into the bucket according to the given docId.  Use KV capabilities of Redis and work extremely fast on well sized cluster.

#### **Parameters**

-   `docId` **string** The document ID to delete
-   `callback` **function** Callback function used to handle the answer. If not provided, $cbdb.__deleteDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the redis cluster

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
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
-   `resource` **string** define the redis resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler` **string** The resource handler to use. For this entrypoint, use ***endpoints.list***
-   `n1ql` **string** N1QL query to execute whent his entrypoint is called

#### **Sample code**

```json 
{
    "path": "/beer", "method": "GET",
    "resource": "redis-sample",
    "resource_handler": "endpoints.list",
    "n1ql": "SELECT * FROM `beer-sample` LIMIT 10"
}
```

### get endpoint

Return a document coresponding to the given docId

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the redis resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler` **string** The resource handler to use. For this entrypoint, use ***endpoints.get***

#### **Sample code**

```json 
{
    "path": "/beer/:id", "method": "GET",
    "resource": "redis-sample",
    "resource_handler": "endpoints.get"
}
```

### create endpoint

Insert a new document in the bucket. You could give and id or leave the system create one for you

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the redis resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler` **string** The resource handler to use. For this entrypoint, use ***endpoints.create***

#### **Sample code**

```json 
{
    "path": "/beer/:id", "method": "POST",
    "resource": "redis-sample",
    "resource_handler": "endpoints.create"
}
```
```json
{
    "path": "/beer", "method": "POST",
    "resource": "redis-sample",
    "resource_handler": "endpoints.create"
}
```

### update endpoint

Update the document coresponding to the given docId with the new document

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the redis resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler` **string** The resource handler to use. For this entrypoint, use ***endpoints.update***

#### **Sample code**

```json 
{
    "path": "/beer/:id", "method": "PUT",
    "resource": "redis-sample",
    "resource_handler": "endpoints.update"
}
```

### delete endpoint

Remove the document coresponding to the given docId with the new document

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the redis resource to use. Fill with a resource name as defined in the resource pool
-   `resource_handler` **string** The resource handler to use. For this entrypoint, use ***endpoints.delete***

#### **Sample code**

```json 
{
    "path": "/beer/:id", "method": "DELETE",
    "resource": "redis-sample",
    "resource_handler": "endpoints.delete"
}
```