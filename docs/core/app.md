<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.0.60-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : application 

The application component is the main [core component](./README.md) creating the application object.<br> 

## Configuration

To configure your application, you should follow the [configuration user guide](../guides/2.Configure.md), 

### Loading sequence

1. Load [tools library](tools.md) 
2. Load [timer component](timer.md) as global `$timer`
3. Load [log component](log.md) as global `$log`. Configuration is empty at this step.
4. Construct main [application](app.md) `$app` object
   1. alias global `$timer` to `$app.timer`
   2. alias global `$log` to `$app.log`
5. Load [resource component](resource.md) in  `$app.resources`
6. Load [session component](session.md) in  `$app.session`
7. Load [web server component](ws.md) in  `$app.ws`


### Launch sequence

1. Init application
   1. init process signals for catching process signals
   2. check environments variables 
   3. load config profile from environement variable `SXAPI_CONF` or `sxapi.json`
   4. init resources
      1. load each resource declared in config profile
      2. init each resource declared in config profile
   5. init session
   6. init web server
2. Start application
   1. start resources
   2. start session
   3. start web server
3. Execute callback function 
