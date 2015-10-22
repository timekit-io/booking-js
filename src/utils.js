'use strict';

function TimekitBookingUtilities() {

  var TBU = {};

  TBU.log = function(message) {
    console.log('Timekit Booking: ' + message);
  };

  return TBU;

}

module.exports = new TimekitBookingUtilities();
