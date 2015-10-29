'use strict';

/*
 * Default configuration for for Booking.js
 */

module.exports = {

  targetEl: '#bookingjs',
  email: '',
  apiToken: '',
  calendar: '',
  name: '',
  avatar: '',
  autoload: false,
  timekitConfig: {
    app: 'sign-up'
  },
  findTime: {
    filters: {
      'and': [
        { 'business_hours': {}},
        { 'exclude_weekend': {}}
      ]
    },
    future: '3 weeks',
    length: '1 hour'
  },
  createEvent: {
    invite: true,
    where: 'Online'
  },
  fullCalendar: {
    header: {
      left: 'today',
      center: '',
      right: 'prev, next'
    },
    views: {
      basic: {
        columnFormat: 'dddd M/D',
        timeFormat: 'h:mm a'
      },
      agenda: {
        timeFormat: 'h:mm a',
        displayEventEnd: false
      }
    },
    allDaySlot: false,
    scrollTime: '08:00:00',
    timezone: 'local',
    columnFormat: 'ddd\n M/D'
    //minTime: '08:00:00',
    //maxTime: '19:00:00',
  },
  localization: {
    showTimezoneHelper: true,
    dateFormat: 'D. MMMM YYYY',
    timeFormat: 'h:mm a'
  },
  styling: {
    fullCalendarCore: true,
    fullCalendarTheme: true,
    general: true
  }

};
