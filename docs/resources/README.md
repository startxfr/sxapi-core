# SXAPI Resources Catalog

Resources are one core componement of SXAPI. They expose method you can use in your module, and they also expose entrypoint ready to use for building your API.

## Availables resources

- **couchbase** (SDK : couchbase v2.1.8) [read documentation](couchbase.md)
- **mysql** (SDK : mysql v2.11.1 ) [read documentation](mysql.md)
- **sqs** (SDK : aws-sdk v2.6 ) [read documentation](sqs.md)

## Using a resource

If you wan't to have sample config for various resources, you can visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample/tree/dev/samples)

### Declaring a resource in your config file

Resources are referenced within the ```resources``` key in config file. This object reference, with and *resource-id*) all resources available in you API by their key.

```json
{
    "resources": {
        "resource-id": {
            "_class": "resource-class",
            "param": "value"
        }
    }
}
```
You can then use the *resource-id* in your [endpoints](#using-a-resource-endpoint) or with the [resource manager](#using-a-resource-method)

### Using a resource endpoint

If a resource come with endpoints, they are all available using the ```endpoints``` property of the resource instance. You can use them for building your API config. You have to use the configuration property ```resource_handler: "endpoints.method"```. This method will receive the config endpoint object (with inherited property of parents if required).

-   `resource` **string** REQUIRED *resource-id* of the resource to use
-   `resource_handler` **string** resource method to use for handling response

```json
"server": {
    "endpoints": [
        {
            "path": "/beer",
            "method": "POST",
            "resource": "resource-id",
            "resource_handler": "endpoints.method"
        }
    ]
}
```

### Using a resource method

When you are creating your own module and need to use a resource, you can access it using the ```require('/app/core/resource').get('*resource-id*')``` method. This method will return the coresponding resource initialized and started when you module is executed.

```javascript
var resource = require('/app/core/resource').get('*resource-id*');
resource.resource_method();
```



## The resource component

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
