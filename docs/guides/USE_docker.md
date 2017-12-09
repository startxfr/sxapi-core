[![sxapi](https://raw.githubusercontent.com/startxfr/sxapi-core/dev/docs/assets/logo.svg?sanitize=true)](https://github.com/startxfr/sxapi-core)

# USE sxapi with docker

You can use sxapi within a container by using our public 
[official sxapi docker image](https://hub.docker.com/r/startx/sxapi/)


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














































### Container with default configuration

1. Get the last version of sxapi container from docker hub registry
```bash
docker pull startx/sxapi:latest
```

2. Run your sample application
```bash
// run on port 8080 and attach console
docker run startx/sxapi
// or run in detached mode and expose port 81
docker run -d -p 81:8080 startx/sxapi
```

3. Connect to ```http://localhost:8080``` or ```http://localhost:81``` 
with your favorite navigator


### Container with your own configuration (docker)

The purpose of sxapi is to help you build your own api microservice. 
when using our container version, you can follow these step :

1. Get the last version of sxapi container from docker hub registry
```bash
docker pull startx/sxapi:latest
```

2. Create a file named sxapi.json and edit it with the following content
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

3. Run your application
```bash
docker run -d -p 8080:8080 -v $(pwd)/sxapi.json:/conf/sxapi.json:ro startx/sxapi
```

4. Connect to ```http://localhost:8080``` with your favorite navigator


### Container with your own configuration (docker-compose)

If you use docker-compose, you can use the following docker-compose.yml 
sample file
```yaml
api:
  image: startx/sxapi:latest
  container_name: "my-api"
  ports:
    - "8080:8080"
  volumes:
  - "./sxapi-test.json:/conf/sxapi.json:ro"
```

1. Create your ```docker-compose.yml``` file with the previous content

2. Create a file named sxapi.json and edit it with the following content
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

3. Run your application
```bash
docker-compose up
```

4. Connect to ```http://localhost:8080``` with your favorite navigator