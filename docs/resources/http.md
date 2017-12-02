# SXAPI Resource : http

This resource allow you to interact with a HTTP server. Based on [request SDK 2.79.0](https://github.com/request/request). This resource can be used using ```$app.resources.get('resource-id')``` in your own modules. You can then use one of the [availables methods](#available-methods). http resource also come with [various entrypoints](#available-endpoints) ready to use in your API.

## Resource configuration

### **Config parameters**

-   `_class` **string** Must be http for this resource
-   `url` **string** hostname or IP of the http server to use. If you use you host, don't forget to use the docker0 interface ```# ifconfig docker0``` and not localhost or 127.0.0.1
-   `REQUEST_OPT` **string** any request option. See [full list](https://www.npmjs.com/package/request).

### **Sample sxapi.json**

```javascript
"resources": {
    ...
    "http-sample": {
        "_class": "http",
        "url": "https://adobe.github.io/Spry/data/json/array-02.js",
        "headers": {
          "User-Agent": "request"
        }
    }
    ...
}
```

## Available Methods

### Method call

Execute the HTTP call to the remote server defined in the resource.

#### **Parameters**

-   `url` **string** The HTTP url endpoint to contact
-   `REQUEST_OPT` **string** any request option. See [full list](https://www.npmjs.com/package/request).
-   `callback` **function** Callback function used to handle the answer. If not provided, $htcli.__callDefaultCallback will be used. Callback function must have first parameter set for error boolean and second parameter for result.
    -   `error` **boolean** True if and error occur. Response describe this error
    -   `response` **object, array** Content returned from the http cluster or error message if `error` is true

#### **Sample code**

```javascript
var resource = $app.resources.get('resource-id');
resource.call('http://example.com/json',{timeout: 1500}, function (error, response) {
    console.log(error, response);
});
```
