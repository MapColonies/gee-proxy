'use strict';

class Helpers {
    static isString(s) {
        return typeof (s) === 'string' || s instanceof String;
    }
}

module.exports = Helpers;
