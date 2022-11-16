'use strict';

const listPlugin = require("@fullcalendar/list").default;
const momentPlugin = require("@fullcalendar/moment").default;
const dayGridPlugin = require("@fullcalendar/daygrid").default;
const timeGridPlugin = require("@fullcalendar/timegrid").default;

/*
 * Default configuration
 */
const primary = {
  name: '',
  debug: false,
  autoload: true,
  el: '#bookingjs',
  disable_remote_load: false,
  disable_confirm_page: false,
  create_booking_response_include: ['attributes', 'event', 'user'],
  ui: {
    display_name: '',
    show_timezone_helper: true,
    availability_view: "agendaWeek",
    localization: {
      reschedule_submit_button: 'Confirm Reschedule',
      reschedule_success_message: 'We have reschduled your booking successfully',
    }
  },
  booking: {},
  callbacks: {},
  reschedule: {},
  availability: {},
  customer_fields: {},
  sdk: {
    headers: {
      'Timekit-Context': 'widget'
    }
  },
  fullcalendar: {
    allDaySlot: false,
    nowIndicator: true,
    scrollTime: '08:00:00',
    plugins: [timeGridPlugin, listPlugin, momentPlugin, dayGridPlugin],
    views: {
      agenda: {
        displayEventEnd: false,
      },
      listing: {
        type: 'list',
        listDayAltFormat: 'dddd',
        duration: { days: 365 / 2 },
        noEventsMessage: 'No timeslots available'
      }
    },
  }
};

const primaryWithoutProject = {
  ui: {
    avatar: '',
    display_name: '',
    show_credits: true,
    show_timezone_helper: true,
    time_date_format: '12h-mdy-sun',
    availability_view: 'timeGridWeek',
    localization: {
      submit_button: 'Book it',
      allocated_resource_prefix: 'with',
      reschedule_submit_button: 'Reschedule',
      reschedule_success_message: 'We have reschduled your booking successfully',
      success_message: 'We have received your booking and sent a confirmation to %s'
    }
  },
  reschedule: {},
  availability: {
    mode: 'roundrobin_random'
  },
  booking: {
    graph: 'instant'
  },
  customer_fields: {
    name: {
      title: 'Name',
      required: true,
      split_name: false
    },
    email: {
      title: 'E-mail',
      format: 'email',
      required: true
    }
  }
}

const customerFieldsNativeFormats = {
  name: {
    format: 'string'
  },  
  email: {
    format: 'email'
  },
  comment: {
    format: 'textarea'
  },
  phone: {
    format: 'tel'
  }
}

// Preset: timeDateFormat = '24h-dmy-mon'
const timeDateFormat24hdmymon = {
  ui: {
    display_name: '',
    booking_time_format: 'HH:mm',
    availability_view: "agendaWeek",
    booking_date_format: 'D. MMMM YYYY'
  },
  fullcalendar: {
    firstDay: 1,
    eventTimeFormat: {
      hour12: false,
      meridiem: false,
      hour: '2-digit',
      minute: '2-digit',
    },
    views: {
      week: {
        dayHeaderFormat: { 
          weekday: 'long',
          month: 'numeric', 
          day: 'numeric',
          omitCommas: true
        }
      },
      timeGrid: {
        dayHeaderFormat: { 
          weekday: 'short',
          month: 'numeric', 
          day: 'numeric',
          omitCommas: true
        },
        slotLabelFormat: {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }
      }
    }
  }
};

// Preset: timeDateFormat = '12h-mdy-sun'
const timeDateFormat12hmdysun = {
  ui: {
    display_name: '',
    booking_time_format: 'hh:mma',
    availability_view: "agendaWeek",
    booking_date_format: 'MMMM D, YYYY'
  },
  fullcalendar: {
    firstDay: 0,
    eventTimeFormat: { // like '14:30'
      hour: '2-digit',
      minute: '2-digit',
      meridiem: 'short'
    },
    views: {
      week: {
        dayHeaderFormat: { 
          weekday: 'long',
          month: 'numeric', 
          day: 'numeric',
          omitCommas: true
        }
      },
      timeGrid: {
        dayHeaderFormat: { 
          weekday: 'short',
          month: 'numeric', 
          day: 'numeric',
          omitCommas: true
        },
      },
      dayGridDay: {
        dayHeaderFormat: { 
          weekday: 'short',
          month: 'numeric', 
          day: 'numeric',
          omitCommas: true
        },
      }      
    }
  }
};

// Preset: availabilityView = 'timeGridWeek'
const availabilityViewAgendaWeek = {
  fullcalendar: {
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: '',
      center: '',
      right: 'today, prev, next'
    },
  }
}

// Preset: availabilityView = 'listing'
const availabilityViewListing = {
  fullcalendar: {
    initialView: 'listWeek',
    headerToolbar: {
      left: '',
      center: '',
      right: 'today prev,next'
    },
  }
}

// Export objects
module.exports = {
  primary: primary,
  primaryWithoutProject: primaryWithoutProject,
  customerFieldsNativeFormats: customerFieldsNativeFormats,
  presets: {
    timeDateFormat: {
      '24h-dmy-mon': timeDateFormat24hdmymon,
      '12h-mdy-sun': timeDateFormat12hmdysun
    },
    availabilityView: {
      'listing': availabilityViewListing,
      'agendaWeek': availabilityViewAgendaWeek
    }
  }
};
