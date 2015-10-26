'use strict';

/*
 * Utily functions for Booking.js
 */

module.exports = {

  log: function(message) {
    throw new Error(message);
    console.log('Timekit Booking: ' + message);
  }

};
