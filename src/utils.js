'use strict';

require('console-polyfill');

/*
 * Utily functions
 */

module.exports = {

  isFunction: function(object) {
   return !!(object && object.constructor && object.call && object.apply);
  },

  doCallback: function(hook, config, arg, deprecated) {
    if(this.isFunction(config.callbacks[hook])) {
      if (deprecated) { this.logDeprecated(hook + ' callback has been replaced, please see docs'); }
      config.callbacks[hook](arg);
    }
  },

  logError: function(message, context) {
    console.error('TimekitBooking Error: ', message, context);
  },

  logDeprecated: function(message) {
    console.warn('TimekitBooking Deprecated: ', message);
  }

};
