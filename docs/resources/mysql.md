# SXAPI Resource : mysql

This resource allow you to interact with a mariaDB server. Based on [mysql NodeJS SDK 2.11.1](https://github.com/mysqljs/mysql#install). This resource can be used using ```$app.resources.get('resource-id')``` in your own modules. You can then use one of the [availables methods](#available-methods). mysql resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `_class` **string** Must be mysql for this resource
-   `server` **object** configuration detail about server connexion
    -   `host` **string** hostname or IP of the mysql server to use. If you use you host, don't forget to use the docker0 interface ```# ifconfig docker0``` and not localhost or 127.0.0.1
    -   `port` **int** give a port if differents form default 3306 mysql port
    -   `user` **string** username for authentication
    -   `password` **string** user password 
    -   `database` **string** database name to use within this resource

### **Sample sxapi.json**

```javascript
"resources": {
    ...
    "mysql-sample": {
        "_class": "mysql",
        "server": {
            "host": "172.17.42.1",
            "port": "3306",
            "user": "username",
            "password": "userpassword",
            "database": "databasename"
        }
    }
    ...
}
```

## Available Methods

### Method query

Execute the SQL query within the database defined in the resource.

#### **Parameters**

-   `sql` **string** The SQL query to send to the mysql server
-   `callback` **function** Callback function used to handle the answer. If not provided, $mqdb.__queryDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the mysql cluster or error message if `error` is true

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.query('SELECT * FROM `log` LIMIT 0, 5', function (error, response) {
    console.log(error, response);
});
```

### Method insert

Insert a new entry into the table.

#### **Parameters**

-   `tablename` **string** table name where you whan't to add your entry
-   `entry` **object** object with key, value describing you new entry.
-   `callback` **function** Callback function used to handle the answer. If not provided, $mqdb.__insertDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the mysql cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.insert('tablename', {key:'value'}, function (error, response) {
    console.log(error, response);
});
```

### update

Update one or several entry into the given table.  If no filter found, update won't append to prevent unintentional global update of the table.

#### **Parameters**

-   `table` **string** ID of the table entry to update
-   `data` **object** object with data to update
-   `filter` **object** List of key and value used for filtering line's to update. For example, the filter object ```{id:'key'}``` will update all lines with 'id' field set to 'key'.
-   `callback` **function** Callback function used to handle the answer. If not provided, $mqdb.__updateDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the mysql cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.update('table',{key:'value 2'}, {id:'key'}, function (error, response) {
    console.log(error, response);
});
```

### delete

Remove one or several entry from the given table.  If no filter found, delete won't append to prevent unintentional global delete of the table.

#### **Parameters**

-   `table` **string** ID of the table entry to update
-   `filter` **object** List of key and value used for filtering line's to delete. For example, the filter object ```{id:'key'}``` will delete all lines with 'id' field set to 'key'.
-   `callback` **function** Callback function used to handle the answer. If not provided, $mqdb.__deleteDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the mysql cluster

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.delete('table', {id:'key'}, function (error, response) {
    console.log(error, response);
});
```



## Available Endpoints

### list endpoint

Return a list resulting from a SQL query

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the mysql resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.list***
-   `sql` **string** SQL query to execute whent his entrypoint is called

#### **Sample code**

```javascript 
{
    "path": "/",
    "method": "GET",
    "resource": "mysql-sample",
    "endpoint": "endpoints.list",
    "sql": "SELECT * FROM `log` LIMIT 10"
}
```

### get endpoint

Return a document coresponding to the given entryId

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the mysql resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.get***
-   `table` **string** table name to use for geting this entry
-   `id_field` **string** table field name used a key

#### **Sample code**

```javascript 
{
    "path": "/:id",
    "method": "GET",
    "resource": "mysql-sample",
    "endpoint": "endpoints.get",
    "table": "log",
    "id_field": "id"
}
```

### create endpoint

Insert a new document in the bucket. You could give and id or leave the system create one for you

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the mysql resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.create***
-   `table` **string** table name to use for geting this entry
-   `id_field` **string** table field name used a key

#### **Sample code**

```javascript 
{
    "path": "/",
    "method": "POST",
    "resource": "mysql-sample",
    "endpoint": "endpoints.create",
    "table": "log",
    "id_field": "id"
}
```

### update endpoint

Update the document coresponding to the given entryId with the new document

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the mysql resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.update***
-   `table` **string** table name to use for geting this entry
-   `id_field` **string** table field name used a key

#### **Sample code**

```javascript 
{
    "path": "/:id",
    "method": "PUT",
    "resource": "mysql-sample",
    "endpoint": "endpoints.update",
    "table": "log",
    "id_field": "id"
}
```

### delete endpoint

Remove the document coresponding to the given entryId with the new document

#### **Config parameters**

-   `path` **string** Serveur path to bind this entrypoint to
-   `method` **string** http method to listen to
-   `resource` **string** define the mysql resource to use. Fill with a resource name as defined in the resource pool
-   `endpoint` **string** The resource handler to use. For this entrypoint, use ***endpoints.delete***
-   `table` **string** table name to use for geting this entry
-   `id_field` **string** table field name used a key

#### **Sample code**

```javascript 
{
    "path": "/:id",
    "method": "DELETE",
    "resource": "mysql-sample",
    "endpoint": "endpoints.delete",
    "table": "log",
    "id_field": "id"
}
```