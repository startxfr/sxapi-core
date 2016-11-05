# SXAPI Resources Catalog

Resources are one core componement of SXAPI. They expose method you can use in your module, and they also expose entrypoint ready to use for building your API.

## Availables resources

| Name         | Package dep            | 
+--------------+------------------------+----------------------------------
|couchbase     | couchbase v2.1.8       | [documentation](couchbase.md)
|mysql         | mysql v2.11.1          | [documentation](mysql.md)
|sqs           | aws-sdk v2.6           | [documentation](sqs.md)

## Using a resource

### Declaring a resource in your config file

Resources are referenced within the ```resources``` key in config file. This object reference all resources available in you API by their key.

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


### Using a resource endpoint


### Using a resource method

When you are creating your own module and need to use a resource, you can access it using the ```require('/app/core/resource').get()``` method. 

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.get('my-doc-id', function (error, response) {
    console.log(error, response);
});
```



## The resource component

### init method

Initialize the resource component and load configured resources

#### **Parameters**

-   `config` **object** resources object list with key for resourceId and value for resource config

### add method

Load a resource into the resources pool

#### **Parameters**

-   `id` **string** resourceId used for referencing this resource
-   `config` **object** resource config including ```_class``` key with resource library

### get method

Get a resource from the resources pool

#### **Parameters**

-   `id` **string** resourceId of the requested resource

### exist method

Return true if a resourceId exist in the resources pool

#### **Parameters**

-   `id` **string** resourceId of the requested resource

### starts method

Start all available resources in series

#### **Parameters**

-   `callback` **function** callback called after all resources are started

### start method

Start one resource

#### **Parameters**

-   `id` **string** resourceId you wan't to start

### stops method

Stop all available resources in series

#### **Parameters**

-   `callback` **function** callback called after all resources are stopped

### stop method

Stop one resource

#### **Parameters**

-   `id` **string** resourceId you wan't to stop
