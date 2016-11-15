# SXAPI Core : session

This core module allow you to track user and calls using a session mechanism. You can use various transport layer (cookie, token) for getting the session identifier from the consumer. Backend section allow you to define a storage for these sessions identifier.

## Configuration

In your sxapi.json config file, you can add a 'session' property coresponding to an object with at least 2 sub-properties: 'transport' and 'backend'. 

```json
"session": {
    "transport": {
        ...
    },
    "backend": {
        ...
    }
}
```

## Transport layer

In you 'transport' section, you must have a property named 'type' and coresponding to a supported type. Actualy supported types are 'token' or 'cookie'.

### transport using 'token'

Token transport allow you to get the session ID by reading the session ID from an http param. You can call you api's endpoint using `?token=xxx` and this session transport layer will be able to get the `xxx` session ID and pass it to the configured backend to find the coresponding session.

#### **Config parameters**

-   `type` **string** Must be 'token' for this transport layer
-   `param` **string** Name of the http param to read. Default is 'token'

### **Sample sxapi.json**

```json
"session": {
    "transport": {
        "type": "token",
        "param": "sid"
    }
}
```


## Backend layer

In you 'backend' section, you must have a property named 'type' and coresponding to a supported type. Actualy supported type is 'mysql'.

### backend using 'mysql'

mysql backend 

#### **Config parameters**

-   `type` **string** Must be 'mysql' for this backend layer
-   `resource` **string** ID of the mysql resource [see resource for configuration](../resources/README.md).
-   `table` **string** table name used for session storage
-   `sid_field` **string** name of the field containing the session ID
-   `id_field` **string** name of the field containing the table ID
-   `fields` **object** an object with special field list
  -   `ip` **string** name of the field containing the session IP
  -   `date` **string** name of the field containing the session date

### **Sample sxapi.json**

```json
"session": {
    "backend": {
        "type": "mysql",
        "resource": "mysql-sample",
        "table": "sessions",
        "sid_field": "token_sess",
        "id_field": "id_sess",
        "fields": {
            "ip" : "ip_sess",
            "date" : "date_sess"
        }
    }
}
```




