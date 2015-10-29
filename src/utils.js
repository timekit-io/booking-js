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
  }

};
