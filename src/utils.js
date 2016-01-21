'use strict';

require('console-polyfill');

/*
 * Utily functions for Booking.js
 */

module.exports = {

  isFunction: function(object) {
   return !!(object && object.constructor && object.call && object.apply);
  },

  doCallback: function(hook, config, arg) {
    if(this.isFunction(config.callbacks[hook])) {
      config.callbacks[hook](arg);
    }
  },

  logError: function(message) {
    console.error('TimekitBooking Error: ' + message);
  },

  logDeprecated: function(message) {
    console.warn('TimekitBooking Deprecated: ' + message);
  }

};
