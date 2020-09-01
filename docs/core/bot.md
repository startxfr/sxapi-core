<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/testing/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : bot component

The bot component is a [core component](./README.md) used for executing cron task or message driven action.<br> 
This component comes with 2 kind of tasks : cron for time based actions or reader for message driven actions.

This resource is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.3.53-blue.svg)](https://github.com/startxfr/sxapi-core).

## Configuration

To enable this component in you API, you must add a `bot` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config-parameters).<br>
If `bot` property is not defined, or set to false (`"bot" : false`), no
bot context will be defined.

### Config parameters

| Param                            | Mandatory | Type   | default | Description
|----------------------------------|:---------:|:------:|---------|---------------
| **lib**                          | yes       | string |         | a path to a lib file containing function library called by tasks or readers
| **cron**                         | no        | array  |         | a list of time based tasks
| cron.**id**                      | yes       | string |         | ID of the cron task
| cron.**schedule**                | yes       | string |         | Schedule timing for this cron task
| cron.**task**                    | yes       | string |         | Function (method in library) to call when task is executed
| cron.**name**                    | no        | string |         | Name of the cron task
| **readers**                      | no        | object |         | a object for configuring readers
| readers.**sqs**                  | yes       | array  |         | Supported message backend with sqs. See [aws_sqs resource documentation](../resources/aws_sqs.md)
| readers.sqs.**resource**         | yes       | string |         | Resource id of the sqs message bus
| readers.sqs.**filters**          | yes       | array  |         | A list of message filter and the coresponding action
| readers.sqs.filters.**id**       | yes       | string |         | ID of the sqs reader filter
| readers.sqs.filters.**event**    | yes       | string |         | The event type signature to search for
| readers.sqs.filters.**task**     | yes       | string |         | Function (method in library) to call when message match the event
| readers.sqs.filters.**eventKey** | no        | string | event   | name of the message property that hold the event type signature
| readers.**twitter**              | yes       | array  |         | Supported message backend from tweet streams. See [aws_sqs resource documentation](../resources/aws_sqs.md)
| readers.sqs.**resource**         | yes       | string |         | Resource id of the twitter account
| readers.sqs.**filters**          | yes       | array  |         | A list of tweet filter and the coresponding action
| readers.sqs.filters.**id**       | yes       | string |         | ID of the twitter reader filter
| readers.sqs.filters.**match**    | yes       | string |         | The tweet type signature to search for
| readers.sqs.filters.**task**     | yes       | string |         | Function (method in library) to call when tweet match the tweet type signature


### Config Sample

```yaml
bot:
  lib: "./mylib"
  cron:
  - id: test-task
    name: Execute test task
    schedule: "*/1 * * * *"
    task: cronTask
  readers:
    sqs:
    - resource: sqs-demo
      filters:
      - id: test-task
        event: api:objectname:create
        task: mySqsFunction
    twitter:
    - resource: twitter-demo
      filters:
      - id: test-task
        match: "#paris"
        task: myTwitterFunction
```
