# SXAPI Resources Catalog

Resources are one core componement of SXAPI. They expose method you can use in your module, and they also expose entrypoint ready to use for building your API.

## Availables resources

- **aws_sqs** (SDK : aws-sdk v2.6 ) [read documentation](aws_sqs.md)
- **couchbase** (SDK : couchbase v2.1.8) [read documentation](couchbase.md)
- **http** (SDK : request v2.79.0 ) [read documentation](http.md)
- **mysql** (SDK : mysql v2.11.1 ) [read documentation](mysql.md)
- **redis** (SDK : node_redis v2.6.3 ) [read documentation](redis.md)
- **serviceinfo** [read documentation](serviceinfo.md)

## Using a resource

If you wan't to see sample sxapi.json config for various resources, you can visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample/tree/v0.0.27-npm/samples)

### Declaring a resource in your sxapi.json

Resources are referenced within the ```resources``` key in sxapi.json. This object reference, with and *resource-id*, all resources available in you API. You have to read resource documentation to know required or available configuration parameters.

```json
{
    "resources": {
        "resource-id": {
            "_class": "resource_name",
            "param": "value"
        }
    }
}
```
You can then use the *resource-id* in your [endpoints](#using-a-resource-endpoint) or with the [resource manager](#using-a-resource-method)

### Using a resource endpoint

If a resource come with endpoints, they are all available using the ```endpoints``` property of the resource instance. In your sxapi.json, you can use them in your declared endpoints. You must use the configuration property ```endpoint: "endpoints.method"``` in your endpoint configuration object. This method will receive the full config endpoint object (with inherited property of parents if required). You can use as many times the same resource endpoint with various configuration options.

-   `resource` **string** REQUIRED *resource-id* of the resource to use
-   `endpoint` **string** REQUIRED resource method to use for handling response

```json
"server": {
    "endpoints": [
        {
            "path": "/beer",
            "method": "POST",
            "resource": "resource-id",
            "endpoint": "endpoints.method"
        }
    ]
}
```

### Using a resource method

When you are creating your own module and need to use a resource, you can access it using the ```$app.resources.get('resource-id')``` method. This method will return the coresponding resource initialized and started when you module is executed.

```javascript
// Get the resource instance via resource manager
var resource = $app.resources.get('resource-id');
// Using a resource method
resource.resource_method();
```



## Resource manager

Resource manager is the core component used for resources management. He help module developer to acces resources. He's also in charge of initalizing, starting and stopping configured resources. as part of the sxapi core startup process.

```javascript
// Get the resource manager
var rm = $app.resources;
```

### init method

Initialize the resource component and load configured resources

#### **Parameters**

-   `config` **object** resources object list with key for *resource-id* and value for resource config

### add method

Load a resource into the resources pool

#### **Parameters**

-   `id` **string** *resource-id* used for referencing this resource
-   `config` **object** resource config including ```_class``` key with resource library

### get method

Get a resource from the resources pool

#### **Parameters**

-   `id` **string** *resource-id* of the requested resource

### exist method

Return true if a *resource-id* exist in the resources pool

#### **Parameters**

-   `id` **string** *resource-id* of the requested resource

### starts method

Start all available resources in series

#### **Parameters**

-   `callback` **function** callback called after all resources are started

### start method

Start one resource

#### **Parameters**

-   `id` **string** *resource-id* you wan't to start

### stops method

Stop all available resources in series

#### **Parameters**

-   `callback` **function** callback called after all resources are stopped

### stop method

Stop one resource

#### **Parameters**

-   `id` **string** *resource-id* you wan't to stop
