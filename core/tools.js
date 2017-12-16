//'use strict';

JSON.isSerializable = function (str) {
    if (typeof str === 'object' || typeof str === 'array') {
        return true;
    }
    else {
        return false;
    }
};
JSON.isDeserializable = function (str) {
    if (typeof str === 'string' && (str[0] === '{' || str[0] === '[')) {
        return true;
    }
    else {
        return false;
    }
};
JSON.serialize = JSON.stringify;
JSON.deserialize = JSON.parse;

JSON.cleanObject = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};


/**
 * Adding colored prefix for console output
 * @param {type} pair
 */
if (console.isEhanced !== true) {
    [
        ['info', '\x1b[34m'],
        ['warn', '\x1b[33m'],
        ['error', '\x1b[41m'],
        ['log', '\x1b[30m ']
    ].forEach(function (pair) {
        var method = pair[0], reset = '\x1b[0m', color = '\x1b[36m' + pair[1];
        console[method] = console[method].bind(console, color, method.toUpperCase(), reset);
    });
    console.isEhanced = true;
}