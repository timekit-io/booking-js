'use strict';

require('console-polyfill');

/*
 * Utily functions
 */

module.exports = {

  isFunction: function(object) {
   return !!(object && object.constructor && object.call && object.apply);
  },

  isArray: function(object) {
   return object && object.constructor === Array;
  },

  doCallback: function(hook, config, arg, deprecated) {
    if(config.callbacks && this.isFunction(config.callbacks[hook])) {
      if (deprecated) { this.logDeprecated(hook + ' callback has been replaced, please see docs'); }
      config.callbacks[hook](arg);
    }
    this.logDebug(['Trigger callback "' + hook + '" with arguments:', arg], config);
  },

  logDebug: function(message, config) {
    if (config && config.debug) console.log('TimekitBooking Debug: ', message);
  },

  logError: function(message) {
    console.warn('TimekitBooking Error: ', message);
  },

  logDeprecated: function(message) {
    console.warn('TimekitBooking Deprecated: ', message);
  }

};
