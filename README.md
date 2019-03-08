[![sxapi](https://raw.githubusercontent.com/startxfr/sxapi-core/v0.2.99-docker/docs/assets/logo.svg?sanitize=true)](https://github.com/startxfr/sxapi-core)

# sxapi-core project ![sxapi](https://img.shields.io/badge/latest-v0.2.99-blue.svg)

**sxapi** for **s**imple and e**x**tensible **api** (Application Programming Interface) is an an open-source framework for quickly building simple and small API based on microservice architecture.

Very light (application less than 100Ko, full container stack for less than 30Mo) and configured with a single json file, you can build instantly small atomic API endpoints as well as fully featured enterprise-sized API.

[![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?tag=v0.2.99-docker)](https://travis-ci.org/startxfr/sxapi-core) 
[![docker build](https://img.shields.io/docker/build/startx/sxapi.svg)](https://hub.docker.com/r/startx/sxapi/) 
[![last commit](https://img.shields.io/github/last-commit/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 
[![licence](https://img.shields.io/github/license/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 

## Getting Started with docker

For more information on how to run your first sxapi application using sxapi docker image, please read the [docker image user guide](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/USE_docker.md)

## Getting Started (others methods)

If you want to use this project as a npm module in your nodejs source code you can read the [npm module user guide](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/USE_npm.md)

If you plan to extend sxapi-core, please read the [source code user guide](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/USE_source.md)


## Getting started with docker

### 1. Install and start docker

Theses command are for a Red Hat Linux like environement (Fedora, CentOS, RHEL, Suse). Please adapt ```yum``` command to the ```apt-get``` equivalent if you are using a Debian like system (Ubuntu, Debian)

```bash
sudo yum install -y docker
sudo service docker start
```
For more information on how to install and execute a docker runtime, please see the [official docker installation guide](https://docs.docker.com/engine/installation/)

After installation, pay attention to your user authorisation. Your current user must interact with the docker daemon.

### 2. Create your working directory

To run you test in a sandbox, you should isolate your sxapi test from your current work by creating a working directory.
```bash
mkdir ~/test-sxapi
cd ~/test-sxapi
```

### 3. Get the sxapi container image

Use docker command to get sxapi container image from the docker hub registry. This will update your local docker image cache.

```bash
docker pull startx/sxapi:latest
```

### 4. Create your sxapi.yml configuration file

Create a file named sxapi.yml

```bash
vi ~/test-sxapi/sxapi.yml
```

Edit it with the following content

```yaml
name: sample-api
description: my sample api using sxapi-core framework
version: 0.0.0
debug: true
log:
  filters:
    level: '0,1,2,3,4'
    type: debug,info,error,warn
server:
  endpoints:
  - path: "/"
    body: "<html><head></head><body><h1>My sample API</h1></body></html>"

```

You can change ```name```, ```description```, ```version``` and ```server.endpoints.body``` with personalized content

### 5. Run your application

```bash
docker run -d -p 8080:8080 -v ~/test-sxapi/sxapi.yml:/conf/sxapi.yml:ro startx/sxapi
```

### 6. Explore your api

Connect to ```http://localhost:8080/``` with your favorite navigator. You should
see an html message "My Sample API".


## Creating your own API

sxapi-core come with many components to help you build your own api. As soon as you have an api instance working, you should focus on making change to your `sxapi.yml` config file and implement api endpoints you want to create. 
To help you understand how you can configure your api, you can :
1. Visit [sxapi-core official documentation](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/README.md) and read carefully the [configure section](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/2.Configure.md)
2. Visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample) and explore sample config file to help find sample code or ready-to-use config file

## Documentation

If you want to have more information on how to install, develop and run this framework and use it in your project, please read the [full documentation](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/README.md) or our [user guides](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/README.md) and execute the following steps :
1. [Install sxapi framework](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/1.Install.md)
2. [Configure you API](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/2.Configure.md)
3. [Run you application](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/3.Run.md)
4. [Develop sxapi resource](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/4.Develop.md)
5. [Contribute to sxapi project](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/5.Contribute.md)

## Troubleshooting

If you run into difficulties installing or running sxapi, you can [create an issue](https://github.com/startxfr/sxapi-core/issues/new).

## Built With

* [docker](https://www.docker.com/) - Container plateform
* [alpine](https://alpinelinux.org/) - OS envelop
* [nodejs](https://nodejs.org) - Application server
* [express](http://expressjs.com) - Web framework

## Contributing

Read the [contributing guide](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/guides/5.Contribute.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

This project is mainly developped by the [startx](https://www.startx.fr) dev team. You can see the complete list of contributors who participated in this project by reading [CONTRIBUTORS.md](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/CONTRIBUTORS.md).

## License

This project is licensed under the GPL Version 3 - see the [LICENSE.md](https://github.com/startxfr/sxapi-core/tree/v0.2.99-docker/docs/LICENSE.md) file for details
