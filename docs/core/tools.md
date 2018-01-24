<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.1.4-docker/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : tools component

The tools component is a [core component](./README.md) adding some basic tools to the 
sxapi core application.

## Configuration

This component come with no configuration and is loaded previous all other components


## Library content

### JSON improvements

This component ehance `JSON` core object with 4 additionnals methods

| Method                       | Description
|------------------------------|---------------
| `JSON.isSerializable(obj)`   | Test if an object could be serialized with `JSON.serialize`
| `JSON.isDeserializable(str)` | Test if a string could be deserialized with `JSON.deserialize`
| `JSON.serialize(obj)`        | Serialize an object and convert it to a Json string (alias of `JSON.stringify`)
| `JSON.deserialize(str)`      | Deserialize a Json string and convert it to a native Javascript object (alias of `JSON.parse`)


### Console improvements

If `console.isEhanced` is not set or false, this library will add colored log prefix 
for the console display output. Could be disabled by adding `console.isEhanced = true;`
before loading this library.