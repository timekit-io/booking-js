# Booking.js by Timekit

[![Circle CI](https://img.shields.io/circleci/project/timekit-io/booking-js.svg)](https://circleci.com/gh/timekit-io/booking-js)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/feb445801acf454a95b1690a75959893)](https://www.codacy.com/app/laander/booking-js)

**Latest release:**  [v1.5.2](https://github.com/timekit-io/booking-js/releases)

> Make a beautiful embeddable booking widget in minutes.

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

To ensure that we can push out updates, improvements and bugfixes to the library, you should load the library through our CDN. It's hosted on Amazon Cloudfront so it's snappy enough for production.

See `/examples` for implementation examples or use the following:

**Autoload**  
The simplest and most universally compatible usage is with autoload. This will defer the loading of the library until the whole body has loaded and then look for `window.timekitBookingConfig` - if found, the library is loaded automatically.

```html
<div id="bookingjs">
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script type="text/javascript" src="http://cdn.timekit.io/booking-js/v1/booking.min.js" defer></script>
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

**Instantiation**  
If you intent to run multiple instances or want more control, just create a new instance. This is ideal for usage in SPAs like Angular.js, where you'd like a `<div id="bookingjs">` in your template and JS in your controller or directive code.

```html
<div id="bookingjs">
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script type="text/javascript" src="http://cdn.timekit.io/booking-js/v1/booking.min.js"></script>
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

**Serve over HTTPS**

Use the following URI to the library if you want it served with SSL:  
`https://dbhpllgef527b.cloudfront.net/booking-js/v1/booking.min.js`

(see [this issue](https://github.com/timekit-io/booking-js/issues/19) for more info)

## Authentication

The widget connects to the Timekit API behind the scenes and requires a Timekit account.

You can either connect with a Google account (recommended) or create a plain account (you'd have to enter availability and pull out events through the API).  
Visit the [setup wizard here](http://booking.timekit.io/setup).

The `email` and `apiToken` setting is the key part here. When you specify domain and generate credentials in the [setup wizard](http://booking.timekit.io/setup), you get a special client-token with limited access. It's only capable of hitting certain endpoints so your account stays secure when using the widget in a public browser environment.

## Configuration

Booking.js is made for various use-cases, so it's really extensible and customizable. We augment all the intrinsic options so you can overwrite them as needed, e.g. Timekit FindTime options or FullCalendar settings.

### Example

```javascript
{
  // Required
  email:                    '',   // Your Timekit user's email (used for auth)
  apiToken:                 '',   // Your Timekit user's apiToken (as generated through the wizard)
  calendar:                 '',   // Your Timekit calendar ID that bookings should end up in

  // Optional
  targetEl:                 '#bookingjs', // Which element should we the library load into
  name:                     '',   // Display name to show in the header and timezone helper
  avatar:                   '',   // Provide an image URL for a circular image avatar
  autoload:                 true, // Auto initialization if config object is found on window var
  includeStyles:            true, // Inject fullCalendar and library styles in <head>
  showCredits:              true, // Display a "Powered by Timekit" attribution footer (thanks!)
  goToFirstEvent:           true, // Display and scroll to the first upcoming event in the calendar (to avoid showing a blank calendar)

  // Internationalization
  localization: {
    showTimezoneHelper:     true, // Should the timezone difference helper (bottom) be shown?
    timeDateFormat:         '12h-mdy-sun' // For EU-style formatting, use '24h-dmy-mon' (see below)
  },

  // Customize form fields (see below)
  bookingFields:            { ... },

  // Timekit JS SDK (see below)
  timekitConfig:            { ... },

  // Timekit FindTime endpoint (see below)
  timekitFindTime:          { ... },

  // Timekit CreateEvent endpoint (see below)
  timekitCreateEvent:       { ... },

  // FullCalendar options (see below)
  fullCalendar:             { ... },

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

    showBookingPage:          function(event) {},
    closeBookingPage:         function() {},
    submitBookingForm:        function(values) {}

  }
}
```

### Timekit SDK

You can pass any of the [Timekit JS SDK](https://github.com/timekit-io/js-sdk) settings directly to the widget. This is mostly revelant if you're building a tighter integration with Timekit and have your own app registered on the platform.

```javascript
timekitConfig: {
  app:          'bookingjs' // Default
}
```

### Timekit Find Time

The Find Time algorithm is a powerful query tool for availability. Booking.js is calling the endpoint `[POST]/findtime` through the JS SDK and takes all the arguments as mentioned on the official [docs](http://developers.timekit.io/docs/findtime). The most powerful aspect are the [filters](http://developers.timekit.io/docs/find-time-filters). By default, there's no filters applied.

There's only three default arguments out of the box:

```javascript
timekitFindTime: {
  future:       '4 weeks',      // Default, how long time into the future that timeslots should be returned
  length:       '1 hour',       // Default, the duration of the bookable timeslots
  emails:       [config.email], // Inserted from the "email" setting in the general config
},
```

### Timekit Create Event

When booking an event, the widget will call the `[POST]/events` endpoint through the JS SDK, with the following settings:

```javascript
timekitCreateEvent: {
  where:        'Online',        // Default, you may want to customize this to a specific location, TBD or whatever fits
  invite:       true,            // Default, makes sure that participants (the visitor) is sent a Google invite
  my_rsvp:      'needsAction',   // Default, makes sure that the host also will be able to RSVP to the created event
  start:        data.start,      // Inserted from the chosen timeslot
  end:          data.end,        // Inserted from the chosen timeslot
  what:         config.name + ' x '+ data.name, // Inserted based on the host and visitors names (you can replace it with a static string)
  calendar_id:  config.calendar, // Inserted from the "calendar" setting in the general config
  participants: [config.email, data.email], // Inserted based on host and visitors ()
  description:  data.comment || '' // Inserted based on the visitor's supplied comment
},
```

### FullCalendar

You can supply and override all the [FullCalendar settings](http://fullcalendar.io/docs/):

```javascript
fullCalendar: {
  header: {
    left:       '',
    center:     '',
    right:      'today, prev, next'
  },
  views: {
    agenda: {
      displayEventEnd: false
    }
  },
  allDaySlot:   false,
  scrollTime:   '08:00:00',
  timezone:     'local',
  defaultView:  sizing.view,     // Inserted based on the current width of the widget
  height:       sizing.height,   // Inserted based on the current width of the widget
  eventClick:   function(event), // Handled internally in Booking.js (overwrite if you want to replace the booking page)
  windowResize: function(view)   // Recalculates the view and height based on the widget's width (if resized)
}
```

*See below for FullCalendar language support.*

### Localization

For quick localization of time/date formats, we provide a simple "preset" setting, `timeDateFormat`, that sets a range of different FullCalendar and localization settings.

By default, it's set to "12-hour clock, M/D/Y date format, Sunday first day of week" (`12h-mdy-sun`). It can be changed to "24-hour clock, D/M/Y date format, Monday first day of week" (`24h-dmy-mon`).

See `/examples/local-preset.htm`

```javascript
localization: {
  timeDateFormat: '12h-mdy-sun', // Default, alternative mode "24h-dmy-mon",
  bookingDateFormat: 'MMMM D, YYYY', // Override the default date format on the booking page
  bookingTimeFormat: 'h:mma' // Override the default time format on the booking page
},
```

For full language support, FullCalendar also takes a ["lang" option](http://fullcalendar.io/docs/text/lang/), accompanied by a language file. Make sure to use defer attribute on a script tag loading the language file if you are deferring booking.js, language file should be loaded after booking.js, but before initialization.

Remember to set `localization.timeDateFormat` to false so it doesn't override the language file's settings.

See `/examples/local-language.htm`

```javascript
fullCalendar: {
  lang: 'de'
},
localization: {
  timeDateFormat: false
}
```

### Booking form fields

You can customize the booking form fields and their settings in this section. Only the `name`, `email` and `comment` fields are enabled by default. The `name` and `email` fields have to be enabled and is always required (for the event creation to work properly). All other fields can be enabled/disabled.

If you're collecting user information before loading the widget, it can be useful to inject it into the form by setting the `prefilled` keys - just pass in the values and they will be set upon load. Combine it with `locked` to lock the fields for user input.

See `/examples/fields.htm`

```javascript
bookingFields: {
  name: {
    placeholder: 'Your full name',
    prefilled: false,
    locked: false
  },
  email: {
    placeholder: 'Your e-mail',
    prefilled: false,
    locked: false
  },
  comment: {
    enabled: true,
    placeholder: 'Write a comment (optional)',
    prefilled: false,
    required: false,
    locked: false
  },
  phone: {
    enabled: false,
    placeholder: 'Your phone number',
    prefilled: false,
    required: false,
    locked: false
  },
  voip: {
    enabled: false,
    placeholder: 'Your Skype username',
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
}
```

## Methods

After you instantiated the widget, you can control it with the following methods:

```javascript
var widget = new TimekitBooking();
widget.init(config);          // Initalizes the widget with the given config
widget.render();              // Re-renders the widget with it's instance config
widget.setConfig(config);     // Push a new config into it (call render() afterwards)
widget.getConfig();           // Returns the current config
widget.destroy();             // Cleans the DOM element and empty config
widget.fullCalendar(action);  // Direct access to FullCalendar's own method (for advanced use)
```

## Roadmap/todos

See [Issues](https://github.com/timekit-io/booking-js/issues) for feature requests, bugs etc.
