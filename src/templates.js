'use strict';

/*
 * Utily functions for Booking.js
 */
var $ = require('jquery');

module.exports = {

  timezoneHelper: function(data) {

    var tzText = '';

    if (data.tzOffsetDiff === 0) {
      tzText = 'You are in the same timezone as ' + data.hostName;
    } else {
      tzText = 'Your timezone is ' + data.tzOffsetDiffAbs + ' hours ' + (data.aheadOfHost ? 'ahead' : 'behind') + ' ' + data.hostName + ' (calendar shown in your local time)';
    }

    var el = $('<span>' + tzText + '</span>');

    return el;
  }

};
