<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/master/docs/assets/logo.svg?sanitize=true">

# SXAPI Resources Catalog

Resources are one core componement of SXAPI. They expose method you can use in your module, and they also expose entrypoint ready to use in your configuration profile for building your API.


## Resource manager

Resource manager is the core component used for resources management. He help module developer to acces resources. He's also in charge of initalizing, starting and stopping configured resources. as part of the sxapi core startup process.

```javascript
// Get the resource manager
var resourceManager = $app.resources;
// Test if a resource exist
if(resourceManager.exist('resource-id')) {
    // access to the resource
    var resource = resourceManager.get('resource-id');
}
```

## Availables resources

| Class            | SDK                | Documentation          | Description
|------------------|:------------------:|:----------------------:|------------------------
| **aws_s3**       | aws-sdk v2.6       | [read](aws_s3.md)      | Resource to interact with an AWS S3 backend.
| **aws_sqs**      | aws-sdk v2.6       | [read](aws_sqs.md)     | Resource to interact with an AWS SQS backend.
| **aws_dynamodb** | aws-sdk v2.6       | [read](aws_s3.md)      | Resource to interact with an AWS DynamoDB backend.
| **couchbase**    | couchbase v2.1.8   | [read](couchbase.md)   | Resource to interact with a couchbase cluster
| **google**       | googleapis v23.0.0 | [read](google.md)      | Resource to interact with Google API backend.
| **google_drive** | googleapis v23.0.0 | [read](google_drive.md)| Resource to interact with Google Drive API backend.
| **http**         | request v2.79.0    | [read](http.md)        | Resource to interact with an http server.
| **mysql**        | mysql v2.11.1      | [read](mysql.md)       | Resource to interact with a mysql server.
| **postgres**     | pg v7.4.0          | [read](postgres.md)    | Resource to interact with a postgres server.
| **memcache**     | memcache v0.3.4    | [read](memcache.md)    | Resource to interact with a memcache server.
| **redis**        | node_redis v2.6.3  | [read](redis.md)       | Resource to interact with a redis cluster.
| **serviceinfo**  | sxapi v0.0.65      | [read](serviceinfo.md) | Resource to interact with a application services.
| **insee**        | siren2tva v1.0     | [read](insee.md)       | Resource to interact with a French INSEE company code
| **localfs**      | (none)             | [read](localfs.md)     | Resource to interact with the application host (or container) local file-system
| **twitter**      | twitter API v1.7.1 | [read](twitter.md)     | Resource to interact with twitter API and tweet streams

## Using a resource

If you wan't to see sample sxapi.yml config for various resources, you can visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample/tree/master/samples)

### Declaring a resource in your sxapi.yml

Resources are referenced within the `resources` key in sxapi.yml. This object reference, with and *resource-id*, all resources available in you API. You have to read resource documentation to know required or available configuration parameters.

```yaml
resources:
  resource-id:
    _class: resource_name
    param: value
```
You can then use the *resource-id* in your [endpoints](#using-a-resource-endpoint) or with the [resource manager](#using-a-resource-method)

### Using a resource endpoint

If a resource come with endpoints, they are all available using the `endpoints` property of the resource instance. In your sxapi.yml, you can use them in your declared endpoints. You must use the configuration property `endpoint: "endpoints.method"` in your endpoint configuration object. This method will receive the full config endpoint object (with inherited property of parents if required). You can use as many times the same resource endpoint with various configuration options.

-   `resource` **string** REQUIRED *resource-id* of the resource to use
-   `endpoint` **string** REQUIRED resource method to use for handling response

```yaml
server:
  endpoints:
  - path: "/beer"
    method: POST
    resource: resource-id
    endpoint: endpoints.method
```

### Using a resource method

When you are creating your own module and need to use a resource, you can access it using the `$app.resources.get('resource-id')` method. This method will return the coresponding resource initialized and started when you module is executed.

```javascript
// Get the resource instance via resource manager
var resourceManager = ;
// Test if a resource exist
if($app.resources.exist('resource-id')) {
    // access to the resource
    var resource = $app.resources.get('resource-id');
    // Using a resource method
    resource.resource_method();
}
```
