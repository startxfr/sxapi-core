<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/dev/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : localfs

This resource allow you to interact with the application host (or container) local file-system.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose local file-system.

This resource is based on [localfs npm module](https://www.npmjs.com/package/localfs) 
[![localfs](https://img.shields.io/npm/v/localfs.svg)](https://www.npmjs.com/package/localfs) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.1.99-blue.svg)](https://github.com/startxfr/sxapi-core).

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

| Param                  | Mandatory | Type   | default         | Description
|------------------------|:---------:|:------:|-----------------|---------------
| **_class**             | yes       | string |                 | Module name. Must be **localfs** for this resource
| **directory**          | no        | string |                 | The default directory to use as default path for requested files. If not provided, app path will be used

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  localfs-id:
    _class: localfs
    directory: "/tmp"
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('localfs-id')` where `localfs-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with 6 methods for manipulating localfs dataset.

[1. Query method](#method-query)<br>
[2. Read method](#method-read)<br>
[3. Insert method](#method-insert)<br>
[4. Update method](#method-update)<br>
[5. Delete method](#method-delete)

### Method query

Send a Search request to the localfs server defined in the given resource. 

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **sql**                      | yes       | string   | null    | A Search query for selecting file list
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | bool     |         | will be false or null if no error returned from the localfs SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the result of the query (if no error)


#### Example

```javascript
var resource = $app.resources.get('localfs-id');
resource.query('*.txt', function (error, response) {
    console.log(error, response);
});
```

### Method read

Read a content file coresponding to the filename

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **filename**                 | yes       | string   | null    | Name of the file
| **callback**                 | no        | function | default | Callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the localfs SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)


#### Example

```javascript
var resource = $app.resources.get('localfs-id');
resource.get('subdir/file.txt', function (error, response) {
    console.log(error, response);
});
```

### Method insert

Create a new file in the filesystem

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **filename**                 | yes       | string   | null    | Name of the file
| **content**                  | yes       | string   | null    | The file content associated to the filename
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the localfs SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)

#### Example

```javascript
var resource = $app.resources.get('localfs-id');
resource.insert('subdir/newfile.txt', "my content", function (error, response) {
    console.log(error, response);
});
```

### Method update

update one file content

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **filename**                 | yes       | string   | null    | Name of the file to update
| **content**                  | yes       | string   | null    | The new file content to update
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the localfs SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)


#### Example

```javascript
var resource = $app.resources.get('localfs-id');
resource.update('subdir/newfile.txt', "my updated content", function (error, response) {
    console.log(error, response);
});
```

### Method delete

Delete a file in the file-system

#### Parameters

| Param               | Mandatory | Type     | default | Description
|---------------------|:---------:|:--------:|---------|---------------
| **filename**        | yes       | string   | null    | Name of the file to delete
| **callback**        | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**) | N/A       | mixed    | null    | will be false or null if no error returned from the localfs SDK. Will be an error object if an error occur.


#### Example

```javascript
var resource = $app.resources.get('localfs-id');
resource.delete('subdir/newfile.txt', function (error) {
    console.log(error);
});
```

## Resource endpoints

This module come with 5 endpoints who can interact with any localfs method.

[1. List endpoint](#list-endpoint)<br>
[2. Read endpoint](#read-endpoint)<br>
[3. Create endpoint](#create-endpoint)<br>
[4. Update endpoint](#update-endpoint)<br>
[5. Delete endpoint](#delete-endpoint)


### List endpoint

The purpose of this endpoint is to make call to the local file-system and to return 
the value associated to the given filename.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "list"
| **directory**   | no        | string |         | the directory to list 

#### Example

```yaml
server:
  endpoints:
  - path: "/localfs"
    resource: localfs-id
    endpoint: list
    directory: test/
```

With the previous configuration sample, if you make the following http request `GET /localfs`
you will get the list of file found into the `test/` directory located into the default resource directory (default is `/tmp`)


### Read endpoint

The purpose of this endpoint is to make call to the local file-system and to return 
the content of a filename

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "read"
| **directory**   | no        | string |         | the directory where file is located

#### Example

```yaml
server:
  endpoints:
  - path: "/localfs/:id"
    resource: localfs-id
    endpoint: read
    directory: test/
```

### Create endpoint

The purpose of this endpoint is to create a new file into the local file-system.
Filename is defined by the context, and content will be the HTTP body of the
request.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"
| **directory**   | no        | string |         | the directory where file is located

#### Example

```yaml
server:
  endpoints:
  - path: "/localfs/:id"
    method: POST
    resource: localfs-id
    endpoint: create
    directory: test/
```


### Update endpoint

The purpose of this endpoint is to update a file into the local file-system.
Filename is defined by the context, and content will be the HTTP body of the 
request.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "update"
| **directory**   | no        | string |         | the directory where file is located

#### Example

```yaml
server:
  endpoints:
  - path: "/localfs/:id"
    method: PUT
    resource: localfs-id
    endpoint: update
    directory: test/
```

### Delete endpoint

The purpose of this endpoint is to delete a file into the local file-system.
Filename is defined by the context.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **directory**   | no        | string |         | the directory where file is located

#### Example

```yaml
server:
  endpoints:
  - path: "/localfs/:id"
    method: DELETE
    resource: localfs-id
    endpoint: delete
    directory: test/
```