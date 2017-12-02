# SXAPI Resource : serviceinfo

This resource allow you to get information about the current running service.
End user can receive relevant informations about the application, the server as
well as the endpoint list of exposed path for your API.

## Resource configuration

To configure this resource, you must add a config section under the ```resources```
section of your configuration profile. 

The key must be a unique string and will be considered as the resource id. The value 
must be an object who must have the following configuration parameters.

For a better understanting of the sxapi
configuration profile, please refer to the [confugration guide](../guides/2.Configure.md)

### Config parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **_class**      | yes       | string |         | endpoint name declared in this resource. Must be serviceinfo for this resource

### Example

This is a sample configuration of your resource. You must add this section under 
the ```resources``` section of your configuration profile

```javascript
"resources": {
    ...
    "serviceinfo-sample": {
        "_class": "serviceinfo"
    }
    ...
}
```

## Resource methods

If you wan to use this resource in our own module, you can retrieve a resource 
instance by using ```$app.resources.get('resource-id')``` where `resource-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

### Method read

Read application information and return a single object describing the application
details.

#### Parameters

| Param           | Mandatory | Type     | default | Description
|-----------------|:---------:|:--------:|---------|---------------
| callback        | yes       | function | default | callback function to get the returned informations. <br>this function take 2 parameters, first is error (must be null, false or undefined if no error) and second one is response object (if no error)<br>If not defined, dropped to a default function who output information to the console


#### Example

```javascript
var resource = $app.resources.get('resource-id');
resource.read(function (error, response) {
    console.log(error, response);
});
```

## Resource endpoints

This module come with one single read-only endpoint.

### info endpoint

The purpose of this endpoint is to display informations about the application, 
the server as well as the list of all exposed endpoints for your API.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [#resource-configuration](config profile)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "info"

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/info",
            "resource": "serviceinfo-sample",
            "endpoint": "info"
        }
    ]
}
```