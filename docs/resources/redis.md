<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.3.56-docker/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : redis

This resource allow you to interact with a Redis server or cluster.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose redis data.

This resource is based on [redis npm module](https://www.npmjs.com/package/redis) 
[![npm](https://img.shields.io/npm/v/redis.svg)](https://www.npmjs.com/package/redis) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.0.8-blue.svg)](https://github.com/startxfr/sxapi-core).

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

This config object will be passed to `redis.CreateClient()` method of the nodejs redis module. 
[Read node_redis documentation](https://github.com/NodeRedis/node_redis#options-object-properties) 
for a complete list of the parameters that you can use in this config object.

### Resource config parameters

| Param           | Mandatory | Type   | default   | Description
|-----------------|:---------:|:------:|-----------|---------------
| **_class**      | yes       | string |           | module name. Must be **redis** for this resource
| **url**         | no        | string | null      | connection url to the cluster. format is `redis://[[user][:password@]]host[:port][/db-number]` [see node_redis documentation](https://github.com/NodeRedis/node_redis#options-object-properties). If you want to reach a redis server on the same machine, using docker, don't forget to use the docker0 interface IP (like 172.17.x.x) using `# ifconfig docker0` and not localhost or 127.0.0.1. Example : 172.17.42.1
| **...**         | no        | N/A    |           | any request option. See [see node_redis documentation](https://github.com/NodeRedis/node_redis#options-object-properties).

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  redis-id:
    _class: redis
    url: redis://dev:dev@172.17.42.1/bucket
    return_buffers: false
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('redis-id')` where `redis-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with several methods for manipulating redis dataset.

[1. Read method](#method-read)<br>
[2. Insert method](#method-insert)<br>
[3. Update method](#method-update)<br>
[4. Delete method](#method-delete)


### Method read

read a redis value by it's given key.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **key**                      | yes       | string   | null    | key to find
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the redis server. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the value coresponding to this key


#### Example

```javascript
var resource = $app.resources.get('redis-id');
resource.read('myKey', function (error, response) {
    console.log(error, response);
});
```

### Method insert

insert a redis value associated to the given key.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **key**                      | yes       | string   | null    | key to use
| **value**                    | yes       | string   | null    | value associated to this key
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the redis server. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the value coresponding to this new key


#### Example

```javascript
var resource = $app.resources.get('redis-id');
resource.insert('myKey', 'my value', function (error, response) {
    console.log(error, response);
});
```

### Method update

update a redis value associated to the given key.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **key**                      | yes       | string   | null    | key to use
| **value**                    | yes       | string   | null    | the new value associated to this key
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the redis server. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the value coresponding to this key


#### Example

```javascript
var resource = $app.resources.get('redis-id');
resource.update('myKey', 'my new value', function (error, response) {
    console.log(error, response);
});
```

### Method delete

delete a redis key and it associated value.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **key**                      | yes       | string   | null    | key to delete
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the redis server. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the value coresponding to this key


#### Example

```javascript
var resource = $app.resources.get('redis-id');
resource.delete('myKey', function (error, response) {
    console.log(error, response);
});
```

## Resource endpoints

This module come with 4 endpoints who can interact with any redis method.

[1. Read endpoint](#read-endpoint)<br>
[2. Create endpoint](#create-endpoint)<br>
[3. Update endpoint](#update-endpoint)<br>
[4. Delete endpoint](#delete-endpoint)

### Read endpoint

The purpose of this endpoint is to make call to a redis server and to return 
the value associated to the given key.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "read"

#### Example

```yaml
server:
  endpoints:
  - path: "/redis"
    resource: redis-id
    endpoint: read
```

### Create endpoint

The purpose of this endpoint is to insert a key into a redis server. Key Id is defined
by the context, and document will be the HTTP body of the query.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"

#### Example

```yaml
server:
  endpoints:
  - path: "/redis/:id"
    method: POST
    resource: redis-id
    endpoint: create
```


### Update endpoint

The purpose of this endpoint is to update a key into a redis server. Key Id is defined
by the context, and document will be the HTTP body of the query.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "update"

#### Example

```yaml
server:
  endpoints:
  - path: "/redis/:id"
    method: PUT
    resource: redis-id
    endpoint: update
```

### Delete endpoint

The purpose of this endpoint is to delete a key into a redis server. 
Key Id is defined by the context.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"

#### Example

```yaml
server:
  endpoints:
  - path: "/redis/:id"
    method: DELETE
    resource: redis-id
    endpoint: delete
```
