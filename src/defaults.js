'use strict';

/*
 * Default configuration
 */

var primary = {

  targetEl: '#bookingjs',
  name: '',
  avatar: '',
  autoload: true,
  disableRemoteLoad: false,
  disableConfirmPage: false,
  showCredits: true,
  goToFirstEvent: true,
  debug: false,
  availabilityView: 'agendaWeek',
  availability: {},
  booking: {},
  bookingFields: {
    name: {
      placeholder: 'Full name',
      prefilled: false,
      locked: false
    },
    email: {
      placeholder: 'E-mail',
      prefilled: false,
      locked: false
    },
    comment: {
      enabled: true,
      placeholder: 'Comment',
      prefilled: false,
      required: false,
      locked: false
    },
    phone: {
      enabled: false,
      placeholder: 'Phone number',
      prefilled: false,
      required: false,
      locked: false
    },
    voip: {
      enabled: false,
      placeholder: 'Skype username',
      prefilled: false,
      required: false,
      locked: false
    },
    location: {
      enabled: false,
      placeholder: 'Location',
      prefilled: false,
      required: false,
      locked: false
    }
  },
  timekitConfig: {
    headers: {
      'Timekit-Context': 'widget'
    }
  },
  fullCalendar: {
    views: {
      agenda: {
        displayEventEnd: false
      },
      listing: {
        type: 'list',
        duration: { days: 365 / 2 },
        listDayAltFormat: 'dddd',
        noEventsMessage: 'No timeslots available'
      }
    },
    allDaySlot: false,
    scrollTime: '08:00:00',
    timezone: 'local',
    nowIndicator: true
  },
  localization: {
    showTimezoneHelper: true,
    timeDateFormat: '12h-mdy-sun',
    strings: {
      allocatedResourcePrefix: 'with',
      submitText: 'Book it',
      successMessageTitle: 'Thanks!',
      successMessageBody: 'We have received your booking.',
      timezoneHelperLoading: 'Loading..',
      timezoneHelperDifferent: 'Your timezone is %s hours %s %s (calendar shown in your local time)',
      timezoneHelperSame: 'You are in the same timezone as %s'
    }
  },
  callbacks: {}

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
        columnFormat: 'ddd D/M',
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
        columnFormat: 'ddd M/D',
        slotLabelFormat: 'h:mma'
      }
    },
  },
  localization: {
    bookingDateFormat: 'MMMM D, YYYY',
    bookingTimeFormat: 'h:mma',
    emailTimeFormat: 'h:ia'
  }

};

// Preset: availabilityView = 'agendaWeek'
var availabilityViewAgendaWeek = {

  fullCalendar: {
    header: {
      left: '',
      center: '',
      right: 'today, prev, next'
    },
    defaultView: 'agendaWeek'
  }

}

// Preset: availabilityView = 'listing'
var availabilityViewListing = {

  fullCalendar: {
    header: {
      left: '',
      center: '',
      right: ''
    },
    defaultView: 'listing'
  }

}

// Export objects
module.exports = {
  primary: primary,
  presets: {
    timeDateFormat: {
      '24h-dmy-mon': timeDateFormat24hdmymon,
      '12h-mdy-sun': timeDateFormat12hmdysun
    },
    availabilityView: {
      'agendaWeek': availabilityViewAgendaWeek,
      'listing': availabilityViewListing
    }
  }
};
