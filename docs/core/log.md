<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.0.76-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : log component

The log component is a [core component](./README.md) used for logging the application events.<br> 
This component comes with 2 storage backend ([sqs](#backend-using-sqs) or [couchbase](#backend-using-couchbase)) 
to persist log context.

## Configuration

To enable this component in you API, you must add a `log` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config-parameters).<br>
If `log` property is not defined, or set to false (`"log" : false`), no
log context will be defined and your API will be muted and no log will be persisted.

### Config parameters

| Param                  | Mandatory | Type   | default | Description
|------------------------|:---------:|:------:|---------|---------------
| **filters**            | no        | object |         | a object for filtering logs to display or persist
| filters.**level**      | no        | string |         | a list (comma separated) of log level to keep (ex: 0,1,2,3)
| filters.**type**       | no        | string |         | a list (comma separated) of log type to keep (ex: debug,info,error,warn)
| **sqs**                | no        | object |         | a object for configuring a AWS SQS backend
| sqs.**resource**       | no        | string |         | the resource id of the sqs backend. See [aws_sqs resource documentation](../resources/aws_sqs.md)
| **couchbase**          | no        | object |         | a object for configuring a Couchbase backend
| couchbase.**resource** | no        | string |         | the resource id of the couchbase backend. See [couchbase resource documentation](../resources/couchbase.md)


### Config Sample

```javascript
"log": {
    "filters": {
        "level": "0,1,2",
        "type": "debug,info,error,warn"
    },
    "sqs": {
        "resource": "resource-id"
    }
}
```
