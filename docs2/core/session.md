# SXAPI Core : session

This core module allow you to track user and calls using a session mechanism. You can use various transport layer (cookie, token) for getting the session identifier from the consumer. Backend section allow you to define a storage for these sessions identifier.

## Configuration

In your sxapi.json config file, you can add a 'session' property coresponding to an object with at least 2 sub-properties: 'transport' and 'backend'. 

#### **Config parameters**

| Param           | Type   | Mandatory | default | Description   |
|-----------------|:------:|:---------:|---------|---------------|
| **duration**    | `int`  | no        | 3600    | time in second for a session length. Could be used by transport (ex: cookie) or backend (ex: mysql) to control session duration. If this time is exceed, session will return an error response. Used in conjunction with stop field property in mysql backend or cookie duration in cookie transport layer. |
| **auto_create** | `bool` | no        | false   | If transport layer could not find a session ID, create a new session transparently. Default is false |
| **transport**   | `obj`  | no        | null    | An object describing the transport layer used to get and set session ID. See [transport section](#transport-layer) |
| **backend**     | `obj`  | no        | null    | An object describing the backend layer used to store and retrive session context. See [backend section](#backend-layer) |


### **Sample sxapi.json**

```json
"session": {
    "duration": 3600,
    "auto_create": false,
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

### transport using 'cookie'

Cookie transport allow you to get the session ID by reading the session ID from an http cookie. You can call you api's endpoint using a browser cookie and this session transport layer will be able to get the session ID and pass it to the configured backend to find the coresponding session.

#### **Config parameters**

-   `cookie_name` **string** name of the cookie to find or define. Default is 'sxapi-sess'
-   `cookie_options` **object** option used for creation a cookie. [See cookies documentation](https://github.com/pillarjs/cookies#cookiesset-name--value---options--)

### **Sample sxapi.json**

```json
"session": {
    "transport": {
        "type": "cookie",
        "cookie_name": "sxapi-sess",
        "cookie_options" : {...}
    }
}
```

### transport using 'bearer'

Bearer transport allow you to get the session ID by reading it from a `Authentification: Bearer <token>` http header. session token is also transmitted using this header

#### **Config parameters**

### **Sample sxapi.json**

```json
"session": {
    "transport": {
        "type": "bearer"
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
  -   `start` **string** name of the field containing the session start time
  -   `stop` **string** name of the field containing the session end time (defined with duration and used for expiration control)

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
            "ip": "ip_sess",
            "start": "start_sess",
            "stop": "stop_sess"
        }
    }
}
```

### backend using 'couchbase'

couchbase backend 

#### **Config parameters**

-   `type` **string** Must be 'couchbase' for this backend layer
-   `resource` **string** ID of the couchbase resource [see resource for configuration](../resources/README.md).
-   `key_ns` **string** the key namespace for this kind of document. used as a key prefix
-   `fields` **object** an object with special field list
  -   `token` **string** name of the field containing the session token
  -   `ip` **string** name of the field containing the session IP
  -   `start` **string** name of the field containing the session start time
  -   `stop` **string** name of the field containing the session end time (defined with duration and used for expiration control)

### **Sample sxapi.json**

```json
"session": {
    "backend": {
        "type": "couchbase",
        "resource": "couchbase-sample",
        "key_ns": "sess::",
        "fields": {
            "token": "token",
            "ip": "ipAdress",
            "start": "startDate",
            "stop": "stopDate"
        }
    }
}
```



