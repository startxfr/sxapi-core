//'use strict';

JSON.isParsable = function (str) {
    if (typeof str === 'string' && (str[0] === '{' || str[0] === '[')) {
        return true;
    }
    else {
        return false;
    }
};

JSON.cleanObject = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};