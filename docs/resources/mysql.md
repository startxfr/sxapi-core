<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.0.58-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Resource : mysql

This resource allow you to interact with a mariaDB server or a mysql like backend. 
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose mysql data.

This resource is based on [mysql npm module](https://www.npmjs.com/package/mysql) 
[![mysql](https://img.shields.io/npm/v/mysql.svg)](https://www.npmjs.com/package/mysql) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v0.0.6-blue.svg)](https://github.com/startxfr/sxapi-core).

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
| **_class**             | yes       | string |                 | Module name. Must be **mysql** for this resource
| **server**             | yes       | object |                 | Object describing the connection to the server
| server.**host**        | yes       | string |                 | The IP or hostname of the mysql server. If you want to reach a server on the same machine, using docker, don't forget to use the docker0 interface IP (like 172.17.x.x) using `# ifconfig docker0` and not localhost or 127.0.0.1. Example : 172.17.42.1
| server.**database**    | yes       | string |                 | Name of the database to use
| server.**port**        | no        | int    | 3306            | The port number to connect to
| server.**user**        | no        | string | none            | The MySQL user to authenticate as.
| server.**password**    | no        | string | none            | The password of that MySQL user.
| server.**charset**     | no        | string | UTF8_GENERAL_CI | The charset for the connection also called "collation" in the SQL-level (ex: utf8_general_ci).
| server.**timezone**    | no        | string | local           | The timezone configured on the database server. This can be 'local', 'Z', or an offset in the form +HH:MM or -HH:MM.
| server.**...**         | no        | N/A    |                 | Any request option defined in npm module ex: localAddress, socketPath, flags, ssl, connectTimeout, stringifyObjects, insecureAuth, typeCast, queryFormat, supportBigNumbers, bigNumberStrings, dateStrings, debug, trace, multipleStatements. See [see mysql npm module documentation](https://github.com/mysqljs/mysql#connection-options).


### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```javascript
"resources": {
    ...
    "mysql-id": {
        "_class" : "mysql",
        "server": {
            "host": "172.17.42.1",
            "port": "3306",
            "user": "username",
            "password": "userpassword",
            "database": "databasename"
            "connectTimeout" : 10000

        }
    }
    ...
}
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('mysql-id')` where `mysql-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with 6 methods for manipulating mysql dataset.

[1. Query method](#method-query)<br>
[2. Read method](#method-read)<br>
[3. Insert method](#method-insert)<br>
[4. Update method](#method-update)<br>
[5. Delete method](#method-delete)

### Method query

Send a SQL request to the mysql server defined in the given resource. 

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **sql**                      | yes       | string   | null    | A SQL query for selecting dataset
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | bool     |         | will be false or null if no error returned from the mysql SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the result of the query (if no error)


#### Example

```javascript
var resource = $app.resources.get('mysql-id');
resource.query('SELECT name FROM `table-sample` WHERE  tab_id ="key_sample";', function (error, response) {
    console.log(error, response);
});
```

### Method read

Build a simple select query for one table using cumulative filters.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **table**                    | yes       | string   | null    | Name of the table whe want to query
| **filter**                   | yes       | object   |         | Object with one or several key-value pair where key must be a table field name, and value the filtering value. For example, the filter object `{id:'key'}` will match all lines with 'id' field set to value 'key'.
| **callback**                 | no        | function | default | Callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the mysql SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)


#### Example

```javascript
var resource = $app.resources.get('mysql-id');
resource.get('table-name', {"fieldname_id" : "id"} , function (error, response) {
    console.log(error, response);
});
```

### Method insert

Insert a new entry into the table.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **tablename**                | yes       | string   | null    | Table name to use for this insertion
| **entry**                    | yes       | string   | null    | Object with key coresponding to table fields and the coresponding value describing the new field value.
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the mysql SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)

#### Example

```javascript
var resource = $app.resources.get('mysql-id');
resource.insert('table-name', {"fieldname_id" : "id","fieldname_sample" : "value"}, function (error, response) {
    console.log(error, response);
});
```

### Method update

update one or many table rows matching the given filter.

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **table**                    | yes       | string   | null    | Table name to use for this update
| **data**                     | yes       | string   | null    | Object with key coresponding to table fields and the coresponding value describing the new field value.
| **filter**                   | yes       | object   |         | Object with one or several key-value pair where key must be a table field name, and value the filtering value. For example, the filter object `{id:'key'}` will match all lines with 'id' field set to value 'key'.
| **callback**                 | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the mysql SDK. Will be an error object if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the document object (if no error)


#### Example

```javascript
var resource = $app.resources.get('mysql-id');
resource.update('table-name', {"fieldname_sample" : "value"}, {"fieldname_id" : "id"}, function (error, response) {
    console.log(error, response);
});
```

### Method delete

Delete one or many table rows matching the given filter.

#### Parameters

| Param               | Mandatory | Type     | default | Description
|---------------------|:---------:|:--------:|---------|---------------
| **table**           | yes       | string   | null    | Table name to use for this deletion
| **filter**          | yes       | object   |         | Object with one or several key-value pair where key must be a table field name, and value the filtering value. For example, the filter object `{id:'key'}` will match all lines with 'id' field set to value 'key'.
| **callback**        | no        | function | default | callback function called when server answer the request.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**) | N/A       | mixed    | null    | will be false or null if no error returned from the mysql SDK. Will be an error object if an error occur.


#### Example

```javascript
var resource = $app.resources.get('mysql-id');
resource.delete('table-name', {"fieldname_id" : "id"}, function (error) {
    console.log(error);
});
```

## Resource endpoints

This module come with 5 endpoints who can interact with any mysql method.

[1. List endpoint](#list-endpoint)<br>
[2. Get endpoint](#get-endpoint)<br>
[3. Create endpoint](#create-endpoint)<br>
[4. Update endpoint](#update-endpoint)<br>
[5. Delete endpoint](#delete-endpoint)


### List endpoint

The purpose of this endpoint is to make call to a mysql server and to return 
the value associated to the given document ID.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"
| **sql**         | yes       | string |         | the sql query to execute and get a result from. This query can contain variable (ex : `{{path}}`) and will be substitued with all config and request parameters. this help you build dynamic queries based on request input.

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/mysql",
            "resource": "mysql-id",
            "endpoint": "list",
            "configParam": "test",
            "sql": "SELECT name FROM `table-sample` WHERE fieldname_id =\"{{key}}\" AND fieldname_sample =\"{{configParam}}\";"
        }
    ]
}
```

Whith the previous configuration sample, if you make the following http request `GET /mysql?key=id`
you will get result from the generated query `SELECT name FROM `table-sample` WHERE fieldname_id = "id" AND fieldname_sample = "test";`


### Get endpoint

The purpose of this endpoint is to make call to a mysql server and to return 
the value associated to the given document ID. Use KV capabilities of Mysql 
and work extremely fast on well sized cluster.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "get"
| **table**       | yes       | string |         | table name to use for getting this entry
| **id_field**    | yes       | string |         | table field name used a unique key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/mysql/:id",
            "resource": "mysql-id",
            "endpoint": "get",
            "table": "log",
            "id_field": "id"
        }
    ]
}
```

### Create endpoint

The purpose of this endpoint is to insert a row in one database table. 
Table row is defined by the context, and content will be the HTTP body of the
request.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "create"
| **table**       | yes       | string |         | table name to use for getting this entry
| **id_field**    | yes       | string |         | table field name used a unique key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/mysql/:id",
            "method": "POST",
            "resource": "mysql-id",
            "endpoint": "create",
            "table": "log",
            "id_field": "id"
        }
    ]
}
```


### Update endpoint

The purpose of this endpoint is to update a row in one database table. 
Table row is defined by the context, and document will be the HTTP body of the 
request.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "update"
| **table**       | yes       | string |         | table name to use for getting this entry
| **id_field**    | yes       | string |         | table field name used a unique key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/mysql/:id",
            "method": "PUT",
            "resource": "mysql-id",
            "endpoint": "update",
            "table": "log",
            "id_field": "id"
        }
    ]
}
```

### Delete endpoint

The purpose of this endpoint is to delete a row in one database table. 
Table row is defined by the context.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "delete"
| **table**       | yes       | string |         | table name to use for getting this entry
| **id_field**    | yes       | string |         | table field name used a unique key

#### Example

```javascript
"server": {
    "endpoints": [
        {
            "path": "/mysql/:id",
            "method": "DELETE",
            "resource": "mysql-id",
            "endpoint": "delete",
            "table": "log",
            "id_field": "id"
        }
    ]
}
```