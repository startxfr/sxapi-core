<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.0.77-docker/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : session manager

The session manager is a [core component](./README.md) allow you to keep persistant 
information between client and API server using a session mechanism.<br> 
This component comes with various transport type ([cookie](#transport-using-cookie), 
[token](#transport-using-token) or [bearer](#transport-using-bearer)) for transfering the 
session identifier from and to the consumer. <br> 
You can use various storage backend ([mysql](#backend-using-mysql), ([postgres](#backend-using-postgres), 
[couchbase](#backend-using-couchbase), [memory](#backend-using-memory), 
[memcache](#backend-using-memcache) or [redis](#backend-using-redis)) 
to persist session context across request and micro-services instances.

## Configuration

To enable this component in you API, you must add a `session` property
in the main section of your [configuration file](../guides/2.Configure.md), 
The coresponding value should be an object with [configuration parameters](#config-parameters).<br>
If `session` property is not defined, or set to false (`"session" : false`), no
session context will be defined and your API will be stateless unless your resources
used a buildin mecanism for user context persistance.

### Config parameters

| Param           | Mandatory | Type | default | Description
|-----------------|:---------:|:----:|---------|---------------
| **duration**    | no        | int  | 3600    | time in second for a session length. Could be used by transport (ex: cookie) or backend (ex: mysql) to control session duration. <br> If this time is exceed, session will return an error response. Used in conjunction with stop field property in mysql backend or cookie duration in cookie transport type.
| **auto_create** | no        | bool | false   | If transport type could not find a session ID, create a new session transparently
| **transport**   | no        | obj  | null    | An object describing the transport type used to get and set session ID. See [transport section](#transport-using-type)
| **backend**     | no        | obj  | null    | An object describing the backend type used to store and retrive session context. See [backend section](#backend-using-type)


### Config Sample

```javascript
"session": {
    "duration"   : 3600,
    "auto_create": true,
    "transport"  : {
        "type": "cookie",
        ...
    },
    "backend"    : {
        "type": "memory",
        ...
    }
}
```

## Transport type

In you `transport` section, you must have a property `type` coresponding to a 
supported type. Available transport types are [cookie](#transport-using-cookie), 
[token](#transport-using-token) or [bearer](#transport-using-bearer)


### transport using `token`

Token transport allow you to retrive the session ID by reading an http param. 
You can call your API endpoint's using `?token=xxx` and this transport type will
extract the `xxx` session ID and pass it to the backend.<br>
This transport type is very light. Client is in charge of storing the session ID.
Choose carefully your `param` name to avoid naming conflict with your API endpoints.

#### Token config parameters 

| Param       | Mandatory | Type    | default | Description
|-------------|:---------:|:-------:|---------|---------------
| **type**    | yes       | string  | token   | Must be `token` for this transport type
| **param**   | no        | string  | _token  | Name of the http parameter transporting session ID

#### Token config sample

```javascript
"session": {
    "transport": {
        "type" : "token",
        "param": "sid"
    }
}
```

### transport using `cookie`

Cookie transport allow you to get the session ID by reading the session ID 
from an http cookie. You can call you api's endpoint using a browser cookie and 
this session transport type will be able to get the session ID and pass it to 
the configured backend to find the coresponding session.<br>
This transport type is statefull as it create the cookie when required. Client is 
not in charge of persisting the session ID and giving it to the http Object used
to send request to our API.
Choose carefully your `cookie_name` name to avoid naming conflict with other domain
cookies.

#### Cookie config parameters 

| Param               | Mandatory | Type    | default    | Description
|---------------------|:---------:|:-------:|------------|---------------
| **type**            | yes       | string  | cookie     | Must be `cookie` for this transport type
| **cookie_name**     | no        | string  | sxapi-sess | name of the cookie to find or define
| **cookie_options**  | no        | object  | {}         | option used for creation a cookie. [See cookies documentation](https://github.com/pillarjs/cookies#cookiesset-name--value---options--)

#### Cookie config sample

```javascript
"session": {
    "transport": {
        "type"           : "cookie",
        "cookie_name"    : "sxapi-sess",
        "cookie_options" : { ... }
    }
}
```


### transport using `bearer`

Bearer transport allow you to get the session ID by reading it from a 
`Authentification: Bearer <token>` http header. session token is also transmitted 
to the client using the same header.
This transport type is stateless as client is in charge of storing and sending
the session ID.


#### Bearer config parameters 

| Param               | Mandatory | Type    | default    | Description
|---------------------|:---------:|:-------:|------------|---------------
| **type**            | yes       | string  | bearer     | Must be `bearer` for this transport type

#### Bearer config sample

```javascript
"session": {
    "transport": {
        "type" : "bearer"
    }
}
```



## Backend type

In you `backend` section, you must have a property named `type` and coresponding to a supported backend type. 
Available backend types are [mysql](#backend-using-mysql), [postgres](#backend-using-postgres), [couchbase](#backend-using-couchbase), [memory](#backend-using-memory), [memcache](#backend-using-memcache) or [redis](#backend-using-redis)

### backend using `mysql`

This backend type use [mysql resource](../resource/mysql.md) to persist session context across executions.

#### mysql config parameters

| Param            | Mandatory | Type    | default    | Description
|------------------|:---------:|:-------:|------------|---------------
| **type**         | yes       | string  | mysql      | Must be `mysql` for this backend type
| **resource**     | yes       | string  |            | ID of the mysql resource [see resource for configuration](../resources/README.md).
| **table**        | yes       | string  |            | table name used for session storage
| **sid_field**    | yes       | string  |            | name of the field containing the session ID
| **fields**       | no        | object  |            | an object with special field list
| **fields.ip**    | no        | string  |            | name of the field containing the session IP
| **fields.start** | no        | string  |            | name of the field containing the session start time
| **fields.stop**  | no        | string  |            | name of the field containing the session end time (defined with duration and used for expiration control)

#### mysql config sample

```javascript
"session": {
    "backend": {
        "type"     : "mysql",
        "resource" : "mysql-sample",
        "table"    : "sessions",
        "sid_field": "token_sess",
        "fields"   : {
            "ip"   : "ip_sess",
            "start": "start_sess",
            "stop" : "stop_sess"
        }
    }
}
```

### backend using `postgres`

This backend type use [postgres resource](../resource/postgres.md) to persist session context across executions.

#### postgres config parameters

| Param            | Mandatory | Type    | default    | Description
|------------------|:---------:|:-------:|------------|---------------
| **type**         | yes       | string  | postgres   | Must be `postgres` for this backend type
| **resource**     | yes       | string  |            | ID of the postgres resource [see resource for configuration](../resources/README.md).
| **table**        | yes       | string  |            | table name used for session storage
| **sid_field**    | yes       | string  |            | name of the field containing the session ID
| **fields**       | no        | object  |            | an object with special field list
| **fields.ip**    | no        | string  |            | name of the field containing the session IP
| **fields.start** | no        | string  |            | name of the field containing the session start time
| **fields.stop**  | no        | string  |            | name of the field containing the session end time (defined with duration and used for expiration control)

#### postgres config sample

```javascript
"session": {
    "backend": {
        "type"     : "postgres",
        "resource" : "postgres-sample",
        "table"    : "sessions",
        "sid_field": "token_sess",
        "fields"   : {
            "ip"   : "ip_sess",
            "start": "start_sess",
            "stop" : "stop_sess"
        }
    }
}
```

### backend using `couchbase`

This backend type use [couchbase resource](../resource/couchbase.md) to persist session context across executions.

#### couchbase config parameters

| Param            | Mandatory | Type    | default    | Description
|------------------|:---------:|:-------:|------------|---------------
| **type**         | yes       | string  | couchbase  | Must be `couchbase` for this backend type
| **resource**     | yes       | string  |            | ID of the couchbase resource [see resource for configuration](../resources/README.md).
| **key_ns**       | yes       | string  |            | the key namespace for this kind of document. used as a key prefix
| **fields**       | no        | object  |            | an object with special field list
| **fields.token** | no        | string  |            | name of the field containing the session token
| **fields.ip**    | no        | string  |            | name of the field containing the session IP
| **fields.start** | no        | string  |            | name of the field containing the session start time
| **fields.stop**  | no        | string  |            | name of the field containing the session end time (defined with duration and used for expiration control)

#### couchbase config sample

```javascript
"session": {
    "backend": {
        "type"    : "couchbase",
        "resource": "couchbase-sample",
        "key_ns"  : "sess::",
        "fields"  : {
            "token": "token",
            "ip"   : "ipAdress",
            "start": "startDate",
            "stop" : "stopDate"
        }
    }
}
```

### backend using `memory`

This backend type use application memory space to persist session context across executions.

#### memory config parameters

| Param            | Mandatory | Type    | default    | Description
|------------------|:---------:|:-------:|------------|---------------
| **type**         | yes       | string  | memory     | Must be `memory` for this backend type
| **sid_field**    | no        | string  | sid        | name of the field containing the session ID
| **fields**       | no        | object  |            | an object with special field list
| **fields.ip**    | no        | string  |            | name of the field containing the session IP
| **fields.start** | no        | string  |            | name of the field containing the session start time
| **fields.stop**  | no        | string  |            | name of the field containing the session end time (defined with duration and used for expiration control)

#### memory config sample

```javascript
"session": {
    "backend": {
        "type"     : "memory",
        "sid_field": "sessionID",
        "fields"   : {
            "ip"   : "ipAdress",
            "start": "startDate",
            "stop" : "stopDate"
        }
    }
}
```

### backend using `memcache`

This backend type use [memcache resource](../resource/memcache.md) to persist session context across executions.

#### memcache config parameters

| Param            | Mandatory | Type    | default    | Description
|------------------|:---------:|:-------:|------------|---------------
| **type**         | yes       | string  | memcache   | Must be `memcache` for this backend type
| **resource**     | yes       | string  |            | ID of the memcache resource [see resource for configuration](../resources/README.md).
| **sid_field**    | yes       | string  |            | name of the field containing the session ID
| **fields**       | no        | object  |            | an object with special field list
| **fields.ip**    | no        | string  |            | name of the field containing the session IP
| **fields.start** | no        | string  |            | name of the field containing the session start time
| **fields.stop**  | no        | string  |            | name of the field containing the session end time (defined with duration and used for expiration control)

#### memcache config sample

```javascript
"session": {
    "backend": {
        "type"      : "memcache",
        "resource"  : "memcache-sample",
        "sid_field" : "token",
        "fields"    : {
            "stop"  : "stopDate"
        }
    }
}
```

### backend using `redis`

This backend type use [redis resource](../resource/redis.md) to persist session context across executions.

#### redis config parameters

| Param            | Mandatory | Type    | default    | Description
|------------------|:---------:|:-------:|------------|---------------
| **type**         | yes       | string  | redis      | Must be `redis` for this backend type
| **resource**     | yes       | string  |            | ID of the redis resource [see resource for configuration](../resources/README.md).
| **sid_field**    | yes       | string  |            | name of the field containing the session ID
| **fields**       | no        | object  |            | an object with special field list
| **fields.ip**    | no        | string  |            | name of the field containing the session IP
| **fields.start** | no        | string  |            | name of the field containing the session start time
| **fields.stop**  | no        | string  |            | name of the field containing the session end time (defined with duration and used for expiration control)

#### redis config sample

```javascript
"session": {
    "backend": {
        "type"      : "redis",
        "resource"  : "redis-sample",
        "sid_field" : "token",
        "fields"    : {
            "stop"  : "stopDate"
        }
    }
}
```