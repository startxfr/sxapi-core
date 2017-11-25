# SXAPI Core : session component

The session component is a [core component](./README.md) allow you to keep presistant 
information between client and API server using a session mechanism.<br> 
This component comes with various transport layer ([cookie](#transport-using-cookie), 
[token](#transport-using-token) or [bearer](#transport-using-bearer)) for transfering the 
session identifier from and to the consumer. <br> 
You can use various storage backend ([mysql](#backend-mysql), 
[couchbase](#backend-couchbase), [memory](#backend-memory) or [redis](#backend-redis)) 
to persist session context across request and micro-services instances.

## Configuration

To enable this component in you API, you must add a `"session"` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config- parameters).<br>
If `"session"` property is not defined, or set to false (`"session" : false`), no
session context will be defined and your API will be stateless unless your resources
used a buildin mecanism for user context persistance.

### Config parameters

| Param           | Mandatory | Type | default | Description
|-----------------|:---------:|:----:|---------|---------------
| **duration**    | no        | int  | 3600    | time in second for a session length. Could be used by transport (ex: cookie) or backend (ex: mysql) to control session duration. <br> If this time is exceed, session will return an error response. Used in conjunction with stop field property in mysql backend or cookie duration in cookie transport layer.
| **auto_create** | no        | bool | false   | If transport layer could not find a session ID, create a new session transparently
| **transport**   | no        | obj  | null    | An object describing the transport layer used to get and set session ID. See [transport section](#transport-using-layer)
| **backend**     | no        | obj  | null    | An object describing the backend layer used to store and retrive session context. See [backend section](#backend-layer)


### Config Sample

```json
"session": {
    "duration": 3600,
    "auto_create": true,
    "transport": {
        "type": "cookie",
        ...
    },
    "backend": {
        "type": "memory",
        ...
    }
}
```

## Transport layer

In you `transport` section, you must have a property `type` coresponding to a 
supported type. Available transport types are [cookie](#transport-using-cookie), 
[token](#transport-using-token) or [bearer](#transport-using-bearer)

### transport using `token`

Token transport allow you to retrive the session ID by reading an http param. 
You can call your API endpoint's using `?token=xxx` and this transport layer will
extract the `xxx` session ID and pass it to the backend.
This transport type is very light. Client is in charge of storing the session ID.
Choose carefully your `param` name to avoid naming conflict with your API endpoints.

#### Config parameters

| Param       | Mandatory | Type    | default | Description
|-------------|:---------:|:-------:|---------|---------------
| **type**    | yes       | string  | token   | Must be `token` for this transport layer
| **param**   | no        | string  | _token  | Name of the http param to read. Default is `_token`

#### Config sample

```json
"session": {
    "transport": {
        "type": "token",
        "param": "sid"
    }
}
```

### transport using `cookie`

Cookie transport allow you to get the session ID by reading the session ID from an http cookie. You can call you api's endpoint using a browser cookie and this session transport layer will be able to get the session ID and pass it to the configured backend to find the coresponding session.

#### **Config parameters**

-   `cookie_name` **string** name of the cookie to find or define. Default is `sxapi-sess`
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

### transport using `bearer`

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

In you `backend` section, you must have a property named `type` and coresponding to a supported type. Actualy supported type is `mysql`.

### backend using `mysql`

mysql backend 

#### **Config parameters**

-   `type` **string** Must be `mysql` for this backend layer
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

### backend using `couchbase`

couchbase backend 

#### **Config parameters**

-   `type` **string** Must be `couchbase` for this backend layer
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



