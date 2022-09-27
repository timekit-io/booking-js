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

    logDeprecated(message) {
        console.warn('TimekitBooking Deprecated: ', message);
    }

    logDebug(message) {
        if (this.config.get('debug')) {
            console.log('TimekitBooking Debug: ', message);
        }
    }

    logDeprecatedfunction(message) {
        console.warn('TimekitBooking Deprecated: ', message);
    }

    isEmbeddedProject(suppliedConfig) {
        return typeof suppliedConfig.project_id !== 'undefined'
    }
    
    isHostedProject(suppliedConfig) {
        return typeof suppliedConfig.project_slug !== 'undefined'
    }
    
    isRemoteProject(suppliedConfig) {
        return (this.isEmbeddedProject(suppliedConfig) || this.isHostedProject(suppliedConfig))
    }

    doesConfigExist(suppliedConfig) {
        return (suppliedConfig !== undefined && typeof suppliedConfig === 'object' && !isEmpty(suppliedConfig));
    }

    doCallback(hook, arg, deprecated) {
        if(this.config.get('callbacks') && this.isFunction(this.config.get('callbacks.' + hook))) {
            if (deprecated) {
              this.logDeprecated(hook + ' callback has been replaced, please see docs');
            }
            this.config.get('callbacks.' + hook)(arg);
          }
        this.logDebug(['Trigger callback "' + hook + '" with arguments:', arg]);
    }    
}

module.exports = Util;