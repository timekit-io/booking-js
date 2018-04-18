'use strict';

require('console-polyfill');

var config  = require('./config');

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

  doCallback: function(hook, arg, deprecated) {
    if(config.retrieve().callbacks && this.isFunction(config.retrieve().callbacks[hook])) {
      if (deprecated) {
        this.logDeprecated(hook + ' callback has been replaced, please see docs');
      }
      config.retrieve().callbacks[hook](arg);
    }
    this.logDebug(['Trigger callback "' + hook + '" with arguments:', arg]);
  },

  logDebug: function(message) {
    if (config.retrieve().debug) console.log('TimekitBooking Debug: ', message);
  },

  logError: function(message) {
    console.warn('TimekitBooking Error: ', message);
  },

  logDeprecated: function(message) {
    console.warn('TimekitBooking Deprecated: ', message);
  }

};
