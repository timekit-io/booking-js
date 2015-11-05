'use strict';

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
  }

};
