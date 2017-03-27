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
  includeStyles: true,
  showCredits: true,
  goToFirstEvent: true,
  bookingGraph: 'instant',
  debug: false,
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
    app: 'bookingjs'
  },
  timekitFindTime: {
    future: '4 weeks',
    length: '1 hour'
  },
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
    nowIndicator: true
  },
  localization: {
    showTimezoneHelper: true,
    timeDateFormat: '12h-mdy-sun',
    strings: {
      submitText: 'Book it',
      successMessageTitle: 'Thanks!',
      timezoneHelperLoading: 'Loading..',
      timezoneHelperDifferent: 'Your timezone is %s hours %s of %s (calendar shown in your local time)',
      timezoneHelperSame: 'You are in the same timezone as %s'
    }
  },
  callbacks: {}

};

// Preset: bookingGraph = 'instant'
var bookingInstant = {

  timekitCreateBooking: {
    graph: 'instant',
    action: 'confirm',
    event: {
      invite: true,
      my_rsvp: 'accepted',
      sync_provider: true
    }
  },
  localization: {
    strings: {
      successMessageBody: 'An invitation has been sent to: <br /> %s <br /><br /> Please accept the invitation to confirm the booking.'
    }
  }

};

// Preset: bookingGraph = 'instant_payment'
var bookingInstantPayment = {

  timekitCreateBooking: {
    graph: 'instant_payment',
    action: 'tentative',
    event: {
      invite: true,
      my_rsvp: 'accepted',
      sync_provider: true
    }
  },
  localization: {
    strings: {
      successMessageBody: "We have received your payment and reserved your timeslot.<br /><br />Have a great day!"
    }
  }

};

// Preset: bookingGraph = 'confirm_decline'
var bookingConfirmDecline = {

  timekitCreateBooking: {
    graph: 'confirm_decline',
    action: 'create',
    event: {
      invite: true,
      my_rsvp: 'accepted',
      sync_provider: true
    }
  },
  localization: {
    strings: {
      successMessageBody: "We have received your request and we'll be in touch when we have reviewed it. <br /><br />Have a great day!"
    }
  }

};

// Preset: bookingGraph = 'group_customer'
var bookingGroupCustomer = {

  timekitCreateBooking: {
    graph: 'group_customer',
    action: 'create',
  },
  localization: {
    strings: {
      successMessageBody: "Your seat has been reserved and we've sent you a confirmation by email. <br /><br />Have a great day!"
    }
  }

};

// Preset: bookingGraph = 'group_customer_payment'
var bookingGroupCustomerPayment = {

  timekitCreateBooking: {
    graph: 'group_customer_payment',
    action: 'create',
  },
  localization: {
    strings: {
      successMessageBody: "We have received your payment and reserved a seat for you.<br /><br />Have a great day!"
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

// Export objects
module.exports = {
  primary: primary,
  presets: {
    timeDateFormat: {
      '24h-dmy-mon': timeDateFormat24hdmymon,
      '12h-mdy-sun': timeDateFormat12hmdysun
    },
    bookingGraph: {
      'instant': bookingInstant,
      'instant_payment': bookingInstantPayment,
      'confirm_decline': bookingConfirmDecline,
      'group_customer': bookingGroupCustomer,
      'group_customer_payment': bookingGroupCustomerPayment
    }
  }
};
