const isEmpty = require("lodash/isEmpty");

class Util {
    constructor(config) {
        this.config = config;
    }

    isFunction(object) {
        return !!(object && object.constructor && object.call && object.apply);
    }
     
    isArray(object) {
        return object && object.constructor === Array;
    }

    logError(message) {
        console.warn('TimekitBooking Error: ', message);
    }

    logDebug(message) {
        if (this.config.get('debug')) {
            console.log('TimekitBooking Debug: ', message);
        }
    }   

    doesConfigExist(suppliedConfig) {
        return (suppliedConfig !== undefined && typeof suppliedConfig === 'object' && !isEmpty(suppliedConfig));
    }
}

module.exports = Util;