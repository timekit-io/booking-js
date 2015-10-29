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

// External depenencies
var $ = require('jquery');
var timekit = require('timekit-sdk');
var fullcalendar = require('fullcalendar');
var moment = require('moment');

// Internal dependencies
var utils = require('./utils');
var templates = require('./templates');
var defaultConfig = require('./defaults');

// Style dependencies
require('../node_modules/fullcalendar/dist/fullcalendar.css');
require('./styles/fullcalendar.scss');
require('./styles/main.scss');

function timekitBooking() {

  // Export
  var TB = {};

  // Object config
  var config = {};

  // DOM nodes
  var rootTarget;
  var calendarTarget;
  var bookingPageTarget;

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
      utils.log('error', 'An error with Timekit findTime occured', response);
    });
  };

  // Calculate and display timezone helper
  var renderTimezoneHelper = function() {

    var localTzOffset = (new Date()).getTimezoneOffset()/60*-1;
    //var localTzFormatted = (localTzOffset > 0 ? "+" : "") + localTzOffset;

    var timezoneHelperTarget = $('<div class="bookingjs-timezonehelper"><span>Loading...</span></div>');
    rootTarget.append(timezoneHelperTarget);

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

    }).catch(function(response){
      utils.log('error', 'An error with Timekit getUserTimezone occured', response);
    });
  };

  // Setup and render FullCalendar
  var initializeCalendar = function() {

    var sizing = decideCalendarSize(null, true);

    var args = {
      defaultView: sizing.view,
      height: sizing.height,
      eventClick: showBookingPage,
      windowResize: decideCalendarSize
    };

    $.extend(true, args, config.fullCalendar);

    calendarTarget = $('<div class="bookingjs-calendar empty-calendar">');
    rootTarget.append(calendarTarget);

    // Wait until DOM is ready to init (fixes wrong event height bug in fullCalendar)
    calendarTarget.fullCalendar(args);
    rootTarget.addClass('show');

  };

  // Fires when window is resized and calendar must adhere
  var decideCalendarSize = function(view, shouldReturn) {

    var view = 'agendaWeek';
    var height = 550;
    var deviceWidth = $(window).width();

    if (deviceWidth < 480) {
      view = 'basicDay';
      height = 400;
    }

    if (shouldReturn) {
      return {
        height: height,
        view: view
      };
    } else {
      calendarTarget.fullCalendar('changeView', view);
      calendarTarget.fullCalendar('option', 'height', height);
    }
  };

  // Render the supplied calendar events in FullCalendar
  var renderCalendarEvents = function(eventData) {

    calendarTarget.fullCalendar('addEventSource', {
      events: eventData
    });

    calendarTarget.removeClass('empty-calendar');

  };

  // Render the avatar image
  var renderAvatarImage = function() {

    var avatarTarget = templates.avatarImage({
      avatar: config.avatar
    });

    rootTarget.append(avatarTarget);

  };

  // Event handler when a timeslot is clicked in FullCalendar
  var showBookingPage = function(eventData) {

    bookingPageTarget = templates.bookingPage({
      chosenDate: moment(eventData.start).format('D. MMMM YYYY'),
      chosenTime: moment(eventData.start).format('h:mma') + ' to ' + moment(eventData.end).format('h:mma'),
      start: moment(eventData.start).format(),
      end: moment(eventData.start).format(),
      submitText: 'Book it',
      loadingText: 'Wait..'
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

    rootTarget.append(bookingPageTarget);

    setTimeout(function(){
      bookingPageTarget.addClass('show');
    }, 100);

  };

  // Remove the booking page DOM node
  var hideBookingPage = function() {

    bookingPageTarget.removeClass('show');
    setTimeout(function(){
      bookingPageTarget.remove();
    }, 200);

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
      utils.log('error', 'An error with Timekit createEvent occured', response);
    });
  };

  // Create new event through Timekit SDK
  var timekitCreateEvent = function(data) {

    var args = {
      start: data.start,
      end: data.end,
      what: config.name + ' x '+ data.name,
      calendar_id: config.calendar,
      participants: [config.email, data.email],
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
    if(suppliedConfig === undefined || typeof suppliedConfig !== 'object' || $.isEmptyObject(suppliedConfig)) {
      if (window.timekitBookingConfig !== undefined) {
        suppliedConfig = window.timekitBookingConfig;
      } else {
        utils.log('error', 'No configuration was supplied or found. Please supply a config object upon library initialization');
        return;
      }
    }

    // Extend the default config with supplied settings
    $.extend(true, config, defaultConfig, suppliedConfig);

    // Set rootTarget to the target element and clean before child nodes before continuing
    rootTarget = $(config.targetEl).addClass('bookingjs');
    rootTarget.children(':not(script)').remove();

    // Setup Timekit SDK config
    timekitSetup();

    // Initialize FullCalendar
    initializeCalendar();

    // Get availability through Timekit SDK
    timekitFindTime(function(response){
      // Render available timeslots in FullCalendar
      renderCalendarEvents(response.data);
    });

    // Show timezone helper if enabled
    if (config.localization.showTimezoneHelper) {
      renderTimezoneHelper();
    }

    // Show image avatar if set
    if (config.avatar) {
      renderAvatarImage();
    }

    return this;

  };

  // Expose the fullCalendar object for advanced puppeting
  TB.fullCalendar = function() {
    if (calendarTarget.fullCalendar === undefined) { return undefined; }
    return calendarTarget.fullCalendar.apply(calendarTarget, arguments);
  };

  // Autoload if config is available on window
  if (window.timekitBookingConfig && window.timekitBookingConfig.autoload === true) {
    $(window).load(function(){
      TB.init(window.timekitBookingConfig);
    });
  }

  return TB;

}

module.exports = timekitBooking();
