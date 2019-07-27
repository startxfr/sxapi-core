[![sxapi](https://raw.githubusercontent.com/startxfr/sxapi-core/testing/docs/assets/logo.svg?sanitize=true)](https://github.com/startxfr/sxapi-core)

# sxapi-core project ![sxapi](https://img.shields.io/badge/latest-v0.3.15-blue.svg)

**sxapi** for **s**imple and e**x**tensible **api** (Application Programming Interface) is an an open-source framework for quickly building simple and small API based on microservice architecture.

Very light (application less than 100Ko, full container stack for less than 30Mo) and configured with a single json file, you can build instantly small atomic API endpoints as well as fully featured enterprise-sized API.

[![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?branch=testing)](https://travis-ci.org/startxfr/sxapi-core) 
[![docker build](https://img.shields.io/docker/build/startx/sxapi.svg)](https://hub.docker.com/r/startx/sxapi/) 
[![npm version](https://badge.fury.io/js/sxapi-core.svg)](https://www.npmjs.com/package/sxapi-core) 
[![npm dependencies](https://david-dm.org/startxfr/sxapi-core.svg)](https://www.npmjs.com/package/sxapi-core) 
[![last commit](https://img.shields.io/github/last-commit/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 
[![licence](https://img.shields.io/github/license/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core) 

## Getting Started

- [container image](https://hub.docker.com/r/startx/sxapi) published in dockerhub public registry
The simplest and fastest way to get a running sxapi application is to use the public docker image. For more information on how to run your first sxapi application using sxapi docker image, please read the [docker image user guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/USE_docker.md)
- [npm module](https://www.npmjs.com/package/sxapi-core) published in npm public database
If you plan to develop your own component or embed you api into another application, you should be more interested by the npm method. For more information on how to run your first sxapi application using sxapi npm module, please read the [npm module user guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/USE_npm.md)
- [source code](https://github.com/startxfr/sxapi-core/tree/testing) published in github
If you plan to extend sxapi capabilities with your own component, change default software design, extend core functinalities or more globaly improve this application, please read the [source code user guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/USE_source.md)

## Want to try ?

- [Docker user guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/USE_docker.md)
- [NodJS user guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/USE_npm.md)
- [Source code user guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/USE_source.md)

You can also use the examples templates designed for openshift to deploy  a
[simple app (../../api-examples/simple/openshift-template-simple.yml), a
[bot daemon (../../api-examples/bot/openshift-template-bot.yml) or a
[full application (../../api-examples/full/openshift-template-full.yml) 

## Creating your own API

sxapi-core come with many components to help you build your own api. As soon as you have an api instance working, you should focus on making change to your `sxapi.yml` config file and implement api endpoints you want to create. 
To help you understand how you can configure your api, you can :
1. Visit [sxapi-core official documentation](https://github.com/startxfr/sxapi-core/tree/testing/docs/README.md) and read carefully the [configure section](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/2.Configure.md)
2. Visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample) and explore sample config file to help find sample code or ready-to-use config file

## Documentation

If you want to have more information on how to install, develop and run this framework and use it in your project, please read the [full documentation](https://github.com/startxfr/sxapi-core/tree/testing/docs/README.md) or our [user guides](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/README.md) and execute the following steps :
1. [Install sxapi framework](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/1.Install.md)
2. [Configure you API](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/2.Configure.md)
3. [Run you application](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/3.Run.md)
4. [Develop sxapi resource](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/4.Develop.md)
5. [Contribute to sxapi project](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/5.Contribute.md)

## Release notes

If you want to have more information on a minor release, [read released notes](docs/RELEASES.md)

| Release  | Date       |  Description
|----------|------------|-------------
| 0.3.15   | 2019-07-27 | Latest release (read released notes)
| 0.3      | 2019-03-08 | Moving config to yaml syntax
| 0.2      | 2018-03-18 | Adding bot behavior, event messaging and containerized images
| 0.1      | 2018-01-20 | Adding all resources, session and websockets
| beta     | 2016-10-29 | micro api componement with log and lightweight webserver

## Troubleshooting

If you run into difficulties installing or running sxapi, you can [create an issue](https://github.com/startxfr/sxapi-core/issues/new).

## Built With

* [docker](https://www.docker.com/) - Container plateform
* [alpine](https://alpinelinux.org/) - OS envelop
* [nodejs](https://nodejs.org) - Application server
* [express](http://expressjs.com) - Web framework

## Contributing

Read the [contributing guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/5.Contribute.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

This project is mainly developped by the [startx](https://www.startx.fr) dev team. You can see the complete list of contributors who participated in this project by reading [CONTRIBUTORS.md](https://github.com/startxfr/sxapi-core/tree/testing/docs/CONTRIBUTORS.md).

## License

This project is licensed under the GPL Version 3 - see the [LICENSE.md](https://github.com/startxfr/sxapi-core/tree/testing/docs/LICENSE.md) file for details
