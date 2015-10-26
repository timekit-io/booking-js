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

  // Setup the Timekit SDK with correct credentials
  var timekitSetup = function() {
    var args = {};

    $.extend(args, config.timekitConfig);

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
    var localTzFormatted = (localTzOffset > 0 ? "+" : "") + localTzOffset;

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
      eventClick: clickCalendarTimeslot
    };

    $.extend(args, config.fullCalendar);

    calendarTarget = $('<div class="bookingjs-calendar">');
    $(config.targetEl).append(calendarTarget);
    calendarTarget.fullCalendar(args);
  };

  // Render the supplied calendar events in FullCalendar
  var renderCalendarEvents = function(eventData) {
    calendarTarget.fullCalendar('addEventSource', {
      events: eventData
    });
  };

  var renderBookingPage = function() {

    // var el = $(
    //     '<div class="bookingjs-bookcard">' +
    //       '<a href=""><' +
    //     '</div>'
    //   );
    // $(config.targetEl).append(el);
  };

  var showBookingPage = function() {

  };

  var hideBookingPage = function() {

  };

  // Event handler when a timeslot is clicked in FullCalendar
  var clickCalendarTimeslot = function(calEvent, jsEvent, view) {
    // $('#bookmeform_start').val(moment(calEvent.start).format());
    // $('#bookmeform_end').val(moment(calEvent.end).format());
    // $('#chosendate').text(moment(calEvent.start).format('D. MMMM YYYY'));
    // $('#chosentime').text(moment(calEvent.start).format('h:mm a') + ' to ' + moment(calEvent.end).format('h:mm a'));
    // $('.bookme_create').show().css('opacity','1');
    showBookingPage();
  };

  var submitBookingForm = function() {

  };

  // Create new event through Timekit SDK
  var timekitCreateEvent = function(data, callback) {
    var args = {
      start: data.start,
      end: data.end,
      what: config.name + ' x '+ data.name,
      where: data.where,
      calendar_id: config.calendar,
      participants: [
        data.email,
        config.email
      ]
    };

    $.extend(args, config.createEvent);

    timekit.createEvent(args)
    .then(function(response){
      callback(response);
    }).catch(function(response){
      utils.log('An error with CreateEvent occured');
      utils.log(response);
    });
  };

  // Render the booking completed page when booking was successful
  var renderBookingCompleted = function() {
    // $('#bookmeform_block .w-form-done').show();
    // $('#bookmeform_block .w-form-fail').hide();
    // $('#bookmeform').hide();
  };

  // Exposed initilization method
  TB.init = function(suppliedConfig) {

    // Check whether a config is supplied
    if(suppliedConfig === undefined || typeof suppliedConfig !== 'object') {
      utils.log('No configuration was supplied. Please supply a config object upon library initialization');
      return;
    }

    // Extend the default config with supplied settings
    $.extend(config, suppliedConfig);

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
