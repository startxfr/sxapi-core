<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/dev/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : web server manager

The web server manager is a [core component](./README.md) allow you to receive incoming
request from http or websocket protocol and perfom a response coresponding to the defined
endpoint.<br> 
This component is highly flexible and API builders can easily
[expose resource endpoints](../resources/README.md#using_a_resource_endpoint) 
and developpers [using resource methods](../resources/README.md#using_a_resource_method).

## Configuration

To enable this component in you API, you must add a `server` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config-parameters).<br>
If `server` property is not defined, or set to false (`"server" : false`), no
webserver will be started and your application will be isolated an couldn't receive any
connections.

### Config parameters

| Param                           | Mandatory | Type    | default | Description
|---------------------------------|:---------:|:-------:|---------|---------------
| **port**                        | no        | int     | 8080    | Webserver port
| **enableWebsockets**            | no        | bool    | false   | Enable socket.io connection
| **websockets**                  | no        | obj     |         | socket.io configuration
| websockets.**onConnection**     | no        | string  |         | Function to use when a new client connect (leave blank for autoLoading events)
| websockets.**events**           | no        | array   |         | List of events to listen to
| websockets.events[].**event**   | yes       | string  |         | The event name
| websockets.events[].**handler** | yes       | string  |         | Function to use when a event is received
| **static**                      | no        | array   |         | List of static path to expose
| static[].**path**               | yes       | string  |         | The URL path to use
| static[].**dir**                | yes       | string  |         | The local directory to use and expose
| **useCors**                     | no        | bool    | true    | Activate the Express Cors option. See [express cors project](https://github.com/expressjs/cors)
| **optCors**                     | no        | obj     | obj     | Options to use with the Express Cors. See [express cors configuration options](https://github.com/expressjs/cors#configuration-options)
| **bodyParserJson**              | no        | bool    | true    | Activate the Body parser Json option. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparserjsonoptions)
| **bodyParserJsonOptions**       | no        | obj     |         | Options to use with the Body parser Json. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparserjsonoptions)
| **bodyParserRaw**               | no        | bool    | true    | Activate the Body parser Raw option. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparserrawoptions)
| **bodyParserRawOptions**        | no        | obj     |         | Options to use with the Body parser Raw. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparserrawoptions)
| **bodyParserUrl**               | no        | bool    | true    | Activate the Body parser Urlencoded option. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparserurlencodedoptions)
| **bodyParserUrlOptions**        | no        | obj     |         | Options to use with the Body parser Urlencoded. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparserurlencodedoptions)
| **bodyParserText**              | no        | bool    | false   | Activate the Body parser Text option. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparsertextoptions)
| **bodyParserTextOptions**       | no        | obj     |         | Options to use with the Body parser Text. See [body-parser documentation](https://github.com/expressjs/body-parser#bodyparsertextoptions)
| **endpoints**                   | yes       | array   |         | an array of endpoints configuration
| endpoints[**config**]           | no        | obj     |         | endpoint configuration, see the next section for more information of the attended structure
 

### Config endpoint static
         
| Param                  | Mandatory | Type    | default | Description
|------------------------|:---------:|:-------:|---------|---------------
| **path**               | yes       | string  |         | the endpoint path
| **desc**               | no        | string  |         | A text description of the endpoint action
| **body**               | yes       | string  |         | the body response
| **code**               | no        | int     | 200     | The HTTP code to respond
| **header**             | no        | obj     |         | And Object describing the header response. Default answer a content-type: text/html


### Config endpoint resource
         
| Param                  | Mandatory | Type    | default | Description
|------------------------|:---------:|:-------:|---------|---------------
| **path**               | yes       | string  |         | the endpoint path
| **desc**               | no        | string  |         | A text description of the endpoint action
| **resource**           | yes       | string  |         | the resource ID to use. For more information see [resource documentation](./resource.md#config-parameters)
| **endpoint**           | yes       | string  |         | Endpoint name to use from the resource ID. Every resource come with various available endpoints. For more information see [how to use resource endpoints](../resources/README.md#using_a_resource_endpoint) 
| **endpoint_param**     | no        |         |         | all other params will be given to the resource endpoint and used for it configuration


### Config Sample

```yaml
server:
  port: '8080'
  endpoints:
  - path: "/ping"
    desc: Ping the application. Return a sample message in json
    code: '200'
    body: pong
  - path: "/info"
    desc: return API information from the server (using serviceinfo resource)
    resource: serviceinfo-sample
    endpoint: info
```