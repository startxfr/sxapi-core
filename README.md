SXAPI Core
==========

[![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?branch=testing)](https://travis-ci.org/startxfr/sxapi-core)

***SXAPI*** for Simple and eXtensible Application Programming Interface 
It's an open-source framework for quickly building simple and small microservices API.


Getting Started
---------------

Open a shell terminal and type the following command
```bash
mkdir test
cd test
npm install sxapi-core
vi test.js
```

In your editor, write this sample code
```javascript
var sxapi = require("sxapi-core");

sxapi.app.launch(function () {
    sxapi.app.log.info("application started", sxapi.app.timer.time('app'));
});
```

Then execute your application with
```bash
node test.js
```

You will see some logging and applicaiton exposed on http:localhost:8080


### Troubleshooting

If you run into difficulties installing or running sxapi, please report [issue for installer](https://github.com/startxfr/sxapi-installer/issues/new) or  [issue for sxapi](https://github.com/startxfr/sxapi-core/issues/new).

License
-------

SXAPI is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).