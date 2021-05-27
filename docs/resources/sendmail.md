# SXAPI Resource : sendmail

This resource allow you to send email using a MTA.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to send mails.

This resource is based on [nodejs core](https://nodejs.org/en/docs/) 
[![node](https://img.shields.io/badge/node-v3.1.0-blue.svg)](https://nodejs.org/en/docs/) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
from [![sxapi](https://img.shields.io/badge/sxapi-v0.0.88-blue.svg)](https://github.com/startxfr/sxapi-core).

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


### Resource config parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **_class**      | yes       | string |         | module name. Must be **sendmail** for this resource
| **transport**   | yes       | object |         | object describing the transport method
| **message**     | no        | object |         | object with default messages options

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  sendmail-id:
    _class: sendmail
    transport:
      host: localhost
      port: 465
      secure: true
      auth:
        user: myUser
        pass: myPwd
    messages:
      from: my@email.org
      to: my@email.org
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('sendmail-id')` where `sendmail-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with one single method.

[1. sendMail method](#method-sendmail)


### Method sendMail

send mail using the MTA configured and return a description of the sended message.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **mailOptions**              | yes       | object   |         | object describing the message to send
| **callback**                 | no        | function | default | callback function called when application get result.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the application. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the application object (if no error)


#### Example

```javascript
var resource = $app.resources.get('sendmail-id');
resource.sendMail({
        "from": "my@email.org",
        "to": "my@email.org",
        "subject": "default subject",
        "text": "default message"
    }, function (error, response) {
    console.log(error, response);
});
```

## Resource endpoints

This module come with a single endpoint.

[1. sendMail endpoint](#info-sendmail)

### sendMail endpoint

The purpose of this endpoint is to send a mail when called.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "info"
| **other**       | no        |        |         | all other params will be used as message options before sending it to the server

#### Example

```yaml
server:
  endpoints:
  - path: "/info"
    resource: sendmail-id
    endpoint: sendMail
    to: my@email.org
    subject: default subject
    text: default message
```