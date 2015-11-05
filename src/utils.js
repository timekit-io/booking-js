'use strict';

/*
 * Utily functions for Booking.js
 */

module.exports = {

  log: function(type, message, context) {
    if (type === 'error') {
      if (context !== undefined) {
        console.log('Timekit Booking (error context):');
        console.log(context);
      }
      throw new Error('Timekit Booking: ' + message);
    } else {
      console.log('Timekit Booking: ' + message);
    }
  },

  isFunction: function(object) {
   return !!(object && object.constructor && object.call && object.apply);
  },

  doCallback: function(hook, config, arg) {
    if(this.isFunction(config.callbacks[hook])) {
      config.callbacks[hook](arg);
    }
  }

};
