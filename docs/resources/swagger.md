# SXAPI Resource : swagger

This resource allow you to get a swagger manifest describing the current running service.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose swagger data.

This resource is based on [nodejs core](https://nodejs.org/en/docs/) 
[![node](https://img.shields.io/badge/node-v3.1.0-blue.svg)](https://nodejs.org/en/docs/) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
from [![sxapi](https://img.shields.io/badge/sxapi-v0.0.8-blue.svg)](https://github.com/startxfr/sxapi-core).

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

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **_class**      | yes       | string |         | module name. Must be **swagger** for this resource

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  swagger-id:
    _class: swagger
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('swagger-id')` where `swagger-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with one single method.

[1. getManifest method](#method-getmanifest)


### Method getManifest

Generate a swagger manifest based on application information and return a single 
object describing the application details.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **callback**                 | no        | function | default | callback function called when application get result.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the application. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the application object (if no error)


#### Example

```javascript
var resource = $app.resources.get('swagger-id');
resource.getManifest(function (error, response) {
    console.log(error, response);
});
```

## Resource endpoints

This module come with one single endpoint.

[1. Manifest endpoint](#manifest-endpoint)

### manifest endpoint

The purpose of this endpoint is to display manifestrmations about the application, 
the server as well as the list of all exposed endpoints for your API.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "manifest"

#### Example

```yaml
server:
  endpoints:
  - path: "/manifest"
    resource: swagger-id
    endpoint: manifest
```
