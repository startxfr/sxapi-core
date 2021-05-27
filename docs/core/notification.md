<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/testing/docs/assets/notificationo.svg?sanitize=true">

# SXAPI Core : notification component

The notification component is a [core component](./index.md) used for notifying the application events.<br> 
This component comes with 2 storage backend ([sqs](#backend-using-sqs) or [couchbase](#backend-using-couchbase)) 
to persist notification context.

## Configuration

To enable this component in you API, you must add a `notification` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config-parameters).<br>
If `notification` property is not defined, or set to false (`"notification" : false`), no
notification context will be defined and your API will be muted and no notification will be persisted.

### Config parameters

| Param                    | Mandatory | Type   | default | Description
|--------------------------|:---------:|:------:|---------|---------------
| **pipeline-id**          | yes       | object |         | a string key with the notification pipeline ID
| pipeline-id.**type**     | yes       | string |         | the type of notification backend. could be sqs or couchbase
| pipeline-id.**resource** | yes       | string |         | the resource identifier for this pipeline


### Config Sample

```yaml
notification:
  pipeline-id:
    type: sqs
    resource: sqs-api
```


### Endpoints parameters

| Param                     | Mandatory | Type   | default | Description
|---------------------------|:---------:|:------:|---------|---------------
| **notification**          | yes       | object |         | an object with at least the 2 following properties
| notification.**pipeline** | yes       | string |         | the notification pipeline ID
| notification.**event**    | yes       | string |         | the event name signature


### Config Sample

```yaml
notification:
  pipeline: pipeline-id
  event: event:action
```
