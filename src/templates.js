'use strict';

/*
 * Utily functions for Booking.js
 */
var $ = require('jquery');

module.exports = {

  timezoneHelper: function(data) {

    var tzText = '';

    if (data.tzOffsetDiff === 0) {
      tzText = '<span>You are in the same timezone as ' + data.hostName + '</span>';
    } else {
      tzText = '<span>Your timezone is ' + data.tzOffsetDiffAbs + ' hours ' + (data.aheadOfHost ? 'ahead' : 'behind') + ' of ' + data.hostName + ' (calendar shown in your local time)</span>';
    }

    var timezonIcon = require('!svg-inline!./assets/timezone-icon.svg');
    var el = $(timezonIcon + tzText);

    return el;
  },

  bookingPage: function(data) {

    var closeIcon = require('!svg-inline!./assets/close-icon.svg');
    var checkmarkIcon = require('!svg-inline!./assets/checkmark-icon.svg');

    var el = $(
      '<div class="bookingjs-bookpage">' +
        '<a class="bookingjs-bookpage-close" href="#">' + closeIcon +  '</a>' +
        '<h2 class="bookingjs-bookpage-date">' + data.chosenDate + '</h2>' +
        '<h3 class="bookingjs-bookpage-time">' + data.chosenTime + '</h3>' +
        '<form class="bookingjs-form" action="#">' +
          '<input class="bookingjs-form-input hidden" type="text" name="start" value="' + data.start + '" />' +
          '<input class="bookingjs-form-input hidden" type="text" name="end" value="' + data.end + '" />' +
          '<input class="bookingjs-form-input first" type="text" name="name" placeholder="Your full name" required />' +
          '<input class="bookingjs-form-input" type="email" name="email" placeholder="Your email" required />' +
          '<textarea class="bookingjs-form-input last" rows="3" name="comment" placeholder="Write a comment (optional)" />' +
          '<button class="bookingjs-form-button" type="submit">' +
            '<span class="inactive-text">' + data.submitText + '</span>' +
            '<span class="loading-text">' + data.loadingText + '</span>' +
            '<span class="success-text">' + checkmarkIcon + '</span>' +
          '</button>' +
        '</form>' +
      '</div>'
    );

    return el;
  },

  avatarImage: function(data) {

    var el = $(
      '<div class="bookingjs-avatar">' +
        '<img src="' + data.avatar + '" />' +
      '</div>'
    );

    return el;
  },

  displayName: function(data) {

    var el = $(
      '<div class="bookingjs-displayname">' +
        '<span>' + data.name + '</span>' +
      '</div>'
    );

    return el;
  }


};
