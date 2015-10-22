'use strict';

/*!
 * Booking.js
 * Version: 1.0.0
 * http://booking.timekit.io
 *
 * Copyright 2015 Timekit, Inc.
 * Timekit Booking.js is freely distributable under the MIT license.
 *
 */

var utils = require('./utils');
var timekit = require('timekit-js-sdk');
var $ = require('jquery');

function TimekitBooking() {

  var TB = {};
  var calendarTarget = '';

  // Default config and constants
  var config = {
    targetEl: '#timekit-booking',
    userAssistantEmail: 'assistant@timekit.io',
    userAssistantApiToken: 'S3x4oV7rukW2S9d6Fo5cybITiYQWlatiF2ktImi2',
    userBookableEmail: '',
    userBookableCalendar: '',
    avatar: '',
    timekitConfig: {
      app: 'sign-up'
    },
    findTime: {
      filters: {
        'and': [
          { 'business_hours': {'timezone': 'America/Los_angeles'}},
          { 'exclude_weekend': {'timezone': 'America/Los_angeles'}}
        ],
        'or': [
          { 'specific_day_and_time': {'day': 'Monday', 'start': 10, 'end': 12, 'timezone': 'America/Los_angeles'}},
          { 'specific_day_and_time': {'day': 'Monday', 'start': 16, 'end': 17, 'timezone': 'America/Los_angeles'}},
          { 'specific_day_and_time': {'day': 'Tuesday', 'start': 15, 'end': 18, 'timezone': 'America/Los_angeles'}},
          { 'specific_day_and_time': {'day': 'Tuesday', 'start': 11, 'end': 12, 'timezone': 'America/Los_angeles'}},
          { 'specific_day_and_time': {'day': 'Wednesday', 'start': 15, 'end': 18, 'timezone': 'America/Los_angeles'}},
          { 'specific_day_and_time': {'day': 'Thursday', 'start': 10, 'end': 12, 'timezone': 'America/Los_angeles'}},
          { 'specific_day_and_time': {'day': 'Friday', 'start': 10, 'end': 11, 'timezone': 'America/Los_angeles'}}
        ]
      },
      future: '3 weeks',
      duration: '1 hour'
    },
    createEvent: {
      invite: true
    },
    fullCalendar: {
      header: {
        left: 'today',
        center: '',
        right: 'prev, next'
      },
      views: {
        basic: {
          columnFormat: 'dddd M/D',
          timeFormat: 'h:mm a'
        },
        agenda: {
          timeFormat: 'h:mm a'
        }
      },
      allDaySlot: false,
      scrollTime: '08:00:00',
      minTime: '08:00:00',
      maxTime: '19:00:00',
      timezone: 'America/Los_angeles',
      defaultDate: '2015-10-25'
    },
    localization: {
      showTimezoneHelper: true,
      dateFormat: 'D. MMMM YYYY',
      timeFormat: 'h:mm a'
    }
  };

  // Setup the Timekit SDK with correct credentials
  var timekitSetup = function() {
    var args = {};

    $.extend(args, config.timekitConfig);

    timekit.configure(args);

    timekit.setUser(
      config.userAssistantEmail,
      config.userAssistantApiToken
    );
  };

  // Fetch availabile time through Timekit SDK
  var timekitFindTime = function(callback) {
    var args = { emails: [config.userBookableEmail] };

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
  var calculateTimezones = function() {
    if (config.localization.showTimezoneHelper) {

    }
    // var localTzOffset = (new Date()).getTimezoneOffset()/60*-1;
    // var localTzFormatted = (localTzOffset > 0 ? "+" : "") + localTzOffset;
    // $('#localtimezone').text(localTzFormatted);
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

    calendarTarget = $('<div class="' + 'timekit-booking-calendar' + '">');
    $(config.targetEl).append(calendarTarget);
    calendarTarget.fullCalendar(args);
  };

  // Render the supplied calendar events in FullCalendar
  var renderCalendarEvents = function(eventData) {
    calendarTarget.fullCalendar( 'addEventSource', {
      events: eventData
    });
  };

  // Event handler when a timeslot is clicked in FullCalendar
  var clickCalendarTimeslot = function(calEvent, jsEvent, view) {
    // $('#bookmeform_start').val(moment(calEvent.start).format());
    // $('#bookmeform_end').val(moment(calEvent.end).format());
    // $('#chosendate').text(moment(calEvent.start).format('D. MMMM YYYY'));
    // $('#chosentime').text(moment(calEvent.start).format('h:mm a') + ' to ' + moment(calEvent.end).format('h:mm a'));
    // $('.bookme_create').show().css('opacity','1');
  };

  var renderBookingPage = function() {

  };

  var submitBookingForm = function() {

  };

  // Create new event through Timekit SDK
  var timekitCreateEvent = function(data, callback) {
    var args = {
      start: data.start,
      end: data.end,
      what: config.userBookableName + ' x '+ data.name,
      where: data.where,
      calendar_id: config.userBookableCalendar,
      participants: [
        data.email,
        config.userBookableEmail
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
    if(suppliedConfig == undefined || typeof suppliedConfig !== 'object') {
      utils.log('No configuration was supplied. Please supply a config object upon library initialization');
      return;
    }

    // Extend the default confg with supplied settings
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

  };

  return TB;

};

module.exports = new TimekitBooking();
