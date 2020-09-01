<img align="right" height="50" src="https://raw.githubusercontent.com/startxfr/sxapi-core/v0.3.53-npm/docs/assets/logo.svg?sanitize=true">

# SXAPI Core : timer component

The timer component is a [core component](./README.md) adding some timing functions to the 
sxapi core application. It allow us to perfom some timing action to mesure the application 
performance when runing.
With an integrated timer cache, this component can register multiple timers using a simple
label identifier.

## Configuration

This component come with no configuration and is loaded just after the [tools core components](tools.md) in the loading sequence.

## Library content

### Timer object

This module return a single of a timer object containing the following methods

| Method            | Description
|-------------------|---------------
| `get(label)`      | Return the timer coresonding to the label
| `start(label)`    | Start a timer for this label
| `time(label)`     | Return timestamp of the corresponding label
| `timeStop(label)` | Return timestamp of the corresponding label and stop the timer
| `stop(label)`     | Stop the timer for the corresponding label


### Usage


```javascript
var $timer = require('./timer');
var timerId = 'label';
$timer.start(timerId);
console.log("start timer : "+ $timer.time(timerId)+"ms");
setTimeout(function(){
    console.log("after pause : "+ $timer.time(timerId)+"ms");
    setTimeout(function(){
        console.log("stop timer : "+ $timer.timeStop(timerId)+"ms");
    }, 300);
}, 300);
```