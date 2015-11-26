'use strict';

// Set of shorthands for common interactions
module.exports = {

  clickEvent: function() {
    var calEvent = $('.fc-time-grid-event')[0];
    var calEventStart = $(calEvent).find('.fc-time').attr('data-start');
    $(calEvent).click();
    return calEventStart
  }

}