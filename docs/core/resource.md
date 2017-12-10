<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.0.58-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : resource component

!!! TO DO see [session](session.md) for example

## Configuration

xxxx

### Config parameters

| Param           | Mandatory | Type | default | Description
|-----------------|:---------:|:----:|---------|---------------


### Config Sample

```javascript

```





### init method

Initialize the resource component and load configured resources

#### **Parameters**

-   `config` **object** resources object list with key for *resource-id* and value for resource config

### add method

Load a resource into the resources pool

#### **Parameters**

-   `id` **string** *resource-id* used for referencing this resource
-   `config` **object** resource config including `_class` key with resource library

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
