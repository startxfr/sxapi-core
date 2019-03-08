<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/dev/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : websocket-client

This resource allow you to interact with a HTTP server.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose websocket-client data.

Based on [request npm module](https://www.npmjs.com/package/request) 
[![npm](https://img.shields.io/npm/v/request.svg)](https://www.npmjs.com/package/request) 
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


### Resource config parameters

| Param           | Mandatory | Type   | default   | Description
|-----------------|:---------:|:------:|-----------|---------------
| **_class**      | yes       | string |           | module name. Must be **websocket-client** for this resource
| **host**        | yes       | string |           | default hostname or IP of the websocket server to use. If you use docker instance, don't forget to use the docker0 ip `# ifconfig docker0` and not localhost or 127.0.0.1
| **onStart**     | no        | string |           | function name to execute just after starting a websocket connection

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  websocket-client-id:
    _class: websocket-client
    host: http://localhost:8080
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('websocket-client-id')` where `websocket-client-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with two methods.

[1. On method](#method-on)
[2. Emit method](#method-emit)


### Method On

Associate a callback to a listening websocket event comming from the socket server.

#### Parameters

| Param                             | Mandatory | Type     | default | Description
|-----------------------------------|:---------:|:--------:|---------|---------------
| **event**                         | yes       | string   | null    | event name to listen to
| **callback**                      | no        | function | default | callback function called when event is received.

#### Example

```javascript
var resource = $app.resources.get('websocket-client-id');
resource.on('eventName', function (client, data) {
    console.log(client, data);
});
```
### Method Emit

Emit an event into a websocket connection

#### Parameters

| Param                             | Mandatory | Type     | default | Description
|-----------------------------------|:---------:|:--------:|---------|---------------
| **event**                         | yes       | string   | null    | event name to listen to
| **data**                          | no        | obj      |         | Data object to send to the destination

#### Example

```javascript
var resource = $app.resources.get('websocket-client-id');
resource.emit('eventName', {prop: "test"});
```

## Resource endpoints

This module come with one single endpoint who can interact with any websocket-client server.

[1. emit endpoint](#emit-endpoint)

### emit endpoint

The purpose of this endpoint is to emit websocket to another server and to return 
the server response.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **event**       | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)

#### Example

```yaml
server:
  endpoints:
  - path: "/emitter"
    resource: websocket-client-id
    endpoint: emit
    event: myEvent
```