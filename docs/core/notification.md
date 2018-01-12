<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/dev/docs/assets/notificationo.svg?sanitize=true">

# SXAPI Core : notification component

The notification component is a [core component](./README.md) used for notifying the application events.<br> 
This component comes with 2 storage backend ([sqs](#backend-using-sqs) or [couchbase](#backend-using-couchbase)) 
to persist notification context.

## Configuration

To enable this component in you API, you must add a `notification` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config-parameters).<br>
If `notification` property is not defined, or set to false (`"notification" : false`), no
notification context will be defined and your API will be muted and no notification will be persisted.

### Config parameters

| Param                  | Mandatory | Type   | default | Description
|------------------------|:---------:|:------:|---------|---------------
| **sqs**                | no        | object |         | a object for configuring a AWS SQS backend
| sqs.**resource**       | no        | string |         | the resource id of the sqs backend. See [aws_sqs resource documentation](../resources/aws_sqs.md)
| **couchbase**          | no        | object |         | a object for configuring a Couchbase backend
| couchbase.**resource** | no        | string |         | the resource id of the couchbase backend. See [couchbase resource documentation](../resources/couchbase.md)


### Config Sample

```javascript
"notification": {
    "sqs": {
        "resource": "resource-id"
    }
}
```
