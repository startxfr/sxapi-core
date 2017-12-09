<img align="right" height="70" src="https://raw.githubusercontent.com/startxfr/sxapi-core/dev/docs/assets/logo.svg?sanitize=true">

# SXAPI Documentation

This is the main documentation for the sxapi-core project. For more information you can visit the [sxapi-core project page](https://github.com/startxfr/sxapi-core/).

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

## API documentation

### Core components

Core components are all loaded and available when the application start. You can find usefull informations in [core component documentation](core/README.md)
- [tools](core/tools.md) core component
- [timer](core/timer.md) core component
- [log](core/log.md) core component
- [resource](core/resource.md) core component
- [session](core/session.md) core component
- [web server](core/ws.md) core component
- [application](core/app.md) core component

### Resources components

Resource components are loaded if defined in the configuration profile. You can find usefull informations in [resource documentation](resources/README.md)
- [aws_s3](resources/aws_s3.md) resource : Interact with an Amazon WebService S3 backend
- [aws_sqs(resources/aws_sqs.md) resource : Interact with an Amazon WebService SQS backend
- [couchbase](resources/couchbase.md) resource : Interact with a Couchbase cluster
- [google](resources/google.md) resource : Interact with Google API backend
- [http](resources/http.md) resource : Interact with any http webserver
- [mysql](resources/mysql.md) resource : Interact with a mysql or mariadb server
- [redis](resources/redis.md) resource : Interact with a redis backend
- [serviceinfo](resources/serviceinfo.md) resource : Access application details

## Contributing

Read the [contributing guide](guides/5.Contribute.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

This project is mainly developped by the [startx](https://www.startx.fr) dev team. You can see the complete list of contributors who participated in this project by reading [CONTRIBUTORS.md](CONTRIBUTORS.md).

## License

This project is licensed under the GPL Version 3 - see the [LICENSE.md](LICENSE.md) file for details
