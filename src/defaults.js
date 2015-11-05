'use strict';

/*
 * Default configuration for for Booking.js
 */

module.exports = {

  // email: '',
  // apiToken: '',
  // calendar: '',
  targetEl: '#bookingjs',
  name: '',
  avatar: '',
  autoload: true,
  includeStyles: true,
  timekitConfig: {
    app: 'bookingjs'
  },
  timekitFindTime: {
    future: '4 weeks',
    length: '1 hour'
  },
  timekitCreateEvent: {
    where: 'Online',
    invite: true,
    my_rsvp: 'needsAction'
  },
  fullCalendar: {
    header: {
      left: '',
      center: '',
      right: 'today, prev, next'
    },
    views: {
      basic: {
        columnFormat: 'dddd M/D',
      },
      agenda: {
        columnFormat: 'ddd\n M/D',
        slotLabelFormat: 'ha',
        displayEventEnd: false
      }
    },
    timeFormat: 'h:mma',
    allDaySlot: false,
    scrollTime: '08:00:00',
    timezone: 'local',
    //minTime: '08:00:00',
    //maxTime: '19:00:00',
  },
  localization: {
    showTimezoneHelper: true,
    timeDateFormat: '12h-mdy-sun'
    //dateFormat: 'D. MMMM YYYY',
    //timeFormat: 'h:mm a'
  },
  callbacks: {}

};
