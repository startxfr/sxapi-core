<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.3.51-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : application 

The application component is the main [core component](./README.md) creating the application object.<br> 

## Configuration

To configure your application, you should follow the [configuration user guide](../guides/2.Configure.md), 

### Loading sequence

1. Load [tools library](tools.md) 
2. Load [timer component](timer.md) and expose it as global `$timer`
3. Load [log component](log.md)  and expose it as global `$log`. Configuration is empty at this step.
4. Construct main [application](app.md) `$app` object
   1. alias global `$timer` to `$app.timer`
   2. alias global `$log` to `$app.log`
5. Load [resource manager](resource.md) in  `$app.resources`
6. Load [session manager](session.md) in  `$app.session`
7. Load [web server manager](ws.md) in  `$app.ws`


### Launch sequence

1. Init application
   1. init process signals for catching process signals
   2. check environments variables 
   3. load config profile from environement variable `SXAPI_CONF` or `sxapi.yml`
   4. [init resources manager](resource.md#init)
      1. load each resource declared in config profile
      2. init each resource declared in config profile
   5. [init session manager](session.md#init)
   6. [init web server manager](ws.md#init)
2. Start application
   1. [start resources manager](resource.md#start)
   2. [start session manager](session.md#start)
   3. [start web server manager](ws.md#start)
3. Execute callback function 
