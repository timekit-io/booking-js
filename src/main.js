'use strict';

// External depenencies
var timekit = require('timekit-sdk');
var fullcalendar = require('fullcalendar');
var moment = require('moment');
var $ = require('jquery');

// Internal dependencies
var utils = require('./utils');
var templates = require('./templates');
var config = require('./defaultConfig');

/*!
 * Booking.js
 * Version: 1.0.0
 * http://booking.timekit.io
 *
 * Copyright 2015 Timekit, Inc.
 * Timekit Booking.js is freely distributable under the MIT license.
 *
 */

function TimekitBooking() {

  var TB = {};
  var calendarTarget = '';
  var bookingPageTarget = '';

  // Setup the Timekit SDK with correct credentials
  var timekitSetup = function() {
    var args = {};

    $.extend(true, args, config.timekitConfig);

    timekit.configure(args);
    timekit.setUser(config.email, config.apiToken);
  };

  // Fetch availabile time through Timekit SDK
  var timekitFindTime = function(callback) {
    var args = { emails: [config.email] };

    $.extend(args, config.findTime);

    timekit.findTime(args)
    .then(function(response){
      callback(response);
    }).catch(function(response){
      utils.log('An error with FindTime occured');
      utils.log(response);
    });
  };

  // Calculate and display timezone helper
  var renderTimezoneHelper = function() {

    var localTzOffset = (new Date()).getTimezoneOffset()/60*-1;
    //var localTzFormatted = (localTzOffset > 0 ? "+" : "") + localTzOffset;

    var timezoneHelperTarget = $('<div class="bookingjs-timezonehelper"><span>Loading...</span></div>');
    $(config.targetEl).append(timezoneHelperTarget);

    timekit.getUserTimezone({
      email: config.email
    }).then(function(response){

      var hostTzOffset = response.data.utc_offset;
      var tzOffsetDiff = localTzOffset - hostTzOffset;
      var tzOffsetDiffAbs = Math.abs(tzOffsetDiff);

      var aheadOfHost = true;
      if (tzOffsetDiff < 0) {
        aheadOfHost = false;
      }

      var template = templates.timezoneHelper({
        tzOffsetDiff: tzOffsetDiff,
        tzOffsetDiffAbs: tzOffsetDiffAbs,
        aheadOfHost: aheadOfHost,
        hostName: config.name
      });

      timezoneHelperTarget.html(template);

    });
  };

  // Setup and render FullCalendar
  var initializeCalendar = function() {

    var defaultView = 'agendaWeek';
    var height = 600;
    var deviceWidth = $(window).width();

    if (deviceWidth < 480) {
      defaultView = 'basicDay';
      height = 530; //1132
    }

    var args = {
      defaultView: defaultView,
      height: height,
      eventClick: showBookingPage
    };

    $.extend(true, args, config.fullCalendar);

    calendarTarget = $('<div class="bookingjs-calendar empty-calendar">');
    $(config.targetEl).append(calendarTarget);

    // Wait until DOM is ready to init fullCalendar (fixes wrong event height bug)
    $(window).load(function() {
      calendarTarget.fullCalendar(args);
    });

  };

  // Render the supplied calendar events in FullCalendar
  var renderCalendarEvents = function(eventData) {

    calendarTarget.fullCalendar('addEventSource', {
      events: eventData
    });
    calendarTarget.removeClass('empty-calendar');

  };

  // Event handler when a timeslot is clicked in FullCalendar
  var showBookingPage = function(eventData) {

    bookingPageTarget = templates.bookingPage({
      chosenDate: moment(eventData.start).format('D. MMMM YYYY'),
      chosenTime: moment(eventData.start).format('h:mma') + ' to ' + moment(eventData.end).format('h:mma'),
      start: moment(eventData.start).format(),
      end: moment(eventData.start).format(),
      submitText: 'Book it',
      loadingText: 'Wait..',
      successText: 'Booked!'
    });

    bookingPageTarget.children('.bookingjs-bookpage-close').click(function() {
      hideBookingPage();
    });

    bookingPageTarget.children('.bookingjs-form').submit(function(e) {
      submitBookingForm(this, e);
    });


    $(document).on('keyup', function(e) {
      // escape key maps to keycode `27`
      if (e.keyCode === 27) { hideBookingPage(); }
    });

    $(config.targetEl).append(bookingPageTarget);

  };

  // Remove the booking page DOM node
  var hideBookingPage = function() {

    bookingPageTarget.remove();
    $(document).off('keyup');

  };

  // Event handler on form submit
  var submitBookingForm = function(form, e) {

    e.preventDefault();

    var submitButton = $(form).children('.bookingjs-form-button');

    if(submitButton.hasClass('loading') || submitButton.hasClass('success')) {
      return;
    }

    var values = {};
    $.each($(form).serializeArray(), function(i, field) {
        values[field.name] = field.value;
    });

    $(form).children('.bookingjs-form-button').addClass('loading');

    timekitCreateEvent(values).then(function(){
      renderBookingCompleted(form);
    }).catch(function(response){
      utils.log('An error with CreateEvent occured');
      utils.log(response);
    });
  };

  // Create new event through Timekit SDK
  var timekitCreateEvent = function(data) {

    var args = {
      start: data.start,
      end: data.end,
      what: config.name + ' x '+ data.name,
      calendar_id: config.calendar,
      participants: [data.email],
      description: data.comment || ''
    };

    $.extend(true, args, config.createEvent);

    return timekit.createEvent(args);
  };

  // Render the booking completed page when booking was successful
  var renderBookingCompleted = function(form) {
    $(form).children('.bookingjs-form-button').removeClass('loading').addClass('success');
  };

  // Exposed initilization method
  TB.init = function(suppliedConfig) {

    // Check whether a config is supplied
    if(suppliedConfig === undefined || typeof suppliedConfig !== 'object') {
      utils.log('No configuration was supplied. Please supply a config object upon library initialization');
      return;
    }

    // Extend the default config with supplied settings
    $.extend(true, config, suppliedConfig);

    // Initialize FullCalendar
    initializeCalendar();

    // Setup Timekit SDK config
    timekitSetup();

    // Get availability through Timekit SDK
    timekitFindTime(function(response){
      // Render available timeslots in FullCalendar
      renderCalendarEvents(response.data);
    });

    // Show timezone helper if enabled
    if (config.localization.showTimezoneHelper) {
      renderTimezoneHelper();
    }

    // Includes stylesheets if enabled
    if (config.styling.fullCalendarCore) {
      require('../node_modules/fullcalendar/dist/fullcalendar.css');
    }
    if (config.styling.fullCalendarTheme) {
      require('./styles/fullcalendar-theme.scss');
    }
    if (config.styling.general) {
      require('./styles/booking.scss');
    }

  };

  // Expose the fullCalendar object for advanced puppeting
  TB.fullCalender = function() {
    if (calendarTarget.fullCalendar === undefined) { return undefined; }
    return calendarTarget.fullCalendar.apply(calendarTarget, arguments);
  };

  return TB;

}

module.exports = new TimekitBooking();
