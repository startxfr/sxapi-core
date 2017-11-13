# sxapi-core project

Build status : [![Build Status](https://travis-ci.org/startxfr/sxapi-core.svg?branch=dev)](https://travis-ci.org/startxfr/sxapi-core)

***sxapi*** for ***s***imple and e***x***tensible ***api*** 
(Application Programming Interface) is an an open-source framework for 
quickly building simple and small API based on microservice architecture.

Very light (application less than 100Ko, full container stack for less than 30Mo)
and configured with a single json file, you can build instantly small atomic
API endpoints as well as big enterprise sized API.

## Getting Started

sxapi is shipped in 3 ways : 
- a container image published in dockerhub public registry ([see project page](https://hub.docker.com/r/startx/sxapi/))
- a npm module published in npm public database ([see project page](https://www.npmjs.com/package/sxapi-core))
- as a source code published in github ([see project page](https://github.com/startxfr/sxapi-core/tree/dev))

The simplest and fastest way to get a running sxapi application is to use the
public docker image. For more information on how to run your first sxapi 
application using sxapi docker image, please read the 
[Using docker image user guide](docs2/guides/USE_docker.md)

If you plan to develop your own component or embed you api into another 
application, you should be more interested by the npm method. For more 
information on how to run your first sxapi application using sxapi npm module, 
please read the [Using nm module user guide](docs2/guides/USE_npm.md)

If you plan to extend sxapi capabilities with your own component, change 
default software design, extend core functinalities or more globaly improve
this application, please read the [Using source code user guide](docs2/guides/USE_source.md)

## Want to try ?

If you simply want to try this application before working on it, the best way 
is to use the container version. If you follow these steps, you will run
a sxapi application within the next couple of minutes. 

You can skip the first step if you already have a live docker daemon.

1. Install and run docker runtime. Theses command are for a Red Hat Linux like
environement (Fedora, CentOS, RHEL, Suse). Please adapt ```yum``` command to the 
```apt-get``` equivalent if you are using a Debian like system (Ubuntu, Debian)
```bash
sudo yum install -y docker
sudo service docker start
```
For more information on how to install and execute a docker runtime, please see
the [official docker installation guide](https://docs.docker.com/engine/installation/)
Please be sure that your user can interact with the docker daemon. The next 
docker command require your user to interact with the docker daemon and have the
proper right to start and stop a container.

2. Create your local developpement environement and isolate your sxapi test from 
your current work.
```bash
mkdir ~/test-sxapi
cd ~/test-sxapi
```

3. Get the last version of sxapi container from docker hub registry and update
your local docker image cache
```bash
docker pull startx/sxapi:latest
```

4. Create a file named sxapi.json
```bash
vi ~/test-sxapi/sxapi.json
```

edit it with the following content

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

5. Run your application
```bash
docker run -d -p 8080:8080 -v ~/test-sxapi/sxapi.json:/conf/sxapi.json:ro startx/sxapi
```

6. Connect to ```http://localhost:8080``` with your favorite navigator

For more information on how to use this project as a container, 
see [use docker image](docs2/guides/USE_docker.md)

For more information on how to change your configuration file and create an API
relflecting your needs, please read carefully 
[use docker image](docs2/guides/USE_docker.md)


## Creating your own API

sxapi-core come with many components to help you build extensible api by using a 
single json config file. As soon as you have an api instance working, you should 
focus on making change to your ```sxapi.json``` config file and implement api 
endpoints you want to create. 

You must :
1. Visit [sxapi-core official documentation](docs/README.md) and read carefully
the develop section
2. Visit [sxapi-sample project](https://github.com/startxfr/sxapi-sample) and
explore sample config file to help find sample code or ready-to-use config file

## Documentation

If you want to have more information on how to install, develop and run this
framework and use it in your project, please read the 
[sxapi official documentation](docs/README.md) with the following 
sections :
1. [Install sxapi](docs/1.Install.md)
2. [Configure sxapi](docs/2.Configure.md)
3. [Run sxapi](docs/3.Run.md)
4. [Develop sxapi resource](docs/4.Develop.md)

## Troubleshooting

If you run into difficulties installing or running sxapi, please report 
[issue for installer](https://github.com/startxfr/sxapi-installer/issues/new) or  
[issue for sxapi](https://github.com/startxfr/sxapi-core/issues/new).


## Built With

* [docker](https://www.docker.com/) - Container plateform
* [alpine](https://alpinelinux.org/) - OS envelop
* [nodejs](https://nodejs.org) - Application server
* [express](http://expressjs.com) - Web framework

## Contributing

Please read [contributing guide](docs2/guides/CONTRIBUTING.md) for details on 
our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Startx dev** - [startxfr](https://github.com/startxfr)
* **Meyer A Dev** - [startxfr](https://github.com/meyeradev)
* **Mallowtek** - [startxfr](https://github.com/mallowtek)
* **Milobe** - [startxfr](https://github.com/Milobe)

See also the list of [contributors](docs2/CONTRIBUTORS.md) who participated 
in this project.

## License

This project is licensed under the GPL Version 3 - see the [LICENSE.md](LICENSE.md) 
file for details

