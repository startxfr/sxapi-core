<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.1.7-npm/docs/assets/logo.svg?sanitize=true">

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

This config object will be used with `couchbase.Cluster()` method of the nodejs couchbase module. 
[Read couchbase sdk documentation](https://developer.couchbase.com/documentation/server/current/sdk/nodejs/start-using-sdk.html) 
for more information.

### Resource config parameters

| Param                           | Mandatory | Type   | default   | Description
|---------------------------------|:---------:|:------:|-----------|---------------
| **_class**                      | yes       | string |           | module name. Must be **couchbase** for this resource
| **cluster**                     | yes       | string |           | connection tring to the cluster. format is `couchbase://host[/bucket]` You have to give the full URL, with protocol (http or https) and port number (must be 8091) . If you want to reach a cluster on the same machine using docker, don't forget to use the docker0 interface IP (like 172.17.x.x) using `# ifconfig docker0` and not localhost or 127.0.0.1. Example : http://172.17.42.1:8091. [read more on couchbase connection](https://developer.couchbase.com/documentation/server/4.1/developer-guide/connection-advanced.html)
| **bucket**                      | yes       | string |           | the bucket name to use. If you need to connect to several bucket, you'll have to create several resources
| **user**                        | no        | string |           | Username to use for authentication (in conjuction with `password`)
| **password**                    | no        | string |           | Password for the previously defined `username`
| **insertOptions**               | no        | object |           | options used when inserting a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#insert) for more informations
| insertOptions.**persist_to**    | no        | int    |           | Ensures this operation is persisted to this many nodes. Default is set to 0.
| insertOptions.**replicate_to**  | no        | int    |           | Ensures this operation is replicated to this many nodes. Default is set to 0.
| insertOptions.**expiry**        | no        | int    |           | Set the initial expiration time for the document. A value of 0 represents never expiring. Default is set to 0.
| **updateOptions**               | no        | object |           | options used when updating a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#replace) for more informations
| updateOptions.**persist_to**    | no        | int    |           | Ensures this operation is persisted to this many nodes. Default is set to 0.
| updateOptions.**replicate_to**  | no        | int    |           | Ensures this operation is replicated to this many nodes. Default is set to 0.
| updateOptions.**expiry**        | no        | int    |           | Set the initial expiration time for the document. A value of 0 represents never expiring. Default is set to 0.
| **deleteOptions**               | no        | object |           | options used when deleting a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#remove) for more informations
| deleteOptions.**persist_to**    | no        | int    |           | Ensures this operation is persisted to this many nodes. Default is set to 0.
| deleteOptions.**replicate_to**  | no        | int    |           | Ensures this operation is replicated to this many nodes. Default is set to 0.
| deleteOptions.**expiry**        | no        | int    |           | Set the initial expiration time for the document. A value of 0 represents never expiring. Default is set to 0.

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "couchbase-id": {
        "_class" : "couchbase",
        "cluster": "http://172.17.42.1:8091",
        "bucket" : "bucket",
        "insertOptions": {
            "expiry" : 3600
        }
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('couchbase-id')` where `couchbase-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with 6 methods for manipulating couchbase dataset.

[1. Read method](#method-read)<br>
[2. Query method](#method-query)<br>
[3. Queryfree method](#method-queryfree)<br>
[4. Insert method](#method-insert)<br>
[5. Update method](#method-update)<br>
[6. Delete method](#method-delete)


### Method read

read a couchbase value by it's given document ID.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **docID**                    | yes       | string   | null    | document ID to find
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the couchbase SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.read('docID', function (error, response) {
    console.log(error, response);
});
```

### Method query

Send a N1QL request to the query service of the couchbase cluster defined in the given resource. 
Use Query and Index node as well as Data Node according to your query. 
Take care of having theses services optimized for the kind of query you perform.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **n1ql**                     | yes       | string   | null    | A N1QL query for selecting dataset
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the couchbase SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.query('SELECT name FROM `beer-sample` WHERE  brewery_id ="mishawaka_brewing";', function (error, response) {
    console.log(error, response);
});
```

### Method queryFree

Send a view request to the query service of the couchbase cluster defined in the given resource. 
Use only map-reduce function into Data node and work perfectly for targeted data manipulation.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **query**                    | yes       | object   |         | options used when inserting a document to the bucket. See [Couchbase Docs](http://docs.couchbase.com/sdk-api/couchbase-node-client-2.1.0/Bucket.html#insert) for more informations
| query.**ddoc**               | yes       | string   |         | Design Document. View group in couchbase terminology.
| query.**name**               | yes       | string   |         | View name to query
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the couchbase SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)

#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.queryFree({ddoc: "beers", name : "brewery_beers"}, function (error, response) {
    console.log(error, response);
});
```

### Method insert

insert a couchbase document associated to the given ID.
Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **docID**                    | yes       | string   | null    | document ID to use
| **document**                 | yes       | string   | null    | document associated to this ID
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the couchbase SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)

#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.insert('docID', 'my document', function (error, response) {
    console.log(error, response);
});
```

### Method update

update a couchbase value associated to the given document ID.
Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **docID**                    | yes       | string   | null    | document ID to update
| **document**                 | yes       | string   | null    | the new document associated to this ID
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the couchbase SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.update('docID', 'my new document', function (error, response) {
    console.log(error, response);
});
```

### Method delete

delete a couchbase document ID and it associated value.
Use KV capabilities of Couchbase and work extremely fast on well sized cluster.

#### Parameters

| Param               | Mandatory | Type     | default | Description
|---------------------|:---------:|:--------:|---------|---------------
| **docID**           | yes       | string   | null    | document ID to delete
| **callback**        | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**) | N/A       | mixed    | null    | will be false or null if no error returned from the couchbase SDK. Will be an error object if an error occur.


#### Example

```javascript
var resource = $app.resources.get('couchbase-id');
resource.delete('docID', function (error) {
    console.log(error);
});
```

## Resource endpoints

This module come with 5 endpoints who can interact with any couchbase method.

[1. List endpoint](#list-endpoint)<br>
[2. Read endpoint](#read-endpoint)<br>
[3. Create endpoint](#create-endpoint)<br>
[4. Update endpoint](#update-endpoint)<br>
[5. Delete endpoint](#delete-endpoint)


### List endpoint

The purpose of this endpoint is to make call to a couchbase server and to return 
the value associated to the given document ID.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "list"
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

### Read endpoint

The purpose of this endpoint is to make call to a couchbase server and to return 
the value associated to the given document ID. Use KV capabilities of Couchbase 
and work extremely fast on well sized cluster.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "read"
| **keyParam**    | no        | string | id      | param name containing the key received from the client
| **docPrefix**   | no        | string |         | a document prefix to use in conjuction with the received key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase/:id",
            "resource": "couchbase-id",
            "endpoint": "read"
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
| **keyParam**    | no        | string | id      | param name containing the key received from the client
| **docPrefix**   | no        | string |         | a document prefix to use in conjuction with the received key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase/:id",
            "method": "POST",
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
| **keyParam**    | no        | string | id      | param name containing the key received from the client
| **docPrefix**   | no        | string |         | a document prefix to use in conjuction with the received key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase/:id",
            "method": "PUT",
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
| **keyParam**    | no        | string | id      | param name containing the key received from the client
| **docPrefix**   | no        | string |         | a document prefix to use in conjuction with the received key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/couchbase/:id",
            "method": "DELETE",
            "resource": "couchbase-id",
            "endpoint": "delete"
        }
    ]
}
```

