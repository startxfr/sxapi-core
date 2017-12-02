# SXAPI Resource : serviceinfo

This resource allow you to get information about the current running service.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose serviceinfo data.

## Resource configuration

To configure this resource, you must add a config key under the ```resources```
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
the ```resources``` section of your [configuration profile](../guides/2.Configure.md)

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

| Param           | Mandatory | Type     | default | Description
|-----------------|:---------:|:--------:|---------|---------------
| **callback**    | yes       | function | default | callback function to get the returned informations. this function take 2 parameters:  <br>first is **error** (must be null, false or undefined if no error) <br>second is **response** object (if no error)<br>If not defined, dropped to a default function who output information to the debug console


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