# Booking.js

**Latest release:**  *v1.0.0*

Make a beautiful embeddable booking widget in minutes.

![Booking.js Screenshot](misc/widget-screenshot.png)

Uses *FullCalendar* with a custom theme for dynamic calendar rendering with available timeslots fetched from *Timekit* (through the Javascript SDK). The shown appointment slots can be booked with automatic calendar invites sent to both host and visitor. Integrates with *Google Calendar* for automatic availability.

Maintainer: Lasse Boisen Andersen ([la@timekit.io](mailto:la@timekit.io)). PR's are welcome!

## Get started

**Visit [booking.timekit.io](http://booking.timekit.io) to set up your account and generate a config.**

Booking.js is meant as an easy to use, drop-in script that does it's job without any coding required. It's made for the browser and is quite similar to Stripe's Checkout.js. 

*This repo is mainly for community contributions and the curious soul that would like to customize the widget beyond settings provided out of the box.*

## Dependencies

The following libraries are bundled together with the SDK:

- [fullCalendar](http://fullcalendar.io) - a customizable and flexible event calendar built for the browser
- [moment](https://momentjs.com) - parse, validate, manipulate, and display dates in JavaScript
- [timekit-js-sdk](https://github.com/timekit-io/js-sdk) - JavaScript SDK for the Timekit.io API

## Configuration

Booking.js is made for various use-cases, so it's really extensible and customizable. We augment all the intrinsic options so you can overwrite them as needed, e.g. Timekit FindTime options or FullCalendar settings.

### Example

```javascript
{
  // Required options
  email:          '',
  apiToken:       '',
  calendar:       '',
  
  // Optional (will fallback to defaults)
  targetEl:       '#bookingjs',
  name:           '',
  avatar:         '',
  autoload:       false,
  includeStyles:  true,

  // Specific config for the Timekit JS SDK
  timekitConfig:      { ... },

  // Properties to send the Timekit FindTime endpoint
  timekitFindTime: {
    future:       '4 weeks',
    length:       '1 hour'
  },

  // Properties to send the Timekit CreateEvent endpoint
  timekitCreateEvent: {
    where:        'Online',
    invite:       true,
    my_rsvp:      'needsAction'
  },

  // Initialization options for FullCalendar
  fullCalendar: {
    header: {
      left:       '',
      center:     '',
      right:      'today, prev, next'
    },
    views: {
      basic: {
        columnFormat:     'dddd M/D',
      },
      agenda: {
        columnFormat:     'ddd\n M/D',
        slotLabelFormat:  'ha',
        displayEventEnd:  false
      }
    },
    timeFormat:   'h:mma',
    allDaySlot:   false,
    scrollTime:   '08:00:00',
    timezone:     'local',
  },

  // Shorthand options for easy localization
  localization: {
    showTimezoneHelper:   true || false,
    timeDateFormat:       '12h-mdy-sun' || '24h-dmy-mon',
  }

  // Register callbacks on events
  callbacks: {

    findTimeStarted:          function(args) {},
    findTimeSuccessful:       function(response) {},
    findTimeFailed:           function(response) {},

    createEventStarted:       function(args) {},
    createEventSuccessful:    function(response) {},
    createEventFailed:        function(response) {},

    getUserTimezoneStarted:   function(args) {},
    getUserTimezoneSuccesful: function(response) {},
    getUserTimezoneFailed:    function(response) {},

    fullCalendarInitialized:  function() {},
    renderCompleted:          function() {},

    showBookingPage:          function() {},
    closeBookingPage:         function() {},
    submitBookingForm:        function() {}

  }
}
```
