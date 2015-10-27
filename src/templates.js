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
      tzText = 'Your timezone is ' + data.tzOffsetDiffAbs + ' hours ' + (data.aheadOfHost ? 'ahead' : 'behind') + ' of ' + data.hostName + ' (calendar shown in your local time)';
    }

    var timezonIcon = require('!svg-inline!./assets/timezone-icon.svg');

    var el = $(timezonIcon + '<span>' + tzText + '</span>');

    return el;
  },

  bookingPage: function(data) {

    var closeIcon = require('!svg-inline!./assets/close-icon.svg');

    var el = $(
      '<div class="bookingjs-bookpage">' +
        '<a class="bookingjs-bookpage-close" href="#">' + closeIcon +  '</a>' +
        '<h2 class="bookingjs-bookpage-date">' + data.chosenDate + '</h2>' +
        '<h3 class="bookingjs-bookpage-time">' + data.chosenTime + '</h3>' +
        '<form action=""></form>' +
      '</div>'
    );

    return el;

  }

};
