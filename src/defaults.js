'use strict';

/*
 * Default configuration
 */

var primary = {

  el: '#bookingjs',
  name: '',
  autoload: true,
  disable_remote_load: false,
  disable_confirm_page: false,
  debug: false,
  ui: {
    show_credits: true,
    availability_view: 'agendaWeek',
    avatar: '',
    show_timezone_helper: true,
    time_date_format: '12h-mdy-sun',
    localization: {
      allocated_resource_prefix: 'with',
      submit_text: 'Book it',
      success_message_title: 'Thanks!',
      success_message_body: 'We have received your booking.',
      timezone_helper_loading: 'Loading..',
      timezone_helper_different: 'Your timezone is %s hours %s %s (calendar shown in your local time)',
      timezone_helper_same: 'You are in the same timezone as %s'
    }
  },
  availability: {},
  booking: {},
  customer_fields: {
    name: {
      type: 'string',
      title: 'Name',
      required: true
    },
    email: {
      type: 'string',
      title: 'E-mail',
      format: 'email',
      required: true
    }
  },
  sdk: {
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
  ui: {
    booking_date_format: 'D. MMMM YYYY',
    booking_time_format: 'HH:mm',
    email_time_format: 'H:i'
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
  ui: {
    booking_date_format: 'MMMM D, YYYY',
    booking_time_format: 'h:mma',
    email_time_format: 'h:ia'
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
