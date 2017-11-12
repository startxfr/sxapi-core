SXAPI Core
==========

[![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?branch=v0.0.18-npm)](https://travis-ci.org/startxfr/sxapi-core)

***SXAPI*** for Simple and eXtensible Application Programming Interface 
It's an open-source framework for quickly building simple and small 
microservices API.


Getting Started
---------------

sxapi-core is delivered in 2 ways :

### Container version

You can use sxapi within a container by using our public 
[official sxapi docker image](https://hub.docker.com/r/startx/sxapi/)

1. Get the last version of sxapi container from docker hub registry
```bash
docker pull startx/sxapi:latest
```

2. Run your sample application
```bash
docker run startx/sxapi
```

3. Connect to ```http://localhost:8080``` with your favorite navigator

For more information on how to use this project as a container, 
see [use docker image](docs/USE_docker.md)


### NPM version

You can use sxapi with our 
[official sxapi NPM module](https://www.npmjs.com/package/sxapi-core)

1. Create your working environment
```bash
mkdir test
cd test
npm install sxapi-core
```

2. Create a file named app.js and add the following lines
```javascript
var sxapi = require("sxapi-core");
sxapi.app.launch(function () {
    sxapi.app.log.info("application started", sxapi.app.timer.time('app'));
});
```

3. Start your application
```bash
node app.js
```

4. Connect to ```http://localhost:8080``` with your favorite navigator


For more information on how to use this project as a npm module, see 
[use npm module](docs/USE_npm.md)


Creating your own API
---------------------

sxapi-core come with many components to help you build extensible api by using a 
single json config file. As soon as you have an api instance working, you should 
focus on making change to your ```sxapi.json``` config file and implement api 
endpoints you want to create. 

You must :
1. Visit [sxapi-core official documentation](docs/README.md) and read carefully
the develop section
2. Visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample) and
explore sample config file to help find sample code or ready-to-use config file


Documentation 
-------------

If you want to have more information on how to install, develop and run this
framework and use it in your project, please read the 
[sxapi official documentation](docs/README.md) with the following 
sections :
1. [Install sxapi](docs/1.Install.md)
2. [Configure sxapi](docs/2.Configure.md)
3. [Run sxapi](docs/3.Run.md)
4. [Develop sxapi resource](docs/4.Develop.md)


Troubleshooting
---------------

If you run into difficulties installing or running sxapi, please report 
[issue for installer](https://github.com/startxfr/sxapi-installer/issues/new) or  
[issue for sxapi](https://github.com/startxfr/sxapi-core/issues/new).

License
-------

SXAPI is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).