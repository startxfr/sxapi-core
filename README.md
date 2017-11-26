# sxapi-core project

**sxapi** for **s**imple and e**x**tensible **api** 
(Application Programming Interface) is an an open-source framework for 
quickly building simple and small API based on microservice architecture.

Very light (application less than 100Ko, full container stack for less than 30Mo)
and configured with a single json file, you can build instantly small atomic
API endpoints as well as fully featured enterprise-sized API.

[![npm version](https://badge.fury.io/js/sxapi-core.svg)](https://www.npmjs.com/package/sxapi-core) 
[![npm dependencies](https://david-dm.org/startxfr/sxapi-core.svg)](https://www.npmjs.com/package/sxapi-core) 
[![last commit](https://img.shields.io/github/last-commit/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 
[![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?branch=dev)](https://travis-ci.org/startxfr/sxapi-core) 
[![docker build](https://img.shields.io/docker/build/startx/sxapi.svg)](https://hub.docker.com/r/startx/sxapi/) 
[![licence](https://img.shields.io/github/license/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 

## Getting Started

sxapi is shipped in 3 ways : 
- [container image](https://hub.docker.com/r/startx/sxapi) published in dockerhub public registry
The simplest and fastest way to get a running sxapi application is to use the
public docker image. For more information on how to run your first sxapi 
application using sxapi docker image, please read the 
[Using docker image user guide](docs/guides/USE_docker.md)
- [npm module](https://www.npmjs.com/package/sxapi-core) published in npm public database
If you plan to develop your own component or embed you api into another 
application, you should be more interested by the npm method. For more 
information on how to run your first sxapi application using sxapi npm module, 
please read the [Using nm module user guide](docs/guides/USE_npm.md)
- [source code](https://github.com/startxfr/sxapi-core/tree/dev) published in github
If you plan to extend sxapi capabilities with your own component, change 
default software design, extend core functinalities or more globaly improve
this application, please read the [Using source code user guide](docs/guides/USE_source.md)

## Want to try ?

To try this application before working on it, the easiest way 
is to use the container version. Follow theses steps to run
a sxapi application within the next couple of minutes. 
(You can skip the first step if you already have [docker](https://www.docker.com)
installed and running)

### 1. Install and start docker

Theses command are for a Red Hat Linux like
environement (Fedora, CentOS, RHEL, Suse). Please adapt ```yum``` command to the 
```apt-get``` equivalent if you are using a Debian like system (Ubuntu, Debian)

```bash
sudo yum install -y docker
sudo service docker start
```
For more information on how to install and execute a docker runtime, please see
the [official docker installation guide](https://docs.docker.com/engine/installation/)
After installation, pay attention to your user authorisation. Your current user
must interact with the docker daemon.

### 2. Create your working directory

To run you test in a sandbox, you should isolate your sxapi test from 
your current work by creating a working directory.
```bash
mkdir ~/test-sxapi
cd ~/test-sxapi
```

### 3. Get the sxapi container image

Use docker command to get sxapi container image from the docker hub registry. 
This will update your local docker image cache.

```bash
docker pull startx/sxapi:latest
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

You can change ```name```, ```description```, ```version``` and 
```server.endpoints.body``` with personalized content

### 5. Run your application

```bash
docker run -d -p 8080:8080 -v ~/test-sxapi/sxapi.json:/conf/sxapi.json:ro startx/sxapi
```

### 6. Explore your api

Connect to ```http://localhost:8080/``` with your favorite navigator. You should
see an html message "My Sample API".


## Creating your own API

sxapi-core come with many components to help you build your own api. As soon as 
you have an api instance working, you should focus on making change to your 
```sxapi.json``` config file and implement api endpoints you want to create. 
To help you understand how you can configure your api, you can :
1. Visit [sxapi-core official documentation](docs/README.md) and read carefully
the develop section
2. Visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample) and
explore sample config file to help find sample code or ready-to-use config file

For more information on how to use this project as a container, 
see [use docker image](docs/guides/USE_docker.md)

For more information on how to change your configuration file and create an API
relflecting your needs, please read carefully our 
[building api user guide](docs/guides/xxxxxxxxxxxxxx.md)

## Documentation

If you want to have more information on how to install, develop and run this
framework and use it in your project, please read the 
[full documentation](docs/README.md) or our [user guides](docs/guides/)
sections :
1. [Install sxapi](docs/guides/1.Install.md)
2. [Configure sxapi](docs/guides/2.Configure.md)
3. [Run sxapi](docs/guides/3.Run.md)
4. [Develop sxapi resource](docs/guides/4.Develop.md)

## Troubleshooting

If you run into difficulties installing or running sxapi, please 
report [issue for installer](https://github.com/startxfr/sxapi-installer/issues/new) 
or [issue for sxapi](https://github.com/startxfr/sxapi-core/issues/new).

## Built With

* [docker](https://www.docker.com/) - Container plateform
* [alpine](https://alpinelinux.org/) - OS envelop
* [nodejs](https://nodejs.org) - Application server
* [express](http://expressjs.com) - Web framework

## Contributing

Please read [contributing guide](docs/guides/CONTRIBUTING.md) for details on 
our code of conduct, and the process for submitting pull requests to us.

## Authors

This project is mainly developped by the [startx](https://www.startx.fr) dev team.
You can see the complete list of contributors who participated in this project
by reading [CONTRIBUTORS.md](docs/CONTRIBUTORS.md).

## License

This project is licensed under the GPL Version 3 - 
see the [LICENSE.md](docs/LICENSE.md) file for details

