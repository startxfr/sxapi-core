[![sxapi](https://raw.githubusercontent.com/startxfr/sxapi-core/v0.1.8-npm/docs/assets/logo.svg?sanitize=true)](https://github.com/startxfr/sxapi-core)

# sxapi-core project ![sxapi](https://img.shields.io/badge/latest-v0.1.9-blue.svg)

**sxapi** for **s**imple and e**x**tensible **api** (Application Programming Interface) is an an open-source framework for quickly building simple and small API based on microservice architecture.

Very light (application less than 100Ko, full container stack for less than 30Mo) and configured with a single json file, you can build instantly small atomic API endpoints as well as fully featured enterprise-sized API.

[![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?tag=v0.1.8-npm)](https://travis-ci.org/startxfr/sxapi-core) 
[![npm version](https://badge.fury.io/js/sxapi-core.svg)](https://www.npmjs.com/package/sxapi-core) 
[![npm dependencies](https://david-dm.org/startxfr/sxapi-core.svg)](https://www.npmjs.com/package/sxapi-core) 
[![last commit](https://img.shields.io/github/last-commit/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 
[![licence](https://img.shields.io/github/license/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 

## Getting Started with npm module

The [npm module method](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/USE_npm.md) using the [sxapi-core npm module](https://www.npmjs.com/package/sxapi-core) published in [npm public registry](https://www.npmjs.com) is the best solution if you plan to develop your own component or embed you api into another application. 

For more information on how to run your first sxapi application using sxapi npm module, please read the [npm module user guide](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/USE_npm.md) 

## Getting Started (others methods)

The simplest and fastest way to get a running sxapi application is to use the public docker image. Read the [docker image user guide](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/USE_docker.md)

If you plan to extend sxapi-core, please read the [source code user guide](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/USE_source.md)

## Getting started with npm

### 1. Install nodejs and npm

Theses command are for a Red Hat Linux like environement (Fedora, CentOS, RHEL, Suse). Please adapt ```yum``` command to the ```apt-get``` equivalent if you are using a Debian like system (Ubuntu, Debian)

```bash
sudo yum install -y nodejs npm
```
For more information on how to install and execute a nodejs environment, please see the [official npm install guide](https://docs.npmjs.com/getting-started/installing-node)

### 2. Create your working directory

To run you test in a sandbox, you should isolate your sxapi test from your current work by creating a working directory.
```bash
mkdir ~/test-sxapi
cd ~/test-sxapi
```

### 3. Create your package.json

Use npm command to create your `package.json` file and add sxapi npm module as a dependency. For more information on how to create a npm package, you can read the [npm init documentation](https://docs.npmjs.com/cli/init)

```bash
npm init --force
// answer dynamic questions or type multiple time <enter>
npm install sxapi-core --save
```

### 4. Create your sxapi.json configuration file

Create a file named sxapi.json

```bash
vi ~/test-sxapi/sxapi.json
```

Edit it with the following content

```javascript
{
    "name": "sample-api",
    "description": "my sample api using sxapi-core framework",
    "version": "0.0.0",
    "debug": true,
    "log": {
        "filters": {
            "level": "0,1,2,3,4",
            "type": "debug,info,error,warn"
        }
    },
    "server": {
        "endpoints": [
            {
                "path": "/",
                "body": "<html><head></head><body><h1>My sample API</h1></body></html>"
            }
        ]
    }
}
```

You can change ```name```, ```description```, ```version``` and ```server.endpoints.body``` with personalized content

### 5. Create an application entrypoint

In order to start your application and execute your api, you need to create a
server application file. Default file is index.js when creating package.json.

```bash
vi index.js
```
in you index.js, add the following lines

```javascript
/* global require, process, $log, $timer */
var $app = require("sxapi-core").app;
$app.launch(function () {
    $log.info("application started");
});
```

### 6. Run your application

```bash
node index.js
```

### 7 Explore your api

Connect to ```http://localhost:8080/``` with your favorite navigator. You should
see an html message "My Sample API".


## Creating your own API

sxapi-core come with many components to help you build your own api. As soon as you have an api instance working, you should focus on making change to your ```sxapi.json``` config file and implement api endpoints you want to create.
 
To help you understand how you can configure your api, you can :
1. Visit [sxapi-core official documentation](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/README.md) and read carefully the [configure section](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/2.Configure.md)
2. Visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample) and explore sample config file to help find sample code or ready-to-use config file

## Documentation

If you want to have more information on how to install, develop and run this framework and use it in your project, please read the [full documentation](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/README.md) or our [user guides](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/README.md) and execute the following steps :
1. [Install sxapi framework](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/1.Install.md)
2. [Configure you API](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/2.Configure.md)
3. [Run you application](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/3.Run.md)
4. [Develop sxapi resource](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/4.Develop.md)
5. [Contribute to sxapi project](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/5.Contribute.md)

## Troubleshooting

If you run into difficulties installing or running sxapi, you can [create an issue](https://github.com/startxfr/sxapi-core/issues/new).

## Built With

* [nodejs](https://nodejs.org) - Application server
* [express](http://expressjs.com) - Web framework

## Contributing

Read the [contributing guide](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/guides/5.Contribute.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

This project is mainly developped by the [startx](https://www.startx.fr) dev team. You can see the complete list of contributors who participated in this project by reading [CONTRIBUTORS.md](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/CONTRIBUTORS.md).

## License

This project is licensed under the GPL Version 3 - see the [LICENSE.md](https://github.com/startxfr/sxapi-core/tree/v0.1.8-npm/docs/LICENSE.md) file for details
