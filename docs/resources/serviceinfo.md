<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.1.7-docker/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : serviceinfo

This resource allow you to get information about the current running service.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose serviceinfo data.

This resource is based on [nodejs core](https://nodejs.org/en/docs/) 
[![node](https://img.shields.io/badge/node-v3.1.0-blue.svg)](https://nodejs.org/en/docs/) 
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

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **_class**      | yes       | string |         | module name. Must be **serviceinfo** for this resource

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "serviceinfo-id": {
        "_class": "serviceinfo"
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('serviceinfo-id')` where `serviceinfo-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with one single method.

[1. Read method](#method-read)


### Method read

Read application information and return a single object describing the application
details.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **callback**                 | no        | function | default | callback function called when application get result.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the application. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the application object (if no error)


#### Example

```javascript
var resource = $app.resources.get('serviceinfo-id');
resource.read(function (error, response) {
    console.log(error, response);
});
```

## Resource endpoints

This module come with one single read-only endpoint.

[1. Info endpoint](#info-endpoint)

### info endpoint

The purpose of this endpoint is to display informations about the application, 
the server as well as the list of all exposed endpoints for your API.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "info"

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/info",
            "resource": "serviceinfo-id",
            "endpoint": "info"
        }
    ]
}
```