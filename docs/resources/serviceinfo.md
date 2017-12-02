# SXAPI Resource : serviceinfo

This resource allow you to get information about the running service. 
This resource can be used using ```javascript require('/app/core/resource').get('resource-id')``` in your own modules. 

## Resource configuration

### **Config parameters**

-   `class` **string** Must be serviceinfo for this resource

### **Sample sxapi.json**

```json
"resources": {
    ...
    "serviceinfo-sample": {
        "_class": "serviceinfo"
    }
    ...
}
```

## Available Methods

### Method read

Execute the HTTP call to the remote server defined in the resource.

#### **Parameters**

-   `callback` **function** Callback function used to handle the answer. If not provided, $htcli.__callDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the serviceinfo cluster or error message if `error` is true

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.read(function (error, response) {
    console.log(error, response);
});
```

### Method info

Get informations about the running service

#### **Parameters**

''no parameters''

#### **Sample code**

```javascript
var resource = require('/app/core/resource').get('resource-id');
resource.info(function (error, response) {
    console.log(error, response);
});
```