# SXAPI Resource : insee

This resource allow you to get information about french company and manipulate french legal business numbers such as VAT code, SIREN or SIRET and also get company informations form opendata french state api.
Programmers can access [resource methods](#resource-methods) and embed this module
methods into there own method and endpoints.
API developpers can use [resource endpoints](#resource-endpoints) into there
[configuration profile](../guides/2.Configure.md) to expose insee data.

This resource is based on [nodejs core](https://nodejs.org/en/docs/) 
[![node](https://img.shields.io/badge/node-v3.1.0-blue.svg)](https://nodejs.org/en/docs/) 
and is part of the [sxapi-core engine](https://github.com/startxfr/sxapi-core) 
until [![sxapi](https://img.shields.io/badge/sxapi-v1.0.2-blue.svg)](https://github.com/startxfr/sxapi-core).

- [Resource configuration](#resource-configuration)<br>
- [Resource methods](#resource-methods)<br>
- [Resource endpoints](#resource-endpoints)

## Resource configuration

To configure this resource, you must add a config key under the `resources`
section of your configuration profile. 
This key must be a unique string and will be considered as the resource id. The value 
must be an object who must have the [appropriate configuration parameters](#resource-config-parameters).

For a better understanting of the sxapi
configuration profile, please refer to the [configuration guide](../guides/2.Configure.md)


### Resource config parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **_class**      | yes       | string |         | module name. Must be **insee** for this resource
| **siren2tva**   | no        | object |         | specific configuration for the siren2sxa module

### Example

This is a sample configuration of this resource. You must add this section under 
the `resources` section of your [configuration profile](../guides/2.Configure.md)

```yaml
resources:
  insee-id:
    _class: insee
```

## Resource methods

If you want to use this resource in our own module, you can retrieve this resource 
instance by using `$app.resources.get('insee-id')` where `insee-id` is the
id of your resource as defined in the [resource configuration](#resource-configuration). 

This module come with one single method.

[1. Read method](#method-read)
[2. convertSiret2Tva method](#method-convertsiret2tva)
[3. convertSiren2Tva method](#method-convertsiren2tva)
[4. convertTva2Siren method](#method-converttva2siren)
[5. isSIRET method](#method-issiret)
[6. isSIREN method](#method-issiren)
[7. isTVA method](#method-istva)


### Method read

Read informations for a company and return a detailled object

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **siren**                    | yes       | string   |         | The SIREN, SIRET or VAT number to find
| **callback**                 | no        | function | default | callback function called when application get result.<br>If not defined, dropped to a default function who output information to the debug console
| callback(**error**,response) | N/A       | mixed    | null    | will be false or null if no error returned from the application. Will be a string message describing a problem if an error occur.
| callback(error,**response**) | N/A       | mixed    |         | the application object (if no error)


#### Example

```javascript
var resource = $app.resources.get('insee-id');
resource.read(sirenCode,function (error, company) {
    console.log(error, company);
});
```

### Method convertSiret2Tva

Convert a SIRET into a TVA number

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **siret**                    | yes       | string   |         | The SIRET to convert


#### Example

```javascript
var resource = $app.resources.get('insee-id');
var tva = resource.convertSiret2Tva(siret);
```

### Method convertSiren2Tva

Convert a SIREN into a TVA number

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **siren**                    | yes       | string   |         | The SIREN to convert


#### Example

```javascript
var resource = $app.resources.get('insee-id');
var tva = resource.convertSiren2Tva(siren);
```

### Method convertTva2Siren

Convert a VAT number into a SIREN

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **tva**                      | yes       | string   |         | The VAT to convert


#### Example

```javascript
var resource = $app.resources.get('insee-id');
var siren = resource.convertTva2Siren(tva);
```

### Method isSIRET

Test if a number is a  good SIRET

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **siret**                    | yes       | string   |         | The SIRET to test


#### Example

```javascript
var resource = $app.resources.get('insee-id');
resource.isSIRET(siret);
```

### Method isSIREN

Test if a number is a  good SIREN

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **siren**                    | yes       | string   |         | The SIREN to test


#### Example

```javascript
var resource = $app.resources.get('insee-id');
resource.isSIREN(siren);
```


### Method isTVA

Test if a number is a  good VAT

#### Parameters

| Param                        | Mandatory | Type     | default | Description
|------------------------------|:---------:|:--------:|---------|---------------
| **tva**                      | yes       | string   |         | The VAT number to test


#### Example

```javascript
var resource = $app.resources.get('insee-id');
resource.isTVA(tva);
```

## Resource endpoints

This module come with one single read-only endpoint.

[1. read endpoint](#read-endpoint)
[2. siret2Tva endpoint](#siret2tva-endpoint)
[3. siren2Tva endpoint](#siren2tva-endpoint)
[4. tva2Siren endpoint](#tva2siren-endpoint)

### Read endpoint

The purpose of this endpoint is to display legals informations about a company.

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "info"

#### Example

```yaml
server:
  endpoints:
  - path: "/legal"
    resource: insee-id
    endpoint: read
```

### siret2Tva endpoint

The purpose of this endpoint is to return the VAT code (French) associated to the given SIRET

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "info"

#### Example

```yaml
server:
  endpoints:
  - path: "/tva"
    resource: insee-id
    endpoint: siret2Tva
```

### siren2Tva endpoint

The purpose of this endpoint is to return the VAT code (French) associated to the given SIREN

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "info"

#### Example

```yaml
server:
  endpoints:
  - path: "/tva"
    resource: insee-id
    endpoint: siren2Tva
```

### tva2Siren endpoint

The purpose of this endpoint is to return the SIREN (French) associated to the given VAT code

#### Parameters

| Param           | Mandatory | Type   | default | Description
|-----------------|:---------:|:------:|---------|---------------
| **path**        | yes       | string |         | path used as client endpoint (must start with /)
| **resource**    | yes       | string |         | resource id declared in the resource of your [config profile](#resource-configuration)
| **endpoint**    | yes       | string |         | endpoint name declared in the resource module. In this case must be "info"

#### Example

```yaml
server:
  endpoints:
  - path: "/tva"
    resource: insee-id
    endpoint: tva2Siren
```
