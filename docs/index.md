<img style="margin-bottom:20px" align="center" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/testing/docs/assets/logo.svg?sanitize=true">

# SXAPI Documentation

![sxapi-core](https://img.shields.io/badge/latest-v0.3.66-blue.svg) 
[![last commit](https://img.shields.io/github/last-commit/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core)
[![licence](https://img.shields.io/github/license/startxfr/sxapi-core.svg)](https://github.com/startxfr/sxapi-core)
[![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?branch=testing)](https://travis-ci.org/startxfr/sxapi-core)
[![docker build](https://img.shields.io/docker/build/startx/sxapi.svg)](https://hub.docker.com/r/startx/sxapi/)
[![npm version](https://badge.fury.io/js/sxapi-core.svg)](https://www.npmjs.com/package/sxapi-core)

This is the main documentation for the sxapi-core project. For more information you can visit the [sxapi-core github project](https://github.com/startxfr/sxapi-core/).

## the sxapi project

**sxapi** for **s**imple and e**x**tensible **api** (Application Programming Interface) is an an open-source framework for quickly building simple and small API based on microservice architecture.

Very light (application less than 100Ko, full container stack for less than 30Mo) and configured with a single json file, you can build instantly small atomic API endpoints as well as fully featured enterprise-sized API.

## Getting started User guides

sxapi could be used in 3 ways : container, npm module or from source code. You will find a user guide for each one of these usage in the following sections :

- [Docker image user guide](guides/USE_docker.md)
- [NPM module user guide](guides/USE_npm.md)
- [Source code user guide](guides/USE_source.md)

## Step by step guides

1. Install you sxapi with the [installation guide](guides/1.Install.md)
2. Configure your own API following the [configuration guide](guides/2.Configure.md)
3. Execute your application using the [running application guide](guides/3.Run.md)
4. Extend application capacity with the [developping guide](guides/4.Develop.md)
5. Participate to this open-source project according to the [contributing guide](guides/5.Contribute.md)
6. Execute application using the [sxapi operator guide](guides/6.Operator.md)

## API documentation

### Core components

Core components are all loaded and available when the application start. You can find usefull informations in [core component documentation](core/index.md)

- [tools](core/tools.md) core component
- [timer](core/timer.md) core component
- [log](core/log.md) core component
- [resource](core/resource.md) core component
- [session](core/session.md) core component
- [web server](core/ws.md) core component
- [bot](core/bot.md) bot component
- [application](core/app.md) core component

### Resources components

Resource components are loaded if defined in the configuration profile. You can find usefull informations in [resource documentation](resources/index.md)

- [aws_s3](resources/aws_s3.md) resource : Interact with an Amazon WebService S3 backend
- [aws_sqs](resources/aws_sqs.md) resource : Interact with an Amazon WebService SQS backend
- [aws_dynamodb](resources/aws_dynamodb.md) resource : Interact with an Amazon WebService DynamoDB backend
- [couchbase](resources/couchbase.md) resource : Interact with a Couchbase cluster
- [google](resources/google.md) resource : Interact with Google API backend
- [http](resources/http.md) resource : Interact with any http webserver
- [mysql](resources/mysql.md) resource : Interact with a mysql or mariadb server
- [postgres](resources/postgres.md) resource : Interact with a PostgresQL server
- [redis](resources/redis.md) resource : Interact with a redis backend
- [memcache](resources/memcache.md) resource : Interact with a memcache server
- [serviceinfo](resources/serviceinfo.md) resource : Access application details
- [swagger](resources/swagger.md) resource : Return swagger manifests
- [localfs](resources/localfs.md) resource : Interact with a the application host (or container) local file-system
- [twitter](resources/twitter.md) resource : Interact with the twitter API and receive tweet streams

## Contributing

Read the [contributing guide](guides/5.Contribute.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

This project is mainly developped by the [startx](https://www.startx.fr) dev team. You can see the complete list of contributors who participated in this project by reading [contributors.md](contributors.md).

## License

This project is licensed under the GPL Version 3 - see the [LICENCE](../LICENCE) file for details
