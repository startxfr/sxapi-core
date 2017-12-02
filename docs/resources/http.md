# SXAPI Resource : http

This resource allow you to interact with a HTTP server.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose http data.

Based on request npm module [![npm](https://img.shields.io/npm/v/request.svg)](https://www.npmjs.com/package/request) 

## Resource configuration

To configure this resource, you must add a config key under the ```resources```
section of your configuration profile. 
This key must be a unique string and will be considered as the resource id. The value 
must be an object who must have the [appropriate configuration parameters](#resource-config-parameters).

For a better understanting of the sxapi
configuration profile, please refer to the [configuration guide](../guides/2.Configure.md)


### Resource config parameters

| Param           | Mandatory | Type   | default   | Description
|-----------------|:---------:|:------:|-----------|---------------
| **_class**      | yes       | string |           | module name. Must be **http** for this resource
| **url**         | no        | string | null      | default hostname or IP of the http server to use. If you use docker instance, don't forget to use the docker0 ip ```# ifconfig docker0``` and not localhost or 127.0.0.1
| **method**      | no        | string | GET       | default http method used [see request default](https://www.npmjs.com/package/request#requestoptions-callback).
| **headers**     | no        | object | null      | any request option. See [full list](https://www.npmjs.com/package/request#requestoptions-callback).

### Example

This is a sample configuration of this resource. You must add this section under 
the ```resources``` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "http-id": {
        "_class": "http",
        "url": "https://adobe.github.io/Spry/data/json/array-02.js",
        "headers": {
          "User-Agent": "request"
        }
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('http-id')` where `http-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with one single method.

[1. Call method](#method-call)


### Method call

Call http server and return a single object describing the http response content

#### Parameters

| Param           | Mandatory | Type     | default | Description
|-----------------|:---------:|:--------:|---------|---------------
| **url**         | yes       | string   | null    | url to get information from. could be a relative url if you've defined a `baseUrl` parameter in your [Resource configuration](#resource-configuration).  See [npm request options](https://www.npmjs.com/package/request#requestoptions-callback) for more details.
| **options**     | no        | object   |         | any request options. See [full list](https://www.npmjs.com/package/request#requestoptions-callback).
| **callback**    | no        | function | default | callback function to get the returned informations. this function take 2 parameters:  <br>first is **error** (must be null, false or undefined if no error) <br>second is **response** object (if no error)<br>If not defined, dropped to a default function who output information to the debug console


#### Example

```javascript
var resource = $app.resources.get('http-id');
resource.call('http://example.com/json',{timeout: 1500}, function (error, response) {
    console.log(error, response);
});
```

## Resource endpoints

This module come with one single endpoint with can interact with any http method.

[1. Call endpoint](#call-endpoint)

### call endpoint

The purpose of this endpoint is to make http call to another server and to return 
the server response. it can be seen like an http proxy.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "call"
| **url**         | no        | string | null    | default is the url defined in `resource.url` see [config profile](#resource-configuration)
| **method**      | no        | string | GET     | http method used. default is the method defined in `resource.method` see [config profile](#resource-configuration)
| **headers**     | no        | object | null    | any request option. See [full list](https://www.npmjs.com/package/request#requestoptions-callback).

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/info",
            "resource": "http-id",
            "endpoint": "info",
            "url": "https://adobe.github.io/Spry/data/json/object-01.js",
            "method": "GET",
            "headers": {
                "User-Agent": "request"
            }
        }
    ]
}
```