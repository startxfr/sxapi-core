<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.1.10-docker/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : google_drive

This resource allow you to manipulate a Google Drive Storage backend using 
google drive API. 
This resource is part of the [sxapi google resource](google.md). 
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose google data.

Based on [googleapis npm module](https://www.npmjs.com/package/googleapis) 
[![npm](https://img.shields.io/npm/v/googleapis.svg)](https://www.npmjs.com/package/googleapis) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.0.9-blue.svg)](https://github.com/startxfr/sxapi-core).

- [Resource configuration](#resource-configuration)<br>
- [Resource methods](#resource-methods)<br>
- [Resource endpoints](#resource-endpoints)


## Resource configuration

To configure this resource, you must add a config object under the `resources['google-id'].services`
section of your configuration profile. 
This key must be a `drive` and his value will be the configuration object who must 
have the [appropriate configuration parameters](#resource-config-parameters).

For a better understanting of the sxapi
configuration profile, please refer to the [configuration guide](../guides/2.Configure.md)

### Resource config parameters

*none*

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "google-id": {
        "_class": "google",
        "auth": { ... },
        "services": {
            "drive": {
            }
        }
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('google-id').getService('drive')` where `google-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 
For more information read [the getService method documentation](google.md#method-getservice)

This module come with 20 methods.

[1. findFile method](#method-findfile)
[2. getFile method](#method-getfile)
[3. getFileMeta method](#method-getfilemeta)
[4. copyFile method](#method-copyfile)
[5. moveFile method](#method-movefile)
[6. addFile method](#method-addfile)
[7. updateFile method](#method-updatefile)
[8. deleteFile method](#method-deletefile)
[9. exportFile method](#method-exportfile)
[10. getDirectory method](#method-getdirectory)
[11. copyDirectory method](#method-copydirectory)
[12. moveDirectory method](#method-movedirectory)
[13. addDirectory method](#method-adddirectory)
[14. updateDirectory method](#method-updatedirectory)
[15. deleteDirectory method](#method-deletedirectory)
[16. getPermissions method](#method-getpermissions)
[17. addPermission method](#method-addpermission)
[18. updatePermission method](#method-updatepermission)
[19. deletePermission method](#method-deletepermission)
[20. emptyTrash method](#method-emptytrash)


### Method findFile

Search for a list of google files matching a google query [see google documentation](https://developers.google.com/drive/v3/web/search-parameters)

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **q**                        | yes       | string   | null    | The drive query to perform [see google examples](https://developers.google.com/drive/v3/web/search-parameters#examples)
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.list() documentation](https://developers.google.com/drive/v3/reference/files/list).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data

#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.findFile("fullText contains 'hello'", { maxResults : 50 } ,  function (error, response) {
    console.log(error, response);
});
```

### Method getFile

Search for a google file coresponding to the id and return the document content

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **id**                       | yes       | string   | null    | The document ID to find
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.get() documentation](https://developers.google.com/drive/v3/reference/files/get).
| **response**                 | no        | object   | null    | Http request response. If given will be used isted of callback to steam the document content directly to the response.
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions unless a response object was previously given
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data. Document data will be found in `doc.Body`

#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
// With callback
service.getFile('a4z8f5z6e85e6rt578rer5zer6z64t', { acknowledgeAbuse : false } , false, function (error, response) {
    console.log(error, response);
});
// with response (where response is and http response object)
service.getFile('a4z8f5z6e85e6rt578rer5zer6z64t', { acknowledgeAbuse : false } ,  response);
```

### Method getFileMeta

Search for a google file coresponding to the id and return the document meta data

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **id**                       | yes       | string   | null    | The document ID to find
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.get() documentation](https://developers.google.com/drive/v3/reference/files/get).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data

#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.getFileMeta('a4z8f5z6e85e6rt578rer5zer6z64t', { acknowledgeAbuse : false } ,  function (error, response) {
    console.log(error, response);
});
```

### Method copyFile

Copy a file into a new one located into another directory 

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **source**                   | yes       | string   | null    | The file ID of the resource to copy
| **destination**              | yes       | string   | null    | The directory ID of the destination
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.copy() documentation](https://developers.google.com/drive/v3/reference/files/copy).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.copyFile( "314159265358979323846", "483514654687643543578", { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method moveFile

Move a file from one directory into another directory 

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **fileId**                   | yes       | string   | null    | The file ID of the resource to move
| **source**                   | yes       | string   | null    | The file ID of the source directory
| **destination**              | yes       | string   | null    | The file ID of the destination directory
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.update() documentation](https://developers.google.com/drive/v3/reference/files/update).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.moveFile( "35335965465867654654",  "314159265358979323846", "483514654687643543578", { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method addFile

Add a new file into a directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **name**                     | yes       | string   | null    | The file name to use in drive storage
| **body**                     | yes       | string   | null    | Document body or content
| **mime**                     | yes       | string   | null    | Mime type of this document
| **parent**                   | yes       | string   | null    | The parent directory
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.create() documentation](https://developers.google.com/drive/v3/reference/files/create).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.addFile(
    "sample file from sxapi",
    "my content", 
    "text/plain", 
    "314159265358979323846", 
    { ocr : false } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method updateFile

Update the content of a file

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **fileId**                   | yes       | string   | null    | The file ID of the resource
| **body**                     | yes       | string   | null    | Document body or content
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.update() documentation](https://developers.google.com/drive/v3/reference/files/update).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.updateFile(
    "314159265358979323846",
    "my content",  
    { ocr : false } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method deleteFile

Flag file as trashed

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **fileId**                   | yes       | string   | null    | The file ID of the resource
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.delete() documentation](https://developers.google.com/drive/v3/reference/files/delete).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.deleteFile(
    "314159265358979323846"
    { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method exportFile

Export a GoogleDocs file into various mimeType

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **fileId**                   | yes       | string   | null    | The file ID of the template document
| **mime**                     | yes       | string   | null    | Mime type of the converted document
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.export() documentation](https://developers.google.com/drive/v3/reference/files/export).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.exportFile(
    "314159265358979323846", 
    "application/pdf", 
    { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method getDirectory

Search for a list of google files into a given directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **id**                       | yes       | string   | null    | The directory ID in google Drive
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.list() documentation](https://developers.google.com/drive/v3/reference/files/list).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data

#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.getDirectory("314159265358979323846", { maxResults : 50 } ,  function (error, response) {
    console.log(error, response);
});
```

### Method copyDirectory

Copy a directory into a new one located into another directory 

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **source**                   | yes       | string   | null    | The directory ID of the resource to copy
| **destination**              | yes       | string   | null    | The directory ID of the destination
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.create() documentation](https://developers.google.com/drive/v3/reference/files/create).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.copyDirectory( "314159265358979323846", "483514654687643543578", { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method moveDirectory

Move a directory from one directory into another directory 

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **directoryId**              | yes       | string   | null    | The file ID of the directory to move
| **source**                   | yes       | string   | null    | The file ID of the source directory
| **destination**              | yes       | string   | null    | The file ID of the destination directory
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.update() documentation](https://developers.google.com/drive/v3/reference/files/update).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.moveDirectory( "35335965465867654654",  "314159265358979323846", "483514654687643543578", { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method addDirectory

Add a new directory into another directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **name**                     | yes       | string   | null    | The directory name to use in drive storage
| **parent**                   | yes       | string   | null    | The parent directory
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.create() documentation](https://developers.google.com/drive/v3/reference/files/create).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.addDirectory(
    "sample directory from sxapi",
    "314159265358979323846", 
    { ocr : false } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method updateDirectory

Update the name of a directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **directoryId**              | yes       | string   | null    | The directory ID of the resource
| **name**                     | yes       | string   | null    | New directory name
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.update() documentation](https://developers.google.com/drive/v3/reference/files/update).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.updateDirectory(
    "314159265358979323846",
    "my new name",  
    { ocr : false } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method deleteDirectory

Flag directory as trashed

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **directoryId**              | yes       | string   | null    | The directory ID of the resource
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.delete() documentation](https://developers.google.com/drive/v3/reference/files/delete).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.deleteDirectory(
    "314159265358979323846"
    { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method getPermissions

Get list of google permissions associated to a given file or directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **id**                       | yes       | string   | null    | The file or directory ID in google Drive
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [permissions.list() documentation](https://developers.google.com/drive/v3/reference/permissions/list).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data

#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.getPermissions("314159265358979323846", { } ,  function (error, response) {
    console.log(error, response);
});
```

### Method addPermission

Add a new permission to a given file or directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **id**                       | yes       | string   | null    | The file or directory ID in google Drive
| **user**                     | yes       | string   | null    | The user name to add permission
| **role**                     | yes       | string   | null    | The user role
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [permissions.create() documentation](https://developers.google.com/drive/v3/reference/permissions/create).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.addPermission("314159265358979323846", "user@domain.org", "writer", { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method updatePermission

Update one permission rule associated to a given file or directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **id**                       | yes       | string   | null    | The file or directory ID in google Drive
| **permId**                   | yes       | string   | null    | The permission ID to update
| **role**                     | yes       | string   | null    | The user new role
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [permissions.update() documentation](https://developers.google.com/drive/v3/reference/permissions/update).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.updatePermission("314159265358979323846", "2658534548766546588", "reader", { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method deletePermission

Delete one permission rule associated to a given file or directory

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **id**                       | yes       | string   | null    | The file or directory ID in google Drive
| **permId**                   | yes       | string   | null    | The permission ID to update
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [permissions.delete() documentation](https://developers.google.com/drive/v3/reference/permissions/delete).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data


#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.deletePermission("314159265358979323846", "2658534548766546588", { } ,  
    function (error, response) {
        console.log(error, response);
    });
```

### Method emptyTrash

Empty the trash bin instantly

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **options**                  | no        | object   | null    | Optional configuration for the API request.<br>See google Drive API [files.emptyTrash() documentation](https://developers.google.com/drive/v3/reference/files/emptyTrash).
| **callback**                 | no        | function | none    | callback function called when server answer the request.<br>If not defined, will throw exceptions or return the sub-resource
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from google drive API. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | object   |         | the document meta-data

#### Example

```javascript
var service = $app.resources.get('google-id').getService('drive');
service.emptyTrash( { } ,  function (error, response) {
    console.log(error, response);
});
```

## Resource endpoints

This module come with one single endpoint who can interact with any google server.

[1. getFile endpoint](#getfile-endpoint)
[2. addFile endpoint](#addfile-endpoint)
[3. findFile endpoint](#findfile-endpoint)
[4. listDirectory endpoint](#listdirectory-endpoint)
[5. addDirectory endpoint](#adddirectory-endpoint)

### getFile endpoint

The purpose of this endpoint is to return the content of the document directly
to the http response.


#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "getFile"
| **fileId**      | no        | string |         | the Id of the file whe whan to expose.<br>If not given, will try to find an `id` key in the http request.


#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/token",
            "resource": "google-id",
            "endpoint": "getFile",
            "fileId" : "314159265358979323846"
        }
    ]
}
```


### addFile endpoint

The purpose of this endpoint is to create a new file in google Drive based on the 
content received from the http request.


#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "addFile"
| **parent**      | no        | string |         | The parent directory ID<br>If not given, will try to find an `parent` key in the http request.
| **config**      | no        | object |         | Config object to pass to the [addFile method](#method-addfile)


#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/token",
            "resource": "google-id",
            "endpoint": "addFile",
            "parent" : "314159265358979323846"
        }
    ]
}
```


### findFile endpoint

The purpose of this endpoint is to find a list of file coresponding to the given query.


#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "findFile"
| **q**           | no        | string |         | The drive query to perform [see google examples](https://developers.google.com/drive/v3/web/search-parameters#examples)<br>If not given, will try to find an `q` key in the http request.


#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/token",
            "resource": "google-id",
            "endpoint": "findFile",
            "q" : "fullText contains 'hello'"
        }
    ]
}
```


### listDirectory endpoint

The purpose of this endpoint is to find a list of files within a given directory


#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "listDirectory"
| **folderId**    | no        | string |         | the Id of the folder whe whan to list.<br>If not given, will try to find an `id` key in the http request.
| **config**      | no        | object |         | Config object to pass to the [getDirectory method](#method-getdirectory)


#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/token",
            "resource": "google-id",
            "endpoint": "listDirectory",
            "folderId" : "314159265358979323846"
        }
    ]
}
```

### addDirectory endpoint

The purpose of this endpoint is to add a new directory into our google drive backend


#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "listDirectory"
| **name**        | no        | string |         | the name of the folder whe want to create. <br>If not given, will try to find an `name` key in the http request.
| **parent**      | no        | string |         | The parent directory ID<br>If not given, will try to find an `parent` key in the http request.
| **config**      | no        | object |         | Config object to pass to the [addDirectory method](#method-adddirectory)


#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/token",
            "resource": "google-id",
            "endpoint": "listDirectory",
            "parent" : "314159265358979323846",
            "name" : "new folder from sxapi"
        }
    ]
}
```