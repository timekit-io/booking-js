# Booking.js

**Latest release:**  *v1.0.0*

Make a beautiful embeddable booking widget in minutes.

![Booking.js Screenshot](misc/widget-screenshot.png)

Uses *FullCalendar* with a custom theme for dynamic calendar rendering with available timeslots fetched from *Timekit* (through the Javascript SDK). The shown appointment slots can be booked with automatic calendar invites sent to both host and visitor. Integrates with *Google Calendar* for automatic availability.

Maintainer: Lasse Boisen Andersen ([la@timekit.io](mailto:la@timekit.io)). PR's are welcome!

## Get started

**Visit [booking.timekit.io](http://booking.timekit.io) to set up your account and generate a config.**

Booking.js is meant as an easy to use, drop-in script that does it's job without any coding required. It's made for the browser and is quite similar to Stripe's Checkout.js. 

*This repo is only for the curious soul that would like to customize the widget beyond settings provided out of the box.*

## Dependencies

The following libraries are bundled together with the SDK:

- [fullCalendar](http://fullcalendar.io) - a customizable and flexible event calendar built for the browser
- [moment](https://momentjs.com) - parse, validate, manipulate, and display dates in JavaScript
- [timekit-js-sdk](https://github.com/timekit-io/js-sdk) - JavaScript SDK for the Timekit.io API
