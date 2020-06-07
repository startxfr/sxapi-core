<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.3.47-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : resource manager

The resource manager is a [core component](./README.md) allow you to connect your API with
multiple backend. API builders can connect and expose data from theses backend, and 
developers can use then with ease to keep concentrated on business developement rather than 
technicals issues.<br> 
You can get a full list of [availables resources](../resources/README.md#availables_resources) 
and learn more about how to [use a resource](../resources/README.md#using_a_resource) 
by reading the  [resource documentation](../resources/README.md).<br> 
API builders can discover how to [expose resource endpoints](../resources/README.md#using_a_resource_endpoint) 
and node developpers can learn how to [use resource methods](../resources/README.md#using_a_resource_method) 

## Configuration

To enable this component in you API, you must add a `resources` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config-parameters).<br>
If `resources` property is not defined, or set to false (`"resources" : false`), no
resource context will be defined and your API could not use resource to store and 
persist data.

### Config parameters

| Param                  | Mandatory | Type    | default | Description
|------------------------|:---------:|:-------:|---------|---------------
| **resource-id**        | yes       | obj     |         | the resource key ID. [more informations](../resources/README.md#using_a_resource) 
| resource-id.**_class** | yes       | string  |         | the resource class name. Should be one of the [availables resources](../resources/README.md#availables_resources) 


### Config Sample

```yaml
resources:
  resource-id:
    _class: resource_name
    param: value
```

## Methods

### init method

Initialize the resource component and load configured resources

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **config**    | yes       | obj     |         | resources object list with key for *resource-id* and value for resource config

### add method

Load a resource into the resources pool

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **id**        | yes       | string  |         | *resource-id* used for referencing this resource
| **config**    | yes       | obj     |         | resource config including `_class` key with resource library

### get method

Get a resource from the resources pool

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **id**        | yes       | string  |         | *resource-id* of the requested resource

### exist method

Return true if a *resource-id* exist in the resources pool

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **id**        | yes       | string  |         | *resource-id* of the requested resource

### starts method

Start all available resources in series

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **callback**  | no        | fct     |         | callback called after all resources are started

### start method

Start one resource

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **id**        | yes       | string  |         | *resource-id* you wan't to start

### stops method

Stop all available resources in series

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **callback**  | no        | fct     |         | callback called after all resources are stopped

### stop method

Stop one resource

#### Parameters

| Param         | Mandatory | Type    | default | Description
|---------------|:---------:|:-------:|---------|---------------
| **id**        | yes       | string  |         | *resource-id* you wan't to stop
