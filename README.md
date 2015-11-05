# Booking.js

**Latest release:**  *v1.0.0*

Make a beautiful embeddable booking widget in minutes.

![Booking.js Screenshot](misc/widget-screenshot.png)

Uses *FullCalendar* with a custom theme for dynamic calendar rendering with available timeslots fetched from *Timekit* (through the Javascript SDK). The shown appointment slots can be booked with automatic calendar invites sent to both host and visitor. Integrates with *Google Calendar* for automatic availability.

Maintainer: Lasse Boisen Andersen ([la@timekit.io](mailto:la@timekit.io)). PR's are welcome!

## Get started

**Visit [booking.timekit.io](http://booking.timekit.io) to set up your account and generate a config.**

Booking.js is meant as an easy to use, drop-in script that does it's job without any coding required. It's made for the browser and is quite similar to Stripe's Checkout.js. 

*This repo is mainly for community contributions and the curious soul that would like to customize the widget beyond settings provided in the wizard.*

## Dependencies

Stuff you need to load:

- [jQuery](https://jquery.com/) - primarily because it's a requisite for FullCalendar

Bundled together with the library:

- [fullCalendar](http://fullcalendar.io) - a customizable and flexible event calendar built for the browser
- [moment](https://momentjs.com) - parse, validate, manipulate, and display dates in JavaScript
- [timekit-js-sdk](https://github.com/timekit-io/js-sdk) - JavaScript SDK for the Timekit.io API

## Usage

To ensure that we can push out updates, improvements and bugfixes to the library, you should load the library through our CDN. It's hosted on Amazon Cloudfront so it's snappy.

The simplest and most universally compatible usage is with autoload:

```html
<div id="bookingjs">
  <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script type="text/javascript" src="//cdn.timekit.io/bookingjs/1/booking.min.js" defer></script>
  <script type="text/javascript">
    window.timekitBookingConfig = {
      email:    'marty.mcfly@timekit.io',
      apiToken: 'bNpbFHRmrfZbtS5nEtCVl8sY5vUkOFCL',
      calendar: '8687f058-5b52-4fa4-885c-9294e52ab7d4',
      name:     'Marty McFly',
      avatar:   '../misc/avatar-mcfly.png'
    };
  </script>
</div>
```

If you intent to run multiple instances or want more control:
```html
<div id="bookingjs">
  <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script type="text/javascript" src="//cdn.timekit.io/bookingjs/1/booking.min.js"></script>
  <script type="text/javascript">
    var widget = new TimekitBooking();
    widget.init({
      email:    'marty.mcfly@timekit.io',
      apiToken: 'bNpbFHRmrfZbtS5nEtCVl8sY5vUkOFCL',
      calendar: '8687f058-5b52-4fa4-885c-9294e52ab7d4'
    });
  </script>
</div>
```

See `/examples` for more implementation examples.

## Configuration

Booking.js is made for various use-cases, so it's really extensible and customizable. We augment all the intrinsic options so you can overwrite them as needed, e.g. Timekit FindTime options or FullCalendar settings.

### Example

```javascript
{
  // Required
  email:          '',           // Your Timekit user's email (used for auth)
  apiToken:       '',           // Your Timekit user's apiToken (as generated through the wizard)
  calendar:       '',           // Your Timekit calendar ID that bookings should end up in
  
  // Optional
  targetEl:       '#bookingjs', // Which element should we the library load into
  name:           '',           // Display name to show in the header and timezone helper
  avatar:         '',           // Provide an image URL for a circular image avatar
  autoload:       true,         // Auto initialization if config object is found on window var
  includeStyles:  true,         // Inject fullCalendar and library styles in <head>

  // Internationalization
  localization: {
    showTimezoneHelper:       true,         // Should the timezone difference helper (bottom) be shown?
    timeDateFormat:           '12h-mdy-sun' // For EU-style formatting, use '24h-dmy-mon'
  }

  // Timekit JS SDK (see below)
  timekitConfig:              { ... },

  // Timekit FindTime endpoint (see below)
  timekitFindTime:            { ... },

  // Timekit CreateEvent endpoint (see below)
  timekitCreateEvent:         { ... },

  // FullCalendar options (see below)
  fullCalendar:               { ... },

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

**Timekit SDK**
```javascript
timekitConfig: {
  app:          'bookingjs'
},
```

**Timekit Find Time**

```javascript
timekitFindTime: {
  future:       '4 weeks',
  length:       '1 hour'
},
```

**Timekit Create Event**

```javascript
timekitCreateEvent: {
  where:        'Online',
  invite:       true,
  my_rsvp:      'needsAction'
},
```

**FullCalendar**

```javascript
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
  timezone:     'local'
}
```
