'use strict';

/*
 * Default configuration for for Booking.js
 */

var primary = {

  // email: '',
  // apiToken: '',
  // calendar: '',
  targetEl: '#bookingjs',
  name: '',
  avatar: '',
  autoload: true,
  includeStyles: true,
  showCredits: true,
  goToFirstEvent: true,
  bookingMode: 'instant',
  bookingFields: {
    name: {
      placeholder: 'Your full name',
      prefilled: false
    },
    email: {
      placeholder: 'Your e-mail',
      prefilled: false
    },
    comment: {
      enabled: true,
      placeholder: 'Write a comment (optional)',
      prefilled: false,
      required: false
    },
    phone: {
      enabled: false,
      placeholder: 'Your phone number',
      prefilled: false,
      required: false
    },
    voip: {
      enabled: false,
      placeholder: 'Your Skype username',
      prefilled: false,
      required: false
    },
    location: {
      enabled: false,
      placeholder: 'Location',
      prefilled: false,
      required: false
    }
  },
  timekitConfig: {
    app: 'bookingjs'
  },
  timekitFindTime: {
    future: '4 weeks',
    length: '1 hour'
  },
  //timekitCreateEvent: { },
  timekitCreateBooking: { },
  timekitUpdateBooking: { },
  fullCalendar: {
    header: {
      left: '',
      center: '',
      right: 'today, prev, next'
    },
    views: {
      agenda: {
        displayEventEnd: false
      }
    },
    allDaySlot: false,
    scrollTime: '08:00:00',
    timezone: 'local',
    //minTime: '08:00:00',
    //maxTime: '19:00:00',
  },
  localization: {
    showTimezoneHelper: true,
    timeDateFormat: '12h-mdy-sun'
  },
  callbacks: {}

};

// Preset: bookingMode = 'instant'
var bookingInstant = {

  timekitCreateBooking: {
    graph: 'instant',
    action: 'confirm',
    details: {
      invite: true,
      my_rsvp: 'accepted',
      sync_provider: true
    }
  }

};

// Preset: bookingMode = 'confirm_decline'
var bookingActionable = {

  timekitCreateBooking: {
    graph: 'confirm_decline',
    action: 'create',
    details: {
      invite: true,
      my_rsvp: 'needsAction',
      sync_provider: true
    }
  }

};

// Preset: timeDateFormat = '24h-dmy-mon'
var timeDateFormat24hdmymon = {

  fullCalendar: {
    timeFormat: 'HH:mm',
    firstDay: 1,
    views: {
      basic: {
        columnFormat: 'dddd D/M'
      },
      agenda: {
        columnFormat: 'ddd\n D/M',
        slotLabelFormat: 'HH:mm'
      }
    }
  },
  localization: {
    bookingDateFormat: 'D. MMMM YYYY',
    bookingTimeFormat: 'HH:mm',
    emailTimeFormat: 'H:i'
  }

};

// Preset: timeDateFormat = '12h-mdy-sun'
var timeDateFormat12hmdysun = {

  fullCalendar: {
    timeFormat: 'h:mma',
    firstDay: 0,
    views: {
      basic: {
        columnFormat: 'dddd M/D',
      },
      agenda: {
        columnFormat: 'ddd\n M/D',
        slotLabelFormat: 'ha'
      }
    },
  },
  localization: {
    bookingDateFormat: 'MMMM D, YYYY',
    bookingTimeFormat: 'h:mma',
    emailTimeFormat: 'h:ia'
  }

};

// Export objects
module.exports = {
  primary: primary,
  presets: {
    timeDateFormat24hdmymon:  timeDateFormat24hdmymon,
    timeDateFormat12hmdysun:  timeDateFormat12hmdysun,
    bookingInstant: bookingInstant,
    bookingActionable: bookingActionable
  }
};
