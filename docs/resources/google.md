<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/master/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : google

This resource allow you to authenticate into Google API Services and use multiple
services depending on. 
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose google data.

Based on [googleapis npm module](https://www.npmjs.com/package/googleapis) 
[![npm](https://img.shields.io/npm/v/googleapis.svg)](https://www.npmjs.com/package/googleapis) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.0.9-blue.svg)](https://github.com/startxfr/sxapi-core).

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

please refer to [Google OAuth GApp Domain-wide tutorial](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#delegatingauthority) for more informations on how to fill this section with approriate data.

### Resource config parameters

| Param              | Mandatory | Type    | default   | Description
|--------------------|:---------:|:-------:|-----------|---------------
| **_class**         | yes       | string  |           | module name. Must be **google** for this resource
| **auth**           | yes       | object  |           | an object with special field describing the authentification mechanism used to connect to Google API.
| **auth.method**    | yes       | string  |           | authentification method to use.<br>Only `jwt` is implemented right now.
| **auth.jwt**       | no        | object  |           | When JWT method is used, this object must be filled with the jwt json content of your credentials file. Follow the [google OAuth 2.0 for Server to Server documentation](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount) for generating this credential set.
| **auth.scopes**    | yes       | string  |           | The scoped url of google services you wan to use.
| **services**       | yes       | object  |           | an object with key coresponding to google services (seen as sub-resources) special configuration
| **services.drive** | no        | string  |           | Object configurating google services for drive API


### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "google-id": {
        "_class": "google",
        "auth": {
            "method": "jwt",
            "jwt": { ... },
            "scopes": "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive"
        },
        "services": {
            "drive": {
            }
        }
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('google-id')` where `google-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with one single method.

[1. getService method](#method-getservice)


### Method getService

Search for a google service available form this configuration and return the sub-resource
coresponding if available.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **service**                  | yes       | string   | null    | The service name to find
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from service discovery. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the sub-resource coresponding to the requested service

#### Example

```javascript
var resource = $app.resources.get('google-id');
resource.getService('drive', function (error, response) {
    console.log(error, response);
});

var service  = resource.getService('drive');
```

## Resource endpoints

This module come with one single endpoint who can interact with any google server.

[1. getToken endpoint](#gettoken-endpoint)

### getToken endpoint

The purpose of this endpoint is to return the application credentials given by the 
remote google authetification server used for this session. 
Take care when exposing this endpoint !


#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "getToken"

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/token",
            "resource": "google-id",
            "endpoint": "getToken"
        }
    ]
}
```