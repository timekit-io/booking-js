'use strict';

// Set of shorthands for common interactions
module.exports = {

  clickNextArrow: function () {
    var calEvent = $('.fc-next-button')[0];
    $(calEvent).click();
  },

  clickEvent: function() {
    var calEvent = $('.fc-time-grid-event')[0];
    var calEventStart = $(calEvent).find('.fc-time').attr('data-start');
    $(calEvent).click();
    return calEventStart;
  },

  fillSubmit: function() {
    var data = {
      name: 'Joe Test',
      email: 'test@timekit.io',
      comment: 'This is a test'
    };
    $('.input-name').val(data.name);
    $('.input-email').val(data.email);
    $('.input-comment').val(data.comment);
    $('.bookingjs-form-button').click();
    return data;
  }

}
