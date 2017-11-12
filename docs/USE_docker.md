# USE sxapi with docker

You can use sxapi within a container by using our public 
[official sxapi docker image](https://hub.docker.com/r/startx/sxapi/)

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