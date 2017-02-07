(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery"], factory);
	else if(typeof exports === 'object')
		exports["TimekitBooking"] = factory(require("jquery"));
	else
		root["TimekitBooking"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/*!
	 * Booking.js
	 * Version: 1.9.3
	 * http://timekit.io
	 *
	 * Copyright 2015 Timekit, Inc.
	 * Booking.js is freely distributable under the MIT license.
	 *
	 */
	
	// External depenencies
	var $               = __webpack_require__(1);
	window.fullcalendar = __webpack_require__(2);
	var moment          = window.moment = __webpack_require__(3);
	var timekit         = __webpack_require__(7);
	__webpack_require__(30);
	var interpolate     = __webpack_require__(31);
	
	// Internal dependencies
	var utils         = __webpack_require__(32);
	var defaultConfig = __webpack_require__(34);
	
	// Main library
	function TimekitBooking() {
	
	  // Library config
	  var config = {};
	
	  // DOM nodes
	  var rootTarget;
	  var calendarTarget;
	  var bookingPageTarget;
	
	  // Inject style dependencies
	  var includeStyles = function() {
	    __webpack_require__(35);
	    __webpack_require__(39);
	    __webpack_require__(41);
	    __webpack_require__(43);
	  };
	
	  // Make sure DOM element is ready and clean it
	  var prepareDOM = function() {
	
	    rootTarget = $(config.targetEl);
	    if (rootTarget.length === 0) rootTarget = $('#hourwidget'); // TODO temprorary fix for hour widget migrations
	    if (rootTarget.length === 0) utils.logError('No target DOM element was found (' + config.targetEl + ')');
	    rootTarget.addClass('bookingjs');
	    rootTarget.children(':not(script)').remove();
	
	  };
	
	  // Setup the Timekit SDK with correct config
	  var timekitSetupConfig = function() {
	
	    if (config.app) config.timekitConfig.app = config.app
	    timekit.configure(config.timekitConfig);
	
	  };
	
	  // Setup the Timekit SDK with correct credentials
	  var timekitSetupUser = function() {
	
	    timekit.setUser(config.email, config.apiToken);
	
	  };
	
	  // Fetch availabile time through Timekit SDK
	  var timekitFindTime = function() {
	
	    var args = {};
	
	    // Only add email to findtime if no calendars or users are explicitly specified
	    if (!config.timekitFindTime.calendar_ids && !config.timekitFindTime.user_ids) {
	      args.emails = [config.email];
	    }
	    $.extend(args, config.timekitFindTime);
	
	    utils.doCallback('findTimeStarted', config, args);
	
	    timekit.findTime(args)
	    .then(function(response){
	
	      utils.doCallback('findTimeSuccessful', config, response);
	
	      // Go to first event if enabled
	      if(config.goToFirstEvent && response.data.length > 0) {
	        var firstEventStart = response.data[0].start;
	        var firstEventStartHour = moment(firstEventStart).format('H');
	        goToDate(firstEventStart);
	        scrollToTime(firstEventStartHour);
	      }
	
	      // Render available timeslots in FullCalendar
	      renderCalendarEvents(response.data);
	
	    }).catch(function(response){
	      utils.doCallback('findTimeFailed', config, response);
	      utils.logError('An error with Timekit FindTime occured, context: ' + response);
	    });
	
	  };
	
	  // Tells FullCalendar to go to a specifc date
	  var goToDate = function(date) {
	
	    calendarTarget.fullCalendar('gotoDate', date);
	
	  };
	
	  // Scrolls fullcalendar to the specified hour
	  var scrollToTime = function(time) {
	
	    // Only proceed for agendaWeek view
	    if (calendarTarget.fullCalendar('getView').name !== 'agendaWeek'){
	      return;
	    }
	
	    // Get height of each hour row
	    var hours = calendarTarget.find('.fc-slats .fc-minor');
	    var hourHeight = $(hours[0]).height() * 2;
	
	    // If minTime is set in fullCalendar config, subtract that from the scollTo calculationn
	    var minTimeHeight = 0;
	    if (config.fullCalendar.minTime) {
	      var minTime = moment(config.fullCalendar.minTime, 'HH:mm:ss').format('H');
	      minTimeHeight = hourHeight * minTime;
	    }
	
	    // Calculate scrolling location and container sizes
	    var scrollTo = (hourHeight * time) - minTimeHeight;
	    var scrollable = calendarTarget.find('.fc-scroller');
	    var scrollableHeight = scrollable.height();
	    var scrollableScrollTop = scrollable.scrollTop();
	    var maximumHeight = scrollable.find('.fc-time-grid').height();
	
	    // Only perform the scroll if the scrollTo is outside the current visible boundary
	    if (scrollTo > scrollableScrollTop && scrollTo < scrollableScrollTop + scrollableHeight) {
	      return;
	    }
	
	    // If scrollTo point is past the maximum height, then scroll to maximum possible while still animating
	    if (scrollTo > maximumHeight - scrollableHeight) {
	      scrollTo = maximumHeight - scrollableHeight;
	    }
	
	    // Perform the scrollTo animation
	    scrollable.animate({scrollTop: scrollTo});
	
	  };
	
	  // Calculate and display timezone helper
	  var renderTimezoneHelper = function() {
	
	    var localTzOffset = (moment().utcOffset()/60);
	    var timezoneIcon = __webpack_require__(45);
	
	    var template = __webpack_require__(46);
	
	    var timezoneHelperTarget = $(template.render({
	      timezoneIcon: timezoneIcon,
	      loadingText: config.localization.strings.timezoneHelperLoading,
	      loading: true
	    }));
	
	    rootTarget.addClass('has-timezonehelper');
	    rootTarget.append(timezoneHelperTarget);
	
	    var args = {
	      email: config.email
	    };
	
	    utils.doCallback('getUserTimezoneStarted', config, args);
	
	    timekit.getUserTimezone(args).then(function(response){
	
	      utils.doCallback('getUserTimezoneSuccessful', config, response);
	
	      var hostTzOffset = response.data.utc_offset;
	      var tzOffsetDiff = localTzOffset - hostTzOffset;
	      var tzOffsetDiffAbs = Math.abs(localTzOffset - hostTzOffset);
	      var tzDirection = (tzOffsetDiff > 0 ? 'ahead' : 'behind');
	
	      var template = __webpack_require__(46);
	      var newTimezoneHelperTarget = $(template.render({
	        timezoneIcon: timezoneIcon,
	        timezoneDifference: (tzOffsetDiffAbs === 0 ? false : true),
	        timezoneDifferent: interpolate.sprintf(config.localization.strings.timezoneHelperDifferent, tzOffsetDiffAbs, tzDirection, config.name),
	        timezoneSame: interpolate.sprintf(config.localization.strings.timezoneHelperSame, config.name)
	      }));
	
	      timezoneHelperTarget.replaceWith(newTimezoneHelperTarget);
	
	    }).catch(function(response){
	      utils.doCallback('getUserTimezoneFailed', config, response);
	      utils.logError('An error with Timekit getUserTimezone occured, context: ' + response);
	    });
	
	  };
	
	  // Setup and render FullCalendar
	  var initializeCalendar = function() {
	
	    var sizing = decideCalendarSize();
	
	    var args = {
	      defaultView: sizing.view,
	      height: sizing.height,
	      eventClick: showBookingPage,
	      windowResize: function() {
	        var sizing = decideCalendarSize();
	        calendarTarget.fullCalendar('changeView', sizing.view);
	        calendarTarget.fullCalendar('option', 'height', sizing.height);
	      }
	    };
	
	    $.extend(true, args, config.fullCalendar);
	
	    calendarTarget = $('<div class="bookingjs-calendar empty-calendar">');
	    rootTarget.append(calendarTarget);
	
	    calendarTarget.fullCalendar(args);
	    rootTarget.addClass('show');
	
	    utils.doCallback('fullCalendarInitialized', config);
	
	  };
	
	  // Fires when window is resized and calendar must adhere
	  var decideCalendarSize = function() {
	
	    var view = 'agendaWeek';
	    var height = 420;
	    var rootWidth = rootTarget.width();
	
	    if (rootWidth < 480) {
	      view = 'basicDay';
	      height = 380;
	      rootTarget.addClass('is-small');
	      if (config.avatar) { height -= 15; }
	    } else {
	      rootTarget.removeClass('is-small');
	    }
	
	    if (config.bookingFields.comment.enabled) {  height += 84; }
	    if (config.bookingFields.phone.enabled) {    height += 64; }
	    if (config.bookingFields.voip.enabled) {     height += 64; }
	    if (config.bookingFields.location.enabled) { height += 64; }
	
	    return {
	      height: height,
	      view: view
	    };
	
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
	
	    var template = __webpack_require__(50);
	    var avatarTarget = $(template.render({
	      image: config.avatar
	    }));
	
	    rootTarget.addClass('has-avatar');
	    rootTarget.append(avatarTarget);
	
	  };
	
	  // Render the avatar image
	  var renderDisplayName = function() {
	
	    var template = __webpack_require__(51);
	    var displayNameTarget = $(template.render({
	      name: config.name
	    }));
	
	    rootTarget.addClass('has-displayname');
	    rootTarget.append(displayNameTarget);
	
	  };
	
	  // Event handler when a timeslot is clicked in FullCalendar
	  var showBookingPage = function(eventData) {
	
	    utils.doCallback('showBookingPage', config, eventData);
	
	    var fieldsTemplate = __webpack_require__(52);
	    var template = __webpack_require__(53);
	
	    var dateFormat = config.localization.bookingDateFormat || moment.localeData().longDateFormat('LL');
	    var timeFormat = config.localization.bookingTimeFormat || moment.localeData().longDateFormat('LT');
	
	    bookingPageTarget = $(template.render({
	      chosenDate:           moment(eventData.start).format(dateFormat),
	      chosenTime:           moment(eventData.start).format(timeFormat) + ' - ' + moment(eventData.end).format(timeFormat),
	      start:                moment(eventData.start).format(),
	      end:                  moment(eventData.end).format(),
	      closeIcon:            __webpack_require__(54),
	      checkmarkIcon:        __webpack_require__(55),
	      loadingIcon:          __webpack_require__(56),
	      errorIcon:            __webpack_require__(57),
	      submitText:           config.localization.strings.submitText,
	      successMessageTitle:  config.localization.strings.successMessageTitle,
	      successMessageBody:   interpolate.sprintf(config.localization.strings.successMessageBody, '<span class="booked-email"></span>'),
	      fields:               config.bookingFields
	    }, {
	      formFields: fieldsTemplate
	    }));
	
	    bookingPageTarget.children('.bookingjs-bookpage-close').click(function(e) {
	      e.preventDefault();
	      hideBookingPage();
	    });
	
	    var form = bookingPageTarget.children('.bookingjs-form');
	
	    form.submit(function(e) {
	      submitBookingForm(this, e);
	    });
	
	    // Show powered by Timekit message
	    if (config.showCredits) {
	      renderPoweredByMessage(bookingPageTarget);
	    }
	
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
	
	    utils.doCallback('closeBookingPage', config);
	
	    bookingPageTarget.removeClass('show');
	
	    setTimeout(function(){
	      bookingPageTarget.remove();
	    }, 200);
	
	    $(document).off('keyup');
	
	  };
	
	  // Event handler on form submit
	  var submitBookingForm = function(form, e) {
	
	    e.preventDefault();
	
	    var formElement = $(form);
	    var submitButton = formElement.find('.bookingjs-form-button');
	
	    // Hide booking details
	    if(submitButton.hasClass('selfclosing')) {
	      hideBookingPage();
	      return;
	    }
	
	    // Abort if form is submitting, have submitted or does not validate
	    if(formElement.hasClass('loading') || formElement.hasClass('success') || formElement.hasClass('error') || !e.target.checkValidity()) {
	      submitButton.addClass('button-shake');
	      setTimeout(function() {
	        submitButton.removeClass('button-shake');
	      }, 500);
	      return;
	    }
	
	    var values = {};
	    $.each(formElement.serializeArray(), function(i, field) {
	        values[field.name] = field.value;
	    });
	
	    formElement.addClass('loading');
	
	    utils.doCallback('submitBookingForm', config, values);
	
	    // Call create event endpoint
	    timekitCreateBooking(values).then(function(response){
	
	      utils.doCallback('createBookingSuccessful', config, response);
	
	      formElement.find('.booked-email').html(values.email);
	      formElement.removeClass('loading').addClass('success');
	      if(config.closeFormOnSuccessButtonClick){ submitButton.addClass('selfclosing') }
	
	    }).catch(function(response){
	
	      utils.doCallback('createBookingFailed', config, response);
	
	      var submitButton = formElement.find('.bookingjs-form-button');
	      submitButton.addClass('button-shake');
	      setTimeout(function() {
	        submitButton.removeClass('button-shake');
	      }, 500);
	
	      formElement.removeClass('loading').addClass('error');
	      setTimeout(function() {
	        formElement.removeClass('error');
	      }, 2000);
	
	      utils.logError('An error with Timekit createBooking occured, context: ' + response);
	    });
	
	  };
	
	  // Create new booking
	  var timekitCreateBooking = function(data) {
	
	    var args = {
	      event: {
	        start: data.start,
	        end: data.end,
	        what: config.name + ' x ' + data.name,
	        where: 'TBD',
	        description: '',
	        calendar_id: config.calendar,
	        participants: [data.email]
	      },
	      customer: {
	        name: data.name,
	        email: data.email,
	        timezone: moment.tz.guess()
	      }
	    };
	
	    if (config.bookingFields.location.enabled) { args.event.where = data.location; }
	    if (config.bookingFields.comment.enabled) {
	      args.event.description += config.bookingFields.comment.placeholder + ': ' + data.comment + '\n';
	    }
	    if (config.bookingFields.phone.enabled) {
	      args.customer.phone = data.phone;
	      args.event.description += config.bookingFields.phone.placeholder + ': ' + data.phone + '\n';
	    }
	    if (config.bookingFields.voip.enabled) {
	      args.customer.voip = data.voip;
	      args.event.description += config.bookingFields.voip.placeholder + ': ' + data.voip + '\n';
	    }
	
	    $.extend(true, args, config.timekitCreateBooking);
	
	    utils.doCallback('createBookingStarted', config, args);
	
	    var requestHeaders = {
	      'Timekit-OutputTimestampFormat': 'Y-m-d ' + config.localization.emailTimeFormat + ' (P e)'
	    };
	
	    return timekit
	    .include('attributes', 'event')
	    .headers(requestHeaders)
	    .createBooking(args);
	
	  };
	
	  // Render the powered by Timekit message
	  var renderPoweredByMessage = function(pageTarget) {
	
	    var campaignName = 'widget'
	    var campaignSource = window.location.hostname.replace(/\./g, '-')
	    if (config.widgetSlug) { campaignName = 'hosted-widget'; }
	    if (config.widgetId) { campaignName = 'embedded-widget'; }
	
	    var template = __webpack_require__(58);
	    var timekitLogo = __webpack_require__(59);
	    var poweredTarget = $(template.render({
	      timekitLogo: timekitLogo,
	      campaignName: campaignName,
	      campaignSource: campaignSource
	    }));
	
	    pageTarget.append(poweredTarget);
	
	  };
	
	  // Set config defaults
	  var setConfigDefaults = function(suppliedConfig) {
	    return $.extend(true, {}, defaultConfig.primary, suppliedConfig);
	  }
	
	  // Setup config
	  var setConfig = function(suppliedConfig) {
	
	    // Check whether a config is supplied
	    if(suppliedConfig === undefined || typeof suppliedConfig !== 'object' || $.isEmptyObject(suppliedConfig)) {
	      utils.logError('No configuration was supplied or found. Please supply a config object upon library initialization');
	    }
	
	    // Extend the default config with supplied settings
	    var newConfig = setConfigDefaults(suppliedConfig);
	
	    // Apply timeDateFormat presets
	    var presetsConfig = {};
	    if(newConfig.localization.timeDateFormat === '24h-dmy-mon') {
	      presetsConfig = defaultConfig.presets.timeDateFormat24hdmymon;
	    } else if(newConfig.localization.timeDateFormat === '12h-mdy-sun') {
	      presetsConfig = defaultConfig.presets.timeDateFormat12hmdysun;
	    }
	    var finalConfig = $.extend(true, {}, presetsConfig, newConfig);
	
	    // Apply bookingGraph presets
	    presetsConfig = {};
	    if(newConfig.bookingGraph === 'instant') {
	      presetsConfig = defaultConfig.presets.bookingInstant;
	    } else if(newConfig.bookingGraph === 'confirm_decline') {
	      presetsConfig = defaultConfig.presets.bookingConfirmDecline;
	    }
	    finalConfig = $.extend(true, {}, presetsConfig, finalConfig);
	
	    // Check for required settings
	    if(!finalConfig.email || !finalConfig.apiToken || !finalConfig.calendar) {
	      utils.logError('A required config setting was missing ("email", "apiToken" or "calendar")');
	    }
	
	    // Set new config to instance config
	    config = finalConfig;
	
	    return config;
	
	  };
	
	  // Get library config
	  var getConfig = function() {
	
	    return config;
	
	  };
	
	  // Render method
	  var render = function() {
	
	    // Include library styles if enabled
	    includeStyles();
	
	    // Set rootTarget to the target element and clean before child nodes before continuing
	    prepareDOM();
	
	    // Setup Timekit SDK config
	    timekitSetupConfig();
	    timekitSetupUser();
	
	    // Initialize FullCalendar
	    initializeCalendar();
	
	    // Get availability through Timekit SDK
	    timekitFindTime();
	
	    // Show timezone helper if enabled
	    if (config.localization.showTimezoneHelper) {
	      renderTimezoneHelper();
	    }
	
	    // Show image avatar if set
	    if (config.avatar) {
	      renderAvatarImage();
	    }
	
	    // Print out display name
	    if (config.name) {
	      renderDisplayName();
	    }
	
	    utils.doCallback('renderCompleted', config);
	
	    return this;
	
	  };
	
	  // Initilization method
	  var init = function(suppliedConfig) {
	
	    // Start from local config
	    if (!suppliedConfig.widgetId && !suppliedConfig.widgetSlug) {
	      return start(suppliedConfig)
	    }
	
	    // Load remote config
	    return loadRemoteConfig(suppliedConfig)
	    .then(function (response) {
	      var mergedConfig = $.extend(true, {}, response.data.config, suppliedConfig);
	      start(mergedConfig)
	    })
	
	  };
	
	  // Load config from remote (embed or hosted)
	  var loadRemoteConfig = function(suppliedConfig) {
	
	    config = setConfigDefaults(suppliedConfig)
	    timekitSetupConfig();
	    if (suppliedConfig.widgetId) {
	      return timekit
	      .getEmbedWidget({ id: suppliedConfig.widgetId })
	      .catch(function () {
	        utils.logError('The widget could not be found, please double-check your widgetId');
	      })
	    }
	    if (suppliedConfig.widgetSlug) {
	      return timekit
	      .getHostedWidget({ slug: suppliedConfig.widgetSlug })
	      .catch(function () {
	        utils.logError('The widget could not be found, please double-check your widgetSlug');
	      })
	    } else {
	      utils.logError('No widget configuration, widgetSlug or widgetId found');
	    }
	
	  }
	
	  var start = function(suppliedConfig) {
	
	    // Handle config and defaults
	    setConfig(suppliedConfig);
	    return render();
	
	  }
	
	  var destroy = function() {
	
	    prepareDOM();
	    config = {};
	    return this;
	
	  };
	
	  // The fullCalendar object for advanced puppeting
	  var fullCalendar = function() {
	
	    if (calendarTarget.fullCalendar === undefined) { return undefined; }
	    return calendarTarget.fullCalendar.apply(calendarTarget, arguments);
	
	  };
	
	  // Expose methods
	  return {
	    setConfig:    setConfig,
	    getConfig:    getConfig,
	    render:       render,
	    init:         init,
	    destroy:      destroy,
	    fullCalendar: fullCalendar,
	    timekitSdk:   timekit
	  };
	
	}
	
	// Autoload if config is available on window, else export function
	// TODO temprorary fix for hour widget migrations
	var globalLibraryConfig = window.timekitBookingConfig || window.hourWidgetConfig
	if (window && globalLibraryConfig && globalLibraryConfig.autoload !== false) {
	  $(window).load(function(){
	    var instance = new TimekitBooking();
	    instance.init(globalLibraryConfig);
	    module.exports = instance;
	  });
	} else {
	  module.exports = TimekitBooking;
	}


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * <%= meta.title %> v<%= meta.version %>
	 * Docs & License: <%= meta.homepage %>
	 * (c) <%= meta.copyright %>
	 */
	
	(function(factory) {
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(1), __webpack_require__(3) ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof exports === 'object') { // Node/CommonJS
			module.exports = factory(require('jquery'), require('moment'));
		}
		else {
			factory(jQuery, moment);
		}
	})(function($, moment) {
	
	;;
	
	var FC = $.fullCalendar = {
		version: "<%= meta.version %>",
		internalApiVersion: 5
	};
	var fcViews = FC.views = {};
	
	
	$.fn.fullCalendar = function(options) {
		var args = Array.prototype.slice.call(arguments, 1); // for a possible method call
		var res = this; // what this function will return (this jQuery object by default)
	
		this.each(function(i, _element) { // loop each DOM element involved
			var element = $(_element);
			var calendar = element.data('fullCalendar'); // get the existing calendar object (if any)
			var singleRes; // the returned value of this single method call
	
			// a method call
			if (typeof options === 'string') {
				if (calendar && $.isFunction(calendar[options])) {
					singleRes = calendar[options].apply(calendar, args);
					if (!i) {
						res = singleRes; // record the first method call result
					}
					if (options === 'destroy') { // for the destroy method, must remove Calendar object data
						element.removeData('fullCalendar');
					}
				}
			}
			// a new calendar initialization
			else if (!calendar) { // don't initialize twice
				calendar = new Calendar(element, options);
				element.data('fullCalendar', calendar);
				calendar.render();
			}
		});
		
		return res;
	};
	
	
	var complexOptions = [ // names of options that are objects whose properties should be combined
		'header',
		'buttonText',
		'buttonIcons',
		'themeButtonIcons'
	];
	
	
	// Merges an array of option objects into a single object
	function mergeOptions(optionObjs) {
		return mergeProps(optionObjs, complexOptions);
	}
	
	
	// Given options specified for the calendar's constructor, massages any legacy options into a non-legacy form.
	// Converts View-Option-Hashes into the View-Specific-Options format.
	function massageOverrides(input) {
		var overrides = { views: input.views || {} }; // the output. ensure a `views` hash
		var subObj;
	
		// iterate through all option override properties (except `views`)
		$.each(input, function(name, val) {
			if (name != 'views') {
	
				// could the value be a legacy View-Option-Hash?
				if (
					$.isPlainObject(val) &&
					!/(time|duration|interval)$/i.test(name) && // exclude duration options. might be given as objects
					$.inArray(name, complexOptions) == -1 // complex options aren't allowed to be View-Option-Hashes
				) {
					subObj = null;
	
					// iterate through the properties of this possible View-Option-Hash value
					$.each(val, function(subName, subVal) {
	
						// is the property targeting a view?
						if (/^(month|week|day|default|basic(Week|Day)?|agenda(Week|Day)?)$/.test(subName)) {
							if (!overrides.views[subName]) { // ensure the view-target entry exists
								overrides.views[subName] = {};
							}
							overrides.views[subName][name] = subVal; // record the value in the `views` object
						}
						else { // a non-View-Option-Hash property
							if (!subObj) {
								subObj = {};
							}
							subObj[subName] = subVal; // accumulate these unrelated values for later
						}
					});
	
					if (subObj) { // non-View-Option-Hash properties? transfer them as-is
						overrides[name] = subObj;
					}
				}
				else {
					overrides[name] = val; // transfer normal options as-is
				}
			}
		});
	
		return overrides;
	}
	
	;;
	
	// exports
	FC.intersectRanges = intersectRanges;
	FC.applyAll = applyAll;
	FC.debounce = debounce;
	FC.isInt = isInt;
	FC.htmlEscape = htmlEscape;
	FC.cssToStr = cssToStr;
	FC.proxy = proxy;
	FC.capitaliseFirstLetter = capitaliseFirstLetter;
	
	
	/* FullCalendar-specific DOM Utilities
	----------------------------------------------------------------------------------------------------------------------*/
	
	
	// Given the scrollbar widths of some other container, create borders/margins on rowEls in order to match the left
	// and right space that was offset by the scrollbars. A 1-pixel border first, then margin beyond that.
	function compensateScroll(rowEls, scrollbarWidths) {
		if (scrollbarWidths.left) {
			rowEls.css({
				'border-left-width': 1,
				'margin-left': scrollbarWidths.left - 1
			});
		}
		if (scrollbarWidths.right) {
			rowEls.css({
				'border-right-width': 1,
				'margin-right': scrollbarWidths.right - 1
			});
		}
	}
	
	
	// Undoes compensateScroll and restores all borders/margins
	function uncompensateScroll(rowEls) {
		rowEls.css({
			'margin-left': '',
			'margin-right': '',
			'border-left-width': '',
			'border-right-width': ''
		});
	}
	
	
	// Make the mouse cursor express that an event is not allowed in the current area
	function disableCursor() {
		$('body').addClass('fc-not-allowed');
	}
	
	
	// Returns the mouse cursor to its original look
	function enableCursor() {
		$('body').removeClass('fc-not-allowed');
	}
	
	
	// Given a total available height to fill, have `els` (essentially child rows) expand to accomodate.
	// By default, all elements that are shorter than the recommended height are expanded uniformly, not considering
	// any other els that are already too tall. if `shouldRedistribute` is on, it considers these tall rows and 
	// reduces the available height.
	function distributeHeight(els, availableHeight, shouldRedistribute) {
	
		// *FLOORING NOTE*: we floor in certain places because zoom can give inaccurate floating-point dimensions,
		// and it is better to be shorter than taller, to avoid creating unnecessary scrollbars.
	
		var minOffset1 = Math.floor(availableHeight / els.length); // for non-last element
		var minOffset2 = Math.floor(availableHeight - minOffset1 * (els.length - 1)); // for last element *FLOORING NOTE*
		var flexEls = []; // elements that are allowed to expand. array of DOM nodes
		var flexOffsets = []; // amount of vertical space it takes up
		var flexHeights = []; // actual css height
		var usedHeight = 0;
	
		undistributeHeight(els); // give all elements their natural height
	
		// find elements that are below the recommended height (expandable).
		// important to query for heights in a single first pass (to avoid reflow oscillation).
		els.each(function(i, el) {
			var minOffset = i === els.length - 1 ? minOffset2 : minOffset1;
			var naturalOffset = $(el).outerHeight(true);
	
			if (naturalOffset < minOffset) {
				flexEls.push(el);
				flexOffsets.push(naturalOffset);
				flexHeights.push($(el).height());
			}
			else {
				// this element stretches past recommended height (non-expandable). mark the space as occupied.
				usedHeight += naturalOffset;
			}
		});
	
		// readjust the recommended height to only consider the height available to non-maxed-out rows.
		if (shouldRedistribute) {
			availableHeight -= usedHeight;
			minOffset1 = Math.floor(availableHeight / flexEls.length);
			minOffset2 = Math.floor(availableHeight - minOffset1 * (flexEls.length - 1)); // *FLOORING NOTE*
		}
	
		// assign heights to all expandable elements
		$(flexEls).each(function(i, el) {
			var minOffset = i === flexEls.length - 1 ? minOffset2 : minOffset1;
			var naturalOffset = flexOffsets[i];
			var naturalHeight = flexHeights[i];
			var newHeight = minOffset - (naturalOffset - naturalHeight); // subtract the margin/padding
	
			if (naturalOffset < minOffset) { // we check this again because redistribution might have changed things
				$(el).height(newHeight);
			}
		});
	}
	
	
	// Undoes distrubuteHeight, restoring all els to their natural height
	function undistributeHeight(els) {
		els.height('');
	}
	
	
	// Given `els`, a jQuery set of <td> cells, find the cell with the largest natural width and set the widths of all the
	// cells to be that width.
	// PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
	function matchCellWidths(els) {
		var maxInnerWidth = 0;
	
		els.find('> span').each(function(i, innerEl) {
			var innerWidth = $(innerEl).outerWidth();
			if (innerWidth > maxInnerWidth) {
				maxInnerWidth = innerWidth;
			}
		});
	
		maxInnerWidth++; // sometimes not accurate of width the text needs to stay on one line. insurance
	
		els.width(maxInnerWidth);
	
		return maxInnerWidth;
	}
	
	
	// Given one element that resides inside another,
	// Subtracts the height of the inner element from the outer element.
	function subtractInnerElHeight(outerEl, innerEl) {
		var both = outerEl.add(innerEl);
		var diff;
	
		// effin' IE8/9/10/11 sometimes returns 0 for dimensions. this weird hack was the only thing that worked
		both.css({
			position: 'relative', // cause a reflow, which will force fresh dimension recalculation
			left: -1 // ensure reflow in case the el was already relative. negative is less likely to cause new scroll
		});
		diff = outerEl.outerHeight() - innerEl.outerHeight(); // grab the dimensions
		both.css({ position: '', left: '' }); // undo hack
	
		return diff;
	}
	
	
	/* Element Geom Utilities
	----------------------------------------------------------------------------------------------------------------------*/
	
	FC.getOuterRect = getOuterRect;
	FC.getClientRect = getClientRect;
	FC.getContentRect = getContentRect;
	FC.getScrollbarWidths = getScrollbarWidths;
	
	
	// borrowed from https://github.com/jquery/jquery-ui/blob/1.11.0/ui/core.js#L51
	function getScrollParent(el) {
		var position = el.css('position'),
			scrollParent = el.parents().filter(function() {
				var parent = $(this);
				return (/(auto|scroll)/).test(
					parent.css('overflow') + parent.css('overflow-y') + parent.css('overflow-x')
				);
			}).eq(0);
	
		return position === 'fixed' || !scrollParent.length ? $(el[0].ownerDocument || document) : scrollParent;
	}
	
	
	// Queries the outer bounding area of a jQuery element.
	// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
	// Origin is optional.
	function getOuterRect(el, origin) {
		var offset = el.offset();
		var left = offset.left - (origin ? origin.left : 0);
		var top = offset.top - (origin ? origin.top : 0);
	
		return {
			left: left,
			right: left + el.outerWidth(),
			top: top,
			bottom: top + el.outerHeight()
		};
	}
	
	
	// Queries the area within the margin/border/scrollbars of a jQuery element. Does not go within the padding.
	// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
	// Origin is optional.
	// NOTE: should use clientLeft/clientTop, but very unreliable cross-browser.
	function getClientRect(el, origin) {
		var offset = el.offset();
		var scrollbarWidths = getScrollbarWidths(el);
		var left = offset.left + getCssFloat(el, 'border-left-width') + scrollbarWidths.left - (origin ? origin.left : 0);
		var top = offset.top + getCssFloat(el, 'border-top-width') + scrollbarWidths.top - (origin ? origin.top : 0);
	
		return {
			left: left,
			right: left + el[0].clientWidth, // clientWidth includes padding but NOT scrollbars
			top: top,
			bottom: top + el[0].clientHeight // clientHeight includes padding but NOT scrollbars
		};
	}
	
	
	// Queries the area within the margin/border/padding of a jQuery element. Assumed not to have scrollbars.
	// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
	// Origin is optional.
	function getContentRect(el, origin) {
		var offset = el.offset(); // just outside of border, margin not included
		var left = offset.left + getCssFloat(el, 'border-left-width') + getCssFloat(el, 'padding-left') -
			(origin ? origin.left : 0);
		var top = offset.top + getCssFloat(el, 'border-top-width') + getCssFloat(el, 'padding-top') -
			(origin ? origin.top : 0);
	
		return {
			left: left,
			right: left + el.width(),
			top: top,
			bottom: top + el.height()
		};
	}
	
	
	// Returns the computed left/right/top/bottom scrollbar widths for the given jQuery element.
	// NOTE: should use clientLeft/clientTop, but very unreliable cross-browser.
	function getScrollbarWidths(el) {
		var leftRightWidth = el.innerWidth() - el[0].clientWidth; // the paddings cancel out, leaving the scrollbars
		var widths = {
			left: 0,
			right: 0,
			top: 0,
			bottom: el.innerHeight() - el[0].clientHeight // the paddings cancel out, leaving the bottom scrollbar
		};
	
		if (getIsLeftRtlScrollbars() && el.css('direction') == 'rtl') { // is the scrollbar on the left side?
			widths.left = leftRightWidth;
		}
		else {
			widths.right = leftRightWidth;
		}
	
		return widths;
	}
	
	
	// Logic for determining if, when the element is right-to-left, the scrollbar appears on the left side
	
	var _isLeftRtlScrollbars = null;
	
	function getIsLeftRtlScrollbars() { // responsible for caching the computation
		if (_isLeftRtlScrollbars === null) {
			_isLeftRtlScrollbars = computeIsLeftRtlScrollbars();
		}
		return _isLeftRtlScrollbars;
	}
	
	function computeIsLeftRtlScrollbars() { // creates an offscreen test element, then removes it
		var el = $('<div><div/></div>')
			.css({
				position: 'absolute',
				top: -1000,
				left: 0,
				border: 0,
				padding: 0,
				overflow: 'scroll',
				direction: 'rtl'
			})
			.appendTo('body');
		var innerEl = el.children();
		var res = innerEl.offset().left > el.offset().left; // is the inner div shifted to accommodate a left scrollbar?
		el.remove();
		return res;
	}
	
	
	// Retrieves a jQuery element's computed CSS value as a floating-point number.
	// If the queried value is non-numeric (ex: IE can return "medium" for border width), will just return zero.
	function getCssFloat(el, prop) {
		return parseFloat(el.css(prop)) || 0;
	}
	
	
	/* Mouse / Touch Utilities
	----------------------------------------------------------------------------------------------------------------------*/
	
	FC.preventDefault = preventDefault;
	
	
	// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
	function isPrimaryMouseButton(ev) {
		return ev.which == 1 && !ev.ctrlKey;
	}
	
	
	function getEvX(ev) {
		if (ev.pageX !== undefined) {
			return ev.pageX;
		}
		var touches = ev.originalEvent.touches;
		if (touches) {
			return touches[0].pageX;
		}
	}
	
	
	function getEvY(ev) {
		if (ev.pageY !== undefined) {
			return ev.pageY;
		}
		var touches = ev.originalEvent.touches;
		if (touches) {
			return touches[0].pageY;
		}
	}
	
	
	function getEvIsTouch(ev) {
		return /^touch/.test(ev.type);
	}
	
	
	function preventSelection(el) {
		el.addClass('fc-unselectable')
			.on('selectstart', preventDefault);
	}
	
	
	// Stops a mouse/touch event from doing it's native browser action
	function preventDefault(ev) {
		ev.preventDefault();
	}
	
	
	// attach a handler to get called when ANY scroll action happens on the page.
	// this was impossible to do with normal on/off because 'scroll' doesn't bubble.
	// http://stackoverflow.com/a/32954565/96342
	// returns `true` on success.
	function bindAnyScroll(handler) {
		if (window.addEventListener) {
			window.addEventListener('scroll', handler, true); // useCapture=true
			return true;
		}
		return false;
	}
	
	
	// undoes bindAnyScroll. must pass in the original function.
	// returns `true` on success.
	function unbindAnyScroll(handler) {
		if (window.removeEventListener) {
			window.removeEventListener('scroll', handler, true); // useCapture=true
			return true;
		}
		return false;
	}
	
	
	/* General Geometry Utils
	----------------------------------------------------------------------------------------------------------------------*/
	
	FC.intersectRects = intersectRects;
	
	// Returns a new rectangle that is the intersection of the two rectangles. If they don't intersect, returns false
	function intersectRects(rect1, rect2) {
		var res = {
			left: Math.max(rect1.left, rect2.left),
			right: Math.min(rect1.right, rect2.right),
			top: Math.max(rect1.top, rect2.top),
			bottom: Math.min(rect1.bottom, rect2.bottom)
		};
	
		if (res.left < res.right && res.top < res.bottom) {
			return res;
		}
		return false;
	}
	
	
	// Returns a new point that will have been moved to reside within the given rectangle
	function constrainPoint(point, rect) {
		return {
			left: Math.min(Math.max(point.left, rect.left), rect.right),
			top: Math.min(Math.max(point.top, rect.top), rect.bottom)
		};
	}
	
	
	// Returns a point that is the center of the given rectangle
	function getRectCenter(rect) {
		return {
			left: (rect.left + rect.right) / 2,
			top: (rect.top + rect.bottom) / 2
		};
	}
	
	
	// Subtracts point2's coordinates from point1's coordinates, returning a delta
	function diffPoints(point1, point2) {
		return {
			left: point1.left - point2.left,
			top: point1.top - point2.top
		};
	}
	
	
	/* Object Ordering by Field
	----------------------------------------------------------------------------------------------------------------------*/
	
	FC.parseFieldSpecs = parseFieldSpecs;
	FC.compareByFieldSpecs = compareByFieldSpecs;
	FC.compareByFieldSpec = compareByFieldSpec;
	FC.flexibleCompare = flexibleCompare;
	
	
	function parseFieldSpecs(input) {
		var specs = [];
		var tokens = [];
		var i, token;
	
		if (typeof input === 'string') {
			tokens = input.split(/\s*,\s*/);
		}
		else if (typeof input === 'function') {
			tokens = [ input ];
		}
		else if ($.isArray(input)) {
			tokens = input;
		}
	
		for (i = 0; i < tokens.length; i++) {
			token = tokens[i];
	
			if (typeof token === 'string') {
				specs.push(
					token.charAt(0) == '-' ?
						{ field: token.substring(1), order: -1 } :
						{ field: token, order: 1 }
				);
			}
			else if (typeof token === 'function') {
				specs.push({ func: token });
			}
		}
	
		return specs;
	}
	
	
	function compareByFieldSpecs(obj1, obj2, fieldSpecs) {
		var i;
		var cmp;
	
		for (i = 0; i < fieldSpecs.length; i++) {
			cmp = compareByFieldSpec(obj1, obj2, fieldSpecs[i]);
			if (cmp) {
				return cmp;
			}
		}
	
		return 0;
	}
	
	
	function compareByFieldSpec(obj1, obj2, fieldSpec) {
		if (fieldSpec.func) {
			return fieldSpec.func(obj1, obj2);
		}
		return flexibleCompare(obj1[fieldSpec.field], obj2[fieldSpec.field]) *
			(fieldSpec.order || 1);
	}
	
	
	function flexibleCompare(a, b) {
		if (!a && !b) {
			return 0;
		}
		if (b == null) {
			return -1;
		}
		if (a == null) {
			return 1;
		}
		if ($.type(a) === 'string' || $.type(b) === 'string') {
			return String(a).localeCompare(String(b));
		}
		return a - b;
	}
	
	
	/* FullCalendar-specific Misc Utilities
	----------------------------------------------------------------------------------------------------------------------*/
	
	
	// Computes the intersection of the two ranges. Returns undefined if no intersection.
	// Expects all dates to be normalized to the same timezone beforehand.
	// TODO: move to date section?
	function intersectRanges(subjectRange, constraintRange) {
		var subjectStart = subjectRange.start;
		var subjectEnd = subjectRange.end;
		var constraintStart = constraintRange.start;
		var constraintEnd = constraintRange.end;
		var segStart, segEnd;
		var isStart, isEnd;
	
		if (subjectEnd > constraintStart && subjectStart < constraintEnd) { // in bounds at all?
	
			if (subjectStart >= constraintStart) {
				segStart = subjectStart.clone();
				isStart = true;
			}
			else {
				segStart = constraintStart.clone();
				isStart =  false;
			}
	
			if (subjectEnd <= constraintEnd) {
				segEnd = subjectEnd.clone();
				isEnd = true;
			}
			else {
				segEnd = constraintEnd.clone();
				isEnd = false;
			}
	
			return {
				start: segStart,
				end: segEnd,
				isStart: isStart,
				isEnd: isEnd
			};
		}
	}
	
	
	/* Date Utilities
	----------------------------------------------------------------------------------------------------------------------*/
	
	FC.computeIntervalUnit = computeIntervalUnit;
	FC.divideRangeByDuration = divideRangeByDuration;
	FC.divideDurationByDuration = divideDurationByDuration;
	FC.multiplyDuration = multiplyDuration;
	FC.durationHasTime = durationHasTime;
	
	var dayIDs = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
	var intervalUnits = [ 'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond' ];
	
	
	// Diffs the two moments into a Duration where full-days are recorded first, then the remaining time.
	// Moments will have their timezones normalized.
	function diffDayTime(a, b) {
		return moment.duration({
			days: a.clone().stripTime().diff(b.clone().stripTime(), 'days'),
			ms: a.time() - b.time() // time-of-day from day start. disregards timezone
		});
	}
	
	
	// Diffs the two moments via their start-of-day (regardless of timezone). Produces whole-day durations.
	function diffDay(a, b) {
		return moment.duration({
			days: a.clone().stripTime().diff(b.clone().stripTime(), 'days')
		});
	}
	
	
	// Diffs two moments, producing a duration, made of a whole-unit-increment of the given unit. Uses rounding.
	function diffByUnit(a, b, unit) {
		return moment.duration(
			Math.round(a.diff(b, unit, true)), // returnFloat=true
			unit
		);
	}
	
	
	// Computes the unit name of the largest whole-unit period of time.
	// For example, 48 hours will be "days" whereas 49 hours will be "hours".
	// Accepts start/end, a range object, or an original duration object.
	function computeIntervalUnit(start, end) {
		var i, unit;
		var val;
	
		for (i = 0; i < intervalUnits.length; i++) {
			unit = intervalUnits[i];
			val = computeRangeAs(unit, start, end);
	
			if (val >= 1 && isInt(val)) {
				break;
			}
		}
	
		return unit; // will be "milliseconds" if nothing else matches
	}
	
	
	// Computes the number of units (like "hours") in the given range.
	// Range can be a {start,end} object, separate start/end args, or a Duration.
	// Results are based on Moment's .as() and .diff() methods, so results can depend on internal handling
	// of month-diffing logic (which tends to vary from version to version).
	function computeRangeAs(unit, start, end) {
	
		if (end != null) { // given start, end
			return end.diff(start, unit, true);
		}
		else if (moment.isDuration(start)) { // given duration
			return start.as(unit);
		}
		else { // given { start, end } range object
			return start.end.diff(start.start, unit, true);
		}
	}
	
	
	// Intelligently divides a range (specified by a start/end params) by a duration
	function divideRangeByDuration(start, end, dur) {
		var months;
	
		if (durationHasTime(dur)) {
			return (end - start) / dur;
		}
		months = dur.asMonths();
		if (Math.abs(months) >= 1 && isInt(months)) {
			return end.diff(start, 'months', true) / months;
		}
		return end.diff(start, 'days', true) / dur.asDays();
	}
	
	
	// Intelligently divides one duration by another
	function divideDurationByDuration(dur1, dur2) {
		var months1, months2;
	
		if (durationHasTime(dur1) || durationHasTime(dur2)) {
			return dur1 / dur2;
		}
		months1 = dur1.asMonths();
		months2 = dur2.asMonths();
		if (
			Math.abs(months1) >= 1 && isInt(months1) &&
			Math.abs(months2) >= 1 && isInt(months2)
		) {
			return months1 / months2;
		}
		return dur1.asDays() / dur2.asDays();
	}
	
	
	// Intelligently multiplies a duration by a number
	function multiplyDuration(dur, n) {
		var months;
	
		if (durationHasTime(dur)) {
			return moment.duration(dur * n);
		}
		months = dur.asMonths();
		if (Math.abs(months) >= 1 && isInt(months)) {
			return moment.duration({ months: months * n });
		}
		return moment.duration({ days: dur.asDays() * n });
	}
	
	
	// Returns a boolean about whether the given duration has any time parts (hours/minutes/seconds/ms)
	function durationHasTime(dur) {
		return Boolean(dur.hours() || dur.minutes() || dur.seconds() || dur.milliseconds());
	}
	
	
	function isNativeDate(input) {
		return  Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
	}
	
	
	// Returns a boolean about whether the given input is a time string, like "06:40:00" or "06:00"
	function isTimeString(str) {
		return /^\d+\:\d+(?:\:\d+\.?(?:\d{3})?)?$/.test(str);
	}
	
	
	/* Logging and Debug
	----------------------------------------------------------------------------------------------------------------------*/
	
	FC.log = function() {
		var console = window.console;
	
		if (console && console.log) {
			return console.log.apply(console, arguments);
		}
	};
	
	FC.warn = function() {
		var console = window.console;
	
		if (console && console.warn) {
			return console.warn.apply(console, arguments);
		}
		else {
			return FC.log.apply(FC, arguments);
		}
	};
	
	
	/* General Utilities
	----------------------------------------------------------------------------------------------------------------------*/
	
	var hasOwnPropMethod = {}.hasOwnProperty;
	
	
	// Merges an array of objects into a single object.
	// The second argument allows for an array of property names who's object values will be merged together.
	function mergeProps(propObjs, complexProps) {
		var dest = {};
		var i, name;
		var complexObjs;
		var j, val;
		var props;
	
		if (complexProps) {
			for (i = 0; i < complexProps.length; i++) {
				name = complexProps[i];
				complexObjs = [];
	
				// collect the trailing object values, stopping when a non-object is discovered
				for (j = propObjs.length - 1; j >= 0; j--) {
					val = propObjs[j][name];
	
					if (typeof val === 'object') {
						complexObjs.unshift(val);
					}
					else if (val !== undefined) {
						dest[name] = val; // if there were no objects, this value will be used
						break;
					}
				}
	
				// if the trailing values were objects, use the merged value
				if (complexObjs.length) {
					dest[name] = mergeProps(complexObjs);
				}
			}
		}
	
		// copy values into the destination, going from last to first
		for (i = propObjs.length - 1; i >= 0; i--) {
			props = propObjs[i];
	
			for (name in props) {
				if (!(name in dest)) { // if already assigned by previous props or complex props, don't reassign
					dest[name] = props[name];
				}
			}
		}
	
		return dest;
	}
	
	
	// Create an object that has the given prototype. Just like Object.create
	function createObject(proto) {
		var f = function() {};
		f.prototype = proto;
		return new f();
	}
	
	
	function copyOwnProps(src, dest) {
		for (var name in src) {
			if (hasOwnProp(src, name)) {
				dest[name] = src[name];
			}
		}
	}
	
	
	// Copies over certain methods with the same names as Object.prototype methods. Overcomes an IE<=8 bug:
	// https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
	function copyNativeMethods(src, dest) {
		var names = [ 'constructor', 'toString', 'valueOf' ];
		var i, name;
	
		for (i = 0; i < names.length; i++) {
			name = names[i];
	
			if (src[name] !== Object.prototype[name]) {
				dest[name] = src[name];
			}
		}
	}
	
	
	function hasOwnProp(obj, name) {
		return hasOwnPropMethod.call(obj, name);
	}
	
	
	// Is the given value a non-object non-function value?
	function isAtomic(val) {
		return /undefined|null|boolean|number|string/.test($.type(val));
	}
	
	
	function applyAll(functions, thisObj, args) {
		if ($.isFunction(functions)) {
			functions = [ functions ];
		}
		if (functions) {
			var i;
			var ret;
			for (i=0; i<functions.length; i++) {
				ret = functions[i].apply(thisObj, args) || ret;
			}
			return ret;
		}
	}
	
	
	function firstDefined() {
		for (var i=0; i<arguments.length; i++) {
			if (arguments[i] !== undefined) {
				return arguments[i];
			}
		}
	}
	
	
	function htmlEscape(s) {
		return (s + '').replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/'/g, '&#039;')
			.replace(/"/g, '&quot;')
			.replace(/\n/g, '<br />');
	}
	
	
	function stripHtmlEntities(text) {
		return text.replace(/&.*?;/g, '');
	}
	
	
	// Given a hash of CSS properties, returns a string of CSS.
	// Uses property names as-is (no camel-case conversion). Will not make statements for null/undefined values.
	function cssToStr(cssProps) {
		var statements = [];
	
		$.each(cssProps, function(name, val) {
			if (val != null) {
				statements.push(name + ':' + val);
			}
		});
	
		return statements.join(';');
	}
	
	
	function capitaliseFirstLetter(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	
	
	function compareNumbers(a, b) { // for .sort()
		return a - b;
	}
	
	
	function isInt(n) {
		return n % 1 === 0;
	}
	
	
	// Returns a method bound to the given object context.
	// Just like one of the jQuery.proxy signatures, but without the undesired behavior of treating the same method with
	// different contexts as identical when binding/unbinding events.
	function proxy(obj, methodName) {
		var method = obj[methodName];
	
		return function() {
			return method.apply(obj, arguments);
		};
	}
	
	
	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	// https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L714
	function debounce(func, wait, immediate) {
		var timeout, args, context, timestamp, result;
	
		var later = function() {
			var last = +new Date() - timestamp;
			if (last < wait) {
				timeout = setTimeout(later, wait - last);
			}
			else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					context = args = null;
				}
			}
		};
	
		return function() {
			context = this;
			args = arguments;
			timestamp = +new Date();
			var callNow = immediate && !timeout;
			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}
			return result;
		};
	}
	
	
	// HACK around jQuery's now A+ promises: execute callback synchronously if already resolved.
	// thenFunc shouldn't accept args.
	// similar to whenResources in Scheduler plugin.
	function syncThen(promise, thenFunc) {
		// not a promise, or an already-resolved promise?
		if (!promise || !promise.then || promise.state() === 'resolved') {
			return $.when(thenFunc()); // resolve immediately
		}
		else if (thenFunc) {
			return promise.then(thenFunc);
		}
	}
	
	;;
	
	var ambigDateOfMonthRegex = /^\s*\d{4}-\d\d$/;
	var ambigTimeOrZoneRegex =
		/^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/;
	var newMomentProto = moment.fn; // where we will attach our new methods
	var oldMomentProto = $.extend({}, newMomentProto); // copy of original moment methods
	var allowValueOptimization;
	var setUTCValues; // function defined below
	var setLocalValues; // function defined below
	
	
	// Creating
	// -------------------------------------------------------------------------------------------------
	
	// Creates a new moment, similar to the vanilla moment(...) constructor, but with
	// extra features (ambiguous time, enhanced formatting). When given an existing moment,
	// it will function as a clone (and retain the zone of the moment). Anything else will
	// result in a moment in the local zone.
	FC.moment = function() {
		return makeMoment(arguments);
	};
	
	// Sames as FC.moment, but forces the resulting moment to be in the UTC timezone.
	FC.moment.utc = function() {
		var mom = makeMoment(arguments, true);
	
		// Force it into UTC because makeMoment doesn't guarantee it
		// (if given a pre-existing moment for example)
		if (mom.hasTime()) { // don't give ambiguously-timed moments a UTC zone
			mom.utc();
		}
	
		return mom;
	};
	
	// Same as FC.moment, but when given an ISO8601 string, the timezone offset is preserved.
	// ISO8601 strings with no timezone offset will become ambiguously zoned.
	FC.moment.parseZone = function() {
		return makeMoment(arguments, true, true);
	};
	
	// Builds an enhanced moment from args. When given an existing moment, it clones. When given a
	// native Date, or called with no arguments (the current time), the resulting moment will be local.
	// Anything else needs to be "parsed" (a string or an array), and will be affected by:
	//    parseAsUTC - if there is no zone information, should we parse the input in UTC?
	//    parseZone - if there is zone information, should we force the zone of the moment?
	function makeMoment(args, parseAsUTC, parseZone) {
		var input = args[0];
		var isSingleString = args.length == 1 && typeof input === 'string';
		var isAmbigTime;
		var isAmbigZone;
		var ambigMatch;
		var mom;
	
		if (moment.isMoment(input)) {
			mom = moment.apply(null, args); // clone it
			transferAmbigs(input, mom); // the ambig flags weren't transfered with the clone
		}
		else if (isNativeDate(input) || input === undefined) {
			mom = moment.apply(null, args); // will be local
		}
		else { // "parsing" is required
			isAmbigTime = false;
			isAmbigZone = false;
	
			if (isSingleString) {
				if (ambigDateOfMonthRegex.test(input)) {
					// accept strings like '2014-05', but convert to the first of the month
					input += '-01';
					args = [ input ]; // for when we pass it on to moment's constructor
					isAmbigTime = true;
					isAmbigZone = true;
				}
				else if ((ambigMatch = ambigTimeOrZoneRegex.exec(input))) {
					isAmbigTime = !ambigMatch[5]; // no time part?
					isAmbigZone = true;
				}
			}
			else if ($.isArray(input)) {
				// arrays have no timezone information, so assume ambiguous zone
				isAmbigZone = true;
			}
			// otherwise, probably a string with a format
	
			if (parseAsUTC || isAmbigTime) {
				mom = moment.utc.apply(moment, args);
			}
			else {
				mom = moment.apply(null, args);
			}
	
			if (isAmbigTime) {
				mom._ambigTime = true;
				mom._ambigZone = true; // ambiguous time always means ambiguous zone
			}
			else if (parseZone) { // let's record the inputted zone somehow
				if (isAmbigZone) {
					mom._ambigZone = true;
				}
				else if (isSingleString) {
					if (mom.utcOffset) {
						mom.utcOffset(input); // if not a valid zone, will assign UTC
					}
					else {
						mom.zone(input); // for moment-pre-2.9
					}
				}
			}
		}
	
		mom._fullCalendar = true; // flag for extended functionality
	
		return mom;
	}
	
	
	// A clone method that works with the flags related to our enhanced functionality.
	// In the future, use moment.momentProperties
	newMomentProto.clone = function() {
		var mom = oldMomentProto.clone.apply(this, arguments);
	
		// these flags weren't transfered with the clone
		transferAmbigs(this, mom);
		if (this._fullCalendar) {
			mom._fullCalendar = true;
		}
	
		return mom;
	};
	
	
	// Week Number
	// -------------------------------------------------------------------------------------------------
	
	
	// Returns the week number, considering the locale's custom week number calcuation
	// `weeks` is an alias for `week`
	newMomentProto.week = newMomentProto.weeks = function(input) {
		var weekCalc = (this._locale || this._lang) // works pre-moment-2.8
			._fullCalendar_weekCalc;
	
		if (input == null && typeof weekCalc === 'function') { // custom function only works for getter
			return weekCalc(this);
		}
		else if (weekCalc === 'ISO') {
			return oldMomentProto.isoWeek.apply(this, arguments); // ISO getter/setter
		}
	
		return oldMomentProto.week.apply(this, arguments); // local getter/setter
	};
	
	
	// Time-of-day
	// -------------------------------------------------------------------------------------------------
	
	// GETTER
	// Returns a Duration with the hours/minutes/seconds/ms values of the moment.
	// If the moment has an ambiguous time, a duration of 00:00 will be returned.
	//
	// SETTER
	// You can supply a Duration, a Moment, or a Duration-like argument.
	// When setting the time, and the moment has an ambiguous time, it then becomes unambiguous.
	newMomentProto.time = function(time) {
	
		// Fallback to the original method (if there is one) if this moment wasn't created via FullCalendar.
		// `time` is a generic enough method name where this precaution is necessary to avoid collisions w/ other plugins.
		if (!this._fullCalendar) {
			return oldMomentProto.time.apply(this, arguments);
		}
	
		if (time == null) { // getter
			return moment.duration({
				hours: this.hours(),
				minutes: this.minutes(),
				seconds: this.seconds(),
				milliseconds: this.milliseconds()
			});
		}
		else { // setter
	
			this._ambigTime = false; // mark that the moment now has a time
	
			if (!moment.isDuration(time) && !moment.isMoment(time)) {
				time = moment.duration(time);
			}
	
			// The day value should cause overflow (so 24 hours becomes 00:00:00 of next day).
			// Only for Duration times, not Moment times.
			var dayHours = 0;
			if (moment.isDuration(time)) {
				dayHours = Math.floor(time.asDays()) * 24;
			}
	
			// We need to set the individual fields.
			// Can't use startOf('day') then add duration. In case of DST at start of day.
			return this.hours(dayHours + time.hours())
				.minutes(time.minutes())
				.seconds(time.seconds())
				.milliseconds(time.milliseconds());
		}
	};
	
	// Converts the moment to UTC, stripping out its time-of-day and timezone offset,
	// but preserving its YMD. A moment with a stripped time will display no time
	// nor timezone offset when .format() is called.
	newMomentProto.stripTime = function() {
		var a;
	
		if (!this._ambigTime) {
	
			// get the values before any conversion happens
			a = this.toArray(); // array of y/m/d/h/m/s/ms
	
			// TODO: use keepLocalTime in the future
			this.utc(); // set the internal UTC flag (will clear the ambig flags)
			setUTCValues(this, a.slice(0, 3)); // set the year/month/date. time will be zero
	
			// Mark the time as ambiguous. This needs to happen after the .utc() call, which might call .utcOffset(),
			// which clears all ambig flags. Same with setUTCValues with moment-timezone.
			this._ambigTime = true;
			this._ambigZone = true; // if ambiguous time, also ambiguous timezone offset
		}
	
		return this; // for chaining
	};
	
	// Returns if the moment has a non-ambiguous time (boolean)
	newMomentProto.hasTime = function() {
		return !this._ambigTime;
	};
	
	
	// Timezone
	// -------------------------------------------------------------------------------------------------
	
	// Converts the moment to UTC, stripping out its timezone offset, but preserving its
	// YMD and time-of-day. A moment with a stripped timezone offset will display no
	// timezone offset when .format() is called.
	// TODO: look into Moment's keepLocalTime functionality
	newMomentProto.stripZone = function() {
		var a, wasAmbigTime;
	
		if (!this._ambigZone) {
	
			// get the values before any conversion happens
			a = this.toArray(); // array of y/m/d/h/m/s/ms
			wasAmbigTime = this._ambigTime;
	
			this.utc(); // set the internal UTC flag (might clear the ambig flags, depending on Moment internals)
			setUTCValues(this, a); // will set the year/month/date/hours/minutes/seconds/ms
	
			// the above call to .utc()/.utcOffset() unfortunately might clear the ambig flags, so restore
			this._ambigTime = wasAmbigTime || false;
	
			// Mark the zone as ambiguous. This needs to happen after the .utc() call, which might call .utcOffset(),
			// which clears the ambig flags. Same with setUTCValues with moment-timezone.
			this._ambigZone = true;
		}
	
		return this; // for chaining
	};
	
	// Returns of the moment has a non-ambiguous timezone offset (boolean)
	newMomentProto.hasZone = function() {
		return !this._ambigZone;
	};
	
	
	// this method implicitly marks a zone
	newMomentProto.local = function() {
		var a = this.toArray(); // year,month,date,hours,minutes,seconds,ms as an array
		var wasAmbigZone = this._ambigZone;
	
		oldMomentProto.local.apply(this, arguments);
	
		// ensure non-ambiguous
		// this probably already happened via local() -> utcOffset(), but don't rely on Moment's internals
		this._ambigTime = false;
		this._ambigZone = false;
	
		if (wasAmbigZone) {
			// If the moment was ambiguously zoned, the date fields were stored as UTC.
			// We want to preserve these, but in local time.
			// TODO: look into Moment's keepLocalTime functionality
			setLocalValues(this, a);
		}
	
		return this; // for chaining
	};
	
	
	// implicitly marks a zone
	newMomentProto.utc = function() {
		oldMomentProto.utc.apply(this, arguments);
	
		// ensure non-ambiguous
		// this probably already happened via utc() -> utcOffset(), but don't rely on Moment's internals
		this._ambigTime = false;
		this._ambigZone = false;
	
		return this;
	};
	
	
	// methods for arbitrarily manipulating timezone offset.
	// should clear time/zone ambiguity when called.
	$.each([
		'zone', // only in moment-pre-2.9. deprecated afterwards
		'utcOffset'
	], function(i, name) {
		if (oldMomentProto[name]) { // original method exists?
	
			// this method implicitly marks a zone (will probably get called upon .utc() and .local())
			newMomentProto[name] = function(tzo) {
	
				if (tzo != null) { // setter
					// these assignments needs to happen before the original zone method is called.
					// I forget why, something to do with a browser crash.
					this._ambigTime = false;
					this._ambigZone = false;
				}
	
				return oldMomentProto[name].apply(this, arguments);
			};
		}
	});
	
	
	// Formatting
	// -------------------------------------------------------------------------------------------------
	
	newMomentProto.format = function() {
		if (this._fullCalendar && arguments[0]) { // an enhanced moment? and a format string provided?
			return formatDate(this, arguments[0]); // our extended formatting
		}
		if (this._ambigTime) {
			return oldMomentFormat(this, 'YYYY-MM-DD');
		}
		if (this._ambigZone) {
			return oldMomentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
		}
		return oldMomentProto.format.apply(this, arguments);
	};
	
	newMomentProto.toISOString = function() {
		if (this._ambigTime) {
			return oldMomentFormat(this, 'YYYY-MM-DD');
		}
		if (this._ambigZone) {
			return oldMomentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
		}
		return oldMomentProto.toISOString.apply(this, arguments);
	};
	
	
	// Querying
	// -------------------------------------------------------------------------------------------------
	
	// Is the moment within the specified range? `end` is exclusive.
	// FYI, this method is not a standard Moment method, so always do our enhanced logic.
	newMomentProto.isWithin = function(start, end) {
		var a = commonlyAmbiguate([ this, start, end ]);
		return a[0] >= a[1] && a[0] < a[2];
	};
	
	// When isSame is called with units, timezone ambiguity is normalized before the comparison happens.
	// If no units specified, the two moments must be identically the same, with matching ambig flags.
	newMomentProto.isSame = function(input, units) {
		var a;
	
		// only do custom logic if this is an enhanced moment
		if (!this._fullCalendar) {
			return oldMomentProto.isSame.apply(this, arguments);
		}
	
		if (units) {
			a = commonlyAmbiguate([ this, input ], true); // normalize timezones but don't erase times
			return oldMomentProto.isSame.call(a[0], a[1], units);
		}
		else {
			input = FC.moment.parseZone(input); // normalize input
			return oldMomentProto.isSame.call(this, input) &&
				Boolean(this._ambigTime) === Boolean(input._ambigTime) &&
				Boolean(this._ambigZone) === Boolean(input._ambigZone);
		}
	};
	
	// Make these query methods work with ambiguous moments
	$.each([
		'isBefore',
		'isAfter'
	], function(i, methodName) {
		newMomentProto[methodName] = function(input, units) {
			var a;
	
			// only do custom logic if this is an enhanced moment
			if (!this._fullCalendar) {
				return oldMomentProto[methodName].apply(this, arguments);
			}
	
			a = commonlyAmbiguate([ this, input ]);
			return oldMomentProto[methodName].call(a[0], a[1], units);
		};
	});
	
	
	// Misc Internals
	// -------------------------------------------------------------------------------------------------
	
	// given an array of moment-like inputs, return a parallel array w/ moments similarly ambiguated.
	// for example, of one moment has ambig time, but not others, all moments will have their time stripped.
	// set `preserveTime` to `true` to keep times, but only normalize zone ambiguity.
	// returns the original moments if no modifications are necessary.
	function commonlyAmbiguate(inputs, preserveTime) {
		var anyAmbigTime = false;
		var anyAmbigZone = false;
		var len = inputs.length;
		var moms = [];
		var i, mom;
	
		// parse inputs into real moments and query their ambig flags
		for (i = 0; i < len; i++) {
			mom = inputs[i];
			if (!moment.isMoment(mom)) {
				mom = FC.moment.parseZone(mom);
			}
			anyAmbigTime = anyAmbigTime || mom._ambigTime;
			anyAmbigZone = anyAmbigZone || mom._ambigZone;
			moms.push(mom);
		}
	
		// strip each moment down to lowest common ambiguity
		// use clones to avoid modifying the original moments
		for (i = 0; i < len; i++) {
			mom = moms[i];
			if (!preserveTime && anyAmbigTime && !mom._ambigTime) {
				moms[i] = mom.clone().stripTime();
			}
			else if (anyAmbigZone && !mom._ambigZone) {
				moms[i] = mom.clone().stripZone();
			}
		}
	
		return moms;
	}
	
	// Transfers all the flags related to ambiguous time/zone from the `src` moment to the `dest` moment
	// TODO: look into moment.momentProperties for this.
	function transferAmbigs(src, dest) {
		if (src._ambigTime) {
			dest._ambigTime = true;
		}
		else if (dest._ambigTime) {
			dest._ambigTime = false;
		}
	
		if (src._ambigZone) {
			dest._ambigZone = true;
		}
		else if (dest._ambigZone) {
			dest._ambigZone = false;
		}
	}
	
	
	// Sets the year/month/date/etc values of the moment from the given array.
	// Inefficient because it calls each individual setter.
	function setMomentValues(mom, a) {
		mom.year(a[0] || 0)
			.month(a[1] || 0)
			.date(a[2] || 0)
			.hours(a[3] || 0)
			.minutes(a[4] || 0)
			.seconds(a[5] || 0)
			.milliseconds(a[6] || 0);
	}
	
	// Can we set the moment's internal date directly?
	allowValueOptimization = '_d' in moment() && 'updateOffset' in moment;
	
	// Utility function. Accepts a moment and an array of the UTC year/month/date/etc values to set.
	// Assumes the given moment is already in UTC mode.
	setUTCValues = allowValueOptimization ? function(mom, a) {
		// simlate what moment's accessors do
		mom._d.setTime(Date.UTC.apply(Date, a));
		moment.updateOffset(mom, false); // keepTime=false
	} : setMomentValues;
	
	// Utility function. Accepts a moment and an array of the local year/month/date/etc values to set.
	// Assumes the given moment is already in local mode.
	setLocalValues = allowValueOptimization ? function(mom, a) {
		// simlate what moment's accessors do
		mom._d.setTime(+new Date( // FYI, there is now way to apply an array of args to a constructor
			a[0] || 0,
			a[1] || 0,
			a[2] || 0,
			a[3] || 0,
			a[4] || 0,
			a[5] || 0,
			a[6] || 0
		));
		moment.updateOffset(mom, false); // keepTime=false
	} : setMomentValues;
	
	;;
	
	// Single Date Formatting
	// -------------------------------------------------------------------------------------------------
	
	
	// call this if you want Moment's original format method to be used
	function oldMomentFormat(mom, formatStr) {
		return oldMomentProto.format.call(mom, formatStr); // oldMomentProto defined in moment-ext.js
	}
	
	
	// Formats `date` with a Moment formatting string, but allow our non-zero areas and
	// additional token.
	function formatDate(date, formatStr) {
		return formatDateWithChunks(date, getFormatStringChunks(formatStr));
	}
	
	
	function formatDateWithChunks(date, chunks) {
		var s = '';
		var i;
	
		for (i=0; i<chunks.length; i++) {
			s += formatDateWithChunk(date, chunks[i]);
		}
	
		return s;
	}
	
	
	// addition formatting tokens we want recognized
	var tokenOverrides = {
		t: function(date) { // "a" or "p"
			return oldMomentFormat(date, 'a').charAt(0);
		},
		T: function(date) { // "A" or "P"
			return oldMomentFormat(date, 'A').charAt(0);
		}
	};
	
	
	function formatDateWithChunk(date, chunk) {
		var token;
		var maybeStr;
	
		if (typeof chunk === 'string') { // a literal string
			return chunk;
		}
		else if ((token = chunk.token)) { // a token, like "YYYY"
			if (tokenOverrides[token]) {
				return tokenOverrides[token](date); // use our custom token
			}
			return oldMomentFormat(date, token);
		}
		else if (chunk.maybe) { // a grouping of other chunks that must be non-zero
			maybeStr = formatDateWithChunks(date, chunk.maybe);
			if (maybeStr.match(/[1-9]/)) {
				return maybeStr;
			}
		}
	
		return '';
	}
	
	
	// Date Range Formatting
	// -------------------------------------------------------------------------------------------------
	// TODO: make it work with timezone offset
	
	// Using a formatting string meant for a single date, generate a range string, like
	// "Sep 2 - 9 2013", that intelligently inserts a separator where the dates differ.
	// If the dates are the same as far as the format string is concerned, just return a single
	// rendering of one date, without any separator.
	function formatRange(date1, date2, formatStr, separator, isRTL) {
		var localeData;
	
		date1 = FC.moment.parseZone(date1);
		date2 = FC.moment.parseZone(date2);
	
		localeData = (date1.localeData || date1.lang).call(date1); // works with moment-pre-2.8
	
		// Expand localized format strings, like "LL" -> "MMMM D YYYY"
		formatStr = localeData.longDateFormat(formatStr) || formatStr;
		// BTW, this is not important for `formatDate` because it is impossible to put custom tokens
		// or non-zero areas in Moment's localized format strings.
	
		separator = separator || ' - ';
	
		return formatRangeWithChunks(
			date1,
			date2,
			getFormatStringChunks(formatStr),
			separator,
			isRTL
		);
	}
	FC.formatRange = formatRange; // expose
	
	
	function formatRangeWithChunks(date1, date2, chunks, separator, isRTL) {
		var unzonedDate1 = date1.clone().stripZone(); // for formatSimilarChunk
		var unzonedDate2 = date2.clone().stripZone(); // "
		var chunkStr; // the rendering of the chunk
		var leftI;
		var leftStr = '';
		var rightI;
		var rightStr = '';
		var middleI;
		var middleStr1 = '';
		var middleStr2 = '';
		var middleStr = '';
	
		// Start at the leftmost side of the formatting string and continue until you hit a token
		// that is not the same between dates.
		for (leftI=0; leftI<chunks.length; leftI++) {
			chunkStr = formatSimilarChunk(date1, date2, unzonedDate1, unzonedDate2, chunks[leftI]);
			if (chunkStr === false) {
				break;
			}
			leftStr += chunkStr;
		}
	
		// Similarly, start at the rightmost side of the formatting string and move left
		for (rightI=chunks.length-1; rightI>leftI; rightI--) {
			chunkStr = formatSimilarChunk(date1, date2, unzonedDate1, unzonedDate2,  chunks[rightI]);
			if (chunkStr === false) {
				break;
			}
			rightStr = chunkStr + rightStr;
		}
	
		// The area in the middle is different for both of the dates.
		// Collect them distinctly so we can jam them together later.
		for (middleI=leftI; middleI<=rightI; middleI++) {
			middleStr1 += formatDateWithChunk(date1, chunks[middleI]);
			middleStr2 += formatDateWithChunk(date2, chunks[middleI]);
		}
	
		if (middleStr1 || middleStr2) {
			if (isRTL) {
				middleStr = middleStr2 + separator + middleStr1;
			}
			else {
				middleStr = middleStr1 + separator + middleStr2;
			}
		}
	
		return leftStr + middleStr + rightStr;
	}
	
	
	var similarUnitMap = {
		Y: 'year',
		M: 'month',
		D: 'day', // day of month
		d: 'day', // day of week
		// prevents a separator between anything time-related...
		A: 'second', // AM/PM
		a: 'second', // am/pm
		T: 'second', // A/P
		t: 'second', // a/p
		H: 'second', // hour (24)
		h: 'second', // hour (12)
		m: 'second', // minute
		s: 'second' // second
	};
	// TODO: week maybe?
	
	
	// Given a formatting chunk, and given that both dates are similar in the regard the
	// formatting chunk is concerned, format date1 against `chunk`. Otherwise, return `false`.
	function formatSimilarChunk(date1, date2, unzonedDate1, unzonedDate2, chunk) {
		var token;
		var unit;
	
		if (typeof chunk === 'string') { // a literal string
			return chunk;
		}
		else if ((token = chunk.token)) {
			unit = similarUnitMap[token.charAt(0)];
	
			// are the dates the same for this unit of measurement?
			// use the unzoned dates for this calculation because unreliable when near DST (bug #2396)
			if (unit && unzonedDate1.isSame(unzonedDate2, unit)) {
				return oldMomentFormat(date1, token); // would be the same if we used `date2`
				// BTW, don't support custom tokens
			}
		}
	
		return false; // the chunk is NOT the same for the two dates
		// BTW, don't support splitting on non-zero areas
	}
	
	
	// Chunking Utils
	// -------------------------------------------------------------------------------------------------
	
	
	var formatStringChunkCache = {};
	
	
	function getFormatStringChunks(formatStr) {
		if (formatStr in formatStringChunkCache) {
			return formatStringChunkCache[formatStr];
		}
		return (formatStringChunkCache[formatStr] = chunkFormatString(formatStr));
	}
	
	
	// Break the formatting string into an array of chunks
	function chunkFormatString(formatStr) {
		var chunks = [];
		var chunker = /\[([^\]]*)\]|\(([^\)]*)\)|(LTS|LT|(\w)\4*o?)|([^\w\[\(]+)/g; // TODO: more descrimination
		var match;
	
		while ((match = chunker.exec(formatStr))) {
			if (match[1]) { // a literal string inside [ ... ]
				chunks.push(match[1]);
			}
			else if (match[2]) { // non-zero formatting inside ( ... )
				chunks.push({ maybe: chunkFormatString(match[2]) });
			}
			else if (match[3]) { // a formatting token
				chunks.push({ token: match[3] });
			}
			else if (match[5]) { // an unenclosed literal string
				chunks.push(match[5]);
			}
		}
	
		return chunks;
	}
	
	;;
	
	FC.Class = Class; // export
	
	// Class that all other classes will inherit from
	function Class() { }
	
	
	// Called on a class to create a subclass.
	// Last argument contains instance methods. Any argument before the last are considered mixins.
	Class.extend = function() {
		var len = arguments.length;
		var i;
		var members;
	
		for (i = 0; i < len; i++) {
			members = arguments[i];
			if (i < len - 1) { // not the last argument?
				mixIntoClass(this, members);
			}
		}
	
		return extendClass(this, members || {}); // members will be undefined if no arguments
	};
	
	
	// Adds new member variables/methods to the class's prototype.
	// Can be called with another class, or a plain object hash containing new members.
	Class.mixin = function(members) {
		mixIntoClass(this, members);
	};
	
	
	function extendClass(superClass, members) {
		var subClass;
	
		// ensure a constructor for the subclass, forwarding all arguments to the super-constructor if it doesn't exist
		if (hasOwnProp(members, 'constructor')) {
			subClass = members.constructor;
		}
		if (typeof subClass !== 'function') {
			subClass = members.constructor = function() {
				superClass.apply(this, arguments);
			};
		}
	
		// build the base prototype for the subclass, which is an new object chained to the superclass's prototype
		subClass.prototype = createObject(superClass.prototype);
	
		// copy each member variable/method onto the the subclass's prototype
		copyOwnProps(members, subClass.prototype);
		copyNativeMethods(members, subClass.prototype); // hack for IE8
	
		// copy over all class variables/methods to the subclass, such as `extend` and `mixin`
		copyOwnProps(superClass, subClass);
	
		return subClass;
	}
	
	
	function mixIntoClass(theClass, members) {
		copyOwnProps(members, theClass.prototype); // TODO: copyNativeMethods?
	}
	;;
	
	var EmitterMixin = FC.EmitterMixin = {
	
		// jQuery-ification via $(this) allows a non-DOM object to have
		// the same event handling capabilities (including namespaces).
	
	
		on: function(types, handler) {
	
			// handlers are always called with an "event" object as their first param.
			// sneak the `this` context and arguments into the extra parameter object
			// and forward them on to the original handler.
			var intercept = function(ev, extra) {
				return handler.apply(
					extra.context || this,
					extra.args || []
				);
			};
	
			// mimick jQuery's internal "proxy" system (risky, I know)
			// causing all functions with the same .guid to appear to be the same.
			// https://github.com/jquery/jquery/blob/2.2.4/src/core.js#L448
			// this is needed for calling .off with the original non-intercept handler.
			if (!handler.guid) {
				handler.guid = $.guid++;
			}
			intercept.guid = handler.guid;
	
			$(this).on(types, intercept);
	
			return this; // for chaining
		},
	
	
		off: function(types, handler) {
			$(this).off(types, handler);
	
			return this; // for chaining
		},
	
	
		trigger: function(types) {
			var args = Array.prototype.slice.call(arguments, 1); // arguments after the first
	
			// pass in "extra" info to the intercept
			$(this).triggerHandler(types, { args: args });
	
			return this; // for chaining
		},
	
	
		triggerWith: function(types, context, args) {
	
			// `triggerHandler` is less reliant on the DOM compared to `trigger`.
			// pass in "extra" info to the intercept.
			$(this).triggerHandler(types, { context: context, args: args });
	
			return this; // for chaining
		}
	
	};
	
	;;
	
	/*
	Utility methods for easily listening to events on another object,
	and more importantly, easily unlistening from them.
	*/
	var ListenerMixin = FC.ListenerMixin = (function() {
		var guid = 0;
		var ListenerMixin = {
	
			listenerId: null,
	
			/*
			Given an `other` object that has on/off methods, bind the given `callback` to an event by the given name.
			The `callback` will be called with the `this` context of the object that .listenTo is being called on.
			Can be called:
				.listenTo(other, eventName, callback)
			OR
				.listenTo(other, {
					eventName1: callback1,
					eventName2: callback2
				})
			*/
			listenTo: function(other, arg, callback) {
				if (typeof arg === 'object') { // given dictionary of callbacks
					for (var eventName in arg) {
						if (arg.hasOwnProperty(eventName)) {
							this.listenTo(other, eventName, arg[eventName]);
						}
					}
				}
				else if (typeof arg === 'string') {
					other.on(
						arg + '.' + this.getListenerNamespace(), // use event namespacing to identify this object
						$.proxy(callback, this) // always use `this` context
							// the usually-undesired jQuery guid behavior doesn't matter,
							// because we always unbind via namespace
					);
				}
			},
	
			/*
			Causes the current object to stop listening to events on the `other` object.
			`eventName` is optional. If omitted, will stop listening to ALL events on `other`.
			*/
			stopListeningTo: function(other, eventName) {
				other.off((eventName || '') + '.' + this.getListenerNamespace());
			},
	
			/*
			Returns a string, unique to this object, to be used for event namespacing
			*/
			getListenerNamespace: function() {
				if (this.listenerId == null) {
					this.listenerId = guid++;
				}
				return '_listener' + this.listenerId;
			}
	
		};
		return ListenerMixin;
	})();
	;;
	
	// simple class for toggle a `isIgnoringMouse` flag on delay
	// initMouseIgnoring must first be called, with a millisecond delay setting.
	var MouseIgnorerMixin = {
	
		isIgnoringMouse: false, // bool
		delayUnignoreMouse: null, // method
	
	
		initMouseIgnoring: function(delay) {
			this.delayUnignoreMouse = debounce(proxy(this, 'unignoreMouse'), delay || 1000);
		},
	
	
		// temporarily ignore mouse actions on segments
		tempIgnoreMouse: function() {
			this.isIgnoringMouse = true;
			this.delayUnignoreMouse();
		},
	
	
		// delayUnignoreMouse eventually calls this
		unignoreMouse: function() {
			this.isIgnoringMouse = false;
		}
	
	};
	
	;;
	
	/* A rectangular panel that is absolutely positioned over other content
	------------------------------------------------------------------------------------------------------------------------
	Options:
		- className (string)
		- content (HTML string or jQuery element set)
		- parentEl
		- top
		- left
		- right (the x coord of where the right edge should be. not a "CSS" right)
		- autoHide (boolean)
		- show (callback)
		- hide (callback)
	*/
	
	var Popover = Class.extend(ListenerMixin, {
	
		isHidden: true,
		options: null,
		el: null, // the container element for the popover. generated by this object
		margin: 10, // the space required between the popover and the edges of the scroll container
	
	
		constructor: function(options) {
			this.options = options || {};
		},
	
	
		// Shows the popover on the specified position. Renders it if not already
		show: function() {
			if (this.isHidden) {
				if (!this.el) {
					this.render();
				}
				this.el.show();
				this.position();
				this.isHidden = false;
				this.trigger('show');
			}
		},
	
	
		// Hides the popover, through CSS, but does not remove it from the DOM
		hide: function() {
			if (!this.isHidden) {
				this.el.hide();
				this.isHidden = true;
				this.trigger('hide');
			}
		},
	
	
		// Creates `this.el` and renders content inside of it
		render: function() {
			var _this = this;
			var options = this.options;
	
			this.el = $('<div class="fc-popover"/>')
				.addClass(options.className || '')
				.css({
					// position initially to the top left to avoid creating scrollbars
					top: 0,
					left: 0
				})
				.append(options.content)
				.appendTo(options.parentEl);
	
			// when a click happens on anything inside with a 'fc-close' className, hide the popover
			this.el.on('click', '.fc-close', function() {
				_this.hide();
			});
	
			if (options.autoHide) {
				this.listenTo($(document), 'mousedown', this.documentMousedown);
			}
		},
	
	
		// Triggered when the user clicks *anywhere* in the document, for the autoHide feature
		documentMousedown: function(ev) {
			// only hide the popover if the click happened outside the popover
			if (this.el && !$(ev.target).closest(this.el).length) {
				this.hide();
			}
		},
	
	
		// Hides and unregisters any handlers
		removeElement: function() {
			this.hide();
	
			if (this.el) {
				this.el.remove();
				this.el = null;
			}
	
			this.stopListeningTo($(document), 'mousedown');
		},
	
	
		// Positions the popover optimally, using the top/left/right options
		position: function() {
			var options = this.options;
			var origin = this.el.offsetParent().offset();
			var width = this.el.outerWidth();
			var height = this.el.outerHeight();
			var windowEl = $(window);
			var viewportEl = getScrollParent(this.el);
			var viewportTop;
			var viewportLeft;
			var viewportOffset;
			var top; // the "position" (not "offset") values for the popover
			var left; //
	
			// compute top and left
			top = options.top || 0;
			if (options.left !== undefined) {
				left = options.left;
			}
			else if (options.right !== undefined) {
				left = options.right - width; // derive the left value from the right value
			}
			else {
				left = 0;
			}
	
			if (viewportEl.is(window) || viewportEl.is(document)) { // normalize getScrollParent's result
				viewportEl = windowEl;
				viewportTop = 0; // the window is always at the top left
				viewportLeft = 0; // (and .offset() won't work if called here)
			}
			else {
				viewportOffset = viewportEl.offset();
				viewportTop = viewportOffset.top;
				viewportLeft = viewportOffset.left;
			}
	
			// if the window is scrolled, it causes the visible area to be further down
			viewportTop += windowEl.scrollTop();
			viewportLeft += windowEl.scrollLeft();
	
			// constrain to the view port. if constrained by two edges, give precedence to top/left
			if (options.viewportConstrain !== false) {
				top = Math.min(top, viewportTop + viewportEl.outerHeight() - height - this.margin);
				top = Math.max(top, viewportTop + this.margin);
				left = Math.min(left, viewportLeft + viewportEl.outerWidth() - width - this.margin);
				left = Math.max(left, viewportLeft + this.margin);
			}
	
			this.el.css({
				top: top - origin.top,
				left: left - origin.left
			});
		},
	
	
		// Triggers a callback. Calls a function in the option hash of the same name.
		// Arguments beyond the first `name` are forwarded on.
		// TODO: better code reuse for this. Repeat code
		trigger: function(name) {
			if (this.options[name]) {
				this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	
	});
	
	;;
	
	/*
	A cache for the left/right/top/bottom/width/height values for one or more elements.
	Works with both offset (from topleft document) and position (from offsetParent).
	
	options:
	- els
	- isHorizontal
	- isVertical
	*/
	var CoordCache = FC.CoordCache = Class.extend({
	
		els: null, // jQuery set (assumed to be siblings)
		forcedOffsetParentEl: null, // options can override the natural offsetParent
		origin: null, // {left,top} position of offsetParent of els
		boundingRect: null, // constrain cordinates to this rectangle. {left,right,top,bottom} or null
		isHorizontal: false, // whether to query for left/right/width
		isVertical: false, // whether to query for top/bottom/height
	
		// arrays of coordinates (offsets from topleft of document)
		lefts: null,
		rights: null,
		tops: null,
		bottoms: null,
	
	
		constructor: function(options) {
			this.els = $(options.els);
			this.isHorizontal = options.isHorizontal;
			this.isVertical = options.isVertical;
			this.forcedOffsetParentEl = options.offsetParent ? $(options.offsetParent) : null;
		},
	
	
		// Queries the els for coordinates and stores them.
		// Call this method before using and of the get* methods below.
		build: function() {
			var offsetParentEl = this.forcedOffsetParentEl || this.els.eq(0).offsetParent();
	
			this.origin = offsetParentEl.offset();
			this.boundingRect = this.queryBoundingRect();
	
			if (this.isHorizontal) {
				this.buildElHorizontals();
			}
			if (this.isVertical) {
				this.buildElVerticals();
			}
		},
	
	
		// Destroys all internal data about coordinates, freeing memory
		clear: function() {
			this.origin = null;
			this.boundingRect = null;
			this.lefts = null;
			this.rights = null;
			this.tops = null;
			this.bottoms = null;
		},
	
	
		// When called, if coord caches aren't built, builds them
		ensureBuilt: function() {
			if (!this.origin) {
				this.build();
			}
		},
	
	
		// Populates the left/right internal coordinate arrays
		buildElHorizontals: function() {
			var lefts = [];
			var rights = [];
	
			this.els.each(function(i, node) {
				var el = $(node);
				var left = el.offset().left;
				var width = el.outerWidth();
	
				lefts.push(left);
				rights.push(left + width);
			});
	
			this.lefts = lefts;
			this.rights = rights;
		},
	
	
		// Populates the top/bottom internal coordinate arrays
		buildElVerticals: function() {
			var tops = [];
			var bottoms = [];
	
			this.els.each(function(i, node) {
				var el = $(node);
				var top = el.offset().top;
				var height = el.outerHeight();
	
				tops.push(top);
				bottoms.push(top + height);
			});
	
			this.tops = tops;
			this.bottoms = bottoms;
		},
	
	
		// Given a left offset (from document left), returns the index of the el that it horizontally intersects.
		// If no intersection is made, returns undefined.
		getHorizontalIndex: function(leftOffset) {
			this.ensureBuilt();
	
			var lefts = this.lefts;
			var rights = this.rights;
			var len = lefts.length;
			var i;
	
			for (i = 0; i < len; i++) {
				if (leftOffset >= lefts[i] && leftOffset < rights[i]) {
					return i;
				}
			}
		},
	
	
		// Given a top offset (from document top), returns the index of the el that it vertically intersects.
		// If no intersection is made, returns undefined.
		getVerticalIndex: function(topOffset) {
			this.ensureBuilt();
	
			var tops = this.tops;
			var bottoms = this.bottoms;
			var len = tops.length;
			var i;
	
			for (i = 0; i < len; i++) {
				if (topOffset >= tops[i] && topOffset < bottoms[i]) {
					return i;
				}
			}
		},
	
	
		// Gets the left offset (from document left) of the element at the given index
		getLeftOffset: function(leftIndex) {
			this.ensureBuilt();
			return this.lefts[leftIndex];
		},
	
	
		// Gets the left position (from offsetParent left) of the element at the given index
		getLeftPosition: function(leftIndex) {
			this.ensureBuilt();
			return this.lefts[leftIndex] - this.origin.left;
		},
	
	
		// Gets the right offset (from document left) of the element at the given index.
		// This value is NOT relative to the document's right edge, like the CSS concept of "right" would be.
		getRightOffset: function(leftIndex) {
			this.ensureBuilt();
			return this.rights[leftIndex];
		},
	
	
		// Gets the right position (from offsetParent left) of the element at the given index.
		// This value is NOT relative to the offsetParent's right edge, like the CSS concept of "right" would be.
		getRightPosition: function(leftIndex) {
			this.ensureBuilt();
			return this.rights[leftIndex] - this.origin.left;
		},
	
	
		// Gets the width of the element at the given index
		getWidth: function(leftIndex) {
			this.ensureBuilt();
			return this.rights[leftIndex] - this.lefts[leftIndex];
		},
	
	
		// Gets the top offset (from document top) of the element at the given index
		getTopOffset: function(topIndex) {
			this.ensureBuilt();
			return this.tops[topIndex];
		},
	
	
		// Gets the top position (from offsetParent top) of the element at the given position
		getTopPosition: function(topIndex) {
			this.ensureBuilt();
			return this.tops[topIndex] - this.origin.top;
		},
	
		// Gets the bottom offset (from the document top) of the element at the given index.
		// This value is NOT relative to the offsetParent's bottom edge, like the CSS concept of "bottom" would be.
		getBottomOffset: function(topIndex) {
			this.ensureBuilt();
			return this.bottoms[topIndex];
		},
	
	
		// Gets the bottom position (from the offsetParent top) of the element at the given index.
		// This value is NOT relative to the offsetParent's bottom edge, like the CSS concept of "bottom" would be.
		getBottomPosition: function(topIndex) {
			this.ensureBuilt();
			return this.bottoms[topIndex] - this.origin.top;
		},
	
	
		// Gets the height of the element at the given index
		getHeight: function(topIndex) {
			this.ensureBuilt();
			return this.bottoms[topIndex] - this.tops[topIndex];
		},
	
	
		// Bounding Rect
		// TODO: decouple this from CoordCache
	
		// Compute and return what the elements' bounding rectangle is, from the user's perspective.
		// Right now, only returns a rectangle if constrained by an overflow:scroll element.
		queryBoundingRect: function() {
			var scrollParentEl = getScrollParent(this.els.eq(0));
	
			if (!scrollParentEl.is(document)) {
				return getClientRect(scrollParentEl);
			}
		},
	
		isPointInBounds: function(leftOffset, topOffset) {
			return this.isLeftInBounds(leftOffset) && this.isTopInBounds(topOffset);
		},
	
		isLeftInBounds: function(leftOffset) {
			return !this.boundingRect || (leftOffset >= this.boundingRect.left && leftOffset < this.boundingRect.right);
		},
	
		isTopInBounds: function(topOffset) {
			return !this.boundingRect || (topOffset >= this.boundingRect.top && topOffset < this.boundingRect.bottom);
		}
	
	});
	
	;;
	
	/* Tracks a drag's mouse movement, firing various handlers
	----------------------------------------------------------------------------------------------------------------------*/
	// TODO: use Emitter
	
	var DragListener = FC.DragListener = Class.extend(ListenerMixin, MouseIgnorerMixin, {
	
		options: null,
	
		// for IE8 bug-fighting behavior
		subjectEl: null,
		subjectHref: null,
	
		// coordinates of the initial mousedown
		originX: null,
		originY: null,
	
		// the wrapping element that scrolls, or MIGHT scroll if there's overflow.
		// TODO: do this for wrappers that have overflow:hidden as well.
		scrollEl: null,
	
		isInteracting: false,
		isDistanceSurpassed: false,
		isDelayEnded: false,
		isDragging: false,
		isTouch: false,
	
		delay: null,
		delayTimeoutId: null,
		minDistance: null,
	
		handleTouchScrollProxy: null, // calls handleTouchScroll, always bound to `this`
	
	
		constructor: function(options) {
			this.options = options || {};
			this.handleTouchScrollProxy = proxy(this, 'handleTouchScroll');
			this.initMouseIgnoring(500);
		},
	
	
		// Interaction (high-level)
		// -----------------------------------------------------------------------------------------------------------------
	
	
		startInteraction: function(ev, extraOptions) {
			var isTouch = getEvIsTouch(ev);
	
			if (ev.type === 'mousedown') {
				if (this.isIgnoringMouse) {
					return;
				}
				else if (!isPrimaryMouseButton(ev)) {
					return;
				}
				else {
					ev.preventDefault(); // prevents native selection in most browsers
				}
			}
	
			if (!this.isInteracting) {
	
				// process options
				extraOptions = extraOptions || {};
				this.delay = firstDefined(extraOptions.delay, this.options.delay, 0);
				this.minDistance = firstDefined(extraOptions.distance, this.options.distance, 0);
				this.subjectEl = this.options.subjectEl;
	
				this.isInteracting = true;
				this.isTouch = isTouch;
				this.isDelayEnded = false;
				this.isDistanceSurpassed = false;
	
				this.originX = getEvX(ev);
				this.originY = getEvY(ev);
				this.scrollEl = getScrollParent($(ev.target));
	
				this.bindHandlers();
				this.initAutoScroll();
				this.handleInteractionStart(ev);
				this.startDelay(ev);
	
				if (!this.minDistance) {
					this.handleDistanceSurpassed(ev);
				}
			}
		},
	
	
		handleInteractionStart: function(ev) {
			this.trigger('interactionStart', ev);
		},
	
	
		endInteraction: function(ev, isCancelled) {
			if (this.isInteracting) {
				this.endDrag(ev);
	
				if (this.delayTimeoutId) {
					clearTimeout(this.delayTimeoutId);
					this.delayTimeoutId = null;
				}
	
				this.destroyAutoScroll();
				this.unbindHandlers();
	
				this.isInteracting = false;
				this.handleInteractionEnd(ev, isCancelled);
	
				// a touchstart+touchend on the same element will result in the following addition simulated events:
				// mouseover + mouseout + click
				// let's ignore these bogus events
				if (this.isTouch) {
					this.tempIgnoreMouse();
				}
			}
		},
	
	
		handleInteractionEnd: function(ev, isCancelled) {
			this.trigger('interactionEnd', ev, isCancelled || false);
		},
	
	
		// Binding To DOM
		// -----------------------------------------------------------------------------------------------------------------
	
	
		bindHandlers: function() {
			var _this = this;
			var touchStartIgnores = 1;
	
			if (this.isTouch) {
				this.listenTo($(document), {
					touchmove: this.handleTouchMove,
					touchend: this.endInteraction,
					touchcancel: this.endInteraction,
	
					// Sometimes touchend doesn't fire
					// (can't figure out why. touchcancel doesn't fire either. has to do with scrolling?)
					// If another touchstart happens, we know it's bogus, so cancel the drag.
					// touchend will continue to be broken until user does a shorttap/scroll, but this is best we can do.
					touchstart: function(ev) {
						if (touchStartIgnores) { // bindHandlers is called from within a touchstart,
							touchStartIgnores--; // and we don't want this to fire immediately, so ignore.
						}
						else {
							_this.endInteraction(ev, true); // isCancelled=true
						}
					}
				});
	
				// listen to ALL scroll actions on the page
				if (
					!bindAnyScroll(this.handleTouchScrollProxy) && // hopefully this works and short-circuits the rest
					this.scrollEl // otherwise, attach a single handler to this
				) {
					this.listenTo(this.scrollEl, 'scroll', this.handleTouchScroll);
				}
			}
			else {
				this.listenTo($(document), {
					mousemove: this.handleMouseMove,
					mouseup: this.endInteraction
				});
			}
	
			this.listenTo($(document), {
				selectstart: preventDefault, // don't allow selection while dragging
				contextmenu: preventDefault // long taps would open menu on Chrome dev tools
			});
		},
	
	
		unbindHandlers: function() {
			this.stopListeningTo($(document));
	
			// unbind scroll listening
			unbindAnyScroll(this.handleTouchScrollProxy);
			if (this.scrollEl) {
				this.stopListeningTo(this.scrollEl, 'scroll');
			}
		},
	
	
		// Drag (high-level)
		// -----------------------------------------------------------------------------------------------------------------
	
	
		// extraOptions ignored if drag already started
		startDrag: function(ev, extraOptions) {
			this.startInteraction(ev, extraOptions); // ensure interaction began
	
			if (!this.isDragging) {
				this.isDragging = true;
				this.handleDragStart(ev);
			}
		},
	
	
		handleDragStart: function(ev) {
			this.trigger('dragStart', ev);
			this.initHrefHack();
		},
	
	
		handleMove: function(ev) {
			var dx = getEvX(ev) - this.originX;
			var dy = getEvY(ev) - this.originY;
			var minDistance = this.minDistance;
			var distanceSq; // current distance from the origin, squared
	
			if (!this.isDistanceSurpassed) {
				distanceSq = dx * dx + dy * dy;
				if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
					this.handleDistanceSurpassed(ev);
				}
			}
	
			if (this.isDragging) {
				this.handleDrag(dx, dy, ev);
			}
		},
	
	
		// Called while the mouse is being moved and when we know a legitimate drag is taking place
		handleDrag: function(dx, dy, ev) {
			this.trigger('drag', dx, dy, ev);
			this.updateAutoScroll(ev); // will possibly cause scrolling
		},
	
	
		endDrag: function(ev) {
			if (this.isDragging) {
				this.isDragging = false;
				this.handleDragEnd(ev);
			}
		},
	
	
		handleDragEnd: function(ev) {
			this.trigger('dragEnd', ev);
			this.destroyHrefHack();
		},
	
	
		// Delay
		// -----------------------------------------------------------------------------------------------------------------
	
	
		startDelay: function(initialEv) {
			var _this = this;
	
			if (this.delay) {
				this.delayTimeoutId = setTimeout(function() {
					_this.handleDelayEnd(initialEv);
				}, this.delay);
			}
			else {
				this.handleDelayEnd(initialEv);
			}
		},
	
	
		handleDelayEnd: function(initialEv) {
			this.isDelayEnded = true;
	
			if (this.isDistanceSurpassed) {
				this.startDrag(initialEv);
			}
		},
	
	
		// Distance
		// -----------------------------------------------------------------------------------------------------------------
	
	
		handleDistanceSurpassed: function(ev) {
			this.isDistanceSurpassed = true;
	
			if (this.isDelayEnded) {
				this.startDrag(ev);
			}
		},
	
	
		// Mouse / Touch
		// -----------------------------------------------------------------------------------------------------------------
	
	
		handleTouchMove: function(ev) {
			// prevent inertia and touchmove-scrolling while dragging
			if (this.isDragging) {
				ev.preventDefault();
			}
	
			this.handleMove(ev);
		},
	
	
		handleMouseMove: function(ev) {
			this.handleMove(ev);
		},
	
	
		// Scrolling (unrelated to auto-scroll)
		// -----------------------------------------------------------------------------------------------------------------
	
	
		handleTouchScroll: function(ev) {
			// if the drag is being initiated by touch, but a scroll happens before
			// the drag-initiating delay is over, cancel the drag
			if (!this.isDragging) {
				this.endInteraction(ev, true); // isCancelled=true
			}
		},
	
	
		// <A> HREF Hack
		// -----------------------------------------------------------------------------------------------------------------
	
	
		initHrefHack: function() {
			var subjectEl = this.subjectEl;
	
			// remove a mousedown'd <a>'s href so it is not visited (IE8 bug)
			if ((this.subjectHref = subjectEl ? subjectEl.attr('href') : null)) {
				subjectEl.removeAttr('href');
			}
		},
	
	
		destroyHrefHack: function() {
			var subjectEl = this.subjectEl;
			var subjectHref = this.subjectHref;
	
			// restore a mousedown'd <a>'s href (for IE8 bug)
			setTimeout(function() { // must be outside of the click's execution
				if (subjectHref) {
					subjectEl.attr('href', subjectHref);
				}
			}, 0);
		},
	
	
		// Utils
		// -----------------------------------------------------------------------------------------------------------------
	
	
		// Triggers a callback. Calls a function in the option hash of the same name.
		// Arguments beyond the first `name` are forwarded on.
		trigger: function(name) {
			if (this.options[name]) {
				this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
			}
			// makes _methods callable by event name. TODO: kill this
			if (this['_' + name]) {
				this['_' + name].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	
	
	});
	
	;;
	/*
	this.scrollEl is set in DragListener
	*/
	DragListener.mixin({
	
		isAutoScroll: false,
	
		scrollBounds: null, // { top, bottom, left, right }
		scrollTopVel: null, // pixels per second
		scrollLeftVel: null, // pixels per second
		scrollIntervalId: null, // ID of setTimeout for scrolling animation loop
	
		// defaults
		scrollSensitivity: 30, // pixels from edge for scrolling to start
		scrollSpeed: 200, // pixels per second, at maximum speed
		scrollIntervalMs: 50, // millisecond wait between scroll increment
	
	
		initAutoScroll: function() {
			var scrollEl = this.scrollEl;
	
			this.isAutoScroll =
				this.options.scroll &&
				scrollEl &&
				!scrollEl.is(window) &&
				!scrollEl.is(document);
	
			if (this.isAutoScroll) {
				// debounce makes sure rapid calls don't happen
				this.listenTo(scrollEl, 'scroll', debounce(this.handleDebouncedScroll, 100));
			}
		},
	
	
		destroyAutoScroll: function() {
			this.endAutoScroll(); // kill any animation loop
	
			// remove the scroll handler if there is a scrollEl
			if (this.isAutoScroll) {
				this.stopListeningTo(this.scrollEl, 'scroll'); // will probably get removed by unbindHandlers too :(
			}
		},
	
	
		// Computes and stores the bounding rectangle of scrollEl
		computeScrollBounds: function() {
			if (this.isAutoScroll) {
				this.scrollBounds = getOuterRect(this.scrollEl);
				// TODO: use getClientRect in future. but prevents auto scrolling when on top of scrollbars
			}
		},
	
	
		// Called when the dragging is in progress and scrolling should be updated
		updateAutoScroll: function(ev) {
			var sensitivity = this.scrollSensitivity;
			var bounds = this.scrollBounds;
			var topCloseness, bottomCloseness;
			var leftCloseness, rightCloseness;
			var topVel = 0;
			var leftVel = 0;
	
			if (bounds) { // only scroll if scrollEl exists
	
				// compute closeness to edges. valid range is from 0.0 - 1.0
				topCloseness = (sensitivity - (getEvY(ev) - bounds.top)) / sensitivity;
				bottomCloseness = (sensitivity - (bounds.bottom - getEvY(ev))) / sensitivity;
				leftCloseness = (sensitivity - (getEvX(ev) - bounds.left)) / sensitivity;
				rightCloseness = (sensitivity - (bounds.right - getEvX(ev))) / sensitivity;
	
				// translate vertical closeness into velocity.
				// mouse must be completely in bounds for velocity to happen.
				if (topCloseness >= 0 && topCloseness <= 1) {
					topVel = topCloseness * this.scrollSpeed * -1; // negative. for scrolling up
				}
				else if (bottomCloseness >= 0 && bottomCloseness <= 1) {
					topVel = bottomCloseness * this.scrollSpeed;
				}
	
				// translate horizontal closeness into velocity
				if (leftCloseness >= 0 && leftCloseness <= 1) {
					leftVel = leftCloseness * this.scrollSpeed * -1; // negative. for scrolling left
				}
				else if (rightCloseness >= 0 && rightCloseness <= 1) {
					leftVel = rightCloseness * this.scrollSpeed;
				}
			}
	
			this.setScrollVel(topVel, leftVel);
		},
	
	
		// Sets the speed-of-scrolling for the scrollEl
		setScrollVel: function(topVel, leftVel) {
	
			this.scrollTopVel = topVel;
			this.scrollLeftVel = leftVel;
	
			this.constrainScrollVel(); // massages into realistic values
	
			// if there is non-zero velocity, and an animation loop hasn't already started, then START
			if ((this.scrollTopVel || this.scrollLeftVel) && !this.scrollIntervalId) {
				this.scrollIntervalId = setInterval(
					proxy(this, 'scrollIntervalFunc'), // scope to `this`
					this.scrollIntervalMs
				);
			}
		},
	
	
		// Forces scrollTopVel and scrollLeftVel to be zero if scrolling has already gone all the way
		constrainScrollVel: function() {
			var el = this.scrollEl;
	
			if (this.scrollTopVel < 0) { // scrolling up?
				if (el.scrollTop() <= 0) { // already scrolled all the way up?
					this.scrollTopVel = 0;
				}
			}
			else if (this.scrollTopVel > 0) { // scrolling down?
				if (el.scrollTop() + el[0].clientHeight >= el[0].scrollHeight) { // already scrolled all the way down?
					this.scrollTopVel = 0;
				}
			}
	
			if (this.scrollLeftVel < 0) { // scrolling left?
				if (el.scrollLeft() <= 0) { // already scrolled all the left?
					this.scrollLeftVel = 0;
				}
			}
			else if (this.scrollLeftVel > 0) { // scrolling right?
				if (el.scrollLeft() + el[0].clientWidth >= el[0].scrollWidth) { // already scrolled all the way right?
					this.scrollLeftVel = 0;
				}
			}
		},
	
	
		// This function gets called during every iteration of the scrolling animation loop
		scrollIntervalFunc: function() {
			var el = this.scrollEl;
			var frac = this.scrollIntervalMs / 1000; // considering animation frequency, what the vel should be mult'd by
	
			// change the value of scrollEl's scroll
			if (this.scrollTopVel) {
				el.scrollTop(el.scrollTop() + this.scrollTopVel * frac);
			}
			if (this.scrollLeftVel) {
				el.scrollLeft(el.scrollLeft() + this.scrollLeftVel * frac);
			}
	
			this.constrainScrollVel(); // since the scroll values changed, recompute the velocities
	
			// if scrolled all the way, which causes the vels to be zero, stop the animation loop
			if (!this.scrollTopVel && !this.scrollLeftVel) {
				this.endAutoScroll();
			}
		},
	
	
		// Kills any existing scrolling animation loop
		endAutoScroll: function() {
			if (this.scrollIntervalId) {
				clearInterval(this.scrollIntervalId);
				this.scrollIntervalId = null;
	
				this.handleScrollEnd();
			}
		},
	
	
		// Get called when the scrollEl is scrolled (NOTE: this is delayed via debounce)
		handleDebouncedScroll: function() {
			// recompute all coordinates, but *only* if this is *not* part of our scrolling animation
			if (!this.scrollIntervalId) {
				this.handleScrollEnd();
			}
		},
	
	
		// Called when scrolling has stopped, whether through auto scroll, or the user scrolling
		handleScrollEnd: function() {
		}
	
	});
	;;
	
	/* Tracks mouse movements over a component and raises events about which hit the mouse is over.
	------------------------------------------------------------------------------------------------------------------------
	options:
	- subjectEl
	- subjectCenter
	*/
	
	var HitDragListener = DragListener.extend({
	
		component: null, // converts coordinates to hits
			// methods: prepareHits, releaseHits, queryHit
	
		origHit: null, // the hit the mouse was over when listening started
		hit: null, // the hit the mouse is over
		coordAdjust: null, // delta that will be added to the mouse coordinates when computing collisions
	
	
		constructor: function(component, options) {
			DragListener.call(this, options); // call the super-constructor
	
			this.component = component;
		},
	
	
		// Called when drag listening starts (but a real drag has not necessarily began).
		// ev might be undefined if dragging was started manually.
		handleInteractionStart: function(ev) {
			var subjectEl = this.subjectEl;
			var subjectRect;
			var origPoint;
			var point;
	
			this.computeCoords();
	
			if (ev) {
				origPoint = { left: getEvX(ev), top: getEvY(ev) };
				point = origPoint;
	
				// constrain the point to bounds of the element being dragged
				if (subjectEl) {
					subjectRect = getOuterRect(subjectEl); // used for centering as well
					point = constrainPoint(point, subjectRect);
				}
	
				this.origHit = this.queryHit(point.left, point.top);
	
				// treat the center of the subject as the collision point?
				if (subjectEl && this.options.subjectCenter) {
	
					// only consider the area the subject overlaps the hit. best for large subjects.
					// TODO: skip this if hit didn't supply left/right/top/bottom
					if (this.origHit) {
						subjectRect = intersectRects(this.origHit, subjectRect) ||
							subjectRect; // in case there is no intersection
					}
	
					point = getRectCenter(subjectRect);
				}
	
				this.coordAdjust = diffPoints(point, origPoint); // point - origPoint
			}
			else {
				this.origHit = null;
				this.coordAdjust = null;
			}
	
			// call the super-method. do it after origHit has been computed
			DragListener.prototype.handleInteractionStart.apply(this, arguments);
		},
	
	
		// Recomputes the drag-critical positions of elements
		computeCoords: function() {
			this.component.prepareHits();
			this.computeScrollBounds(); // why is this here??????
		},
	
	
		// Called when the actual drag has started
		handleDragStart: function(ev) {
			var hit;
	
			DragListener.prototype.handleDragStart.apply(this, arguments); // call the super-method
	
			// might be different from this.origHit if the min-distance is large
			hit = this.queryHit(getEvX(ev), getEvY(ev));
	
			// report the initial hit the mouse is over
			// especially important if no min-distance and drag starts immediately
			if (hit) {
				this.handleHitOver(hit);
			}
		},
	
	
		// Called when the drag moves
		handleDrag: function(dx, dy, ev) {
			var hit;
	
			DragListener.prototype.handleDrag.apply(this, arguments); // call the super-method
	
			hit = this.queryHit(getEvX(ev), getEvY(ev));
	
			if (!isHitsEqual(hit, this.hit)) { // a different hit than before?
				if (this.hit) {
					this.handleHitOut();
				}
				if (hit) {
					this.handleHitOver(hit);
				}
			}
		},
	
	
		// Called when dragging has been stopped
		handleDragEnd: function() {
			this.handleHitDone();
			DragListener.prototype.handleDragEnd.apply(this, arguments); // call the super-method
		},
	
	
		// Called when a the mouse has just moved over a new hit
		handleHitOver: function(hit) {
			var isOrig = isHitsEqual(hit, this.origHit);
	
			this.hit = hit;
	
			this.trigger('hitOver', this.hit, isOrig, this.origHit);
		},
	
	
		// Called when the mouse has just moved out of a hit
		handleHitOut: function() {
			if (this.hit) {
				this.trigger('hitOut', this.hit);
				this.handleHitDone();
				this.hit = null;
			}
		},
	
	
		// Called after a hitOut. Also called before a dragStop
		handleHitDone: function() {
			if (this.hit) {
				this.trigger('hitDone', this.hit);
			}
		},
	
	
		// Called when the interaction ends, whether there was a real drag or not
		handleInteractionEnd: function() {
			DragListener.prototype.handleInteractionEnd.apply(this, arguments); // call the super-method
	
			this.origHit = null;
			this.hit = null;
	
			this.component.releaseHits();
		},
	
	
		// Called when scrolling has stopped, whether through auto scroll, or the user scrolling
		handleScrollEnd: function() {
			DragListener.prototype.handleScrollEnd.apply(this, arguments); // call the super-method
	
			this.computeCoords(); // hits' absolute positions will be in new places. recompute
		},
	
	
		// Gets the hit underneath the coordinates for the given mouse event
		queryHit: function(left, top) {
	
			if (this.coordAdjust) {
				left += this.coordAdjust.left;
				top += this.coordAdjust.top;
			}
	
			return this.component.queryHit(left, top);
		}
	
	});
	
	
	// Returns `true` if the hits are identically equal. `false` otherwise. Must be from the same component.
	// Two null values will be considered equal, as two "out of the component" states are the same.
	function isHitsEqual(hit0, hit1) {
	
		if (!hit0 && !hit1) {
			return true;
		}
	
		if (hit0 && hit1) {
			return hit0.component === hit1.component &&
				isHitPropsWithin(hit0, hit1) &&
				isHitPropsWithin(hit1, hit0); // ensures all props are identical
		}
	
		return false;
	}
	
	
	// Returns true if all of subHit's non-standard properties are within superHit
	function isHitPropsWithin(subHit, superHit) {
		for (var propName in subHit) {
			if (!/^(component|left|right|top|bottom)$/.test(propName)) {
				if (subHit[propName] !== superHit[propName]) {
					return false;
				}
			}
		}
		return true;
	}
	
	;;
	
	/* Creates a clone of an element and lets it track the mouse as it moves
	----------------------------------------------------------------------------------------------------------------------*/
	
	var MouseFollower = Class.extend(ListenerMixin, {
	
		options: null,
	
		sourceEl: null, // the element that will be cloned and made to look like it is dragging
		el: null, // the clone of `sourceEl` that will track the mouse
		parentEl: null, // the element that `el` (the clone) will be attached to
	
		// the initial position of el, relative to the offset parent. made to match the initial offset of sourceEl
		top0: null,
		left0: null,
	
		// the absolute coordinates of the initiating touch/mouse action
		y0: null,
		x0: null,
	
		// the number of pixels the mouse has moved from its initial position
		topDelta: null,
		leftDelta: null,
	
		isFollowing: false,
		isHidden: false,
		isAnimating: false, // doing the revert animation?
	
		constructor: function(sourceEl, options) {
			this.options = options = options || {};
			this.sourceEl = sourceEl;
			this.parentEl = options.parentEl ? $(options.parentEl) : sourceEl.parent(); // default to sourceEl's parent
		},
	
	
		// Causes the element to start following the mouse
		start: function(ev) {
			if (!this.isFollowing) {
				this.isFollowing = true;
	
				this.y0 = getEvY(ev);
				this.x0 = getEvX(ev);
				this.topDelta = 0;
				this.leftDelta = 0;
	
				if (!this.isHidden) {
					this.updatePosition();
				}
	
				if (getEvIsTouch(ev)) {
					this.listenTo($(document), 'touchmove', this.handleMove);
				}
				else {
					this.listenTo($(document), 'mousemove', this.handleMove);
				}
			}
		},
	
	
		// Causes the element to stop following the mouse. If shouldRevert is true, will animate back to original position.
		// `callback` gets invoked when the animation is complete. If no animation, it is invoked immediately.
		stop: function(shouldRevert, callback) {
			var _this = this;
			var revertDuration = this.options.revertDuration;
	
			function complete() { // might be called by .animate(), which might change `this` context
				_this.isAnimating = false;
				_this.removeElement();
	
				_this.top0 = _this.left0 = null; // reset state for future updatePosition calls
	
				if (callback) {
					callback();
				}
			}
	
			if (this.isFollowing && !this.isAnimating) { // disallow more than one stop animation at a time
				this.isFollowing = false;
	
				this.stopListeningTo($(document));
	
				if (shouldRevert && revertDuration && !this.isHidden) { // do a revert animation?
					this.isAnimating = true;
					this.el.animate({
						top: this.top0,
						left: this.left0
					}, {
						duration: revertDuration,
						complete: complete
					});
				}
				else {
					complete();
				}
			}
		},
	
	
		// Gets the tracking element. Create it if necessary
		getEl: function() {
			var el = this.el;
	
			if (!el) {
				this.sourceEl.width(); // hack to force IE8 to compute correct bounding box
				el = this.el = this.sourceEl.clone()
					.addClass(this.options.additionalClass || '')
					.css({
						position: 'absolute',
						visibility: '', // in case original element was hidden (commonly through hideEvents())
						display: this.isHidden ? 'none' : '', // for when initially hidden
						margin: 0,
						right: 'auto', // erase and set width instead
						bottom: 'auto', // erase and set height instead
						width: this.sourceEl.width(), // explicit height in case there was a 'right' value
						height: this.sourceEl.height(), // explicit width in case there was a 'bottom' value
						opacity: this.options.opacity || '',
						zIndex: this.options.zIndex
					});
	
				// we don't want long taps or any mouse interaction causing selection/menus.
				// would use preventSelection(), but that prevents selectstart, causing problems.
				el.addClass('fc-unselectable');
	
				el.appendTo(this.parentEl);
			}
	
			return el;
		},
	
	
		// Removes the tracking element if it has already been created
		removeElement: function() {
			if (this.el) {
				this.el.remove();
				this.el = null;
			}
		},
	
	
		// Update the CSS position of the tracking element
		updatePosition: function() {
			var sourceOffset;
			var origin;
	
			this.getEl(); // ensure this.el
	
			// make sure origin info was computed
			if (this.top0 === null) {
				this.sourceEl.width(); // hack to force IE8 to compute correct bounding box
				sourceOffset = this.sourceEl.offset();
				origin = this.el.offsetParent().offset();
				this.top0 = sourceOffset.top - origin.top;
				this.left0 = sourceOffset.left - origin.left;
			}
	
			this.el.css({
				top: this.top0 + this.topDelta,
				left: this.left0 + this.leftDelta
			});
		},
	
	
		// Gets called when the user moves the mouse
		handleMove: function(ev) {
			this.topDelta = getEvY(ev) - this.y0;
			this.leftDelta = getEvX(ev) - this.x0;
	
			if (!this.isHidden) {
				this.updatePosition();
			}
		},
	
	
		// Temporarily makes the tracking element invisible. Can be called before following starts
		hide: function() {
			if (!this.isHidden) {
				this.isHidden = true;
				if (this.el) {
					this.el.hide();
				}
			}
		},
	
	
		// Show the tracking element after it has been temporarily hidden
		show: function() {
			if (this.isHidden) {
				this.isHidden = false;
				this.updatePosition();
				this.getEl().show();
			}
		}
	
	});
	
	;;
	
	/* An abstract class comprised of a "grid" of areas that each represent a specific datetime
	----------------------------------------------------------------------------------------------------------------------*/
	
	var Grid = FC.Grid = Class.extend(ListenerMixin, MouseIgnorerMixin, {
	
		view: null, // a View object
		isRTL: null, // shortcut to the view's isRTL option
	
		start: null,
		end: null,
	
		el: null, // the containing element
		elsByFill: null, // a hash of jQuery element sets used for rendering each fill. Keyed by fill name.
	
		// derived from options
		eventTimeFormat: null,
		displayEventTime: null,
		displayEventEnd: null,
	
		minResizeDuration: null, // TODO: hack. set by subclasses. minumum event resize duration
	
		// if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
		// of the date areas. if not defined, assumes to be day and time granularity.
		// TODO: port isTimeScale into same system?
		largeUnit: null,
	
		dayDragListener: null,
		segDragListener: null,
		segResizeListener: null,
		externalDragListener: null,
	
	
		constructor: function(view) {
			this.view = view;
			this.isRTL = view.opt('isRTL');
			this.elsByFill = {};
	
			this.dayDragListener = this.buildDayDragListener();
			this.initMouseIgnoring();
		},
	
	
		/* Options
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Generates the format string used for event time text, if not explicitly defined by 'timeFormat'
		computeEventTimeFormat: function() {
			return this.view.opt('smallTimeFormat');
		},
	
	
		// Determines whether events should have their end times displayed, if not explicitly defined by 'displayEventTime'.
		// Only applies to non-all-day events.
		computeDisplayEventTime: function() {
			return true;
		},
	
	
		// Determines whether events should have their end times displayed, if not explicitly defined by 'displayEventEnd'
		computeDisplayEventEnd: function() {
			return true;
		},
	
	
		/* Dates
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Tells the grid about what period of time to display.
		// Any date-related internal data should be generated.
		setRange: function(range) {
			this.start = range.start.clone();
			this.end = range.end.clone();
	
			this.rangeUpdated();
			this.processRangeOptions();
		},
	
	
		// Called when internal variables that rely on the range should be updated
		rangeUpdated: function() {
		},
	
	
		// Updates values that rely on options and also relate to range
		processRangeOptions: function() {
			var view = this.view;
			var displayEventTime;
			var displayEventEnd;
	
			this.eventTimeFormat =
				view.opt('eventTimeFormat') ||
				view.opt('timeFormat') || // deprecated
				this.computeEventTimeFormat();
	
			displayEventTime = view.opt('displayEventTime');
			if (displayEventTime == null) {
				displayEventTime = this.computeDisplayEventTime(); // might be based off of range
			}
	
			displayEventEnd = view.opt('displayEventEnd');
			if (displayEventEnd == null) {
				displayEventEnd = this.computeDisplayEventEnd(); // might be based off of range
			}
	
			this.displayEventTime = displayEventTime;
			this.displayEventEnd = displayEventEnd;
		},
	
	
		// Converts a span (has unzoned start/end and any other grid-specific location information)
		// into an array of segments (pieces of events whose format is decided by the grid).
		spanToSegs: function(span) {
			// subclasses must implement
		},
	
	
		// Diffs the two dates, returning a duration, based on granularity of the grid
		// TODO: port isTimeScale into this system?
		diffDates: function(a, b) {
			if (this.largeUnit) {
				return diffByUnit(a, b, this.largeUnit);
			}
			else {
				return diffDayTime(a, b);
			}
		},
	
	
		/* Hit Area
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Called before one or more queryHit calls might happen. Should prepare any cached coordinates for queryHit
		prepareHits: function() {
		},
	
	
		// Called when queryHit calls have subsided. Good place to clear any coordinate caches.
		releaseHits: function() {
		},
	
	
		// Given coordinates from the topleft of the document, return data about the date-related area underneath.
		// Can return an object with arbitrary properties (although top/right/left/bottom are encouraged).
		// Must have a `grid` property, a reference to this current grid. TODO: avoid this
		// The returned object will be processed by getHitSpan and getHitEl.
		queryHit: function(leftOffset, topOffset) {
		},
	
	
		// Given position-level information about a date-related area within the grid,
		// should return an object with at least a start/end date. Can provide other information as well.
		getHitSpan: function(hit) {
		},
	
	
		// Given position-level information about a date-related area within the grid,
		// should return a jQuery element that best represents it. passed to dayClick callback.
		getHitEl: function(hit) {
		},
	
	
		/* Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Sets the container element that the grid should render inside of.
		// Does other DOM-related initializations.
		setElement: function(el) {
			this.el = el;
			preventSelection(el);
	
			this.bindDayHandler('touchstart', this.dayTouchStart);
			this.bindDayHandler('mousedown', this.dayMousedown);
	
			// attach event-element-related handlers. in Grid.events
			// same garbage collection note as above.
			this.bindSegHandlers();
	
			this.bindGlobalHandlers();
		},
	
	
		bindDayHandler: function(name, handler) {
			var _this = this;
	
			// attach a handler to the grid's root element.
			// jQuery will take care of unregistering them when removeElement gets called.
			this.el.on(name, function(ev) {
				if (
					!$(ev.target).is('.fc-event-container *, .fc-more') // not an an event element, or "more.." link
				) {
					return handler.call(_this, ev);
				}
			});
		},
	
	
		// Removes the grid's container element from the DOM. Undoes any other DOM-related attachments.
		// DOES NOT remove any content beforehand (doesn't clear events or call unrenderDates), unlike View
		removeElement: function() {
			this.unbindGlobalHandlers();
			this.clearDragListeners();
	
			this.el.remove();
	
			// NOTE: we don't null-out this.el for the same reasons we don't do it within View::removeElement
		},
	
	
		// Renders the basic structure of grid view before any content is rendered
		renderSkeleton: function() {
			// subclasses should implement
		},
	
	
		// Renders the grid's date-related content (like areas that represent days/times).
		// Assumes setRange has already been called and the skeleton has already been rendered.
		renderDates: function() {
			// subclasses should implement
		},
	
	
		// Unrenders the grid's date-related content
		unrenderDates: function() {
			// subclasses should implement
		},
	
	
		/* Handlers
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Binds DOM handlers to elements that reside outside the grid, such as the document
		bindGlobalHandlers: function() {
			this.listenTo($(document), {
				dragstart: this.externalDragStart, // jqui
				sortstart: this.externalDragStart // jqui
			});
		},
	
	
		// Unbinds DOM handlers from elements that reside outside the grid
		unbindGlobalHandlers: function() {
			this.stopListeningTo($(document));
		},
	
	
		// Process a mousedown on an element that represents a day. For day clicking and selecting.
		dayMousedown: function(ev) {
			if (!this.isIgnoringMouse) {
				this.dayDragListener.startInteraction(ev, {
					//distance: 5, // needs more work if we want dayClick to fire correctly
				});
			}
		},
	
	
		dayTouchStart: function(ev) {
			var view = this.view;
	
			// HACK to prevent a user's clickaway for unselecting a range or an event
			// from causing a dayClick.
			if (view.isSelected || view.selectedEvent) {
				this.tempIgnoreMouse();
			}
	
			this.dayDragListener.startInteraction(ev, {
				delay: this.view.opt('longPressDelay')
			});
		},
	
	
		// Creates a listener that tracks the user's drag across day elements.
		// For day clicking and selecting.
		buildDayDragListener: function() {
			var _this = this;
			var view = this.view;
			var isSelectable = view.opt('selectable');
			var dayClickHit; // null if invalid dayClick
			var selectionSpan; // null if invalid selection
	
			// this listener tracks a mousedown on a day element, and a subsequent drag.
			// if the drag ends on the same day, it is a 'dayClick'.
			// if 'selectable' is enabled, this listener also detects selections.
			var dragListener = new HitDragListener(this, {
				scroll: view.opt('dragScroll'),
				interactionStart: function() {
					dayClickHit = dragListener.origHit; // for dayClick, where no dragging happens
					selectionSpan = null;
				},
				dragStart: function() {
					view.unselect(); // since we could be rendering a new selection, we want to clear any old one
				},
				hitOver: function(hit, isOrig, origHit) {
					if (origHit) { // click needs to have started on a hit
	
						// if user dragged to another cell at any point, it can no longer be a dayClick
						if (!isOrig) {
							dayClickHit = null;
						}
	
						if (isSelectable) {
							selectionSpan = _this.computeSelection(
								_this.getHitSpan(origHit),
								_this.getHitSpan(hit)
							);
							if (selectionSpan) {
								_this.renderSelection(selectionSpan);
							}
							else if (selectionSpan === false) {
								disableCursor();
							}
						}
					}
				},
				hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
					dayClickHit = null;
					selectionSpan = null;
					_this.unrenderSelection();
				},
				hitDone: function() { // called after a hitOut OR before a dragEnd
					enableCursor();
				},
				interactionEnd: function(ev, isCancelled) {
					if (!isCancelled) {
						if (
							dayClickHit &&
							!_this.isIgnoringMouse // see hack in dayTouchStart
						) {
							view.triggerDayClick(
								_this.getHitSpan(dayClickHit),
								_this.getHitEl(dayClickHit),
								ev
							);
						}
						if (selectionSpan) {
							// the selection will already have been rendered. just report it
							view.reportSelection(selectionSpan, ev);
						}
					}
				}
			});
	
			return dragListener;
		},
	
	
		// Kills all in-progress dragging.
		// Useful for when public API methods that result in re-rendering are invoked during a drag.
		// Also useful for when touch devices misbehave and don't fire their touchend.
		clearDragListeners: function() {
			this.dayDragListener.endInteraction();
	
			if (this.segDragListener) {
				this.segDragListener.endInteraction(); // will clear this.segDragListener
			}
			if (this.segResizeListener) {
				this.segResizeListener.endInteraction(); // will clear this.segResizeListener
			}
			if (this.externalDragListener) {
				this.externalDragListener.endInteraction(); // will clear this.externalDragListener
			}
		},
	
	
		/* Event Helper
		------------------------------------------------------------------------------------------------------------------*/
		// TODO: should probably move this to Grid.events, like we did event dragging / resizing
	
	
		// Renders a mock event at the given event location, which contains zoned start/end properties.
		// Returns all mock event elements.
		renderEventLocationHelper: function(eventLocation, sourceSeg) {
			var fakeEvent = this.fabricateHelperEvent(eventLocation, sourceSeg);
	
			return this.renderHelper(fakeEvent, sourceSeg); // do the actual rendering
		},
	
	
		// Builds a fake event given zoned event date properties and a segment is should be inspired from.
		// The range's end can be null, in which case the mock event that is rendered will have a null end time.
		// `sourceSeg` is the internal segment object involved in the drag. If null, something external is dragging.
		fabricateHelperEvent: function(eventLocation, sourceSeg) {
			var fakeEvent = sourceSeg ? createObject(sourceSeg.event) : {}; // mask the original event object if possible
	
			fakeEvent.start = eventLocation.start.clone();
			fakeEvent.end = eventLocation.end ? eventLocation.end.clone() : null;
			fakeEvent.allDay = null; // force it to be freshly computed by normalizeEventDates
			this.view.calendar.normalizeEventDates(fakeEvent);
	
			// this extra className will be useful for differentiating real events from mock events in CSS
			fakeEvent.className = (fakeEvent.className || []).concat('fc-helper');
	
			// if something external is being dragged in, don't render a resizer
			if (!sourceSeg) {
				fakeEvent.editable = false;
			}
	
			return fakeEvent;
		},
	
	
		// Renders a mock event. Given zoned event date properties.
		// Must return all mock event elements.
		renderHelper: function(eventLocation, sourceSeg) {
			// subclasses must implement
		},
	
	
		// Unrenders a mock event
		unrenderHelper: function() {
			// subclasses must implement
		},
	
	
		/* Selection
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of a selection. Will highlight by default but can be overridden by subclasses.
		// Given a span (unzoned start/end and other misc data)
		renderSelection: function(span) {
			this.renderHighlight(span);
		},
	
	
		// Unrenders any visual indications of a selection. Will unrender a highlight by default.
		unrenderSelection: function() {
			this.unrenderHighlight();
		},
	
	
		// Given the first and last date-spans of a selection, returns another date-span object.
		// Subclasses can override and provide additional data in the span object. Will be passed to renderSelection().
		// Will return false if the selection is invalid and this should be indicated to the user.
		// Will return null/undefined if a selection invalid but no error should be reported.
		computeSelection: function(span0, span1) {
			var span = this.computeSelectionSpan(span0, span1);
	
			if (span && !this.view.calendar.isSelectionSpanAllowed(span)) {
				return false;
			}
	
			return span;
		},
	
	
		// Given two spans, must return the combination of the two.
		// TODO: do this separation of concerns (combining VS validation) for event dnd/resize too.
		computeSelectionSpan: function(span0, span1) {
			var dates = [ span0.start, span0.end, span1.start, span1.end ];
	
			dates.sort(compareNumbers); // sorts chronologically. works with Moments
	
			return { start: dates[0].clone(), end: dates[3].clone() };
		},
	
	
		/* Highlight
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
		renderHighlight: function(span) {
			this.renderFill('highlight', this.spanToSegs(span));
		},
	
	
		// Unrenders the emphasis on a date range
		unrenderHighlight: function() {
			this.unrenderFill('highlight');
		},
	
	
		// Generates an array of classNames for rendering the highlight. Used by the fill system.
		highlightSegClasses: function() {
			return [ 'fc-highlight' ];
		},
	
	
		/* Business Hours
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderBusinessHours: function() {
		},
	
	
		unrenderBusinessHours: function() {
		},
	
	
		/* Now Indicator
		------------------------------------------------------------------------------------------------------------------*/
	
	
		getNowIndicatorUnit: function() {
		},
	
	
		renderNowIndicator: function(date) {
		},
	
	
		unrenderNowIndicator: function() {
		},
	
	
		/* Fill System (highlight, background events, business hours)
		--------------------------------------------------------------------------------------------------------------------
		TODO: remove this system. like we did in TimeGrid
		*/
	
	
		// Renders a set of rectangles over the given segments of time.
		// MUST RETURN a subset of segs, the segs that were actually rendered.
		// Responsible for populating this.elsByFill. TODO: better API for expressing this requirement
		renderFill: function(type, segs) {
			// subclasses must implement
		},
	
	
		// Unrenders a specific type of fill that is currently rendered on the grid
		unrenderFill: function(type) {
			var el = this.elsByFill[type];
	
			if (el) {
				el.remove();
				delete this.elsByFill[type];
			}
		},
	
	
		// Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
		// Only returns segments that successfully rendered.
		// To be harnessed by renderFill (implemented by subclasses).
		// Analagous to renderFgSegEls.
		renderFillSegEls: function(type, segs) {
			var _this = this;
			var segElMethod = this[type + 'SegEl'];
			var html = '';
			var renderedSegs = [];
			var i;
	
			if (segs.length) {
	
				// build a large concatenation of segment HTML
				for (i = 0; i < segs.length; i++) {
					html += this.fillSegHtml(type, segs[i]);
				}
	
				// Grab individual elements from the combined HTML string. Use each as the default rendering.
				// Then, compute the 'el' for each segment.
				$(html).each(function(i, node) {
					var seg = segs[i];
					var el = $(node);
	
					// allow custom filter methods per-type
					if (segElMethod) {
						el = segElMethod.call(_this, seg, el);
					}
	
					if (el) { // custom filters did not cancel the render
						el = $(el); // allow custom filter to return raw DOM node
	
						// correct element type? (would be bad if a non-TD were inserted into a table for example)
						if (el.is(_this.fillSegTag)) {
							seg.el = el;
							renderedSegs.push(seg);
						}
					}
				});
			}
	
			return renderedSegs;
		},
	
	
		fillSegTag: 'div', // subclasses can override
	
	
		// Builds the HTML needed for one fill segment. Generic enough to work with different types.
		fillSegHtml: function(type, seg) {
	
			// custom hooks per-type
			var classesMethod = this[type + 'SegClasses'];
			var cssMethod = this[type + 'SegCss'];
	
			var classes = classesMethod ? classesMethod.call(this, seg) : [];
			var css = cssToStr(cssMethod ? cssMethod.call(this, seg) : {});
	
			return '<' + this.fillSegTag +
				(classes.length ? ' class="' + classes.join(' ') + '"' : '') +
				(css ? ' style="' + css + '"' : '') +
				' />';
		},
	
	
	
		/* Generic rendering utilities for subclasses
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Computes HTML classNames for a single-day element
		getDayClasses: function(date) {
			var view = this.view;
			var today = view.calendar.getNow();
			var classes = [ 'fc-' + dayIDs[date.day()] ];
	
			if (
				view.intervalDuration.as('months') == 1 &&
				date.month() != view.intervalStart.month()
			) {
				classes.push('fc-other-month');
			}
	
			if (date.isSame(today, 'day')) {
				classes.push(
					'fc-today',
					view.highlightStateClass
				);
			}
			else if (date < today) {
				classes.push('fc-past');
			}
			else {
				classes.push('fc-future');
			}
	
			return classes;
		}
	
	});
	
	;;
	
	/* Event-rendering and event-interaction methods for the abstract Grid class
	----------------------------------------------------------------------------------------------------------------------*/
	
	Grid.mixin({
	
		mousedOverSeg: null, // the segment object the user's mouse is over. null if over nothing
		isDraggingSeg: false, // is a segment being dragged? boolean
		isResizingSeg: false, // is a segment being resized? boolean
		isDraggingExternal: false, // jqui-dragging an external element? boolean
		segs: null, // the *event* segments currently rendered in the grid. TODO: rename to `eventSegs`
	
	
		// Renders the given events onto the grid
		renderEvents: function(events) {
			var bgEvents = [];
			var fgEvents = [];
			var i;
	
			for (i = 0; i < events.length; i++) {
				(isBgEvent(events[i]) ? bgEvents : fgEvents).push(events[i]);
			}
	
			this.segs = [].concat( // record all segs
				this.renderBgEvents(bgEvents),
				this.renderFgEvents(fgEvents)
			);
		},
	
	
		renderBgEvents: function(events) {
			var segs = this.eventsToSegs(events);
	
			// renderBgSegs might return a subset of segs, segs that were actually rendered
			return this.renderBgSegs(segs) || segs;
		},
	
	
		renderFgEvents: function(events) {
			var segs = this.eventsToSegs(events);
	
			// renderFgSegs might return a subset of segs, segs that were actually rendered
			return this.renderFgSegs(segs) || segs;
		},
	
	
		// Unrenders all events currently rendered on the grid
		unrenderEvents: function() {
			this.handleSegMouseout(); // trigger an eventMouseout if user's mouse is over an event
			this.clearDragListeners();
	
			this.unrenderFgSegs();
			this.unrenderBgSegs();
	
			this.segs = null;
		},
	
	
		// Retrieves all rendered segment objects currently rendered on the grid
		getEventSegs: function() {
			return this.segs || [];
		},
	
	
		/* Foreground Segment Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders foreground event segments onto the grid. May return a subset of segs that were rendered.
		renderFgSegs: function(segs) {
			// subclasses must implement
		},
	
	
		// Unrenders all currently rendered foreground segments
		unrenderFgSegs: function() {
			// subclasses must implement
		},
	
	
		// Renders and assigns an `el` property for each foreground event segment.
		// Only returns segments that successfully rendered.
		// A utility that subclasses may use.
		renderFgSegEls: function(segs, disableResizing) {
			var view = this.view;
			var html = '';
			var renderedSegs = [];
			var i;
	
			if (segs.length) { // don't build an empty html string
	
				// build a large concatenation of event segment HTML
				for (i = 0; i < segs.length; i++) {
					html += this.fgSegHtml(segs[i], disableResizing);
				}
	
				// Grab individual elements from the combined HTML string. Use each as the default rendering.
				// Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
				$(html).each(function(i, node) {
					var seg = segs[i];
					var el = view.resolveEventEl(seg.event, $(node));
	
					if (el) {
						el.data('fc-seg', seg); // used by handlers
						seg.el = el;
						renderedSegs.push(seg);
					}
				});
			}
	
			return renderedSegs;
		},
	
	
		// Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
		fgSegHtml: function(seg, disableResizing) {
			// subclasses should implement
		},
	
	
		/* Background Segment Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders the given background event segments onto the grid.
		// Returns a subset of the segs that were actually rendered.
		renderBgSegs: function(segs) {
			return this.renderFill('bgEvent', segs);
		},
	
	
		// Unrenders all the currently rendered background event segments
		unrenderBgSegs: function() {
			this.unrenderFill('bgEvent');
		},
	
	
		// Renders a background event element, given the default rendering. Called by the fill system.
		bgEventSegEl: function(seg, el) {
			return this.view.resolveEventEl(seg.event, el); // will filter through eventRender
		},
	
	
		// Generates an array of classNames to be used for the default rendering of a background event.
		// Called by fillSegHtml.
		bgEventSegClasses: function(seg) {
			var event = seg.event;
			var source = event.source || {};
	
			return [ 'fc-bgevent' ].concat(
				event.className,
				source.className || []
			);
		},
	
	
		// Generates a semicolon-separated CSS string to be used for the default rendering of a background event.
		// Called by fillSegHtml.
		bgEventSegCss: function(seg) {
			return {
				'background-color': this.getSegSkinCss(seg)['background-color']
			};
		},
	
	
		// Generates an array of classNames to be used for the rendering business hours overlay. Called by the fill system.
		// Called by fillSegHtml.
		businessHoursSegClasses: function(seg) {
			return [ 'fc-nonbusiness', 'fc-bgevent' ];
		},
	
	
		/* Business Hours
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Compute business hour segs for the grid's current date range.
		// Caller must ask if whole-day business hours are needed.
		buildBusinessHourSegs: function(wholeDay) {
			var events = this.view.calendar.getCurrentBusinessHourEvents(wholeDay);
	
			// HACK. Eventually refactor business hours "events" system.
			// If no events are given, but businessHours is activated, this means the entire visible range should be
			// marked as *not* business-hours, via inverse-background rendering.
			if (
				!events.length &&
				this.view.calendar.options.businessHours // don't access view option. doesn't update with dynamic options
			) {
				events = [
					$.extend({}, BUSINESS_HOUR_EVENT_DEFAULTS, {
						start: this.view.end, // guaranteed out-of-range
						end: this.view.end,   // "
						dow: null
					})
				];
			}
	
			return this.eventsToSegs(events);
		},
	
	
		/* Handlers
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Attaches event-element-related handlers for *all* rendered event segments of the view.
		bindSegHandlers: function() {
			this.bindSegHandlersToEl(this.el);
		},
	
	
		// Attaches event-element-related handlers to an arbitrary container element. leverages bubbling.
		bindSegHandlersToEl: function(el) {
			this.bindSegHandlerToEl(el, 'touchstart', this.handleSegTouchStart);
			this.bindSegHandlerToEl(el, 'touchend', this.handleSegTouchEnd);
			this.bindSegHandlerToEl(el, 'mouseenter', this.handleSegMouseover);
			this.bindSegHandlerToEl(el, 'mouseleave', this.handleSegMouseout);
			this.bindSegHandlerToEl(el, 'mousedown', this.handleSegMousedown);
			this.bindSegHandlerToEl(el, 'click', this.handleSegClick);
		},
	
	
		// Executes a handler for any a user-interaction on a segment.
		// Handler gets called with (seg, ev), and with the `this` context of the Grid
		bindSegHandlerToEl: function(el, name, handler) {
			var _this = this;
	
			el.on(name, '.fc-event-container > *', function(ev) {
				var seg = $(this).data('fc-seg'); // grab segment data. put there by View::renderEvents
	
				// only call the handlers if there is not a drag/resize in progress
				if (seg && !_this.isDraggingSeg && !_this.isResizingSeg) {
					return handler.call(_this, seg, ev); // context will be the Grid
				}
			});
		},
	
	
		handleSegClick: function(seg, ev) {
			return this.view.trigger('eventClick', seg.el[0], seg.event, ev); // can return `false` to cancel
		},
	
	
		// Updates internal state and triggers handlers for when an event element is moused over
		handleSegMouseover: function(seg, ev) {
			if (
				!this.isIgnoringMouse &&
				!this.mousedOverSeg
			) {
				this.mousedOverSeg = seg;
				seg.el.addClass('fc-allow-mouse-resize');
				this.view.trigger('eventMouseover', seg.el[0], seg.event, ev);
			}
		},
	
	
		// Updates internal state and triggers handlers for when an event element is moused out.
		// Can be given no arguments, in which case it will mouseout the segment that was previously moused over.
		handleSegMouseout: function(seg, ev) {
			ev = ev || {}; // if given no args, make a mock mouse event
	
			if (this.mousedOverSeg) {
				seg = seg || this.mousedOverSeg; // if given no args, use the currently moused-over segment
				this.mousedOverSeg = null;
				seg.el.removeClass('fc-allow-mouse-resize');
				this.view.trigger('eventMouseout', seg.el[0], seg.event, ev);
			}
		},
	
	
		handleSegMousedown: function(seg, ev) {
			var isResizing = this.startSegResize(seg, ev, { distance: 5 });
	
			if (!isResizing && this.view.isEventDraggable(seg.event)) {
				this.buildSegDragListener(seg)
					.startInteraction(ev, {
						distance: 5
					});
			}
		},
	
	
		handleSegTouchStart: function(seg, ev) {
			var view = this.view;
			var event = seg.event;
			var isSelected = view.isEventSelected(event);
			var isDraggable = view.isEventDraggable(event);
			var isResizable = view.isEventResizable(event);
			var isResizing = false;
			var dragListener;
	
			if (isSelected && isResizable) {
				// only allow resizing of the event is selected
				isResizing = this.startSegResize(seg, ev);
			}
	
			if (!isResizing && (isDraggable || isResizable)) { // allowed to be selected?
	
				dragListener = isDraggable ?
					this.buildSegDragListener(seg) :
					this.buildSegSelectListener(seg); // seg isn't draggable, but still needs to be selected
	
				dragListener.startInteraction(ev, { // won't start if already started
					delay: isSelected ? 0 : this.view.opt('longPressDelay') // do delay if not already selected
				});
			}
	
			// a long tap simulates a mouseover. ignore this bogus mouseover.
			this.tempIgnoreMouse();
		},
	
	
		handleSegTouchEnd: function(seg, ev) {
			// touchstart+touchend = click, which simulates a mouseover.
			// ignore this bogus mouseover.
			this.tempIgnoreMouse();
		},
	
	
		// returns boolean whether resizing actually started or not.
		// assumes the seg allows resizing.
		// `dragOptions` are optional.
		startSegResize: function(seg, ev, dragOptions) {
			if ($(ev.target).is('.fc-resizer')) {
				this.buildSegResizeListener(seg, $(ev.target).is('.fc-start-resizer'))
					.startInteraction(ev, dragOptions);
				return true;
			}
			return false;
		},
	
	
	
		/* Event Dragging
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Builds a listener that will track user-dragging on an event segment.
		// Generic enough to work with any type of Grid.
		// Has side effect of setting/unsetting `segDragListener`
		buildSegDragListener: function(seg) {
			var _this = this;
			var view = this.view;
			var calendar = view.calendar;
			var el = seg.el;
			var event = seg.event;
			var isDragging;
			var mouseFollower; // A clone of the original element that will move with the mouse
			var dropLocation; // zoned event date properties
	
			if (this.segDragListener) {
				return this.segDragListener;
			}
	
			// Tracks mouse movement over the *view's* coordinate map. Allows dragging and dropping between subcomponents
			// of the view.
			var dragListener = this.segDragListener = new HitDragListener(view, {
				scroll: view.opt('dragScroll'),
				subjectEl: el,
				subjectCenter: true,
				interactionStart: function(ev) {
					seg.component = _this; // for renderDrag
					isDragging = false;
					mouseFollower = new MouseFollower(seg.el, {
						additionalClass: 'fc-dragging',
						parentEl: view.el,
						opacity: dragListener.isTouch ? null : view.opt('dragOpacity'),
						revertDuration: view.opt('dragRevertDuration'),
						zIndex: 2 // one above the .fc-view
					});
					mouseFollower.hide(); // don't show until we know this is a real drag
					mouseFollower.start(ev);
				},
				dragStart: function(ev) {
					if (dragListener.isTouch && !view.isEventSelected(event)) {
						// if not previously selected, will fire after a delay. then, select the event
						view.selectEvent(event);
					}
					isDragging = true;
					_this.handleSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
					_this.segDragStart(seg, ev);
					view.hideEvent(event); // hide all event segments. our mouseFollower will take over
				},
				hitOver: function(hit, isOrig, origHit) {
					var dragHelperEls;
	
					// starting hit could be forced (DayGrid.limit)
					if (seg.hit) {
						origHit = seg.hit;
					}
	
					// since we are querying the parent view, might not belong to this grid
					dropLocation = _this.computeEventDrop(
						origHit.component.getHitSpan(origHit),
						hit.component.getHitSpan(hit),
						event
					);
	
					if (dropLocation && !calendar.isEventSpanAllowed(_this.eventToSpan(dropLocation), event)) {
						disableCursor();
						dropLocation = null;
					}
	
					// if a valid drop location, have the subclass render a visual indication
					if (dropLocation && (dragHelperEls = view.renderDrag(dropLocation, seg))) {
	
						dragHelperEls.addClass('fc-dragging');
						if (!dragListener.isTouch) {
							_this.applyDragOpacity(dragHelperEls);
						}
	
						mouseFollower.hide(); // if the subclass is already using a mock event "helper", hide our own
					}
					else {
						mouseFollower.show(); // otherwise, have the helper follow the mouse (no snapping)
					}
	
					if (isOrig) {
						dropLocation = null; // needs to have moved hits to be a valid drop
					}
				},
				hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
					view.unrenderDrag(); // unrender whatever was done in renderDrag
					mouseFollower.show(); // show in case we are moving out of all hits
					dropLocation = null;
				},
				hitDone: function() { // Called after a hitOut OR before a dragEnd
					enableCursor();
				},
				interactionEnd: function(ev) {
					delete seg.component; // prevent side effects
	
					// do revert animation if hasn't changed. calls a callback when finished (whether animation or not)
					mouseFollower.stop(!dropLocation, function() {
						if (isDragging) {
							view.unrenderDrag();
							view.showEvent(event);
							_this.segDragStop(seg, ev);
						}
						if (dropLocation) {
							view.reportEventDrop(event, dropLocation, this.largeUnit, el, ev);
						}
					});
					_this.segDragListener = null;
				}
			});
	
			return dragListener;
		},
	
	
		// seg isn't draggable, but let's use a generic DragListener
		// simply for the delay, so it can be selected.
		// Has side effect of setting/unsetting `segDragListener`
		buildSegSelectListener: function(seg) {
			var _this = this;
			var view = this.view;
			var event = seg.event;
	
			if (this.segDragListener) {
				return this.segDragListener;
			}
	
			var dragListener = this.segDragListener = new DragListener({
				dragStart: function(ev) {
					if (dragListener.isTouch && !view.isEventSelected(event)) {
						// if not previously selected, will fire after a delay. then, select the event
						view.selectEvent(event);
					}
				},
				interactionEnd: function(ev) {
					_this.segDragListener = null;
				}
			});
	
			return dragListener;
		},
	
	
		// Called before event segment dragging starts
		segDragStart: function(seg, ev) {
			this.isDraggingSeg = true;
			this.view.trigger('eventDragStart', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
		},
	
	
		// Called after event segment dragging stops
		segDragStop: function(seg, ev) {
			this.isDraggingSeg = false;
			this.view.trigger('eventDragStop', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
		},
	
	
		// Given the spans an event drag began, and the span event was dropped, calculates the new zoned start/end/allDay
		// values for the event. Subclasses may override and set additional properties to be used by renderDrag.
		// A falsy returned value indicates an invalid drop.
		// DOES NOT consider overlap/constraint.
		computeEventDrop: function(startSpan, endSpan, event) {
			var calendar = this.view.calendar;
			var dragStart = startSpan.start;
			var dragEnd = endSpan.start;
			var delta;
			var dropLocation; // zoned event date properties
	
			if (dragStart.hasTime() === dragEnd.hasTime()) {
				delta = this.diffDates(dragEnd, dragStart);
	
				// if an all-day event was in a timed area and it was dragged to a different time,
				// guarantee an end and adjust start/end to have times
				if (event.allDay && durationHasTime(delta)) {
					dropLocation = {
						start: event.start.clone(),
						end: calendar.getEventEnd(event), // will be an ambig day
						allDay: false // for normalizeEventTimes
					};
					calendar.normalizeEventTimes(dropLocation);
				}
				// othewise, work off existing values
				else {
					dropLocation = {
						start: event.start.clone(),
						end: event.end ? event.end.clone() : null,
						allDay: event.allDay // keep it the same
					};
				}
	
				dropLocation.start.add(delta);
				if (dropLocation.end) {
					dropLocation.end.add(delta);
				}
			}
			else {
				// if switching from day <-> timed, start should be reset to the dropped date, and the end cleared
				dropLocation = {
					start: dragEnd.clone(),
					end: null, // end should be cleared
					allDay: !dragEnd.hasTime()
				};
			}
	
			return dropLocation;
		},
	
	
		// Utility for apply dragOpacity to a jQuery set
		applyDragOpacity: function(els) {
			var opacity = this.view.opt('dragOpacity');
	
			if (opacity != null) {
				els.each(function(i, node) {
					// Don't use jQuery (will set an IE filter), do it the old fashioned way.
					// In IE8, a helper element will disappears if there's a filter.
					node.style.opacity = opacity;
				});
			}
		},
	
	
		/* External Element Dragging
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Called when a jQuery UI drag is initiated anywhere in the DOM
		externalDragStart: function(ev, ui) {
			var view = this.view;
			var el;
			var accept;
	
			if (view.opt('droppable')) { // only listen if this setting is on
				el = $((ui ? ui.item : null) || ev.target);
	
				// Test that the dragged element passes the dropAccept selector or filter function.
				// FYI, the default is "*" (matches all)
				accept = view.opt('dropAccept');
				if ($.isFunction(accept) ? accept.call(el[0], el) : el.is(accept)) {
					if (!this.isDraggingExternal) { // prevent double-listening if fired twice
						this.listenToExternalDrag(el, ev, ui);
					}
				}
			}
		},
	
	
		// Called when a jQuery UI drag starts and it needs to be monitored for dropping
		listenToExternalDrag: function(el, ev, ui) {
			var _this = this;
			var calendar = this.view.calendar;
			var meta = getDraggedElMeta(el); // extra data about event drop, including possible event to create
			var dropLocation; // a null value signals an unsuccessful drag
	
			// listener that tracks mouse movement over date-associated pixel regions
			var dragListener = _this.externalDragListener = new HitDragListener(this, {
				interactionStart: function() {
					_this.isDraggingExternal = true;
				},
				hitOver: function(hit) {
					dropLocation = _this.computeExternalDrop(
						hit.component.getHitSpan(hit), // since we are querying the parent view, might not belong to this grid
						meta
					);
	
					if ( // invalid hit?
						dropLocation &&
						!calendar.isExternalSpanAllowed(_this.eventToSpan(dropLocation), dropLocation, meta.eventProps)
					) {
						disableCursor();
						dropLocation = null;
					}
	
					if (dropLocation) {
						_this.renderDrag(dropLocation); // called without a seg parameter
					}
				},
				hitOut: function() {
					dropLocation = null; // signal unsuccessful
				},
				hitDone: function() { // Called after a hitOut OR before a dragEnd
					enableCursor();
					_this.unrenderDrag();
				},
				interactionEnd: function(ev) {
					if (dropLocation) { // element was dropped on a valid hit
						_this.view.reportExternalDrop(meta, dropLocation, el, ev, ui);
					}
					_this.isDraggingExternal = false;
					_this.externalDragListener = null;
				}
			});
	
			dragListener.startDrag(ev); // start listening immediately
		},
	
	
		// Given a hit to be dropped upon, and misc data associated with the jqui drag (guaranteed to be a plain object),
		// returns the zoned start/end dates for the event that would result from the hypothetical drop. end might be null.
		// Returning a null value signals an invalid drop hit.
		// DOES NOT consider overlap/constraint.
		computeExternalDrop: function(span, meta) {
			var calendar = this.view.calendar;
			var dropLocation = {
				start: calendar.applyTimezone(span.start), // simulate a zoned event start date
				end: null
			};
	
			// if dropped on an all-day span, and element's metadata specified a time, set it
			if (meta.startTime && !dropLocation.start.hasTime()) {
				dropLocation.start.time(meta.startTime);
			}
	
			if (meta.duration) {
				dropLocation.end = dropLocation.start.clone().add(meta.duration);
			}
	
			return dropLocation;
		},
	
	
	
		/* Drag Rendering (for both events and an external elements)
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of an event or external element being dragged.
		// `dropLocation` contains hypothetical start/end/allDay values the event would have if dropped. end can be null.
		// `seg` is the internal segment object that is being dragged. If dragging an external element, `seg` is null.
		// A truthy returned value indicates this method has rendered a helper element.
		// Must return elements used for any mock events.
		renderDrag: function(dropLocation, seg) {
			// subclasses must implement
		},
	
	
		// Unrenders a visual indication of an event or external element being dragged
		unrenderDrag: function() {
			// subclasses must implement
		},
	
	
		/* Resizing
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Creates a listener that tracks the user as they resize an event segment.
		// Generic enough to work with any type of Grid.
		buildSegResizeListener: function(seg, isStart) {
			var _this = this;
			var view = this.view;
			var calendar = view.calendar;
			var el = seg.el;
			var event = seg.event;
			var eventEnd = calendar.getEventEnd(event);
			var isDragging;
			var resizeLocation; // zoned event date properties. falsy if invalid resize
	
			// Tracks mouse movement over the *grid's* coordinate map
			var dragListener = this.segResizeListener = new HitDragListener(this, {
				scroll: view.opt('dragScroll'),
				subjectEl: el,
				interactionStart: function() {
					isDragging = false;
				},
				dragStart: function(ev) {
					isDragging = true;
					_this.handleSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
					_this.segResizeStart(seg, ev);
				},
				hitOver: function(hit, isOrig, origHit) {
					var origHitSpan = _this.getHitSpan(origHit);
					var hitSpan = _this.getHitSpan(hit);
	
					resizeLocation = isStart ?
						_this.computeEventStartResize(origHitSpan, hitSpan, event) :
						_this.computeEventEndResize(origHitSpan, hitSpan, event);
	
					if (resizeLocation) {
						if (!calendar.isEventSpanAllowed(_this.eventToSpan(resizeLocation), event)) {
							disableCursor();
							resizeLocation = null;
						}
						// no change? (TODO: how does this work with timezones?)
						else if (resizeLocation.start.isSame(event.start) && resizeLocation.end.isSame(eventEnd)) {
							resizeLocation = null;
						}
					}
	
					if (resizeLocation) {
						view.hideEvent(event);
						_this.renderEventResize(resizeLocation, seg);
					}
				},
				hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
					resizeLocation = null;
				},
				hitDone: function() { // resets the rendering to show the original event
					_this.unrenderEventResize();
					view.showEvent(event);
					enableCursor();
				},
				interactionEnd: function(ev) {
					if (isDragging) {
						_this.segResizeStop(seg, ev);
					}
					if (resizeLocation) { // valid date to resize to?
						view.reportEventResize(event, resizeLocation, this.largeUnit, el, ev);
					}
					_this.segResizeListener = null;
				}
			});
	
			return dragListener;
		},
	
	
		// Called before event segment resizing starts
		segResizeStart: function(seg, ev) {
			this.isResizingSeg = true;
			this.view.trigger('eventResizeStart', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
		},
	
	
		// Called after event segment resizing stops
		segResizeStop: function(seg, ev) {
			this.isResizingSeg = false;
			this.view.trigger('eventResizeStop', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
		},
	
	
		// Returns new date-information for an event segment being resized from its start
		computeEventStartResize: function(startSpan, endSpan, event) {
			return this.computeEventResize('start', startSpan, endSpan, event);
		},
	
	
		// Returns new date-information for an event segment being resized from its end
		computeEventEndResize: function(startSpan, endSpan, event) {
			return this.computeEventResize('end', startSpan, endSpan, event);
		},
	
	
		// Returns new zoned date information for an event segment being resized from its start OR end
		// `type` is either 'start' or 'end'.
		// DOES NOT consider overlap/constraint.
		computeEventResize: function(type, startSpan, endSpan, event) {
			var calendar = this.view.calendar;
			var delta = this.diffDates(endSpan[type], startSpan[type]);
			var resizeLocation; // zoned event date properties
			var defaultDuration;
	
			// build original values to work from, guaranteeing a start and end
			resizeLocation = {
				start: event.start.clone(),
				end: calendar.getEventEnd(event),
				allDay: event.allDay
			};
	
			// if an all-day event was in a timed area and was resized to a time, adjust start/end to have times
			if (resizeLocation.allDay && durationHasTime(delta)) {
				resizeLocation.allDay = false;
				calendar.normalizeEventTimes(resizeLocation);
			}
	
			resizeLocation[type].add(delta); // apply delta to start or end
	
			// if the event was compressed too small, find a new reasonable duration for it
			if (!resizeLocation.start.isBefore(resizeLocation.end)) {
	
				defaultDuration =
					this.minResizeDuration || // TODO: hack
					(event.allDay ?
						calendar.defaultAllDayEventDuration :
						calendar.defaultTimedEventDuration);
	
				if (type == 'start') { // resizing the start?
					resizeLocation.start = resizeLocation.end.clone().subtract(defaultDuration);
				}
				else { // resizing the end?
					resizeLocation.end = resizeLocation.start.clone().add(defaultDuration);
				}
			}
	
			return resizeLocation;
		},
	
	
		// Renders a visual indication of an event being resized.
		// `range` has the updated dates of the event. `seg` is the original segment object involved in the drag.
		// Must return elements used for any mock events.
		renderEventResize: function(range, seg) {
			// subclasses must implement
		},
	
	
		// Unrenders a visual indication of an event being resized.
		unrenderEventResize: function() {
			// subclasses must implement
		},
	
	
		/* Rendering Utils
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Compute the text that should be displayed on an event's element.
		// `range` can be the Event object itself, or something range-like, with at least a `start`.
		// If event times are disabled, or the event has no time, will return a blank string.
		// If not specified, formatStr will default to the eventTimeFormat setting,
		// and displayEnd will default to the displayEventEnd setting.
		getEventTimeText: function(range, formatStr, displayEnd) {
	
			if (formatStr == null) {
				formatStr = this.eventTimeFormat;
			}
	
			if (displayEnd == null) {
				displayEnd = this.displayEventEnd;
			}
	
			if (this.displayEventTime && range.start.hasTime()) {
				if (displayEnd && range.end) {
					return this.view.formatRange(range, formatStr);
				}
				else {
					return range.start.format(formatStr);
				}
			}
	
			return '';
		},
	
	
		// Generic utility for generating the HTML classNames for an event segment's element
		getSegClasses: function(seg, isDraggable, isResizable) {
			var view = this.view;
			var event = seg.event;
			var classes = [
				'fc-event',
				seg.isStart ? 'fc-start' : 'fc-not-start',
				seg.isEnd ? 'fc-end' : 'fc-not-end'
			].concat(
				event.className,
				event.source ? event.source.className : []
			);
	
			if (isDraggable) {
				classes.push('fc-draggable');
			}
			if (isResizable) {
				classes.push('fc-resizable');
			}
	
			// event is currently selected? attach a className.
			if (view.isEventSelected(event)) {
				classes.push('fc-selected');
			}
	
			return classes;
		},
	
	
		// Utility for generating event skin-related CSS properties
		getSegSkinCss: function(seg) {
			var event = seg.event;
			var view = this.view;
			var source = event.source || {};
			var eventColor = event.color;
			var sourceColor = source.color;
			var optionColor = view.opt('eventColor');
	
			return {
				'background-color':
					event.backgroundColor ||
					eventColor ||
					source.backgroundColor ||
					sourceColor ||
					view.opt('eventBackgroundColor') ||
					optionColor,
				'border-color':
					event.borderColor ||
					eventColor ||
					source.borderColor ||
					sourceColor ||
					view.opt('eventBorderColor') ||
					optionColor,
				color:
					event.textColor ||
					source.textColor ||
					view.opt('eventTextColor')
			};
		},
	
	
		/* Converting events -> eventRange -> eventSpan -> eventSegs
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Generates an array of segments for the given single event
		// Can accept an event "location" as well (which only has start/end and no allDay)
		eventToSegs: function(event) {
			return this.eventsToSegs([ event ]);
		},
	
	
		eventToSpan: function(event) {
			return this.eventToSpans(event)[0];
		},
	
	
		// Generates spans (always unzoned) for the given event.
		// Does not do any inverting for inverse-background events.
		// Can accept an event "location" as well (which only has start/end and no allDay)
		eventToSpans: function(event) {
			var range = this.eventToRange(event);
			return this.eventRangeToSpans(range, event);
		},
	
	
	
		// Converts an array of event objects into an array of event segment objects.
		// A custom `segSliceFunc` may be given for arbitrarily slicing up events.
		// Doesn't guarantee an order for the resulting array.
		eventsToSegs: function(allEvents, segSliceFunc) {
			var _this = this;
			var eventsById = groupEventsById(allEvents);
			var segs = [];
	
			$.each(eventsById, function(id, events) {
				var ranges = [];
				var i;
	
				for (i = 0; i < events.length; i++) {
					ranges.push(_this.eventToRange(events[i]));
				}
	
				// inverse-background events (utilize only the first event in calculations)
				if (isInverseBgEvent(events[0])) {
					ranges = _this.invertRanges(ranges);
	
					for (i = 0; i < ranges.length; i++) {
						segs.push.apply(segs, // append to
							_this.eventRangeToSegs(ranges[i], events[0], segSliceFunc));
					}
				}
				// normal event ranges
				else {
					for (i = 0; i < ranges.length; i++) {
						segs.push.apply(segs, // append to
							_this.eventRangeToSegs(ranges[i], events[i], segSliceFunc));
					}
				}
			});
	
			return segs;
		},
	
	
		// Generates the unzoned start/end dates an event appears to occupy
		// Can accept an event "location" as well (which only has start/end and no allDay)
		eventToRange: function(event) {
			return {
				start: event.start.clone().stripZone(),
				end: (
					event.end ?
						event.end.clone() :
						// derive the end from the start and allDay. compute allDay if necessary
						this.view.calendar.getDefaultEventEnd(
							event.allDay != null ?
								event.allDay :
								!event.start.hasTime(),
							event.start
						)
				).stripZone()
			};
		},
	
	
		// Given an event's range (unzoned start/end), and the event itself,
		// slice into segments (using the segSliceFunc function if specified)
		eventRangeToSegs: function(range, event, segSliceFunc) {
			var spans = this.eventRangeToSpans(range, event);
			var segs = [];
			var i;
	
			for (i = 0; i < spans.length; i++) {
				segs.push.apply(segs, // append to
					this.eventSpanToSegs(spans[i], event, segSliceFunc));
			}
	
			return segs;
		},
	
	
		// Given an event's unzoned date range, return an array of "span" objects.
		// Subclasses can override.
		eventRangeToSpans: function(range, event) {
			return [ $.extend({}, range) ]; // copy into a single-item array
		},
	
	
		// Given an event's span (unzoned start/end and other misc data), and the event itself,
		// slices into segments and attaches event-derived properties to them.
		eventSpanToSegs: function(span, event, segSliceFunc) {
			var segs = segSliceFunc ? segSliceFunc(span) : this.spanToSegs(span);
			var i, seg;
	
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
				seg.event = event;
				seg.eventStartMS = +span.start; // TODO: not the best name after making spans unzoned
				seg.eventDurationMS = span.end - span.start;
			}
	
			return segs;
		},
	
	
		// Produces a new array of range objects that will cover all the time NOT covered by the given ranges.
		// SIDE EFFECT: will mutate the given array and will use its date references.
		invertRanges: function(ranges) {
			var view = this.view;
			var viewStart = view.start.clone(); // need a copy
			var viewEnd = view.end.clone(); // need a copy
			var inverseRanges = [];
			var start = viewStart; // the end of the previous range. the start of the new range
			var i, range;
	
			// ranges need to be in order. required for our date-walking algorithm
			ranges.sort(compareRanges);
	
			for (i = 0; i < ranges.length; i++) {
				range = ranges[i];
	
				// add the span of time before the event (if there is any)
				if (range.start > start) { // compare millisecond time (skip any ambig logic)
					inverseRanges.push({
						start: start,
						end: range.start
					});
				}
	
				start = range.end;
			}
	
			// add the span of time after the last event (if there is any)
			if (start < viewEnd) { // compare millisecond time (skip any ambig logic)
				inverseRanges.push({
					start: start,
					end: viewEnd
				});
			}
	
			return inverseRanges;
		},
	
	
		sortEventSegs: function(segs) {
			segs.sort(proxy(this, 'compareEventSegs'));
		},
	
	
		// A cmp function for determining which segments should take visual priority
		compareEventSegs: function(seg1, seg2) {
			return seg1.eventStartMS - seg2.eventStartMS || // earlier events go first
				seg2.eventDurationMS - seg1.eventDurationMS || // tie? longer events go first
				seg2.event.allDay - seg1.event.allDay || // tie? put all-day events first (booleans cast to 0/1)
				compareByFieldSpecs(seg1.event, seg2.event, this.view.eventOrderSpecs);
		}
	
	});
	
	
	/* Utilities
	----------------------------------------------------------------------------------------------------------------------*/
	
	
	function isBgEvent(event) { // returns true if background OR inverse-background
		var rendering = getEventRendering(event);
		return rendering === 'background' || rendering === 'inverse-background';
	}
	FC.isBgEvent = isBgEvent; // export
	
	
	function isInverseBgEvent(event) {
		return getEventRendering(event) === 'inverse-background';
	}
	
	
	function getEventRendering(event) {
		return firstDefined((event.source || {}).rendering, event.rendering);
	}
	
	
	function groupEventsById(events) {
		var eventsById = {};
		var i, event;
	
		for (i = 0; i < events.length; i++) {
			event = events[i];
			(eventsById[event._id] || (eventsById[event._id] = [])).push(event);
		}
	
		return eventsById;
	}
	
	
	// A cmp function for determining which non-inverted "ranges" (see above) happen earlier
	function compareRanges(range1, range2) {
		return range1.start - range2.start; // earlier ranges go first
	}
	
	
	/* External-Dragging-Element Data
	----------------------------------------------------------------------------------------------------------------------*/
	
	// Require all HTML5 data-* attributes used by FullCalendar to have this prefix.
	// A value of '' will query attributes like data-event. A value of 'fc' will query attributes like data-fc-event.
	FC.dataAttrPrefix = '';
	
	// Given a jQuery element that might represent a dragged FullCalendar event, returns an intermediate data structure
	// to be used for Event Object creation.
	// A defined `.eventProps`, even when empty, indicates that an event should be created.
	function getDraggedElMeta(el) {
		var prefix = FC.dataAttrPrefix;
		var eventProps; // properties for creating the event, not related to date/time
		var startTime; // a Duration
		var duration;
		var stick;
	
		if (prefix) { prefix += '-'; }
		eventProps = el.data(prefix + 'event') || null;
	
		if (eventProps) {
			if (typeof eventProps === 'object') {
				eventProps = $.extend({}, eventProps); // make a copy
			}
			else { // something like 1 or true. still signal event creation
				eventProps = {};
			}
	
			// pluck special-cased date/time properties
			startTime = eventProps.start;
			if (startTime == null) { startTime = eventProps.time; } // accept 'time' as well
			duration = eventProps.duration;
			stick = eventProps.stick;
			delete eventProps.start;
			delete eventProps.time;
			delete eventProps.duration;
			delete eventProps.stick;
		}
	
		// fallback to standalone attribute values for each of the date/time properties
		if (startTime == null) { startTime = el.data(prefix + 'start'); }
		if (startTime == null) { startTime = el.data(prefix + 'time'); } // accept 'time' as well
		if (duration == null) { duration = el.data(prefix + 'duration'); }
		if (stick == null) { stick = el.data(prefix + 'stick'); }
	
		// massage into correct data types
		startTime = startTime != null ? moment.duration(startTime) : null;
		duration = duration != null ? moment.duration(duration) : null;
		stick = Boolean(stick);
	
		return { eventProps: eventProps, startTime: startTime, duration: duration, stick: stick };
	}
	
	
	;;
	
	/*
	A set of rendering and date-related methods for a visual component comprised of one or more rows of day columns.
	Prerequisite: the object being mixed into needs to be a *Grid*
	*/
	var DayTableMixin = FC.DayTableMixin = {
	
		breakOnWeeks: false, // should create a new row for each week?
		dayDates: null, // whole-day dates for each column. left to right
		dayIndices: null, // for each day from start, the offset
		daysPerRow: null,
		rowCnt: null,
		colCnt: null,
		colHeadFormat: null,
	
	
		// Populates internal variables used for date calculation and rendering
		updateDayTable: function() {
			var view = this.view;
			var date = this.start.clone();
			var dayIndex = -1;
			var dayIndices = [];
			var dayDates = [];
			var daysPerRow;
			var firstDay;
			var rowCnt;
	
			while (date.isBefore(this.end)) { // loop each day from start to end
				if (view.isHiddenDay(date)) {
					dayIndices.push(dayIndex + 0.5); // mark that it's between indices
				}
				else {
					dayIndex++;
					dayIndices.push(dayIndex);
					dayDates.push(date.clone());
				}
				date.add(1, 'days');
			}
	
			if (this.breakOnWeeks) {
				// count columns until the day-of-week repeats
				firstDay = dayDates[0].day();
				for (daysPerRow = 1; daysPerRow < dayDates.length; daysPerRow++) {
					if (dayDates[daysPerRow].day() == firstDay) {
						break;
					}
				}
				rowCnt = Math.ceil(dayDates.length / daysPerRow);
			}
			else {
				rowCnt = 1;
				daysPerRow = dayDates.length;
			}
	
			this.dayDates = dayDates;
			this.dayIndices = dayIndices;
			this.daysPerRow = daysPerRow;
			this.rowCnt = rowCnt;
			
			this.updateDayTableCols();
		},
	
	
		// Computes and assigned the colCnt property and updates any options that may be computed from it
		updateDayTableCols: function() {
			this.colCnt = this.computeColCnt();
			this.colHeadFormat = this.view.opt('columnFormat') || this.computeColHeadFormat();
		},
	
	
		// Determines how many columns there should be in the table
		computeColCnt: function() {
			return this.daysPerRow;
		},
	
	
		// Computes the ambiguously-timed moment for the given cell
		getCellDate: function(row, col) {
			return this.dayDates[
					this.getCellDayIndex(row, col)
				].clone();
		},
	
	
		// Computes the ambiguously-timed date range for the given cell
		getCellRange: function(row, col) {
			var start = this.getCellDate(row, col);
			var end = start.clone().add(1, 'days');
	
			return { start: start, end: end };
		},
	
	
		// Returns the number of day cells, chronologically, from the first of the grid (0-based)
		getCellDayIndex: function(row, col) {
			return row * this.daysPerRow + this.getColDayIndex(col);
		},
	
	
		// Returns the numner of day cells, chronologically, from the first cell in *any given row*
		getColDayIndex: function(col) {
			if (this.isRTL) {
				return this.colCnt - 1 - col;
			}
			else {
				return col;
			}
		},
	
	
		// Given a date, returns its chronolocial cell-index from the first cell of the grid.
		// If the date lies between cells (because of hiddenDays), returns a floating-point value between offsets.
		// If before the first offset, returns a negative number.
		// If after the last offset, returns an offset past the last cell offset.
		// Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
		getDateDayIndex: function(date) {
			var dayIndices = this.dayIndices;
			var dayOffset = date.diff(this.start, 'days');
	
			if (dayOffset < 0) {
				return dayIndices[0] - 1;
			}
			else if (dayOffset >= dayIndices.length) {
				return dayIndices[dayIndices.length - 1] + 1;
			}
			else {
				return dayIndices[dayOffset];
			}
		},
	
	
		/* Options
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Computes a default column header formatting string if `colFormat` is not explicitly defined
		computeColHeadFormat: function() {
			// if more than one week row, or if there are a lot of columns with not much space,
			// put just the day numbers will be in each cell
			if (this.rowCnt > 1 || this.colCnt > 10) {
				return 'ddd'; // "Sat"
			}
			// multiple days, so full single date string WON'T be in title text
			else if (this.colCnt > 1) {
				return this.view.opt('dayOfMonthFormat'); // "Sat 12/10"
			}
			// single day, so full single date string will probably be in title text
			else {
				return 'dddd'; // "Saturday"
			}
		},
	
	
		/* Slicing
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Slices up a date range into a segment for every week-row it intersects with
		sliceRangeByRow: function(range) {
			var daysPerRow = this.daysPerRow;
			var normalRange = this.view.computeDayRange(range); // make whole-day range, considering nextDayThreshold
			var rangeFirst = this.getDateDayIndex(normalRange.start); // inclusive first index
			var rangeLast = this.getDateDayIndex(normalRange.end.clone().subtract(1, 'days')); // inclusive last index
			var segs = [];
			var row;
			var rowFirst, rowLast; // inclusive day-index range for current row
			var segFirst, segLast; // inclusive day-index range for segment
	
			for (row = 0; row < this.rowCnt; row++) {
				rowFirst = row * daysPerRow;
				rowLast = rowFirst + daysPerRow - 1;
	
				// intersect segment's offset range with the row's
				segFirst = Math.max(rangeFirst, rowFirst);
				segLast = Math.min(rangeLast, rowLast);
	
				// deal with in-between indices
				segFirst = Math.ceil(segFirst); // in-between starts round to next cell
				segLast = Math.floor(segLast); // in-between ends round to prev cell
	
				if (segFirst <= segLast) { // was there any intersection with the current row?
					segs.push({
						row: row,
	
						// normalize to start of row
						firstRowDayIndex: segFirst - rowFirst,
						lastRowDayIndex: segLast - rowFirst,
	
						// must be matching integers to be the segment's start/end
						isStart: segFirst === rangeFirst,
						isEnd: segLast === rangeLast
					});
				}
			}
	
			return segs;
		},
	
	
		// Slices up a date range into a segment for every day-cell it intersects with.
		// TODO: make more DRY with sliceRangeByRow somehow.
		sliceRangeByDay: function(range) {
			var daysPerRow = this.daysPerRow;
			var normalRange = this.view.computeDayRange(range); // make whole-day range, considering nextDayThreshold
			var rangeFirst = this.getDateDayIndex(normalRange.start); // inclusive first index
			var rangeLast = this.getDateDayIndex(normalRange.end.clone().subtract(1, 'days')); // inclusive last index
			var segs = [];
			var row;
			var rowFirst, rowLast; // inclusive day-index range for current row
			var i;
			var segFirst, segLast; // inclusive day-index range for segment
	
			for (row = 0; row < this.rowCnt; row++) {
				rowFirst = row * daysPerRow;
				rowLast = rowFirst + daysPerRow - 1;
	
				for (i = rowFirst; i <= rowLast; i++) {
	
					// intersect segment's offset range with the row's
					segFirst = Math.max(rangeFirst, i);
					segLast = Math.min(rangeLast, i);
	
					// deal with in-between indices
					segFirst = Math.ceil(segFirst); // in-between starts round to next cell
					segLast = Math.floor(segLast); // in-between ends round to prev cell
	
					if (segFirst <= segLast) { // was there any intersection with the current row?
						segs.push({
							row: row,
	
							// normalize to start of row
							firstRowDayIndex: segFirst - rowFirst,
							lastRowDayIndex: segLast - rowFirst,
	
							// must be matching integers to be the segment's start/end
							isStart: segFirst === rangeFirst,
							isEnd: segLast === rangeLast
						});
					}
				}
			}
	
			return segs;
		},
	
	
		/* Header Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderHeadHtml: function() {
			var view = this.view;
	
			return '' +
				'<div class="fc-row ' + view.widgetHeaderClass + '">' +
					'<table>' +
						'<thead>' +
							this.renderHeadTrHtml() +
						'</thead>' +
					'</table>' +
				'</div>';
		},
	
	
		renderHeadIntroHtml: function() {
			return this.renderIntroHtml(); // fall back to generic
		},
	
	
		renderHeadTrHtml: function() {
			return '' +
				'<tr>' +
					(this.isRTL ? '' : this.renderHeadIntroHtml()) +
					this.renderHeadDateCellsHtml() +
					(this.isRTL ? this.renderHeadIntroHtml() : '') +
				'</tr>';
		},
	
	
		renderHeadDateCellsHtml: function() {
			var htmls = [];
			var col, date;
	
			for (col = 0; col < this.colCnt; col++) {
				date = this.getCellDate(0, col);
				htmls.push(this.renderHeadDateCellHtml(date));
			}
	
			return htmls.join('');
		},
	
	
		// TODO: when internalApiVersion, accept an object for HTML attributes
		// (colspan should be no different)
		renderHeadDateCellHtml: function(date, colspan, otherAttrs) {
			var view = this.view;
	
			return '' +
				'<th class="fc-day-header ' + view.widgetHeaderClass + ' fc-' + dayIDs[date.day()] + '"' +
					(this.rowCnt == 1 ?
						' data-date="' + date.format('YYYY-MM-DD') + '"' :
						'') +
					(colspan > 1 ?
						' colspan="' + colspan + '"' :
						'') +
					(otherAttrs ?
						' ' + otherAttrs :
						'') +
				'>' +
					htmlEscape(date.format(this.colHeadFormat)) +
				'</th>';
		},
	
	
		/* Background Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderBgTrHtml: function(row) {
			return '' +
				'<tr>' +
					(this.isRTL ? '' : this.renderBgIntroHtml(row)) +
					this.renderBgCellsHtml(row) +
					(this.isRTL ? this.renderBgIntroHtml(row) : '') +
				'</tr>';
		},
	
	
		renderBgIntroHtml: function(row) {
			return this.renderIntroHtml(); // fall back to generic
		},
	
	
		renderBgCellsHtml: function(row) {
			var htmls = [];
			var col, date;
	
			for (col = 0; col < this.colCnt; col++) {
				date = this.getCellDate(row, col);
				htmls.push(this.renderBgCellHtml(date));
			}
	
			return htmls.join('');
		},
	
	
		renderBgCellHtml: function(date, otherAttrs) {
			var view = this.view;
			var classes = this.getDayClasses(date);
	
			classes.unshift('fc-day', view.widgetContentClass);
	
			return '<td class="' + classes.join(' ') + '"' +
				' data-date="' + date.format('YYYY-MM-DD') + '"' + // if date has a time, won't format it
				(otherAttrs ?
					' ' + otherAttrs :
					'') +
				'></td>';
		},
	
	
		/* Generic
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Generates the default HTML intro for any row. User classes should override
		renderIntroHtml: function() {
		},
	
	
		// TODO: a generic method for dealing with <tr>, RTL, intro
		// when increment internalApiVersion
		// wrapTr (scheduler)
	
	
		/* Utils
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Applies the generic "intro" and "outro" HTML to the given cells.
		// Intro means the leftmost cell when the calendar is LTR and the rightmost cell when RTL. Vice-versa for outro.
		bookendCells: function(trEl) {
			var introHtml = this.renderIntroHtml();
	
			if (introHtml) {
				if (this.isRTL) {
					trEl.append(introHtml);
				}
				else {
					trEl.prepend(introHtml);
				}
			}
		}
	
	};
	
	;;
	
	/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
	----------------------------------------------------------------------------------------------------------------------*/
	
	var DayGrid = FC.DayGrid = Grid.extend(DayTableMixin, {
	
		numbersVisible: false, // should render a row for day/week numbers? set by outside view. TODO: make internal
		bottomCoordPadding: 0, // hack for extending the hit area for the last row of the coordinate grid
	
		rowEls: null, // set of fake row elements
		cellEls: null, // set of whole-day elements comprising the row's background
		helperEls: null, // set of cell skeleton elements for rendering the mock event "helper"
	
		rowCoordCache: null,
		colCoordCache: null,
	
	
		// Renders the rows and columns into the component's `this.el`, which should already be assigned.
		// isRigid determins whether the individual rows should ignore the contents and be a constant height.
		// Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
		renderDates: function(isRigid) {
			var view = this.view;
			var rowCnt = this.rowCnt;
			var colCnt = this.colCnt;
			var html = '';
			var row;
			var col;
	
			for (row = 0; row < rowCnt; row++) {
				html += this.renderDayRowHtml(row, isRigid);
			}
			this.el.html(html);
	
			this.rowEls = this.el.find('.fc-row');
			this.cellEls = this.el.find('.fc-day');
	
			this.rowCoordCache = new CoordCache({
				els: this.rowEls,
				isVertical: true
			});
			this.colCoordCache = new CoordCache({
				els: this.cellEls.slice(0, this.colCnt), // only the first row
				isHorizontal: true
			});
	
			// trigger dayRender with each cell's element
			for (row = 0; row < rowCnt; row++) {
				for (col = 0; col < colCnt; col++) {
					view.trigger(
						'dayRender',
						null,
						this.getCellDate(row, col),
						this.getCellEl(row, col)
					);
				}
			}
		},
	
	
		unrenderDates: function() {
			this.removeSegPopover();
		},
	
	
		renderBusinessHours: function() {
			var segs = this.buildBusinessHourSegs(true); // wholeDay=true
			this.renderFill('businessHours', segs, 'bgevent');
		},
	
	
		unrenderBusinessHours: function() {
			this.unrenderFill('businessHours');
		},
	
	
		// Generates the HTML for a single row, which is a div that wraps a table.
		// `row` is the row number.
		renderDayRowHtml: function(row, isRigid) {
			var view = this.view;
			var classes = [ 'fc-row', 'fc-week', view.widgetContentClass ];
	
			if (isRigid) {
				classes.push('fc-rigid');
			}
	
			return '' +
				'<div class="' + classes.join(' ') + '">' +
					'<div class="fc-bg">' +
						'<table>' +
							this.renderBgTrHtml(row) +
						'</table>' +
					'</div>' +
					'<div class="fc-content-skeleton">' +
						'<table>' +
							(this.numbersVisible ?
								'<thead>' +
									this.renderNumberTrHtml(row) +
								'</thead>' :
								''
								) +
						'</table>' +
					'</div>' +
				'</div>';
		},
	
	
		/* Grid Number Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderNumberTrHtml: function(row) {
			return '' +
				'<tr>' +
					(this.isRTL ? '' : this.renderNumberIntroHtml(row)) +
					this.renderNumberCellsHtml(row) +
					(this.isRTL ? this.renderNumberIntroHtml(row) : '') +
				'</tr>';
		},
	
	
		renderNumberIntroHtml: function(row) {
			return this.renderIntroHtml();
		},
	
	
		renderNumberCellsHtml: function(row) {
			var htmls = [];
			var col, date;
	
			for (col = 0; col < this.colCnt; col++) {
				date = this.getCellDate(row, col);
				htmls.push(this.renderNumberCellHtml(date));
			}
	
			return htmls.join('');
		},
	
	
		// Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
		// The number row will only exist if either day numbers or week numbers are turned on.
		renderNumberCellHtml: function(date) {
			var classes;
	
			if (!this.view.dayNumbersVisible) { // if there are week numbers but not day numbers
				return '<td/>'; //  will create an empty space above events :(
			}
	
			classes = this.getDayClasses(date);
			classes.unshift('fc-day-number');
	
			return '' +
				'<td class="' + classes.join(' ') + '" data-date="' + date.format() + '">' +
					date.date() +
				'</td>';
		},
	
	
		/* Options
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Computes a default event time formatting string if `timeFormat` is not explicitly defined
		computeEventTimeFormat: function() {
			return this.view.opt('extraSmallTimeFormat'); // like "6p" or "6:30p"
		},
	
	
		// Computes a default `displayEventEnd` value if one is not expliclty defined
		computeDisplayEventEnd: function() {
			return this.colCnt == 1; // we'll likely have space if there's only one day
		},
	
	
		/* Dates
		------------------------------------------------------------------------------------------------------------------*/
	
	
		rangeUpdated: function() {
			this.updateDayTable();
		},
	
	
		// Slices up the given span (unzoned start/end with other misc data) into an array of segments
		spanToSegs: function(span) {
			var segs = this.sliceRangeByRow(span);
			var i, seg;
	
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
				if (this.isRTL) {
					seg.leftCol = this.daysPerRow - 1 - seg.lastRowDayIndex;
					seg.rightCol = this.daysPerRow - 1 - seg.firstRowDayIndex;
				}
				else {
					seg.leftCol = seg.firstRowDayIndex;
					seg.rightCol = seg.lastRowDayIndex;
				}
			}
	
			return segs;
		},
	
	
		/* Hit System
		------------------------------------------------------------------------------------------------------------------*/
	
	
		prepareHits: function() {
			this.colCoordCache.build();
			this.rowCoordCache.build();
			this.rowCoordCache.bottoms[this.rowCnt - 1] += this.bottomCoordPadding; // hack
		},
	
	
		releaseHits: function() {
			this.colCoordCache.clear();
			this.rowCoordCache.clear();
		},
	
	
		queryHit: function(leftOffset, topOffset) {
			if (this.colCoordCache.isLeftInBounds(leftOffset) && this.rowCoordCache.isTopInBounds(topOffset)) {
				var col = this.colCoordCache.getHorizontalIndex(leftOffset);
				var row = this.rowCoordCache.getVerticalIndex(topOffset);
	
				if (row != null && col != null) {
					return this.getCellHit(row, col);
				}
			}
		},
	
	
		getHitSpan: function(hit) {
			return this.getCellRange(hit.row, hit.col);
		},
	
	
		getHitEl: function(hit) {
			return this.getCellEl(hit.row, hit.col);
		},
	
	
		/* Cell System
		------------------------------------------------------------------------------------------------------------------*/
		// FYI: the first column is the leftmost column, regardless of date
	
	
		getCellHit: function(row, col) {
			return {
				row: row,
				col: col,
				component: this, // needed unfortunately :(
				left: this.colCoordCache.getLeftOffset(col),
				right: this.colCoordCache.getRightOffset(col),
				top: this.rowCoordCache.getTopOffset(row),
				bottom: this.rowCoordCache.getBottomOffset(row)
			};
		},
	
	
		getCellEl: function(row, col) {
			return this.cellEls.eq(row * this.colCnt + col);
		},
	
	
		/* Event Drag Visualization
		------------------------------------------------------------------------------------------------------------------*/
		// TODO: move to DayGrid.event, similar to what we did with Grid's drag methods
	
	
		// Renders a visual indication of an event or external element being dragged.
		// `eventLocation` has zoned start and end (optional)
		renderDrag: function(eventLocation, seg) {
	
			// always render a highlight underneath
			this.renderHighlight(this.eventToSpan(eventLocation));
	
			// if a segment from the same calendar but another component is being dragged, render a helper event
			if (seg && seg.component !== this) {
				return this.renderEventLocationHelper(eventLocation, seg); // returns mock event elements
			}
		},
	
	
		// Unrenders any visual indication of a hovering event
		unrenderDrag: function() {
			this.unrenderHighlight();
			this.unrenderHelper();
		},
	
	
		/* Event Resize Visualization
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of an event being resized
		renderEventResize: function(eventLocation, seg) {
			this.renderHighlight(this.eventToSpan(eventLocation));
			return this.renderEventLocationHelper(eventLocation, seg); // returns mock event elements
		},
	
	
		// Unrenders a visual indication of an event being resized
		unrenderEventResize: function() {
			this.unrenderHighlight();
			this.unrenderHelper();
		},
	
	
		/* Event Helper
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a mock "helper" event. `sourceSeg` is the associated internal segment object. It can be null.
		renderHelper: function(event, sourceSeg) {
			var helperNodes = [];
			var segs = this.eventToSegs(event);
			var rowStructs;
	
			segs = this.renderFgSegEls(segs); // assigns each seg's el and returns a subset of segs that were rendered
			rowStructs = this.renderSegRows(segs);
	
			// inject each new event skeleton into each associated row
			this.rowEls.each(function(row, rowNode) {
				var rowEl = $(rowNode); // the .fc-row
				var skeletonEl = $('<div class="fc-helper-skeleton"><table/></div>'); // will be absolutely positioned
				var skeletonTop;
	
				// If there is an original segment, match the top position. Otherwise, put it at the row's top level
				if (sourceSeg && sourceSeg.row === row) {
					skeletonTop = sourceSeg.el.position().top;
				}
				else {
					skeletonTop = rowEl.find('.fc-content-skeleton tbody').position().top;
				}
	
				skeletonEl.css('top', skeletonTop)
					.find('table')
						.append(rowStructs[row].tbodyEl);
	
				rowEl.append(skeletonEl);
				helperNodes.push(skeletonEl[0]);
			});
	
			return ( // must return the elements rendered
				this.helperEls = $(helperNodes) // array -> jQuery set
			);
		},
	
	
		// Unrenders any visual indication of a mock helper event
		unrenderHelper: function() {
			if (this.helperEls) {
				this.helperEls.remove();
				this.helperEls = null;
			}
		},
	
	
		/* Fill System (highlight, background events, business hours)
		------------------------------------------------------------------------------------------------------------------*/
	
	
		fillSegTag: 'td', // override the default tag name
	
	
		// Renders a set of rectangles over the given segments of days.
		// Only returns segments that successfully rendered.
		renderFill: function(type, segs, className) {
			var nodes = [];
			var i, seg;
			var skeletonEl;
	
			segs = this.renderFillSegEls(type, segs); // assignes `.el` to each seg. returns successfully rendered segs
	
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
				skeletonEl = this.renderFillRow(type, seg, className);
				this.rowEls.eq(seg.row).append(skeletonEl);
				nodes.push(skeletonEl[0]);
			}
	
			this.elsByFill[type] = $(nodes);
	
			return segs;
		},
	
	
		// Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
		renderFillRow: function(type, seg, className) {
			var colCnt = this.colCnt;
			var startCol = seg.leftCol;
			var endCol = seg.rightCol + 1;
			var skeletonEl;
			var trEl;
	
			className = className || type.toLowerCase();
	
			skeletonEl = $(
				'<div class="fc-' + className + '-skeleton">' +
					'<table><tr/></table>' +
				'</div>'
			);
			trEl = skeletonEl.find('tr');
	
			if (startCol > 0) {
				trEl.append('<td colspan="' + startCol + '"/>');
			}
	
			trEl.append(
				seg.el.attr('colspan', endCol - startCol)
			);
	
			if (endCol < colCnt) {
				trEl.append('<td colspan="' + (colCnt - endCol) + '"/>');
			}
	
			this.bookendCells(trEl);
	
			return skeletonEl;
		}
	
	});
	
	;;
	
	/* Event-rendering methods for the DayGrid class
	----------------------------------------------------------------------------------------------------------------------*/
	
	DayGrid.mixin({
	
		rowStructs: null, // an array of objects, each holding information about a row's foreground event-rendering
	
	
		// Unrenders all events currently rendered on the grid
		unrenderEvents: function() {
			this.removeSegPopover(); // removes the "more.." events popover
			Grid.prototype.unrenderEvents.apply(this, arguments); // calls the super-method
		},
	
	
		// Retrieves all rendered segment objects currently rendered on the grid
		getEventSegs: function() {
			return Grid.prototype.getEventSegs.call(this) // get the segments from the super-method
				.concat(this.popoverSegs || []); // append the segments from the "more..." popover
		},
	
	
		// Renders the given background event segments onto the grid
		renderBgSegs: function(segs) {
	
			// don't render timed background events
			var allDaySegs = $.grep(segs, function(seg) {
				return seg.event.allDay;
			});
	
			return Grid.prototype.renderBgSegs.call(this, allDaySegs); // call the super-method
		},
	
	
		// Renders the given foreground event segments onto the grid
		renderFgSegs: function(segs) {
			var rowStructs;
	
			// render an `.el` on each seg
			// returns a subset of the segs. segs that were actually rendered
			segs = this.renderFgSegEls(segs);
	
			rowStructs = this.rowStructs = this.renderSegRows(segs);
	
			// append to each row's content skeleton
			this.rowEls.each(function(i, rowNode) {
				$(rowNode).find('.fc-content-skeleton > table').append(
					rowStructs[i].tbodyEl
				);
			});
	
			return segs; // return only the segs that were actually rendered
		},
	
	
		// Unrenders all currently rendered foreground event segments
		unrenderFgSegs: function() {
			var rowStructs = this.rowStructs || [];
			var rowStruct;
	
			while ((rowStruct = rowStructs.pop())) {
				rowStruct.tbodyEl.remove();
			}
	
			this.rowStructs = null;
		},
	
	
		// Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
		// Returns an array of rowStruct objects (see the bottom of `renderSegRow`).
		// PRECONDITION: each segment shoud already have a rendered and assigned `.el`
		renderSegRows: function(segs) {
			var rowStructs = [];
			var segRows;
			var row;
	
			segRows = this.groupSegRows(segs); // group into nested arrays
	
			// iterate each row of segment groupings
			for (row = 0; row < segRows.length; row++) {
				rowStructs.push(
					this.renderSegRow(row, segRows[row])
				);
			}
	
			return rowStructs;
		},
	
	
		// Builds the HTML to be used for the default element for an individual segment
		fgSegHtml: function(seg, disableResizing) {
			var view = this.view;
			var event = seg.event;
			var isDraggable = view.isEventDraggable(event);
			var isResizableFromStart = !disableResizing && event.allDay &&
				seg.isStart && view.isEventResizableFromStart(event);
			var isResizableFromEnd = !disableResizing && event.allDay &&
				seg.isEnd && view.isEventResizableFromEnd(event);
			var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd);
			var skinCss = cssToStr(this.getSegSkinCss(seg));
			var timeHtml = '';
			var timeText;
			var titleHtml;
	
			classes.unshift('fc-day-grid-event', 'fc-h-event');
	
			// Only display a timed events time if it is the starting segment
			if (seg.isStart) {
				timeText = this.getEventTimeText(event);
				if (timeText) {
					timeHtml = '<span class="fc-time">' + htmlEscape(timeText) + '</span>';
				}
			}
	
			titleHtml =
				'<span class="fc-title">' +
					(htmlEscape(event.title || '') || '&nbsp;') + // we always want one line of height
				'</span>';
			
			return '<a class="' + classes.join(' ') + '"' +
					(event.url ?
						' href="' + htmlEscape(event.url) + '"' :
						''
						) +
					(skinCss ?
						' style="' + skinCss + '"' :
						''
						) +
				'>' +
					'<div class="fc-content">' +
						(this.isRTL ?
							titleHtml + ' ' + timeHtml : // put a natural space in between
							timeHtml + ' ' + titleHtml   //
							) +
					'</div>' +
					(isResizableFromStart ?
						'<div class="fc-resizer fc-start-resizer" />' :
						''
						) +
					(isResizableFromEnd ?
						'<div class="fc-resizer fc-end-resizer" />' :
						''
						) +
				'</a>';
		},
	
	
		// Given a row # and an array of segments all in the same row, render a <tbody> element, a skeleton that contains
		// the segments. Returns object with a bunch of internal data about how the render was calculated.
		// NOTE: modifies rowSegs
		renderSegRow: function(row, rowSegs) {
			var colCnt = this.colCnt;
			var segLevels = this.buildSegLevels(rowSegs); // group into sub-arrays of levels
			var levelCnt = Math.max(1, segLevels.length); // ensure at least one level
			var tbody = $('<tbody/>');
			var segMatrix = []; // lookup for which segments are rendered into which level+col cells
			var cellMatrix = []; // lookup for all <td> elements of the level+col matrix
			var loneCellMatrix = []; // lookup for <td> elements that only take up a single column
			var i, levelSegs;
			var col;
			var tr;
			var j, seg;
			var td;
	
			// populates empty cells from the current column (`col`) to `endCol`
			function emptyCellsUntil(endCol) {
				while (col < endCol) {
					// try to grab a cell from the level above and extend its rowspan. otherwise, create a fresh cell
					td = (loneCellMatrix[i - 1] || [])[col];
					if (td) {
						td.attr(
							'rowspan',
							parseInt(td.attr('rowspan') || 1, 10) + 1
						);
					}
					else {
						td = $('<td/>');
						tr.append(td);
					}
					cellMatrix[i][col] = td;
					loneCellMatrix[i][col] = td;
					col++;
				}
			}
	
			for (i = 0; i < levelCnt; i++) { // iterate through all levels
				levelSegs = segLevels[i];
				col = 0;
				tr = $('<tr/>');
	
				segMatrix.push([]);
				cellMatrix.push([]);
				loneCellMatrix.push([]);
	
				// levelCnt might be 1 even though there are no actual levels. protect against this.
				// this single empty row is useful for styling.
				if (levelSegs) {
					for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
						seg = levelSegs[j];
	
						emptyCellsUntil(seg.leftCol);
	
						// create a container that occupies or more columns. append the event element.
						td = $('<td class="fc-event-container"/>').append(seg.el);
						if (seg.leftCol != seg.rightCol) {
							td.attr('colspan', seg.rightCol - seg.leftCol + 1);
						}
						else { // a single-column segment
							loneCellMatrix[i][col] = td;
						}
	
						while (col <= seg.rightCol) {
							cellMatrix[i][col] = td;
							segMatrix[i][col] = seg;
							col++;
						}
	
						tr.append(td);
					}
				}
	
				emptyCellsUntil(colCnt); // finish off the row
				this.bookendCells(tr);
				tbody.append(tr);
			}
	
			return { // a "rowStruct"
				row: row, // the row number
				tbodyEl: tbody,
				cellMatrix: cellMatrix,
				segMatrix: segMatrix,
				segLevels: segLevels,
				segs: rowSegs
			};
		},
	
	
		// Stacks a flat array of segments, which are all assumed to be in the same row, into subarrays of vertical levels.
		// NOTE: modifies segs
		buildSegLevels: function(segs) {
			var levels = [];
			var i, seg;
			var j;
	
			// Give preference to elements with certain criteria, so they have
			// a chance to be closer to the top.
			this.sortEventSegs(segs);
			
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
	
				// loop through levels, starting with the topmost, until the segment doesn't collide with other segments
				for (j = 0; j < levels.length; j++) {
					if (!isDaySegCollision(seg, levels[j])) {
						break;
					}
				}
				// `j` now holds the desired subrow index
				seg.level = j;
	
				// create new level array if needed and append segment
				(levels[j] || (levels[j] = [])).push(seg);
			}
	
			// order segments left-to-right. very important if calendar is RTL
			for (j = 0; j < levels.length; j++) {
				levels[j].sort(compareDaySegCols);
			}
	
			return levels;
		},
	
	
		// Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
		groupSegRows: function(segs) {
			var segRows = [];
			var i;
	
			for (i = 0; i < this.rowCnt; i++) {
				segRows.push([]);
			}
	
			for (i = 0; i < segs.length; i++) {
				segRows[segs[i].row].push(segs[i]);
			}
	
			return segRows;
		}
	
	});
	
	
	// Computes whether two segments' columns collide. They are assumed to be in the same row.
	function isDaySegCollision(seg, otherSegs) {
		var i, otherSeg;
	
		for (i = 0; i < otherSegs.length; i++) {
			otherSeg = otherSegs[i];
	
			if (
				otherSeg.leftCol <= seg.rightCol &&
				otherSeg.rightCol >= seg.leftCol
			) {
				return true;
			}
		}
	
		return false;
	}
	
	
	// A cmp function for determining the leftmost event
	function compareDaySegCols(a, b) {
		return a.leftCol - b.leftCol;
	}
	
	;;
	
	/* Methods relate to limiting the number events for a given day on a DayGrid
	----------------------------------------------------------------------------------------------------------------------*/
	// NOTE: all the segs being passed around in here are foreground segs
	
	DayGrid.mixin({
	
		segPopover: null, // the Popover that holds events that can't fit in a cell. null when not visible
		popoverSegs: null, // an array of segment objects that the segPopover holds. null when not visible
	
	
		removeSegPopover: function() {
			if (this.segPopover) {
				this.segPopover.hide(); // in handler, will call segPopover's removeElement
			}
		},
	
	
		// Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
		// `levelLimit` can be false (don't limit), a number, or true (should be computed).
		limitRows: function(levelLimit) {
			var rowStructs = this.rowStructs || [];
			var row; // row #
			var rowLevelLimit;
	
			for (row = 0; row < rowStructs.length; row++) {
				this.unlimitRow(row);
	
				if (!levelLimit) {
					rowLevelLimit = false;
				}
				else if (typeof levelLimit === 'number') {
					rowLevelLimit = levelLimit;
				}
				else {
					rowLevelLimit = this.computeRowLevelLimit(row);
				}
	
				if (rowLevelLimit !== false) {
					this.limitRow(row, rowLevelLimit);
				}
			}
		},
	
	
		// Computes the number of levels a row will accomodate without going outside its bounds.
		// Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
		// `row` is the row number.
		computeRowLevelLimit: function(row) {
			var rowEl = this.rowEls.eq(row); // the containing "fake" row div
			var rowHeight = rowEl.height(); // TODO: cache somehow?
			var trEls = this.rowStructs[row].tbodyEl.children();
			var i, trEl;
			var trHeight;
	
			function iterInnerHeights(i, childNode) {
				trHeight = Math.max(trHeight, $(childNode).outerHeight());
			}
	
			// Reveal one level <tr> at a time and stop when we find one out of bounds
			for (i = 0; i < trEls.length; i++) {
				trEl = trEls.eq(i).removeClass('fc-limited'); // reset to original state (reveal)
	
				// with rowspans>1 and IE8, trEl.outerHeight() would return the height of the largest cell,
				// so instead, find the tallest inner content element.
				trHeight = 0;
				trEl.find('> td > :first-child').each(iterInnerHeights);
	
				if (trEl.position().top + trHeight > rowHeight) {
					return i;
				}
			}
	
			return false; // should not limit at all
		},
	
	
		// Limits the given grid row to the maximum number of levels and injects "more" links if necessary.
		// `row` is the row number.
		// `levelLimit` is a number for the maximum (inclusive) number of levels allowed.
		limitRow: function(row, levelLimit) {
			var _this = this;
			var rowStruct = this.rowStructs[row];
			var moreNodes = []; // array of "more" <a> links and <td> DOM nodes
			var col = 0; // col #, left-to-right (not chronologically)
			var levelSegs; // array of segment objects in the last allowable level, ordered left-to-right
			var cellMatrix; // a matrix (by level, then column) of all <td> jQuery elements in the row
			var limitedNodes; // array of temporarily hidden level <tr> and segment <td> DOM nodes
			var i, seg;
			var segsBelow; // array of segment objects below `seg` in the current `col`
			var totalSegsBelow; // total number of segments below `seg` in any of the columns `seg` occupies
			var colSegsBelow; // array of segment arrays, below seg, one for each column (offset from segs's first column)
			var td, rowspan;
			var segMoreNodes; // array of "more" <td> cells that will stand-in for the current seg's cell
			var j;
			var moreTd, moreWrap, moreLink;
	
			// Iterates through empty level cells and places "more" links inside if need be
			function emptyCellsUntil(endCol) { // goes from current `col` to `endCol`
				while (col < endCol) {
					segsBelow = _this.getCellSegs(row, col, levelLimit);
					if (segsBelow.length) {
						td = cellMatrix[levelLimit - 1][col];
						moreLink = _this.renderMoreLink(row, col, segsBelow);
						moreWrap = $('<div/>').append(moreLink);
						td.append(moreWrap);
						moreNodes.push(moreWrap[0]);
					}
					col++;
				}
			}
	
			if (levelLimit && levelLimit < rowStruct.segLevels.length) { // is it actually over the limit?
				levelSegs = rowStruct.segLevels[levelLimit - 1];
				cellMatrix = rowStruct.cellMatrix;
	
				limitedNodes = rowStruct.tbodyEl.children().slice(levelLimit) // get level <tr> elements past the limit
					.addClass('fc-limited').get(); // hide elements and get a simple DOM-nodes array
	
				// iterate though segments in the last allowable level
				for (i = 0; i < levelSegs.length; i++) {
					seg = levelSegs[i];
					emptyCellsUntil(seg.leftCol); // process empty cells before the segment
	
					// determine *all* segments below `seg` that occupy the same columns
					colSegsBelow = [];
					totalSegsBelow = 0;
					while (col <= seg.rightCol) {
						segsBelow = this.getCellSegs(row, col, levelLimit);
						colSegsBelow.push(segsBelow);
						totalSegsBelow += segsBelow.length;
						col++;
					}
	
					if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
						td = cellMatrix[levelLimit - 1][seg.leftCol]; // the segment's parent cell
						rowspan = td.attr('rowspan') || 1;
						segMoreNodes = [];
	
						// make a replacement <td> for each column the segment occupies. will be one for each colspan
						for (j = 0; j < colSegsBelow.length; j++) {
							moreTd = $('<td class="fc-more-cell"/>').attr('rowspan', rowspan);
							segsBelow = colSegsBelow[j];
							moreLink = this.renderMoreLink(
								row,
								seg.leftCol + j,
								[ seg ].concat(segsBelow) // count seg as hidden too
							);
							moreWrap = $('<div/>').append(moreLink);
							moreTd.append(moreWrap);
							segMoreNodes.push(moreTd[0]);
							moreNodes.push(moreTd[0]);
						}
	
						td.addClass('fc-limited').after($(segMoreNodes)); // hide original <td> and inject replacements
						limitedNodes.push(td[0]);
					}
				}
	
				emptyCellsUntil(this.colCnt); // finish off the level
				rowStruct.moreEls = $(moreNodes); // for easy undoing later
				rowStruct.limitedEls = $(limitedNodes); // for easy undoing later
			}
		},
	
	
		// Reveals all levels and removes all "more"-related elements for a grid's row.
		// `row` is a row number.
		unlimitRow: function(row) {
			var rowStruct = this.rowStructs[row];
	
			if (rowStruct.moreEls) {
				rowStruct.moreEls.remove();
				rowStruct.moreEls = null;
			}
	
			if (rowStruct.limitedEls) {
				rowStruct.limitedEls.removeClass('fc-limited');
				rowStruct.limitedEls = null;
			}
		},
	
	
		// Renders an <a> element that represents hidden event element for a cell.
		// Responsible for attaching click handler as well.
		renderMoreLink: function(row, col, hiddenSegs) {
			var _this = this;
			var view = this.view;
	
			return $('<a class="fc-more"/>')
				.text(
					this.getMoreLinkText(hiddenSegs.length)
				)
				.on('click', function(ev) {
					var clickOption = view.opt('eventLimitClick');
					var date = _this.getCellDate(row, col);
					var moreEl = $(this);
					var dayEl = _this.getCellEl(row, col);
					var allSegs = _this.getCellSegs(row, col);
	
					// rescope the segments to be within the cell's date
					var reslicedAllSegs = _this.resliceDaySegs(allSegs, date);
					var reslicedHiddenSegs = _this.resliceDaySegs(hiddenSegs, date);
	
					if (typeof clickOption === 'function') {
						// the returned value can be an atomic option
						clickOption = view.trigger('eventLimitClick', null, {
							date: date,
							dayEl: dayEl,
							moreEl: moreEl,
							segs: reslicedAllSegs,
							hiddenSegs: reslicedHiddenSegs
						}, ev);
					}
	
					if (clickOption === 'popover') {
						_this.showSegPopover(row, col, moreEl, reslicedAllSegs);
					}
					else if (typeof clickOption === 'string') { // a view name
						view.calendar.zoomTo(date, clickOption);
					}
				});
		},
	
	
		// Reveals the popover that displays all events within a cell
		showSegPopover: function(row, col, moreLink, segs) {
			var _this = this;
			var view = this.view;
			var moreWrap = moreLink.parent(); // the <div> wrapper around the <a>
			var topEl; // the element we want to match the top coordinate of
			var options;
	
			if (this.rowCnt == 1) {
				topEl = view.el; // will cause the popover to cover any sort of header
			}
			else {
				topEl = this.rowEls.eq(row); // will align with top of row
			}
	
			options = {
				className: 'fc-more-popover',
				content: this.renderSegPopoverContent(row, col, segs),
				parentEl: this.view.el, // attach to root of view. guarantees outside of scrollbars.
				top: topEl.offset().top,
				autoHide: true, // when the user clicks elsewhere, hide the popover
				viewportConstrain: view.opt('popoverViewportConstrain'),
				hide: function() {
					// kill everything when the popover is hidden
					_this.segPopover.removeElement();
					_this.segPopover = null;
					_this.popoverSegs = null;
				}
			};
	
			// Determine horizontal coordinate.
			// We use the moreWrap instead of the <td> to avoid border confusion.
			if (this.isRTL) {
				options.right = moreWrap.offset().left + moreWrap.outerWidth() + 1; // +1 to be over cell border
			}
			else {
				options.left = moreWrap.offset().left - 1; // -1 to be over cell border
			}
	
			this.segPopover = new Popover(options);
			this.segPopover.show();
	
			// the popover doesn't live within the grid's container element, and thus won't get the event
			// delegated-handlers for free. attach event-related handlers to the popover.
			this.bindSegHandlersToEl(this.segPopover.el);
		},
	
	
		// Builds the inner DOM contents of the segment popover
		renderSegPopoverContent: function(row, col, segs) {
			var view = this.view;
			var isTheme = view.opt('theme');
			var title = this.getCellDate(row, col).format(view.opt('dayPopoverFormat'));
			var content = $(
				'<div class="fc-header ' + view.widgetHeaderClass + '">' +
					'<span class="fc-close ' +
						(isTheme ? 'ui-icon ui-icon-closethick' : 'fc-icon fc-icon-x') +
					'"></span>' +
					'<span class="fc-title">' +
						htmlEscape(title) +
					'</span>' +
					'<div class="fc-clear"/>' +
				'</div>' +
				'<div class="fc-body ' + view.widgetContentClass + '">' +
					'<div class="fc-event-container"></div>' +
				'</div>'
			);
			var segContainer = content.find('.fc-event-container');
			var i;
	
			// render each seg's `el` and only return the visible segs
			segs = this.renderFgSegEls(segs, true); // disableResizing=true
			this.popoverSegs = segs;
	
			for (i = 0; i < segs.length; i++) {
	
				// because segments in the popover are not part of a grid coordinate system, provide a hint to any
				// grids that want to do drag-n-drop about which cell it came from
				this.prepareHits();
				segs[i].hit = this.getCellHit(row, col);
				this.releaseHits();
	
				segContainer.append(segs[i].el);
			}
	
			return content;
		},
	
	
		// Given the events within an array of segment objects, reslice them to be in a single day
		resliceDaySegs: function(segs, dayDate) {
	
			// build an array of the original events
			var events = $.map(segs, function(seg) {
				return seg.event;
			});
	
			var dayStart = dayDate.clone();
			var dayEnd = dayStart.clone().add(1, 'days');
			var dayRange = { start: dayStart, end: dayEnd };
	
			// slice the events with a custom slicing function
			segs = this.eventsToSegs(
				events,
				function(range) {
					var seg = intersectRanges(range, dayRange); // undefind if no intersection
					return seg ? [ seg ] : []; // must return an array of segments
				}
			);
	
			// force an order because eventsToSegs doesn't guarantee one
			this.sortEventSegs(segs);
	
			return segs;
		},
	
	
		// Generates the text that should be inside a "more" link, given the number of events it represents
		getMoreLinkText: function(num) {
			var opt = this.view.opt('eventLimitText');
	
			if (typeof opt === 'function') {
				return opt(num);
			}
			else {
				return '+' + num + ' ' + opt;
			}
		},
	
	
		// Returns segments within a given cell.
		// If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
		getCellSegs: function(row, col, startLevel) {
			var segMatrix = this.rowStructs[row].segMatrix;
			var level = startLevel || 0;
			var segs = [];
			var seg;
	
			while (level < segMatrix.length) {
				seg = segMatrix[level][col];
				if (seg) {
					segs.push(seg);
				}
				level++;
			}
	
			return segs;
		}
	
	});
	
	;;
	
	/* A component that renders one or more columns of vertical time slots
	----------------------------------------------------------------------------------------------------------------------*/
	// We mixin DayTable, even though there is only a single row of days
	
	var TimeGrid = FC.TimeGrid = Grid.extend(DayTableMixin, {
	
		slotDuration: null, // duration of a "slot", a distinct time segment on given day, visualized by lines
		snapDuration: null, // granularity of time for dragging and selecting
		snapsPerSlot: null,
		minTime: null, // Duration object that denotes the first visible time of any given day
		maxTime: null, // Duration object that denotes the exclusive visible end time of any given day
		labelFormat: null, // formatting string for times running along vertical axis
		labelInterval: null, // duration of how often a label should be displayed for a slot
	
		colEls: null, // cells elements in the day-row background
		slatContainerEl: null, // div that wraps all the slat rows
		slatEls: null, // elements running horizontally across all columns
		nowIndicatorEls: null,
	
		colCoordCache: null,
		slatCoordCache: null,
	
	
		constructor: function() {
			Grid.apply(this, arguments); // call the super-constructor
	
			this.processOptions();
		},
	
	
		// Renders the time grid into `this.el`, which should already be assigned.
		// Relies on the view's colCnt. In the future, this component should probably be self-sufficient.
		renderDates: function() {
			this.el.html(this.renderHtml());
			this.colEls = this.el.find('.fc-day');
			this.slatContainerEl = this.el.find('.fc-slats');
			this.slatEls = this.slatContainerEl.find('tr');
	
			this.colCoordCache = new CoordCache({
				els: this.colEls,
				isHorizontal: true
			});
			this.slatCoordCache = new CoordCache({
				els: this.slatEls,
				isVertical: true
			});
	
			this.renderContentSkeleton();
		},
	
	
		// Renders the basic HTML skeleton for the grid
		renderHtml: function() {
			return '' +
				'<div class="fc-bg">' +
					'<table>' +
						this.renderBgTrHtml(0) + // row=0
					'</table>' +
				'</div>' +
				'<div class="fc-slats">' +
					'<table>' +
						this.renderSlatRowHtml() +
					'</table>' +
				'</div>';
		},
	
	
		// Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
		renderSlatRowHtml: function() {
			var view = this.view;
			var isRTL = this.isRTL;
			var html = '';
			var slotTime = moment.duration(+this.minTime); // wish there was .clone() for durations
			var slotDate; // will be on the view's first day, but we only care about its time
			var isLabeled;
			var axisHtml;
	
			// Calculate the time for each slot
			while (slotTime < this.maxTime) {
				slotDate = this.start.clone().time(slotTime);
				isLabeled = isInt(divideDurationByDuration(slotTime, this.labelInterval));
	
				axisHtml =
					'<td class="fc-axis fc-time ' + view.widgetContentClass + '" ' + view.axisStyleAttr() + '>' +
						(isLabeled ?
							'<span>' + // for matchCellWidths
								htmlEscape(slotDate.format(this.labelFormat)) +
							'</span>' :
							''
							) +
					'</td>';
	
				html +=
					'<tr data-time="' + slotDate.format('HH:mm:ss') + '"' +
						(isLabeled ? '' : ' class="fc-minor"') +
						'>' +
						(!isRTL ? axisHtml : '') +
						'<td class="' + view.widgetContentClass + '"/>' +
						(isRTL ? axisHtml : '') +
					"</tr>";
	
				slotTime.add(this.slotDuration);
			}
	
			return html;
		},
	
	
		/* Options
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Parses various options into properties of this object
		processOptions: function() {
			var view = this.view;
			var slotDuration = view.opt('slotDuration');
			var snapDuration = view.opt('snapDuration');
			var input;
	
			slotDuration = moment.duration(slotDuration);
			snapDuration = snapDuration ? moment.duration(snapDuration) : slotDuration;
	
			this.slotDuration = slotDuration;
			this.snapDuration = snapDuration;
			this.snapsPerSlot = slotDuration / snapDuration; // TODO: ensure an integer multiple?
	
			this.minResizeDuration = snapDuration; // hack
	
			this.minTime = moment.duration(view.opt('minTime'));
			this.maxTime = moment.duration(view.opt('maxTime'));
	
			// might be an array value (for TimelineView).
			// if so, getting the most granular entry (the last one probably).
			input = view.opt('slotLabelFormat');
			if ($.isArray(input)) {
				input = input[input.length - 1];
			}
	
			this.labelFormat =
				input ||
				view.opt('axisFormat') || // deprecated
				view.opt('smallTimeFormat'); // the computed default
	
			input = view.opt('slotLabelInterval');
			this.labelInterval = input ?
				moment.duration(input) :
				this.computeLabelInterval(slotDuration);
		},
	
	
		// Computes an automatic value for slotLabelInterval
		computeLabelInterval: function(slotDuration) {
			var i;
			var labelInterval;
			var slotsPerLabel;
	
			// find the smallest stock label interval that results in more than one slots-per-label
			for (i = AGENDA_STOCK_SUB_DURATIONS.length - 1; i >= 0; i--) {
				labelInterval = moment.duration(AGENDA_STOCK_SUB_DURATIONS[i]);
				slotsPerLabel = divideDurationByDuration(labelInterval, slotDuration);
				if (isInt(slotsPerLabel) && slotsPerLabel > 1) {
					return labelInterval;
				}
			}
	
			return moment.duration(slotDuration); // fall back. clone
		},
	
	
		// Computes a default event time formatting string if `timeFormat` is not explicitly defined
		computeEventTimeFormat: function() {
			return this.view.opt('noMeridiemTimeFormat'); // like "6:30" (no AM/PM)
		},
	
	
		// Computes a default `displayEventEnd` value if one is not expliclty defined
		computeDisplayEventEnd: function() {
			return true;
		},
	
	
		/* Hit System
		------------------------------------------------------------------------------------------------------------------*/
	
	
		prepareHits: function() {
			this.colCoordCache.build();
			this.slatCoordCache.build();
		},
	
	
		releaseHits: function() {
			this.colCoordCache.clear();
			// NOTE: don't clear slatCoordCache because we rely on it for computeTimeTop
		},
	
	
		queryHit: function(leftOffset, topOffset) {
			var snapsPerSlot = this.snapsPerSlot;
			var colCoordCache = this.colCoordCache;
			var slatCoordCache = this.slatCoordCache;
	
			if (colCoordCache.isLeftInBounds(leftOffset) && slatCoordCache.isTopInBounds(topOffset)) {
				var colIndex = colCoordCache.getHorizontalIndex(leftOffset);
				var slatIndex = slatCoordCache.getVerticalIndex(topOffset);
	
				if (colIndex != null && slatIndex != null) {
					var slatTop = slatCoordCache.getTopOffset(slatIndex);
					var slatHeight = slatCoordCache.getHeight(slatIndex);
					var partial = (topOffset - slatTop) / slatHeight; // floating point number between 0 and 1
					var localSnapIndex = Math.floor(partial * snapsPerSlot); // the snap # relative to start of slat
					var snapIndex = slatIndex * snapsPerSlot + localSnapIndex;
					var snapTop = slatTop + (localSnapIndex / snapsPerSlot) * slatHeight;
					var snapBottom = slatTop + ((localSnapIndex + 1) / snapsPerSlot) * slatHeight;
	
					return {
						col: colIndex,
						snap: snapIndex,
						component: this, // needed unfortunately :(
						left: colCoordCache.getLeftOffset(colIndex),
						right: colCoordCache.getRightOffset(colIndex),
						top: snapTop,
						bottom: snapBottom
					};
				}
			}
		},
	
	
		getHitSpan: function(hit) {
			var start = this.getCellDate(0, hit.col); // row=0
			var time = this.computeSnapTime(hit.snap); // pass in the snap-index
			var end;
	
			start.time(time);
			end = start.clone().add(this.snapDuration);
	
			return { start: start, end: end };
		},
	
	
		getHitEl: function(hit) {
			return this.colEls.eq(hit.col);
		},
	
	
		/* Dates
		------------------------------------------------------------------------------------------------------------------*/
	
	
		rangeUpdated: function() {
			this.updateDayTable();
		},
	
	
		// Given a row number of the grid, representing a "snap", returns a time (Duration) from its start-of-day
		computeSnapTime: function(snapIndex) {
			return moment.duration(this.minTime + this.snapDuration * snapIndex);
		},
	
	
		// Slices up the given span (unzoned start/end with other misc data) into an array of segments
		spanToSegs: function(span) {
			var segs = this.sliceRangeByTimes(span);
			var i;
	
			for (i = 0; i < segs.length; i++) {
				if (this.isRTL) {
					segs[i].col = this.daysPerRow - 1 - segs[i].dayIndex;
				}
				else {
					segs[i].col = segs[i].dayIndex;
				}
			}
	
			return segs;
		},
	
	
		sliceRangeByTimes: function(range) {
			var segs = [];
			var seg;
			var dayIndex;
			var dayDate;
			var dayRange;
	
			for (dayIndex = 0; dayIndex < this.daysPerRow; dayIndex++) {
				dayDate = this.dayDates[dayIndex].clone(); // TODO: better API for this?
				dayRange = {
					start: dayDate.clone().time(this.minTime),
					end: dayDate.clone().time(this.maxTime)
				};
				seg = intersectRanges(range, dayRange); // both will be ambig timezone
				if (seg) {
					seg.dayIndex = dayIndex;
					segs.push(seg);
				}
			}
	
			return segs;
		},
	
	
		/* Coordinates
		------------------------------------------------------------------------------------------------------------------*/
	
	
		updateSize: function(isResize) { // NOT a standard Grid method
			this.slatCoordCache.build();
	
			if (isResize) {
				this.updateSegVerticals(
					[].concat(this.fgSegs || [], this.bgSegs || [], this.businessSegs || [])
				);
			}
		},
	
	
		getTotalSlatHeight: function() {
			return this.slatContainerEl.outerHeight();
		},
	
	
		// Computes the top coordinate, relative to the bounds of the grid, of the given date.
		// A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
		computeDateTop: function(date, startOfDayDate) {
			return this.computeTimeTop(
				moment.duration(
					date - startOfDayDate.clone().stripTime()
				)
			);
		},
	
	
		// Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
		computeTimeTop: function(time) {
			var len = this.slatEls.length;
			var slatCoverage = (time - this.minTime) / this.slotDuration; // floating-point value of # of slots covered
			var slatIndex;
			var slatRemainder;
	
			// compute a floating-point number for how many slats should be progressed through.
			// from 0 to number of slats (inclusive)
			// constrained because minTime/maxTime might be customized.
			slatCoverage = Math.max(0, slatCoverage);
			slatCoverage = Math.min(len, slatCoverage);
	
			// an integer index of the furthest whole slat
			// from 0 to number slats (*exclusive*, so len-1)
			slatIndex = Math.floor(slatCoverage);
			slatIndex = Math.min(slatIndex, len - 1);
	
			// how much further through the slatIndex slat (from 0.0-1.0) must be covered in addition.
			// could be 1.0 if slatCoverage is covering *all* the slots
			slatRemainder = slatCoverage - slatIndex;
	
			return this.slatCoordCache.getTopPosition(slatIndex) +
				this.slatCoordCache.getHeight(slatIndex) * slatRemainder;
		},
	
	
	
		/* Event Drag Visualization
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of an event being dragged over the specified date(s).
		// A returned value of `true` signals that a mock "helper" event has been rendered.
		renderDrag: function(eventLocation, seg) {
	
			if (seg) { // if there is event information for this drag, render a helper event
	
				// returns mock event elements
				// signal that a helper has been rendered
				return this.renderEventLocationHelper(eventLocation, seg);
			}
			else {
				// otherwise, just render a highlight
				this.renderHighlight(this.eventToSpan(eventLocation));
			}
		},
	
	
		// Unrenders any visual indication of an event being dragged
		unrenderDrag: function() {
			this.unrenderHelper();
			this.unrenderHighlight();
		},
	
	
		/* Event Resize Visualization
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of an event being resized
		renderEventResize: function(eventLocation, seg) {
			return this.renderEventLocationHelper(eventLocation, seg); // returns mock event elements
		},
	
	
		// Unrenders any visual indication of an event being resized
		unrenderEventResize: function() {
			this.unrenderHelper();
		},
	
	
		/* Event Helper
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a mock "helper" event. `sourceSeg` is the original segment object and might be null (an external drag)
		renderHelper: function(event, sourceSeg) {
			return this.renderHelperSegs(this.eventToSegs(event), sourceSeg); // returns mock event elements
		},
	
	
		// Unrenders any mock helper event
		unrenderHelper: function() {
			this.unrenderHelperSegs();
		},
	
	
		/* Business Hours
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderBusinessHours: function() {
			this.renderBusinessSegs(
				this.buildBusinessHourSegs()
			);
		},
	
	
		unrenderBusinessHours: function() {
			this.unrenderBusinessSegs();
		},
	
	
		/* Now Indicator
		------------------------------------------------------------------------------------------------------------------*/
	
	
		getNowIndicatorUnit: function() {
			return 'minute'; // will refresh on the minute
		},
	
	
		renderNowIndicator: function(date) {
			// seg system might be overkill, but it handles scenario where line needs to be rendered
			//  more than once because of columns with the same date (resources columns for example)
			var segs = this.spanToSegs({ start: date, end: date });
			var top = this.computeDateTop(date, date);
			var nodes = [];
			var i;
	
			// render lines within the columns
			for (i = 0; i < segs.length; i++) {
				nodes.push($('<div class="fc-now-indicator fc-now-indicator-line"></div>')
					.css('top', top)
					.appendTo(this.colContainerEls.eq(segs[i].col))[0]);
			}
	
			// render an arrow over the axis
			if (segs.length > 0) { // is the current time in view?
				nodes.push($('<div class="fc-now-indicator fc-now-indicator-arrow"></div>')
					.css('top', top)
					.appendTo(this.el.find('.fc-content-skeleton'))[0]);
			}
	
			this.nowIndicatorEls = $(nodes);
		},
	
	
		unrenderNowIndicator: function() {
			if (this.nowIndicatorEls) {
				this.nowIndicatorEls.remove();
				this.nowIndicatorEls = null;
			}
		},
	
	
		/* Selection
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
		renderSelection: function(span) {
			if (this.view.opt('selectHelper')) { // this setting signals that a mock helper event should be rendered
	
				// normally acceps an eventLocation, span has a start/end, which is good enough
				this.renderEventLocationHelper(span);
			}
			else {
				this.renderHighlight(span);
			}
		},
	
	
		// Unrenders any visual indication of a selection
		unrenderSelection: function() {
			this.unrenderHelper();
			this.unrenderHighlight();
		},
	
	
		/* Highlight
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderHighlight: function(span) {
			this.renderHighlightSegs(this.spanToSegs(span));
		},
	
	
		unrenderHighlight: function() {
			this.unrenderHighlightSegs();
		}
	
	});
	
	;;
	
	/* Methods for rendering SEGMENTS, pieces of content that live on the view
	 ( this file is no longer just for events )
	----------------------------------------------------------------------------------------------------------------------*/
	
	TimeGrid.mixin({
	
		colContainerEls: null, // containers for each column
	
		// inner-containers for each column where different types of segs live
		fgContainerEls: null,
		bgContainerEls: null,
		helperContainerEls: null,
		highlightContainerEls: null,
		businessContainerEls: null,
	
		// arrays of different types of displayed segments
		fgSegs: null,
		bgSegs: null,
		helperSegs: null,
		highlightSegs: null,
		businessSegs: null,
	
	
		// Renders the DOM that the view's content will live in
		renderContentSkeleton: function() {
			var cellHtml = '';
			var i;
			var skeletonEl;
	
			for (i = 0; i < this.colCnt; i++) {
				cellHtml +=
					'<td>' +
						'<div class="fc-content-col">' +
							'<div class="fc-event-container fc-helper-container"></div>' +
							'<div class="fc-event-container"></div>' +
							'<div class="fc-highlight-container"></div>' +
							'<div class="fc-bgevent-container"></div>' +
							'<div class="fc-business-container"></div>' +
						'</div>' +
					'</td>';
			}
	
			skeletonEl = $(
				'<div class="fc-content-skeleton">' +
					'<table>' +
						'<tr>' + cellHtml + '</tr>' +
					'</table>' +
				'</div>'
			);
	
			this.colContainerEls = skeletonEl.find('.fc-content-col');
			this.helperContainerEls = skeletonEl.find('.fc-helper-container');
			this.fgContainerEls = skeletonEl.find('.fc-event-container:not(.fc-helper-container)');
			this.bgContainerEls = skeletonEl.find('.fc-bgevent-container');
			this.highlightContainerEls = skeletonEl.find('.fc-highlight-container');
			this.businessContainerEls = skeletonEl.find('.fc-business-container');
	
			this.bookendCells(skeletonEl.find('tr')); // TODO: do this on string level
			this.el.append(skeletonEl);
		},
	
	
		/* Foreground Events
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderFgSegs: function(segs) {
			segs = this.renderFgSegsIntoContainers(segs, this.fgContainerEls);
			this.fgSegs = segs;
			return segs; // needed for Grid::renderEvents
		},
	
	
		unrenderFgSegs: function() {
			this.unrenderNamedSegs('fgSegs');
		},
	
	
		/* Foreground Helper Events
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderHelperSegs: function(segs, sourceSeg) {
			var helperEls = [];
			var i, seg;
			var sourceEl;
	
			segs = this.renderFgSegsIntoContainers(segs, this.helperContainerEls);
	
			// Try to make the segment that is in the same row as sourceSeg look the same
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
				if (sourceSeg && sourceSeg.col === seg.col) {
					sourceEl = sourceSeg.el;
					seg.el.css({
						left: sourceEl.css('left'),
						right: sourceEl.css('right'),
						'margin-left': sourceEl.css('margin-left'),
						'margin-right': sourceEl.css('margin-right')
					});
				}
				helperEls.push(seg.el[0]);
			}
	
			this.helperSegs = segs;
	
			return $(helperEls); // must return rendered helpers
		},
	
	
		unrenderHelperSegs: function() {
			this.unrenderNamedSegs('helperSegs');
		},
	
	
		/* Background Events
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderBgSegs: function(segs) {
			segs = this.renderFillSegEls('bgEvent', segs); // TODO: old fill system
			this.updateSegVerticals(segs);
			this.attachSegsByCol(this.groupSegsByCol(segs), this.bgContainerEls);
			this.bgSegs = segs;
			return segs; // needed for Grid::renderEvents
		},
	
	
		unrenderBgSegs: function() {
			this.unrenderNamedSegs('bgSegs');
		},
	
	
		/* Highlight
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderHighlightSegs: function(segs) {
			segs = this.renderFillSegEls('highlight', segs); // TODO: old fill system
			this.updateSegVerticals(segs);
			this.attachSegsByCol(this.groupSegsByCol(segs), this.highlightContainerEls);
			this.highlightSegs = segs;
		},
	
	
		unrenderHighlightSegs: function() {
			this.unrenderNamedSegs('highlightSegs');
		},
	
	
		/* Business Hours
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderBusinessSegs: function(segs) {
			segs = this.renderFillSegEls('businessHours', segs); // TODO: old fill system
			this.updateSegVerticals(segs);
			this.attachSegsByCol(this.groupSegsByCol(segs), this.businessContainerEls);
			this.businessSegs = segs;
		},
	
	
		unrenderBusinessSegs: function() {
			this.unrenderNamedSegs('businessSegs');
		},
	
	
		/* Seg Rendering Utils
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Given a flat array of segments, return an array of sub-arrays, grouped by each segment's col
		groupSegsByCol: function(segs) {
			var segsByCol = [];
			var i;
	
			for (i = 0; i < this.colCnt; i++) {
				segsByCol.push([]);
			}
	
			for (i = 0; i < segs.length; i++) {
				segsByCol[segs[i].col].push(segs[i]);
			}
	
			return segsByCol;
		},
	
	
		// Given segments grouped by column, insert the segments' elements into a parallel array of container
		// elements, each living within a column.
		attachSegsByCol: function(segsByCol, containerEls) {
			var col;
			var segs;
			var i;
	
			for (col = 0; col < this.colCnt; col++) { // iterate each column grouping
				segs = segsByCol[col];
	
				for (i = 0; i < segs.length; i++) {
					containerEls.eq(col).append(segs[i].el);
				}
			}
		},
	
	
		// Given the name of a property of `this` object, assumed to be an array of segments,
		// loops through each segment and removes from DOM. Will null-out the property afterwards.
		unrenderNamedSegs: function(propName) {
			var segs = this[propName];
			var i;
	
			if (segs) {
				for (i = 0; i < segs.length; i++) {
					segs[i].el.remove();
				}
				this[propName] = null;
			}
		},
	
	
	
		/* Foreground Event Rendering Utils
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Given an array of foreground segments, render a DOM element for each, computes position,
		// and attaches to the column inner-container elements.
		renderFgSegsIntoContainers: function(segs, containerEls) {
			var segsByCol;
			var col;
	
			segs = this.renderFgSegEls(segs); // will call fgSegHtml
			segsByCol = this.groupSegsByCol(segs);
	
			for (col = 0; col < this.colCnt; col++) {
				this.updateFgSegCoords(segsByCol[col]);
			}
	
			this.attachSegsByCol(segsByCol, containerEls);
	
			return segs;
		},
	
	
		// Renders the HTML for a single event segment's default rendering
		fgSegHtml: function(seg, disableResizing) {
			var view = this.view;
			var event = seg.event;
			var isDraggable = view.isEventDraggable(event);
			var isResizableFromStart = !disableResizing && seg.isStart && view.isEventResizableFromStart(event);
			var isResizableFromEnd = !disableResizing && seg.isEnd && view.isEventResizableFromEnd(event);
			var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd);
			var skinCss = cssToStr(this.getSegSkinCss(seg));
			var timeText;
			var fullTimeText; // more verbose time text. for the print stylesheet
			var startTimeText; // just the start time text
	
			classes.unshift('fc-time-grid-event', 'fc-v-event');
	
			if (view.isMultiDayEvent(event)) { // if the event appears to span more than one day...
				// Don't display time text on segments that run entirely through a day.
				// That would appear as midnight-midnight and would look dumb.
				// Otherwise, display the time text for the *segment's* times (like 6pm-midnight or midnight-10am)
				if (seg.isStart || seg.isEnd) {
					timeText = this.getEventTimeText(seg);
					fullTimeText = this.getEventTimeText(seg, 'LT');
					startTimeText = this.getEventTimeText(seg, null, false); // displayEnd=false
				}
			} else {
				// Display the normal time text for the *event's* times
				timeText = this.getEventTimeText(event);
				fullTimeText = this.getEventTimeText(event, 'LT');
				startTimeText = this.getEventTimeText(event, null, false); // displayEnd=false
			}
	
			return '<a class="' + classes.join(' ') + '"' +
				(event.url ?
					' href="' + htmlEscape(event.url) + '"' :
					''
					) +
				(skinCss ?
					' style="' + skinCss + '"' :
					''
					) +
				'>' +
					'<div class="fc-content">' +
						(timeText ?
							'<div class="fc-time"' +
							' data-start="' + htmlEscape(startTimeText) + '"' +
							' data-full="' + htmlEscape(fullTimeText) + '"' +
							'>' +
								'<span>' + htmlEscape(timeText) + '</span>' +
							'</div>' :
							''
							) +
						(event.title ?
							'<div class="fc-title">' +
								htmlEscape(event.title) +
							'</div>' :
							''
							) +
					'</div>' +
					'<div class="fc-bg"/>' +
					/* TODO: write CSS for this
					(isResizableFromStart ?
						'<div class="fc-resizer fc-start-resizer" />' :
						''
						) +
					*/
					(isResizableFromEnd ?
						'<div class="fc-resizer fc-end-resizer" />' :
						''
						) +
				'</a>';
		},
	
	
		/* Seg Position Utils
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Refreshes the CSS top/bottom coordinates for each segment element.
		// Works when called after initial render, after a window resize/zoom for example.
		updateSegVerticals: function(segs) {
			this.computeSegVerticals(segs);
			this.assignSegVerticals(segs);
		},
	
	
		// For each segment in an array, computes and assigns its top and bottom properties
		computeSegVerticals: function(segs) {
			var i, seg;
	
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
				seg.top = this.computeDateTop(seg.start, seg.start);
				seg.bottom = this.computeDateTop(seg.end, seg.start);
			}
		},
	
	
		// Given segments that already have their top/bottom properties computed, applies those values to
		// the segments' elements.
		assignSegVerticals: function(segs) {
			var i, seg;
	
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
				seg.el.css(this.generateSegVerticalCss(seg));
			}
		},
	
	
		// Generates an object with CSS properties for the top/bottom coordinates of a segment element
		generateSegVerticalCss: function(seg) {
			return {
				top: seg.top,
				bottom: -seg.bottom // flipped because needs to be space beyond bottom edge of event container
			};
		},
	
	
		/* Foreground Event Positioning Utils
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Given segments that are assumed to all live in the *same column*,
		// compute their verical/horizontal coordinates and assign to their elements.
		updateFgSegCoords: function(segs) {
			this.computeSegVerticals(segs); // horizontals relies on this
			this.computeFgSegHorizontals(segs); // compute horizontal coordinates, z-index's, and reorder the array
			this.assignSegVerticals(segs);
			this.assignFgSegHorizontals(segs);
		},
	
	
		// Given an array of segments that are all in the same column, sets the backwardCoord and forwardCoord on each.
		// NOTE: Also reorders the given array by date!
		computeFgSegHorizontals: function(segs) {
			var levels;
			var level0;
			var i;
	
			this.sortEventSegs(segs); // order by certain criteria
			levels = buildSlotSegLevels(segs);
			computeForwardSlotSegs(levels);
	
			if ((level0 = levels[0])) {
	
				for (i = 0; i < level0.length; i++) {
					computeSlotSegPressures(level0[i]);
				}
	
				for (i = 0; i < level0.length; i++) {
					this.computeFgSegForwardBack(level0[i], 0, 0);
				}
			}
		},
	
	
		// Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
		// from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
		// seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
		//
		// The segment might be part of a "series", which means consecutive segments with the same pressure
		// who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
		// segments behind this one in the current series, and `seriesBackwardCoord` is the starting
		// coordinate of the first segment in the series.
		computeFgSegForwardBack: function(seg, seriesBackwardPressure, seriesBackwardCoord) {
			var forwardSegs = seg.forwardSegs;
			var i;
	
			if (seg.forwardCoord === undefined) { // not already computed
	
				if (!forwardSegs.length) {
	
					// if there are no forward segments, this segment should butt up against the edge
					seg.forwardCoord = 1;
				}
				else {
	
					// sort highest pressure first
					this.sortForwardSegs(forwardSegs);
	
					// this segment's forwardCoord will be calculated from the backwardCoord of the
					// highest-pressure forward segment.
					this.computeFgSegForwardBack(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord);
					seg.forwardCoord = forwardSegs[0].backwardCoord;
				}
	
				// calculate the backwardCoord from the forwardCoord. consider the series
				seg.backwardCoord = seg.forwardCoord -
					(seg.forwardCoord - seriesBackwardCoord) / // available width for series
					(seriesBackwardPressure + 1); // # of segments in the series
	
				// use this segment's coordinates to computed the coordinates of the less-pressurized
				// forward segments
				for (i=0; i<forwardSegs.length; i++) {
					this.computeFgSegForwardBack(forwardSegs[i], 0, seg.forwardCoord);
				}
			}
		},
	
	
		sortForwardSegs: function(forwardSegs) {
			forwardSegs.sort(proxy(this, 'compareForwardSegs'));
		},
	
	
		// A cmp function for determining which forward segment to rely on more when computing coordinates.
		compareForwardSegs: function(seg1, seg2) {
			// put higher-pressure first
			return seg2.forwardPressure - seg1.forwardPressure ||
				// put segments that are closer to initial edge first (and favor ones with no coords yet)
				(seg1.backwardCoord || 0) - (seg2.backwardCoord || 0) ||
				// do normal sorting...
				this.compareEventSegs(seg1, seg2);
		},
	
	
		// Given foreground event segments that have already had their position coordinates computed,
		// assigns position-related CSS values to their elements.
		assignFgSegHorizontals: function(segs) {
			var i, seg;
	
			for (i = 0; i < segs.length; i++) {
				seg = segs[i];
				seg.el.css(this.generateFgSegHorizontalCss(seg));
	
				// if the height is short, add a className for alternate styling
				if (seg.bottom - seg.top < 30) {
					seg.el.addClass('fc-short');
				}
			}
		},
	
	
		// Generates an object with CSS properties/values that should be applied to an event segment element.
		// Contains important positioning-related properties that should be applied to any event element, customized or not.
		generateFgSegHorizontalCss: function(seg) {
			var shouldOverlap = this.view.opt('slotEventOverlap');
			var backwardCoord = seg.backwardCoord; // the left side if LTR. the right side if RTL. floating-point
			var forwardCoord = seg.forwardCoord; // the right side if LTR. the left side if RTL. floating-point
			var props = this.generateSegVerticalCss(seg); // get top/bottom first
			var left; // amount of space from left edge, a fraction of the total width
			var right; // amount of space from right edge, a fraction of the total width
	
			if (shouldOverlap) {
				// double the width, but don't go beyond the maximum forward coordinate (1.0)
				forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2);
			}
	
			if (this.isRTL) {
				left = 1 - forwardCoord;
				right = backwardCoord;
			}
			else {
				left = backwardCoord;
				right = 1 - forwardCoord;
			}
	
			props.zIndex = seg.level + 1; // convert from 0-base to 1-based
			props.left = left * 100 + '%';
			props.right = right * 100 + '%';
	
			if (shouldOverlap && seg.forwardPressure) {
				// add padding to the edge so that forward stacked events don't cover the resizer's icon
				props[this.isRTL ? 'marginLeft' : 'marginRight'] = 10 * 2; // 10 is a guesstimate of the icon's width
			}
	
			return props;
		}
	
	});
	
	
	// Builds an array of segments "levels". The first level will be the leftmost tier of segments if the calendar is
	// left-to-right, or the rightmost if the calendar is right-to-left. Assumes the segments are already ordered by date.
	function buildSlotSegLevels(segs) {
		var levels = [];
		var i, seg;
		var j;
	
		for (i=0; i<segs.length; i++) {
			seg = segs[i];
	
			// go through all the levels and stop on the first level where there are no collisions
			for (j=0; j<levels.length; j++) {
				if (!computeSlotSegCollisions(seg, levels[j]).length) {
					break;
				}
			}
	
			seg.level = j;
	
			(levels[j] || (levels[j] = [])).push(seg);
		}
	
		return levels;
	}
	
	
	// For every segment, figure out the other segments that are in subsequent
	// levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
	function computeForwardSlotSegs(levels) {
		var i, level;
		var j, seg;
		var k;
	
		for (i=0; i<levels.length; i++) {
			level = levels[i];
	
			for (j=0; j<level.length; j++) {
				seg = level[j];
	
				seg.forwardSegs = [];
				for (k=i+1; k<levels.length; k++) {
					computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
				}
			}
		}
	}
	
	
	// Figure out which path forward (via seg.forwardSegs) results in the longest path until
	// the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
	function computeSlotSegPressures(seg) {
		var forwardSegs = seg.forwardSegs;
		var forwardPressure = 0;
		var i, forwardSeg;
	
		if (seg.forwardPressure === undefined) { // not already computed
	
			for (i=0; i<forwardSegs.length; i++) {
				forwardSeg = forwardSegs[i];
	
				// figure out the child's maximum forward path
				computeSlotSegPressures(forwardSeg);
	
				// either use the existing maximum, or use the child's forward pressure
				// plus one (for the forwardSeg itself)
				forwardPressure = Math.max(
					forwardPressure,
					1 + forwardSeg.forwardPressure
				);
			}
	
			seg.forwardPressure = forwardPressure;
		}
	}
	
	
	// Find all the segments in `otherSegs` that vertically collide with `seg`.
	// Append into an optionally-supplied `results` array and return.
	function computeSlotSegCollisions(seg, otherSegs, results) {
		results = results || [];
	
		for (var i=0; i<otherSegs.length; i++) {
			if (isSlotSegCollision(seg, otherSegs[i])) {
				results.push(otherSegs[i]);
			}
		}
	
		return results;
	}
	
	
	// Do these segments occupy the same vertical space?
	function isSlotSegCollision(seg1, seg2) {
		return seg1.bottom > seg2.top && seg1.top < seg2.bottom;
	}
	
	;;
	
	/* An abstract class from which other views inherit from
	----------------------------------------------------------------------------------------------------------------------*/
	
	var View = FC.View = Class.extend(EmitterMixin, ListenerMixin, {
	
		type: null, // subclass' view name (string)
		name: null, // deprecated. use `type` instead
		title: null, // the text that will be displayed in the header's title
	
		calendar: null, // owner Calendar object
		options: null, // hash containing all options. already merged with view-specific-options
		el: null, // the view's containing element. set by Calendar
	
		displaying: null, // a promise representing the state of rendering. null if no render requested
		isSkeletonRendered: false,
		isEventsRendered: false,
	
		// range the view is actually displaying (moments)
		start: null,
		end: null, // exclusive
	
		// range the view is formally responsible for (moments)
		// may be different from start/end. for example, a month view might have 1st-31st, excluding padded dates
		intervalStart: null,
		intervalEnd: null, // exclusive
		intervalDuration: null,
		intervalUnit: null, // name of largest unit being displayed, like "month" or "week"
	
		isRTL: false,
		isSelected: false, // boolean whether a range of time is user-selected or not
		selectedEvent: null,
	
		eventOrderSpecs: null, // criteria for ordering events when they have same date/time
	
		// classNames styled by jqui themes
		widgetHeaderClass: null,
		widgetContentClass: null,
		highlightStateClass: null,
	
		// for date utils, computed from options
		nextDayThreshold: null,
		isHiddenDayHash: null,
	
		// now indicator
		isNowIndicatorRendered: null,
		initialNowDate: null, // result first getNow call
		initialNowQueriedMs: null, // ms time the getNow was called
		nowIndicatorTimeoutID: null, // for refresh timing of now indicator
		nowIndicatorIntervalID: null, // "
	
	
		constructor: function(calendar, type, options, intervalDuration) {
	
			this.calendar = calendar;
			this.type = this.name = type; // .name is deprecated
			this.options = options;
			this.intervalDuration = intervalDuration || moment.duration(1, 'day');
	
			this.nextDayThreshold = moment.duration(this.opt('nextDayThreshold'));
			this.initThemingProps();
			this.initHiddenDays();
			this.isRTL = this.opt('isRTL');
	
			this.eventOrderSpecs = parseFieldSpecs(this.opt('eventOrder'));
	
			this.initialize();
		},
	
	
		// A good place for subclasses to initialize member variables
		initialize: function() {
			// subclasses can implement
		},
	
	
		// Retrieves an option with the given name
		opt: function(name) {
			return this.options[name];
		},
	
	
		// Triggers handlers that are view-related. Modifies args before passing to calendar.
		trigger: function(name, thisObj) { // arguments beyond thisObj are passed along
			var calendar = this.calendar;
	
			return calendar.trigger.apply(
				calendar,
				[name, thisObj || this].concat(
					Array.prototype.slice.call(arguments, 2), // arguments beyond thisObj
					[ this ] // always make the last argument a reference to the view. TODO: deprecate
				)
			);
		},
	
	
		/* Dates
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Updates all internal dates to center around the given current unzoned date.
		setDate: function(date) {
			this.setRange(this.computeRange(date));
		},
	
	
		// Updates all internal dates for displaying the given unzoned range.
		setRange: function(range) {
			$.extend(this, range); // assigns every property to this object's member variables
			this.updateTitle();
		},
	
	
		// Given a single current unzoned date, produce information about what range to display.
		// Subclasses can override. Must return all properties.
		computeRange: function(date) {
			var intervalUnit = computeIntervalUnit(this.intervalDuration);
			var intervalStart = date.clone().startOf(intervalUnit);
			var intervalEnd = intervalStart.clone().add(this.intervalDuration);
			var start, end;
	
			// normalize the range's time-ambiguity
			if (/year|month|week|day/.test(intervalUnit)) { // whole-days?
				intervalStart.stripTime();
				intervalEnd.stripTime();
			}
			else { // needs to have a time?
				if (!intervalStart.hasTime()) {
					intervalStart = this.calendar.time(0); // give 00:00 time
				}
				if (!intervalEnd.hasTime()) {
					intervalEnd = this.calendar.time(0); // give 00:00 time
				}
			}
	
			start = intervalStart.clone();
			start = this.skipHiddenDays(start);
			end = intervalEnd.clone();
			end = this.skipHiddenDays(end, -1, true); // exclusively move backwards
	
			return {
				intervalUnit: intervalUnit,
				intervalStart: intervalStart,
				intervalEnd: intervalEnd,
				start: start,
				end: end
			};
		},
	
	
		// Computes the new date when the user hits the prev button, given the current date
		computePrevDate: function(date) {
			return this.massageCurrentDate(
				date.clone().startOf(this.intervalUnit).subtract(this.intervalDuration), -1
			);
		},
	
	
		// Computes the new date when the user hits the next button, given the current date
		computeNextDate: function(date) {
			return this.massageCurrentDate(
				date.clone().startOf(this.intervalUnit).add(this.intervalDuration)
			);
		},
	
	
		// Given an arbitrarily calculated current date of the calendar, returns a date that is ensured to be completely
		// visible. `direction` is optional and indicates which direction the current date was being
		// incremented or decremented (1 or -1).
		massageCurrentDate: function(date, direction) {
			if (this.intervalDuration.as('days') <= 1) { // if the view displays a single day or smaller
				if (this.isHiddenDay(date)) {
					date = this.skipHiddenDays(date, direction);
					date.startOf('day');
				}
			}
	
			return date;
		},
	
	
		/* Title and Date Formatting
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Sets the view's title property to the most updated computed value
		updateTitle: function() {
			this.title = this.computeTitle();
		},
	
	
		// Computes what the title at the top of the calendar should be for this view
		computeTitle: function() {
			return this.formatRange(
				{
					// in case intervalStart/End has a time, make sure timezone is correct
					start: this.calendar.applyTimezone(this.intervalStart),
					end: this.calendar.applyTimezone(this.intervalEnd)
				},
				this.opt('titleFormat') || this.computeTitleFormat(),
				this.opt('titleRangeSeparator')
			);
		},
	
	
		// Generates the format string that should be used to generate the title for the current date range.
		// Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
		computeTitleFormat: function() {
			if (this.intervalUnit == 'year') {
				return 'YYYY';
			}
			else if (this.intervalUnit == 'month') {
				return this.opt('monthYearFormat'); // like "September 2014"
			}
			else if (this.intervalDuration.as('days') > 1) {
				return 'll'; // multi-day range. shorter, like "Sep 9 - 10 2014"
			}
			else {
				return 'LL'; // one day. longer, like "September 9 2014"
			}
		},
	
	
		// Utility for formatting a range. Accepts a range object, formatting string, and optional separator.
		// Displays all-day ranges naturally, with an inclusive end. Takes the current isRTL into account.
		// The timezones of the dates within `range` will be respected.
		formatRange: function(range, formatStr, separator) {
			var end = range.end;
	
			if (!end.hasTime()) { // all-day?
				end = end.clone().subtract(1); // convert to inclusive. last ms of previous day
			}
	
			return formatRange(range.start, end, formatStr, separator, this.opt('isRTL'));
		},
	
	
		/* Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Sets the container element that the view should render inside of.
		// Does other DOM-related initializations.
		setElement: function(el) {
			this.el = el;
			this.bindGlobalHandlers();
		},
	
	
		// Removes the view's container element from the DOM, clearing any content beforehand.
		// Undoes any other DOM-related attachments.
		removeElement: function() {
			this.clear(); // clears all content
	
			// clean up the skeleton
			if (this.isSkeletonRendered) {
				this.unrenderSkeleton();
				this.isSkeletonRendered = false;
			}
	
			this.unbindGlobalHandlers();
	
			this.el.remove();
	
			// NOTE: don't null-out this.el in case the View was destroyed within an API callback.
			// We don't null-out the View's other jQuery element references upon destroy,
			//  so we shouldn't kill this.el either.
		},
	
	
		// Does everything necessary to display the view centered around the given unzoned date.
		// Does every type of rendering EXCEPT rendering events.
		// Is asychronous and returns a promise.
		display: function(date, explicitScrollState) {
			var _this = this;
			var prevScrollState = null;
	
			if (explicitScrollState != null && this.displaying) { // don't need prevScrollState if explicitScrollState
				prevScrollState = this.queryScroll();
			}
	
			this.calendar.freezeContentHeight();
	
			return syncThen(this.clear(), function() { // clear the content first
				return (
					_this.displaying =
						syncThen(_this.displayView(date), function() { // displayView might return a promise
	
							// caller of display() wants a specific scroll state?
							if (explicitScrollState != null) {
								// we make an assumption that this is NOT the initial render,
								// and thus don't need forceScroll (is inconveniently asynchronous)
								_this.setScroll(explicitScrollState);
							}
							else {
								_this.forceScroll(_this.computeInitialScroll(prevScrollState));
							}
	
							_this.calendar.unfreezeContentHeight();
							_this.triggerRender();
						})
				);
			});
		},
	
	
		// Does everything necessary to clear the content of the view.
		// Clears dates and events. Does not clear the skeleton.
		// Is asychronous and returns a promise.
		clear: function() {
			var _this = this;
			var displaying = this.displaying;
	
			if (displaying) { // previously displayed, or in the process of being displayed?
				return syncThen(displaying, function() { // wait for the display to finish
					_this.displaying = null;
					_this.clearEvents();
					return _this.clearView(); // might return a promise. chain it
				});
			}
			else {
				return $.when(); // an immediately-resolved promise
			}
		},
	
	
		// Displays the view's non-event content, such as date-related content or anything required by events.
		// Renders the view's non-content skeleton if necessary.
		// Can be asynchronous and return a promise.
		displayView: function(date) {
			if (!this.isSkeletonRendered) {
				this.renderSkeleton();
				this.isSkeletonRendered = true;
			}
			if (date) {
				this.setDate(date);
			}
			if (this.render) {
				this.render(); // TODO: deprecate
			}
			this.renderDates();
			this.updateSize();
			this.renderBusinessHours(); // might need coordinates, so should go after updateSize()
			this.startNowIndicator();
		},
	
	
		// Unrenders the view content that was rendered in displayView.
		// Can be asynchronous and return a promise.
		clearView: function() {
			this.unselect();
			this.stopNowIndicator();
			this.triggerUnrender();
			this.unrenderBusinessHours();
			this.unrenderDates();
			if (this.destroy) {
				this.destroy(); // TODO: deprecate
			}
		},
	
	
		// Renders the basic structure of the view before any content is rendered
		renderSkeleton: function() {
			// subclasses should implement
		},
	
	
		// Unrenders the basic structure of the view
		unrenderSkeleton: function() {
			// subclasses should implement
		},
	
	
		// Renders the view's date-related content.
		// Assumes setRange has already been called and the skeleton has already been rendered.
		renderDates: function() {
			// subclasses should implement
		},
	
	
		// Unrenders the view's date-related content
		unrenderDates: function() {
			// subclasses should override
		},
	
	
		// Signals that the view's content has been rendered
		triggerRender: function() {
			this.trigger('viewRender', this, this, this.el);
		},
	
	
		// Signals that the view's content is about to be unrendered
		triggerUnrender: function() {
			this.trigger('viewDestroy', this, this, this.el);
		},
	
	
		// Binds DOM handlers to elements that reside outside the view container, such as the document
		bindGlobalHandlers: function() {
			this.listenTo($(document), 'mousedown', this.handleDocumentMousedown);
			this.listenTo($(document), 'touchstart', this.processUnselect);
		},
	
	
		// Unbinds DOM handlers from elements that reside outside the view container
		unbindGlobalHandlers: function() {
			this.stopListeningTo($(document));
		},
	
	
		// Initializes internal variables related to theming
		initThemingProps: function() {
			var tm = this.opt('theme') ? 'ui' : 'fc';
	
			this.widgetHeaderClass = tm + '-widget-header';
			this.widgetContentClass = tm + '-widget-content';
			this.highlightStateClass = tm + '-state-highlight';
		},
	
	
		/* Business Hours
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders business-hours onto the view. Assumes updateSize has already been called.
		renderBusinessHours: function() {
			// subclasses should implement
		},
	
	
		// Unrenders previously-rendered business-hours
		unrenderBusinessHours: function() {
			// subclasses should implement
		},
	
	
		/* Now Indicator
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Immediately render the current time indicator and begins re-rendering it at an interval,
		// which is defined by this.getNowIndicatorUnit().
		// TODO: somehow do this for the current whole day's background too
		startNowIndicator: function() {
			var _this = this;
			var unit;
			var update;
			var delay; // ms wait value
	
			if (this.opt('nowIndicator')) {
				unit = this.getNowIndicatorUnit();
				if (unit) {
					update = proxy(this, 'updateNowIndicator'); // bind to `this`
	
					this.initialNowDate = this.calendar.getNow();
					this.initialNowQueriedMs = +new Date();
					this.renderNowIndicator(this.initialNowDate);
					this.isNowIndicatorRendered = true;
	
					// wait until the beginning of the next interval
					delay = this.initialNowDate.clone().startOf(unit).add(1, unit) - this.initialNowDate;
					this.nowIndicatorTimeoutID = setTimeout(function() {
						_this.nowIndicatorTimeoutID = null;
						update();
						delay = +moment.duration(1, unit);
						delay = Math.max(100, delay); // prevent too frequent
						_this.nowIndicatorIntervalID = setInterval(update, delay); // update every interval
					}, delay);
				}
			}
		},
	
	
		// rerenders the now indicator, computing the new current time from the amount of time that has passed
		// since the initial getNow call.
		updateNowIndicator: function() {
			if (this.isNowIndicatorRendered) {
				this.unrenderNowIndicator();
				this.renderNowIndicator(
					this.initialNowDate.clone().add(new Date() - this.initialNowQueriedMs) // add ms
				);
			}
		},
	
	
		// Immediately unrenders the view's current time indicator and stops any re-rendering timers.
		// Won't cause side effects if indicator isn't rendered.
		stopNowIndicator: function() {
			if (this.isNowIndicatorRendered) {
	
				if (this.nowIndicatorTimeoutID) {
					clearTimeout(this.nowIndicatorTimeoutID);
					this.nowIndicatorTimeoutID = null;
				}
				if (this.nowIndicatorIntervalID) {
					clearTimeout(this.nowIndicatorIntervalID);
					this.nowIndicatorIntervalID = null;
				}
	
				this.unrenderNowIndicator();
				this.isNowIndicatorRendered = false;
			}
		},
	
	
		// Returns a string unit, like 'second' or 'minute' that defined how often the current time indicator
		// should be refreshed. If something falsy is returned, no time indicator is rendered at all.
		getNowIndicatorUnit: function() {
			// subclasses should implement
		},
	
	
		// Renders a current time indicator at the given datetime
		renderNowIndicator: function(date) {
			// subclasses should implement
		},
	
	
		// Undoes the rendering actions from renderNowIndicator
		unrenderNowIndicator: function() {
			// subclasses should implement
		},
	
	
		/* Dimensions
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Refreshes anything dependant upon sizing of the container element of the grid
		updateSize: function(isResize) {
			var scrollState;
	
			if (isResize) {
				scrollState = this.queryScroll();
			}
	
			this.updateHeight(isResize);
			this.updateWidth(isResize);
			this.updateNowIndicator();
	
			if (isResize) {
				this.setScroll(scrollState);
			}
		},
	
	
		// Refreshes the horizontal dimensions of the calendar
		updateWidth: function(isResize) {
			// subclasses should implement
		},
	
	
		// Refreshes the vertical dimensions of the calendar
		updateHeight: function(isResize) {
			var calendar = this.calendar; // we poll the calendar for height information
	
			this.setHeight(
				calendar.getSuggestedViewHeight(),
				calendar.isHeightAuto()
			);
		},
	
	
		// Updates the vertical dimensions of the calendar to the specified height.
		// if `isAuto` is set to true, height becomes merely a suggestion and the view should use its "natural" height.
		setHeight: function(height, isAuto) {
			// subclasses should implement
		},
	
	
		/* Scroller
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Computes the initial pre-configured scroll state prior to allowing the user to change it.
		// Given the scroll state from the previous rendering. If first time rendering, given null.
		computeInitialScroll: function(previousScrollState) {
			return 0;
		},
	
	
		// Retrieves the view's current natural scroll state. Can return an arbitrary format.
		queryScroll: function() {
			// subclasses must implement
		},
	
	
		// Sets the view's scroll state. Will accept the same format computeInitialScroll and queryScroll produce.
		setScroll: function(scrollState) {
			// subclasses must implement
		},
	
	
		// Sets the scroll state, making sure to overcome any predefined scroll value the browser has in mind
		forceScroll: function(scrollState) {
			var _this = this;
	
			this.setScroll(scrollState);
			setTimeout(function() {
				_this.setScroll(scrollState);
			}, 0);
		},
	
	
		/* Event Elements / Segments
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Does everything necessary to display the given events onto the current view
		displayEvents: function(events) {
			var scrollState = this.queryScroll();
	
			this.clearEvents();
			this.renderEvents(events);
			this.isEventsRendered = true;
			this.setScroll(scrollState);
			this.triggerEventRender();
		},
	
	
		// Does everything necessary to clear the view's currently-rendered events
		clearEvents: function() {
			var scrollState;
	
			if (this.isEventsRendered) {
	
				// TODO: optimize: if we know this is part of a displayEvents call, don't queryScroll/setScroll
				scrollState = this.queryScroll();
	
				this.triggerEventUnrender();
				if (this.destroyEvents) {
					this.destroyEvents(); // TODO: deprecate
				}
				this.unrenderEvents();
				this.setScroll(scrollState);
				this.isEventsRendered = false;
			}
		},
	
	
		// Renders the events onto the view.
		renderEvents: function(events) {
			// subclasses should implement
		},
	
	
		// Removes event elements from the view.
		unrenderEvents: function() {
			// subclasses should implement
		},
	
	
		// Signals that all events have been rendered
		triggerEventRender: function() {
			this.renderedEventSegEach(function(seg) {
				this.trigger('eventAfterRender', seg.event, seg.event, seg.el);
			});
			this.trigger('eventAfterAllRender');
		},
	
	
		// Signals that all event elements are about to be removed
		triggerEventUnrender: function() {
			this.renderedEventSegEach(function(seg) {
				this.trigger('eventDestroy', seg.event, seg.event, seg.el);
			});
		},
	
	
		// Given an event and the default element used for rendering, returns the element that should actually be used.
		// Basically runs events and elements through the eventRender hook.
		resolveEventEl: function(event, el) {
			var custom = this.trigger('eventRender', event, event, el);
	
			if (custom === false) { // means don't render at all
				el = null;
			}
			else if (custom && custom !== true) {
				el = $(custom);
			}
	
			return el;
		},
	
	
		// Hides all rendered event segments linked to the given event
		showEvent: function(event) {
			this.renderedEventSegEach(function(seg) {
				seg.el.css('visibility', '');
			}, event);
		},
	
	
		// Shows all rendered event segments linked to the given event
		hideEvent: function(event) {
			this.renderedEventSegEach(function(seg) {
				seg.el.css('visibility', 'hidden');
			}, event);
		},
	
	
		// Iterates through event segments that have been rendered (have an el). Goes through all by default.
		// If the optional `event` argument is specified, only iterates through segments linked to that event.
		// The `this` value of the callback function will be the view.
		renderedEventSegEach: function(func, event) {
			var segs = this.getEventSegs();
			var i;
	
			for (i = 0; i < segs.length; i++) {
				if (!event || segs[i].event._id === event._id) {
					if (segs[i].el) {
						func.call(this, segs[i]);
					}
				}
			}
		},
	
	
		// Retrieves all the rendered segment objects for the view
		getEventSegs: function() {
			// subclasses must implement
			return [];
		},
	
	
		/* Event Drag-n-Drop
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Computes if the given event is allowed to be dragged by the user
		isEventDraggable: function(event) {
			var source = event.source || {};
	
			return firstDefined(
				event.startEditable,
				source.startEditable,
				this.opt('eventStartEditable'),
				event.editable,
				source.editable,
				this.opt('editable')
			);
		},
	
	
		// Must be called when an event in the view is dropped onto new location.
		// `dropLocation` is an object that contains the new zoned start/end/allDay values for the event.
		reportEventDrop: function(event, dropLocation, largeUnit, el, ev) {
			var calendar = this.calendar;
			var mutateResult = calendar.mutateEvent(event, dropLocation, largeUnit);
			var undoFunc = function() {
				mutateResult.undo();
				calendar.reportEventChange();
			};
	
			this.triggerEventDrop(event, mutateResult.dateDelta, undoFunc, el, ev);
			calendar.reportEventChange(); // will rerender events
		},
	
	
		// Triggers event-drop handlers that have subscribed via the API
		triggerEventDrop: function(event, dateDelta, undoFunc, el, ev) {
			this.trigger('eventDrop', el[0], event, dateDelta, undoFunc, ev, {}); // {} = jqui dummy
		},
	
	
		/* External Element Drag-n-Drop
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Must be called when an external element, via jQuery UI, has been dropped onto the calendar.
		// `meta` is the parsed data that has been embedded into the dragging event.
		// `dropLocation` is an object that contains the new zoned start/end/allDay values for the event.
		reportExternalDrop: function(meta, dropLocation, el, ev, ui) {
			var eventProps = meta.eventProps;
			var eventInput;
			var event;
	
			// Try to build an event object and render it. TODO: decouple the two
			if (eventProps) {
				eventInput = $.extend({}, eventProps, dropLocation);
				event = this.calendar.renderEvent(eventInput, meta.stick)[0]; // renderEvent returns an array
			}
	
			this.triggerExternalDrop(event, dropLocation, el, ev, ui);
		},
	
	
		// Triggers external-drop handlers that have subscribed via the API
		triggerExternalDrop: function(event, dropLocation, el, ev, ui) {
	
			// trigger 'drop' regardless of whether element represents an event
			this.trigger('drop', el[0], dropLocation.start, ev, ui);
	
			if (event) {
				this.trigger('eventReceive', null, event); // signal an external event landed
			}
		},
	
	
		/* Drag-n-Drop Rendering (for both events and external elements)
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of a event or external-element drag over the given drop zone.
		// If an external-element, seg will be `null`.
		// Must return elements used for any mock events.
		renderDrag: function(dropLocation, seg) {
			// subclasses must implement
		},
	
	
		// Unrenders a visual indication of an event or external-element being dragged.
		unrenderDrag: function() {
			// subclasses must implement
		},
	
	
		/* Event Resizing
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Computes if the given event is allowed to be resized from its starting edge
		isEventResizableFromStart: function(event) {
			return this.opt('eventResizableFromStart') && this.isEventResizable(event);
		},
	
	
		// Computes if the given event is allowed to be resized from its ending edge
		isEventResizableFromEnd: function(event) {
			return this.isEventResizable(event);
		},
	
	
		// Computes if the given event is allowed to be resized by the user at all
		isEventResizable: function(event) {
			var source = event.source || {};
	
			return firstDefined(
				event.durationEditable,
				source.durationEditable,
				this.opt('eventDurationEditable'),
				event.editable,
				source.editable,
				this.opt('editable')
			);
		},
	
	
		// Must be called when an event in the view has been resized to a new length
		reportEventResize: function(event, resizeLocation, largeUnit, el, ev) {
			var calendar = this.calendar;
			var mutateResult = calendar.mutateEvent(event, resizeLocation, largeUnit);
			var undoFunc = function() {
				mutateResult.undo();
				calendar.reportEventChange();
			};
	
			this.triggerEventResize(event, mutateResult.durationDelta, undoFunc, el, ev);
			calendar.reportEventChange(); // will rerender events
		},
	
	
		// Triggers event-resize handlers that have subscribed via the API
		triggerEventResize: function(event, durationDelta, undoFunc, el, ev) {
			this.trigger('eventResize', el[0], event, durationDelta, undoFunc, ev, {}); // {} = jqui dummy
		},
	
	
		/* Selection (time range)
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Selects a date span on the view. `start` and `end` are both Moments.
		// `ev` is the native mouse event that begin the interaction.
		select: function(span, ev) {
			this.unselect(ev);
			this.renderSelection(span);
			this.reportSelection(span, ev);
		},
	
	
		// Renders a visual indication of the selection
		renderSelection: function(span) {
			// subclasses should implement
		},
	
	
		// Called when a new selection is made. Updates internal state and triggers handlers.
		reportSelection: function(span, ev) {
			this.isSelected = true;
			this.triggerSelect(span, ev);
		},
	
	
		// Triggers handlers to 'select'
		triggerSelect: function(span, ev) {
			this.trigger(
				'select',
				null,
				this.calendar.applyTimezone(span.start), // convert to calendar's tz for external API
				this.calendar.applyTimezone(span.end), // "
				ev
			);
		},
	
	
		// Undoes a selection. updates in the internal state and triggers handlers.
		// `ev` is the native mouse event that began the interaction.
		unselect: function(ev) {
			if (this.isSelected) {
				this.isSelected = false;
				if (this.destroySelection) {
					this.destroySelection(); // TODO: deprecate
				}
				this.unrenderSelection();
				this.trigger('unselect', null, ev);
			}
		},
	
	
		// Unrenders a visual indication of selection
		unrenderSelection: function() {
			// subclasses should implement
		},
	
	
		/* Event Selection
		------------------------------------------------------------------------------------------------------------------*/
	
	
		selectEvent: function(event) {
			if (!this.selectedEvent || this.selectedEvent !== event) {
				this.unselectEvent();
				this.renderedEventSegEach(function(seg) {
					seg.el.addClass('fc-selected');
				}, event);
				this.selectedEvent = event;
			}
		},
	
	
		unselectEvent: function() {
			if (this.selectedEvent) {
				this.renderedEventSegEach(function(seg) {
					seg.el.removeClass('fc-selected');
				}, this.selectedEvent);
				this.selectedEvent = null;
			}
		},
	
	
		isEventSelected: function(event) {
			// event references might change on refetchEvents(), while selectedEvent doesn't,
			// so compare IDs
			return this.selectedEvent && this.selectedEvent._id === event._id;
		},
	
	
		/* Mouse / Touch Unselecting (time range & event unselection)
		------------------------------------------------------------------------------------------------------------------*/
		// TODO: move consistently to down/start or up/end?
		// TODO: don't kill previous selection if touch scrolling
	
	
		handleDocumentMousedown: function(ev) {
			if (isPrimaryMouseButton(ev)) {
				this.processUnselect(ev);
			}
		},
	
	
		processUnselect: function(ev) {
			this.processRangeUnselect(ev);
			this.processEventUnselect(ev);
		},
	
	
		processRangeUnselect: function(ev) {
			var ignore;
	
			// is there a time-range selection?
			if (this.isSelected && this.opt('unselectAuto')) {
				// only unselect if the clicked element is not identical to or inside of an 'unselectCancel' element
				ignore = this.opt('unselectCancel');
				if (!ignore || !$(ev.target).closest(ignore).length) {
					this.unselect(ev);
				}
			}
		},
	
	
		processEventUnselect: function(ev) {
			if (this.selectedEvent) {
				if (!$(ev.target).closest('.fc-selected').length) {
					this.unselectEvent();
				}
			}
		},
	
	
		/* Day Click
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Triggers handlers to 'dayClick'
		// Span has start/end of the clicked area. Only the start is useful.
		triggerDayClick: function(span, dayEl, ev) {
			this.trigger(
				'dayClick',
				dayEl,
				this.calendar.applyTimezone(span.start), // convert to calendar's timezone for external API
				ev
			);
		},
	
	
		/* Date Utils
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Initializes internal variables related to calculating hidden days-of-week
		initHiddenDays: function() {
			var hiddenDays = this.opt('hiddenDays') || []; // array of day-of-week indices that are hidden
			var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
			var dayCnt = 0;
			var i;
	
			if (this.opt('weekends') === false) {
				hiddenDays.push(0, 6); // 0=sunday, 6=saturday
			}
	
			for (i = 0; i < 7; i++) {
				if (
					!(isHiddenDayHash[i] = $.inArray(i, hiddenDays) !== -1)
				) {
					dayCnt++;
				}
			}
	
			if (!dayCnt) {
				throw 'invalid hiddenDays'; // all days were hidden? bad.
			}
	
			this.isHiddenDayHash = isHiddenDayHash;
		},
	
	
		// Is the current day hidden?
		// `day` is a day-of-week index (0-6), or a Moment
		isHiddenDay: function(day) {
			if (moment.isMoment(day)) {
				day = day.day();
			}
			return this.isHiddenDayHash[day];
		},
	
	
		// Incrementing the current day until it is no longer a hidden day, returning a copy.
		// If the initial value of `date` is not a hidden day, don't do anything.
		// Pass `isExclusive` as `true` if you are dealing with an end date.
		// `inc` defaults to `1` (increment one day forward each time)
		skipHiddenDays: function(date, inc, isExclusive) {
			var out = date.clone();
			inc = inc || 1;
			while (
				this.isHiddenDayHash[(out.day() + (isExclusive ? inc : 0) + 7) % 7]
			) {
				out.add(inc, 'days');
			}
			return out;
		},
	
	
		// Returns the date range of the full days the given range visually appears to occupy.
		// Returns a new range object.
		computeDayRange: function(range) {
			var startDay = range.start.clone().stripTime(); // the beginning of the day the range starts
			var end = range.end;
			var endDay = null;
			var endTimeMS;
	
			if (end) {
				endDay = end.clone().stripTime(); // the beginning of the day the range exclusively ends
				endTimeMS = +end.time(); // # of milliseconds into `endDay`
	
				// If the end time is actually inclusively part of the next day and is equal to or
				// beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
				// Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
				if (endTimeMS && endTimeMS >= this.nextDayThreshold) {
					endDay.add(1, 'days');
				}
			}
	
			// If no end was specified, or if it is within `startDay` but not past nextDayThreshold,
			// assign the default duration of one day.
			if (!end || endDay <= startDay) {
				endDay = startDay.clone().add(1, 'days');
			}
	
			return { start: startDay, end: endDay };
		},
	
	
		// Does the given event visually appear to occupy more than one day?
		isMultiDayEvent: function(event) {
			var range = this.computeDayRange(event); // event is range-ish
	
			return range.end.diff(range.start, 'days') > 1;
		}
	
	});
	
	;;
	
	/*
	Embodies a div that has potential scrollbars
	*/
	var Scroller = FC.Scroller = Class.extend({
	
		el: null, // the guaranteed outer element
		scrollEl: null, // the element with the scrollbars
		overflowX: null,
		overflowY: null,
	
	
		constructor: function(options) {
			options = options || {};
			this.overflowX = options.overflowX || options.overflow || 'auto';
			this.overflowY = options.overflowY || options.overflow || 'auto';
		},
	
	
		render: function() {
			this.el = this.renderEl();
			this.applyOverflow();
		},
	
	
		renderEl: function() {
			return (this.scrollEl = $('<div class="fc-scroller"></div>'));
		},
	
	
		// sets to natural height, unlocks overflow
		clear: function() {
			this.setHeight('auto');
			this.applyOverflow();
		},
	
	
		destroy: function() {
			this.el.remove();
		},
	
	
		// Overflow
		// -----------------------------------------------------------------------------------------------------------------
	
	
		applyOverflow: function() {
			this.scrollEl.css({
				'overflow-x': this.overflowX,
				'overflow-y': this.overflowY
			});
		},
	
	
		// Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
		// Useful for preserving scrollbar widths regardless of future resizes.
		// Can pass in scrollbarWidths for optimization.
		lockOverflow: function(scrollbarWidths) {
			var overflowX = this.overflowX;
			var overflowY = this.overflowY;
	
			scrollbarWidths = scrollbarWidths || this.getScrollbarWidths();
	
			if (overflowX === 'auto') {
				overflowX = (
						scrollbarWidths.top || scrollbarWidths.bottom || // horizontal scrollbars?
						// OR scrolling pane with massless scrollbars?
						this.scrollEl[0].scrollWidth - 1 > this.scrollEl[0].clientWidth
							// subtract 1 because of IE off-by-one issue
					) ? 'scroll' : 'hidden';
			}
	
			if (overflowY === 'auto') {
				overflowY = (
						scrollbarWidths.left || scrollbarWidths.right || // vertical scrollbars?
						// OR scrolling pane with massless scrollbars?
						this.scrollEl[0].scrollHeight - 1 > this.scrollEl[0].clientHeight
							// subtract 1 because of IE off-by-one issue
					) ? 'scroll' : 'hidden';
			}
	
			this.scrollEl.css({ 'overflow-x': overflowX, 'overflow-y': overflowY });
		},
	
	
		// Getters / Setters
		// -----------------------------------------------------------------------------------------------------------------
	
	
		setHeight: function(height) {
			this.scrollEl.height(height);
		},
	
	
		getScrollTop: function() {
			return this.scrollEl.scrollTop();
		},
	
	
		setScrollTop: function(top) {
			this.scrollEl.scrollTop(top);
		},
	
	
		getClientWidth: function() {
			return this.scrollEl[0].clientWidth;
		},
	
	
		getClientHeight: function() {
			return this.scrollEl[0].clientHeight;
		},
	
	
		getScrollbarWidths: function() {
			return getScrollbarWidths(this.scrollEl);
		}
	
	});
	
	;;
	
	var Calendar = FC.Calendar = Class.extend({
	
		dirDefaults: null, // option defaults related to LTR or RTL
		langDefaults: null, // option defaults related to current locale
		overrides: null, // option overrides given to the fullCalendar constructor
		dynamicOverrides: null, // options set with dynamic setter method. higher precedence than view overrides.
		options: null, // all defaults combined with overrides
		viewSpecCache: null, // cache of view definitions
		view: null, // current View object
		header: null,
		loadingLevel: 0, // number of simultaneous loading tasks
	
	
		// a lot of this class' OOP logic is scoped within this constructor function,
		// but in the future, write individual methods on the prototype.
		constructor: Calendar_constructor,
	
	
		// Subclasses can override this for initialization logic after the constructor has been called
		initialize: function() {
		},
	
	
		// Computes the flattened options hash for the calendar and assigns to `this.options`.
		// Assumes this.overrides and this.dynamicOverrides have already been initialized.
		populateOptionsHash: function() {
			var lang, langDefaults;
			var isRTL, dirDefaults;
	
			lang = firstDefined( // explicit lang option given?
				this.dynamicOverrides.lang,
				this.overrides.lang
			);
			langDefaults = langOptionHash[lang];
			if (!langDefaults) { // explicit lang option not given or invalid?
				lang = Calendar.defaults.lang;
				langDefaults = langOptionHash[lang] || {};
			}
	
			isRTL = firstDefined( // based on options computed so far, is direction RTL?
				this.dynamicOverrides.isRTL,
				this.overrides.isRTL,
				langDefaults.isRTL,
				Calendar.defaults.isRTL
			);
			dirDefaults = isRTL ? Calendar.rtlDefaults : {};
	
			this.dirDefaults = dirDefaults;
			this.langDefaults = langDefaults;
			this.options = mergeOptions([ // merge defaults and overrides. lowest to highest precedence
				Calendar.defaults, // global defaults
				dirDefaults,
				langDefaults,
				this.overrides,
				this.dynamicOverrides
			]);
			populateInstanceComputableOptions(this.options); // fill in gaps with computed options
		},
	
	
		// Gets information about how to create a view. Will use a cache.
		getViewSpec: function(viewType) {
			var cache = this.viewSpecCache;
	
			return cache[viewType] || (cache[viewType] = this.buildViewSpec(viewType));
		},
	
	
		// Given a duration singular unit, like "week" or "day", finds a matching view spec.
		// Preference is given to views that have corresponding buttons.
		getUnitViewSpec: function(unit) {
			var viewTypes;
			var i;
			var spec;
	
			if ($.inArray(unit, intervalUnits) != -1) {
	
				// put views that have buttons first. there will be duplicates, but oh well
				viewTypes = this.header.getViewsWithButtons();
				$.each(FC.views, function(viewType) { // all views
					viewTypes.push(viewType);
				});
	
				for (i = 0; i < viewTypes.length; i++) {
					spec = this.getViewSpec(viewTypes[i]);
					if (spec) {
						if (spec.singleUnit == unit) {
							return spec;
						}
					}
				}
			}
		},
	
	
		// Builds an object with information on how to create a given view
		buildViewSpec: function(requestedViewType) {
			var viewOverrides = this.overrides.views || {};
			var specChain = []; // for the view. lowest to highest priority
			var defaultsChain = []; // for the view. lowest to highest priority
			var overridesChain = []; // for the view. lowest to highest priority
			var viewType = requestedViewType;
			var spec; // for the view
			var overrides; // for the view
			var duration;
			var unit;
	
			// iterate from the specific view definition to a more general one until we hit an actual View class
			while (viewType) {
				spec = fcViews[viewType];
				overrides = viewOverrides[viewType];
				viewType = null; // clear. might repopulate for another iteration
	
				if (typeof spec === 'function') { // TODO: deprecate
					spec = { 'class': spec };
				}
	
				if (spec) {
					specChain.unshift(spec);
					defaultsChain.unshift(spec.defaults || {});
					duration = duration || spec.duration;
					viewType = viewType || spec.type;
				}
	
				if (overrides) {
					overridesChain.unshift(overrides); // view-specific option hashes have options at zero-level
					duration = duration || overrides.duration;
					viewType = viewType || overrides.type;
				}
			}
	
			spec = mergeProps(specChain);
			spec.type = requestedViewType;
			if (!spec['class']) {
				return false;
			}
	
			if (duration) {
				duration = moment.duration(duration);
				if (duration.valueOf()) { // valid?
					spec.duration = duration;
					unit = computeIntervalUnit(duration);
	
					// view is a single-unit duration, like "week" or "day"
					// incorporate options for this. lowest priority
					if (duration.as(unit) === 1) {
						spec.singleUnit = unit;
						overridesChain.unshift(viewOverrides[unit] || {});
					}
				}
			}
	
			spec.defaults = mergeOptions(defaultsChain);
			spec.overrides = mergeOptions(overridesChain);
	
			this.buildViewSpecOptions(spec);
			this.buildViewSpecButtonText(spec, requestedViewType);
	
			return spec;
		},
	
	
		// Builds and assigns a view spec's options object from its already-assigned defaults and overrides
		buildViewSpecOptions: function(spec) {
			spec.options = mergeOptions([ // lowest to highest priority
				Calendar.defaults, // global defaults
				spec.defaults, // view's defaults (from ViewSubclass.defaults)
				this.dirDefaults,
				this.langDefaults, // locale and dir take precedence over view's defaults!
				this.overrides, // calendar's overrides (options given to constructor)
				spec.overrides, // view's overrides (view-specific options)
				this.dynamicOverrides // dynamically set via setter. highest precedence
			]);
			populateInstanceComputableOptions(spec.options);
		},
	
	
		// Computes and assigns a view spec's buttonText-related options
		buildViewSpecButtonText: function(spec, requestedViewType) {
	
			// given an options object with a possible `buttonText` hash, lookup the buttonText for the
			// requested view, falling back to a generic unit entry like "week" or "day"
			function queryButtonText(options) {
				var buttonText = options.buttonText || {};
				return buttonText[requestedViewType] ||
					(spec.singleUnit ? buttonText[spec.singleUnit] : null);
			}
	
			// highest to lowest priority
			spec.buttonTextOverride =
				queryButtonText(this.dynamicOverrides) ||
				queryButtonText(this.overrides) || // constructor-specified buttonText lookup hash takes precedence
				spec.overrides.buttonText; // `buttonText` for view-specific options is a string
	
			// highest to lowest priority. mirrors buildViewSpecOptions
			spec.buttonTextDefault =
				queryButtonText(this.langDefaults) ||
				queryButtonText(this.dirDefaults) ||
				spec.defaults.buttonText || // a single string. from ViewSubclass.defaults
				queryButtonText(Calendar.defaults) ||
				(spec.duration ? this.humanizeDuration(spec.duration) : null) || // like "3 days"
				requestedViewType; // fall back to given view name
		},
	
	
		// Given a view name for a custom view or a standard view, creates a ready-to-go View object
		instantiateView: function(viewType) {
			var spec = this.getViewSpec(viewType);
	
			return new spec['class'](this, viewType, spec.options, spec.duration);
		},
	
	
		// Returns a boolean about whether the view is okay to instantiate at some point
		isValidViewType: function(viewType) {
			return Boolean(this.getViewSpec(viewType));
		},
	
	
		// Should be called when any type of async data fetching begins
		pushLoading: function() {
			if (!(this.loadingLevel++)) {
				this.trigger('loading', null, true, this.view);
			}
		},
	
	
		// Should be called when any type of async data fetching completes
		popLoading: function() {
			if (!(--this.loadingLevel)) {
				this.trigger('loading', null, false, this.view);
			}
		},
	
	
		// Given arguments to the select method in the API, returns a span (unzoned start/end and other info)
		buildSelectSpan: function(zonedStartInput, zonedEndInput) {
			var start = this.moment(zonedStartInput).stripZone();
			var end;
	
			if (zonedEndInput) {
				end = this.moment(zonedEndInput).stripZone();
			}
			else if (start.hasTime()) {
				end = start.clone().add(this.defaultTimedEventDuration);
			}
			else {
				end = start.clone().add(this.defaultAllDayEventDuration);
			}
	
			return { start: start, end: end };
		}
	
	});
	
	
	Calendar.mixin(EmitterMixin);
	
	
	function Calendar_constructor(element, overrides) {
		var t = this;
	
	
		// Exports
		// -----------------------------------------------------------------------------------
	
		t.render = render;
		t.destroy = destroy;
		t.refetchEvents = refetchEvents;
		t.refetchEventSources = refetchEventSources;
		t.reportEvents = reportEvents;
		t.reportEventChange = reportEventChange;
		t.rerenderEvents = renderEvents; // `renderEvents` serves as a rerender. an API method
		t.changeView = renderView; // `renderView` will switch to another view
		t.select = select;
		t.unselect = unselect;
		t.prev = prev;
		t.next = next;
		t.prevYear = prevYear;
		t.nextYear = nextYear;
		t.today = today;
		t.gotoDate = gotoDate;
		t.incrementDate = incrementDate;
		t.zoomTo = zoomTo;
		t.getDate = getDate;
		t.getCalendar = getCalendar;
		t.getView = getView;
		t.option = option; // getter/setter method
		t.trigger = trigger;
	
	
		// Options
		// -----------------------------------------------------------------------------------
	
		t.dynamicOverrides = {};
		t.viewSpecCache = {};
		t.optionHandlers = {}; // for Calendar.options.js
	
		// convert legacy options into non-legacy ones.
		// in the future, when this is removed, don't use `overrides` reference. make a copy.
		t.overrides = massageOverrides(overrides || {});
	
		t.populateOptionsHash(); // sets this.options
	
	
	
		// Language-data Internals
		// -----------------------------------------------------------------------------------
		// Apply overrides to the current language's data
	
		var localeData;
	
		// Called immediately, and when any of the options change.
		// Happens before any internal objects rebuild or rerender, because this is very core.
		t.bindOptions([
			'lang', 'monthNames', 'monthNamesShort', 'dayNames', 'dayNamesShort', 'firstDay', 'weekNumberCalculation'
		], function(lang, monthNames, monthNamesShort, dayNames, dayNamesShort, firstDay, weekNumberCalculation) {
	
			localeData = createObject( // make a cheap copy
				getMomentLocaleData(lang) // will fall back to en
			);
	
			if (monthNames) {
				localeData._months = monthNames;
			}
			if (monthNamesShort) {
				localeData._monthsShort = monthNamesShort;
			}
			if (dayNames) {
				localeData._weekdays = dayNames;
			}
			if (dayNamesShort) {
				localeData._weekdaysShort = dayNamesShort;
			}
			if (firstDay != null) {
				var _week = createObject(localeData._week); // _week: { dow: # }
				_week.dow = firstDay;
				localeData._week = _week;
			}
	
			if (weekNumberCalculation === 'iso') {
				weekNumberCalculation = 'ISO'; // normalize
			}
			if ( // whitelist certain kinds of input
				weekNumberCalculation === 'ISO' ||
				weekNumberCalculation === 'local' ||
				typeof weekNumberCalculation === 'function'
			) {
				localeData._fullCalendar_weekCalc = weekNumberCalculation; // moment-ext will know what to do with it
			}
	
			// If the internal current date object already exists, move to new locale.
			// We do NOT need to do this technique for event dates, because this happens when converting to "segments".
			if (date) {
				localizeMoment(date); // sets to localeData
			}
		});
	
	
	
		// Calendar-specific Date Utilities
		// -----------------------------------------------------------------------------------
	
	
		t.defaultAllDayEventDuration = moment.duration(t.options.defaultAllDayEventDuration);
		t.defaultTimedEventDuration = moment.duration(t.options.defaultTimedEventDuration);
	
	
		// Builds a moment using the settings of the current calendar: timezone and language.
		// Accepts anything the vanilla moment() constructor accepts.
		t.moment = function() {
			var mom;
	
			if (t.options.timezone === 'local') {
				mom = FC.moment.apply(null, arguments);
	
				// Force the moment to be local, because FC.moment doesn't guarantee it.
				if (mom.hasTime()) { // don't give ambiguously-timed moments a local zone
					mom.local();
				}
			}
			else if (t.options.timezone === 'UTC') {
				mom = FC.moment.utc.apply(null, arguments); // process as UTC
			}
			else {
				mom = FC.moment.parseZone.apply(null, arguments); // let the input decide the zone
			}
	
			localizeMoment(mom);
	
			return mom;
		};
	
	
		// Updates the given moment's locale settings to the current calendar locale settings.
		function localizeMoment(mom) {
			if ('_locale' in mom) { // moment 2.8 and above
				mom._locale = localeData;
			}
			else { // pre-moment-2.8
				mom._lang = localeData;
			}
		}
	
	
		// Returns a boolean about whether or not the calendar knows how to calculate
		// the timezone offset of arbitrary dates in the current timezone.
		t.getIsAmbigTimezone = function() {
			return t.options.timezone !== 'local' && t.options.timezone !== 'UTC';
		};
	
	
		// Returns a copy of the given date in the current timezone. Has no effect on dates without times.
		t.applyTimezone = function(date) {
			if (!date.hasTime()) {
				return date.clone();
			}
	
			var zonedDate = t.moment(date.toArray());
			var timeAdjust = date.time() - zonedDate.time();
			var adjustedZonedDate;
	
			// Safari sometimes has problems with this coersion when near DST. Adjust if necessary. (bug #2396)
			if (timeAdjust) { // is the time result different than expected?
				adjustedZonedDate = zonedDate.clone().add(timeAdjust); // add milliseconds
				if (date.time() - adjustedZonedDate.time() === 0) { // does it match perfectly now?
					zonedDate = adjustedZonedDate;
				}
			}
	
			return zonedDate;
		};
	
	
		// Returns a moment for the current date, as defined by the client's computer or from the `now` option.
		// Will return an moment with an ambiguous timezone.
		t.getNow = function() {
			var now = t.options.now;
			if (typeof now === 'function') {
				now = now();
			}
			return t.moment(now).stripZone();
		};
	
	
		// Get an event's normalized end date. If not present, calculate it from the defaults.
		t.getEventEnd = function(event) {
			if (event.end) {
				return event.end.clone();
			}
			else {
				return t.getDefaultEventEnd(event.allDay, event.start);
			}
		};
	
	
		// Given an event's allDay status and start date, return what its fallback end date should be.
		// TODO: rename to computeDefaultEventEnd
		t.getDefaultEventEnd = function(allDay, zonedStart) {
			var end = zonedStart.clone();
	
			if (allDay) {
				end.stripTime().add(t.defaultAllDayEventDuration);
			}
			else {
				end.add(t.defaultTimedEventDuration);
			}
	
			if (t.getIsAmbigTimezone()) {
				end.stripZone(); // we don't know what the tzo should be
			}
	
			return end;
		};
	
	
		// Produces a human-readable string for the given duration.
		// Side-effect: changes the locale of the given duration.
		t.humanizeDuration = function(duration) {
			return (duration.locale || duration.lang).call(duration, t.options.lang) // works moment-pre-2.8
				.humanize();
		};
	
	
		
		// Imports
		// -----------------------------------------------------------------------------------
	
	
		EventManager.call(t);
		var isFetchNeeded = t.isFetchNeeded;
		var fetchEvents = t.fetchEvents;
		var fetchEventSources = t.fetchEventSources;
	
	
	
		// Locals
		// -----------------------------------------------------------------------------------
	
	
		var _element = element[0];
		var header;
		var content;
		var tm; // for making theme classes
		var currentView; // NOTE: keep this in sync with this.view
		var viewsByType = {}; // holds all instantiated view instances, current or not
		var suggestedViewHeight;
		var windowResizeProxy; // wraps the windowResize function
		var ignoreWindowResize = 0;
		var events = [];
		var date; // unzoned
		
		
		
		// Main Rendering
		// -----------------------------------------------------------------------------------
	
	
		// compute the initial ambig-timezone date
		if (t.options.defaultDate != null) {
			date = t.moment(t.options.defaultDate).stripZone();
		}
		else {
			date = t.getNow(); // getNow already returns unzoned
		}
		
		
		function render() {
			if (!content) {
				initialRender();
			}
			else if (elementVisible()) {
				// mainly for the public API
				calcSize();
				renderView();
			}
		}
		
		
		function initialRender() {
			element.addClass('fc');
	
			// called immediately, and upon option change
			t.bindOption('theme', function(theme) {
				tm = theme ? 'ui' : 'fc'; // affects a larger scope
				element.toggleClass('ui-widget', theme);
				element.toggleClass('fc-unthemed', !theme);
			});
	
			// called immediately, and upon option change.
			// HACK: lang often affects isRTL, so we explicitly listen to that too.
			t.bindOptions([ 'isRTL', 'lang' ], function(isRTL) {
				element.toggleClass('fc-ltr', !isRTL);
				element.toggleClass('fc-rtl', isRTL);
			});
	
			content = $("<div class='fc-view-container'/>").prependTo(element);
	
			header = t.header = new Header(t);
			renderHeader();
	
			renderView(t.options.defaultView);
	
			if (t.options.handleWindowResize) {
				windowResizeProxy = debounce(windowResize, t.options.windowResizeDelay); // prevents rapid calls
				$(window).resize(windowResizeProxy);
			}
		}
	
	
		// can be called repeatedly and Header will rerender
		function renderHeader() {
			header.render();
			if (header.el) {
				element.prepend(header.el);
			}
		}
		
		
		function destroy() {
	
			if (currentView) {
				currentView.removeElement();
	
				// NOTE: don't null-out currentView/t.view in case API methods are called after destroy.
				// It is still the "current" view, just not rendered.
			}
	
			header.removeElement();
			content.remove();
			element.removeClass('fc fc-ltr fc-rtl fc-unthemed ui-widget');
	
			if (windowResizeProxy) {
				$(window).unbind('resize', windowResizeProxy);
			}
		}
		
		
		function elementVisible() {
			return element.is(':visible');
		}
		
		
	
		// View Rendering
		// -----------------------------------------------------------------------------------
	
	
		// Renders a view because of a date change, view-type change, or for the first time.
		// If not given a viewType, keep the current view but render different dates.
		// Accepts an optional scroll state to restore to.
		function renderView(viewType, explicitScrollState) {
			ignoreWindowResize++;
	
			// if viewType is changing, remove the old view's rendering
			if (currentView && viewType && currentView.type !== viewType) {
				freezeContentHeight(); // prevent a scroll jump when view element is removed
				clearView();
			}
	
			// if viewType changed, or the view was never created, create a fresh view
			if (!currentView && viewType) {
				currentView = t.view =
					viewsByType[viewType] ||
					(viewsByType[viewType] = t.instantiateView(viewType));
	
				currentView.setElement(
					$("<div class='fc-view fc-" + viewType + "-view' />").appendTo(content)
				);
				header.activateButton(viewType);
			}
	
			if (currentView) {
	
				// in case the view should render a period of time that is completely hidden
				date = currentView.massageCurrentDate(date);
	
				// render or rerender the view
				if (
					!currentView.displaying ||
					!date.isWithin(currentView.intervalStart, currentView.intervalEnd) // implicit date window change
				) {
					if (elementVisible()) {
	
						currentView.display(date, explicitScrollState); // will call freezeContentHeight
						unfreezeContentHeight(); // immediately unfreeze regardless of whether display is async
	
						// need to do this after View::render, so dates are calculated
						updateHeaderTitle();
						updateTodayButton();
	
						getAndRenderEvents();
					}
				}
			}
	
			unfreezeContentHeight(); // undo any lone freezeContentHeight calls
			ignoreWindowResize--;
		}
	
	
		// Unrenders the current view and reflects this change in the Header.
		// Unregsiters the `currentView`, but does not remove from viewByType hash.
		function clearView() {
			header.deactivateButton(currentView.type);
			currentView.removeElement();
			currentView = t.view = null;
		}
	
	
		// Destroys the view, including the view object. Then, re-instantiates it and renders it.
		// Maintains the same scroll state.
		// TODO: maintain any other user-manipulated state.
		function reinitView() {
			ignoreWindowResize++;
			freezeContentHeight();
	
			var viewType = currentView.type;
			var scrollState = currentView.queryScroll();
			clearView();
			renderView(viewType, scrollState);
	
			unfreezeContentHeight();
			ignoreWindowResize--;
		}
	
		
	
		// Resizing
		// -----------------------------------------------------------------------------------
	
	
		t.getSuggestedViewHeight = function() {
			if (suggestedViewHeight === undefined) {
				calcSize();
			}
			return suggestedViewHeight;
		};
	
	
		t.isHeightAuto = function() {
			return t.options.contentHeight === 'auto' || t.options.height === 'auto';
		};
		
		
		function updateSize(shouldRecalc) {
			if (elementVisible()) {
	
				if (shouldRecalc) {
					_calcSize();
				}
	
				ignoreWindowResize++;
				currentView.updateSize(true); // isResize=true. will poll getSuggestedViewHeight() and isHeightAuto()
				ignoreWindowResize--;
	
				return true; // signal success
			}
		}
	
	
		function calcSize() {
			if (elementVisible()) {
				_calcSize();
			}
		}
		
		
		function _calcSize() { // assumes elementVisible
			var contentHeightInput = t.options.contentHeight;
			var heightInput = t.options.height;
	
			if (typeof contentHeightInput === 'number') { // exists and not 'auto'
				suggestedViewHeight = contentHeightInput;
			}
			else if (typeof contentHeightInput === 'function') { // exists and is a function
				suggestedViewHeight = contentHeightInput();
			}
			else if (typeof heightInput === 'number') { // exists and not 'auto'
				suggestedViewHeight = heightInput - queryHeaderHeight();
			}
			else if (typeof heightInput === 'function') { // exists and is a function
				suggestedViewHeight = heightInput() - queryHeaderHeight();
			}
			else if (heightInput === 'parent') { // set to height of parent element
				suggestedViewHeight = element.parent().height() - queryHeaderHeight();
			}
			else {
				suggestedViewHeight = Math.round(content.width() / Math.max(t.options.aspectRatio, .5));
			}
		}
	
	
		function queryHeaderHeight() {
			return header.el ? header.el.outerHeight(true) : 0; // includes margin
		}
		
		
		function windowResize(ev) {
			if (
				!ignoreWindowResize &&
				ev.target === window && // so we don't process jqui "resize" events that have bubbled up
				currentView.start // view has already been rendered
			) {
				if (updateSize(true)) {
					currentView.trigger('windowResize', _element);
				}
			}
		}
		
		
		
		/* Event Fetching/Rendering
		-----------------------------------------------------------------------------*/
		// TODO: going forward, most of this stuff should be directly handled by the view
	
	
		function refetchEvents() { // can be called as an API method
			fetchAndRenderEvents();
		}
	
	
		// TODO: move this into EventManager?
		function refetchEventSources(matchInputs) {
			fetchEventSources(t.getEventSourcesByMatchArray(matchInputs));
		}
	
	
		function renderEvents() { // destroys old events if previously rendered
			if (elementVisible()) {
				freezeContentHeight();
				currentView.displayEvents(events);
				unfreezeContentHeight();
			}
		}
		
	
		function getAndRenderEvents() {
			if (!t.options.lazyFetching || isFetchNeeded(currentView.start, currentView.end)) {
				fetchAndRenderEvents();
			}
			else {
				renderEvents();
			}
		}
	
	
		function fetchAndRenderEvents() {
			fetchEvents(currentView.start, currentView.end);
				// ... will call reportEvents
				// ... which will call renderEvents
		}
	
		
		// called when event data arrives
		function reportEvents(_events) {
			events = _events;
			renderEvents();
		}
	
	
		// called when a single event's data has been changed
		function reportEventChange() {
			renderEvents();
		}
	
	
	
		/* Header Updating
		-----------------------------------------------------------------------------*/
	
	
		function updateHeaderTitle() {
			header.updateTitle(currentView.title);
		}
	
	
		function updateTodayButton() {
			var now = t.getNow();
			if (now.isWithin(currentView.intervalStart, currentView.intervalEnd)) {
				header.disableButton('today');
			}
			else {
				header.enableButton('today');
			}
		}
		
	
	
		/* Selection
		-----------------------------------------------------------------------------*/
		
	
		// this public method receives start/end dates in any format, with any timezone
		function select(zonedStartInput, zonedEndInput) {
			currentView.select(
				t.buildSelectSpan.apply(t, arguments)
			);
		}
		
	
		function unselect() { // safe to be called before renderView
			if (currentView) {
				currentView.unselect();
			}
		}
		
		
		
		/* Date
		-----------------------------------------------------------------------------*/
		
		
		function prev() {
			date = currentView.computePrevDate(date);
			renderView();
		}
		
		
		function next() {
			date = currentView.computeNextDate(date);
			renderView();
		}
		
		
		function prevYear() {
			date.add(-1, 'years');
			renderView();
		}
		
		
		function nextYear() {
			date.add(1, 'years');
			renderView();
		}
		
		
		function today() {
			date = t.getNow();
			renderView();
		}
		
		
		function gotoDate(zonedDateInput) {
			date = t.moment(zonedDateInput).stripZone();
			renderView();
		}
		
		
		function incrementDate(delta) {
			date.add(moment.duration(delta));
			renderView();
		}
	
	
		// Forces navigation to a view for the given date.
		// `viewType` can be a specific view name or a generic one like "week" or "day".
		function zoomTo(newDate, viewType) {
			var spec;
	
			viewType = viewType || 'day'; // day is default zoom
			spec = t.getViewSpec(viewType) || t.getUnitViewSpec(viewType);
	
			date = newDate.clone();
			renderView(spec ? spec.type : null);
		}
		
		
		// for external API
		function getDate() {
			return t.applyTimezone(date); // infuse the calendar's timezone
		}
	
	
	
		/* Height "Freezing"
		-----------------------------------------------------------------------------*/
		// TODO: move this into the view
	
		t.freezeContentHeight = freezeContentHeight;
		t.unfreezeContentHeight = unfreezeContentHeight;
	
	
		function freezeContentHeight() {
			content.css({
				width: '100%',
				height: content.height(),
				overflow: 'hidden'
			});
		}
	
	
		function unfreezeContentHeight() {
			content.css({
				width: '',
				height: '',
				overflow: ''
			});
		}
		
		
		
		/* Misc
		-----------------------------------------------------------------------------*/
		
	
		function getCalendar() {
			return t;
		}
	
		
		function getView() {
			return currentView;
		}
		
		
		function option(name, value) {
			var newOptionHash;
	
			if (typeof name === 'string') {
				if (value === undefined) { // getter
					return t.options[name];
				}
				else { // setter for individual option
					newOptionHash = {};
					newOptionHash[name] = value;
					setOptions(newOptionHash);
				}
			}
			else if (typeof name === 'object') { // compound setter with object input
				setOptions(name);
			}
		}
	
	
		function setOptions(newOptionHash) {
			var optionCnt = 0;
			var optionName;
	
			for (optionName in newOptionHash) {
				t.dynamicOverrides[optionName] = newOptionHash[optionName];
			}
	
			t.viewSpecCache = {}; // the dynamic override invalidates the options in this cache, so just clear it
			t.populateOptionsHash(); // this.options needs to be recomputed after the dynamic override
	
			// trigger handlers after this.options has been updated
			for (optionName in newOptionHash) {
				t.triggerOptionHandlers(optionName); // recall bindOption/bindOptions
				optionCnt++;
			}
	
			// special-case handling of single option change.
			// if only one option change, `optionName` will be its name.
			if (optionCnt === 1) {
				if (optionName === 'height' || optionName === 'contentHeight' || optionName === 'aspectRatio') {
					updateSize(true); // true = allow recalculation of height
					return;
				}
				else if (optionName === 'defaultDate') {
					return; // can't change date this way. use gotoDate instead
				}
				else if (optionName === 'businessHours') {
					if (currentView) {
						currentView.unrenderBusinessHours();
						currentView.renderBusinessHours();
					}
					return;
				}
				else if (optionName === 'timezone') {
					t.rezoneArrayEventSources();
					refetchEvents();
					return;
				}
			}
	
			// catch-all. rerender the header and rebuild/rerender the current view
			renderHeader();
			viewsByType = {}; // even non-current views will be affected by this option change. do before rerender
			reinitView();
		}
		
		
		function trigger(name, thisObj) { // overrides the Emitter's trigger method :(
			var args = Array.prototype.slice.call(arguments, 2);
	
			thisObj = thisObj || _element;
			this.triggerWith(name, thisObj, args); // Emitter's method
	
			if (t.options[name]) {
				return t.options[name].apply(thisObj, args);
			}
		}
	
		t.initialize();
	}
	
	;;
	/*
	Options binding/triggering system.
	*/
	Calendar.mixin({
	
		// A map of option names to arrays of handler objects. Initialized to {} in Calendar.
		// Format for a handler object:
		// {
		//   func // callback function to be called upon change
		//   names // option names whose values should be given to func
		// }
		optionHandlers: null, 
	
		// Calls handlerFunc immediately, and when the given option has changed.
		// handlerFunc will be given the option value.
		bindOption: function(optionName, handlerFunc) {
			this.bindOptions([ optionName ], handlerFunc);
		},
	
		// Calls handlerFunc immediately, and when any of the given options change.
		// handlerFunc will be given each option value as ordered function arguments.
		bindOptions: function(optionNames, handlerFunc) {
			var handlerObj = { func: handlerFunc, names: optionNames };
			var i;
	
			for (i = 0; i < optionNames.length; i++) {
				this.registerOptionHandlerObj(optionNames[i], handlerObj);
			}
	
			this.triggerOptionHandlerObj(handlerObj);
		},
	
		// Puts the given handler object into the internal hash
		registerOptionHandlerObj: function(optionName, handlerObj) {
			(this.optionHandlers[optionName] || (this.optionHandlers[optionName] = []))
				.push(handlerObj);
		},
	
		// Reports that the given option has changed, and calls all appropriate handlers.
		triggerOptionHandlers: function(optionName) {
			var handlerObjs = this.optionHandlers[optionName] || [];
			var i;
	
			for (i = 0; i < handlerObjs.length; i++) {
				this.triggerOptionHandlerObj(handlerObjs[i]);
			}
		},
	
		// Calls the callback for a specific handler object, passing in the appropriate arguments.
		triggerOptionHandlerObj: function(handlerObj) {
			var optionNames = handlerObj.names;
			var optionValues = [];
			var i;
	
			for (i = 0; i < optionNames.length; i++) {
				optionValues.push(this.options[optionNames[i]]);
			}
	
			handlerObj.func.apply(this, optionValues); // maintain the Calendar's `this` context
		}
	
	});
	
	;;
	
	Calendar.defaults = {
	
		titleRangeSeparator: ' \u2013 ', // en dash
		monthYearFormat: 'MMMM YYYY', // required for en. other languages rely on datepicker computable option
	
		defaultTimedEventDuration: '02:00:00',
		defaultAllDayEventDuration: { days: 1 },
		forceEventDuration: false,
		nextDayThreshold: '09:00:00', // 9am
	
		// display
		defaultView: 'month',
		aspectRatio: 1.35,
		header: {
			left: 'title',
			center: '',
			right: 'today prev,next'
		},
		weekends: true,
		weekNumbers: false,
	
		weekNumberTitle: 'W',
		weekNumberCalculation: 'local',
		
		//editable: false,
	
		//nowIndicator: false,
	
		scrollTime: '06:00:00',
		
		// event ajax
		lazyFetching: true,
		startParam: 'start',
		endParam: 'end',
		timezoneParam: 'timezone',
	
		timezone: false,
	
		//allDayDefault: undefined,
	
		// locale
		isRTL: false,
		buttonText: {
			prev: "prev",
			next: "next",
			prevYear: "prev year",
			nextYear: "next year",
			year: 'year', // TODO: locale files need to specify this
			today: 'today',
			month: 'month',
			week: 'week',
			day: 'day'
		},
	
		buttonIcons: {
			prev: 'left-single-arrow',
			next: 'right-single-arrow',
			prevYear: 'left-double-arrow',
			nextYear: 'right-double-arrow'
		},
		
		// jquery-ui theming
		theme: false,
		themeButtonIcons: {
			prev: 'circle-triangle-w',
			next: 'circle-triangle-e',
			prevYear: 'seek-prev',
			nextYear: 'seek-next'
		},
	
		//eventResizableFromStart: false,
		dragOpacity: .75,
		dragRevertDuration: 500,
		dragScroll: true,
		
		//selectable: false,
		unselectAuto: true,
		
		dropAccept: '*',
	
		eventOrder: 'title',
	
		eventLimit: false,
		eventLimitText: 'more',
		eventLimitClick: 'popover',
		dayPopoverFormat: 'LL',
		
		handleWindowResize: true,
		windowResizeDelay: 100, // milliseconds before an updateSize happens
	
		longPressDelay: 1000
		
	};
	
	
	Calendar.englishDefaults = { // used by lang.js
		dayPopoverFormat: 'dddd, MMMM D'
	};
	
	
	Calendar.rtlDefaults = { // right-to-left defaults
		header: { // TODO: smarter solution (first/center/last ?)
			left: 'next,prev today',
			center: '',
			right: 'title'
		},
		buttonIcons: {
			prev: 'right-single-arrow',
			next: 'left-single-arrow',
			prevYear: 'right-double-arrow',
			nextYear: 'left-double-arrow'
		},
		themeButtonIcons: {
			prev: 'circle-triangle-e',
			next: 'circle-triangle-w',
			nextYear: 'seek-prev',
			prevYear: 'seek-next'
		}
	};
	
	;;
	
	var langOptionHash = FC.langs = {}; // initialize and expose
	
	
	// TODO: document the structure and ordering of a FullCalendar lang file
	// TODO: rename everything "lang" to "locale", like what the moment project did
	
	
	// Initialize jQuery UI datepicker translations while using some of the translations
	// Will set this as the default language for datepicker.
	FC.datepickerLang = function(langCode, dpLangCode, dpOptions) {
	
		// get the FullCalendar internal option hash for this language. create if necessary
		var fcOptions = langOptionHash[langCode] || (langOptionHash[langCode] = {});
	
		// transfer some simple options from datepicker to fc
		fcOptions.isRTL = dpOptions.isRTL;
		fcOptions.weekNumberTitle = dpOptions.weekHeader;
	
		// compute some more complex options from datepicker
		$.each(dpComputableOptions, function(name, func) {
			fcOptions[name] = func(dpOptions);
		});
	
		// is jQuery UI Datepicker is on the page?
		if ($.datepicker) {
	
			// Register the language data.
			// FullCalendar and MomentJS use language codes like "pt-br" but Datepicker
			// does it like "pt-BR" or if it doesn't have the language, maybe just "pt".
			// Make an alias so the language can be referenced either way.
			$.datepicker.regional[dpLangCode] =
				$.datepicker.regional[langCode] = // alias
					dpOptions;
	
			// Alias 'en' to the default language data. Do this every time.
			$.datepicker.regional.en = $.datepicker.regional[''];
	
			// Set as Datepicker's global defaults.
			$.datepicker.setDefaults(dpOptions);
		}
	};
	
	
	// Sets FullCalendar-specific translations. Will set the language as the global default.
	FC.lang = function(langCode, newFcOptions) {
		var fcOptions;
		var momOptions;
	
		// get the FullCalendar internal option hash for this language. create if necessary
		fcOptions = langOptionHash[langCode] || (langOptionHash[langCode] = {});
	
		// provided new options for this language? merge them in
		if (newFcOptions) {
			fcOptions = langOptionHash[langCode] = mergeOptions([ fcOptions, newFcOptions ]);
		}
	
		// compute language options that weren't defined.
		// always do this. newFcOptions can be undefined when initializing from i18n file,
		// so no way to tell if this is an initialization or a default-setting.
		momOptions = getMomentLocaleData(langCode); // will fall back to en
		$.each(momComputableOptions, function(name, func) {
			if (fcOptions[name] == null) {
				fcOptions[name] = func(momOptions, fcOptions);
			}
		});
	
		// set it as the default language for FullCalendar
		Calendar.defaults.lang = langCode;
	};
	
	
	// NOTE: can't guarantee any of these computations will run because not every language has datepicker
	// configs, so make sure there are English fallbacks for these in the defaults file.
	var dpComputableOptions = {
	
		buttonText: function(dpOptions) {
			return {
				// the translations sometimes wrongly contain HTML entities
				prev: stripHtmlEntities(dpOptions.prevText),
				next: stripHtmlEntities(dpOptions.nextText),
				today: stripHtmlEntities(dpOptions.currentText)
			};
		},
	
		// Produces format strings like "MMMM YYYY" -> "September 2014"
		monthYearFormat: function(dpOptions) {
			return dpOptions.showMonthAfterYear ?
				'YYYY[' + dpOptions.yearSuffix + '] MMMM' :
				'MMMM YYYY[' + dpOptions.yearSuffix + ']';
		}
	
	};
	
	var momComputableOptions = {
	
		// Produces format strings like "ddd M/D" -> "Fri 9/15"
		dayOfMonthFormat: function(momOptions, fcOptions) {
			var format = momOptions.longDateFormat('l'); // for the format like "M/D/YYYY"
	
			// strip the year off the edge, as well as other misc non-whitespace chars
			format = format.replace(/^Y+[^\w\s]*|[^\w\s]*Y+$/g, '');
	
			if (fcOptions.isRTL) {
				format += ' ddd'; // for RTL, add day-of-week to end
			}
			else {
				format = 'ddd ' + format; // for LTR, add day-of-week to beginning
			}
			return format;
		},
	
		// Produces format strings like "h:mma" -> "6:00pm"
		mediumTimeFormat: function(momOptions) { // can't be called `timeFormat` because collides with option
			return momOptions.longDateFormat('LT')
				.replace(/\s*a$/i, 'a'); // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
		},
	
		// Produces format strings like "h(:mm)a" -> "6pm" / "6:30pm"
		smallTimeFormat: function(momOptions) {
			return momOptions.longDateFormat('LT')
				.replace(':mm', '(:mm)')
				.replace(/(\Wmm)$/, '($1)') // like above, but for foreign langs
				.replace(/\s*a$/i, 'a'); // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
		},
	
		// Produces format strings like "h(:mm)t" -> "6p" / "6:30p"
		extraSmallTimeFormat: function(momOptions) {
			return momOptions.longDateFormat('LT')
				.replace(':mm', '(:mm)')
				.replace(/(\Wmm)$/, '($1)') // like above, but for foreign langs
				.replace(/\s*a$/i, 't'); // convert to AM/PM/am/pm to lowercase one-letter. remove any spaces beforehand
		},
	
		// Produces format strings like "ha" / "H" -> "6pm" / "18"
		hourFormat: function(momOptions) {
			return momOptions.longDateFormat('LT')
				.replace(':mm', '')
				.replace(/(\Wmm)$/, '') // like above, but for foreign langs
				.replace(/\s*a$/i, 'a'); // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
		},
	
		// Produces format strings like "h:mm" -> "6:30" (with no AM/PM)
		noMeridiemTimeFormat: function(momOptions) {
			return momOptions.longDateFormat('LT')
				.replace(/\s*a$/i, ''); // remove trailing AM/PM
		}
	
	};
	
	
	// options that should be computed off live calendar options (considers override options)
	// TODO: best place for this? related to lang?
	// TODO: flipping text based on isRTL is a bad idea because the CSS `direction` might want to handle it
	var instanceComputableOptions = {
	
		// Produces format strings for results like "Mo 16"
		smallDayDateFormat: function(options) {
			return options.isRTL ?
				'D dd' :
				'dd D';
		},
	
		// Produces format strings for results like "Wk 5"
		weekFormat: function(options) {
			return options.isRTL ?
				'w[ ' + options.weekNumberTitle + ']' :
				'[' + options.weekNumberTitle + ' ]w';
		},
	
		// Produces format strings for results like "Wk5"
		smallWeekFormat: function(options) {
			return options.isRTL ?
				'w[' + options.weekNumberTitle + ']' :
				'[' + options.weekNumberTitle + ']w';
		}
	
	};
	
	function populateInstanceComputableOptions(options) {
		$.each(instanceComputableOptions, function(name, func) {
			if (options[name] == null) {
				options[name] = func(options);
			}
		});
	}
	
	
	// Returns moment's internal locale data. If doesn't exist, returns English.
	// Works with moment-pre-2.8
	function getMomentLocaleData(langCode) {
		var func = moment.localeData || moment.langData;
		return func.call(moment, langCode) ||
			func.call(moment, 'en'); // the newer localData could return null, so fall back to en
	}
	
	
	// Initialize English by forcing computation of moment-derived options.
	// Also, sets it as the default.
	FC.lang('en', Calendar.englishDefaults);
	
	;;
	
	/* Top toolbar area with buttons and title
	----------------------------------------------------------------------------------------------------------------------*/
	// TODO: rename all header-related things to "toolbar"
	
	function Header(calendar) {
		var t = this;
		
		// exports
		t.render = render;
		t.removeElement = removeElement;
		t.updateTitle = updateTitle;
		t.activateButton = activateButton;
		t.deactivateButton = deactivateButton;
		t.disableButton = disableButton;
		t.enableButton = enableButton;
		t.getViewsWithButtons = getViewsWithButtons;
		t.el = null; // mirrors local `el`
		
		// locals
		var el;
		var viewsWithButtons = [];
		var tm;
	
	
		// can be called repeatedly and will rerender
		function render() {
			var options = calendar.options;
			var sections = options.header;
	
			tm = options.theme ? 'ui' : 'fc';
	
			if (sections) {
				if (!el) {
					el = this.el = $("<div class='fc-toolbar'/>");
				}
				else {
					el.empty();
				}
				el.append(renderSection('left'))
					.append(renderSection('right'))
					.append(renderSection('center'))
					.append('<div class="fc-clear"/>');
			}
			else {
				removeElement();
			}
		}
		
		
		function removeElement() {
			if (el) {
				el.remove();
				el = t.el = null;
			}
		}
		
		
		function renderSection(position) {
			var sectionEl = $('<div class="fc-' + position + '"/>');
			var options = calendar.options;
			var buttonStr = options.header[position];
	
			if (buttonStr) {
				$.each(buttonStr.split(' '), function(i) {
					var groupChildren = $();
					var isOnlyButtons = true;
					var groupEl;
	
					$.each(this.split(','), function(j, buttonName) {
						var customButtonProps;
						var viewSpec;
						var buttonClick;
						var overrideText; // text explicitly set by calendar's constructor options. overcomes icons
						var defaultText;
						var themeIcon;
						var normalIcon;
						var innerHtml;
						var classes;
						var button; // the element
	
						if (buttonName == 'title') {
							groupChildren = groupChildren.add($('<h2>&nbsp;</h2>')); // we always want it to take up height
							isOnlyButtons = false;
						}
						else {
							if ((customButtonProps = (options.customButtons || {})[buttonName])) {
								buttonClick = function(ev) {
									if (customButtonProps.click) {
										customButtonProps.click.call(button[0], ev);
									}
								};
								overrideText = ''; // icons will override text
								defaultText = customButtonProps.text;
							}
							else if ((viewSpec = calendar.getViewSpec(buttonName))) {
								buttonClick = function() {
									calendar.changeView(buttonName);
								};
								viewsWithButtons.push(buttonName);
								overrideText = viewSpec.buttonTextOverride;
								defaultText = viewSpec.buttonTextDefault;
							}
							else if (calendar[buttonName]) { // a calendar method
								buttonClick = function() {
									calendar[buttonName]();
								};
								overrideText = (calendar.overrides.buttonText || {})[buttonName];
								defaultText = options.buttonText[buttonName]; // everything else is considered default
							}
	
							if (buttonClick) {
	
								themeIcon =
									customButtonProps ?
										customButtonProps.themeIcon :
										options.themeButtonIcons[buttonName];
	
								normalIcon =
									customButtonProps ?
										customButtonProps.icon :
										options.buttonIcons[buttonName];
	
								if (overrideText) {
									innerHtml = htmlEscape(overrideText);
								}
								else if (themeIcon && options.theme) {
									innerHtml = "<span class='ui-icon ui-icon-" + themeIcon + "'></span>";
								}
								else if (normalIcon && !options.theme) {
									innerHtml = "<span class='fc-icon fc-icon-" + normalIcon + "'></span>";
								}
								else {
									innerHtml = htmlEscape(defaultText);
								}
	
								classes = [
									'fc-' + buttonName + '-button',
									tm + '-button',
									tm + '-state-default'
								];
	
								button = $( // type="button" so that it doesn't submit a form
									'<button type="button" class="' + classes.join(' ') + '">' +
										innerHtml +
									'</button>'
									)
									.click(function(ev) {
										// don't process clicks for disabled buttons
										if (!button.hasClass(tm + '-state-disabled')) {
	
											buttonClick(ev);
	
											// after the click action, if the button becomes the "active" tab, or disabled,
											// it should never have a hover class, so remove it now.
											if (
												button.hasClass(tm + '-state-active') ||
												button.hasClass(tm + '-state-disabled')
											) {
												button.removeClass(tm + '-state-hover');
											}
										}
									})
									.mousedown(function() {
										// the *down* effect (mouse pressed in).
										// only on buttons that are not the "active" tab, or disabled
										button
											.not('.' + tm + '-state-active')
											.not('.' + tm + '-state-disabled')
											.addClass(tm + '-state-down');
									})
									.mouseup(function() {
										// undo the *down* effect
										button.removeClass(tm + '-state-down');
									})
									.hover(
										function() {
											// the *hover* effect.
											// only on buttons that are not the "active" tab, or disabled
											button
												.not('.' + tm + '-state-active')
												.not('.' + tm + '-state-disabled')
												.addClass(tm + '-state-hover');
										},
										function() {
											// undo the *hover* effect
											button
												.removeClass(tm + '-state-hover')
												.removeClass(tm + '-state-down'); // if mouseleave happens before mouseup
										}
									);
	
								groupChildren = groupChildren.add(button);
							}
						}
					});
	
					if (isOnlyButtons) {
						groupChildren
							.first().addClass(tm + '-corner-left').end()
							.last().addClass(tm + '-corner-right').end();
					}
	
					if (groupChildren.length > 1) {
						groupEl = $('<div/>');
						if (isOnlyButtons) {
							groupEl.addClass('fc-button-group');
						}
						groupEl.append(groupChildren);
						sectionEl.append(groupEl);
					}
					else {
						sectionEl.append(groupChildren); // 1 or 0 children
					}
				});
			}
	
			return sectionEl;
		}
		
		
		function updateTitle(text) {
			if (el) {
				el.find('h2').text(text);
			}
		}
		
		
		function activateButton(buttonName) {
			if (el) {
				el.find('.fc-' + buttonName + '-button')
					.addClass(tm + '-state-active');
			}
		}
		
		
		function deactivateButton(buttonName) {
			if (el) {
				el.find('.fc-' + buttonName + '-button')
					.removeClass(tm + '-state-active');
			}
		}
		
		
		function disableButton(buttonName) {
			if (el) {
				el.find('.fc-' + buttonName + '-button')
					.prop('disabled', true)
					.addClass(tm + '-state-disabled');
			}
		}
		
		
		function enableButton(buttonName) {
			if (el) {
				el.find('.fc-' + buttonName + '-button')
					.prop('disabled', false)
					.removeClass(tm + '-state-disabled');
			}
		}
	
	
		function getViewsWithButtons() {
			return viewsWithButtons;
		}
	
	}
	
	;;
	
	FC.sourceNormalizers = [];
	FC.sourceFetchers = [];
	
	var ajaxDefaults = {
		dataType: 'json',
		cache: false
	};
	
	var eventGUID = 1;
	
	
	function EventManager() { // assumed to be a calendar
		var t = this;
		
		
		// exports
		t.isFetchNeeded = isFetchNeeded;
		t.fetchEvents = fetchEvents;
		t.fetchEventSources = fetchEventSources;
		t.getEventSources = getEventSources;
		t.getEventSourceById = getEventSourceById;
		t.getEventSourcesByMatchArray = getEventSourcesByMatchArray;
		t.getEventSourcesByMatch = getEventSourcesByMatch;
		t.addEventSource = addEventSource;
		t.removeEventSource = removeEventSource;
		t.removeEventSources = removeEventSources;
		t.updateEvent = updateEvent;
		t.renderEvent = renderEvent;
		t.removeEvents = removeEvents;
		t.clientEvents = clientEvents;
		t.mutateEvent = mutateEvent;
		t.normalizeEventDates = normalizeEventDates;
		t.normalizeEventTimes = normalizeEventTimes;
		
		
		// imports
		var reportEvents = t.reportEvents;
		
		
		// locals
		var stickySource = { events: [] };
		var sources = [ stickySource ];
		var rangeStart, rangeEnd;
		var pendingSourceCnt = 0; // outstanding fetch requests, max one per source
		var cache = []; // holds events that have already been expanded
	
	
		$.each(
			(t.options.events ? [ t.options.events ] : []).concat(t.options.eventSources || []),
			function(i, sourceInput) {
				var source = buildEventSource(sourceInput);
				if (source) {
					sources.push(source);
				}
			}
		);
		
		
		
		/* Fetching
		-----------------------------------------------------------------------------*/
	
	
		// start and end are assumed to be unzoned
		function isFetchNeeded(start, end) {
			return !rangeStart || // nothing has been fetched yet?
				start < rangeStart || end > rangeEnd; // is part of the new range outside of the old range?
		}
		
		
		function fetchEvents(start, end) {
			rangeStart = start;
			rangeEnd = end;
			fetchEventSources(sources, 'reset');
		}
	
	
		// expects an array of event source objects (the originals, not copies)
		// `specialFetchType` is an optimization parameter that affects purging of the event cache.
		function fetchEventSources(specificSources, specialFetchType) {
			var i, source;
	
			if (specialFetchType === 'reset') {
				cache = [];
			}
			else if (specialFetchType !== 'add') {
				cache = excludeEventsBySources(cache, specificSources);
			}
	
			for (i = 0; i < specificSources.length; i++) {
				source = specificSources[i];
	
				// already-pending sources have already been accounted for in pendingSourceCnt
				if (source._status !== 'pending') {
					pendingSourceCnt++;
				}
	
				source._fetchId = (source._fetchId || 0) + 1;
				source._status = 'pending';
			}
	
			for (i = 0; i < specificSources.length; i++) {
				source = specificSources[i];
	
				tryFetchEventSource(source, source._fetchId);
			}
		}
	
	
		// fetches an event source and processes its result ONLY if it is still the current fetch.
		// caller is responsible for incrementing pendingSourceCnt first.
		function tryFetchEventSource(source, fetchId) {
			_fetchEventSource(source, function(eventInputs) {
				var isArraySource = $.isArray(source.events);
				var i, eventInput;
				var abstractEvent;
	
				if (
					// is this the source's most recent fetch?
					// if not, rely on an upcoming fetch of this source to decrement pendingSourceCnt
					fetchId === source._fetchId &&
					// event source no longer valid?
					source._status !== 'rejected'
				) {
					source._status = 'resolved';
	
					if (eventInputs) {
						for (i = 0; i < eventInputs.length; i++) {
							eventInput = eventInputs[i];
	
							if (isArraySource) { // array sources have already been convert to Event Objects
								abstractEvent = eventInput;
							}
							else {
								abstractEvent = buildEventFromInput(eventInput, source);
							}
	
							if (abstractEvent) { // not false (an invalid event)
								cache.push.apply(
									cache,
									expandEvent(abstractEvent) // add individual expanded events to the cache
								);
							}
						}
					}
	
					decrementPendingSourceCnt();
				}
			});
		}
	
	
		function rejectEventSource(source) {
			var wasPending = source._status === 'pending';
	
			source._status = 'rejected';
	
			if (wasPending) {
				decrementPendingSourceCnt();
			}
		}
	
	
		function decrementPendingSourceCnt() {
			pendingSourceCnt--;
			if (!pendingSourceCnt) {
				reportEvents(cache);
			}
		}
		
		
		function _fetchEventSource(source, callback) {
			var i;
			var fetchers = FC.sourceFetchers;
			var res;
	
			for (i=0; i<fetchers.length; i++) {
				res = fetchers[i].call(
					t, // this, the Calendar object
					source,
					rangeStart.clone(),
					rangeEnd.clone(),
					t.options.timezone,
					callback
				);
	
				if (res === true) {
					// the fetcher is in charge. made its own async request
					return;
				}
				else if (typeof res == 'object') {
					// the fetcher returned a new source. process it
					_fetchEventSource(res, callback);
					return;
				}
			}
	
			var events = source.events;
			if (events) {
				if ($.isFunction(events)) {
					t.pushLoading();
					events.call(
						t, // this, the Calendar object
						rangeStart.clone(),
						rangeEnd.clone(),
						t.options.timezone,
						function(events) {
							callback(events);
							t.popLoading();
						}
					);
				}
				else if ($.isArray(events)) {
					callback(events);
				}
				else {
					callback();
				}
			}else{
				var url = source.url;
				if (url) {
					var success = source.success;
					var error = source.error;
					var complete = source.complete;
	
					// retrieve any outbound GET/POST $.ajax data from the options
					var customData;
					if ($.isFunction(source.data)) {
						// supplied as a function that returns a key/value object
						customData = source.data();
					}
					else {
						// supplied as a straight key/value object
						customData = source.data;
					}
	
					// use a copy of the custom data so we can modify the parameters
					// and not affect the passed-in object.
					var data = $.extend({}, customData || {});
	
					var startParam = firstDefined(source.startParam, t.options.startParam);
					var endParam = firstDefined(source.endParam, t.options.endParam);
					var timezoneParam = firstDefined(source.timezoneParam, t.options.timezoneParam);
	
					if (startParam) {
						data[startParam] = rangeStart.format();
					}
					if (endParam) {
						data[endParam] = rangeEnd.format();
					}
					if (t.options.timezone && t.options.timezone != 'local') {
						data[timezoneParam] = t.options.timezone;
					}
	
					t.pushLoading();
					$.ajax($.extend({}, ajaxDefaults, source, {
						data: data,
						success: function(events) {
							events = events || [];
							var res = applyAll(success, this, arguments);
							if ($.isArray(res)) {
								events = res;
							}
							callback(events);
						},
						error: function() {
							applyAll(error, this, arguments);
							callback();
						},
						complete: function() {
							applyAll(complete, this, arguments);
							t.popLoading();
						}
					}));
				}else{
					callback();
				}
			}
		}
		
		
		
		/* Sources
		-----------------------------------------------------------------------------*/
	
	
		function addEventSource(sourceInput) {
			var source = buildEventSource(sourceInput);
			if (source) {
				sources.push(source);
				fetchEventSources([ source ], 'add'); // will eventually call reportEvents
			}
		}
	
	
		function buildEventSource(sourceInput) { // will return undefined if invalid source
			var normalizers = FC.sourceNormalizers;
			var source;
			var i;
	
			if ($.isFunction(sourceInput) || $.isArray(sourceInput)) {
				source = { events: sourceInput };
			}
			else if (typeof sourceInput === 'string') {
				source = { url: sourceInput };
			}
			else if (typeof sourceInput === 'object') {
				source = $.extend({}, sourceInput); // shallow copy
			}
	
			if (source) {
	
				// TODO: repeat code, same code for event classNames
				if (source.className) {
					if (typeof source.className === 'string') {
						source.className = source.className.split(/\s+/);
					}
					// otherwise, assumed to be an array
				}
				else {
					source.className = [];
				}
	
				// for array sources, we convert to standard Event Objects up front
				if ($.isArray(source.events)) {
					source.origArray = source.events; // for removeEventSource
					source.events = $.map(source.events, function(eventInput) {
						return buildEventFromInput(eventInput, source);
					});
				}
	
				for (i=0; i<normalizers.length; i++) {
					normalizers[i].call(t, source);
				}
	
				return source;
			}
		}
	
	
		function removeEventSource(matchInput) {
			removeSpecificEventSources(
				getEventSourcesByMatch(matchInput)
			);
		}
	
	
		// if called with no arguments, removes all.
		function removeEventSources(matchInputs) {
			if (matchInputs == null) {
				removeSpecificEventSources(sources, true); // isAll=true
			}
			else {
				removeSpecificEventSources(
					getEventSourcesByMatchArray(matchInputs)
				);
			}
		}
	
	
		function removeSpecificEventSources(targetSources, isAll) {
			var i;
	
			// cancel pending requests
			for (i = 0; i < targetSources.length; i++) {
				rejectEventSource(targetSources[i]);
			}
	
			if (isAll) { // an optimization
				sources = [];
				cache = [];
			}
			else {
				// remove from persisted source list
				sources = $.grep(sources, function(source) {
					for (i = 0; i < targetSources.length; i++) {
						if (source === targetSources[i]) {
							return false; // exclude
						}
					}
					return true; // include
				});
	
				cache = excludeEventsBySources(cache, targetSources);
			}
	
			reportEvents(cache);
		}
	
	
		function getEventSources() {
			return sources.slice(1); // returns a shallow copy of sources with stickySource removed
		}
	
	
		function getEventSourceById(id) {
			return $.grep(sources, function(source) {
				return source.id && source.id === id;
			})[0];
		}
	
	
		// like getEventSourcesByMatch, but accepts multple match criteria (like multiple IDs)
		function getEventSourcesByMatchArray(matchInputs) {
	
			// coerce into an array
			if (!matchInputs) {
				matchInputs = [];
			}
			else if (!$.isArray(matchInputs)) {
				matchInputs = [ matchInputs ];
			}
	
			var matchingSources = [];
			var i;
	
			// resolve raw inputs to real event source objects
			for (i = 0; i < matchInputs.length; i++) {
				matchingSources.push.apply( // append
					matchingSources,
					getEventSourcesByMatch(matchInputs[i])
				);
			}
	
			return matchingSources;
		}
	
	
		// matchInput can either by a real event source object, an ID, or the function/URL for the source.
		// returns an array of matching source objects.
		function getEventSourcesByMatch(matchInput) {
			var i, source;
	
			// given an proper event source object
			for (i = 0; i < sources.length; i++) {
				source = sources[i];
				if (source === matchInput) {
					return [ source ];
				}
			}
	
			// an ID match
			source = getEventSourceById(matchInput);
			if (source) {
				return [ source ];
			}
	
			return $.grep(sources, function(source) {
				return isSourcesEquivalent(matchInput, source);
			});
		}
	
	
		function isSourcesEquivalent(source1, source2) {
			return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
		}
	
	
		function getSourcePrimitive(source) {
			return (
				(typeof source === 'object') ? // a normalized event source?
					(source.origArray || source.googleCalendarId || source.url || source.events) : // get the primitive
					null
			) ||
			source; // the given argument *is* the primitive
		}
	
	
		// util
		// returns a filtered array without events that are part of any of the given sources
		function excludeEventsBySources(specificEvents, specificSources) {
			return $.grep(specificEvents, function(event) {
				for (var i = 0; i < specificSources.length; i++) {
					if (event.source === specificSources[i]) {
						return false; // exclude
					}
				}
				return true; // keep
			});
		}
		
		
		
		/* Manipulation
		-----------------------------------------------------------------------------*/
	
	
		// Only ever called from the externally-facing API
		function updateEvent(event) {
	
			// massage start/end values, even if date string values
			event.start = t.moment(event.start);
			if (event.end) {
				event.end = t.moment(event.end);
			}
			else {
				event.end = null;
			}
	
			mutateEvent(event, getMiscEventProps(event)); // will handle start/end/allDay normalization
			reportEvents(cache); // reports event modifications (so we can redraw)
		}
	
	
		// Returns a hash of misc event properties that should be copied over to related events.
		function getMiscEventProps(event) {
			var props = {};
	
			$.each(event, function(name, val) {
				if (isMiscEventPropName(name)) {
					if (val !== undefined && isAtomic(val)) { // a defined non-object
						props[name] = val;
					}
				}
			});
	
			return props;
		}
	
		// non-date-related, non-id-related, non-secret
		function isMiscEventPropName(name) {
			return !/^_|^(id|allDay|start|end)$/.test(name);
		}
	
		
		// returns the expanded events that were created
		function renderEvent(eventInput, stick) {
			var abstractEvent = buildEventFromInput(eventInput);
			var events;
			var i, event;
	
			if (abstractEvent) { // not false (a valid input)
				events = expandEvent(abstractEvent);
	
				for (i = 0; i < events.length; i++) {
					event = events[i];
	
					if (!event.source) {
						if (stick) {
							stickySource.events.push(event);
							event.source = stickySource;
						}
						cache.push(event);
					}
				}
	
				reportEvents(cache);
	
				return events;
			}
	
			return [];
		}
		
		
		function removeEvents(filter) {
			var eventID;
			var i;
	
			if (filter == null) { // null or undefined. remove all events
				filter = function() { return true; }; // will always match
			}
			else if (!$.isFunction(filter)) { // an event ID
				eventID = filter + '';
				filter = function(event) {
					return event._id == eventID;
				};
			}
	
			// Purge event(s) from our local cache
			cache = $.grep(cache, filter, true); // inverse=true
	
			// Remove events from array sources.
			// This works because they have been converted to official Event Objects up front.
			// (and as a result, event._id has been calculated).
			for (i=0; i<sources.length; i++) {
				if ($.isArray(sources[i].events)) {
					sources[i].events = $.grep(sources[i].events, filter, true);
				}
			}
	
			reportEvents(cache);
		}
	
		
		function clientEvents(filter) {
			if ($.isFunction(filter)) {
				return $.grep(cache, filter);
			}
			else if (filter != null) { // not null, not undefined. an event ID
				filter += '';
				return $.grep(cache, function(e) {
					return e._id == filter;
				});
			}
			return cache; // else, return all
		}
	
	
		// Makes sure all array event sources have their internal event objects
		// converted over to the Calendar's current timezone.
		t.rezoneArrayEventSources = function() {
			var i;
			var events;
			var j;
	
			for (i = 0; i < sources.length; i++) {
				events = sources[i].events;
				if ($.isArray(events)) {
	
					for (j = 0; j < events.length; j++) {
						rezoneEventDates(events[j]);
					}
				}
			}
		};
	
		function rezoneEventDates(event) {
			event.start = t.moment(event.start);
			if (event.end) {
				event.end = t.moment(event.end);
			}
			backupEventDates(event);
		}
		
		
		/* Event Normalization
		-----------------------------------------------------------------------------*/
	
	
		// Given a raw object with key/value properties, returns an "abstract" Event object.
		// An "abstract" event is an event that, if recurring, will not have been expanded yet.
		// Will return `false` when input is invalid.
		// `source` is optional
		function buildEventFromInput(input, source) {
			var out = {};
			var start, end;
			var allDay;
	
			if (t.options.eventDataTransform) {
				input = t.options.eventDataTransform(input);
			}
			if (source && source.eventDataTransform) {
				input = source.eventDataTransform(input);
			}
	
			// Copy all properties over to the resulting object.
			// The special-case properties will be copied over afterwards.
			$.extend(out, input);
	
			if (source) {
				out.source = source;
			}
	
			out._id = input._id || (input.id === undefined ? '_fc' + eventGUID++ : input.id + '');
	
			if (input.className) {
				if (typeof input.className == 'string') {
					out.className = input.className.split(/\s+/);
				}
				else { // assumed to be an array
					out.className = input.className;
				}
			}
			else {
				out.className = [];
			}
	
			start = input.start || input.date; // "date" is an alias for "start"
			end = input.end;
	
			// parse as a time (Duration) if applicable
			if (isTimeString(start)) {
				start = moment.duration(start);
			}
			if (isTimeString(end)) {
				end = moment.duration(end);
			}
	
			if (input.dow || moment.isDuration(start) || moment.isDuration(end)) {
	
				// the event is "abstract" (recurring) so don't calculate exact start/end dates just yet
				out.start = start ? moment.duration(start) : null; // will be a Duration or null
				out.end = end ? moment.duration(end) : null; // will be a Duration or null
				out._recurring = true; // our internal marker
			}
			else {
	
				if (start) {
					start = t.moment(start);
					if (!start.isValid()) {
						return false;
					}
				}
	
				if (end) {
					end = t.moment(end);
					if (!end.isValid()) {
						end = null; // let defaults take over
					}
				}
	
				allDay = input.allDay;
				if (allDay === undefined) { // still undefined? fallback to default
					allDay = firstDefined(
						source ? source.allDayDefault : undefined,
						t.options.allDayDefault
					);
					// still undefined? normalizeEventDates will calculate it
				}
	
				assignDatesToEvent(start, end, allDay, out);
			}
	
			t.normalizeEvent(out); // hook for external use. a prototype method
	
			return out;
		}
		t.buildEventFromInput = buildEventFromInput;
	
	
		// Normalizes and assigns the given dates to the given partially-formed event object.
		// NOTE: mutates the given start/end moments. does not make a copy.
		function assignDatesToEvent(start, end, allDay, event) {
			event.start = start;
			event.end = end;
			event.allDay = allDay;
			normalizeEventDates(event);
			backupEventDates(event);
		}
	
	
		// Ensures proper values for allDay/start/end. Accepts an Event object, or a plain object with event-ish properties.
		// NOTE: Will modify the given object.
		function normalizeEventDates(eventProps) {
	
			normalizeEventTimes(eventProps);
	
			if (eventProps.end && !eventProps.end.isAfter(eventProps.start)) {
				eventProps.end = null;
			}
	
			if (!eventProps.end) {
				if (t.options.forceEventDuration) {
					eventProps.end = t.getDefaultEventEnd(eventProps.allDay, eventProps.start);
				}
				else {
					eventProps.end = null;
				}
			}
		}
	
	
		// Ensures the allDay property exists and the timeliness of the start/end dates are consistent
		function normalizeEventTimes(eventProps) {
			if (eventProps.allDay == null) {
				eventProps.allDay = !(eventProps.start.hasTime() || (eventProps.end && eventProps.end.hasTime()));
			}
	
			if (eventProps.allDay) {
				eventProps.start.stripTime();
				if (eventProps.end) {
					// TODO: consider nextDayThreshold here? If so, will require a lot of testing and adjustment
					eventProps.end.stripTime();
				}
			}
			else {
				if (!eventProps.start.hasTime()) {
					eventProps.start = t.applyTimezone(eventProps.start.time(0)); // will assign a 00:00 time
				}
				if (eventProps.end && !eventProps.end.hasTime()) {
					eventProps.end = t.applyTimezone(eventProps.end.time(0)); // will assign a 00:00 time
				}
			}
		}
	
	
		// If the given event is a recurring event, break it down into an array of individual instances.
		// If not a recurring event, return an array with the single original event.
		// If given a falsy input (probably because of a failed buildEventFromInput call), returns an empty array.
		// HACK: can override the recurring window by providing custom rangeStart/rangeEnd (for businessHours).
		function expandEvent(abstractEvent, _rangeStart, _rangeEnd) {
			var events = [];
			var dowHash;
			var dow;
			var i;
			var date;
			var startTime, endTime;
			var start, end;
			var event;
	
			_rangeStart = _rangeStart || rangeStart;
			_rangeEnd = _rangeEnd || rangeEnd;
	
			if (abstractEvent) {
				if (abstractEvent._recurring) {
	
					// make a boolean hash as to whether the event occurs on each day-of-week
					if ((dow = abstractEvent.dow)) {
						dowHash = {};
						for (i = 0; i < dow.length; i++) {
							dowHash[dow[i]] = true;
						}
					}
	
					// iterate through every day in the current range
					date = _rangeStart.clone().stripTime(); // holds the date of the current day
					while (date.isBefore(_rangeEnd)) {
	
						if (!dowHash || dowHash[date.day()]) { // if everyday, or this particular day-of-week
	
							startTime = abstractEvent.start; // the stored start and end properties are times (Durations)
							endTime = abstractEvent.end; // "
							start = date.clone();
							end = null;
	
							if (startTime) {
								start = start.time(startTime);
							}
							if (endTime) {
								end = date.clone().time(endTime);
							}
	
							event = $.extend({}, abstractEvent); // make a copy of the original
							assignDatesToEvent(
								start, end,
								!startTime && !endTime, // allDay?
								event
							);
							events.push(event);
						}
	
						date.add(1, 'days');
					}
				}
				else {
					events.push(abstractEvent); // return the original event. will be a one-item array
				}
			}
	
			return events;
		}
		t.expandEvent = expandEvent;
	
	
	
		/* Event Modification Math
		-----------------------------------------------------------------------------------------*/
	
	
		// Modifies an event and all related events by applying the given properties.
		// Special date-diffing logic is used for manipulation of dates.
		// If `props` does not contain start/end dates, the updated values are assumed to be the event's current start/end.
		// All date comparisons are done against the event's pristine _start and _end dates.
		// Returns an object with delta information and a function to undo all operations.
		// For making computations in a granularity greater than day/time, specify largeUnit.
		// NOTE: The given `newProps` might be mutated for normalization purposes.
		function mutateEvent(event, newProps, largeUnit) {
			var miscProps = {};
			var oldProps;
			var clearEnd;
			var startDelta;
			var endDelta;
			var durationDelta;
			var undoFunc;
	
			// diffs the dates in the appropriate way, returning a duration
			function diffDates(date1, date0) { // date1 - date0
				if (largeUnit) {
					return diffByUnit(date1, date0, largeUnit);
				}
				else if (newProps.allDay) {
					return diffDay(date1, date0);
				}
				else {
					return diffDayTime(date1, date0);
				}
			}
	
			newProps = newProps || {};
	
			// normalize new date-related properties
			if (!newProps.start) {
				newProps.start = event.start.clone();
			}
			if (newProps.end === undefined) {
				newProps.end = event.end ? event.end.clone() : null;
			}
			if (newProps.allDay == null) { // is null or undefined?
				newProps.allDay = event.allDay;
			}
			normalizeEventDates(newProps);
	
			// create normalized versions of the original props to compare against
			// need a real end value, for diffing
			oldProps = {
				start: event._start.clone(),
				end: event._end ? event._end.clone() : t.getDefaultEventEnd(event._allDay, event._start),
				allDay: newProps.allDay // normalize the dates in the same regard as the new properties
			};
			normalizeEventDates(oldProps);
	
			// need to clear the end date if explicitly changed to null
			clearEnd = event._end !== null && newProps.end === null;
	
			// compute the delta for moving the start date
			startDelta = diffDates(newProps.start, oldProps.start);
	
			// compute the delta for moving the end date
			if (newProps.end) {
				endDelta = diffDates(newProps.end, oldProps.end);
				durationDelta = endDelta.subtract(startDelta);
			}
			else {
				durationDelta = null;
			}
	
			// gather all non-date-related properties
			$.each(newProps, function(name, val) {
				if (isMiscEventPropName(name)) {
					if (val !== undefined) {
						miscProps[name] = val;
					}
				}
			});
	
			// apply the operations to the event and all related events
			undoFunc = mutateEvents(
				clientEvents(event._id), // get events with this ID
				clearEnd,
				newProps.allDay,
				startDelta,
				durationDelta,
				miscProps
			);
	
			return {
				dateDelta: startDelta,
				durationDelta: durationDelta,
				undo: undoFunc
			};
		}
	
	
		// Modifies an array of events in the following ways (operations are in order):
		// - clear the event's `end`
		// - convert the event to allDay
		// - add `dateDelta` to the start and end
		// - add `durationDelta` to the event's duration
		// - assign `miscProps` to the event
		//
		// Returns a function that can be called to undo all the operations.
		//
		// TODO: don't use so many closures. possible memory issues when lots of events with same ID.
		//
		function mutateEvents(events, clearEnd, allDay, dateDelta, durationDelta, miscProps) {
			var isAmbigTimezone = t.getIsAmbigTimezone();
			var undoFunctions = [];
	
			// normalize zero-length deltas to be null
			if (dateDelta && !dateDelta.valueOf()) { dateDelta = null; }
			if (durationDelta && !durationDelta.valueOf()) { durationDelta = null; }
	
			$.each(events, function(i, event) {
				var oldProps;
				var newProps;
	
				// build an object holding all the old values, both date-related and misc.
				// for the undo function.
				oldProps = {
					start: event.start.clone(),
					end: event.end ? event.end.clone() : null,
					allDay: event.allDay
				};
				$.each(miscProps, function(name) {
					oldProps[name] = event[name];
				});
	
				// new date-related properties. work off the original date snapshot.
				// ok to use references because they will be thrown away when backupEventDates is called.
				newProps = {
					start: event._start,
					end: event._end,
					allDay: allDay // normalize the dates in the same regard as the new properties
				};
				normalizeEventDates(newProps); // massages start/end/allDay
	
				// strip or ensure the end date
				if (clearEnd) {
					newProps.end = null;
				}
				else if (durationDelta && !newProps.end) { // the duration translation requires an end date
					newProps.end = t.getDefaultEventEnd(newProps.allDay, newProps.start);
				}
	
				if (dateDelta) {
					newProps.start.add(dateDelta);
					if (newProps.end) {
						newProps.end.add(dateDelta);
					}
				}
	
				if (durationDelta) {
					newProps.end.add(durationDelta); // end already ensured above
				}
	
				// if the dates have changed, and we know it is impossible to recompute the
				// timezone offsets, strip the zone.
				if (
					isAmbigTimezone &&
					!newProps.allDay &&
					(dateDelta || durationDelta)
				) {
					newProps.start.stripZone();
					if (newProps.end) {
						newProps.end.stripZone();
					}
				}
	
				$.extend(event, miscProps, newProps); // copy over misc props, then date-related props
				backupEventDates(event); // regenerate internal _start/_end/_allDay
	
				undoFunctions.push(function() {
					$.extend(event, oldProps);
					backupEventDates(event); // regenerate internal _start/_end/_allDay
				});
			});
	
			return function() {
				for (var i = 0; i < undoFunctions.length; i++) {
					undoFunctions[i]();
				}
			};
		}
	
	
		/* Overlapping / Constraining
		-----------------------------------------------------------------------------------------*/
	
		t.isEventSpanAllowed = isEventSpanAllowed;
		t.isExternalSpanAllowed = isExternalSpanAllowed;
		t.isSelectionSpanAllowed = isSelectionSpanAllowed;
	
	
		// Determines if the given event can be relocated to the given span (unzoned start/end with other misc data)
		function isEventSpanAllowed(span, event) {
			var source = event.source || {};
			var constraint = firstDefined(
				event.constraint,
				source.constraint,
				t.options.eventConstraint
			);
			var overlap = firstDefined(
				event.overlap,
				source.overlap,
				t.options.eventOverlap
			);
			return isSpanAllowed(span, constraint, overlap, event);
		}
	
	
		// Determines if an external event can be relocated to the given span (unzoned start/end with other misc data)
		function isExternalSpanAllowed(eventSpan, eventLocation, eventProps) {
			var eventInput;
			var event;
	
			// note: very similar logic is in View's reportExternalDrop
			if (eventProps) {
				eventInput = $.extend({}, eventProps, eventLocation);
				event = expandEvent(buildEventFromInput(eventInput))[0];
			}
	
			if (event) {
				return isEventSpanAllowed(eventSpan, event);
			}
			else { // treat it as a selection
	
				return isSelectionSpanAllowed(eventSpan);
			}
		}
	
	
		// Determines the given span (unzoned start/end with other misc data) can be selected.
		function isSelectionSpanAllowed(span) {
			return isSpanAllowed(span, t.options.selectConstraint, t.options.selectOverlap);
		}
	
	
		// Returns true if the given span (caused by an event drop/resize or a selection) is allowed to exist
		// according to the constraint/overlap settings.
		// `event` is not required if checking a selection.
		function isSpanAllowed(span, constraint, overlap, event) {
			var constraintEvents;
			var anyContainment;
			var peerEvents;
			var i, peerEvent;
			var peerOverlap;
	
			// the range must be fully contained by at least one of produced constraint events
			if (constraint != null) {
	
				// not treated as an event! intermediate data structure
				// TODO: use ranges in the future
				constraintEvents = constraintToEvents(constraint);
	
				anyContainment = false;
				for (i = 0; i < constraintEvents.length; i++) {
					if (t.spanContainsSpan(constraintEvents[i], span)) {
						anyContainment = true;
						break;
					}
				}
	
				if (!anyContainment) {
					return false;
				}
			}
	
			peerEvents = t.getPeerEvents(span, event);
	
			for (i = 0; i < peerEvents.length; i++)  {
				peerEvent = peerEvents[i];
	
				// there needs to be an actual intersection before disallowing anything
				if (eventIntersectsRange(peerEvent, span)) {
	
					// evaluate overlap for the given range and short-circuit if necessary
					if (overlap === false) {
						return false;
					}
					// if the event's overlap is a test function, pass the peer event in question as the first param
					else if (typeof overlap === 'function' && !overlap(peerEvent, event)) {
						return false;
					}
	
					// if we are computing if the given range is allowable for an event, consider the other event's
					// EventObject-specific or Source-specific `overlap` property
					if (event) {
						peerOverlap = firstDefined(
							peerEvent.overlap,
							(peerEvent.source || {}).overlap
							// we already considered the global `eventOverlap`
						);
						if (peerOverlap === false) {
							return false;
						}
						// if the peer event's overlap is a test function, pass the subject event as the first param
						if (typeof peerOverlap === 'function' && !peerOverlap(event, peerEvent)) {
							return false;
						}
					}
				}
			}
	
			return true;
		}
	
	
		// Given an event input from the API, produces an array of event objects. Possible event inputs:
		// 'businessHours'
		// An event ID (number or string)
		// An object with specific start/end dates or a recurring event (like what businessHours accepts)
		function constraintToEvents(constraintInput) {
	
			if (constraintInput === 'businessHours') {
				return t.getCurrentBusinessHourEvents();
			}
	
			if (typeof constraintInput === 'object') {
				return expandEvent(buildEventFromInput(constraintInput));
			}
	
			return clientEvents(constraintInput); // probably an ID
		}
	
	
		// Does the event's date range intersect with the given range?
		// start/end already assumed to have stripped zones :(
		function eventIntersectsRange(event, range) {
			var eventStart = event.start.clone().stripZone();
			var eventEnd = t.getEventEnd(event).stripZone();
	
			return range.start < eventEnd && range.end > eventStart;
		}
	
	
		t.getEventCache = function() {
			return cache;
		};
	
	}
	
	
	// hook for external libs to manipulate event properties upon creation.
	// should manipulate the event in-place.
	Calendar.prototype.normalizeEvent = function(event) {
	};
	
	
	// Does the given span (start, end, and other location information)
	// fully contain the other?
	Calendar.prototype.spanContainsSpan = function(outerSpan, innerSpan) {
		var eventStart = outerSpan.start.clone().stripZone();
		var eventEnd = this.getEventEnd(outerSpan).stripZone();
	
		return innerSpan.start >= eventStart && innerSpan.end <= eventEnd;
	};
	
	
	// Returns a list of events that the given event should be compared against when being considered for a move to
	// the specified span. Attached to the Calendar's prototype because EventManager is a mixin for a Calendar.
	Calendar.prototype.getPeerEvents = function(span, event) {
		var cache = this.getEventCache();
		var peerEvents = [];
		var i, otherEvent;
	
		for (i = 0; i < cache.length; i++) {
			otherEvent = cache[i];
			if (
				!event ||
				event._id !== otherEvent._id // don't compare the event to itself or other related [repeating] events
			) {
				peerEvents.push(otherEvent);
			}
		}
	
		return peerEvents;
	};
	
	
	// updates the "backup" properties, which are preserved in order to compute diffs later on.
	function backupEventDates(event) {
		event._allDay = event.allDay;
		event._start = event.start.clone();
		event._end = event.end ? event.end.clone() : null;
	}
	
	
	/* Business Hours
	-----------------------------------------------------------------------------------------*/
	
	var BUSINESS_HOUR_EVENT_DEFAULTS = {
		id: '_fcBusinessHours', // will relate events from different calls to expandEvent
		start: '09:00',
		end: '17:00',
		dow: [ 1, 2, 3, 4, 5 ], // monday - friday
		rendering: 'inverse-background'
		// classNames are defined in businessHoursSegClasses
	};
	
	// Return events objects for business hours within the current view.
	// Abuse of our event system :(
	Calendar.prototype.getCurrentBusinessHourEvents = function(wholeDay) {
		return this.computeBusinessHourEvents(wholeDay, this.options.businessHours);
	};
	
	// Given a raw input value from options, return events objects for business hours within the current view.
	Calendar.prototype.computeBusinessHourEvents = function(wholeDay, input) {
		if (input === true) {
			return this.expandBusinessHourEvents(wholeDay, [ {} ]);
		}
		else if ($.isPlainObject(input)) {
			return this.expandBusinessHourEvents(wholeDay, [ input ]);
		}
		else if ($.isArray(input)) {
			return this.expandBusinessHourEvents(wholeDay, input, true);
		}
		else {
			return [];
		}
	};
	
	// inputs expected to be an array of objects.
	// if ignoreNoDow is true, will ignore entries that don't specify a day-of-week (dow) key.
	Calendar.prototype.expandBusinessHourEvents = function(wholeDay, inputs, ignoreNoDow) {
		var view = this.getView();
		var events = [];
		var i, input;
	
		for (i = 0; i < inputs.length; i++) {
			input = inputs[i];
	
			if (ignoreNoDow && !input.dow) {
				continue;
			}
	
			// give defaults. will make a copy
			input = $.extend({}, BUSINESS_HOUR_EVENT_DEFAULTS, input);
	
			// if a whole-day series is requested, clear the start/end times
			if (wholeDay) {
				input.start = null;
				input.end = null;
			}
	
			events.push.apply(events, // append
				this.expandEvent(
					this.buildEventFromInput(input),
					view.start,
					view.end
				)
			);
		}
	
		return events;
	};
	
	;;
	
	/* An abstract class for the "basic" views, as well as month view. Renders one or more rows of day cells.
	----------------------------------------------------------------------------------------------------------------------*/
	// It is a manager for a DayGrid subcomponent, which does most of the heavy lifting.
	// It is responsible for managing width/height.
	
	var BasicView = FC.BasicView = View.extend({
	
		scroller: null,
	
		dayGridClass: DayGrid, // class the dayGrid will be instantiated from (overridable by subclasses)
		dayGrid: null, // the main subcomponent that does most of the heavy lifting
	
		dayNumbersVisible: false, // display day numbers on each day cell?
		weekNumbersVisible: false, // display week numbers along the side?
	
		weekNumberWidth: null, // width of all the week-number cells running down the side
	
		headContainerEl: null, // div that hold's the dayGrid's rendered date header
		headRowEl: null, // the fake row element of the day-of-week header
	
	
		initialize: function() {
			this.dayGrid = this.instantiateDayGrid();
	
			this.scroller = new Scroller({
				overflowX: 'hidden',
				overflowY: 'auto'
			});
		},
	
	
		// Generates the DayGrid object this view needs. Draws from this.dayGridClass
		instantiateDayGrid: function() {
			// generate a subclass on the fly with BasicView-specific behavior
			// TODO: cache this subclass
			var subclass = this.dayGridClass.extend(basicDayGridMethods);
	
			return new subclass(this);
		},
	
	
		// Sets the display range and computes all necessary dates
		setRange: function(range) {
			View.prototype.setRange.call(this, range); // call the super-method
	
			this.dayGrid.breakOnWeeks = /year|month|week/.test(this.intervalUnit); // do before setRange
			this.dayGrid.setRange(range);
		},
	
	
		// Compute the value to feed into setRange. Overrides superclass.
		computeRange: function(date) {
			var range = View.prototype.computeRange.call(this, date); // get value from the super-method
	
			// year and month views should be aligned with weeks. this is already done for week
			if (/year|month/.test(range.intervalUnit)) {
				range.start.startOf('week');
				range.start = this.skipHiddenDays(range.start);
	
				// make end-of-week if not already
				if (range.end.weekday()) {
					range.end.add(1, 'week').startOf('week');
					range.end = this.skipHiddenDays(range.end, -1, true); // exclusively move backwards
				}
			}
	
			return range;
		},
	
	
		// Renders the view into `this.el`, which should already be assigned
		renderDates: function() {
	
			this.dayNumbersVisible = this.dayGrid.rowCnt > 1; // TODO: make grid responsible
			this.weekNumbersVisible = this.opt('weekNumbers');
			this.dayGrid.numbersVisible = this.dayNumbersVisible || this.weekNumbersVisible;
	
			this.el.addClass('fc-basic-view').html(this.renderSkeletonHtml());
			this.renderHead();
	
			this.scroller.render();
			var dayGridContainerEl = this.scroller.el.addClass('fc-day-grid-container');
			var dayGridEl = $('<div class="fc-day-grid" />').appendTo(dayGridContainerEl);
			this.el.find('.fc-body > tr > td').append(dayGridContainerEl);
	
			this.dayGrid.setElement(dayGridEl);
			this.dayGrid.renderDates(this.hasRigidRows());
		},
	
	
		// render the day-of-week headers
		renderHead: function() {
			this.headContainerEl =
				this.el.find('.fc-head-container')
					.html(this.dayGrid.renderHeadHtml());
			this.headRowEl = this.headContainerEl.find('.fc-row');
		},
	
	
		// Unrenders the content of the view. Since we haven't separated skeleton rendering from date rendering,
		// always completely kill the dayGrid's rendering.
		unrenderDates: function() {
			this.dayGrid.unrenderDates();
			this.dayGrid.removeElement();
			this.scroller.destroy();
		},
	
	
		renderBusinessHours: function() {
			this.dayGrid.renderBusinessHours();
		},
	
	
		unrenderBusinessHours: function() {
			this.dayGrid.unrenderBusinessHours();
		},
	
	
		// Builds the HTML skeleton for the view.
		// The day-grid component will render inside of a container defined by this HTML.
		renderSkeletonHtml: function() {
			return '' +
				'<table>' +
					'<thead class="fc-head">' +
						'<tr>' +
							'<td class="fc-head-container ' + this.widgetHeaderClass + '"></td>' +
						'</tr>' +
					'</thead>' +
					'<tbody class="fc-body">' +
						'<tr>' +
							'<td class="' + this.widgetContentClass + '"></td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';
		},
	
	
		// Generates an HTML attribute string for setting the width of the week number column, if it is known
		weekNumberStyleAttr: function() {
			if (this.weekNumberWidth !== null) {
				return 'style="width:' + this.weekNumberWidth + 'px"';
			}
			return '';
		},
	
	
		// Determines whether each row should have a constant height
		hasRigidRows: function() {
			var eventLimit = this.opt('eventLimit');
			return eventLimit && typeof eventLimit !== 'number';
		},
	
	
		/* Dimensions
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Refreshes the horizontal dimensions of the view
		updateWidth: function() {
			if (this.weekNumbersVisible) {
				// Make sure all week number cells running down the side have the same width.
				// Record the width for cells created later.
				this.weekNumberWidth = matchCellWidths(
					this.el.find('.fc-week-number')
				);
			}
		},
	
	
		// Adjusts the vertical dimensions of the view to the specified values
		setHeight: function(totalHeight, isAuto) {
			var eventLimit = this.opt('eventLimit');
			var scrollerHeight;
			var scrollbarWidths;
	
			// reset all heights to be natural
			this.scroller.clear();
			uncompensateScroll(this.headRowEl);
	
			this.dayGrid.removeSegPopover(); // kill the "more" popover if displayed
	
			// is the event limit a constant level number?
			if (eventLimit && typeof eventLimit === 'number') {
				this.dayGrid.limitRows(eventLimit); // limit the levels first so the height can redistribute after
			}
	
			// distribute the height to the rows
			// (totalHeight is a "recommended" value if isAuto)
			scrollerHeight = this.computeScrollerHeight(totalHeight);
			this.setGridHeight(scrollerHeight, isAuto);
	
			// is the event limit dynamically calculated?
			if (eventLimit && typeof eventLimit !== 'number') {
				this.dayGrid.limitRows(eventLimit); // limit the levels after the grid's row heights have been set
			}
	
			if (!isAuto) { // should we force dimensions of the scroll container?
	
				this.scroller.setHeight(scrollerHeight);
				scrollbarWidths = this.scroller.getScrollbarWidths();
	
				if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?
	
					compensateScroll(this.headRowEl, scrollbarWidths);
	
					// doing the scrollbar compensation might have created text overflow which created more height. redo
					scrollerHeight = this.computeScrollerHeight(totalHeight);
					this.scroller.setHeight(scrollerHeight);
				}
	
				// guarantees the same scrollbar widths
				this.scroller.lockOverflow(scrollbarWidths);
			}
		},
	
	
		// given a desired total height of the view, returns what the height of the scroller should be
		computeScrollerHeight: function(totalHeight) {
			return totalHeight -
				subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
		},
	
	
		// Sets the height of just the DayGrid component in this view
		setGridHeight: function(height, isAuto) {
			if (isAuto) {
				undistributeHeight(this.dayGrid.rowEls); // let the rows be their natural height with no expanding
			}
			else {
				distributeHeight(this.dayGrid.rowEls, height, true); // true = compensate for height-hogging rows
			}
		},
	
	
		/* Scroll
		------------------------------------------------------------------------------------------------------------------*/
	
	
		queryScroll: function() {
			return this.scroller.getScrollTop();
		},
	
	
		setScroll: function(top) {
			this.scroller.setScrollTop(top);
		},
	
	
		/* Hit Areas
		------------------------------------------------------------------------------------------------------------------*/
		// forward all hit-related method calls to dayGrid
	
	
		prepareHits: function() {
			this.dayGrid.prepareHits();
		},
	
	
		releaseHits: function() {
			this.dayGrid.releaseHits();
		},
	
	
		queryHit: function(left, top) {
			return this.dayGrid.queryHit(left, top);
		},
	
	
		getHitSpan: function(hit) {
			return this.dayGrid.getHitSpan(hit);
		},
	
	
		getHitEl: function(hit) {
			return this.dayGrid.getHitEl(hit);
		},
	
	
		/* Events
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders the given events onto the view and populates the segments array
		renderEvents: function(events) {
			this.dayGrid.renderEvents(events);
	
			this.updateHeight(); // must compensate for events that overflow the row
		},
	
	
		// Retrieves all segment objects that are rendered in the view
		getEventSegs: function() {
			return this.dayGrid.getEventSegs();
		},
	
	
		// Unrenders all event elements and clears internal segment data
		unrenderEvents: function() {
			this.dayGrid.unrenderEvents();
	
			// we DON'T need to call updateHeight() because:
			// A) a renderEvents() call always happens after this, which will eventually call updateHeight()
			// B) in IE8, this causes a flash whenever events are rerendered
		},
	
	
		/* Dragging (for both events and external elements)
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// A returned value of `true` signals that a mock "helper" event has been rendered.
		renderDrag: function(dropLocation, seg) {
			return this.dayGrid.renderDrag(dropLocation, seg);
		},
	
	
		unrenderDrag: function() {
			this.dayGrid.unrenderDrag();
		},
	
	
		/* Selection
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of a selection
		renderSelection: function(span) {
			this.dayGrid.renderSelection(span);
		},
	
	
		// Unrenders a visual indications of a selection
		unrenderSelection: function() {
			this.dayGrid.unrenderSelection();
		}
	
	});
	
	
	// Methods that will customize the rendering behavior of the BasicView's dayGrid
	var basicDayGridMethods = {
	
	
		// Generates the HTML that will go before the day-of week header cells
		renderHeadIntroHtml: function() {
			var view = this.view;
	
			if (view.weekNumbersVisible) {
				return '' +
					'<th class="fc-week-number ' + view.widgetHeaderClass + '" ' + view.weekNumberStyleAttr() + '>' +
						'<span>' + // needed for matchCellWidths
							htmlEscape(view.opt('weekNumberTitle')) +
						'</span>' +
					'</th>';
			}
	
			return '';
		},
	
	
		// Generates the HTML that will go before content-skeleton cells that display the day/week numbers
		renderNumberIntroHtml: function(row) {
			var view = this.view;
	
			if (view.weekNumbersVisible) {
				return '' +
					'<td class="fc-week-number" ' + view.weekNumberStyleAttr() + '>' +
						'<span>' + // needed for matchCellWidths
							this.getCellDate(row, 0).format('w') +
						'</span>' +
					'</td>';
			}
	
			return '';
		},
	
	
		// Generates the HTML that goes before the day bg cells for each day-row
		renderBgIntroHtml: function() {
			var view = this.view;
	
			if (view.weekNumbersVisible) {
				return '<td class="fc-week-number ' + view.widgetContentClass + '" ' +
					view.weekNumberStyleAttr() + '></td>';
			}
	
			return '';
		},
	
	
		// Generates the HTML that goes before every other type of row generated by DayGrid.
		// Affects helper-skeleton and highlight-skeleton rows.
		renderIntroHtml: function() {
			var view = this.view;
	
			if (view.weekNumbersVisible) {
				return '<td class="fc-week-number" ' + view.weekNumberStyleAttr() + '></td>';
			}
	
			return '';
		}
	
	};
	
	;;
	
	/* A month view with day cells running in rows (one-per-week) and columns
	----------------------------------------------------------------------------------------------------------------------*/
	
	var MonthView = FC.MonthView = BasicView.extend({
	
		// Produces information about what range to display
		computeRange: function(date) {
			var range = BasicView.prototype.computeRange.call(this, date); // get value from super-method
			var rowCnt;
	
			// ensure 6 weeks
			if (this.isFixedWeeks()) {
				rowCnt = Math.ceil(range.end.diff(range.start, 'weeks', true)); // could be partial weeks due to hiddenDays
				range.end.add(6 - rowCnt, 'weeks');
			}
	
			return range;
		},
	
	
		// Overrides the default BasicView behavior to have special multi-week auto-height logic
		setGridHeight: function(height, isAuto) {
	
			isAuto = isAuto || this.opt('weekMode') === 'variable'; // LEGACY: weekMode is deprecated
	
			// if auto, make the height of each row the height that it would be if there were 6 weeks
			if (isAuto) {
				height *= this.rowCnt / 6;
			}
	
			distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
		},
	
	
		isFixedWeeks: function() {
			var weekMode = this.opt('weekMode'); // LEGACY: weekMode is deprecated
			if (weekMode) {
				return weekMode === 'fixed'; // if any other type of weekMode, assume NOT fixed
			}
	
			return this.opt('fixedWeekCount');
		}
	
	});
	
	;;
	
	fcViews.basic = {
		'class': BasicView
	};
	
	fcViews.basicDay = {
		type: 'basic',
		duration: { days: 1 }
	};
	
	fcViews.basicWeek = {
		type: 'basic',
		duration: { weeks: 1 }
	};
	
	fcViews.month = {
		'class': MonthView,
		duration: { months: 1 }, // important for prev/next
		defaults: {
			fixedWeekCount: true
		}
	};
	;;
	
	/* An abstract class for all agenda-related views. Displays one more columns with time slots running vertically.
	----------------------------------------------------------------------------------------------------------------------*/
	// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
	// Responsible for managing width/height.
	
	var AgendaView = FC.AgendaView = View.extend({
	
		scroller: null,
	
		timeGridClass: TimeGrid, // class used to instantiate the timeGrid. subclasses can override
		timeGrid: null, // the main time-grid subcomponent of this view
	
		dayGridClass: DayGrid, // class used to instantiate the dayGrid. subclasses can override
		dayGrid: null, // the "all-day" subcomponent. if all-day is turned off, this will be null
	
		axisWidth: null, // the width of the time axis running down the side
	
		headContainerEl: null, // div that hold's the timeGrid's rendered date header
		noScrollRowEls: null, // set of fake row elements that must compensate when scroller has scrollbars
	
		// when the time-grid isn't tall enough to occupy the given height, we render an <hr> underneath
		bottomRuleEl: null,
	
	
		initialize: function() {
			this.timeGrid = this.instantiateTimeGrid();
	
			if (this.opt('allDaySlot')) { // should we display the "all-day" area?
				this.dayGrid = this.instantiateDayGrid(); // the all-day subcomponent of this view
			}
	
			this.scroller = new Scroller({
				overflowX: 'hidden',
				overflowY: 'auto'
			});
		},
	
	
		// Instantiates the TimeGrid object this view needs. Draws from this.timeGridClass
		instantiateTimeGrid: function() {
			var subclass = this.timeGridClass.extend(agendaTimeGridMethods);
	
			return new subclass(this);
		},
	
	
		// Instantiates the DayGrid object this view might need. Draws from this.dayGridClass
		instantiateDayGrid: function() {
			var subclass = this.dayGridClass.extend(agendaDayGridMethods);
	
			return new subclass(this);
		},
	
	
		/* Rendering
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Sets the display range and computes all necessary dates
		setRange: function(range) {
			View.prototype.setRange.call(this, range); // call the super-method
	
			this.timeGrid.setRange(range);
			if (this.dayGrid) {
				this.dayGrid.setRange(range);
			}
		},
	
	
		// Renders the view into `this.el`, which has already been assigned
		renderDates: function() {
	
			this.el.addClass('fc-agenda-view').html(this.renderSkeletonHtml());
			this.renderHead();
	
			this.scroller.render();
			var timeGridWrapEl = this.scroller.el.addClass('fc-time-grid-container');
			var timeGridEl = $('<div class="fc-time-grid" />').appendTo(timeGridWrapEl);
			this.el.find('.fc-body > tr > td').append(timeGridWrapEl);
	
			this.timeGrid.setElement(timeGridEl);
			this.timeGrid.renderDates();
	
			// the <hr> that sometimes displays under the time-grid
			this.bottomRuleEl = $('<hr class="fc-divider ' + this.widgetHeaderClass + '"/>')
				.appendTo(this.timeGrid.el); // inject it into the time-grid
	
			if (this.dayGrid) {
				this.dayGrid.setElement(this.el.find('.fc-day-grid'));
				this.dayGrid.renderDates();
	
				// have the day-grid extend it's coordinate area over the <hr> dividing the two grids
				this.dayGrid.bottomCoordPadding = this.dayGrid.el.next('hr').outerHeight();
			}
	
			this.noScrollRowEls = this.el.find('.fc-row:not(.fc-scroller *)'); // fake rows not within the scroller
		},
	
	
		// render the day-of-week headers
		renderHead: function() {
			this.headContainerEl =
				this.el.find('.fc-head-container')
					.html(this.timeGrid.renderHeadHtml());
		},
	
	
		// Unrenders the content of the view. Since we haven't separated skeleton rendering from date rendering,
		// always completely kill each grid's rendering.
		unrenderDates: function() {
			this.timeGrid.unrenderDates();
			this.timeGrid.removeElement();
	
			if (this.dayGrid) {
				this.dayGrid.unrenderDates();
				this.dayGrid.removeElement();
			}
	
			this.scroller.destroy();
		},
	
	
		// Builds the HTML skeleton for the view.
		// The day-grid and time-grid components will render inside containers defined by this HTML.
		renderSkeletonHtml: function() {
			return '' +
				'<table>' +
					'<thead class="fc-head">' +
						'<tr>' +
							'<td class="fc-head-container ' + this.widgetHeaderClass + '"></td>' +
						'</tr>' +
					'</thead>' +
					'<tbody class="fc-body">' +
						'<tr>' +
							'<td class="' + this.widgetContentClass + '">' +
								(this.dayGrid ?
									'<div class="fc-day-grid"/>' +
									'<hr class="fc-divider ' + this.widgetHeaderClass + '"/>' :
									''
									) +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>';
		},
	
	
		// Generates an HTML attribute string for setting the width of the axis, if it is known
		axisStyleAttr: function() {
			if (this.axisWidth !== null) {
				 return 'style="width:' + this.axisWidth + 'px"';
			}
			return '';
		},
	
	
		/* Business Hours
		------------------------------------------------------------------------------------------------------------------*/
	
	
		renderBusinessHours: function() {
			this.timeGrid.renderBusinessHours();
	
			if (this.dayGrid) {
				this.dayGrid.renderBusinessHours();
			}
		},
	
	
		unrenderBusinessHours: function() {
			this.timeGrid.unrenderBusinessHours();
	
			if (this.dayGrid) {
				this.dayGrid.unrenderBusinessHours();
			}
		},
	
	
		/* Now Indicator
		------------------------------------------------------------------------------------------------------------------*/
	
	
		getNowIndicatorUnit: function() {
			return this.timeGrid.getNowIndicatorUnit();
		},
	
	
		renderNowIndicator: function(date) {
			this.timeGrid.renderNowIndicator(date);
		},
	
	
		unrenderNowIndicator: function() {
			this.timeGrid.unrenderNowIndicator();
		},
	
	
		/* Dimensions
		------------------------------------------------------------------------------------------------------------------*/
	
	
		updateSize: function(isResize) {
			this.timeGrid.updateSize(isResize);
	
			View.prototype.updateSize.call(this, isResize); // call the super-method
		},
	
	
		// Refreshes the horizontal dimensions of the view
		updateWidth: function() {
			// make all axis cells line up, and record the width so newly created axis cells will have it
			this.axisWidth = matchCellWidths(this.el.find('.fc-axis'));
		},
	
	
		// Adjusts the vertical dimensions of the view to the specified values
		setHeight: function(totalHeight, isAuto) {
			var eventLimit;
			var scrollerHeight;
			var scrollbarWidths;
	
			// reset all dimensions back to the original state
			this.bottomRuleEl.hide(); // .show() will be called later if this <hr> is necessary
			this.scroller.clear(); // sets height to 'auto' and clears overflow
			uncompensateScroll(this.noScrollRowEls);
	
			// limit number of events in the all-day area
			if (this.dayGrid) {
				this.dayGrid.removeSegPopover(); // kill the "more" popover if displayed
	
				eventLimit = this.opt('eventLimit');
				if (eventLimit && typeof eventLimit !== 'number') {
					eventLimit = AGENDA_ALL_DAY_EVENT_LIMIT; // make sure "auto" goes to a real number
				}
				if (eventLimit) {
					this.dayGrid.limitRows(eventLimit);
				}
			}
	
			if (!isAuto) { // should we force dimensions of the scroll container?
	
				scrollerHeight = this.computeScrollerHeight(totalHeight);
				this.scroller.setHeight(scrollerHeight);
				scrollbarWidths = this.scroller.getScrollbarWidths();
	
				if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?
	
					// make the all-day and header rows lines up
					compensateScroll(this.noScrollRowEls, scrollbarWidths);
	
					// the scrollbar compensation might have changed text flow, which might affect height, so recalculate
					// and reapply the desired height to the scroller.
					scrollerHeight = this.computeScrollerHeight(totalHeight);
					this.scroller.setHeight(scrollerHeight);
				}
	
				// guarantees the same scrollbar widths
				this.scroller.lockOverflow(scrollbarWidths);
	
				// if there's any space below the slats, show the horizontal rule.
				// this won't cause any new overflow, because lockOverflow already called.
				if (this.timeGrid.getTotalSlatHeight() < scrollerHeight) {
					this.bottomRuleEl.show();
				}
			}
		},
	
	
		// given a desired total height of the view, returns what the height of the scroller should be
		computeScrollerHeight: function(totalHeight) {
			return totalHeight -
				subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
		},
	
	
		/* Scroll
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Computes the initial pre-configured scroll state prior to allowing the user to change it
		computeInitialScroll: function() {
			var scrollTime = moment.duration(this.opt('scrollTime'));
			var top = this.timeGrid.computeTimeTop(scrollTime);
	
			// zoom can give weird floating-point values. rather scroll a little bit further
			top = Math.ceil(top);
	
			if (top) {
				top++; // to overcome top border that slots beyond the first have. looks better
			}
	
			return top;
		},
	
	
		queryScroll: function() {
			return this.scroller.getScrollTop();
		},
	
	
		setScroll: function(top) {
			this.scroller.setScrollTop(top);
		},
	
	
		/* Hit Areas
		------------------------------------------------------------------------------------------------------------------*/
		// forward all hit-related method calls to the grids (dayGrid might not be defined)
	
	
		prepareHits: function() {
			this.timeGrid.prepareHits();
			if (this.dayGrid) {
				this.dayGrid.prepareHits();
			}
		},
	
	
		releaseHits: function() {
			this.timeGrid.releaseHits();
			if (this.dayGrid) {
				this.dayGrid.releaseHits();
			}
		},
	
	
		queryHit: function(left, top) {
			var hit = this.timeGrid.queryHit(left, top);
	
			if (!hit && this.dayGrid) {
				hit = this.dayGrid.queryHit(left, top);
			}
	
			return hit;
		},
	
	
		getHitSpan: function(hit) {
			// TODO: hit.component is set as a hack to identify where the hit came from
			return hit.component.getHitSpan(hit);
		},
	
	
		getHitEl: function(hit) {
			// TODO: hit.component is set as a hack to identify where the hit came from
			return hit.component.getHitEl(hit);
		},
	
	
		/* Events
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders events onto the view and populates the View's segment array
		renderEvents: function(events) {
			var dayEvents = [];
			var timedEvents = [];
			var daySegs = [];
			var timedSegs;
			var i;
	
			// separate the events into all-day and timed
			for (i = 0; i < events.length; i++) {
				if (events[i].allDay) {
					dayEvents.push(events[i]);
				}
				else {
					timedEvents.push(events[i]);
				}
			}
	
			// render the events in the subcomponents
			timedSegs = this.timeGrid.renderEvents(timedEvents);
			if (this.dayGrid) {
				daySegs = this.dayGrid.renderEvents(dayEvents);
			}
	
			// the all-day area is flexible and might have a lot of events, so shift the height
			this.updateHeight();
		},
	
	
		// Retrieves all segment objects that are rendered in the view
		getEventSegs: function() {
			return this.timeGrid.getEventSegs().concat(
				this.dayGrid ? this.dayGrid.getEventSegs() : []
			);
		},
	
	
		// Unrenders all event elements and clears internal segment data
		unrenderEvents: function() {
	
			// unrender the events in the subcomponents
			this.timeGrid.unrenderEvents();
			if (this.dayGrid) {
				this.dayGrid.unrenderEvents();
			}
	
			// we DON'T need to call updateHeight() because:
			// A) a renderEvents() call always happens after this, which will eventually call updateHeight()
			// B) in IE8, this causes a flash whenever events are rerendered
		},
	
	
		/* Dragging (for events and external elements)
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// A returned value of `true` signals that a mock "helper" event has been rendered.
		renderDrag: function(dropLocation, seg) {
			if (dropLocation.start.hasTime()) {
				return this.timeGrid.renderDrag(dropLocation, seg);
			}
			else if (this.dayGrid) {
				return this.dayGrid.renderDrag(dropLocation, seg);
			}
		},
	
	
		unrenderDrag: function() {
			this.timeGrid.unrenderDrag();
			if (this.dayGrid) {
				this.dayGrid.unrenderDrag();
			}
		},
	
	
		/* Selection
		------------------------------------------------------------------------------------------------------------------*/
	
	
		// Renders a visual indication of a selection
		renderSelection: function(span) {
			if (span.start.hasTime() || span.end.hasTime()) {
				this.timeGrid.renderSelection(span);
			}
			else if (this.dayGrid) {
				this.dayGrid.renderSelection(span);
			}
		},
	
	
		// Unrenders a visual indications of a selection
		unrenderSelection: function() {
			this.timeGrid.unrenderSelection();
			if (this.dayGrid) {
				this.dayGrid.unrenderSelection();
			}
		}
	
	});
	
	
	// Methods that will customize the rendering behavior of the AgendaView's timeGrid
	// TODO: move into TimeGrid
	var agendaTimeGridMethods = {
	
	
		// Generates the HTML that will go before the day-of week header cells
		renderHeadIntroHtml: function() {
			var view = this.view;
			var weekText;
	
			if (view.opt('weekNumbers')) {
				weekText = this.start.format(view.opt('smallWeekFormat'));
	
				return '' +
					'<th class="fc-axis fc-week-number ' + view.widgetHeaderClass + '" ' + view.axisStyleAttr() + '>' +
						'<span>' + // needed for matchCellWidths
							htmlEscape(weekText) +
						'</span>' +
					'</th>';
			}
			else {
				return '<th class="fc-axis ' + view.widgetHeaderClass + '" ' + view.axisStyleAttr() + '></th>';
			}
		},
	
	
		// Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
		renderBgIntroHtml: function() {
			var view = this.view;
	
			return '<td class="fc-axis ' + view.widgetContentClass + '" ' + view.axisStyleAttr() + '></td>';
		},
	
	
		// Generates the HTML that goes before all other types of cells.
		// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
		renderIntroHtml: function() {
			var view = this.view;
	
			return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
		}
	
	};
	
	
	// Methods that will customize the rendering behavior of the AgendaView's dayGrid
	var agendaDayGridMethods = {
	
	
		// Generates the HTML that goes before the all-day cells
		renderBgIntroHtml: function() {
			var view = this.view;
	
			return '' +
				'<td class="fc-axis ' + view.widgetContentClass + '" ' + view.axisStyleAttr() + '>' +
					'<span>' + // needed for matchCellWidths
						(view.opt('allDayHtml') || htmlEscape(view.opt('allDayText'))) +
					'</span>' +
				'</td>';
		},
	
	
		// Generates the HTML that goes before all other types of cells.
		// Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
		renderIntroHtml: function() {
			var view = this.view;
	
			return '<td class="fc-axis" ' + view.axisStyleAttr() + '></td>';
		}
	
	};
	
	;;
	
	var AGENDA_ALL_DAY_EVENT_LIMIT = 5;
	
	// potential nice values for the slot-duration and interval-duration
	// from largest to smallest
	var AGENDA_STOCK_SUB_DURATIONS = [
		{ hours: 1 },
		{ minutes: 30 },
		{ minutes: 15 },
		{ seconds: 30 },
		{ seconds: 15 }
	];
	
	fcViews.agenda = {
		'class': AgendaView,
		defaults: {
			allDaySlot: true,
			allDayText: 'all-day',
			slotDuration: '00:30:00',
			minTime: '00:00:00',
			maxTime: '24:00:00',
			slotEventOverlap: true // a bad name. confused with overlap/constraint system
		}
	};
	
	fcViews.agendaDay = {
		type: 'agenda',
		duration: { days: 1 }
	};
	
	fcViews.agendaWeek = {
		type: 'agenda',
		duration: { weeks: 1 }
	};
	;;
	
	return FC; // export for Node/CommonJS
	});

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {//! moment.js
	//! version : 2.17.1
	//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
	//! license : MIT
	//! momentjs.com
	
	;(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    global.moment = factory()
	}(this, (function () { 'use strict';
	
	var hookCallback;
	
	function hooks () {
	    return hookCallback.apply(null, arguments);
	}
	
	// This is done to register the method called with moment()
	// without creating circular dependencies.
	function setHookCallback (callback) {
	    hookCallback = callback;
	}
	
	function isArray(input) {
	    return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
	}
	
	function isObject(input) {
	    // IE8 will treat undefined and null as object if it wasn't for
	    // input != null
	    return input != null && Object.prototype.toString.call(input) === '[object Object]';
	}
	
	function isObjectEmpty(obj) {
	    var k;
	    for (k in obj) {
	        // even if its not own property I'd still call it non-empty
	        return false;
	    }
	    return true;
	}
	
	function isNumber(input) {
	    return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
	}
	
	function isDate(input) {
	    return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
	}
	
	function map(arr, fn) {
	    var res = [], i;
	    for (i = 0; i < arr.length; ++i) {
	        res.push(fn(arr[i], i));
	    }
	    return res;
	}
	
	function hasOwnProp(a, b) {
	    return Object.prototype.hasOwnProperty.call(a, b);
	}
	
	function extend(a, b) {
	    for (var i in b) {
	        if (hasOwnProp(b, i)) {
	            a[i] = b[i];
	        }
	    }
	
	    if (hasOwnProp(b, 'toString')) {
	        a.toString = b.toString;
	    }
	
	    if (hasOwnProp(b, 'valueOf')) {
	        a.valueOf = b.valueOf;
	    }
	
	    return a;
	}
	
	function createUTC (input, format, locale, strict) {
	    return createLocalOrUTC(input, format, locale, strict, true).utc();
	}
	
	function defaultParsingFlags() {
	    // We need to deep clone this object.
	    return {
	        empty           : false,
	        unusedTokens    : [],
	        unusedInput     : [],
	        overflow        : -2,
	        charsLeftOver   : 0,
	        nullInput       : false,
	        invalidMonth    : null,
	        invalidFormat   : false,
	        userInvalidated : false,
	        iso             : false,
	        parsedDateParts : [],
	        meridiem        : null
	    };
	}
	
	function getParsingFlags(m) {
	    if (m._pf == null) {
	        m._pf = defaultParsingFlags();
	    }
	    return m._pf;
	}
	
	var some;
	if (Array.prototype.some) {
	    some = Array.prototype.some;
	} else {
	    some = function (fun) {
	        var t = Object(this);
	        var len = t.length >>> 0;
	
	        for (var i = 0; i < len; i++) {
	            if (i in t && fun.call(this, t[i], i, t)) {
	                return true;
	            }
	        }
	
	        return false;
	    };
	}
	
	var some$1 = some;
	
	function isValid(m) {
	    if (m._isValid == null) {
	        var flags = getParsingFlags(m);
	        var parsedParts = some$1.call(flags.parsedDateParts, function (i) {
	            return i != null;
	        });
	        var isNowValid = !isNaN(m._d.getTime()) &&
	            flags.overflow < 0 &&
	            !flags.empty &&
	            !flags.invalidMonth &&
	            !flags.invalidWeekday &&
	            !flags.nullInput &&
	            !flags.invalidFormat &&
	            !flags.userInvalidated &&
	            (!flags.meridiem || (flags.meridiem && parsedParts));
	
	        if (m._strict) {
	            isNowValid = isNowValid &&
	                flags.charsLeftOver === 0 &&
	                flags.unusedTokens.length === 0 &&
	                flags.bigHour === undefined;
	        }
	
	        if (Object.isFrozen == null || !Object.isFrozen(m)) {
	            m._isValid = isNowValid;
	        }
	        else {
	            return isNowValid;
	        }
	    }
	    return m._isValid;
	}
	
	function createInvalid (flags) {
	    var m = createUTC(NaN);
	    if (flags != null) {
	        extend(getParsingFlags(m), flags);
	    }
	    else {
	        getParsingFlags(m).userInvalidated = true;
	    }
	
	    return m;
	}
	
	function isUndefined(input) {
	    return input === void 0;
	}
	
	// Plugins that add properties should also add the key here (null value),
	// so we can properly clone ourselves.
	var momentProperties = hooks.momentProperties = [];
	
	function copyConfig(to, from) {
	    var i, prop, val;
	
	    if (!isUndefined(from._isAMomentObject)) {
	        to._isAMomentObject = from._isAMomentObject;
	    }
	    if (!isUndefined(from._i)) {
	        to._i = from._i;
	    }
	    if (!isUndefined(from._f)) {
	        to._f = from._f;
	    }
	    if (!isUndefined(from._l)) {
	        to._l = from._l;
	    }
	    if (!isUndefined(from._strict)) {
	        to._strict = from._strict;
	    }
	    if (!isUndefined(from._tzm)) {
	        to._tzm = from._tzm;
	    }
	    if (!isUndefined(from._isUTC)) {
	        to._isUTC = from._isUTC;
	    }
	    if (!isUndefined(from._offset)) {
	        to._offset = from._offset;
	    }
	    if (!isUndefined(from._pf)) {
	        to._pf = getParsingFlags(from);
	    }
	    if (!isUndefined(from._locale)) {
	        to._locale = from._locale;
	    }
	
	    if (momentProperties.length > 0) {
	        for (i in momentProperties) {
	            prop = momentProperties[i];
	            val = from[prop];
	            if (!isUndefined(val)) {
	                to[prop] = val;
	            }
	        }
	    }
	
	    return to;
	}
	
	var updateInProgress = false;
	
	// Moment prototype object
	function Moment(config) {
	    copyConfig(this, config);
	    this._d = new Date(config._d != null ? config._d.getTime() : NaN);
	    if (!this.isValid()) {
	        this._d = new Date(NaN);
	    }
	    // Prevent infinite loop in case updateOffset creates new moment
	    // objects.
	    if (updateInProgress === false) {
	        updateInProgress = true;
	        hooks.updateOffset(this);
	        updateInProgress = false;
	    }
	}
	
	function isMoment (obj) {
	    return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
	}
	
	function absFloor (number) {
	    if (number < 0) {
	        // -0 -> 0
	        return Math.ceil(number) || 0;
	    } else {
	        return Math.floor(number);
	    }
	}
	
	function toInt(argumentForCoercion) {
	    var coercedNumber = +argumentForCoercion,
	        value = 0;
	
	    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
	        value = absFloor(coercedNumber);
	    }
	
	    return value;
	}
	
	// compare two arrays, return the number of differences
	function compareArrays(array1, array2, dontConvert) {
	    var len = Math.min(array1.length, array2.length),
	        lengthDiff = Math.abs(array1.length - array2.length),
	        diffs = 0,
	        i;
	    for (i = 0; i < len; i++) {
	        if ((dontConvert && array1[i] !== array2[i]) ||
	            (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
	            diffs++;
	        }
	    }
	    return diffs + lengthDiff;
	}
	
	function warn(msg) {
	    if (hooks.suppressDeprecationWarnings === false &&
	            (typeof console !==  'undefined') && console.warn) {
	        console.warn('Deprecation warning: ' + msg);
	    }
	}
	
	function deprecate(msg, fn) {
	    var firstTime = true;
	
	    return extend(function () {
	        if (hooks.deprecationHandler != null) {
	            hooks.deprecationHandler(null, msg);
	        }
	        if (firstTime) {
	            var args = [];
	            var arg;
	            for (var i = 0; i < arguments.length; i++) {
	                arg = '';
	                if (typeof arguments[i] === 'object') {
	                    arg += '\n[' + i + '] ';
	                    for (var key in arguments[0]) {
	                        arg += key + ': ' + arguments[0][key] + ', ';
	                    }
	                    arg = arg.slice(0, -2); // Remove trailing comma and space
	                } else {
	                    arg = arguments[i];
	                }
	                args.push(arg);
	            }
	            warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
	            firstTime = false;
	        }
	        return fn.apply(this, arguments);
	    }, fn);
	}
	
	var deprecations = {};
	
	function deprecateSimple(name, msg) {
	    if (hooks.deprecationHandler != null) {
	        hooks.deprecationHandler(name, msg);
	    }
	    if (!deprecations[name]) {
	        warn(msg);
	        deprecations[name] = true;
	    }
	}
	
	hooks.suppressDeprecationWarnings = false;
	hooks.deprecationHandler = null;
	
	function isFunction(input) {
	    return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
	}
	
	function set (config) {
	    var prop, i;
	    for (i in config) {
	        prop = config[i];
	        if (isFunction(prop)) {
	            this[i] = prop;
	        } else {
	            this['_' + i] = prop;
	        }
	    }
	    this._config = config;
	    // Lenient ordinal parsing accepts just a number in addition to
	    // number + (possibly) stuff coming from _ordinalParseLenient.
	    this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
	}
	
	function mergeConfigs(parentConfig, childConfig) {
	    var res = extend({}, parentConfig), prop;
	    for (prop in childConfig) {
	        if (hasOwnProp(childConfig, prop)) {
	            if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
	                res[prop] = {};
	                extend(res[prop], parentConfig[prop]);
	                extend(res[prop], childConfig[prop]);
	            } else if (childConfig[prop] != null) {
	                res[prop] = childConfig[prop];
	            } else {
	                delete res[prop];
	            }
	        }
	    }
	    for (prop in parentConfig) {
	        if (hasOwnProp(parentConfig, prop) &&
	                !hasOwnProp(childConfig, prop) &&
	                isObject(parentConfig[prop])) {
	            // make sure changes to properties don't modify parent config
	            res[prop] = extend({}, res[prop]);
	        }
	    }
	    return res;
	}
	
	function Locale(config) {
	    if (config != null) {
	        this.set(config);
	    }
	}
	
	var keys;
	
	if (Object.keys) {
	    keys = Object.keys;
	} else {
	    keys = function (obj) {
	        var i, res = [];
	        for (i in obj) {
	            if (hasOwnProp(obj, i)) {
	                res.push(i);
	            }
	        }
	        return res;
	    };
	}
	
	var keys$1 = keys;
	
	var defaultCalendar = {
	    sameDay : '[Today at] LT',
	    nextDay : '[Tomorrow at] LT',
	    nextWeek : 'dddd [at] LT',
	    lastDay : '[Yesterday at] LT',
	    lastWeek : '[Last] dddd [at] LT',
	    sameElse : 'L'
	};
	
	function calendar (key, mom, now) {
	    var output = this._calendar[key] || this._calendar['sameElse'];
	    return isFunction(output) ? output.call(mom, now) : output;
	}
	
	var defaultLongDateFormat = {
	    LTS  : 'h:mm:ss A',
	    LT   : 'h:mm A',
	    L    : 'MM/DD/YYYY',
	    LL   : 'MMMM D, YYYY',
	    LLL  : 'MMMM D, YYYY h:mm A',
	    LLLL : 'dddd, MMMM D, YYYY h:mm A'
	};
	
	function longDateFormat (key) {
	    var format = this._longDateFormat[key],
	        formatUpper = this._longDateFormat[key.toUpperCase()];
	
	    if (format || !formatUpper) {
	        return format;
	    }
	
	    this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
	        return val.slice(1);
	    });
	
	    return this._longDateFormat[key];
	}
	
	var defaultInvalidDate = 'Invalid date';
	
	function invalidDate () {
	    return this._invalidDate;
	}
	
	var defaultOrdinal = '%d';
	var defaultOrdinalParse = /\d{1,2}/;
	
	function ordinal (number) {
	    return this._ordinal.replace('%d', number);
	}
	
	var defaultRelativeTime = {
	    future : 'in %s',
	    past   : '%s ago',
	    s  : 'a few seconds',
	    m  : 'a minute',
	    mm : '%d minutes',
	    h  : 'an hour',
	    hh : '%d hours',
	    d  : 'a day',
	    dd : '%d days',
	    M  : 'a month',
	    MM : '%d months',
	    y  : 'a year',
	    yy : '%d years'
	};
	
	function relativeTime (number, withoutSuffix, string, isFuture) {
	    var output = this._relativeTime[string];
	    return (isFunction(output)) ?
	        output(number, withoutSuffix, string, isFuture) :
	        output.replace(/%d/i, number);
	}
	
	function pastFuture (diff, output) {
	    var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
	    return isFunction(format) ? format(output) : format.replace(/%s/i, output);
	}
	
	var aliases = {};
	
	function addUnitAlias (unit, shorthand) {
	    var lowerCase = unit.toLowerCase();
	    aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
	}
	
	function normalizeUnits(units) {
	    return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
	}
	
	function normalizeObjectUnits(inputObject) {
	    var normalizedInput = {},
	        normalizedProp,
	        prop;
	
	    for (prop in inputObject) {
	        if (hasOwnProp(inputObject, prop)) {
	            normalizedProp = normalizeUnits(prop);
	            if (normalizedProp) {
	                normalizedInput[normalizedProp] = inputObject[prop];
	            }
	        }
	    }
	
	    return normalizedInput;
	}
	
	var priorities = {};
	
	function addUnitPriority(unit, priority) {
	    priorities[unit] = priority;
	}
	
	function getPrioritizedUnits(unitsObj) {
	    var units = [];
	    for (var u in unitsObj) {
	        units.push({unit: u, priority: priorities[u]});
	    }
	    units.sort(function (a, b) {
	        return a.priority - b.priority;
	    });
	    return units;
	}
	
	function makeGetSet (unit, keepTime) {
	    return function (value) {
	        if (value != null) {
	            set$1(this, unit, value);
	            hooks.updateOffset(this, keepTime);
	            return this;
	        } else {
	            return get(this, unit);
	        }
	    };
	}
	
	function get (mom, unit) {
	    return mom.isValid() ?
	        mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
	}
	
	function set$1 (mom, unit, value) {
	    if (mom.isValid()) {
	        mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
	    }
	}
	
	// MOMENTS
	
	function stringGet (units) {
	    units = normalizeUnits(units);
	    if (isFunction(this[units])) {
	        return this[units]();
	    }
	    return this;
	}
	
	
	function stringSet (units, value) {
	    if (typeof units === 'object') {
	        units = normalizeObjectUnits(units);
	        var prioritized = getPrioritizedUnits(units);
	        for (var i = 0; i < prioritized.length; i++) {
	            this[prioritized[i].unit](units[prioritized[i].unit]);
	        }
	    } else {
	        units = normalizeUnits(units);
	        if (isFunction(this[units])) {
	            return this[units](value);
	        }
	    }
	    return this;
	}
	
	function zeroFill(number, targetLength, forceSign) {
	    var absNumber = '' + Math.abs(number),
	        zerosToFill = targetLength - absNumber.length,
	        sign = number >= 0;
	    return (sign ? (forceSign ? '+' : '') : '-') +
	        Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
	}
	
	var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
	
	var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
	
	var formatFunctions = {};
	
	var formatTokenFunctions = {};
	
	// token:    'M'
	// padded:   ['MM', 2]
	// ordinal:  'Mo'
	// callback: function () { this.month() + 1 }
	function addFormatToken (token, padded, ordinal, callback) {
	    var func = callback;
	    if (typeof callback === 'string') {
	        func = function () {
	            return this[callback]();
	        };
	    }
	    if (token) {
	        formatTokenFunctions[token] = func;
	    }
	    if (padded) {
	        formatTokenFunctions[padded[0]] = function () {
	            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
	        };
	    }
	    if (ordinal) {
	        formatTokenFunctions[ordinal] = function () {
	            return this.localeData().ordinal(func.apply(this, arguments), token);
	        };
	    }
	}
	
	function removeFormattingTokens(input) {
	    if (input.match(/\[[\s\S]/)) {
	        return input.replace(/^\[|\]$/g, '');
	    }
	    return input.replace(/\\/g, '');
	}
	
	function makeFormatFunction(format) {
	    var array = format.match(formattingTokens), i, length;
	
	    for (i = 0, length = array.length; i < length; i++) {
	        if (formatTokenFunctions[array[i]]) {
	            array[i] = formatTokenFunctions[array[i]];
	        } else {
	            array[i] = removeFormattingTokens(array[i]);
	        }
	    }
	
	    return function (mom) {
	        var output = '', i;
	        for (i = 0; i < length; i++) {
	            output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
	        }
	        return output;
	    };
	}
	
	// format date using native date object
	function formatMoment(m, format) {
	    if (!m.isValid()) {
	        return m.localeData().invalidDate();
	    }
	
	    format = expandFormat(format, m.localeData());
	    formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
	
	    return formatFunctions[format](m);
	}
	
	function expandFormat(format, locale) {
	    var i = 5;
	
	    function replaceLongDateFormatTokens(input) {
	        return locale.longDateFormat(input) || input;
	    }
	
	    localFormattingTokens.lastIndex = 0;
	    while (i >= 0 && localFormattingTokens.test(format)) {
	        format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
	        localFormattingTokens.lastIndex = 0;
	        i -= 1;
	    }
	
	    return format;
	}
	
	var match1         = /\d/;            //       0 - 9
	var match2         = /\d\d/;          //      00 - 99
	var match3         = /\d{3}/;         //     000 - 999
	var match4         = /\d{4}/;         //    0000 - 9999
	var match6         = /[+-]?\d{6}/;    // -999999 - 999999
	var match1to2      = /\d\d?/;         //       0 - 99
	var match3to4      = /\d\d\d\d?/;     //     999 - 9999
	var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
	var match1to3      = /\d{1,3}/;       //       0 - 999
	var match1to4      = /\d{1,4}/;       //       0 - 9999
	var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999
	
	var matchUnsigned  = /\d+/;           //       0 - inf
	var matchSigned    = /[+-]?\d+/;      //    -inf - inf
	
	var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
	var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z
	
	var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123
	
	// any word (or two) characters or numbers including two/three word month in arabic.
	// includes scottish gaelic two word and hyphenated months
	var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
	
	
	var regexes = {};
	
	function addRegexToken (token, regex, strictRegex) {
	    regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
	        return (isStrict && strictRegex) ? strictRegex : regex;
	    };
	}
	
	function getParseRegexForToken (token, config) {
	    if (!hasOwnProp(regexes, token)) {
	        return new RegExp(unescapeFormat(token));
	    }
	
	    return regexes[token](config._strict, config._locale);
	}
	
	// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	function unescapeFormat(s) {
	    return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
	        return p1 || p2 || p3 || p4;
	    }));
	}
	
	function regexEscape(s) {
	    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}
	
	var tokens = {};
	
	function addParseToken (token, callback) {
	    var i, func = callback;
	    if (typeof token === 'string') {
	        token = [token];
	    }
	    if (isNumber(callback)) {
	        func = function (input, array) {
	            array[callback] = toInt(input);
	        };
	    }
	    for (i = 0; i < token.length; i++) {
	        tokens[token[i]] = func;
	    }
	}
	
	function addWeekParseToken (token, callback) {
	    addParseToken(token, function (input, array, config, token) {
	        config._w = config._w || {};
	        callback(input, config._w, config, token);
	    });
	}
	
	function addTimeToArrayFromToken(token, input, config) {
	    if (input != null && hasOwnProp(tokens, token)) {
	        tokens[token](input, config._a, config, token);
	    }
	}
	
	var YEAR = 0;
	var MONTH = 1;
	var DATE = 2;
	var HOUR = 3;
	var MINUTE = 4;
	var SECOND = 5;
	var MILLISECOND = 6;
	var WEEK = 7;
	var WEEKDAY = 8;
	
	var indexOf;
	
	if (Array.prototype.indexOf) {
	    indexOf = Array.prototype.indexOf;
	} else {
	    indexOf = function (o) {
	        // I know
	        var i;
	        for (i = 0; i < this.length; ++i) {
	            if (this[i] === o) {
	                return i;
	            }
	        }
	        return -1;
	    };
	}
	
	var indexOf$1 = indexOf;
	
	function daysInMonth(year, month) {
	    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	}
	
	// FORMATTING
	
	addFormatToken('M', ['MM', 2], 'Mo', function () {
	    return this.month() + 1;
	});
	
	addFormatToken('MMM', 0, 0, function (format) {
	    return this.localeData().monthsShort(this, format);
	});
	
	addFormatToken('MMMM', 0, 0, function (format) {
	    return this.localeData().months(this, format);
	});
	
	// ALIASES
	
	addUnitAlias('month', 'M');
	
	// PRIORITY
	
	addUnitPriority('month', 8);
	
	// PARSING
	
	addRegexToken('M',    match1to2);
	addRegexToken('MM',   match1to2, match2);
	addRegexToken('MMM',  function (isStrict, locale) {
	    return locale.monthsShortRegex(isStrict);
	});
	addRegexToken('MMMM', function (isStrict, locale) {
	    return locale.monthsRegex(isStrict);
	});
	
	addParseToken(['M', 'MM'], function (input, array) {
	    array[MONTH] = toInt(input) - 1;
	});
	
	addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
	    var month = config._locale.monthsParse(input, token, config._strict);
	    // if we didn't find a month name, mark the date as invalid.
	    if (month != null) {
	        array[MONTH] = month;
	    } else {
	        getParsingFlags(config).invalidMonth = input;
	    }
	});
	
	// LOCALES
	
	var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
	var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
	function localeMonths (m, format) {
	    if (!m) {
	        return this._months;
	    }
	    return isArray(this._months) ? this._months[m.month()] :
	        this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
	}
	
	var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
	function localeMonthsShort (m, format) {
	    if (!m) {
	        return this._monthsShort;
	    }
	    return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
	        this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
	}
	
	function handleStrictParse(monthName, format, strict) {
	    var i, ii, mom, llc = monthName.toLocaleLowerCase();
	    if (!this._monthsParse) {
	        // this is not used
	        this._monthsParse = [];
	        this._longMonthsParse = [];
	        this._shortMonthsParse = [];
	        for (i = 0; i < 12; ++i) {
	            mom = createUTC([2000, i]);
	            this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
	            this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
	        }
	    }
	
	    if (strict) {
	        if (format === 'MMM') {
	            ii = indexOf$1.call(this._shortMonthsParse, llc);
	            return ii !== -1 ? ii : null;
	        } else {
	            ii = indexOf$1.call(this._longMonthsParse, llc);
	            return ii !== -1 ? ii : null;
	        }
	    } else {
	        if (format === 'MMM') {
	            ii = indexOf$1.call(this._shortMonthsParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._longMonthsParse, llc);
	            return ii !== -1 ? ii : null;
	        } else {
	            ii = indexOf$1.call(this._longMonthsParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._shortMonthsParse, llc);
	            return ii !== -1 ? ii : null;
	        }
	    }
	}
	
	function localeMonthsParse (monthName, format, strict) {
	    var i, mom, regex;
	
	    if (this._monthsParseExact) {
	        return handleStrictParse.call(this, monthName, format, strict);
	    }
	
	    if (!this._monthsParse) {
	        this._monthsParse = [];
	        this._longMonthsParse = [];
	        this._shortMonthsParse = [];
	    }
	
	    // TODO: add sorting
	    // Sorting makes sure if one month (or abbr) is a prefix of another
	    // see sorting in computeMonthsParse
	    for (i = 0; i < 12; i++) {
	        // make the regex if we don't have it already
	        mom = createUTC([2000, i]);
	        if (strict && !this._longMonthsParse[i]) {
	            this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
	            this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
	        }
	        if (!strict && !this._monthsParse[i]) {
	            regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	            this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
	        }
	        // test the regex
	        if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
	            return i;
	        } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
	            return i;
	        } else if (!strict && this._monthsParse[i].test(monthName)) {
	            return i;
	        }
	    }
	}
	
	// MOMENTS
	
	function setMonth (mom, value) {
	    var dayOfMonth;
	
	    if (!mom.isValid()) {
	        // No op
	        return mom;
	    }
	
	    if (typeof value === 'string') {
	        if (/^\d+$/.test(value)) {
	            value = toInt(value);
	        } else {
	            value = mom.localeData().monthsParse(value);
	            // TODO: Another silent failure?
	            if (!isNumber(value)) {
	                return mom;
	            }
	        }
	    }
	
	    dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
	    mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
	    return mom;
	}
	
	function getSetMonth (value) {
	    if (value != null) {
	        setMonth(this, value);
	        hooks.updateOffset(this, true);
	        return this;
	    } else {
	        return get(this, 'Month');
	    }
	}
	
	function getDaysInMonth () {
	    return daysInMonth(this.year(), this.month());
	}
	
	var defaultMonthsShortRegex = matchWord;
	function monthsShortRegex (isStrict) {
	    if (this._monthsParseExact) {
	        if (!hasOwnProp(this, '_monthsRegex')) {
	            computeMonthsParse.call(this);
	        }
	        if (isStrict) {
	            return this._monthsShortStrictRegex;
	        } else {
	            return this._monthsShortRegex;
	        }
	    } else {
	        if (!hasOwnProp(this, '_monthsShortRegex')) {
	            this._monthsShortRegex = defaultMonthsShortRegex;
	        }
	        return this._monthsShortStrictRegex && isStrict ?
	            this._monthsShortStrictRegex : this._monthsShortRegex;
	    }
	}
	
	var defaultMonthsRegex = matchWord;
	function monthsRegex (isStrict) {
	    if (this._monthsParseExact) {
	        if (!hasOwnProp(this, '_monthsRegex')) {
	            computeMonthsParse.call(this);
	        }
	        if (isStrict) {
	            return this._monthsStrictRegex;
	        } else {
	            return this._monthsRegex;
	        }
	    } else {
	        if (!hasOwnProp(this, '_monthsRegex')) {
	            this._monthsRegex = defaultMonthsRegex;
	        }
	        return this._monthsStrictRegex && isStrict ?
	            this._monthsStrictRegex : this._monthsRegex;
	    }
	}
	
	function computeMonthsParse () {
	    function cmpLenRev(a, b) {
	        return b.length - a.length;
	    }
	
	    var shortPieces = [], longPieces = [], mixedPieces = [],
	        i, mom;
	    for (i = 0; i < 12; i++) {
	        // make the regex if we don't have it already
	        mom = createUTC([2000, i]);
	        shortPieces.push(this.monthsShort(mom, ''));
	        longPieces.push(this.months(mom, ''));
	        mixedPieces.push(this.months(mom, ''));
	        mixedPieces.push(this.monthsShort(mom, ''));
	    }
	    // Sorting makes sure if one month (or abbr) is a prefix of another it
	    // will match the longer piece.
	    shortPieces.sort(cmpLenRev);
	    longPieces.sort(cmpLenRev);
	    mixedPieces.sort(cmpLenRev);
	    for (i = 0; i < 12; i++) {
	        shortPieces[i] = regexEscape(shortPieces[i]);
	        longPieces[i] = regexEscape(longPieces[i]);
	    }
	    for (i = 0; i < 24; i++) {
	        mixedPieces[i] = regexEscape(mixedPieces[i]);
	    }
	
	    this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
	    this._monthsShortRegex = this._monthsRegex;
	    this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
	    this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
	}
	
	// FORMATTING
	
	addFormatToken('Y', 0, 0, function () {
	    var y = this.year();
	    return y <= 9999 ? '' + y : '+' + y;
	});
	
	addFormatToken(0, ['YY', 2], 0, function () {
	    return this.year() % 100;
	});
	
	addFormatToken(0, ['YYYY',   4],       0, 'year');
	addFormatToken(0, ['YYYYY',  5],       0, 'year');
	addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');
	
	// ALIASES
	
	addUnitAlias('year', 'y');
	
	// PRIORITIES
	
	addUnitPriority('year', 1);
	
	// PARSING
	
	addRegexToken('Y',      matchSigned);
	addRegexToken('YY',     match1to2, match2);
	addRegexToken('YYYY',   match1to4, match4);
	addRegexToken('YYYYY',  match1to6, match6);
	addRegexToken('YYYYYY', match1to6, match6);
	
	addParseToken(['YYYYY', 'YYYYYY'], YEAR);
	addParseToken('YYYY', function (input, array) {
	    array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
	});
	addParseToken('YY', function (input, array) {
	    array[YEAR] = hooks.parseTwoDigitYear(input);
	});
	addParseToken('Y', function (input, array) {
	    array[YEAR] = parseInt(input, 10);
	});
	
	// HELPERS
	
	function daysInYear(year) {
	    return isLeapYear(year) ? 366 : 365;
	}
	
	function isLeapYear(year) {
	    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}
	
	// HOOKS
	
	hooks.parseTwoDigitYear = function (input) {
	    return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	};
	
	// MOMENTS
	
	var getSetYear = makeGetSet('FullYear', true);
	
	function getIsLeapYear () {
	    return isLeapYear(this.year());
	}
	
	function createDate (y, m, d, h, M, s, ms) {
	    //can't just apply() to create a date:
	    //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
	    var date = new Date(y, m, d, h, M, s, ms);
	
	    //the date constructor remaps years 0-99 to 1900-1999
	    if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
	        date.setFullYear(y);
	    }
	    return date;
	}
	
	function createUTCDate (y) {
	    var date = new Date(Date.UTC.apply(null, arguments));
	
	    //the Date.UTC function remaps years 0-99 to 1900-1999
	    if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
	        date.setUTCFullYear(y);
	    }
	    return date;
	}
	
	// start-of-first-week - start-of-year
	function firstWeekOffset(year, dow, doy) {
	    var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
	        fwd = 7 + dow - doy,
	        // first-week day local weekday -- which local weekday is fwd
	        fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
	
	    return -fwdlw + fwd - 1;
	}
	
	//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
	    var localWeekday = (7 + weekday - dow) % 7,
	        weekOffset = firstWeekOffset(year, dow, doy),
	        dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
	        resYear, resDayOfYear;
	
	    if (dayOfYear <= 0) {
	        resYear = year - 1;
	        resDayOfYear = daysInYear(resYear) + dayOfYear;
	    } else if (dayOfYear > daysInYear(year)) {
	        resYear = year + 1;
	        resDayOfYear = dayOfYear - daysInYear(year);
	    } else {
	        resYear = year;
	        resDayOfYear = dayOfYear;
	    }
	
	    return {
	        year: resYear,
	        dayOfYear: resDayOfYear
	    };
	}
	
	function weekOfYear(mom, dow, doy) {
	    var weekOffset = firstWeekOffset(mom.year(), dow, doy),
	        week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
	        resWeek, resYear;
	
	    if (week < 1) {
	        resYear = mom.year() - 1;
	        resWeek = week + weeksInYear(resYear, dow, doy);
	    } else if (week > weeksInYear(mom.year(), dow, doy)) {
	        resWeek = week - weeksInYear(mom.year(), dow, doy);
	        resYear = mom.year() + 1;
	    } else {
	        resYear = mom.year();
	        resWeek = week;
	    }
	
	    return {
	        week: resWeek,
	        year: resYear
	    };
	}
	
	function weeksInYear(year, dow, doy) {
	    var weekOffset = firstWeekOffset(year, dow, doy),
	        weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
	    return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
	}
	
	// FORMATTING
	
	addFormatToken('w', ['ww', 2], 'wo', 'week');
	addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');
	
	// ALIASES
	
	addUnitAlias('week', 'w');
	addUnitAlias('isoWeek', 'W');
	
	// PRIORITIES
	
	addUnitPriority('week', 5);
	addUnitPriority('isoWeek', 5);
	
	// PARSING
	
	addRegexToken('w',  match1to2);
	addRegexToken('ww', match1to2, match2);
	addRegexToken('W',  match1to2);
	addRegexToken('WW', match1to2, match2);
	
	addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
	    week[token.substr(0, 1)] = toInt(input);
	});
	
	// HELPERS
	
	// LOCALES
	
	function localeWeek (mom) {
	    return weekOfYear(mom, this._week.dow, this._week.doy).week;
	}
	
	var defaultLocaleWeek = {
	    dow : 0, // Sunday is the first day of the week.
	    doy : 6  // The week that contains Jan 1st is the first week of the year.
	};
	
	function localeFirstDayOfWeek () {
	    return this._week.dow;
	}
	
	function localeFirstDayOfYear () {
	    return this._week.doy;
	}
	
	// MOMENTS
	
	function getSetWeek (input) {
	    var week = this.localeData().week(this);
	    return input == null ? week : this.add((input - week) * 7, 'd');
	}
	
	function getSetISOWeek (input) {
	    var week = weekOfYear(this, 1, 4).week;
	    return input == null ? week : this.add((input - week) * 7, 'd');
	}
	
	// FORMATTING
	
	addFormatToken('d', 0, 'do', 'day');
	
	addFormatToken('dd', 0, 0, function (format) {
	    return this.localeData().weekdaysMin(this, format);
	});
	
	addFormatToken('ddd', 0, 0, function (format) {
	    return this.localeData().weekdaysShort(this, format);
	});
	
	addFormatToken('dddd', 0, 0, function (format) {
	    return this.localeData().weekdays(this, format);
	});
	
	addFormatToken('e', 0, 0, 'weekday');
	addFormatToken('E', 0, 0, 'isoWeekday');
	
	// ALIASES
	
	addUnitAlias('day', 'd');
	addUnitAlias('weekday', 'e');
	addUnitAlias('isoWeekday', 'E');
	
	// PRIORITY
	addUnitPriority('day', 11);
	addUnitPriority('weekday', 11);
	addUnitPriority('isoWeekday', 11);
	
	// PARSING
	
	addRegexToken('d',    match1to2);
	addRegexToken('e',    match1to2);
	addRegexToken('E',    match1to2);
	addRegexToken('dd',   function (isStrict, locale) {
	    return locale.weekdaysMinRegex(isStrict);
	});
	addRegexToken('ddd',   function (isStrict, locale) {
	    return locale.weekdaysShortRegex(isStrict);
	});
	addRegexToken('dddd',   function (isStrict, locale) {
	    return locale.weekdaysRegex(isStrict);
	});
	
	addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
	    var weekday = config._locale.weekdaysParse(input, token, config._strict);
	    // if we didn't get a weekday name, mark the date as invalid
	    if (weekday != null) {
	        week.d = weekday;
	    } else {
	        getParsingFlags(config).invalidWeekday = input;
	    }
	});
	
	addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
	    week[token] = toInt(input);
	});
	
	// HELPERS
	
	function parseWeekday(input, locale) {
	    if (typeof input !== 'string') {
	        return input;
	    }
	
	    if (!isNaN(input)) {
	        return parseInt(input, 10);
	    }
	
	    input = locale.weekdaysParse(input);
	    if (typeof input === 'number') {
	        return input;
	    }
	
	    return null;
	}
	
	function parseIsoWeekday(input, locale) {
	    if (typeof input === 'string') {
	        return locale.weekdaysParse(input) % 7 || 7;
	    }
	    return isNaN(input) ? null : input;
	}
	
	// LOCALES
	
	var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
	function localeWeekdays (m, format) {
	    if (!m) {
	        return this._weekdays;
	    }
	    return isArray(this._weekdays) ? this._weekdays[m.day()] :
	        this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
	}
	
	var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
	function localeWeekdaysShort (m) {
	    return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
	}
	
	var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
	function localeWeekdaysMin (m) {
	    return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
	}
	
	function handleStrictParse$1(weekdayName, format, strict) {
	    var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
	    if (!this._weekdaysParse) {
	        this._weekdaysParse = [];
	        this._shortWeekdaysParse = [];
	        this._minWeekdaysParse = [];
	
	        for (i = 0; i < 7; ++i) {
	            mom = createUTC([2000, 1]).day(i);
	            this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
	            this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
	            this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
	        }
	    }
	
	    if (strict) {
	        if (format === 'dddd') {
	            ii = indexOf$1.call(this._weekdaysParse, llc);
	            return ii !== -1 ? ii : null;
	        } else if (format === 'ddd') {
	            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
	            return ii !== -1 ? ii : null;
	        } else {
	            ii = indexOf$1.call(this._minWeekdaysParse, llc);
	            return ii !== -1 ? ii : null;
	        }
	    } else {
	        if (format === 'dddd') {
	            ii = indexOf$1.call(this._weekdaysParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._minWeekdaysParse, llc);
	            return ii !== -1 ? ii : null;
	        } else if (format === 'ddd') {
	            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._weekdaysParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._minWeekdaysParse, llc);
	            return ii !== -1 ? ii : null;
	        } else {
	            ii = indexOf$1.call(this._minWeekdaysParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._weekdaysParse, llc);
	            if (ii !== -1) {
	                return ii;
	            }
	            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
	            return ii !== -1 ? ii : null;
	        }
	    }
	}
	
	function localeWeekdaysParse (weekdayName, format, strict) {
	    var i, mom, regex;
	
	    if (this._weekdaysParseExact) {
	        return handleStrictParse$1.call(this, weekdayName, format, strict);
	    }
	
	    if (!this._weekdaysParse) {
	        this._weekdaysParse = [];
	        this._minWeekdaysParse = [];
	        this._shortWeekdaysParse = [];
	        this._fullWeekdaysParse = [];
	    }
	
	    for (i = 0; i < 7; i++) {
	        // make the regex if we don't have it already
	
	        mom = createUTC([2000, 1]).day(i);
	        if (strict && !this._fullWeekdaysParse[i]) {
	            this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
	            this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
	            this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
	        }
	        if (!this._weekdaysParse[i]) {
	            regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
	            this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
	        }
	        // test the regex
	        if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
	            return i;
	        } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
	            return i;
	        } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
	            return i;
	        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
	            return i;
	        }
	    }
	}
	
	// MOMENTS
	
	function getSetDayOfWeek (input) {
	    if (!this.isValid()) {
	        return input != null ? this : NaN;
	    }
	    var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	    if (input != null) {
	        input = parseWeekday(input, this.localeData());
	        return this.add(input - day, 'd');
	    } else {
	        return day;
	    }
	}
	
	function getSetLocaleDayOfWeek (input) {
	    if (!this.isValid()) {
	        return input != null ? this : NaN;
	    }
	    var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
	    return input == null ? weekday : this.add(input - weekday, 'd');
	}
	
	function getSetISODayOfWeek (input) {
	    if (!this.isValid()) {
	        return input != null ? this : NaN;
	    }
	
	    // behaves the same as moment#day except
	    // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
	    // as a setter, sunday should belong to the previous week.
	
	    if (input != null) {
	        var weekday = parseIsoWeekday(input, this.localeData());
	        return this.day(this.day() % 7 ? weekday : weekday - 7);
	    } else {
	        return this.day() || 7;
	    }
	}
	
	var defaultWeekdaysRegex = matchWord;
	function weekdaysRegex (isStrict) {
	    if (this._weekdaysParseExact) {
	        if (!hasOwnProp(this, '_weekdaysRegex')) {
	            computeWeekdaysParse.call(this);
	        }
	        if (isStrict) {
	            return this._weekdaysStrictRegex;
	        } else {
	            return this._weekdaysRegex;
	        }
	    } else {
	        if (!hasOwnProp(this, '_weekdaysRegex')) {
	            this._weekdaysRegex = defaultWeekdaysRegex;
	        }
	        return this._weekdaysStrictRegex && isStrict ?
	            this._weekdaysStrictRegex : this._weekdaysRegex;
	    }
	}
	
	var defaultWeekdaysShortRegex = matchWord;
	function weekdaysShortRegex (isStrict) {
	    if (this._weekdaysParseExact) {
	        if (!hasOwnProp(this, '_weekdaysRegex')) {
	            computeWeekdaysParse.call(this);
	        }
	        if (isStrict) {
	            return this._weekdaysShortStrictRegex;
	        } else {
	            return this._weekdaysShortRegex;
	        }
	    } else {
	        if (!hasOwnProp(this, '_weekdaysShortRegex')) {
	            this._weekdaysShortRegex = defaultWeekdaysShortRegex;
	        }
	        return this._weekdaysShortStrictRegex && isStrict ?
	            this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
	    }
	}
	
	var defaultWeekdaysMinRegex = matchWord;
	function weekdaysMinRegex (isStrict) {
	    if (this._weekdaysParseExact) {
	        if (!hasOwnProp(this, '_weekdaysRegex')) {
	            computeWeekdaysParse.call(this);
	        }
	        if (isStrict) {
	            return this._weekdaysMinStrictRegex;
	        } else {
	            return this._weekdaysMinRegex;
	        }
	    } else {
	        if (!hasOwnProp(this, '_weekdaysMinRegex')) {
	            this._weekdaysMinRegex = defaultWeekdaysMinRegex;
	        }
	        return this._weekdaysMinStrictRegex && isStrict ?
	            this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
	    }
	}
	
	
	function computeWeekdaysParse () {
	    function cmpLenRev(a, b) {
	        return b.length - a.length;
	    }
	
	    var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
	        i, mom, minp, shortp, longp;
	    for (i = 0; i < 7; i++) {
	        // make the regex if we don't have it already
	        mom = createUTC([2000, 1]).day(i);
	        minp = this.weekdaysMin(mom, '');
	        shortp = this.weekdaysShort(mom, '');
	        longp = this.weekdays(mom, '');
	        minPieces.push(minp);
	        shortPieces.push(shortp);
	        longPieces.push(longp);
	        mixedPieces.push(minp);
	        mixedPieces.push(shortp);
	        mixedPieces.push(longp);
	    }
	    // Sorting makes sure if one weekday (or abbr) is a prefix of another it
	    // will match the longer piece.
	    minPieces.sort(cmpLenRev);
	    shortPieces.sort(cmpLenRev);
	    longPieces.sort(cmpLenRev);
	    mixedPieces.sort(cmpLenRev);
	    for (i = 0; i < 7; i++) {
	        shortPieces[i] = regexEscape(shortPieces[i]);
	        longPieces[i] = regexEscape(longPieces[i]);
	        mixedPieces[i] = regexEscape(mixedPieces[i]);
	    }
	
	    this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
	    this._weekdaysShortRegex = this._weekdaysRegex;
	    this._weekdaysMinRegex = this._weekdaysRegex;
	
	    this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
	    this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
	    this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
	}
	
	// FORMATTING
	
	function hFormat() {
	    return this.hours() % 12 || 12;
	}
	
	function kFormat() {
	    return this.hours() || 24;
	}
	
	addFormatToken('H', ['HH', 2], 0, 'hour');
	addFormatToken('h', ['hh', 2], 0, hFormat);
	addFormatToken('k', ['kk', 2], 0, kFormat);
	
	addFormatToken('hmm', 0, 0, function () {
	    return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
	});
	
	addFormatToken('hmmss', 0, 0, function () {
	    return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
	        zeroFill(this.seconds(), 2);
	});
	
	addFormatToken('Hmm', 0, 0, function () {
	    return '' + this.hours() + zeroFill(this.minutes(), 2);
	});
	
	addFormatToken('Hmmss', 0, 0, function () {
	    return '' + this.hours() + zeroFill(this.minutes(), 2) +
	        zeroFill(this.seconds(), 2);
	});
	
	function meridiem (token, lowercase) {
	    addFormatToken(token, 0, 0, function () {
	        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
	    });
	}
	
	meridiem('a', true);
	meridiem('A', false);
	
	// ALIASES
	
	addUnitAlias('hour', 'h');
	
	// PRIORITY
	addUnitPriority('hour', 13);
	
	// PARSING
	
	function matchMeridiem (isStrict, locale) {
	    return locale._meridiemParse;
	}
	
	addRegexToken('a',  matchMeridiem);
	addRegexToken('A',  matchMeridiem);
	addRegexToken('H',  match1to2);
	addRegexToken('h',  match1to2);
	addRegexToken('HH', match1to2, match2);
	addRegexToken('hh', match1to2, match2);
	
	addRegexToken('hmm', match3to4);
	addRegexToken('hmmss', match5to6);
	addRegexToken('Hmm', match3to4);
	addRegexToken('Hmmss', match5to6);
	
	addParseToken(['H', 'HH'], HOUR);
	addParseToken(['a', 'A'], function (input, array, config) {
	    config._isPm = config._locale.isPM(input);
	    config._meridiem = input;
	});
	addParseToken(['h', 'hh'], function (input, array, config) {
	    array[HOUR] = toInt(input);
	    getParsingFlags(config).bigHour = true;
	});
	addParseToken('hmm', function (input, array, config) {
	    var pos = input.length - 2;
	    array[HOUR] = toInt(input.substr(0, pos));
	    array[MINUTE] = toInt(input.substr(pos));
	    getParsingFlags(config).bigHour = true;
	});
	addParseToken('hmmss', function (input, array, config) {
	    var pos1 = input.length - 4;
	    var pos2 = input.length - 2;
	    array[HOUR] = toInt(input.substr(0, pos1));
	    array[MINUTE] = toInt(input.substr(pos1, 2));
	    array[SECOND] = toInt(input.substr(pos2));
	    getParsingFlags(config).bigHour = true;
	});
	addParseToken('Hmm', function (input, array, config) {
	    var pos = input.length - 2;
	    array[HOUR] = toInt(input.substr(0, pos));
	    array[MINUTE] = toInt(input.substr(pos));
	});
	addParseToken('Hmmss', function (input, array, config) {
	    var pos1 = input.length - 4;
	    var pos2 = input.length - 2;
	    array[HOUR] = toInt(input.substr(0, pos1));
	    array[MINUTE] = toInt(input.substr(pos1, 2));
	    array[SECOND] = toInt(input.substr(pos2));
	});
	
	// LOCALES
	
	function localeIsPM (input) {
	    // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
	    // Using charAt should be more compatible.
	    return ((input + '').toLowerCase().charAt(0) === 'p');
	}
	
	var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
	function localeMeridiem (hours, minutes, isLower) {
	    if (hours > 11) {
	        return isLower ? 'pm' : 'PM';
	    } else {
	        return isLower ? 'am' : 'AM';
	    }
	}
	
	
	// MOMENTS
	
	// Setting the hour should keep the time, because the user explicitly
	// specified which hour he wants. So trying to maintain the same hour (in
	// a new timezone) makes sense. Adding/subtracting hours does not follow
	// this rule.
	var getSetHour = makeGetSet('Hours', true);
	
	// months
	// week
	// weekdays
	// meridiem
	var baseConfig = {
	    calendar: defaultCalendar,
	    longDateFormat: defaultLongDateFormat,
	    invalidDate: defaultInvalidDate,
	    ordinal: defaultOrdinal,
	    ordinalParse: defaultOrdinalParse,
	    relativeTime: defaultRelativeTime,
	
	    months: defaultLocaleMonths,
	    monthsShort: defaultLocaleMonthsShort,
	
	    week: defaultLocaleWeek,
	
	    weekdays: defaultLocaleWeekdays,
	    weekdaysMin: defaultLocaleWeekdaysMin,
	    weekdaysShort: defaultLocaleWeekdaysShort,
	
	    meridiemParse: defaultLocaleMeridiemParse
	};
	
	// internal storage for locale config files
	var locales = {};
	var localeFamilies = {};
	var globalLocale;
	
	function normalizeLocale(key) {
	    return key ? key.toLowerCase().replace('_', '-') : key;
	}
	
	// pick the locale from the array
	// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	function chooseLocale(names) {
	    var i = 0, j, next, locale, split;
	
	    while (i < names.length) {
	        split = normalizeLocale(names[i]).split('-');
	        j = split.length;
	        next = normalizeLocale(names[i + 1]);
	        next = next ? next.split('-') : null;
	        while (j > 0) {
	            locale = loadLocale(split.slice(0, j).join('-'));
	            if (locale) {
	                return locale;
	            }
	            if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
	                //the next array item is better than a shallower substring of this one
	                break;
	            }
	            j--;
	        }
	        i++;
	    }
	    return null;
	}
	
	function loadLocale(name) {
	    var oldLocale = null;
	    // TODO: Find a better way to register and load all the locales in Node
	    if (!locales[name] && (typeof module !== 'undefined') &&
	            module && module.exports) {
	        try {
	            oldLocale = globalLocale._abbr;
	            __webpack_require__(5)("./" + name);
	            // because defineLocale currently also sets the global locale, we
	            // want to undo that for lazy loaded locales
	            getSetGlobalLocale(oldLocale);
	        } catch (e) { }
	    }
	    return locales[name];
	}
	
	// This function will load locale and then set the global locale.  If
	// no arguments are passed in, it will simply return the current global
	// locale key.
	function getSetGlobalLocale (key, values) {
	    var data;
	    if (key) {
	        if (isUndefined(values)) {
	            data = getLocale(key);
	        }
	        else {
	            data = defineLocale(key, values);
	        }
	
	        if (data) {
	            // moment.duration._locale = moment._locale = data;
	            globalLocale = data;
	        }
	    }
	
	    return globalLocale._abbr;
	}
	
	function defineLocale (name, config) {
	    if (config !== null) {
	        var parentConfig = baseConfig;
	        config.abbr = name;
	        if (locales[name] != null) {
	            deprecateSimple('defineLocaleOverride',
	                    'use moment.updateLocale(localeName, config) to change ' +
	                    'an existing locale. moment.defineLocale(localeName, ' +
	                    'config) should only be used for creating a new locale ' +
	                    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
	            parentConfig = locales[name]._config;
	        } else if (config.parentLocale != null) {
	            if (locales[config.parentLocale] != null) {
	                parentConfig = locales[config.parentLocale]._config;
	            } else {
	                if (!localeFamilies[config.parentLocale]) {
	                    localeFamilies[config.parentLocale] = [];
	                }
	                localeFamilies[config.parentLocale].push({
	                    name: name,
	                    config: config
	                });
	                return null;
	            }
	        }
	        locales[name] = new Locale(mergeConfigs(parentConfig, config));
	
	        if (localeFamilies[name]) {
	            localeFamilies[name].forEach(function (x) {
	                defineLocale(x.name, x.config);
	            });
	        }
	
	        // backwards compat for now: also set the locale
	        // make sure we set the locale AFTER all child locales have been
	        // created, so we won't end up with the child locale set.
	        getSetGlobalLocale(name);
	
	
	        return locales[name];
	    } else {
	        // useful for testing
	        delete locales[name];
	        return null;
	    }
	}
	
	function updateLocale(name, config) {
	    if (config != null) {
	        var locale, parentConfig = baseConfig;
	        // MERGE
	        if (locales[name] != null) {
	            parentConfig = locales[name]._config;
	        }
	        config = mergeConfigs(parentConfig, config);
	        locale = new Locale(config);
	        locale.parentLocale = locales[name];
	        locales[name] = locale;
	
	        // backwards compat for now: also set the locale
	        getSetGlobalLocale(name);
	    } else {
	        // pass null for config to unupdate, useful for tests
	        if (locales[name] != null) {
	            if (locales[name].parentLocale != null) {
	                locales[name] = locales[name].parentLocale;
	            } else if (locales[name] != null) {
	                delete locales[name];
	            }
	        }
	    }
	    return locales[name];
	}
	
	// returns locale data
	function getLocale (key) {
	    var locale;
	
	    if (key && key._locale && key._locale._abbr) {
	        key = key._locale._abbr;
	    }
	
	    if (!key) {
	        return globalLocale;
	    }
	
	    if (!isArray(key)) {
	        //short-circuit everything else
	        locale = loadLocale(key);
	        if (locale) {
	            return locale;
	        }
	        key = [key];
	    }
	
	    return chooseLocale(key);
	}
	
	function listLocales() {
	    return keys$1(locales);
	}
	
	function checkOverflow (m) {
	    var overflow;
	    var a = m._a;
	
	    if (a && getParsingFlags(m).overflow === -2) {
	        overflow =
	            a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
	            a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
	            a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
	            a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
	            a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
	            a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
	            -1;
	
	        if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
	            overflow = DATE;
	        }
	        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
	            overflow = WEEK;
	        }
	        if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
	            overflow = WEEKDAY;
	        }
	
	        getParsingFlags(m).overflow = overflow;
	    }
	
	    return m;
	}
	
	// iso 8601 regex
	// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
	var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
	var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
	
	var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;
	
	var isoDates = [
	    ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
	    ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
	    ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
	    ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
	    ['YYYY-DDD', /\d{4}-\d{3}/],
	    ['YYYY-MM', /\d{4}-\d\d/, false],
	    ['YYYYYYMMDD', /[+-]\d{10}/],
	    ['YYYYMMDD', /\d{8}/],
	    // YYYYMM is NOT allowed by the standard
	    ['GGGG[W]WWE', /\d{4}W\d{3}/],
	    ['GGGG[W]WW', /\d{4}W\d{2}/, false],
	    ['YYYYDDD', /\d{7}/]
	];
	
	// iso time formats and regexes
	var isoTimes = [
	    ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
	    ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
	    ['HH:mm:ss', /\d\d:\d\d:\d\d/],
	    ['HH:mm', /\d\d:\d\d/],
	    ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
	    ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
	    ['HHmmss', /\d\d\d\d\d\d/],
	    ['HHmm', /\d\d\d\d/],
	    ['HH', /\d\d/]
	];
	
	var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
	
	// date from iso format
	function configFromISO(config) {
	    var i, l,
	        string = config._i,
	        match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
	        allowTime, dateFormat, timeFormat, tzFormat;
	
	    if (match) {
	        getParsingFlags(config).iso = true;
	
	        for (i = 0, l = isoDates.length; i < l; i++) {
	            if (isoDates[i][1].exec(match[1])) {
	                dateFormat = isoDates[i][0];
	                allowTime = isoDates[i][2] !== false;
	                break;
	            }
	        }
	        if (dateFormat == null) {
	            config._isValid = false;
	            return;
	        }
	        if (match[3]) {
	            for (i = 0, l = isoTimes.length; i < l; i++) {
	                if (isoTimes[i][1].exec(match[3])) {
	                    // match[2] should be 'T' or space
	                    timeFormat = (match[2] || ' ') + isoTimes[i][0];
	                    break;
	                }
	            }
	            if (timeFormat == null) {
	                config._isValid = false;
	                return;
	            }
	        }
	        if (!allowTime && timeFormat != null) {
	            config._isValid = false;
	            return;
	        }
	        if (match[4]) {
	            if (tzRegex.exec(match[4])) {
	                tzFormat = 'Z';
	            } else {
	                config._isValid = false;
	                return;
	            }
	        }
	        config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
	        configFromStringAndFormat(config);
	    } else {
	        config._isValid = false;
	    }
	}
	
	// date from iso format or fallback
	function configFromString(config) {
	    var matched = aspNetJsonRegex.exec(config._i);
	
	    if (matched !== null) {
	        config._d = new Date(+matched[1]);
	        return;
	    }
	
	    configFromISO(config);
	    if (config._isValid === false) {
	        delete config._isValid;
	        hooks.createFromInputFallback(config);
	    }
	}
	
	hooks.createFromInputFallback = deprecate(
	    'value provided is not in a recognized ISO format. moment construction falls back to js Date(), ' +
	    'which is not reliable across all browsers and versions. Non ISO date formats are ' +
	    'discouraged and will be removed in an upcoming major release. Please refer to ' +
	    'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
	    function (config) {
	        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
	    }
	);
	
	// Pick the first defined of two or three arguments.
	function defaults(a, b, c) {
	    if (a != null) {
	        return a;
	    }
	    if (b != null) {
	        return b;
	    }
	    return c;
	}
	
	function currentDateArray(config) {
	    // hooks is actually the exported moment object
	    var nowValue = new Date(hooks.now());
	    if (config._useUTC) {
	        return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
	    }
	    return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
	}
	
	// convert an array to a date.
	// the array should mirror the parameters below
	// note: all values past the year are optional and will default to the lowest possible value.
	// [year, month, day , hour, minute, second, millisecond]
	function configFromArray (config) {
	    var i, date, input = [], currentDate, yearToUse;
	
	    if (config._d) {
	        return;
	    }
	
	    currentDate = currentDateArray(config);
	
	    //compute day of the year from weeks and weekdays
	    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
	        dayOfYearFromWeekInfo(config);
	    }
	
	    //if the day of the year is set, figure out what it is
	    if (config._dayOfYear) {
	        yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
	
	        if (config._dayOfYear > daysInYear(yearToUse)) {
	            getParsingFlags(config)._overflowDayOfYear = true;
	        }
	
	        date = createUTCDate(yearToUse, 0, config._dayOfYear);
	        config._a[MONTH] = date.getUTCMonth();
	        config._a[DATE] = date.getUTCDate();
	    }
	
	    // Default to current date.
	    // * if no year, month, day of month are given, default to today
	    // * if day of month is given, default month and year
	    // * if month is given, default only year
	    // * if year is given, don't default anything
	    for (i = 0; i < 3 && config._a[i] == null; ++i) {
	        config._a[i] = input[i] = currentDate[i];
	    }
	
	    // Zero out whatever was not defaulted, including time
	    for (; i < 7; i++) {
	        config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
	    }
	
	    // Check for 24:00:00.000
	    if (config._a[HOUR] === 24 &&
	            config._a[MINUTE] === 0 &&
	            config._a[SECOND] === 0 &&
	            config._a[MILLISECOND] === 0) {
	        config._nextDay = true;
	        config._a[HOUR] = 0;
	    }
	
	    config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
	    // Apply timezone offset from input. The actual utcOffset can be changed
	    // with parseZone.
	    if (config._tzm != null) {
	        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
	    }
	
	    if (config._nextDay) {
	        config._a[HOUR] = 24;
	    }
	}
	
	function dayOfYearFromWeekInfo(config) {
	    var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;
	
	    w = config._w;
	    if (w.GG != null || w.W != null || w.E != null) {
	        dow = 1;
	        doy = 4;
	
	        // TODO: We need to take the current isoWeekYear, but that depends on
	        // how we interpret now (local, utc, fixed offset). So create
	        // a now version of current config (take local/utc/offset flags, and
	        // create now).
	        weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
	        week = defaults(w.W, 1);
	        weekday = defaults(w.E, 1);
	        if (weekday < 1 || weekday > 7) {
	            weekdayOverflow = true;
	        }
	    } else {
	        dow = config._locale._week.dow;
	        doy = config._locale._week.doy;
	
	        var curWeek = weekOfYear(createLocal(), dow, doy);
	
	        weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
	
	        // Default to current week.
	        week = defaults(w.w, curWeek.week);
	
	        if (w.d != null) {
	            // weekday -- low day numbers are considered next week
	            weekday = w.d;
	            if (weekday < 0 || weekday > 6) {
	                weekdayOverflow = true;
	            }
	        } else if (w.e != null) {
	            // local weekday -- counting starts from begining of week
	            weekday = w.e + dow;
	            if (w.e < 0 || w.e > 6) {
	                weekdayOverflow = true;
	            }
	        } else {
	            // default to begining of week
	            weekday = dow;
	        }
	    }
	    if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
	        getParsingFlags(config)._overflowWeeks = true;
	    } else if (weekdayOverflow != null) {
	        getParsingFlags(config)._overflowWeekday = true;
	    } else {
	        temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
	        config._a[YEAR] = temp.year;
	        config._dayOfYear = temp.dayOfYear;
	    }
	}
	
	// constant that refers to the ISO standard
	hooks.ISO_8601 = function () {};
	
	// date from string and format string
	function configFromStringAndFormat(config) {
	    // TODO: Move this to another part of the creation flow to prevent circular deps
	    if (config._f === hooks.ISO_8601) {
	        configFromISO(config);
	        return;
	    }
	
	    config._a = [];
	    getParsingFlags(config).empty = true;
	
	    // This array is used to make a Date, either with `new Date` or `Date.UTC`
	    var string = '' + config._i,
	        i, parsedInput, tokens, token, skipped,
	        stringLength = string.length,
	        totalParsedInputLength = 0;
	
	    tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
	
	    for (i = 0; i < tokens.length; i++) {
	        token = tokens[i];
	        parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
	        // console.log('token', token, 'parsedInput', parsedInput,
	        //         'regex', getParseRegexForToken(token, config));
	        if (parsedInput) {
	            skipped = string.substr(0, string.indexOf(parsedInput));
	            if (skipped.length > 0) {
	                getParsingFlags(config).unusedInput.push(skipped);
	            }
	            string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
	            totalParsedInputLength += parsedInput.length;
	        }
	        // don't parse if it's not a known token
	        if (formatTokenFunctions[token]) {
	            if (parsedInput) {
	                getParsingFlags(config).empty = false;
	            }
	            else {
	                getParsingFlags(config).unusedTokens.push(token);
	            }
	            addTimeToArrayFromToken(token, parsedInput, config);
	        }
	        else if (config._strict && !parsedInput) {
	            getParsingFlags(config).unusedTokens.push(token);
	        }
	    }
	
	    // add remaining unparsed input length to the string
	    getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
	    if (string.length > 0) {
	        getParsingFlags(config).unusedInput.push(string);
	    }
	
	    // clear _12h flag if hour is <= 12
	    if (config._a[HOUR] <= 12 &&
	        getParsingFlags(config).bigHour === true &&
	        config._a[HOUR] > 0) {
	        getParsingFlags(config).bigHour = undefined;
	    }
	
	    getParsingFlags(config).parsedDateParts = config._a.slice(0);
	    getParsingFlags(config).meridiem = config._meridiem;
	    // handle meridiem
	    config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
	
	    configFromArray(config);
	    checkOverflow(config);
	}
	
	
	function meridiemFixWrap (locale, hour, meridiem) {
	    var isPm;
	
	    if (meridiem == null) {
	        // nothing to do
	        return hour;
	    }
	    if (locale.meridiemHour != null) {
	        return locale.meridiemHour(hour, meridiem);
	    } else if (locale.isPM != null) {
	        // Fallback
	        isPm = locale.isPM(meridiem);
	        if (isPm && hour < 12) {
	            hour += 12;
	        }
	        if (!isPm && hour === 12) {
	            hour = 0;
	        }
	        return hour;
	    } else {
	        // this is not supposed to happen
	        return hour;
	    }
	}
	
	// date from string and array of format strings
	function configFromStringAndArray(config) {
	    var tempConfig,
	        bestMoment,
	
	        scoreToBeat,
	        i,
	        currentScore;
	
	    if (config._f.length === 0) {
	        getParsingFlags(config).invalidFormat = true;
	        config._d = new Date(NaN);
	        return;
	    }
	
	    for (i = 0; i < config._f.length; i++) {
	        currentScore = 0;
	        tempConfig = copyConfig({}, config);
	        if (config._useUTC != null) {
	            tempConfig._useUTC = config._useUTC;
	        }
	        tempConfig._f = config._f[i];
	        configFromStringAndFormat(tempConfig);
	
	        if (!isValid(tempConfig)) {
	            continue;
	        }
	
	        // if there is any input that was not parsed add a penalty for that format
	        currentScore += getParsingFlags(tempConfig).charsLeftOver;
	
	        //or tokens
	        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
	
	        getParsingFlags(tempConfig).score = currentScore;
	
	        if (scoreToBeat == null || currentScore < scoreToBeat) {
	            scoreToBeat = currentScore;
	            bestMoment = tempConfig;
	        }
	    }
	
	    extend(config, bestMoment || tempConfig);
	}
	
	function configFromObject(config) {
	    if (config._d) {
	        return;
	    }
	
	    var i = normalizeObjectUnits(config._i);
	    config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
	        return obj && parseInt(obj, 10);
	    });
	
	    configFromArray(config);
	}
	
	function createFromConfig (config) {
	    var res = new Moment(checkOverflow(prepareConfig(config)));
	    if (res._nextDay) {
	        // Adding is smart enough around DST
	        res.add(1, 'd');
	        res._nextDay = undefined;
	    }
	
	    return res;
	}
	
	function prepareConfig (config) {
	    var input = config._i,
	        format = config._f;
	
	    config._locale = config._locale || getLocale(config._l);
	
	    if (input === null || (format === undefined && input === '')) {
	        return createInvalid({nullInput: true});
	    }
	
	    if (typeof input === 'string') {
	        config._i = input = config._locale.preparse(input);
	    }
	
	    if (isMoment(input)) {
	        return new Moment(checkOverflow(input));
	    } else if (isDate(input)) {
	        config._d = input;
	    } else if (isArray(format)) {
	        configFromStringAndArray(config);
	    } else if (format) {
	        configFromStringAndFormat(config);
	    }  else {
	        configFromInput(config);
	    }
	
	    if (!isValid(config)) {
	        config._d = null;
	    }
	
	    return config;
	}
	
	function configFromInput(config) {
	    var input = config._i;
	    if (input === undefined) {
	        config._d = new Date(hooks.now());
	    } else if (isDate(input)) {
	        config._d = new Date(input.valueOf());
	    } else if (typeof input === 'string') {
	        configFromString(config);
	    } else if (isArray(input)) {
	        config._a = map(input.slice(0), function (obj) {
	            return parseInt(obj, 10);
	        });
	        configFromArray(config);
	    } else if (typeof(input) === 'object') {
	        configFromObject(config);
	    } else if (isNumber(input)) {
	        // from milliseconds
	        config._d = new Date(input);
	    } else {
	        hooks.createFromInputFallback(config);
	    }
	}
	
	function createLocalOrUTC (input, format, locale, strict, isUTC) {
	    var c = {};
	
	    if (locale === true || locale === false) {
	        strict = locale;
	        locale = undefined;
	    }
	
	    if ((isObject(input) && isObjectEmpty(input)) ||
	            (isArray(input) && input.length === 0)) {
	        input = undefined;
	    }
	    // object construction must be done this way.
	    // https://github.com/moment/moment/issues/1423
	    c._isAMomentObject = true;
	    c._useUTC = c._isUTC = isUTC;
	    c._l = locale;
	    c._i = input;
	    c._f = format;
	    c._strict = strict;
	
	    return createFromConfig(c);
	}
	
	function createLocal (input, format, locale, strict) {
	    return createLocalOrUTC(input, format, locale, strict, false);
	}
	
	var prototypeMin = deprecate(
	    'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
	    function () {
	        var other = createLocal.apply(null, arguments);
	        if (this.isValid() && other.isValid()) {
	            return other < this ? this : other;
	        } else {
	            return createInvalid();
	        }
	    }
	);
	
	var prototypeMax = deprecate(
	    'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
	    function () {
	        var other = createLocal.apply(null, arguments);
	        if (this.isValid() && other.isValid()) {
	            return other > this ? this : other;
	        } else {
	            return createInvalid();
	        }
	    }
	);
	
	// Pick a moment m from moments so that m[fn](other) is true for all
	// other. This relies on the function fn to be transitive.
	//
	// moments should either be an array of moment objects or an array, whose
	// first element is an array of moment objects.
	function pickBy(fn, moments) {
	    var res, i;
	    if (moments.length === 1 && isArray(moments[0])) {
	        moments = moments[0];
	    }
	    if (!moments.length) {
	        return createLocal();
	    }
	    res = moments[0];
	    for (i = 1; i < moments.length; ++i) {
	        if (!moments[i].isValid() || moments[i][fn](res)) {
	            res = moments[i];
	        }
	    }
	    return res;
	}
	
	// TODO: Use [].sort instead?
	function min () {
	    var args = [].slice.call(arguments, 0);
	
	    return pickBy('isBefore', args);
	}
	
	function max () {
	    var args = [].slice.call(arguments, 0);
	
	    return pickBy('isAfter', args);
	}
	
	var now = function () {
	    return Date.now ? Date.now() : +(new Date());
	};
	
	function Duration (duration) {
	    var normalizedInput = normalizeObjectUnits(duration),
	        years = normalizedInput.year || 0,
	        quarters = normalizedInput.quarter || 0,
	        months = normalizedInput.month || 0,
	        weeks = normalizedInput.week || 0,
	        days = normalizedInput.day || 0,
	        hours = normalizedInput.hour || 0,
	        minutes = normalizedInput.minute || 0,
	        seconds = normalizedInput.second || 0,
	        milliseconds = normalizedInput.millisecond || 0;
	
	    // representation for dateAddRemove
	    this._milliseconds = +milliseconds +
	        seconds * 1e3 + // 1000
	        minutes * 6e4 + // 1000 * 60
	        hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
	    // Because of dateAddRemove treats 24 hours as different from a
	    // day when working around DST, we need to store them separately
	    this._days = +days +
	        weeks * 7;
	    // It is impossible translate months into days without knowing
	    // which months you are are talking about, so we have to store
	    // it separately.
	    this._months = +months +
	        quarters * 3 +
	        years * 12;
	
	    this._data = {};
	
	    this._locale = getLocale();
	
	    this._bubble();
	}
	
	function isDuration (obj) {
	    return obj instanceof Duration;
	}
	
	function absRound (number) {
	    if (number < 0) {
	        return Math.round(-1 * number) * -1;
	    } else {
	        return Math.round(number);
	    }
	}
	
	// FORMATTING
	
	function offset (token, separator) {
	    addFormatToken(token, 0, 0, function () {
	        var offset = this.utcOffset();
	        var sign = '+';
	        if (offset < 0) {
	            offset = -offset;
	            sign = '-';
	        }
	        return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
	    });
	}
	
	offset('Z', ':');
	offset('ZZ', '');
	
	// PARSING
	
	addRegexToken('Z',  matchShortOffset);
	addRegexToken('ZZ', matchShortOffset);
	addParseToken(['Z', 'ZZ'], function (input, array, config) {
	    config._useUTC = true;
	    config._tzm = offsetFromString(matchShortOffset, input);
	});
	
	// HELPERS
	
	// timezone chunker
	// '+10:00' > ['10',  '00']
	// '-1530'  > ['-15', '30']
	var chunkOffset = /([\+\-]|\d\d)/gi;
	
	function offsetFromString(matcher, string) {
	    var matches = (string || '').match(matcher);
	
	    if (matches === null) {
	        return null;
	    }
	
	    var chunk   = matches[matches.length - 1] || [];
	    var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
	    var minutes = +(parts[1] * 60) + toInt(parts[2]);
	
	    return minutes === 0 ?
	      0 :
	      parts[0] === '+' ? minutes : -minutes;
	}
	
	// Return a moment from input, that is local/utc/zone equivalent to model.
	function cloneWithOffset(input, model) {
	    var res, diff;
	    if (model._isUTC) {
	        res = model.clone();
	        diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
	        // Use low-level api, because this fn is low-level api.
	        res._d.setTime(res._d.valueOf() + diff);
	        hooks.updateOffset(res, false);
	        return res;
	    } else {
	        return createLocal(input).local();
	    }
	}
	
	function getDateOffset (m) {
	    // On Firefox.24 Date#getTimezoneOffset returns a floating point.
	    // https://github.com/moment/moment/pull/1871
	    return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
	}
	
	// HOOKS
	
	// This function will be called whenever a moment is mutated.
	// It is intended to keep the offset in sync with the timezone.
	hooks.updateOffset = function () {};
	
	// MOMENTS
	
	// keepLocalTime = true means only change the timezone, without
	// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
	// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
	// +0200, so we adjust the time as needed, to be valid.
	//
	// Keeping the time actually adds/subtracts (one hour)
	// from the actual represented time. That is why we call updateOffset
	// a second time. In case it wants us to change the offset again
	// _changeInProgress == true case, then we have to adjust, because
	// there is no such time in the given timezone.
	function getSetOffset (input, keepLocalTime) {
	    var offset = this._offset || 0,
	        localAdjust;
	    if (!this.isValid()) {
	        return input != null ? this : NaN;
	    }
	    if (input != null) {
	        if (typeof input === 'string') {
	            input = offsetFromString(matchShortOffset, input);
	            if (input === null) {
	                return this;
	            }
	        } else if (Math.abs(input) < 16) {
	            input = input * 60;
	        }
	        if (!this._isUTC && keepLocalTime) {
	            localAdjust = getDateOffset(this);
	        }
	        this._offset = input;
	        this._isUTC = true;
	        if (localAdjust != null) {
	            this.add(localAdjust, 'm');
	        }
	        if (offset !== input) {
	            if (!keepLocalTime || this._changeInProgress) {
	                addSubtract(this, createDuration(input - offset, 'm'), 1, false);
	            } else if (!this._changeInProgress) {
	                this._changeInProgress = true;
	                hooks.updateOffset(this, true);
	                this._changeInProgress = null;
	            }
	        }
	        return this;
	    } else {
	        return this._isUTC ? offset : getDateOffset(this);
	    }
	}
	
	function getSetZone (input, keepLocalTime) {
	    if (input != null) {
	        if (typeof input !== 'string') {
	            input = -input;
	        }
	
	        this.utcOffset(input, keepLocalTime);
	
	        return this;
	    } else {
	        return -this.utcOffset();
	    }
	}
	
	function setOffsetToUTC (keepLocalTime) {
	    return this.utcOffset(0, keepLocalTime);
	}
	
	function setOffsetToLocal (keepLocalTime) {
	    if (this._isUTC) {
	        this.utcOffset(0, keepLocalTime);
	        this._isUTC = false;
	
	        if (keepLocalTime) {
	            this.subtract(getDateOffset(this), 'm');
	        }
	    }
	    return this;
	}
	
	function setOffsetToParsedOffset () {
	    if (this._tzm != null) {
	        this.utcOffset(this._tzm);
	    } else if (typeof this._i === 'string') {
	        var tZone = offsetFromString(matchOffset, this._i);
	        if (tZone != null) {
	            this.utcOffset(tZone);
	        }
	        else {
	            this.utcOffset(0, true);
	        }
	    }
	    return this;
	}
	
	function hasAlignedHourOffset (input) {
	    if (!this.isValid()) {
	        return false;
	    }
	    input = input ? createLocal(input).utcOffset() : 0;
	
	    return (this.utcOffset() - input) % 60 === 0;
	}
	
	function isDaylightSavingTime () {
	    return (
	        this.utcOffset() > this.clone().month(0).utcOffset() ||
	        this.utcOffset() > this.clone().month(5).utcOffset()
	    );
	}
	
	function isDaylightSavingTimeShifted () {
	    if (!isUndefined(this._isDSTShifted)) {
	        return this._isDSTShifted;
	    }
	
	    var c = {};
	
	    copyConfig(c, this);
	    c = prepareConfig(c);
	
	    if (c._a) {
	        var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
	        this._isDSTShifted = this.isValid() &&
	            compareArrays(c._a, other.toArray()) > 0;
	    } else {
	        this._isDSTShifted = false;
	    }
	
	    return this._isDSTShifted;
	}
	
	function isLocal () {
	    return this.isValid() ? !this._isUTC : false;
	}
	
	function isUtcOffset () {
	    return this.isValid() ? this._isUTC : false;
	}
	
	function isUtc () {
	    return this.isValid() ? this._isUTC && this._offset === 0 : false;
	}
	
	// ASP.NET json date format regex
	var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;
	
	// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	// and further modified to allow for strings containing both week and day
	var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;
	
	function createDuration (input, key) {
	    var duration = input,
	        // matching against regexp is expensive, do it on demand
	        match = null,
	        sign,
	        ret,
	        diffRes;
	
	    if (isDuration(input)) {
	        duration = {
	            ms : input._milliseconds,
	            d  : input._days,
	            M  : input._months
	        };
	    } else if (isNumber(input)) {
	        duration = {};
	        if (key) {
	            duration[key] = input;
	        } else {
	            duration.milliseconds = input;
	        }
	    } else if (!!(match = aspNetRegex.exec(input))) {
	        sign = (match[1] === '-') ? -1 : 1;
	        duration = {
	            y  : 0,
	            d  : toInt(match[DATE])                         * sign,
	            h  : toInt(match[HOUR])                         * sign,
	            m  : toInt(match[MINUTE])                       * sign,
	            s  : toInt(match[SECOND])                       * sign,
	            ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
	        };
	    } else if (!!(match = isoRegex.exec(input))) {
	        sign = (match[1] === '-') ? -1 : 1;
	        duration = {
	            y : parseIso(match[2], sign),
	            M : parseIso(match[3], sign),
	            w : parseIso(match[4], sign),
	            d : parseIso(match[5], sign),
	            h : parseIso(match[6], sign),
	            m : parseIso(match[7], sign),
	            s : parseIso(match[8], sign)
	        };
	    } else if (duration == null) {// checks for null or undefined
	        duration = {};
	    } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
	        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
	
	        duration = {};
	        duration.ms = diffRes.milliseconds;
	        duration.M = diffRes.months;
	    }
	
	    ret = new Duration(duration);
	
	    if (isDuration(input) && hasOwnProp(input, '_locale')) {
	        ret._locale = input._locale;
	    }
	
	    return ret;
	}
	
	createDuration.fn = Duration.prototype;
	
	function parseIso (inp, sign) {
	    // We'd normally use ~~inp for this, but unfortunately it also
	    // converts floats to ints.
	    // inp may be undefined, so careful calling replace on it.
	    var res = inp && parseFloat(inp.replace(',', '.'));
	    // apply sign while we're at it
	    return (isNaN(res) ? 0 : res) * sign;
	}
	
	function positiveMomentsDifference(base, other) {
	    var res = {milliseconds: 0, months: 0};
	
	    res.months = other.month() - base.month() +
	        (other.year() - base.year()) * 12;
	    if (base.clone().add(res.months, 'M').isAfter(other)) {
	        --res.months;
	    }
	
	    res.milliseconds = +other - +(base.clone().add(res.months, 'M'));
	
	    return res;
	}
	
	function momentsDifference(base, other) {
	    var res;
	    if (!(base.isValid() && other.isValid())) {
	        return {milliseconds: 0, months: 0};
	    }
	
	    other = cloneWithOffset(other, base);
	    if (base.isBefore(other)) {
	        res = positiveMomentsDifference(base, other);
	    } else {
	        res = positiveMomentsDifference(other, base);
	        res.milliseconds = -res.milliseconds;
	        res.months = -res.months;
	    }
	
	    return res;
	}
	
	// TODO: remove 'name' arg after deprecation is removed
	function createAdder(direction, name) {
	    return function (val, period) {
	        var dur, tmp;
	        //invert the arguments, but complain about it
	        if (period !== null && !isNaN(+period)) {
	            deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
	            'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
	            tmp = val; val = period; period = tmp;
	        }
	
	        val = typeof val === 'string' ? +val : val;
	        dur = createDuration(val, period);
	        addSubtract(this, dur, direction);
	        return this;
	    };
	}
	
	function addSubtract (mom, duration, isAdding, updateOffset) {
	    var milliseconds = duration._milliseconds,
	        days = absRound(duration._days),
	        months = absRound(duration._months);
	
	    if (!mom.isValid()) {
	        // No op
	        return;
	    }
	
	    updateOffset = updateOffset == null ? true : updateOffset;
	
	    if (milliseconds) {
	        mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
	    }
	    if (days) {
	        set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
	    }
	    if (months) {
	        setMonth(mom, get(mom, 'Month') + months * isAdding);
	    }
	    if (updateOffset) {
	        hooks.updateOffset(mom, days || months);
	    }
	}
	
	var add      = createAdder(1, 'add');
	var subtract = createAdder(-1, 'subtract');
	
	function getCalendarFormat(myMoment, now) {
	    var diff = myMoment.diff(now, 'days', true);
	    return diff < -6 ? 'sameElse' :
	            diff < -1 ? 'lastWeek' :
	            diff < 0 ? 'lastDay' :
	            diff < 1 ? 'sameDay' :
	            diff < 2 ? 'nextDay' :
	            diff < 7 ? 'nextWeek' : 'sameElse';
	}
	
	function calendar$1 (time, formats) {
	    // We want to compare the start of today, vs this.
	    // Getting start-of-today depends on whether we're local/utc/offset or not.
	    var now = time || createLocal(),
	        sod = cloneWithOffset(now, this).startOf('day'),
	        format = hooks.calendarFormat(this, sod) || 'sameElse';
	
	    var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);
	
	    return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
	}
	
	function clone () {
	    return new Moment(this);
	}
	
	function isAfter (input, units) {
	    var localInput = isMoment(input) ? input : createLocal(input);
	    if (!(this.isValid() && localInput.isValid())) {
	        return false;
	    }
	    units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
	    if (units === 'millisecond') {
	        return this.valueOf() > localInput.valueOf();
	    } else {
	        return localInput.valueOf() < this.clone().startOf(units).valueOf();
	    }
	}
	
	function isBefore (input, units) {
	    var localInput = isMoment(input) ? input : createLocal(input);
	    if (!(this.isValid() && localInput.isValid())) {
	        return false;
	    }
	    units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
	    if (units === 'millisecond') {
	        return this.valueOf() < localInput.valueOf();
	    } else {
	        return this.clone().endOf(units).valueOf() < localInput.valueOf();
	    }
	}
	
	function isBetween (from, to, units, inclusivity) {
	    inclusivity = inclusivity || '()';
	    return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
	        (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
	}
	
	function isSame (input, units) {
	    var localInput = isMoment(input) ? input : createLocal(input),
	        inputMs;
	    if (!(this.isValid() && localInput.isValid())) {
	        return false;
	    }
	    units = normalizeUnits(units || 'millisecond');
	    if (units === 'millisecond') {
	        return this.valueOf() === localInput.valueOf();
	    } else {
	        inputMs = localInput.valueOf();
	        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
	    }
	}
	
	function isSameOrAfter (input, units) {
	    return this.isSame(input, units) || this.isAfter(input,units);
	}
	
	function isSameOrBefore (input, units) {
	    return this.isSame(input, units) || this.isBefore(input,units);
	}
	
	function diff (input, units, asFloat) {
	    var that,
	        zoneDelta,
	        delta, output;
	
	    if (!this.isValid()) {
	        return NaN;
	    }
	
	    that = cloneWithOffset(input, this);
	
	    if (!that.isValid()) {
	        return NaN;
	    }
	
	    zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;
	
	    units = normalizeUnits(units);
	
	    if (units === 'year' || units === 'month' || units === 'quarter') {
	        output = monthDiff(this, that);
	        if (units === 'quarter') {
	            output = output / 3;
	        } else if (units === 'year') {
	            output = output / 12;
	        }
	    } else {
	        delta = this - that;
	        output = units === 'second' ? delta / 1e3 : // 1000
	            units === 'minute' ? delta / 6e4 : // 1000 * 60
	            units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
	            units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
	            units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
	            delta;
	    }
	    return asFloat ? output : absFloor(output);
	}
	
	function monthDiff (a, b) {
	    // difference in months
	    var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
	        // b is in (anchor - 1 month, anchor + 1 month)
	        anchor = a.clone().add(wholeMonthDiff, 'months'),
	        anchor2, adjust;
	
	    if (b - anchor < 0) {
	        anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
	        // linear across the month
	        adjust = (b - anchor) / (anchor - anchor2);
	    } else {
	        anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
	        // linear across the month
	        adjust = (b - anchor) / (anchor2 - anchor);
	    }
	
	    //check for negative zero, return zero if negative zero
	    return -(wholeMonthDiff + adjust) || 0;
	}
	
	hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
	hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';
	
	function toString () {
	    return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
	}
	
	function toISOString () {
	    var m = this.clone().utc();
	    if (0 < m.year() && m.year() <= 9999) {
	        if (isFunction(Date.prototype.toISOString)) {
	            // native implementation is ~50x faster, use it when we can
	            return this.toDate().toISOString();
	        } else {
	            return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	        }
	    } else {
	        return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	    }
	}
	
	/**
	 * Return a human readable representation of a moment that can
	 * also be evaluated to get a new moment which is the same
	 *
	 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
	 */
	function inspect () {
	    if (!this.isValid()) {
	        return 'moment.invalid(/* ' + this._i + ' */)';
	    }
	    var func = 'moment';
	    var zone = '';
	    if (!this.isLocal()) {
	        func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
	        zone = 'Z';
	    }
	    var prefix = '[' + func + '("]';
	    var year = (0 < this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
	    var datetime = '-MM-DD[T]HH:mm:ss.SSS';
	    var suffix = zone + '[")]';
	
	    return this.format(prefix + year + datetime + suffix);
	}
	
	function format (inputString) {
	    if (!inputString) {
	        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
	    }
	    var output = formatMoment(this, inputString);
	    return this.localeData().postformat(output);
	}
	
	function from (time, withoutSuffix) {
	    if (this.isValid() &&
	            ((isMoment(time) && time.isValid()) ||
	             createLocal(time).isValid())) {
	        return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
	    } else {
	        return this.localeData().invalidDate();
	    }
	}
	
	function fromNow (withoutSuffix) {
	    return this.from(createLocal(), withoutSuffix);
	}
	
	function to (time, withoutSuffix) {
	    if (this.isValid() &&
	            ((isMoment(time) && time.isValid()) ||
	             createLocal(time).isValid())) {
	        return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
	    } else {
	        return this.localeData().invalidDate();
	    }
	}
	
	function toNow (withoutSuffix) {
	    return this.to(createLocal(), withoutSuffix);
	}
	
	// If passed a locale key, it will set the locale for this
	// instance.  Otherwise, it will return the locale configuration
	// variables for this instance.
	function locale (key) {
	    var newLocaleData;
	
	    if (key === undefined) {
	        return this._locale._abbr;
	    } else {
	        newLocaleData = getLocale(key);
	        if (newLocaleData != null) {
	            this._locale = newLocaleData;
	        }
	        return this;
	    }
	}
	
	var lang = deprecate(
	    'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
	    function (key) {
	        if (key === undefined) {
	            return this.localeData();
	        } else {
	            return this.locale(key);
	        }
	    }
	);
	
	function localeData () {
	    return this._locale;
	}
	
	function startOf (units) {
	    units = normalizeUnits(units);
	    // the following switch intentionally omits break keywords
	    // to utilize falling through the cases.
	    switch (units) {
	        case 'year':
	            this.month(0);
	            /* falls through */
	        case 'quarter':
	        case 'month':
	            this.date(1);
	            /* falls through */
	        case 'week':
	        case 'isoWeek':
	        case 'day':
	        case 'date':
	            this.hours(0);
	            /* falls through */
	        case 'hour':
	            this.minutes(0);
	            /* falls through */
	        case 'minute':
	            this.seconds(0);
	            /* falls through */
	        case 'second':
	            this.milliseconds(0);
	    }
	
	    // weeks are a special case
	    if (units === 'week') {
	        this.weekday(0);
	    }
	    if (units === 'isoWeek') {
	        this.isoWeekday(1);
	    }
	
	    // quarters are also special
	    if (units === 'quarter') {
	        this.month(Math.floor(this.month() / 3) * 3);
	    }
	
	    return this;
	}
	
	function endOf (units) {
	    units = normalizeUnits(units);
	    if (units === undefined || units === 'millisecond') {
	        return this;
	    }
	
	    // 'date' is an alias for 'day', so it should be considered as such.
	    if (units === 'date') {
	        units = 'day';
	    }
	
	    return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
	}
	
	function valueOf () {
	    return this._d.valueOf() - ((this._offset || 0) * 60000);
	}
	
	function unix () {
	    return Math.floor(this.valueOf() / 1000);
	}
	
	function toDate () {
	    return new Date(this.valueOf());
	}
	
	function toArray () {
	    var m = this;
	    return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
	}
	
	function toObject () {
	    var m = this;
	    return {
	        years: m.year(),
	        months: m.month(),
	        date: m.date(),
	        hours: m.hours(),
	        minutes: m.minutes(),
	        seconds: m.seconds(),
	        milliseconds: m.milliseconds()
	    };
	}
	
	function toJSON () {
	    // new Date(NaN).toJSON() === null
	    return this.isValid() ? this.toISOString() : null;
	}
	
	function isValid$1 () {
	    return isValid(this);
	}
	
	function parsingFlags () {
	    return extend({}, getParsingFlags(this));
	}
	
	function invalidAt () {
	    return getParsingFlags(this).overflow;
	}
	
	function creationData() {
	    return {
	        input: this._i,
	        format: this._f,
	        locale: this._locale,
	        isUTC: this._isUTC,
	        strict: this._strict
	    };
	}
	
	// FORMATTING
	
	addFormatToken(0, ['gg', 2], 0, function () {
	    return this.weekYear() % 100;
	});
	
	addFormatToken(0, ['GG', 2], 0, function () {
	    return this.isoWeekYear() % 100;
	});
	
	function addWeekYearFormatToken (token, getter) {
	    addFormatToken(0, [token, token.length], 0, getter);
	}
	
	addWeekYearFormatToken('gggg',     'weekYear');
	addWeekYearFormatToken('ggggg',    'weekYear');
	addWeekYearFormatToken('GGGG',  'isoWeekYear');
	addWeekYearFormatToken('GGGGG', 'isoWeekYear');
	
	// ALIASES
	
	addUnitAlias('weekYear', 'gg');
	addUnitAlias('isoWeekYear', 'GG');
	
	// PRIORITY
	
	addUnitPriority('weekYear', 1);
	addUnitPriority('isoWeekYear', 1);
	
	
	// PARSING
	
	addRegexToken('G',      matchSigned);
	addRegexToken('g',      matchSigned);
	addRegexToken('GG',     match1to2, match2);
	addRegexToken('gg',     match1to2, match2);
	addRegexToken('GGGG',   match1to4, match4);
	addRegexToken('gggg',   match1to4, match4);
	addRegexToken('GGGGG',  match1to6, match6);
	addRegexToken('ggggg',  match1to6, match6);
	
	addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
	    week[token.substr(0, 2)] = toInt(input);
	});
	
	addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
	    week[token] = hooks.parseTwoDigitYear(input);
	});
	
	// MOMENTS
	
	function getSetWeekYear (input) {
	    return getSetWeekYearHelper.call(this,
	            input,
	            this.week(),
	            this.weekday(),
	            this.localeData()._week.dow,
	            this.localeData()._week.doy);
	}
	
	function getSetISOWeekYear (input) {
	    return getSetWeekYearHelper.call(this,
	            input, this.isoWeek(), this.isoWeekday(), 1, 4);
	}
	
	function getISOWeeksInYear () {
	    return weeksInYear(this.year(), 1, 4);
	}
	
	function getWeeksInYear () {
	    var weekInfo = this.localeData()._week;
	    return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
	}
	
	function getSetWeekYearHelper(input, week, weekday, dow, doy) {
	    var weeksTarget;
	    if (input == null) {
	        return weekOfYear(this, dow, doy).year;
	    } else {
	        weeksTarget = weeksInYear(input, dow, doy);
	        if (week > weeksTarget) {
	            week = weeksTarget;
	        }
	        return setWeekAll.call(this, input, week, weekday, dow, doy);
	    }
	}
	
	function setWeekAll(weekYear, week, weekday, dow, doy) {
	    var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
	        date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
	
	    this.year(date.getUTCFullYear());
	    this.month(date.getUTCMonth());
	    this.date(date.getUTCDate());
	    return this;
	}
	
	// FORMATTING
	
	addFormatToken('Q', 0, 'Qo', 'quarter');
	
	// ALIASES
	
	addUnitAlias('quarter', 'Q');
	
	// PRIORITY
	
	addUnitPriority('quarter', 7);
	
	// PARSING
	
	addRegexToken('Q', match1);
	addParseToken('Q', function (input, array) {
	    array[MONTH] = (toInt(input) - 1) * 3;
	});
	
	// MOMENTS
	
	function getSetQuarter (input) {
	    return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
	}
	
	// FORMATTING
	
	addFormatToken('D', ['DD', 2], 'Do', 'date');
	
	// ALIASES
	
	addUnitAlias('date', 'D');
	
	// PRIOROITY
	addUnitPriority('date', 9);
	
	// PARSING
	
	addRegexToken('D',  match1to2);
	addRegexToken('DD', match1to2, match2);
	addRegexToken('Do', function (isStrict, locale) {
	    return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
	});
	
	addParseToken(['D', 'DD'], DATE);
	addParseToken('Do', function (input, array) {
	    array[DATE] = toInt(input.match(match1to2)[0], 10);
	});
	
	// MOMENTS
	
	var getSetDayOfMonth = makeGetSet('Date', true);
	
	// FORMATTING
	
	addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');
	
	// ALIASES
	
	addUnitAlias('dayOfYear', 'DDD');
	
	// PRIORITY
	addUnitPriority('dayOfYear', 4);
	
	// PARSING
	
	addRegexToken('DDD',  match1to3);
	addRegexToken('DDDD', match3);
	addParseToken(['DDD', 'DDDD'], function (input, array, config) {
	    config._dayOfYear = toInt(input);
	});
	
	// HELPERS
	
	// MOMENTS
	
	function getSetDayOfYear (input) {
	    var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
	    return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
	}
	
	// FORMATTING
	
	addFormatToken('m', ['mm', 2], 0, 'minute');
	
	// ALIASES
	
	addUnitAlias('minute', 'm');
	
	// PRIORITY
	
	addUnitPriority('minute', 14);
	
	// PARSING
	
	addRegexToken('m',  match1to2);
	addRegexToken('mm', match1to2, match2);
	addParseToken(['m', 'mm'], MINUTE);
	
	// MOMENTS
	
	var getSetMinute = makeGetSet('Minutes', false);
	
	// FORMATTING
	
	addFormatToken('s', ['ss', 2], 0, 'second');
	
	// ALIASES
	
	addUnitAlias('second', 's');
	
	// PRIORITY
	
	addUnitPriority('second', 15);
	
	// PARSING
	
	addRegexToken('s',  match1to2);
	addRegexToken('ss', match1to2, match2);
	addParseToken(['s', 'ss'], SECOND);
	
	// MOMENTS
	
	var getSetSecond = makeGetSet('Seconds', false);
	
	// FORMATTING
	
	addFormatToken('S', 0, 0, function () {
	    return ~~(this.millisecond() / 100);
	});
	
	addFormatToken(0, ['SS', 2], 0, function () {
	    return ~~(this.millisecond() / 10);
	});
	
	addFormatToken(0, ['SSS', 3], 0, 'millisecond');
	addFormatToken(0, ['SSSS', 4], 0, function () {
	    return this.millisecond() * 10;
	});
	addFormatToken(0, ['SSSSS', 5], 0, function () {
	    return this.millisecond() * 100;
	});
	addFormatToken(0, ['SSSSSS', 6], 0, function () {
	    return this.millisecond() * 1000;
	});
	addFormatToken(0, ['SSSSSSS', 7], 0, function () {
	    return this.millisecond() * 10000;
	});
	addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
	    return this.millisecond() * 100000;
	});
	addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
	    return this.millisecond() * 1000000;
	});
	
	
	// ALIASES
	
	addUnitAlias('millisecond', 'ms');
	
	// PRIORITY
	
	addUnitPriority('millisecond', 16);
	
	// PARSING
	
	addRegexToken('S',    match1to3, match1);
	addRegexToken('SS',   match1to3, match2);
	addRegexToken('SSS',  match1to3, match3);
	
	var token;
	for (token = 'SSSS'; token.length <= 9; token += 'S') {
	    addRegexToken(token, matchUnsigned);
	}
	
	function parseMs(input, array) {
	    array[MILLISECOND] = toInt(('0.' + input) * 1000);
	}
	
	for (token = 'S'; token.length <= 9; token += 'S') {
	    addParseToken(token, parseMs);
	}
	// MOMENTS
	
	var getSetMillisecond = makeGetSet('Milliseconds', false);
	
	// FORMATTING
	
	addFormatToken('z',  0, 0, 'zoneAbbr');
	addFormatToken('zz', 0, 0, 'zoneName');
	
	// MOMENTS
	
	function getZoneAbbr () {
	    return this._isUTC ? 'UTC' : '';
	}
	
	function getZoneName () {
	    return this._isUTC ? 'Coordinated Universal Time' : '';
	}
	
	var proto = Moment.prototype;
	
	proto.add               = add;
	proto.calendar          = calendar$1;
	proto.clone             = clone;
	proto.diff              = diff;
	proto.endOf             = endOf;
	proto.format            = format;
	proto.from              = from;
	proto.fromNow           = fromNow;
	proto.to                = to;
	proto.toNow             = toNow;
	proto.get               = stringGet;
	proto.invalidAt         = invalidAt;
	proto.isAfter           = isAfter;
	proto.isBefore          = isBefore;
	proto.isBetween         = isBetween;
	proto.isSame            = isSame;
	proto.isSameOrAfter     = isSameOrAfter;
	proto.isSameOrBefore    = isSameOrBefore;
	proto.isValid           = isValid$1;
	proto.lang              = lang;
	proto.locale            = locale;
	proto.localeData        = localeData;
	proto.max               = prototypeMax;
	proto.min               = prototypeMin;
	proto.parsingFlags      = parsingFlags;
	proto.set               = stringSet;
	proto.startOf           = startOf;
	proto.subtract          = subtract;
	proto.toArray           = toArray;
	proto.toObject          = toObject;
	proto.toDate            = toDate;
	proto.toISOString       = toISOString;
	proto.inspect           = inspect;
	proto.toJSON            = toJSON;
	proto.toString          = toString;
	proto.unix              = unix;
	proto.valueOf           = valueOf;
	proto.creationData      = creationData;
	
	// Year
	proto.year       = getSetYear;
	proto.isLeapYear = getIsLeapYear;
	
	// Week Year
	proto.weekYear    = getSetWeekYear;
	proto.isoWeekYear = getSetISOWeekYear;
	
	// Quarter
	proto.quarter = proto.quarters = getSetQuarter;
	
	// Month
	proto.month       = getSetMonth;
	proto.daysInMonth = getDaysInMonth;
	
	// Week
	proto.week           = proto.weeks        = getSetWeek;
	proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
	proto.weeksInYear    = getWeeksInYear;
	proto.isoWeeksInYear = getISOWeeksInYear;
	
	// Day
	proto.date       = getSetDayOfMonth;
	proto.day        = proto.days             = getSetDayOfWeek;
	proto.weekday    = getSetLocaleDayOfWeek;
	proto.isoWeekday = getSetISODayOfWeek;
	proto.dayOfYear  = getSetDayOfYear;
	
	// Hour
	proto.hour = proto.hours = getSetHour;
	
	// Minute
	proto.minute = proto.minutes = getSetMinute;
	
	// Second
	proto.second = proto.seconds = getSetSecond;
	
	// Millisecond
	proto.millisecond = proto.milliseconds = getSetMillisecond;
	
	// Offset
	proto.utcOffset            = getSetOffset;
	proto.utc                  = setOffsetToUTC;
	proto.local                = setOffsetToLocal;
	proto.parseZone            = setOffsetToParsedOffset;
	proto.hasAlignedHourOffset = hasAlignedHourOffset;
	proto.isDST                = isDaylightSavingTime;
	proto.isLocal              = isLocal;
	proto.isUtcOffset          = isUtcOffset;
	proto.isUtc                = isUtc;
	proto.isUTC                = isUtc;
	
	// Timezone
	proto.zoneAbbr = getZoneAbbr;
	proto.zoneName = getZoneName;
	
	// Deprecations
	proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
	proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
	proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
	proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
	proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);
	
	function createUnix (input) {
	    return createLocal(input * 1000);
	}
	
	function createInZone () {
	    return createLocal.apply(null, arguments).parseZone();
	}
	
	function preParsePostFormat (string) {
	    return string;
	}
	
	var proto$1 = Locale.prototype;
	
	proto$1.calendar        = calendar;
	proto$1.longDateFormat  = longDateFormat;
	proto$1.invalidDate     = invalidDate;
	proto$1.ordinal         = ordinal;
	proto$1.preparse        = preParsePostFormat;
	proto$1.postformat      = preParsePostFormat;
	proto$1.relativeTime    = relativeTime;
	proto$1.pastFuture      = pastFuture;
	proto$1.set             = set;
	
	// Month
	proto$1.months            =        localeMonths;
	proto$1.monthsShort       =        localeMonthsShort;
	proto$1.monthsParse       =        localeMonthsParse;
	proto$1.monthsRegex       = monthsRegex;
	proto$1.monthsShortRegex  = monthsShortRegex;
	
	// Week
	proto$1.week = localeWeek;
	proto$1.firstDayOfYear = localeFirstDayOfYear;
	proto$1.firstDayOfWeek = localeFirstDayOfWeek;
	
	// Day of Week
	proto$1.weekdays       =        localeWeekdays;
	proto$1.weekdaysMin    =        localeWeekdaysMin;
	proto$1.weekdaysShort  =        localeWeekdaysShort;
	proto$1.weekdaysParse  =        localeWeekdaysParse;
	
	proto$1.weekdaysRegex       =        weekdaysRegex;
	proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
	proto$1.weekdaysMinRegex    =        weekdaysMinRegex;
	
	// Hours
	proto$1.isPM = localeIsPM;
	proto$1.meridiem = localeMeridiem;
	
	function get$1 (format, index, field, setter) {
	    var locale = getLocale();
	    var utc = createUTC().set(setter, index);
	    return locale[field](utc, format);
	}
	
	function listMonthsImpl (format, index, field) {
	    if (isNumber(format)) {
	        index = format;
	        format = undefined;
	    }
	
	    format = format || '';
	
	    if (index != null) {
	        return get$1(format, index, field, 'month');
	    }
	
	    var i;
	    var out = [];
	    for (i = 0; i < 12; i++) {
	        out[i] = get$1(format, i, field, 'month');
	    }
	    return out;
	}
	
	// ()
	// (5)
	// (fmt, 5)
	// (fmt)
	// (true)
	// (true, 5)
	// (true, fmt, 5)
	// (true, fmt)
	function listWeekdaysImpl (localeSorted, format, index, field) {
	    if (typeof localeSorted === 'boolean') {
	        if (isNumber(format)) {
	            index = format;
	            format = undefined;
	        }
	
	        format = format || '';
	    } else {
	        format = localeSorted;
	        index = format;
	        localeSorted = false;
	
	        if (isNumber(format)) {
	            index = format;
	            format = undefined;
	        }
	
	        format = format || '';
	    }
	
	    var locale = getLocale(),
	        shift = localeSorted ? locale._week.dow : 0;
	
	    if (index != null) {
	        return get$1(format, (index + shift) % 7, field, 'day');
	    }
	
	    var i;
	    var out = [];
	    for (i = 0; i < 7; i++) {
	        out[i] = get$1(format, (i + shift) % 7, field, 'day');
	    }
	    return out;
	}
	
	function listMonths (format, index) {
	    return listMonthsImpl(format, index, 'months');
	}
	
	function listMonthsShort (format, index) {
	    return listMonthsImpl(format, index, 'monthsShort');
	}
	
	function listWeekdays (localeSorted, format, index) {
	    return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
	}
	
	function listWeekdaysShort (localeSorted, format, index) {
	    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
	}
	
	function listWeekdaysMin (localeSorted, format, index) {
	    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
	}
	
	getSetGlobalLocale('en', {
	    ordinalParse: /\d{1,2}(th|st|nd|rd)/,
	    ordinal : function (number) {
	        var b = number % 10,
	            output = (toInt(number % 100 / 10) === 1) ? 'th' :
	            (b === 1) ? 'st' :
	            (b === 2) ? 'nd' :
	            (b === 3) ? 'rd' : 'th';
	        return number + output;
	    }
	});
	
	// Side effect imports
	hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
	hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);
	
	var mathAbs = Math.abs;
	
	function abs () {
	    var data           = this._data;
	
	    this._milliseconds = mathAbs(this._milliseconds);
	    this._days         = mathAbs(this._days);
	    this._months       = mathAbs(this._months);
	
	    data.milliseconds  = mathAbs(data.milliseconds);
	    data.seconds       = mathAbs(data.seconds);
	    data.minutes       = mathAbs(data.minutes);
	    data.hours         = mathAbs(data.hours);
	    data.months        = mathAbs(data.months);
	    data.years         = mathAbs(data.years);
	
	    return this;
	}
	
	function addSubtract$1 (duration, input, value, direction) {
	    var other = createDuration(input, value);
	
	    duration._milliseconds += direction * other._milliseconds;
	    duration._days         += direction * other._days;
	    duration._months       += direction * other._months;
	
	    return duration._bubble();
	}
	
	// supports only 2.0-style add(1, 's') or add(duration)
	function add$1 (input, value) {
	    return addSubtract$1(this, input, value, 1);
	}
	
	// supports only 2.0-style subtract(1, 's') or subtract(duration)
	function subtract$1 (input, value) {
	    return addSubtract$1(this, input, value, -1);
	}
	
	function absCeil (number) {
	    if (number < 0) {
	        return Math.floor(number);
	    } else {
	        return Math.ceil(number);
	    }
	}
	
	function bubble () {
	    var milliseconds = this._milliseconds;
	    var days         = this._days;
	    var months       = this._months;
	    var data         = this._data;
	    var seconds, minutes, hours, years, monthsFromDays;
	
	    // if we have a mix of positive and negative values, bubble down first
	    // check: https://github.com/moment/moment/issues/2166
	    if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
	            (milliseconds <= 0 && days <= 0 && months <= 0))) {
	        milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
	        days = 0;
	        months = 0;
	    }
	
	    // The following code bubbles up values, see the tests for
	    // examples of what that means.
	    data.milliseconds = milliseconds % 1000;
	
	    seconds           = absFloor(milliseconds / 1000);
	    data.seconds      = seconds % 60;
	
	    minutes           = absFloor(seconds / 60);
	    data.minutes      = minutes % 60;
	
	    hours             = absFloor(minutes / 60);
	    data.hours        = hours % 24;
	
	    days += absFloor(hours / 24);
	
	    // convert days to months
	    monthsFromDays = absFloor(daysToMonths(days));
	    months += monthsFromDays;
	    days -= absCeil(monthsToDays(monthsFromDays));
	
	    // 12 months -> 1 year
	    years = absFloor(months / 12);
	    months %= 12;
	
	    data.days   = days;
	    data.months = months;
	    data.years  = years;
	
	    return this;
	}
	
	function daysToMonths (days) {
	    // 400 years have 146097 days (taking into account leap year rules)
	    // 400 years have 12 months === 4800
	    return days * 4800 / 146097;
	}
	
	function monthsToDays (months) {
	    // the reverse of daysToMonths
	    return months * 146097 / 4800;
	}
	
	function as (units) {
	    var days;
	    var months;
	    var milliseconds = this._milliseconds;
	
	    units = normalizeUnits(units);
	
	    if (units === 'month' || units === 'year') {
	        days   = this._days   + milliseconds / 864e5;
	        months = this._months + daysToMonths(days);
	        return units === 'month' ? months : months / 12;
	    } else {
	        // handle milliseconds separately because of floating point math errors (issue #1867)
	        days = this._days + Math.round(monthsToDays(this._months));
	        switch (units) {
	            case 'week'   : return days / 7     + milliseconds / 6048e5;
	            case 'day'    : return days         + milliseconds / 864e5;
	            case 'hour'   : return days * 24    + milliseconds / 36e5;
	            case 'minute' : return days * 1440  + milliseconds / 6e4;
	            case 'second' : return days * 86400 + milliseconds / 1000;
	            // Math.floor prevents floating point math errors here
	            case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
	            default: throw new Error('Unknown unit ' + units);
	        }
	    }
	}
	
	// TODO: Use this.as('ms')?
	function valueOf$1 () {
	    return (
	        this._milliseconds +
	        this._days * 864e5 +
	        (this._months % 12) * 2592e6 +
	        toInt(this._months / 12) * 31536e6
	    );
	}
	
	function makeAs (alias) {
	    return function () {
	        return this.as(alias);
	    };
	}
	
	var asMilliseconds = makeAs('ms');
	var asSeconds      = makeAs('s');
	var asMinutes      = makeAs('m');
	var asHours        = makeAs('h');
	var asDays         = makeAs('d');
	var asWeeks        = makeAs('w');
	var asMonths       = makeAs('M');
	var asYears        = makeAs('y');
	
	function get$2 (units) {
	    units = normalizeUnits(units);
	    return this[units + 's']();
	}
	
	function makeGetter(name) {
	    return function () {
	        return this._data[name];
	    };
	}
	
	var milliseconds = makeGetter('milliseconds');
	var seconds      = makeGetter('seconds');
	var minutes      = makeGetter('minutes');
	var hours        = makeGetter('hours');
	var days         = makeGetter('days');
	var months       = makeGetter('months');
	var years        = makeGetter('years');
	
	function weeks () {
	    return absFloor(this.days() / 7);
	}
	
	var round = Math.round;
	var thresholds = {
	    s: 45,  // seconds to minute
	    m: 45,  // minutes to hour
	    h: 22,  // hours to day
	    d: 26,  // days to month
	    M: 11   // months to year
	};
	
	// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
	    return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	}
	
	function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
	    var duration = createDuration(posNegDuration).abs();
	    var seconds  = round(duration.as('s'));
	    var minutes  = round(duration.as('m'));
	    var hours    = round(duration.as('h'));
	    var days     = round(duration.as('d'));
	    var months   = round(duration.as('M'));
	    var years    = round(duration.as('y'));
	
	    var a = seconds < thresholds.s && ['s', seconds]  ||
	            minutes <= 1           && ['m']           ||
	            minutes < thresholds.m && ['mm', minutes] ||
	            hours   <= 1           && ['h']           ||
	            hours   < thresholds.h && ['hh', hours]   ||
	            days    <= 1           && ['d']           ||
	            days    < thresholds.d && ['dd', days]    ||
	            months  <= 1           && ['M']           ||
	            months  < thresholds.M && ['MM', months]  ||
	            years   <= 1           && ['y']           || ['yy', years];
	
	    a[2] = withoutSuffix;
	    a[3] = +posNegDuration > 0;
	    a[4] = locale;
	    return substituteTimeAgo.apply(null, a);
	}
	
	// This function allows you to set the rounding function for relative time strings
	function getSetRelativeTimeRounding (roundingFunction) {
	    if (roundingFunction === undefined) {
	        return round;
	    }
	    if (typeof(roundingFunction) === 'function') {
	        round = roundingFunction;
	        return true;
	    }
	    return false;
	}
	
	// This function allows you to set a threshold for relative time strings
	function getSetRelativeTimeThreshold (threshold, limit) {
	    if (thresholds[threshold] === undefined) {
	        return false;
	    }
	    if (limit === undefined) {
	        return thresholds[threshold];
	    }
	    thresholds[threshold] = limit;
	    return true;
	}
	
	function humanize (withSuffix) {
	    var locale = this.localeData();
	    var output = relativeTime$1(this, !withSuffix, locale);
	
	    if (withSuffix) {
	        output = locale.pastFuture(+this, output);
	    }
	
	    return locale.postformat(output);
	}
	
	var abs$1 = Math.abs;
	
	function toISOString$1() {
	    // for ISO strings we do not use the normal bubbling rules:
	    //  * milliseconds bubble up until they become hours
	    //  * days do not bubble at all
	    //  * months bubble up until they become years
	    // This is because there is no context-free conversion between hours and days
	    // (think of clock changes)
	    // and also not between days and months (28-31 days per month)
	    var seconds = abs$1(this._milliseconds) / 1000;
	    var days         = abs$1(this._days);
	    var months       = abs$1(this._months);
	    var minutes, hours, years;
	
	    // 3600 seconds -> 60 minutes -> 1 hour
	    minutes           = absFloor(seconds / 60);
	    hours             = absFloor(minutes / 60);
	    seconds %= 60;
	    minutes %= 60;
	
	    // 12 months -> 1 year
	    years  = absFloor(months / 12);
	    months %= 12;
	
	
	    // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
	    var Y = years;
	    var M = months;
	    var D = days;
	    var h = hours;
	    var m = minutes;
	    var s = seconds;
	    var total = this.asSeconds();
	
	    if (!total) {
	        // this is the same as C#'s (Noda) and python (isodate)...
	        // but not other JS (goog.date)
	        return 'P0D';
	    }
	
	    return (total < 0 ? '-' : '') +
	        'P' +
	        (Y ? Y + 'Y' : '') +
	        (M ? M + 'M' : '') +
	        (D ? D + 'D' : '') +
	        ((h || m || s) ? 'T' : '') +
	        (h ? h + 'H' : '') +
	        (m ? m + 'M' : '') +
	        (s ? s + 'S' : '');
	}
	
	var proto$2 = Duration.prototype;
	
	proto$2.abs            = abs;
	proto$2.add            = add$1;
	proto$2.subtract       = subtract$1;
	proto$2.as             = as;
	proto$2.asMilliseconds = asMilliseconds;
	proto$2.asSeconds      = asSeconds;
	proto$2.asMinutes      = asMinutes;
	proto$2.asHours        = asHours;
	proto$2.asDays         = asDays;
	proto$2.asWeeks        = asWeeks;
	proto$2.asMonths       = asMonths;
	proto$2.asYears        = asYears;
	proto$2.valueOf        = valueOf$1;
	proto$2._bubble        = bubble;
	proto$2.get            = get$2;
	proto$2.milliseconds   = milliseconds;
	proto$2.seconds        = seconds;
	proto$2.minutes        = minutes;
	proto$2.hours          = hours;
	proto$2.days           = days;
	proto$2.weeks          = weeks;
	proto$2.months         = months;
	proto$2.years          = years;
	proto$2.humanize       = humanize;
	proto$2.toISOString    = toISOString$1;
	proto$2.toString       = toISOString$1;
	proto$2.toJSON         = toISOString$1;
	proto$2.locale         = locale;
	proto$2.localeData     = localeData;
	
	// Deprecations
	proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
	proto$2.lang = lang;
	
	// Side effect imports
	
	// FORMATTING
	
	addFormatToken('X', 0, 0, 'unix');
	addFormatToken('x', 0, 0, 'valueOf');
	
	// PARSING
	
	addRegexToken('x', matchSigned);
	addRegexToken('X', matchTimestamp);
	addParseToken('X', function (input, array, config) {
	    config._d = new Date(parseFloat(input, 10) * 1000);
	});
	addParseToken('x', function (input, array, config) {
	    config._d = new Date(toInt(input));
	});
	
	// Side effect imports
	
	
	hooks.version = '2.17.1';
	
	setHookCallback(createLocal);
	
	hooks.fn                    = proto;
	hooks.min                   = min;
	hooks.max                   = max;
	hooks.now                   = now;
	hooks.utc                   = createUTC;
	hooks.unix                  = createUnix;
	hooks.months                = listMonths;
	hooks.isDate                = isDate;
	hooks.locale                = getSetGlobalLocale;
	hooks.invalid               = createInvalid;
	hooks.duration              = createDuration;
	hooks.isMoment              = isMoment;
	hooks.weekdays              = listWeekdays;
	hooks.parseZone             = createInZone;
	hooks.localeData            = getLocale;
	hooks.isDuration            = isDuration;
	hooks.monthsShort           = listMonthsShort;
	hooks.weekdaysMin           = listWeekdaysMin;
	hooks.defineLocale          = defineLocale;
	hooks.updateLocale          = updateLocale;
	hooks.locales               = listLocales;
	hooks.weekdaysShort         = listWeekdaysShort;
	hooks.normalizeUnits        = normalizeUnits;
	hooks.relativeTimeRounding = getSetRelativeTimeRounding;
	hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
	hooks.calendarFormat        = getCalendarFormat;
	hooks.prototype             = proto;
	
	return hooks;
	
	})));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./en-gb": 6,
		"./en-gb.js": 6
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 5;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : English (United Kingdom) [en-gb]
	//! author : Chris Gedrim : https://github.com/chrisgedrim
	
	;(function (global, factory) {
	    true ? factory(__webpack_require__(3)) :
	   typeof define === 'function' && define.amd ? define(['../moment'], factory) :
	   factory(global.moment)
	}(this, (function (moment) { 'use strict';
	
	
	var enGb = moment.defineLocale('en-gb', {
	    months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	    monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	    weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	    weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	    weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	    longDateFormat : {
	        LT : 'HH:mm',
	        LTS : 'HH:mm:ss',
	        L : 'DD/MM/YYYY',
	        LL : 'D MMMM YYYY',
	        LLL : 'D MMMM YYYY HH:mm',
	        LLLL : 'dddd, D MMMM YYYY HH:mm'
	    },
	    calendar : {
	        sameDay : '[Today at] LT',
	        nextDay : '[Tomorrow at] LT',
	        nextWeek : 'dddd [at] LT',
	        lastDay : '[Yesterday at] LT',
	        lastWeek : '[Last] dddd [at] LT',
	        sameElse : 'L'
	    },
	    relativeTime : {
	        future : 'in %s',
	        past : '%s ago',
	        s : 'a few seconds',
	        m : 'a minute',
	        mm : '%d minutes',
	        h : 'an hour',
	        hh : '%d hours',
	        d : 'a day',
	        dd : '%d days',
	        M : 'a month',
	        MM : '%d months',
	        y : 'a year',
	        yy : '%d years'
	    },
	    ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	    ordinal : function (number) {
	        var b = number % 10,
	            output = (~~(number % 100 / 10) === 1) ? 'th' :
	            (b === 1) ? 'st' :
	            (b === 2) ? 'nd' :
	            (b === 3) ? 'rd' : 'th';
	        return number + output;
	    },
	    week : {
	        dow : 1, // Monday is the first day of the week.
	        doy : 4  // The week that contains Jan 4th is the first week of the year.
	    }
	});
	
	return enGb;
	
	})));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/*!
	 * Timekit JavaScript SDK
	 * Version: 1.5.1
	 * http://timekit.io
	 *
	 * Copyright 2015 Timekit, Inc.
	 * The Timekit JavaScript SDK is freely distributable under the MIT license.
	 *
	 */
	var axios = __webpack_require__(8);
	var base64 = __webpack_require__(28);
	var humps = __webpack_require__(29);
	
	function Timekit() {
	
	  /**
	   * Auth variables for login gated API methods
	   * @type {String}
	   */
	  var userEmail;
	  var userToken;
	  var includes = [];
	  var headers = {};
	
	  /**
	   * Default config
	   * @type {Object}
	   */
	  var config = {
	    app: 'demo',
	    apiBaseUrl: 'https://api.timekit.io/',
	    apiVersion: 'v2',
	    convertResponseToCamelcase: false,
	    convertRequestToSnakecase: true
	  };
	
	  /**
	   * Generate base64 string for basic auth purposes
	   * @type {Function}
	   * @return {String}
	   */
	
	  var encodeAuthHeader = function(email, token) {
	    return base64.encode(email + ':' + token);
	  };
	
	  /**
	   * Build absolute URL for API call
	   * @type {Function}
	   * @return {String}
	   */
	  var buildUrl = function(endpoint) {
	    return config.apiBaseUrl + config.apiVersion + endpoint;
	  };
	
	  /**
	   * Root Object that holds methods to expose for API consumption
	   * @type {Object}
	   */
	  var TK = {};
	
	  /**
	   * Prepare and make HTTP request to API
	   * @type {Object}
	   * @return {Promise}
	   */
	  TK.makeRequest = function(args) {
	
	    // construct URL with base, version and endpoint
	    args.url = buildUrl(args.url);
	
	    // add http headers if applicable
	    args.headers = args.headers || headers || {};
	
	    if (!args.headers['Timekit-App']) args.headers['Timekit-App'] = config.app;
	    if (config.inputTimestampFormat) { args.headers['Timekit-InputTimestampFormat'] = config.inputTimestampFormat; }
	    if (config.outputTimestampFormat) { args.headers['Timekit-OutputTimestampFormat'] = config.outputTimestampFormat; }
	    if (config.timezone) { args.headers['Timekit-Timezone'] = config.timezone; }
	
	    // add auth headers if not being overwritten by request/asUser
	    if (!args.headers['Authorization'] && userEmail && userToken) {
	      args.headers['Authorization'] = 'Basic ' + encodeAuthHeader(userEmail, userToken);
	    }
	
	    // reset headers
	    if (Object.keys(headers).length > 0) {
	      headers = {};
	    }
	
	    // add dynamic includes if applicable
	    if (includes && includes.length > 0) {
	      if (args.params === undefined) { args.params = {}; }
	      args.params.include = includes.join();
	      includes = [];
	    }
	
	    // decamelize keys in data objects
	    if (args.data && config.convertRequestToSnakecase) { args.data = humps.decamelizeKeys(args.data); }
	
	    // register response interceptor for data manipulation
	    var interceptor = axios.interceptors.response.use(function (response) {
	      if (response.data && response.data.data) {
	        response.data = response.data.data;
	        if (config.convertResponseToCamelcase) {
	          response.data = humps.camelizeKeys(response.data);
	        }
	      }
	      return response;
	    }, function (error) {
	      return Promise.reject(error);
	    });
	
	    // execute request!
	    var request = axios(args);
	
	    // deregister response interceptor
	    axios.interceptors.response.eject(interceptor);
	
	    return request;
	  };
	
	  /**
	   * Overwrite default config with supplied settings
	   * @type {Function}
	   * @return {Object}
	   */
	  TK.configure = function(custom) {
	    for (var attr in custom) { config[attr] = custom[attr]; }
	    return config;
	  };
	
	  /**
	   * Returns the current config
	   * @type {Function}
	   * @return {Object}
	   */
	  TK.getConfig = function() {
	    return config;
	  };
	
	  /**
	   * Set the active user manually (happens automatically on timekit.auth())
	   * @type {Function}
	   */
	  TK.setUser = function(email, apiToken) {
	    userEmail = email;
	    userToken = apiToken;
	  };
	
	  /**
	   * Returns the current active user
	   * @type {Function}
	   * @return {Object}
	   */
	  TK.getUser = function() {
	    return {
	      email: userEmail,
	      apiToken: userToken
	    };
	  };
	
	  /**
	   * Set the active user temporarily for the next request (fluent/chainable return)
	   * @type {Function}
	   */
	  TK.asUser = function(email, apiToken) {
	    headers['Authorization'] = 'Basic ' + encodeAuthHeader(email, apiToken);
	    return this;
	  };
	
	  /**
	  * Set the timekit app slug temporarily for the next request (fluent/chainable return)
	  * @type {Function}
	  */
	  TK.asApp = function(slug) {
	    headers['Timekit-App'] = slug;
	    return this;
	  };
	
	  /**
	   * Add supplied dynamic includes to the next request (fluent/chainable return)
	   * @type {Function}
	   * @return {Object}
	   */
	  TK.include = function() {
	    includes = Array.prototype.slice.call(arguments);
	    return this;
	  };
	
	  /**
	   * Add supplied headers to the next request (fluent/chainable return)
	   * @type {Function}
	   * @return {Object}
	   */
	  TK.headers = function(data) {
	    for (var attr in data) { headers[attr] = data[attr]; }
	    return this;
	  };
	
	  /**
	   * Get user's connected accounts
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getAccounts = function() {
	
	    return TK.makeRequest({
	      url: '/accounts',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Redirect to the Google signup/login page
	   * @type {Function}
	   * @return {String}
	   */
	  TK.accountGoogleSignup = function(data, shouldAutoRedirect) {
	
	    var url = buildUrl('/accounts/google/signup') + '?Timekit-App=' + config.app + (data && data.callback ? '&callback=' + data.callback : '');
	
	    if(shouldAutoRedirect && window) {
	      window.location.href = url;
	    } else {
	      return url;
	    }
	
	  };
	
	  /**
	   * Get user's Google calendars
	   * @type {Function
	   * @return {Promise}
	   */
	  TK.getAccountGoogleCalendars = function() {
	
	    return TK.makeRequest({
	      url: '/accounts/google/calendars',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Initiate an account sync
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.accountSync = function(data) {
	
	    return TK.makeRequest({
	      url: '/accounts/sync',
	      method: 'get',
	      params: data
	    });
	
	  };
	
	  /**
	   * Initiate an account sync where only calendar models are synced
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.accountSyncCalendars = function(data) {
	
	    return TK.makeRequest({
	      url: '/accounts/sync/calendars',
	      method: 'get',
	      params: data
	    });
	
	  };
	
	  /**
	   * Authenticate a user to retrive API token for future calls
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.auth = function(data) {
	
	    var r = TK.makeRequest({
	      url: '/auth',
	      method: 'post',
	      data: data
	    });
	
	    r.then(function(response) {
	      TK.setUser(response.data.email, response.data.api_token);
	    }).catch(function(){
	      TK.setUser('','');
	    });
	
	    return r;
	
	  };
	
	  /**
	   * Get list of apps
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getApps = function() {
	
	    return TK.makeRequest({
	      url: '/apps',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get settings for a specific app
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getApp = function(data) {
	
	    return TK.makeRequest({
	      url: '/apps/' + data.slug,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Create a new Timekit app
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createApp = function(data) {
	
	    return TK.makeRequest({
	      url: '/apps',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Update settings for a specific app
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.updateApp = function(data) {
	
	    var slug = data.slug;
	    delete data.slug;
	
	    return TK.makeRequest({
	      url: '/apps/' + slug,
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Delete an app
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.deleteApp = function(data) {
	
	    return TK.makeRequest({
	      url: '/apps/' + data.slug,
	      method: 'delete'
	    });
	
	  };
	
	  /**
	   * Get users calendars that are present on Timekit (synced from providers)
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getCalendars = function() {
	
	    return TK.makeRequest({
	      url: '/calendars',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get users calendars that are present on Timekit (synced from providers)
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getCalendar = function(data) {
	
	    return TK.makeRequest({
	      url: '/calendars/' + data.id,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Create a new calendar for current user
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createCalendar = function(data) {
	
	    return TK.makeRequest({
	      url: '/calendars/',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Update a calendar for current user
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.updateCalendar = function(data) {
	
	    var id = data.id;
	    delete data.id;
	
	    return TK.makeRequest({
	      url: '/calendars/' + id,
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Delete a calendar
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.deleteCalendar = function(data) {
	
	    return TK.makeRequest({
	      url: '/calendars/' + data.id,
	      method: 'delete'
	    });
	
	  };
	
	  /**
	   * Get users contacts that are present on Timekit (synced from providers)
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getContacts = function() {
	
	    return TK.makeRequest({
	      url: '/contacts/',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get all user's events
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getEvents = function(data) {
	
	    return TK.makeRequest({
	      url: '/events',
	      method: 'get',
	      params: data
	    });
	
	  };
	
	  /**
	   * Get a user's event by ID
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getEvent = function(data) {
	
	    return TK.makeRequest({
	      url: '/events/' + data.id,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Create a new event
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createEvent = function(data) {
	
	    return TK.makeRequest({
	      url: '/events',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Update an existing event
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.updateEvent = function(data) {
	
	    var id = data.id;
	    delete data.id;
	
	    return TK.makeRequest({
	      url: '/events/' + id,
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Delete a user's event by ID
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.deleteEvent = function(data) {
	
	    return TK.makeRequest({
	      url: '/events/' + data.id,
	      method: 'delete'
	    });
	
	  };
	
	  /**
	   * Get a user's anonymized availability (other user's on Timekit can be queryied by supplying their email)
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getAvailability = function(data) {
	
	    return TK.makeRequest({
	      url: '/events/availability',
	      method: 'get',
	      params: data
	    });
	
	  };
	
	  /**
	   * Find mutual availability across multiple users/calendars
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.findTime = function(data) {
	
	    return TK.makeRequest({
	      url: '/findtime',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Find mutual availability across multiple users/calendars
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.findTimeBulk = function(data) {
	
	    return TK.makeRequest({
	      url: '/findtime/bulk',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Get a user's meetings
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getMeetings = function() {
	
	    return TK.makeRequest({
	      url: '/meetings',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get a user's specific meeting
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getMeeting = function(data) {
	
	    return TK.makeRequest({
	      url: '/meetings/' + data.id,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get a user's specific meeting
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createMeeting = function(data) {
	
	    return TK.makeRequest({
	      url: '/meetings',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Get a user's specific meeting
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.updateMeeting = function(data) {
	
	    var id = data.id;
	    delete data.id;
	
	    return TK.makeRequest({
	      url: '/meetings/' + id,
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Set availability (true/faalse) on a meeting's suggestion
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.setMeetingAvailability = function(data) {
	
	    return TK.makeRequest({
	      url: '/meetings/availability',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Book/finalize the meeting, sending out meeting invites to all participants
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.bookMeeting = function(data) {
	
	    return TK.makeRequest({
	      url: '/meetings/book',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Invite users/emails to a meeting, sending out invite emails to the supplied addresses
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.inviteToMeeting = function(data) {
	
	    var id = data.id;
	    delete data.id;
	
	    return TK.makeRequest({
	      url: '/meetings/' + id + '/invite',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Create a new user with the given properties
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createUser = function(data) {
	
	    return TK.makeRequest({
	      url: '/users',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Fetch current user data from server
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getUserInfo = function() {
	
	    return TK.makeRequest({
	      url: '/users/me',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Fetch current user data from server
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.updateUser = function(data) {
	
	    return TK.makeRequest({
	      url: '/users/me',
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Reset password for a user
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.resetUserPassword = function(data) {
	
	    return TK.makeRequest({
	      url: '/users/resetpassword',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Get a specific users' timezone
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getUserTimezone = function(data) {
	
	    return TK.makeRequest({
	      url: '/users/timezone/' + data.email,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get a user property by key
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getUserProperties = function() {
	
	    return TK.makeRequest({
	      url: '/properties',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get a user property by key
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getUserProperty = function(data) {
	
	    return TK.makeRequest({
	      url: '/properties/' + data.key,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Set or update user properties
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.setUserProperties = function(data) {
	
	    return TK.makeRequest({
	      url: '/properties',
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Get all user auth credentials
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getCredentials = function() {
	
	    return TK.makeRequest({
	      url: '/credentials',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Create a new pair of auth credentials
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createCredential = function(data) {
	
	    return TK.makeRequest({
	      url: '/credentials',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Delete a pair of auth credentials
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.deleteCredential = function(data) {
	
	    return TK.makeRequest({
	      url: '/credentials/' + data.id,
	      method: 'delete'
	    });
	
	  };
	
	  /**
	   * Get all bookings
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getBookings = function() {
	
	    return TK.makeRequest({
	      url: '/bookings',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get specific booking
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getBooking = function(data) {
	
	    return TK.makeRequest({
	      url: '/bookings/' + data.id,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Create a new booking
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createBooking = function(data) {
	
	    return TK.makeRequest({
	      url: '/bookings',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Update an existing booking
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.updateBooking = function(data) {
	
	    var id = data.id;
	    delete data.id;
	
	    var action = data.action;
	    delete data.action;
	
	    return TK.makeRequest({
	      url: '/bookings/' + id + '/' + action,
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Get widgets
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getWidgets = function() {
	
	    return TK.makeRequest({
	      url: '/widgets',
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get a specific widget
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getWidget = function(data) {
	
	    return TK.makeRequest({
	      url: '/widgets/' + data.id,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get public widget by slug
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getHostedWidget = function(data) {
	
	    return TK.makeRequest({
	      url: '/widgets/hosted/' + data.slug,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Get public widget by slug
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.getEmbedWidget = function(data) {
	
	    return TK.makeRequest({
	      url: '/widgets/embed/' + data.id,
	      method: 'get'
	    });
	
	  };
	
	  /**
	   * Create a new widget
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.createWidget = function(data) {
	
	    return TK.makeRequest({
	      url: '/widgets',
	      method: 'post',
	      data: data
	    });
	
	  };
	
	  /**
	   * Update an existing widget
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.updateWidget = function(data) {
	
	    var id = data.id;
	    delete data.id;
	
	    return TK.makeRequest({
	      url: '/widgets/' + id,
	      method: 'put',
	      data: data
	    });
	
	  };
	
	  /**
	   * Delete a widget
	   * @type {Function}
	   * @return {Promise}
	   */
	  TK.deleteWidget = function(data) {
	
	    return TK.makeRequest({
	      url: '/widgets/' + data.id,
	      method: 'delete'
	    });
	
	  };
	
	  return TK;
	
	}
	
	module.exports = new Timekit();


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(9);

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var defaults = __webpack_require__(10);
	var utils = __webpack_require__(11);
	var dispatchRequest = __webpack_require__(13);
	var InterceptorManager = __webpack_require__(23);
	var isAbsoluteURL = __webpack_require__(24);
	var combineURLs = __webpack_require__(25);
	var bind = __webpack_require__(26);
	var transformData = __webpack_require__(18);
	
	function Axios(defaultConfig) {
	  this.defaults = utils.merge({}, defaultConfig);
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}
	
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }
	
	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
	
	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }
	
	  // Don't allow overriding defaults.withCredentials
	  config.withCredentials = config.withCredentials || this.defaults.withCredentials;
	
	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );
	
	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );
	
	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );
	
	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);
	
	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }
	
	  return promise;
	};
	
	var defaultInstance = new Axios(defaults);
	var axios = module.exports = bind(Axios.prototype.request, defaultInstance);
	axios.request = bind(Axios.prototype.request, defaultInstance);
	
	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;
	
	// Expose properties from defaultInstance
	axios.defaults = defaultInstance.defaults;
	axios.interceptors = defaultInstance.interceptors;
	
	// Factory for creating new instances
	axios.create = function create(defaultConfig) {
	  return new Axios(defaultConfig);
	};
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(27);
	
	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	  axios[method] = bind(Axios.prototype[method], defaultInstance);
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	  axios[method] = bind(Axios.prototype[method], defaultInstance);
	});


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	var normalizeHeaderName = __webpack_require__(12);
	
	var PROTECTION_PREFIX = /^\)\]\}',?\n/;
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};
	
	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}
	
	module.exports = {
	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],
	
	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      data = data.replace(PROTECTION_PREFIX, '');
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],
	
	  headers: {
	    common: {
	      'Accept': 'application/json, text/plain, */*'
	    },
	    patch: utils.merge(DEFAULT_CONTENT_TYPE),
	    post: utils.merge(DEFAULT_CONTENT_TYPE),
	    put: utils.merge(DEFAULT_CONTENT_TYPE)
	  },
	
	  timeout: 0,
	
	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',
	
	  maxContentLength: -1,
	
	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};


/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	/*global toString:true*/
	
	// utils is a library of generic helper functions non-specific to axios
	
	var toString = Object.prototype.toString;
	
	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}
	
	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}
	
	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}
	
	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}
	
	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}
	
	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}
	
	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}
	
	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}
	
	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}
	
	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}
	
	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}
	
	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}
	
	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}
	
	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}
	
	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}
	
	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  typeof document.createElement -> undefined
	 */
	function isStandardBrowserEnv() {
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined' &&
	    typeof document.createElement === 'function'
	  );
	}
	
	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }
	
	  // Force an array if not already something iterable
	  if (typeof obj !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }
	
	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}
	
	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }
	
	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}
	
	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  trim: trim
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	/**
	 * Dispatch a request to the server using whichever adapter
	 * is supported by the current environment.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  return new Promise(function executor(resolve, reject) {
	    try {
	      var adapter;
	
	      if (typeof config.adapter === 'function') {
	        // For custom adapter support
	        adapter = config.adapter;
	      } else if (typeof XMLHttpRequest !== 'undefined') {
	        // For browsers use XHR adapter
	        adapter = __webpack_require__(15);
	      } else if (typeof process !== 'undefined') {
	        // For node use HTTP adapter
	        adapter = __webpack_require__(15);
	      }
	
	      if (typeof adapter === 'function') {
	        adapter(resolve, reject, config);
	      }
	    } catch (e) {
	      reject(e);
	    }
	  });
	};
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ },
/* 14 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(11);
	var buildURL = __webpack_require__(16);
	var parseHeaders = __webpack_require__(17);
	var transformData = __webpack_require__(18);
	var isURLSameOrigin = __webpack_require__(19);
	var btoa = (typeof window !== 'undefined' && window.btoa) || __webpack_require__(20);
	var settle = __webpack_require__(21);
	
	module.exports = function xhrAdapter(resolve, reject, config) {
	  var requestData = config.data;
	  var requestHeaders = config.headers;
	
	  if (utils.isFormData(requestData)) {
	    delete requestHeaders['Content-Type']; // Let the browser set it
	  }
	
	  var request = new XMLHttpRequest();
	  var loadEvent = 'onreadystatechange';
	  var xDomain = false;
	
	  // For IE 8/9 CORS support
	  // Only supports POST and GET calls and doesn't returns the response headers.
	  // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	  if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined' && window.XDomainRequest && !('withCredentials' in request) && !isURLSameOrigin(config.url)) {
	    request = new window.XDomainRequest();
	    loadEvent = 'onload';
	    xDomain = true;
	    request.onprogress = function handleProgress() {};
	    request.ontimeout = function handleTimeout() {};
	  }
	
	  // HTTP basic authentication
	  if (config.auth) {
	    var username = config.auth.username || '';
	    var password = config.auth.password || '';
	    requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	  }
	
	  request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);
	
	  // Set the request timeout in MS
	  request.timeout = config.timeout;
	
	  // Listen for ready state
	  request[loadEvent] = function handleLoad() {
	    if (!request || (request.readyState !== 4 && !xDomain)) {
	      return;
	    }
	
	    // The request errored out and we didn't get a response, this will be
	    // handled by onerror instead
	    if (request.status === 0) {
	      return;
	    }
	
	    // Prepare the response
	    var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	    var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	    var response = {
	      data: transformData(
	        responseData,
	        responseHeaders,
	        config.transformResponse
	      ),
	      // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	      status: request.status === 1223 ? 204 : request.status,
	      statusText: request.status === 1223 ? 'No Content' : request.statusText,
	      headers: responseHeaders,
	      config: config,
	      request: request
	    };
	
	    settle(resolve, reject, response);
	
	    // Clean up request
	    request = null;
	  };
	
	  // Handle low level network errors
	  request.onerror = function handleError() {
	    // Real errors are hidden from us by the browser
	    // onerror should only fire if it's a network error
	    reject(new Error('Network Error'));
	
	    // Clean up request
	    request = null;
	  };
	
	  // Handle timeout
	  request.ontimeout = function handleTimeout() {
	    var err = new Error('timeout of ' + config.timeout + 'ms exceeded');
	    err.timeout = config.timeout;
	    err.code = 'ECONNABORTED';
	    reject(err);
	
	    // Clean up request
	    request = null;
	  };
	
	  // Add xsrf header
	  // This is only done if running in a standard browser environment.
	  // Specifically not if we're in a web worker, or react-native.
	  if (utils.isStandardBrowserEnv()) {
	    var cookies = __webpack_require__(22);
	
	    // Add xsrf header
	    var xsrfValue = config.withCredentials || isURLSameOrigin(config.url) ?
	        cookies.read(config.xsrfCookieName) :
	        undefined;
	
	    if (xsrfValue) {
	      requestHeaders[config.xsrfHeaderName] = xsrfValue;
	    }
	  }
	
	  // Add headers to the request
	  if ('setRequestHeader' in request) {
	    utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	      if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	        // Remove Content-Type if data is undefined
	        delete requestHeaders[key];
	      } else {
	        // Otherwise add header to the request
	        request.setRequestHeader(key, val);
	      }
	    });
	  }
	
	  // Add withCredentials to request if needed
	  if (config.withCredentials) {
	    request.withCredentials = true;
	  }
	
	  // Add responseType to request if needed
	  if (config.responseType) {
	    try {
	      request.responseType = config.responseType;
	    } catch (e) {
	      if (request.responseType !== 'json') {
	        throw e;
	      }
	    }
	  }
	
	  // Handle progress if needed
	  if (config.progress) {
	    if (config.method === 'post' || config.method === 'put') {
	      request.upload.addEventListener('progress', config.progress);
	    } else if (config.method === 'get') {
	      request.addEventListener('progress', config.progress);
	    }
	  }
	
	  if (requestData === undefined) {
	    requestData = null;
	  }
	
	  // Send the request
	  request.send(requestData);
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	
	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}
	
	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }
	
	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];
	
	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }
	
	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }
	
	      if (!utils.isArray(val)) {
	        val = [val];
	      }
	
	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });
	
	    serializedParams = parts.join('&');
	  }
	
	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }
	
	  return url;
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	
	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;
	
	  if (!headers) { return parsed; }
	
	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));
	
	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });
	
	  return parsed;
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	
	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });
	
	  return data;
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;
	
	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;
	
	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }
	
	      urlParsingNode.setAttribute('href', href);
	
	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }
	
	    originURL = resolveURL(window.location.href);
	
	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :
	
	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);


/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';
	
	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js
	
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	
	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';
	
	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}
	
	module.exports = btoa;


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(response);
	  }
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));
	
	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }
	
	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }
	
	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }
	
	        if (secure === true) {
	          cookie.push('secure');
	        }
	
	        document.cookie = cookie.join('; ');
	      },
	
	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },
	
	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :
	
	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(11);
	
	function InterceptorManager() {
	  this.handlers = [];
	}
	
	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};
	
	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};
	
	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};
	
	module.exports = InterceptorManager;


/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};


/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
	};


/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
	;(function(root) {
	
		// Detect free variables `exports`.
		var freeExports = typeof exports == 'object' && exports;
	
		// Detect free variable `module`.
		var freeModule = typeof module == 'object' && module &&
			module.exports == freeExports && module;
	
		// Detect free variable `global`, from Node.js or Browserified code, and use
		// it as `root`.
		var freeGlobal = typeof global == 'object' && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
			root = freeGlobal;
		}
	
		/*--------------------------------------------------------------------------*/
	
		var InvalidCharacterError = function(message) {
			this.message = message;
		};
		InvalidCharacterError.prototype = new Error;
		InvalidCharacterError.prototype.name = 'InvalidCharacterError';
	
		var error = function(message) {
			// Note: the error messages used throughout this file match those used by
			// the native `atob`/`btoa` implementation in Chromium.
			throw new InvalidCharacterError(message);
		};
	
		var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		// http://whatwg.org/html/common-microsyntaxes.html#space-character
		var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;
	
		// `decode` is designed to be fully compatible with `atob` as described in the
		// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
		// The optimized base64-decoding algorithm used is based on @atk’s excellent
		// implementation. https://gist.github.com/atk/1020396
		var decode = function(input) {
			input = String(input)
				.replace(REGEX_SPACE_CHARACTERS, '');
			var length = input.length;
			if (length % 4 == 0) {
				input = input.replace(/==?$/, '');
				length = input.length;
			}
			if (
				length % 4 == 1 ||
				// http://whatwg.org/C#alphanumeric-ascii-characters
				/[^+a-zA-Z0-9/]/.test(input)
			) {
				error(
					'Invalid character: the string to be decoded is not correctly encoded.'
				);
			}
			var bitCounter = 0;
			var bitStorage;
			var buffer;
			var output = '';
			var position = -1;
			while (++position < length) {
				buffer = TABLE.indexOf(input.charAt(position));
				bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
				// Unless this is the first of a group of 4 characters…
				if (bitCounter++ % 4) {
					// …convert the first 8 bits to a single ASCII character.
					output += String.fromCharCode(
						0xFF & bitStorage >> (-2 * bitCounter & 6)
					);
				}
			}
			return output;
		};
	
		// `encode` is designed to be fully compatible with `btoa` as described in the
		// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
		var encode = function(input) {
			input = String(input);
			if (/[^\0-\xFF]/.test(input)) {
				// Note: no need to special-case astral symbols here, as surrogates are
				// matched, and the input is supposed to only contain ASCII anyway.
				error(
					'The string to be encoded contains characters outside of the ' +
					'Latin1 range.'
				);
			}
			var padding = input.length % 3;
			var output = '';
			var position = -1;
			var a;
			var b;
			var c;
			var d;
			var buffer;
			// Make sure any padding is handled outside of the loop.
			var length = input.length - padding;
	
			while (++position < length) {
				// Read three bytes, i.e. 24 bits.
				a = input.charCodeAt(position) << 16;
				b = input.charCodeAt(++position) << 8;
				c = input.charCodeAt(++position);
				buffer = a + b + c;
				// Turn the 24 bits into four chunks of 6 bits each, and append the
				// matching character for each of them to the output.
				output += (
					TABLE.charAt(buffer >> 18 & 0x3F) +
					TABLE.charAt(buffer >> 12 & 0x3F) +
					TABLE.charAt(buffer >> 6 & 0x3F) +
					TABLE.charAt(buffer & 0x3F)
				);
			}
	
			if (padding == 2) {
				a = input.charCodeAt(position) << 8;
				b = input.charCodeAt(++position);
				buffer = a + b;
				output += (
					TABLE.charAt(buffer >> 10) +
					TABLE.charAt((buffer >> 4) & 0x3F) +
					TABLE.charAt((buffer << 2) & 0x3F) +
					'='
				);
			} else if (padding == 1) {
				buffer = input.charCodeAt(position);
				output += (
					TABLE.charAt(buffer >> 2) +
					TABLE.charAt((buffer << 4) & 0x3F) +
					'=='
				);
			}
	
			return output;
		};
	
		var base64 = {
			'encode': encode,
			'decode': decode,
			'version': '0.1.0'
		};
	
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return base64;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}	else if (freeExports && !freeExports.nodeType) {
			if (freeModule) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = base64;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (var key in base64) {
					base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.base64 = base64;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module), (function() { return this; }())))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// =========
	// = humps =
	// =========
	// version 0.7.0
	// Underscore-to-camelCase converter (and vice versa)
	// for strings and object keys
	
	// humps is copyright © 2012+ Dom Christie
	// Released under the MIT license.
	
	
	;(function(global) {
	
	  var _processKeys = function(convert, obj, separator, ignoreNumbers) {
	    if(!_isObject(obj) || _isDate(obj) || _isRegExp(obj) || _isBoolean(obj)) {
	      return obj;
	    }
	
	    var output,
	        i = 0,
	        l = 0;
	
	    if(_isArray(obj)) {
	      output = [];
	      for(l=obj.length; i<l; i++) {
	        output.push(_processKeys(convert, obj[i], separator, ignoreNumbers));
	      }
	    }
	    else {
	      output = {};
	      for(var key in obj) {
	        if(obj.hasOwnProperty(key)) {
	          output[convert(key, separator, ignoreNumbers)] = _processKeys(convert, obj[key], separator, ignoreNumbers);
	        }
	      }
	    }
	    return output;
	  };
	
	  // String conversion methods
	
	  var separateWords = function(string, separator, ignoreNumbers) {
	    if (typeof separator === 'undefined') {
	      separator = '_';
	    }
	
	    var regexp = /([a-z])([A-Z0-9])/g;
	
	    if (ignoreNumbers) {
	      regexp = /([a-z])([A-Z])/g;
	    }
	
	    return string.replace(regexp, '$1'+ separator +'$2');
	  };
	
	  var camelize = function(string) {
	    if (_isNumerical(string)) {
	      return string;
	    }
	    string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
	      return chr ? chr.toUpperCase() : '';
	    });
	    // Ensure 1st char is always lowercase
	    return string.substr(0, 1).toLowerCase() + string.substr(1);
	  };
	
	  var pascalize = function(string) {
	    var camelized = camelize(string);
	    // Ensure 1st char is always uppercase
	    return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
	  };
	
	  var decamelize = function(string, separator, ignoreNumbers) {
	    return separateWords(string, separator, ignoreNumbers).toLowerCase();
	  };
	
	  // Utilities
	  // Taken from Underscore.js
	
	  var toString = Object.prototype.toString;
	
	  var _isObject = function(obj) {
	    return obj === Object(obj);
	  };
	  var _isArray = function(obj) {
	    return toString.call(obj) == '[object Array]';
	  };
	  var _isDate = function(obj) {
	    return toString.call(obj) == '[object Date]';
	  };
	  var _isRegExp = function(obj) {
	    return toString.call(obj) == '[object RegExp]';
	  };
	  var _isBoolean = function(obj) {
	    return toString.call(obj) == '[object Boolean]';
	  };
	
	  // Performant way to determine if obj coerces to a number
	  var _isNumerical = function(obj) {
	    obj = obj - 0;
	    return obj === obj;
	  };
	
	  var humps = {
	    camelize: camelize,
	    decamelize: decamelize,
	    pascalize: pascalize,
	    depascalize: decamelize,
	    camelizeKeys: function(object) {
	      return _processKeys(camelize, object);
	    },
	    decamelizeKeys: function(object, separator, ignoreNumbers) {
	      return _processKeys(decamelize, object, separator, ignoreNumbers);
	    },
	    pascalizeKeys: function(object) {
	      return _processKeys(pascalize, object);
	    },
	    depascalizeKeys: function () {
	      return this.decamelizeKeys.apply(this, arguments);
	    }
	  };
	
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (humps), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module !== 'undefined' && module.exports) {
	    module.exports = humps;
	  } else {
	    global.humps = humps;
	  }
	
	})(this);


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//! moment-timezone.js
	//! version : 0.5.10
	//! Copyright (c) JS Foundation and other contributors
	//! license : MIT
	//! github.com/moment/moment-timezone
	
	(function (root, factory) {
		"use strict";
	
		/*global define*/
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(3)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));                 // AMD
		} else if (typeof module === 'object' && module.exports) {
			module.exports = factory(require('moment')); // Node
		} else {
			factory(root.moment);                        // Browser
		}
	}(this, function (moment) {
		"use strict";
	
		// Do not load moment-timezone a second time.
		if (moment.tz !== undefined) {
			logError('Moment Timezone ' + moment.tz.version + ' was already loaded ' + (moment.tz.dataVersion ? 'with data from ' : 'without any data') + moment.tz.dataVersion);
			return moment;
		}
	
		var VERSION = "0.5.10",
			zones = {},
			links = {},
			names = {},
			guesses = {},
			cachedGuess,
	
			momentVersion = moment.version.split('.'),
			major = +momentVersion[0],
			minor = +momentVersion[1];
	
		// Moment.js version check
		if (major < 2 || (major === 2 && minor < 6)) {
			logError('Moment Timezone requires Moment.js >= 2.6.0. You are using Moment.js ' + moment.version + '. See momentjs.com');
		}
	
		/************************************
			Unpacking
		************************************/
	
		function charCodeToInt(charCode) {
			if (charCode > 96) {
				return charCode - 87;
			} else if (charCode > 64) {
				return charCode - 29;
			}
			return charCode - 48;
		}
	
		function unpackBase60(string) {
			var i = 0,
				parts = string.split('.'),
				whole = parts[0],
				fractional = parts[1] || '',
				multiplier = 1,
				num,
				out = 0,
				sign = 1;
	
			// handle negative numbers
			if (string.charCodeAt(0) === 45) {
				i = 1;
				sign = -1;
			}
	
			// handle digits before the decimal
			for (i; i < whole.length; i++) {
				num = charCodeToInt(whole.charCodeAt(i));
				out = 60 * out + num;
			}
	
			// handle digits after the decimal
			for (i = 0; i < fractional.length; i++) {
				multiplier = multiplier / 60;
				num = charCodeToInt(fractional.charCodeAt(i));
				out += num * multiplier;
			}
	
			return out * sign;
		}
	
		function arrayToInt (array) {
			for (var i = 0; i < array.length; i++) {
				array[i] = unpackBase60(array[i]);
			}
		}
	
		function intToUntil (array, length) {
			for (var i = 0; i < length; i++) {
				array[i] = Math.round((array[i - 1] || 0) + (array[i] * 60000)); // minutes to milliseconds
			}
	
			array[length - 1] = Infinity;
		}
	
		function mapIndices (source, indices) {
			var out = [], i;
	
			for (i = 0; i < indices.length; i++) {
				out[i] = source[indices[i]];
			}
	
			return out;
		}
	
		function unpack (string) {
			var data = string.split('|'),
				offsets = data[2].split(' '),
				indices = data[3].split(''),
				untils  = data[4].split(' ');
	
			arrayToInt(offsets);
			arrayToInt(indices);
			arrayToInt(untils);
	
			intToUntil(untils, indices.length);
	
			return {
				name       : data[0],
				abbrs      : mapIndices(data[1].split(' '), indices),
				offsets    : mapIndices(offsets, indices),
				untils     : untils,
				population : data[5] | 0
			};
		}
	
		/************************************
			Zone object
		************************************/
	
		function Zone (packedString) {
			if (packedString) {
				this._set(unpack(packedString));
			}
		}
	
		Zone.prototype = {
			_set : function (unpacked) {
				this.name       = unpacked.name;
				this.abbrs      = unpacked.abbrs;
				this.untils     = unpacked.untils;
				this.offsets    = unpacked.offsets;
				this.population = unpacked.population;
			},
	
			_index : function (timestamp) {
				var target = +timestamp,
					untils = this.untils,
					i;
	
				for (i = 0; i < untils.length; i++) {
					if (target < untils[i]) {
						return i;
					}
				}
			},
	
			parse : function (timestamp) {
				var target  = +timestamp,
					offsets = this.offsets,
					untils  = this.untils,
					max     = untils.length - 1,
					offset, offsetNext, offsetPrev, i;
	
				for (i = 0; i < max; i++) {
					offset     = offsets[i];
					offsetNext = offsets[i + 1];
					offsetPrev = offsets[i ? i - 1 : i];
	
					if (offset < offsetNext && tz.moveAmbiguousForward) {
						offset = offsetNext;
					} else if (offset > offsetPrev && tz.moveInvalidForward) {
						offset = offsetPrev;
					}
	
					if (target < untils[i] - (offset * 60000)) {
						return offsets[i];
					}
				}
	
				return offsets[max];
			},
	
			abbr : function (mom) {
				return this.abbrs[this._index(mom)];
			},
	
			offset : function (mom) {
				return this.offsets[this._index(mom)];
			}
		};
	
		/************************************
			Current Timezone
		************************************/
	
		function OffsetAt(at) {
			var timeString = at.toTimeString();
			var abbr = timeString.match(/\([a-z ]+\)/i);
			if (abbr && abbr[0]) {
				// 17:56:31 GMT-0600 (CST)
				// 17:56:31 GMT-0600 (Central Standard Time)
				abbr = abbr[0].match(/[A-Z]/g);
				abbr = abbr ? abbr.join('') : undefined;
			} else {
				// 17:56:31 CST
				// 17:56:31 GMT+0800 (台北標準時間)
				abbr = timeString.match(/[A-Z]{3,5}/g);
				abbr = abbr ? abbr[0] : undefined;
			}
	
			if (abbr === 'GMT') {
				abbr = undefined;
			}
	
			this.at = +at;
			this.abbr = abbr;
			this.offset = at.getTimezoneOffset();
		}
	
		function ZoneScore(zone) {
			this.zone = zone;
			this.offsetScore = 0;
			this.abbrScore = 0;
		}
	
		ZoneScore.prototype.scoreOffsetAt = function (offsetAt) {
			this.offsetScore += Math.abs(this.zone.offset(offsetAt.at) - offsetAt.offset);
			if (this.zone.abbr(offsetAt.at).replace(/[^A-Z]/g, '') !== offsetAt.abbr) {
				this.abbrScore++;
			}
		};
	
		function findChange(low, high) {
			var mid, diff;
	
			while ((diff = ((high.at - low.at) / 12e4 | 0) * 6e4)) {
				mid = new OffsetAt(new Date(low.at + diff));
				if (mid.offset === low.offset) {
					low = mid;
				} else {
					high = mid;
				}
			}
	
			return low;
		}
	
		function userOffsets() {
			var startYear = new Date().getFullYear() - 2,
				last = new OffsetAt(new Date(startYear, 0, 1)),
				offsets = [last],
				change, next, i;
	
			for (i = 1; i < 48; i++) {
				next = new OffsetAt(new Date(startYear, i, 1));
				if (next.offset !== last.offset) {
					change = findChange(last, next);
					offsets.push(change);
					offsets.push(new OffsetAt(new Date(change.at + 6e4)));
				}
				last = next;
			}
	
			for (i = 0; i < 4; i++) {
				offsets.push(new OffsetAt(new Date(startYear + i, 0, 1)));
				offsets.push(new OffsetAt(new Date(startYear + i, 6, 1)));
			}
	
			return offsets;
		}
	
		function sortZoneScores (a, b) {
			if (a.offsetScore !== b.offsetScore) {
				return a.offsetScore - b.offsetScore;
			}
			if (a.abbrScore !== b.abbrScore) {
				return a.abbrScore - b.abbrScore;
			}
			return b.zone.population - a.zone.population;
		}
	
		function addToGuesses (name, offsets) {
			var i, offset;
			arrayToInt(offsets);
			for (i = 0; i < offsets.length; i++) {
				offset = offsets[i];
				guesses[offset] = guesses[offset] || {};
				guesses[offset][name] = true;
			}
		}
	
		function guessesForUserOffsets (offsets) {
			var offsetsLength = offsets.length,
				filteredGuesses = {},
				out = [],
				i, j, guessesOffset;
	
			for (i = 0; i < offsetsLength; i++) {
				guessesOffset = guesses[offsets[i].offset] || {};
				for (j in guessesOffset) {
					if (guessesOffset.hasOwnProperty(j)) {
						filteredGuesses[j] = true;
					}
				}
			}
	
			for (i in filteredGuesses) {
				if (filteredGuesses.hasOwnProperty(i)) {
					out.push(names[i]);
				}
			}
	
			return out;
		}
	
		function rebuildGuess () {
	
			// use Intl API when available and returning valid time zone
			try {
				var intlName = Intl.DateTimeFormat().resolvedOptions().timeZone;
				if (intlName){
					var name = names[normalizeName(intlName)];
					if (name) {
						return name;
					}
					logError("Moment Timezone found " + intlName + " from the Intl api, but did not have that data loaded.");
				}
			} catch (e) {
				// Intl unavailable, fall back to manual guessing.
			}
	
			var offsets = userOffsets(),
				offsetsLength = offsets.length,
				guesses = guessesForUserOffsets(offsets),
				zoneScores = [],
				zoneScore, i, j;
	
			for (i = 0; i < guesses.length; i++) {
				zoneScore = new ZoneScore(getZone(guesses[i]), offsetsLength);
				for (j = 0; j < offsetsLength; j++) {
					zoneScore.scoreOffsetAt(offsets[j]);
				}
				zoneScores.push(zoneScore);
			}
	
			zoneScores.sort(sortZoneScores);
	
			return zoneScores.length > 0 ? zoneScores[0].zone.name : undefined;
		}
	
		function guess (ignoreCache) {
			if (!cachedGuess || ignoreCache) {
				cachedGuess = rebuildGuess();
			}
			return cachedGuess;
		}
	
		/************************************
			Global Methods
		************************************/
	
		function normalizeName (name) {
			return (name || '').toLowerCase().replace(/\//g, '_');
		}
	
		function addZone (packed) {
			var i, name, split, normalized;
	
			if (typeof packed === "string") {
				packed = [packed];
			}
	
			for (i = 0; i < packed.length; i++) {
				split = packed[i].split('|');
				name = split[0];
				normalized = normalizeName(name);
				zones[normalized] = packed[i];
				names[normalized] = name;
				if (split[5]) {
					addToGuesses(normalized, split[2].split(' '));
				}
			}
		}
	
		function getZone (name, caller) {
			name = normalizeName(name);
	
			var zone = zones[name];
			var link;
	
			if (zone instanceof Zone) {
				return zone;
			}
	
			if (typeof zone === 'string') {
				zone = new Zone(zone);
				zones[name] = zone;
				return zone;
			}
	
			// Pass getZone to prevent recursion more than 1 level deep
			if (links[name] && caller !== getZone && (link = getZone(links[name], getZone))) {
				zone = zones[name] = new Zone();
				zone._set(link);
				zone.name = names[name];
				return zone;
			}
	
			return null;
		}
	
		function getNames () {
			var i, out = [];
	
			for (i in names) {
				if (names.hasOwnProperty(i) && (zones[i] || zones[links[i]]) && names[i]) {
					out.push(names[i]);
				}
			}
	
			return out.sort();
		}
	
		function addLink (aliases) {
			var i, alias, normal0, normal1;
	
			if (typeof aliases === "string") {
				aliases = [aliases];
			}
	
			for (i = 0; i < aliases.length; i++) {
				alias = aliases[i].split('|');
	
				normal0 = normalizeName(alias[0]);
				normal1 = normalizeName(alias[1]);
	
				links[normal0] = normal1;
				names[normal0] = alias[0];
	
				links[normal1] = normal0;
				names[normal1] = alias[1];
			}
		}
	
		function loadData (data) {
			addZone(data.zones);
			addLink(data.links);
			tz.dataVersion = data.version;
		}
	
		function zoneExists (name) {
			if (!zoneExists.didShowError) {
				zoneExists.didShowError = true;
					logError("moment.tz.zoneExists('" + name + "') has been deprecated in favor of !moment.tz.zone('" + name + "')");
			}
			return !!getZone(name);
		}
	
		function needsOffset (m) {
			return !!(m._a && (m._tzm === undefined));
		}
	
		function logError (message) {
			if (typeof console !== 'undefined' && typeof console.error === 'function') {
				console.error(message);
			}
		}
	
		/************************************
			moment.tz namespace
		************************************/
	
		function tz (input) {
			var args = Array.prototype.slice.call(arguments, 0, -1),
				name = arguments[arguments.length - 1],
				zone = getZone(name),
				out  = moment.utc.apply(null, args);
	
			if (zone && !moment.isMoment(input) && needsOffset(out)) {
				out.add(zone.parse(out), 'minutes');
			}
	
			out.tz(name);
	
			return out;
		}
	
		tz.version      = VERSION;
		tz.dataVersion  = '';
		tz._zones       = zones;
		tz._links       = links;
		tz._names       = names;
		tz.add          = addZone;
		tz.link         = addLink;
		tz.load         = loadData;
		tz.zone         = getZone;
		tz.zoneExists   = zoneExists; // deprecated in 0.1.0
		tz.guess        = guess;
		tz.names        = getNames;
		tz.Zone         = Zone;
		tz.unpack       = unpack;
		tz.unpackBase60 = unpackBase60;
		tz.needsOffset  = needsOffset;
		tz.moveInvalidForward   = true;
		tz.moveAmbiguousForward = false;
	
		/************************************
			Interface with Moment.js
		************************************/
	
		var fn = moment.fn;
	
		moment.tz = tz;
	
		moment.defaultZone = null;
	
		moment.updateOffset = function (mom, keepTime) {
			var zone = moment.defaultZone,
				offset;
	
			if (mom._z === undefined) {
				if (zone && needsOffset(mom) && !mom._isUTC) {
					mom._d = moment.utc(mom._a)._d;
					mom.utc().add(zone.parse(mom), 'minutes');
				}
				mom._z = zone;
			}
			if (mom._z) {
				offset = mom._z.offset(mom);
				if (Math.abs(offset) < 16) {
					offset = offset / 60;
				}
				if (mom.utcOffset !== undefined) {
					mom.utcOffset(-offset, keepTime);
				} else {
					mom.zone(offset, keepTime);
				}
			}
		};
	
		fn.tz = function (name) {
			if (name) {
				this._z = getZone(name);
				if (this._z) {
					moment.updateOffset(this);
				} else {
					logError("Moment Timezone has no data for " + name + ". See http://momentjs.com/timezone/docs/#/data-loading/.");
				}
				return this;
			}
			if (this._z) { return this._z.name; }
		};
	
		function abbrWrap (old) {
			return function () {
				if (this._z) { return this._z.abbr(this); }
				return old.call(this);
			};
		}
	
		function resetZoneWrap (old) {
			return function () {
				this._z = null;
				return old.apply(this, arguments);
			};
		}
	
		fn.zoneName = abbrWrap(fn.zoneName);
		fn.zoneAbbr = abbrWrap(fn.zoneAbbr);
		fn.utc      = resetZoneWrap(fn.utc);
	
		moment.tz.setDefault = function(name) {
			if (major < 2 || (major === 2 && minor < 9)) {
				logError('Moment Timezone setDefault() requires Moment.js >= 2.9.0. You are using Moment.js ' + moment.version + '.');
			}
			moment.defaultZone = name ? getZone(name) : null;
			return moment;
		};
	
		// Cloning a moment should include the _z property.
		var momentProperties = moment.momentProperties;
		if (Object.prototype.toString.call(momentProperties) === '[object Array]') {
			// moment 2.8.1+
			momentProperties.push('_z');
			momentProperties.push('_a');
		} else if (momentProperties) {
			// moment 2.7.0
			momentProperties._z = null;
		}
	
		loadData({
			"version": "2016j",
			"zones": [
				"Africa/Abidjan|GMT|0|0||48e5",
				"Africa/Khartoum|EAT|-30|0||51e5",
				"Africa/Algiers|CET|-10|0||26e5",
				"Africa/Lagos|WAT|-10|0||17e6",
				"Africa/Maputo|CAT|-20|0||26e5",
				"Africa/Cairo|EET EEST|-20 -30|010101010|1Cby0 Fb0 c10 8n0 8Nd0 gL0 e10 mn0|15e6",
				"Africa/Casablanca|WET WEST|0 -10|01010101010101010101010101010101010101010|1Cco0 Db0 1zd0 Lz0 1Nf0 wM0 co0 go0 1o00 s00 dA0 vc0 11A0 A00 e00 y00 11A0 uM0 e00 Dc0 11A0 s00 e00 IM0 WM0 mo0 gM0 LA0 WM0 jA0 e00 Rc0 11A0 e00 e00 U00 11A0 8o0 e00 11A0|32e5",
				"Europe/Paris|CET CEST|-10 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|11e6",
				"Africa/Johannesburg|SAST|-20|0||84e5",
				"Africa/Tripoli|EET CET CEST|-20 -10 -20|0120|1IlA0 TA0 1o00|11e5",
				"Africa/Windhoek|WAST WAT|-20 -10|01010101010101010101010|1C1c0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0|32e4",
				"America/Adak|HST HDT|a0 90|01010101010101010101010|1BR00 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|326",
				"America/Anchorage|AKST AKDT|90 80|01010101010101010101010|1BQX0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|30e4",
				"America/Santo_Domingo|AST|40|0||29e5",
				"America/Araguaina|BRT BRST|30 20|010|1IdD0 Lz0|14e4",
				"America/Argentina/Buenos_Aires|ART|30|0|",
				"America/Asuncion|PYST PYT|30 40|01010101010101010101010|1C430 1a10 1fz0 1a10 1fz0 1cN0 17b0 1ip0 17b0 1ip0 17b0 1ip0 19X0 1fB0 19X0 1fB0 19X0 1ip0 17b0 1ip0 17b0 1ip0|28e5",
				"America/Panama|EST|50|0||15e5",
				"America/Bahia|BRT BRST|30 20|010|1FJf0 Rb0|27e5",
				"America/Bahia_Banderas|MST CDT CST|70 50 60|01212121212121212121212|1C1l0 1nW0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|84e3",
				"America/Fortaleza|BRT|30|0||34e5",
				"America/Managua|CST|60|0||22e5",
				"America/Manaus|AMT|40|0||19e5",
				"America/Bogota|COT|50|0||90e5",
				"America/Denver|MST MDT|70 60|01010101010101010101010|1BQV0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|26e5",
				"America/Campo_Grande|AMST AMT|30 40|01010101010101010101010|1BIr0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10|77e4",
				"America/Cancun|CST CDT EST|60 50 50|010101010102|1C1k0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 Dd0|63e4",
				"America/Caracas|VET VET|4u 40|01|1QMT0|29e5",
				"America/Cayenne|GFT|30|0||58e3",
				"America/Chicago|CST CDT|60 50|01010101010101010101010|1BQU0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|92e5",
				"America/Chihuahua|MST MDT|70 60|01010101010101010101010|1C1l0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|81e4",
				"America/Phoenix|MST|70|0||42e5",
				"America/Los_Angeles|PST PDT|80 70|01010101010101010101010|1BQW0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|15e6",
				"America/New_York|EST EDT|50 40|01010101010101010101010|1BQT0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6",
				"America/Rio_Branco|AMT ACT|40 50|01|1KLE0|31e4",
				"America/Fort_Nelson|PST PDT MST|80 70 70|010101010102|1BQW0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0|39e2",
				"America/Halifax|AST ADT|40 30|01010101010101010101010|1BQS0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|39e4",
				"America/Godthab|WGT WGST|30 20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|17e3",
				"America/Goose_Bay|AST ADT|40 30|01010101010101010101010|1BQQ1 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|76e2",
				"America/Grand_Turk|EST EDT AST|50 40 40|0101010101012|1BQT0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|37e2",
				"America/Guayaquil|ECT|50|0||27e5",
				"America/Guyana|GYT|40|0||80e4",
				"America/Havana|CST CDT|50 40|01010101010101010101010|1BQR0 1wo0 U00 1zc0 U00 1qM0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0|21e5",
				"America/La_Paz|BOT|40|0||19e5",
				"America/Lima|PET|50|0||11e6",
				"America/Mexico_City|CST CDT|60 50|01010101010101010101010|1C1k0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|20e6",
				"America/Metlakatla|PST AKST AKDT|80 90 80|012121212121|1PAa0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|14e2",
				"America/Miquelon|PMST PMDT|30 20|01010101010101010101010|1BQR0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|61e2",
				"America/Montevideo|UYST UYT|20 30|010101010101|1BQQ0 1ld0 14n0 1ld0 14n0 1o10 11z0 1o10 11z0 1o10 11z0|17e5",
				"America/Noronha|FNT|20|0||30e2",
				"America/North_Dakota/Beulah|MST MDT CST CDT|70 60 60 50|01232323232323232323232|1BQV0 1zb0 Oo0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0",
				"America/Paramaribo|SRT|30|0||24e4",
				"America/Port-au-Prince|EST EDT|50 40|010101010|1GI70 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|23e5",
				"America/Santiago|CLST CLT|30 40|010101010101010101010|1C1f0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 46n0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0|62e5",
				"America/Sao_Paulo|BRST BRT|20 30|01010101010101010101010|1BIq0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10|20e6",
				"America/Scoresbysund|EGT EGST|10 0|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|452",
				"America/St_Johns|NST NDT|3u 2u|01010101010101010101010|1BQPv 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|11e4",
				"Antarctica/Casey|+11 +08|-b0 -80|01010|1BN30 40P0 KL0 blz0|10",
				"Antarctica/Davis|+05 +07|-50 -70|0101|1BPw0 3Wn0 KN0|70",
				"Antarctica/DumontDUrville|+10|-a0|0||80",
				"Antarctica/Macquarie|AEDT MIST|-b0 -b0|01|1C140|1",
				"Asia/Tashkent|+05|-50|0||23e5",
				"Pacific/Auckland|NZDT NZST|-d0 -c0|01010101010101010101010|1C120 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00|14e5",
				"Antarctica/Rothera|-03|30|0||130",
				"Antarctica/Syowa|+03|-30|0||20",
				"Antarctica/Troll|+00 +02|0 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|40",
				"Asia/Almaty|+06|-60|0||15e5",
				"Asia/Baghdad|AST|-30|0||66e5",
				"Asia/Amman|EET EEST|-20 -30|010101010101010101010|1BVy0 1qM0 11A0 1o00 11A0 4bX0 Dd0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0|25e5",
				"Asia/Kamchatka|+12 +11|-c0 -b0|010|1Dp30 WM0|18e4",
				"Asia/Baku|+04 +05|-40 -50|0101010101010|1BWo0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00|27e5",
				"Asia/Bangkok|ICT|-70|0||15e6",
				"Asia/Barnaul|+06 +07|-60 -70|010101|1BWk0 1qM0 WM0 8Hz0 3rd0",
				"Asia/Beirut|EET EEST|-20 -30|01010101010101010101010|1BWm0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0|22e5",
				"Asia/Brunei|BNT|-80|0||42e4",
				"Asia/Kolkata|IST|-5u|0||15e6",
				"Asia/Chita|+09 +10 +08|-90 -a0 -80|010120|1BWh0 1qM0 WM0 8Hz0 3re0|33e4",
				"Asia/Choibalsan|CHOT CHOST|-80 -90|0101010101010|1O8G0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0|38e3",
				"Asia/Shanghai|CST|-80|0||23e6",
				"Asia/Colombo|+0530|-5u|0||22e5",
				"Asia/Dhaka|BDT|-60|0||16e6",
				"Asia/Damascus|EET EEST|-20 -30|01010101010101010101010|1C0m0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0|26e5",
				"Asia/Dili|TLT|-90|0||19e4",
				"Asia/Dubai|GST|-40|0||39e5",
				"Asia/Famagusta|EET EEST +03|-20 -30 -30|010101010101012|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 15U0",
				"Asia/Gaza|EET EEST|-20 -30|01010101010101010101010|1BVW1 SKX 1xd1 MKX 1AN0 1a00 1fA0 1cL0 1cN0 1nX0 1210 1nz0 1220 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0|18e5",
				"Asia/Hebron|EET EEST|-20 -30|0101010101010101010101010|1BVy0 Tb0 1xd1 MKX bB0 cn0 1cN0 1a00 1fA0 1cL0 1cN0 1nX0 1210 1nz0 1220 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0|25e4",
				"Asia/Hong_Kong|HKT|-80|0||73e5",
				"Asia/Hovd|HOVT HOVST|-70 -80|0101010101010|1O8H0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0|81e3",
				"Asia/Irkutsk|+08 +09|-80 -90|01010|1BWi0 1qM0 WM0 8Hz0|60e4",
				"Europe/Istanbul|EET EEST +03|-20 -30 -30|010101010101012|1BWp0 1qM0 Xc0 1qo0 WM0 1qM0 11A0 1o00 1200 1nA0 11A0 1tA0 U00 15w0|13e6",
				"Asia/Jakarta|WIB|-70|0||31e6",
				"Asia/Jayapura|WIT|-90|0||26e4",
				"Asia/Jerusalem|IST IDT|-20 -30|01010101010101010101010|1BVA0 17X0 1kp0 1dz0 1c10 1aL0 1eN0 1oL0 10N0 1oL0 10N0 1oL0 10N0 1rz0 W10 1rz0 W10 1rz0 10N0 1oL0 10N0 1oL0|81e4",
				"Asia/Kabul|AFT|-4u|0||46e5",
				"Asia/Karachi|PKT|-50|0||24e6",
				"Asia/Urumqi|XJT|-60|0||32e5",
				"Asia/Kathmandu|NPT|-5J|0||12e5",
				"Asia/Khandyga|+10 +11 +09|-a0 -b0 -90|010102|1BWg0 1qM0 WM0 17V0 7zD0|66e2",
				"Asia/Krasnoyarsk|+07 +08|-70 -80|01010|1BWj0 1qM0 WM0 8Hz0|10e5",
				"Asia/Kuala_Lumpur|MYT|-80|0||71e5",
				"Asia/Magadan|+11 +12 +10|-b0 -c0 -a0|010120|1BWf0 1qM0 WM0 8Hz0 3Cq0|95e3",
				"Asia/Makassar|WITA|-80|0||15e5",
				"Asia/Manila|PHT|-80|0||24e6",
				"Europe/Athens|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5",
				"Asia/Novokuznetsk|+07 +06|-70 -60|010|1Dp80 WM0|55e4",
				"Asia/Novosibirsk|+06 +07|-60 -70|010101|1BWk0 1qM0 WM0 8Hz0 4eN0|15e5",
				"Asia/Omsk|+06 +07|-60 -70|01010|1BWk0 1qM0 WM0 8Hz0|12e5",
				"Asia/Pyongyang|KST KST|-90 -8u|01|1P4D0|29e5",
				"Asia/Rangoon|MMT|-6u|0||48e5",
				"Asia/Sakhalin|+10 +11|-a0 -b0|010101|1BWg0 1qM0 WM0 8Hz0 3rd0|58e4",
				"Asia/Seoul|KST|-90|0||23e6",
				"Asia/Singapore|SGT|-80|0||56e5",
				"Asia/Srednekolymsk|+11 +12|-b0 -c0|01010|1BWf0 1qM0 WM0 8Hz0|35e2",
				"Asia/Tbilisi|+04|-40|0||11e5",
				"Asia/Tehran|IRST IRDT|-3u -4u|01010101010101010101010|1BTUu 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0|14e6",
				"Asia/Thimphu|BTT|-60|0||79e3",
				"Asia/Tokyo|JST|-90|0||38e6",
				"Asia/Tomsk|+06 +07|-60 -70|010101|1BWk0 1qM0 WM0 8Hz0 3Qp0|10e5",
				"Asia/Ulaanbaatar|ULAT ULAST|-80 -90|0101010101010|1O8G0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0|12e5",
				"Asia/Ust-Nera|+11 +12 +10|-b0 -c0 -a0|010102|1BWf0 1qM0 WM0 17V0 7zD0|65e2",
				"Asia/Vladivostok|+10 +11|-a0 -b0|01010|1BWg0 1qM0 WM0 8Hz0|60e4",
				"Asia/Yakutsk|+09 +10|-90 -a0|01010|1BWh0 1qM0 WM0 8Hz0|28e4",
				"Asia/Yekaterinburg|+05 +06|-50 -60|01010|1BWl0 1qM0 WM0 8Hz0|14e5",
				"Asia/Yerevan|+04 +05|-40 -50|01010|1BWm0 1qM0 WM0 1qM0|13e5",
				"Atlantic/Azores|AZOT AZOST|10 0|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|25e4",
				"Europe/Lisbon|WET WEST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|27e5",
				"Atlantic/Cape_Verde|CVT|10|0||50e4",
				"Atlantic/South_Georgia|GST|20|0||30",
				"Atlantic/Stanley|FKST FKT|30 40|010|1C6R0 U10|21e2",
				"Australia/Sydney|AEDT AEST|-b0 -a0|01010101010101010101010|1C140 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0|40e5",
				"Australia/Adelaide|ACDT ACST|-au -9u|01010101010101010101010|1C14u 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0|11e5",
				"Australia/Brisbane|AEST|-a0|0||20e5",
				"Australia/Darwin|ACST|-9u|0||12e4",
				"Australia/Eucla|ACWST|-8J|0||368",
				"Australia/Lord_Howe|LHDT LHST|-b0 -au|01010101010101010101010|1C130 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu|347",
				"Australia/Perth|AWST|-80|0||18e5",
				"Pacific/Easter|EASST EAST|50 60|010101010101010101010|1C1f0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 46n0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0|30e2",
				"Europe/Dublin|GMT IST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|12e5",
				"Etc/GMT+1|-01|10|0|",
				"Etc/GMT+10|-10|a0|0|",
				"Etc/GMT+11|-11|b0|0|",
				"Etc/GMT+12|-12|c0|0|",
				"Etc/GMT+2|-02|20|0|",
				"Etc/GMT+4|-04|40|0|",
				"Etc/GMT+5|-05|50|0|",
				"Etc/GMT+6|-06|60|0|",
				"Etc/GMT+7|-07|70|0|",
				"Etc/GMT+8|-08|80|0|",
				"Etc/GMT+9|-09|90|0|",
				"Etc/GMT-1|+01|-10|0|",
				"Etc/GMT-11|+11|-b0|0|",
				"Etc/GMT-12|+12|-c0|0|",
				"Etc/GMT-13|+13|-d0|0|",
				"Etc/GMT-14|+14|-e0|0|",
				"Etc/GMT-2|+02|-20|0|",
				"Etc/GMT-7|+07|-70|0|",
				"Etc/GMT-8|+08|-80|0|",
				"Etc/GMT-9|+09|-90|0|",
				"Etc/UCT|UCT|0|0|",
				"Etc/UTC|UTC|0|0|",
				"Europe/Astrakhan|+03 +04|-30 -40|010101|1BWn0 1qM0 WM0 8Hz0 3rd0",
				"Europe/London|GMT BST|0 -10|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|10e6",
				"Europe/Chisinau|EET EEST|-20 -30|01010101010101010101010|1BWo0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|67e4",
				"Europe/Kaliningrad|EET EEST +03|-20 -30 -30|01020|1BWo0 1qM0 WM0 8Hz0|44e4",
				"Europe/Volgograd|+03 +04|-30 -40|01010|1BWn0 1qM0 WM0 8Hz0|10e5",
				"Europe/Minsk|EET EEST +03|-20 -30 -30|0102|1BWo0 1qM0 WM0|19e5",
				"Europe/Moscow|MSK MSD MSK|-30 -40 -40|01020|1BWn0 1qM0 WM0 8Hz0|16e6",
				"Europe/Samara|+04 +03|-40 -30|010|1Dpb0 WM0|12e5",
				"Europe/Saratov|+03 +04|-30 -40|010101|1BWn0 1qM0 WM0 8Hz0 5810",
				"Europe/Simferopol|EET EEST MSK MSK|-20 -30 -40 -30|01010101023|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11z0 1nW0|33e4",
				"Pacific/Honolulu|HST|a0|0||37e4",
				"Indian/Chagos|IOT|-60|0||30e2",
				"Indian/Christmas|CXT|-70|0||21e2",
				"Indian/Cocos|CCT|-6u|0||596",
				"Indian/Mahe|SCT|-40|0||79e3",
				"Indian/Maldives|MVT|-50|0||35e4",
				"Indian/Mauritius|MUT|-40|0||15e4",
				"Indian/Reunion|RET|-40|0||84e4",
				"Pacific/Majuro|MHT|-c0|0||28e3",
				"MET|MET MEST|-10 -20|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00",
				"Pacific/Chatham|CHADT CHAST|-dJ -cJ|01010101010101010101010|1C120 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00|600",
				"Pacific/Apia|SST SDT WSDT WSST|b0 a0 -e0 -d0|01012323232323232323232|1Dbn0 1ff0 1a00 CI0 AQ0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00|37e3",
				"Pacific/Bougainville|PGT BST|-a0 -b0|01|1NwE0|18e4",
				"Pacific/Chuuk|CHUT|-a0|0||49e3",
				"Pacific/Efate|VUT|-b0|0||66e3",
				"Pacific/Enderbury|PHOT|-d0|0||1",
				"Pacific/Fakaofo|TKT TKT|b0 -d0|01|1Gfn0|483",
				"Pacific/Fiji|FJST FJT|-d0 -c0|01010101010101010101010|1BWe0 1o00 Rc0 1wo0 Ao0 1Nc0 Ao0 1Q00 xz0 1SN0 uM0 1SM0 uM0 1VA0 s00 1VA0 uM0 1SM0 uM0 1SM0 uM0 1SM0|88e4",
				"Pacific/Funafuti|TVT|-c0|0||45e2",
				"Pacific/Galapagos|GALT|60|0||25e3",
				"Pacific/Gambier|GAMT|90|0||125",
				"Pacific/Guadalcanal|SBT|-b0|0||11e4",
				"Pacific/Guam|ChST|-a0|0||17e4",
				"Pacific/Kiritimati|LINT|-e0|0||51e2",
				"Pacific/Kosrae|KOST|-b0|0||66e2",
				"Pacific/Marquesas|MART|9u|0||86e2",
				"Pacific/Pago_Pago|SST|b0|0||37e2",
				"Pacific/Nauru|NRT|-c0|0||10e3",
				"Pacific/Niue|NUT|b0|0||12e2",
				"Pacific/Norfolk|NFT NFT|-bu -b0|01|1PoCu|25e4",
				"Pacific/Noumea|NCT|-b0|0||98e3",
				"Pacific/Palau|PWT|-90|0||21e3",
				"Pacific/Pitcairn|PST|80|0||56",
				"Pacific/Pohnpei|PONT|-b0|0||34e3",
				"Pacific/Port_Moresby|PGT|-a0|0||25e4",
				"Pacific/Rarotonga|CKT|a0|0||13e3",
				"Pacific/Tahiti|TAHT|a0|0||18e4",
				"Pacific/Tarawa|GILT|-c0|0||29e3",
				"Pacific/Tongatapu|+13 +14|-d0 -e0|0101010101|1S4d0 s00 1VA0 uM0 1SM0 uM0 1SM0 uM0 1SM0|75e3",
				"Pacific/Wake|WAKT|-c0|0||16e3",
				"Pacific/Wallis|WFT|-c0|0||94"
			],
			"links": [
				"Africa/Abidjan|Africa/Accra",
				"Africa/Abidjan|Africa/Bamako",
				"Africa/Abidjan|Africa/Banjul",
				"Africa/Abidjan|Africa/Bissau",
				"Africa/Abidjan|Africa/Conakry",
				"Africa/Abidjan|Africa/Dakar",
				"Africa/Abidjan|Africa/Freetown",
				"Africa/Abidjan|Africa/Lome",
				"Africa/Abidjan|Africa/Monrovia",
				"Africa/Abidjan|Africa/Nouakchott",
				"Africa/Abidjan|Africa/Ouagadougou",
				"Africa/Abidjan|Africa/Sao_Tome",
				"Africa/Abidjan|Africa/Timbuktu",
				"Africa/Abidjan|America/Danmarkshavn",
				"Africa/Abidjan|Atlantic/Reykjavik",
				"Africa/Abidjan|Atlantic/St_Helena",
				"Africa/Abidjan|Etc/GMT",
				"Africa/Abidjan|Etc/GMT+0",
				"Africa/Abidjan|Etc/GMT-0",
				"Africa/Abidjan|Etc/GMT0",
				"Africa/Abidjan|Etc/Greenwich",
				"Africa/Abidjan|GMT",
				"Africa/Abidjan|GMT+0",
				"Africa/Abidjan|GMT-0",
				"Africa/Abidjan|GMT0",
				"Africa/Abidjan|Greenwich",
				"Africa/Abidjan|Iceland",
				"Africa/Algiers|Africa/Tunis",
				"Africa/Cairo|Egypt",
				"Africa/Casablanca|Africa/El_Aaiun",
				"Africa/Johannesburg|Africa/Maseru",
				"Africa/Johannesburg|Africa/Mbabane",
				"Africa/Khartoum|Africa/Addis_Ababa",
				"Africa/Khartoum|Africa/Asmara",
				"Africa/Khartoum|Africa/Asmera",
				"Africa/Khartoum|Africa/Dar_es_Salaam",
				"Africa/Khartoum|Africa/Djibouti",
				"Africa/Khartoum|Africa/Juba",
				"Africa/Khartoum|Africa/Kampala",
				"Africa/Khartoum|Africa/Mogadishu",
				"Africa/Khartoum|Africa/Nairobi",
				"Africa/Khartoum|Indian/Antananarivo",
				"Africa/Khartoum|Indian/Comoro",
				"Africa/Khartoum|Indian/Mayotte",
				"Africa/Lagos|Africa/Bangui",
				"Africa/Lagos|Africa/Brazzaville",
				"Africa/Lagos|Africa/Douala",
				"Africa/Lagos|Africa/Kinshasa",
				"Africa/Lagos|Africa/Libreville",
				"Africa/Lagos|Africa/Luanda",
				"Africa/Lagos|Africa/Malabo",
				"Africa/Lagos|Africa/Ndjamena",
				"Africa/Lagos|Africa/Niamey",
				"Africa/Lagos|Africa/Porto-Novo",
				"Africa/Maputo|Africa/Blantyre",
				"Africa/Maputo|Africa/Bujumbura",
				"Africa/Maputo|Africa/Gaborone",
				"Africa/Maputo|Africa/Harare",
				"Africa/Maputo|Africa/Kigali",
				"Africa/Maputo|Africa/Lubumbashi",
				"Africa/Maputo|Africa/Lusaka",
				"Africa/Tripoli|Libya",
				"America/Adak|America/Atka",
				"America/Adak|US/Aleutian",
				"America/Anchorage|America/Juneau",
				"America/Anchorage|America/Nome",
				"America/Anchorage|America/Sitka",
				"America/Anchorage|America/Yakutat",
				"America/Anchorage|US/Alaska",
				"America/Argentina/Buenos_Aires|America/Argentina/Catamarca",
				"America/Argentina/Buenos_Aires|America/Argentina/ComodRivadavia",
				"America/Argentina/Buenos_Aires|America/Argentina/Cordoba",
				"America/Argentina/Buenos_Aires|America/Argentina/Jujuy",
				"America/Argentina/Buenos_Aires|America/Argentina/La_Rioja",
				"America/Argentina/Buenos_Aires|America/Argentina/Mendoza",
				"America/Argentina/Buenos_Aires|America/Argentina/Rio_Gallegos",
				"America/Argentina/Buenos_Aires|America/Argentina/Salta",
				"America/Argentina/Buenos_Aires|America/Argentina/San_Juan",
				"America/Argentina/Buenos_Aires|America/Argentina/San_Luis",
				"America/Argentina/Buenos_Aires|America/Argentina/Tucuman",
				"America/Argentina/Buenos_Aires|America/Argentina/Ushuaia",
				"America/Argentina/Buenos_Aires|America/Buenos_Aires",
				"America/Argentina/Buenos_Aires|America/Catamarca",
				"America/Argentina/Buenos_Aires|America/Cordoba",
				"America/Argentina/Buenos_Aires|America/Jujuy",
				"America/Argentina/Buenos_Aires|America/Mendoza",
				"America/Argentina/Buenos_Aires|America/Rosario",
				"America/Campo_Grande|America/Cuiaba",
				"America/Chicago|America/Indiana/Knox",
				"America/Chicago|America/Indiana/Tell_City",
				"America/Chicago|America/Knox_IN",
				"America/Chicago|America/Matamoros",
				"America/Chicago|America/Menominee",
				"America/Chicago|America/North_Dakota/Center",
				"America/Chicago|America/North_Dakota/New_Salem",
				"America/Chicago|America/Rainy_River",
				"America/Chicago|America/Rankin_Inlet",
				"America/Chicago|America/Resolute",
				"America/Chicago|America/Winnipeg",
				"America/Chicago|CST6CDT",
				"America/Chicago|Canada/Central",
				"America/Chicago|US/Central",
				"America/Chicago|US/Indiana-Starke",
				"America/Chihuahua|America/Mazatlan",
				"America/Chihuahua|Mexico/BajaSur",
				"America/Denver|America/Boise",
				"America/Denver|America/Cambridge_Bay",
				"America/Denver|America/Edmonton",
				"America/Denver|America/Inuvik",
				"America/Denver|America/Ojinaga",
				"America/Denver|America/Shiprock",
				"America/Denver|America/Yellowknife",
				"America/Denver|Canada/Mountain",
				"America/Denver|MST7MDT",
				"America/Denver|Navajo",
				"America/Denver|US/Mountain",
				"America/Fortaleza|America/Belem",
				"America/Fortaleza|America/Maceio",
				"America/Fortaleza|America/Recife",
				"America/Fortaleza|America/Santarem",
				"America/Halifax|America/Glace_Bay",
				"America/Halifax|America/Moncton",
				"America/Halifax|America/Thule",
				"America/Halifax|Atlantic/Bermuda",
				"America/Halifax|Canada/Atlantic",
				"America/Havana|Cuba",
				"America/Los_Angeles|America/Dawson",
				"America/Los_Angeles|America/Ensenada",
				"America/Los_Angeles|America/Santa_Isabel",
				"America/Los_Angeles|America/Tijuana",
				"America/Los_Angeles|America/Vancouver",
				"America/Los_Angeles|America/Whitehorse",
				"America/Los_Angeles|Canada/Pacific",
				"America/Los_Angeles|Canada/Yukon",
				"America/Los_Angeles|Mexico/BajaNorte",
				"America/Los_Angeles|PST8PDT",
				"America/Los_Angeles|US/Pacific",
				"America/Los_Angeles|US/Pacific-New",
				"America/Managua|America/Belize",
				"America/Managua|America/Costa_Rica",
				"America/Managua|America/El_Salvador",
				"America/Managua|America/Guatemala",
				"America/Managua|America/Regina",
				"America/Managua|America/Swift_Current",
				"America/Managua|America/Tegucigalpa",
				"America/Managua|Canada/East-Saskatchewan",
				"America/Managua|Canada/Saskatchewan",
				"America/Manaus|America/Boa_Vista",
				"America/Manaus|America/Porto_Velho",
				"America/Manaus|Brazil/West",
				"America/Mexico_City|America/Merida",
				"America/Mexico_City|America/Monterrey",
				"America/Mexico_City|Mexico/General",
				"America/New_York|America/Detroit",
				"America/New_York|America/Fort_Wayne",
				"America/New_York|America/Indiana/Indianapolis",
				"America/New_York|America/Indiana/Marengo",
				"America/New_York|America/Indiana/Petersburg",
				"America/New_York|America/Indiana/Vevay",
				"America/New_York|America/Indiana/Vincennes",
				"America/New_York|America/Indiana/Winamac",
				"America/New_York|America/Indianapolis",
				"America/New_York|America/Iqaluit",
				"America/New_York|America/Kentucky/Louisville",
				"America/New_York|America/Kentucky/Monticello",
				"America/New_York|America/Louisville",
				"America/New_York|America/Montreal",
				"America/New_York|America/Nassau",
				"America/New_York|America/Nipigon",
				"America/New_York|America/Pangnirtung",
				"America/New_York|America/Thunder_Bay",
				"America/New_York|America/Toronto",
				"America/New_York|Canada/Eastern",
				"America/New_York|EST5EDT",
				"America/New_York|US/East-Indiana",
				"America/New_York|US/Eastern",
				"America/New_York|US/Michigan",
				"America/Noronha|Brazil/DeNoronha",
				"America/Panama|America/Atikokan",
				"America/Panama|America/Cayman",
				"America/Panama|America/Coral_Harbour",
				"America/Panama|America/Jamaica",
				"America/Panama|EST",
				"America/Panama|Jamaica",
				"America/Phoenix|America/Creston",
				"America/Phoenix|America/Dawson_Creek",
				"America/Phoenix|America/Hermosillo",
				"America/Phoenix|MST",
				"America/Phoenix|US/Arizona",
				"America/Rio_Branco|America/Eirunepe",
				"America/Rio_Branco|America/Porto_Acre",
				"America/Rio_Branco|Brazil/Acre",
				"America/Santiago|Antarctica/Palmer",
				"America/Santiago|Chile/Continental",
				"America/Santo_Domingo|America/Anguilla",
				"America/Santo_Domingo|America/Antigua",
				"America/Santo_Domingo|America/Aruba",
				"America/Santo_Domingo|America/Barbados",
				"America/Santo_Domingo|America/Blanc-Sablon",
				"America/Santo_Domingo|America/Curacao",
				"America/Santo_Domingo|America/Dominica",
				"America/Santo_Domingo|America/Grenada",
				"America/Santo_Domingo|America/Guadeloupe",
				"America/Santo_Domingo|America/Kralendijk",
				"America/Santo_Domingo|America/Lower_Princes",
				"America/Santo_Domingo|America/Marigot",
				"America/Santo_Domingo|America/Martinique",
				"America/Santo_Domingo|America/Montserrat",
				"America/Santo_Domingo|America/Port_of_Spain",
				"America/Santo_Domingo|America/Puerto_Rico",
				"America/Santo_Domingo|America/St_Barthelemy",
				"America/Santo_Domingo|America/St_Kitts",
				"America/Santo_Domingo|America/St_Lucia",
				"America/Santo_Domingo|America/St_Thomas",
				"America/Santo_Domingo|America/St_Vincent",
				"America/Santo_Domingo|America/Tortola",
				"America/Santo_Domingo|America/Virgin",
				"America/Sao_Paulo|Brazil/East",
				"America/St_Johns|Canada/Newfoundland",
				"Antarctica/DumontDUrville|Etc/GMT-10",
				"Antarctica/Rothera|Etc/GMT+3",
				"Antarctica/Syowa|Etc/GMT-3",
				"Asia/Almaty|Antarctica/Vostok",
				"Asia/Almaty|Asia/Bishkek",
				"Asia/Almaty|Asia/Qyzylorda",
				"Asia/Almaty|Etc/GMT-6",
				"Asia/Baghdad|Asia/Aden",
				"Asia/Baghdad|Asia/Bahrain",
				"Asia/Baghdad|Asia/Kuwait",
				"Asia/Baghdad|Asia/Qatar",
				"Asia/Baghdad|Asia/Riyadh",
				"Asia/Bangkok|Asia/Ho_Chi_Minh",
				"Asia/Bangkok|Asia/Phnom_Penh",
				"Asia/Bangkok|Asia/Saigon",
				"Asia/Bangkok|Asia/Vientiane",
				"Asia/Dhaka|Asia/Dacca",
				"Asia/Dubai|Asia/Muscat",
				"Asia/Hong_Kong|Hongkong",
				"Asia/Jakarta|Asia/Pontianak",
				"Asia/Jerusalem|Asia/Tel_Aviv",
				"Asia/Jerusalem|Israel",
				"Asia/Kamchatka|Asia/Anadyr",
				"Asia/Kathmandu|Asia/Katmandu",
				"Asia/Kolkata|Asia/Calcutta",
				"Asia/Kuala_Lumpur|Asia/Kuching",
				"Asia/Makassar|Asia/Ujung_Pandang",
				"Asia/Rangoon|Asia/Yangon",
				"Asia/Seoul|ROK",
				"Asia/Shanghai|Asia/Chongqing",
				"Asia/Shanghai|Asia/Chungking",
				"Asia/Shanghai|Asia/Harbin",
				"Asia/Shanghai|Asia/Macao",
				"Asia/Shanghai|Asia/Macau",
				"Asia/Shanghai|Asia/Taipei",
				"Asia/Shanghai|PRC",
				"Asia/Shanghai|ROC",
				"Asia/Singapore|Singapore",
				"Asia/Tashkent|Antarctica/Mawson",
				"Asia/Tashkent|Asia/Aqtau",
				"Asia/Tashkent|Asia/Aqtobe",
				"Asia/Tashkent|Asia/Ashgabat",
				"Asia/Tashkent|Asia/Ashkhabad",
				"Asia/Tashkent|Asia/Atyrau",
				"Asia/Tashkent|Asia/Dushanbe",
				"Asia/Tashkent|Asia/Oral",
				"Asia/Tashkent|Asia/Samarkand",
				"Asia/Tashkent|Etc/GMT-5",
				"Asia/Tashkent|Indian/Kerguelen",
				"Asia/Tbilisi|Etc/GMT-4",
				"Asia/Tehran|Iran",
				"Asia/Thimphu|Asia/Thimbu",
				"Asia/Tokyo|Japan",
				"Asia/Ulaanbaatar|Asia/Ulan_Bator",
				"Asia/Urumqi|Asia/Kashgar",
				"Australia/Adelaide|Australia/Broken_Hill",
				"Australia/Adelaide|Australia/South",
				"Australia/Adelaide|Australia/Yancowinna",
				"Australia/Brisbane|Australia/Lindeman",
				"Australia/Brisbane|Australia/Queensland",
				"Australia/Darwin|Australia/North",
				"Australia/Lord_Howe|Australia/LHI",
				"Australia/Perth|Australia/West",
				"Australia/Sydney|Australia/ACT",
				"Australia/Sydney|Australia/Canberra",
				"Australia/Sydney|Australia/Currie",
				"Australia/Sydney|Australia/Hobart",
				"Australia/Sydney|Australia/Melbourne",
				"Australia/Sydney|Australia/NSW",
				"Australia/Sydney|Australia/Tasmania",
				"Australia/Sydney|Australia/Victoria",
				"Etc/UCT|UCT",
				"Etc/UTC|Etc/Universal",
				"Etc/UTC|Etc/Zulu",
				"Etc/UTC|UTC",
				"Etc/UTC|Universal",
				"Etc/UTC|Zulu",
				"Europe/Astrakhan|Europe/Ulyanovsk",
				"Europe/Athens|Asia/Nicosia",
				"Europe/Athens|EET",
				"Europe/Athens|Europe/Bucharest",
				"Europe/Athens|Europe/Helsinki",
				"Europe/Athens|Europe/Kiev",
				"Europe/Athens|Europe/Mariehamn",
				"Europe/Athens|Europe/Nicosia",
				"Europe/Athens|Europe/Riga",
				"Europe/Athens|Europe/Sofia",
				"Europe/Athens|Europe/Tallinn",
				"Europe/Athens|Europe/Uzhgorod",
				"Europe/Athens|Europe/Vilnius",
				"Europe/Athens|Europe/Zaporozhye",
				"Europe/Chisinau|Europe/Tiraspol",
				"Europe/Dublin|Eire",
				"Europe/Istanbul|Asia/Istanbul",
				"Europe/Istanbul|Turkey",
				"Europe/Lisbon|Atlantic/Canary",
				"Europe/Lisbon|Atlantic/Faeroe",
				"Europe/Lisbon|Atlantic/Faroe",
				"Europe/Lisbon|Atlantic/Madeira",
				"Europe/Lisbon|Portugal",
				"Europe/Lisbon|WET",
				"Europe/London|Europe/Belfast",
				"Europe/London|Europe/Guernsey",
				"Europe/London|Europe/Isle_of_Man",
				"Europe/London|Europe/Jersey",
				"Europe/London|GB",
				"Europe/London|GB-Eire",
				"Europe/Moscow|W-SU",
				"Europe/Paris|Africa/Ceuta",
				"Europe/Paris|Arctic/Longyearbyen",
				"Europe/Paris|Atlantic/Jan_Mayen",
				"Europe/Paris|CET",
				"Europe/Paris|Europe/Amsterdam",
				"Europe/Paris|Europe/Andorra",
				"Europe/Paris|Europe/Belgrade",
				"Europe/Paris|Europe/Berlin",
				"Europe/Paris|Europe/Bratislava",
				"Europe/Paris|Europe/Brussels",
				"Europe/Paris|Europe/Budapest",
				"Europe/Paris|Europe/Busingen",
				"Europe/Paris|Europe/Copenhagen",
				"Europe/Paris|Europe/Gibraltar",
				"Europe/Paris|Europe/Ljubljana",
				"Europe/Paris|Europe/Luxembourg",
				"Europe/Paris|Europe/Madrid",
				"Europe/Paris|Europe/Malta",
				"Europe/Paris|Europe/Monaco",
				"Europe/Paris|Europe/Oslo",
				"Europe/Paris|Europe/Podgorica",
				"Europe/Paris|Europe/Prague",
				"Europe/Paris|Europe/Rome",
				"Europe/Paris|Europe/San_Marino",
				"Europe/Paris|Europe/Sarajevo",
				"Europe/Paris|Europe/Skopje",
				"Europe/Paris|Europe/Stockholm",
				"Europe/Paris|Europe/Tirane",
				"Europe/Paris|Europe/Vaduz",
				"Europe/Paris|Europe/Vatican",
				"Europe/Paris|Europe/Vienna",
				"Europe/Paris|Europe/Warsaw",
				"Europe/Paris|Europe/Zagreb",
				"Europe/Paris|Europe/Zurich",
				"Europe/Paris|Poland",
				"Europe/Volgograd|Europe/Kirov",
				"Pacific/Auckland|Antarctica/McMurdo",
				"Pacific/Auckland|Antarctica/South_Pole",
				"Pacific/Auckland|NZ",
				"Pacific/Chatham|NZ-CHAT",
				"Pacific/Chuuk|Pacific/Truk",
				"Pacific/Chuuk|Pacific/Yap",
				"Pacific/Easter|Chile/EasterIsland",
				"Pacific/Guam|Pacific/Saipan",
				"Pacific/Honolulu|HST",
				"Pacific/Honolulu|Pacific/Johnston",
				"Pacific/Honolulu|US/Hawaii",
				"Pacific/Majuro|Kwajalein",
				"Pacific/Majuro|Pacific/Kwajalein",
				"Pacific/Pago_Pago|Pacific/Midway",
				"Pacific/Pago_Pago|Pacific/Samoa",
				"Pacific/Pago_Pago|US/Samoa",
				"Pacific/Pohnpei|Pacific/Ponape"
			]
		});
	
	
		return moment;
	}));


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	(function(window) {
	    var re = {
	        not_string: /[^s]/,
	        number: /[diefg]/,
	        json: /[j]/,
	        not_json: /[^j]/,
	        text: /^[^\x25]+/,
	        modulo: /^\x25{2}/,
	        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
	        key: /^([a-z_][a-z_\d]*)/i,
	        key_access: /^\.([a-z_][a-z_\d]*)/i,
	        index_access: /^\[(\d+)\]/,
	        sign: /^[\+\-]/
	    }
	
	    function sprintf() {
	        var key = arguments[0], cache = sprintf.cache
	        if (!(cache[key] && cache.hasOwnProperty(key))) {
	            cache[key] = sprintf.parse(key)
	        }
	        return sprintf.format.call(null, cache[key], arguments)
	    }
	
	    sprintf.format = function(parse_tree, argv) {
	        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
	        for (i = 0; i < tree_length; i++) {
	            node_type = get_type(parse_tree[i])
	            if (node_type === "string") {
	                output[output.length] = parse_tree[i]
	            }
	            else if (node_type === "array") {
	                match = parse_tree[i] // convenience purposes only
	                if (match[2]) { // keyword argument
	                    arg = argv[cursor]
	                    for (k = 0; k < match[2].length; k++) {
	                        if (!arg.hasOwnProperty(match[2][k])) {
	                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
	                        }
	                        arg = arg[match[2][k]]
	                    }
	                }
	                else if (match[1]) { // positional argument (explicit)
	                    arg = argv[match[1]]
	                }
	                else { // positional argument (implicit)
	                    arg = argv[cursor++]
	                }
	
	                if (get_type(arg) == "function") {
	                    arg = arg()
	                }
	
	                if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
	                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
	                }
	
	                if (re.number.test(match[8])) {
	                    is_positive = arg >= 0
	                }
	
	                switch (match[8]) {
	                    case "b":
	                        arg = arg.toString(2)
	                    break
	                    case "c":
	                        arg = String.fromCharCode(arg)
	                    break
	                    case "d":
	                    case "i":
	                        arg = parseInt(arg, 10)
	                    break
	                    case "j":
	                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
	                    break
	                    case "e":
	                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
	                    break
	                    case "f":
	                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
	                    break
	                    case "g":
	                        arg = match[7] ? parseFloat(arg).toPrecision(match[7]) : parseFloat(arg)
	                    break
	                    case "o":
	                        arg = arg.toString(8)
	                    break
	                    case "s":
	                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
	                    break
	                    case "u":
	                        arg = arg >>> 0
	                    break
	                    case "x":
	                        arg = arg.toString(16)
	                    break
	                    case "X":
	                        arg = arg.toString(16).toUpperCase()
	                    break
	                }
	                if (re.json.test(match[8])) {
	                    output[output.length] = arg
	                }
	                else {
	                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
	                        sign = is_positive ? "+" : "-"
	                        arg = arg.toString().replace(re.sign, "")
	                    }
	                    else {
	                        sign = ""
	                    }
	                    pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
	                    pad_length = match[6] - (sign + arg).length
	                    pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
	                    output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
	                }
	            }
	        }
	        return output.join("")
	    }
	
	    sprintf.cache = {}
	
	    sprintf.parse = function(fmt) {
	        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
	        while (_fmt) {
	            if ((match = re.text.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = match[0]
	            }
	            else if ((match = re.modulo.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = "%"
	            }
	            else if ((match = re.placeholder.exec(_fmt)) !== null) {
	                if (match[2]) {
	                    arg_names |= 1
	                    var field_list = [], replacement_field = match[2], field_match = []
	                    if ((field_match = re.key.exec(replacement_field)) !== null) {
	                        field_list[field_list.length] = field_match[1]
	                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
	                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else {
	                                throw new SyntaxError("[sprintf] failed to parse named argument key")
	                            }
	                        }
	                    }
	                    else {
	                        throw new SyntaxError("[sprintf] failed to parse named argument key")
	                    }
	                    match[2] = field_list
	                }
	                else {
	                    arg_names |= 2
	                }
	                if (arg_names === 3) {
	                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
	                }
	                parse_tree[parse_tree.length] = match
	            }
	            else {
	                throw new SyntaxError("[sprintf] unexpected placeholder")
	            }
	            _fmt = _fmt.substring(match[0].length)
	        }
	        return parse_tree
	    }
	
	    var vsprintf = function(fmt, argv, _argv) {
	        _argv = (argv || []).slice(0)
	        _argv.splice(0, 0, fmt)
	        return sprintf.apply(null, _argv)
	    }
	
	    /**
	     * helpers
	     */
	    function get_type(variable) {
	        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
	    }
	
	    function str_repeat(input, multiplier) {
	        return Array(multiplier + 1).join(input)
	    }
	
	    /**
	     * export to either browser or node.js
	     */
	    if (true) {
	        exports.sprintf = sprintf
	        exports.vsprintf = vsprintf
	    }
	    else {
	        window.sprintf = sprintf
	        window.vsprintf = vsprintf
	
	        if (typeof define === "function" && define.amd) {
	            define(function() {
	                return {
	                    sprintf: sprintf,
	                    vsprintf: vsprintf
	                }
	            })
	        }
	    }
	})(typeof window === "undefined" ? this : window);


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(33);
	
	/*
	 * Utily functions
	 */
	
	module.exports = {
	
	  isFunction: function(object) {
	   return !!(object && object.constructor && object.call && object.apply);
	  },
	
	  doCallback: function(hook, config, arg, deprecated) {
	    if(this.isFunction(config.callbacks[hook])) {
	      config.callbacks[hook](arg);
	      if (deprecated) { this.logDeprecated(hook + ' callback has been replaced, please see docs'); }
	    }
	  },
	
	  logError: function(message) {
	    console.error('TimekitBooking Error: ' + message);
	  },
	
	  logDeprecated: function(message) {
	    console.warn('TimekitBooking Deprecated: ' + message);
	  }
	
	};


/***/ },
/* 33 */
/***/ function(module, exports) {

	// Console-polyfill. MIT license.
	// https://github.com/paulmillr/console-polyfill
	// Make it safe to do console.log() always.
	(function(global) {
	  'use strict';
	  if (!global.console) {
	    global.console = {};
	  }
	  var con = global.console;
	  var prop, method;
	  var dummy = function() {};
	  var properties = ['memory'];
	  var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
	     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
	     'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
	  while (prop = properties.pop()) if (!con[prop]) con[prop] = {};
	  while (method = methods.pop()) if (typeof con[method] !== 'function') con[method] = dummy;
	  // Using `this` for web workers & supports Browserify / Webpack.
	})(typeof window === 'undefined' ? this : window);


/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';
	
	/*
	 * Default configuration
	 */
	
	var primary = {
	
	  targetEl: '#bookingjs',
	  name: '',
	  avatar: '',
	  autoload: true,
	  includeStyles: true,
	  showCredits: true,
	  goToFirstEvent: true,
	  closeFormOnSuccessButtonClick: true,
	  bookingGraph: 'instant',
	  possibleLengths: {
	    'Normal': '1 hour',
	    'Long': '2 hour'
	  },
	  bookingFields: {
	    name: {
	      placeholder: 'Full name',
	      prefilled: false,
	      locked: false
	    },
	    email: {
	      placeholder: 'E-mail',
	      prefilled: false,
	      locked: false
	    },
	    comment: {
	      enabled: true,
	      placeholder: 'Comment',
	      prefilled: false,
	      required: false,
	      locked: false
	    },
	    phone: {
	      enabled: false,
	      placeholder: 'Phone number',
	      prefilled: false,
	      required: false,
	      locked: false
	    },
	    voip: {
	      enabled: false,
	      placeholder: 'Skype username',
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
	  },
	  timekitConfig: {
	    app: 'bookingjs'
	  },
	  timekitFindTime: {
	    future: '4 weeks',
	    length: '1 hour'
	  },
	  timekitCreateBooking: { },
	  timekitUpdateBooking: { },
	  fullCalendar: {
	    header: {
	      left: '',
	      center: '',
	      right: 'today, prev, next'
	    },
	    views: {
	      agenda: {
	        displayEventEnd: false
	      }
	    },
	    allDaySlot: false,
	    scrollTime: '08:00:00',
	    timezone: 'local',
	    nowIndicator: true
	  },
	  localization: {
	    showTimezoneHelper: true,
	    timeDateFormat: '12h-mdy-sun',
	    strings: {
	      submitText: 'Book it',
	      successMessageTitle: 'Thanks!',
	      timezoneHelperLoading: 'Loading..',
	      timezoneHelperDifferent: 'Your timezone is %s hours %s of %s (calendar shown in your local time)',
	      timezoneHelperSame: 'You are in the same timezone as %s'
	    }
	  },
	  callbacks: {}
	
	};
	
	// Preset: bookingGraph = 'instant'
	var bookingInstant = {
	
	  timekitCreateBooking: {
	    graph: 'instant',
	    action: 'confirm',
	    event: {
	      invite: true,
	      my_rsvp: 'accepted',
	      sync_provider: true
	    }
	  },
	  localization: {
	    strings: {
	      successMessageBody: 'An invitation has been sent to: <br /> %s <br /><br /> Please accept the invitation to confirm the booking.'
	    }
	  }
	
	};
	
	// Preset: bookingGraph = 'confirm_decline'
	var bookingConfirmDecline = {
	
	  timekitCreateBooking: {
	    graph: 'confirm_decline',
	    action: 'create',
	    event: {
	      invite: true,
	      my_rsvp: 'accepted',
	      sync_provider: true
	    }
	  },
	  localization: {
	    strings: {
	      successMessageBody: "We have received your request and we'll be in touch when we have reviewed it. <br /><br />Have a great day!"
	    }
	  }
	
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
	        columnFormat: 'ddd\n D/M',
	        slotLabelFormat: 'HH:mm'
	      }
	    }
	  },
	  localization: {
	    bookingDateFormat: 'D. MMMM YYYY',
	    bookingTimeFormat: 'HH:mm',
	    emailTimeFormat: 'H:i'
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
	        columnFormat: 'ddd\n M/D',
	        slotLabelFormat: 'ha'
	      }
	    },
	  },
	  localization: {
	    bookingDateFormat: 'MMMM D, YYYY',
	    bookingTimeFormat: 'h:mma',
	    emailTimeFormat: 'h:ia'
	  }
	
	};
	
	// Export objects
	module.exports = {
	  primary: primary,
	  presets: {
	    timeDateFormat24hdmymon:  timeDateFormat24hdmymon,
	    timeDateFormat12hmdysun:  timeDateFormat12hmdysun,
	    bookingInstant: bookingInstant,
	    bookingConfirmDecline: bookingConfirmDecline
	  }
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(36);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(38)(content, {"singleton":true});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js?minimize!./../../autoprefixer-loader/index.js!./fullcalendar.css", function() {
				var newContent = require("!!./../../css-loader/index.js?minimize!./../../autoprefixer-loader/index.js!./fullcalendar.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(37)();
	// imports
	
	
	// module
	exports.push([module.id, "/*!\n * <%= meta.title %> v<%= meta.version %> Stylesheet\n * Docs & License: <%= meta.homepage %>\n * (c) <%= meta.copyright %>\n */.fc{direction:ltr;text-align:left}.fc-rtl{text-align:right}body .fc{font-size:1em}.fc-unthemed .fc-content,.fc-unthemed .fc-divider,.fc-unthemed .fc-popover,.fc-unthemed .fc-row,.fc-unthemed tbody,.fc-unthemed td,.fc-unthemed th,.fc-unthemed thead{border-color:#ddd}.fc-unthemed .fc-popover{background-color:#fff}.fc-unthemed .fc-divider,.fc-unthemed .fc-popover .fc-header{background:#eee}.fc-unthemed .fc-popover .fc-header .fc-close{color:#666}.fc-unthemed .fc-today{background:#fcf8e3}.fc-highlight{background:#bce8f1}.fc-bgevent,.fc-highlight{opacity:.3;filter:alpha(opacity=30)}.fc-bgevent{background:#8fdf82}.fc-nonbusiness{background:#d7d7d7}.fc-icon{display:inline-block;height:1em;line-height:1em;font-size:1em;text-align:center;overflow:hidden;font-family:Courier New,Courier,monospace;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.fc-icon:after{position:relative}.fc-icon-left-single-arrow:after{content:\"\\2039\";font-weight:700;font-size:200%;top:-7%}.fc-icon-right-single-arrow:after{content:\"\\203A\";font-weight:700;font-size:200%;top:-7%}.fc-icon-left-double-arrow:after{content:\"\\AB\";font-size:160%;top:-7%}.fc-icon-right-double-arrow:after{content:\"\\BB\";font-size:160%;top:-7%}.fc-icon-left-triangle:after{content:\"\\25C4\";font-size:125%;top:3%}.fc-icon-right-triangle:after{content:\"\\25BA\";font-size:125%;top:3%}.fc-icon-down-triangle:after{content:\"\\25BC\";font-size:125%;top:2%}.fc-icon-x:after{content:\"\\D7\";font-size:200%;top:6%}.fc button{box-sizing:border-box;margin:0;height:2.1em;padding:0 .6em;font-size:1em;white-space:nowrap;cursor:pointer}.fc button::-moz-focus-inner{margin:0;padding:0}.fc-state-default{border:1px solid}.fc-state-default.fc-corner-left{border-top-left-radius:4px;border-bottom-left-radius:4px}.fc-state-default.fc-corner-right{border-top-right-radius:4px;border-bottom-right-radius:4px}.fc button .fc-icon{position:relative;top:-.05em;margin:0 .2em;vertical-align:middle}.fc-state-default{background-color:#f5f5f5;background-image:-webkit-gradient(linear,0 0,0 100%,from(#fff),to(#e6e6e6));background-image:-webkit-linear-gradient(top,#fff,#e6e6e6);background-image:linear-gradient(180deg,#fff,#e6e6e6);background-repeat:repeat-x;border-color:#e6e6e6 #e6e6e6 #bfbfbf;border-color:rgba(0,0,0,.1) rgba(0,0,0,.1) rgba(0,0,0,.25);color:#333;text-shadow:0 1px 1px hsla(0,0%,100%,.75);box-shadow:inset 0 1px 0 hsla(0,0%,100%,.2),0 1px 2px rgba(0,0,0,.05)}.fc-state-active,.fc-state-disabled,.fc-state-down,.fc-state-hover{color:#333;background-color:#e6e6e6}.fc-state-hover{color:#333;text-decoration:none;background-position:0 -15px;-webkit-transition:background-position .1s linear;transition:background-position .1s linear}.fc-state-active,.fc-state-down{background-color:#ccc;background-image:none;box-shadow:inset 0 2px 4px rgba(0,0,0,.15),0 1px 2px rgba(0,0,0,.05)}.fc-state-disabled{cursor:default;background-image:none;opacity:.65;filter:alpha(opacity=65);box-shadow:none}.fc-button-group{display:inline-block}.fc .fc-button-group>*{float:left;margin:0 0 0 -1px}.fc .fc-button-group>:first-child{margin-left:0}.fc-popover{position:absolute;box-shadow:0 2px 6px rgba(0,0,0,.15)}.fc-popover .fc-header{padding:2px 4px}.fc-popover .fc-header .fc-title{margin:0 2px}.fc-popover .fc-header .fc-close{cursor:pointer}.fc-ltr .fc-popover .fc-header .fc-title,.fc-rtl .fc-popover .fc-header .fc-close{float:left}.fc-ltr .fc-popover .fc-header .fc-close,.fc-rtl .fc-popover .fc-header .fc-title{float:right}.fc-unthemed .fc-popover{border-width:1px;border-style:solid}.fc-unthemed .fc-popover .fc-header .fc-close{font-size:.9em;margin-top:2px}.fc-popover>.ui-widget-header+.ui-widget-content{border-top:0}.fc-divider{border-style:solid;border-width:1px}hr.fc-divider{height:0;margin:0;padding:0 0 2px;border-width:1px 0}.fc-clear{clear:both}.fc-bg,.fc-bgevent-skeleton,.fc-helper-skeleton,.fc-highlight-skeleton{position:absolute;top:0;left:0;right:0}.fc-bg{bottom:0}.fc-bg table{height:100%}.fc table{width:100%;box-sizing:border-box;table-layout:fixed;border-collapse:collapse;border-spacing:0;font-size:1em}.fc th{text-align:center}.fc td,.fc th{border-style:solid;border-width:1px;padding:0;vertical-align:top}.fc td.fc-today{border-style:double}.fc .fc-row{border-style:solid;border-width:0}.fc-row table{border-left:0 hidden transparent;border-right:0 hidden transparent;border-bottom:0 hidden transparent}.fc-row:first-child table{border-top:0 hidden transparent}.fc-row{position:relative}.fc-row .fc-bg{z-index:1}.fc-row .fc-bgevent-skeleton,.fc-row .fc-highlight-skeleton{bottom:0}.fc-row .fc-bgevent-skeleton table,.fc-row .fc-highlight-skeleton table{height:100%}.fc-row .fc-bgevent-skeleton td,.fc-row .fc-highlight-skeleton td{border-color:transparent}.fc-row .fc-bgevent-skeleton{z-index:2}.fc-row .fc-highlight-skeleton{z-index:3}.fc-row .fc-content-skeleton{position:relative;z-index:4;padding-bottom:2px}.fc-row .fc-helper-skeleton{z-index:5}.fc-row .fc-content-skeleton td,.fc-row .fc-helper-skeleton td{background:none;border-color:transparent;border-bottom:0}.fc-row .fc-content-skeleton tbody td,.fc-row .fc-helper-skeleton tbody td{border-top:0}.fc-scroller{-webkit-overflow-scrolling:touch}.fc-scroller>.fc-day-grid,.fc-scroller>.fc-time-grid{position:relative;width:100%}.fc-event{position:relative;display:block;font-size:.85em;line-height:1.3;border-radius:3px;border:1px solid #3a87ad;background-color:#3a87ad;font-weight:400}.fc-event,.fc-event:hover,.ui-widget .fc-event{color:#fff;text-decoration:none}.fc-event.fc-draggable,.fc-event[href]{cursor:pointer}.fc-not-allowed,.fc-not-allowed .fc-event{cursor:not-allowed}.fc-event .fc-bg{z-index:1;background:#fff;opacity:.25;filter:alpha(opacity=25)}.fc-event .fc-content{position:relative;z-index:2}.fc-event .fc-resizer{position:absolute;z-index:4;display:none}.fc-event.fc-allow-mouse-resize .fc-resizer,.fc-event.fc-selected .fc-resizer{display:block}.fc-event.fc-selected .fc-resizer:before{content:\"\";position:absolute;z-index:9999;top:50%;left:50%;width:40px;height:40px;margin-left:-20px;margin-top:-20px}.fc-event.fc-selected{z-index:9999!important;box-shadow:0 2px 5px rgba(0,0,0,.2)}.fc-event.fc-selected.fc-dragging{box-shadow:0 2px 7px rgba(0,0,0,.3)}.fc-h-event.fc-selected:before{content:\"\";position:absolute;z-index:3;top:-10px;bottom:-10px;left:0;right:0}.fc-ltr .fc-h-event.fc-not-start,.fc-rtl .fc-h-event.fc-not-end{margin-left:0;border-left-width:0;padding-left:1px;border-top-left-radius:0;border-bottom-left-radius:0}.fc-ltr .fc-h-event.fc-not-end,.fc-rtl .fc-h-event.fc-not-start{margin-right:0;border-right-width:0;padding-right:1px;border-top-right-radius:0;border-bottom-right-radius:0}.fc-ltr .fc-h-event .fc-start-resizer,.fc-rtl .fc-h-event .fc-end-resizer{cursor:w-resize;left:-1px}.fc-ltr .fc-h-event .fc-end-resizer,.fc-rtl .fc-h-event .fc-start-resizer{cursor:e-resize;right:-1px}.fc-h-event.fc-allow-mouse-resize .fc-resizer{width:7px;top:-1px;bottom:-1px}.fc-h-event.fc-selected .fc-resizer{border-radius:4px;border-width:1px;width:6px;height:6px;border-style:solid;border-color:inherit;background:#fff;top:50%;margin-top:-4px}.fc-ltr .fc-h-event.fc-selected .fc-start-resizer,.fc-rtl .fc-h-event.fc-selected .fc-end-resizer{margin-left:-4px}.fc-ltr .fc-h-event.fc-selected .fc-end-resizer,.fc-rtl .fc-h-event.fc-selected .fc-start-resizer{margin-right:-4px}.fc-day-grid-event{margin:1px 2px 0;padding:0 1px}.fc-day-grid-event.fc-selected:after{content:\"\";position:absolute;z-index:1;top:-1px;right:-1px;bottom:-1px;left:-1px;background:#000;opacity:.25;filter:alpha(opacity=25)}.fc-day-grid-event .fc-content{white-space:nowrap;overflow:hidden}.fc-day-grid-event .fc-time{font-weight:700}.fc-ltr .fc-day-grid-event.fc-allow-mouse-resize .fc-start-resizer,.fc-rtl .fc-day-grid-event.fc-allow-mouse-resize .fc-end-resizer{margin-left:-2px}.fc-ltr .fc-day-grid-event.fc-allow-mouse-resize .fc-end-resizer,.fc-rtl .fc-day-grid-event.fc-allow-mouse-resize .fc-start-resizer{margin-right:-2px}a.fc-more{margin:1px 3px;font-size:.85em;cursor:pointer;text-decoration:none}a.fc-more:hover{text-decoration:underline}.fc-limited{display:none}.fc-day-grid .fc-row{z-index:1}.fc-more-popover{z-index:2;width:220px}.fc-more-popover .fc-event-container{padding:10px}.fc-now-indicator{position:absolute;border:0 solid red}.fc-unselectable{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.fc-toolbar{text-align:center;margin-bottom:1em}.fc-toolbar .fc-left{float:left}.fc-toolbar .fc-right{float:right}.fc-toolbar .fc-center{display:inline-block}.fc .fc-toolbar>*>*{float:left;margin-left:.75em}.fc .fc-toolbar>*>:first-child{margin-left:0}.fc-toolbar h2{margin:0}.fc-toolbar button{position:relative}.fc-toolbar .fc-state-hover,.fc-toolbar .ui-state-hover{z-index:2}.fc-toolbar .fc-state-down{z-index:3}.fc-toolbar .fc-state-active,.fc-toolbar .ui-state-active{z-index:4}.fc-toolbar button:focus{z-index:5}.fc-view-container *,.fc-view-container :after,.fc-view-container :before{box-sizing:content-box}.fc-view,.fc-view>table{position:relative;z-index:1}.fc-basicDay-view .fc-content-skeleton,.fc-basicWeek-view .fc-content-skeleton{padding-top:1px;padding-bottom:1em}.fc-basic-view .fc-body .fc-row{min-height:4em}.fc-row.fc-rigid{overflow:hidden}.fc-row.fc-rigid .fc-content-skeleton{position:absolute;top:0;left:0;right:0}.fc-basic-view .fc-day-number,.fc-basic-view .fc-week-number{padding:0 2px}.fc-basic-view td.fc-day-number,.fc-basic-view td.fc-week-number span{padding-top:2px;padding-bottom:2px}.fc-basic-view .fc-week-number{text-align:center}.fc-basic-view .fc-week-number span{display:inline-block;min-width:1.25em}.fc-ltr .fc-basic-view .fc-day-number{text-align:right}.fc-rtl .fc-basic-view .fc-day-number{text-align:left}.fc-day-number.fc-other-month{opacity:.3;filter:alpha(opacity=30)}.fc-agenda-view .fc-day-grid{position:relative;z-index:2}.fc-agenda-view .fc-day-grid .fc-row{min-height:3em}.fc-agenda-view .fc-day-grid .fc-row .fc-content-skeleton{padding-top:1px;padding-bottom:1em}.fc .fc-axis{vertical-align:middle;padding:0 4px;white-space:nowrap}.fc-ltr .fc-axis{text-align:right}.fc-rtl .fc-axis{text-align:left}.ui-widget td.fc-axis{font-weight:400}.fc-time-grid,.fc-time-grid-container{position:relative;z-index:1}.fc-time-grid{min-height:100%}.fc-time-grid table{border:0 hidden transparent}.fc-time-grid>.fc-bg{z-index:1}.fc-time-grid .fc-slats,.fc-time-grid>hr{position:relative;z-index:2}.fc-time-grid .fc-content-col{position:relative}.fc-time-grid .fc-content-skeleton{position:absolute;z-index:3;top:0;left:0;right:0}.fc-time-grid .fc-business-container{position:relative;z-index:1}.fc-time-grid .fc-bgevent-container{position:relative;z-index:2}.fc-time-grid .fc-highlight-container{position:relative;z-index:3}.fc-time-grid .fc-event-container{position:relative;z-index:4}.fc-time-grid .fc-now-indicator-line{z-index:5}.fc-time-grid .fc-helper-container{position:relative;z-index:6}.fc-time-grid .fc-slats td{height:1.5em;border-bottom:0}.fc-time-grid .fc-slats .fc-minor td{border-top-style:dotted}.fc-time-grid .fc-slats .ui-widget-content{background:none}.fc-time-grid .fc-highlight-container{position:relative}.fc-time-grid .fc-highlight{position:absolute;left:0;right:0}.fc-ltr .fc-time-grid .fc-event-container{margin:0 2.5% 0 2px}.fc-rtl .fc-time-grid .fc-event-container{margin:0 2px 0 2.5%}.fc-time-grid .fc-bgevent,.fc-time-grid .fc-event{position:absolute;z-index:1}.fc-time-grid .fc-bgevent{left:0;right:0}.fc-v-event.fc-not-start{border-top-width:0;padding-top:1px;border-top-left-radius:0;border-top-right-radius:0}.fc-v-event.fc-not-end{border-bottom-width:0;padding-bottom:1px;border-bottom-left-radius:0;border-bottom-right-radius:0}.fc-time-grid-event{overflow:hidden}.fc-time-grid-event.fc-selected{overflow:visible}.fc-time-grid-event.fc-selected .fc-bg{display:none}.fc-time-grid-event .fc-content{overflow:hidden}.fc-time-grid-event .fc-time,.fc-time-grid-event .fc-title{padding:0 1px}.fc-time-grid-event .fc-time{font-size:.85em;white-space:nowrap}.fc-time-grid-event.fc-short .fc-content{white-space:nowrap}.fc-time-grid-event.fc-short .fc-time,.fc-time-grid-event.fc-short .fc-title{display:inline-block;vertical-align:top}.fc-time-grid-event.fc-short .fc-time span{display:none}.fc-time-grid-event.fc-short .fc-time:before{content:attr(data-start)}.fc-time-grid-event.fc-short .fc-time:after{content:\"\\A0-\\A0\"}.fc-time-grid-event.fc-short .fc-title{font-size:.85em;padding:0}.fc-time-grid-event.fc-allow-mouse-resize .fc-resizer{left:0;right:0;bottom:0;height:8px;overflow:hidden;line-height:8px;font-size:11px;font-family:monospace;text-align:center;cursor:s-resize}.fc-time-grid-event.fc-allow-mouse-resize .fc-resizer:after{content:\"=\"}.fc-time-grid-event.fc-selected .fc-resizer{border-radius:5px;border-width:1px;width:8px;height:8px;border-style:solid;border-color:inherit;background:#fff;left:50%;margin-left:-5px;bottom:-5px}.fc-time-grid .fc-now-indicator-line{border-top-width:1px;left:0;right:0}.fc-time-grid .fc-now-indicator-arrow{margin-top:-5px}.fc-ltr .fc-time-grid .fc-now-indicator-arrow{left:0;border-width:5px 0 5px 6px;border-top-color:transparent;border-bottom-color:transparent}.fc-rtl .fc-time-grid .fc-now-indicator-arrow{right:0;border-width:5px 6px 5px 0;border-top-color:transparent;border-bottom-color:transparent}", ""]);
	
	// exports


/***/ },
/* 37 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(40);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(38)(content, {"singleton":true});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/autoprefixer-loader/index.js!./../../node_modules/sass-loader/index.js!./fullcalendar.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/autoprefixer-loader/index.js!./../../node_modules/sass-loader/index.js!./fullcalendar.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(37)();
	// imports
	
	
	// module
	exports.push([module.id, ".fc-view-container{background-color:#fbfbfb;color:#333}.fc-row.fc-widget-header{border-bottom:1px solid #ececec}.fc-row.fc-widget-header .fc-day-header{text-transform:uppercase;font-size:.9em;font-weight:600}.fc-axis,.fc-row.fc-widget-header .fc-day-header:first-line{color:#b9b9b9}.fc-axis{font-size:.9em}.fc-state-default{text-shadow:none;box-shadow:none;background-image:none;background-color:#fff;border-color:#fff}.fc-button{text-transform:uppercase;font-weight:600;font-size:1.1em;border:0;outline:none}.fc-button:active,.fc-button:focus,.fc-button:hover,.fc-button:visited{outline:none;border:0;background-color:transparent}.fc-content-skeleton{border-top:1px solid #ddd}.fc .fc-toolbar{padding:0;margin-bottom:0;border-bottom:1px solid #ececec}.fc .fc-toolbar>*>button{padding:15px 17px;height:auto;outline:0;margin-left:0;-webkit-transition:opacity .2s ease;transition:opacity .2s ease;opacity:.3}.fc .fc-toolbar>*>button:hover{opacity:1}.fc .fc-toolbar>*>button.fc-state-disabled{-webkit-transition:opacity 0s;transition:opacity 0s;opacity:0}.fc .fc-toolbar>*>button.fc-prev-button{padding-right:8px}.fc .fc-toolbar>*>button.fc-next-button{padding-left:8px}.fc .fc-toolbar>*>button .fc-icon{font-size:1.1em}.fc .fc-toolbar>.fc-right>button.fc-today-button{padding:15px 5px}.fc-unthemed .fc-today{background:#fff}.fc-body>tr>.fc-widget-content,.fc-head>tr>.fc-widget-header{border:0!important}.fc th{border-color:#fff;padding:5px}.fc-unthemed .fc-divider,.fc-unthemed .fc-popover .fc-header{background-color:transparent}.empty-calendar .fc-event{opacity:0}.fc-event{-webkit-transition:all .2s,opacity .6s;transition:all .2s,opacity .6s;border:none;border-left:3px solid #689ad8;padding:3px;background-color:#fff;border-radius:4px;color:#333;margin:1px 0;box-shadow:0 1px 2px rgba(0,0,0,.07);cursor:pointer;margin-bottom:2px;opacity:1}.fc-event:hover{color:#fff;background-color:#689ad8;border-left:3px solid #689ad8;box-shadow:0 1px 3px rgba(0,0,0,.15)}.fc-event .fc-bg{opacity:0}.fc-day-grid-event{padding:15px;margin:5px}.fc-day-grid-event .fc-time{font-weight:600}.fc-time-grid .fc-slats .fc-minor td{border-top-style:none}.fc-time-grid .fc-slats td{border-top-color:#fbfbfb}.fc-time-grid .fc-slats td.fc-axis{border-top-color:#ececec}.fc-time-grid-event.fc-short .fc-content{font-size:.7em;line-height:.2em}.fc-time-grid-event.fc-short .fc-time:after{content:\"\"}.fc-time-grid-event .fc-time{font-size:1.1em;padding:5px}.fc-unthemed .fc-divider,.fc-unthemed .fc-popover,.fc-unthemed .fc-row,.fc-unthemed tbody,.fc-unthemed td,.fc-unthemed th,.fc-unthemed thead{border-color:#ececec}.fc-agendaMonthly-view .fc-event{color:#fff}.fc-now-indicator{border-color:rgba(255,0,0,.5)}", ""]);
	
	// exports


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(42);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(38)(content, {"singleton":true});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/autoprefixer-loader/index.js!./../../node_modules/sass-loader/index.js!./utils.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/autoprefixer-loader/index.js!./../../node_modules/sass-loader/index.js!./utils.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(37)();
	// imports
	
	
	// module
	exports.push([module.id, "@-webkit-keyframes spin{to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@keyframes spin{to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@-webkit-keyframes shake{0%{-webkit-transform:translateX(0);transform:translateX(0)}25%{-webkit-transform:translateX(5px);transform:translateX(5px)}50%{-webkit-transform:translateX(-5px);transform:translateX(-5px)}75%{-webkit-transform:translateX(5px);transform:translateX(5px)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes shake{0%{-webkit-transform:translateX(0);transform:translateX(0)}25%{-webkit-transform:translateX(5px);transform:translateX(5px)}50%{-webkit-transform:translateX(-5px);transform:translateX(-5px)}75%{-webkit-transform:translateX(5px);transform:translateX(5px)}to{-webkit-transform:translateX(0);transform:translateX(0)}}", ""]);
	
	// exports


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(44);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(38)(content, {"singleton":true});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/autoprefixer-loader/index.js!./../../node_modules/sass-loader/index.js!./main.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js?minimize!./../../node_modules/autoprefixer-loader/index.js!./../../node_modules/sass-loader/index.js!./main.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(37)();
	// imports
	exports.push([module.id, "@import url(https://fonts.googleapis.com/css?family=Open+Sans:400,600);", ""]);
	
	// module
	exports.push([module.id, "/*!\n * Booking.js\n * http://timekit.io\n * (c) 2015 Timekit Inc.\n */.bookingjs{position:relative;font-family:Open Sans,Helvetica,Tahoma,Arial,sans-serif;font-size:13px;border-radius:4px;background-color:#fff;box-shadow:0 2px 4px 0 rgba(0,0,0,.2);margin:20px auto;z-index:10;opacity:0;color:#333;border-top:1px solid #ececec}.bookingjs.show{-webkit-transition:opacity .3s ease;transition:opacity .3s ease;opacity:1}.bookingjs.has-avatar{margin-top:60px}.is-small.has-avatar.has-displayname .bookingjs-calendar .fc-toolbar{padding-bottom:24px}.is-small .bookingjs-calendar .fc-toolbar>.fc-right>button.fc-today-button{position:absolute;left:15px}.bookingjs-timezonehelper{color:#aeaeae;text-align:center;padding:7px 10px;background-color:#fbfbfb;border-top:1px solid #ececec;min-height:15px;z-index:20;border-radius:0 0 4px 4px}.bookingjs-timezoneicon{width:10px;margin-right:5px}.bookingjs-avatar{position:absolute;top:-50px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);border-radius:150px;border:3px solid #fff;box-shadow:0 1px 3px 0 rgba(0,0,0,.13);overflow:hidden;z-index:40;background-color:#fff}.is-small .bookingjs-avatar{top:-40px}.bookingjs-avatar img{max-width:100%;vertical-align:middle;display:inline-block;width:80px;height:80px}.is-small .bookingjs-avatar img{width:70px;height:70px}.bookingjs-displayname{position:absolute;top:0;left:0;padding:15px 20px;color:#333;font-weight:600}.is-small .bookingjs-displayname{text-align:center;left:90px;right:90px;box-sizing:border-box}.is-small.has-avatar .bookingjs-displayname{top:44px;padding:0 20px}.bookingjs-bookpage{position:absolute;height:100%;width:100%;top:0;left:0;background-color:#fbfbfb;z-index:30;opacity:0;-webkit-transition:opacity .2s ease;transition:opacity .2s ease;border-radius:4px}.bookingjs-bookpage.show{opacity:1}.bookingjs-bookpage-close{position:absolute;top:0;right:0;padding:18px;-webkit-transition:opacity .2s ease;transition:opacity .2s ease;opacity:.3}.bookingjs-bookpage-close:hover{opacity:1}.bookingjs-bookpage-date,.bookingjs-bookpage h2{text-align:center;font-size:34px;font-weight:400;margin-top:70px;margin-bottom:10px}.is-small .bookingjs-bookpage-date,.is-small .bookingjs-bookpage h2{font-size:27px;margin-top:60px}.bookingjs-bookpage-time,.bookingjs-bookpage h3{text-align:center;font-size:17px;font-weight:400;margin-bottom:50px;margin-top:10px}.is-small .bookingjs-bookpage-time,.is-small .bookingjs-bookpage h3{font-size:15px;margin-bottom:35px}.bookingjs-closeicon{height:15px;width:15px}.bookingjs-form{width:350px;position:relative;margin:0 auto;text-align:center}.is-small .bookingjs-form{width:90%}.bookingjs-form-box{position:relative;box-shadow:0 1px 3px 0 rgba(0,0,0,.1);overflow:hidden;background-color:#fff;line-height:0}.bookingjs-form-success-message{position:absolute;top:-999px;left:0;right:0;padding:30px;background-color:#fff;opacity:0;-webkit-transition:opacity .3s ease;transition:opacity .3s ease;line-height:normal}.is-small .bookingjs-form-success-message{padding:22px 10px}.bookingjs-form-success-message .title{font-size:20px;display:block;margin-bottom:25px}.bookingjs-form-success-message .body{display:block}.bookingjs-form-success-message .body .booked-email{color:#aeaeae}.bookingjs-form.success .bookingjs-form-success-message{opacity:1;top:0;bottom:0}.bookingjs-form-input,.bookingjs-form input,.bookingjs-form input:invalid textarea,.bookingjs-form textarea:invalid{-webkit-transition:box-shadow .2s ease;transition:box-shadow .2s ease;width:100%;padding:15px 25px;margin:0;border:0 solid #ececec;font-size:1em;box-shadow:inset 0 0 1px 1px hsla(0,0%,100%,0);text-align:left;box-sizing:border-box;line-height:normal;font-family:Open Sans,Helvetica,Tahoma,Arial,sans-serif;color:#333;overflow:auto}.bookingjs-form-input:focus,.bookingjs-form input:focus,.bookingjs-form input:invalid textarea:focus,.bookingjs-form textarea:invalid:focus{outline:0;box-shadow:inset 0 0 1px 1px #689ad8}.bookingjs-form-input.hidden,.bookingjs-form input.hidden,.bookingjs-form input:invalid textarea.hidden,.bookingjs-form textarea:invalid.hidden{display:none}.bookingjs-form-input:-moz-read-only,.bookingjs-form input:-moz-read-only,.bookingjs-form input:invalid textarea:-moz-read-only,.bookingjs-form textarea:invalid:-moz-read-only{cursor:not-allowed;font-style:italic}.bookingjs-form-input:read-only,.bookingjs-form input:invalid textarea:read-only,.bookingjs-form input:read-only,.bookingjs-form textarea:invalid:read-only{cursor:not-allowed;font-style:italic}.bookingjs-form-input:-moz-read-only:focus,.bookingjs-form input:-moz-read-only:focus,.bookingjs-form input:invalid textarea:-moz-read-only:focus,.bookingjs-form textarea:invalid:-moz-read-only:focus{box-shadow:inset 0 0 1px 1px #d8d8d8}.bookingjs-form-input:read-only:focus,.bookingjs-form input:invalid textarea:read-only:focus,.bookingjs-form input:read-only:focus,.bookingjs-form textarea:invalid:read-only:focus{box-shadow:inset 0 0 1px 1px #d8d8d8}.bookingjs-form-button{position:relative;-webkit-transition:background-color .2s,max-width .3s;transition:background-color .2s,max-width .3s;display:inline-block;padding:13px 25px;background-color:#689ad8;text-transform:uppercase;box-shadow:0 1px 3px 0 rgba(0,0,0,.15);color:#fff;border:0;border-radius:3px;font-size:1.1em;font-weight:600;margin-top:30px;cursor:pointer;height:44px;outline:0;text-align:center;max-width:200px}.bookingjs-form-button .error-text,.bookingjs-form-button .loading-text,.bookingjs-form-button .success-text{-webkit-transition:opacity .3s ease;transition:opacity .3s ease;position:absolute;top:13px;left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%);opacity:0}.bookingjs-form-button .inactive-text{white-space:nowrap;opacity:1}.bookingjs-form-button .loading-text svg{height:19px;width:19px;-webkit-animation:spin .6s infinite linear;animation:spin .6s infinite linear}.bookingjs-form-button .error-text svg{height:15px;width:15px;margin-top:2px}.bookingjs-form-button .success-text svg{height:15px;margin-top:2px;-webkit-transform:scale(0);transform:scale(0);-webkit-transition:-webkit-transform .6s ease;transition:-webkit-transform .6s ease;transition:transform .6s ease;transition:transform .6s ease,-webkit-transform .6s ease}.bookingjs-form-button:focus,.bookingjs-form-button:hover{background-color:#3f7fce}.bookingjs-form-button.button-shake{-webkit-animation:shake .5s 1 ease;animation:shake .5s 1 ease}.bookingjs-form.loading .bookingjs-form-button,.bookingjs-form.loading .bookingjs-form-button:hover{max-width:80px;background-color:#b1b1b1;cursor:not-allowed}.bookingjs-form.loading .bookingjs-form-button .inactive-text,.bookingjs-form.loading .bookingjs-form-button:hover .inactive-text{opacity:0}.bookingjs-form.loading .bookingjs-form-button .loading-text,.bookingjs-form.loading .bookingjs-form-button:hover .loading-text{opacity:1}.bookingjs-form.error .bookingjs-form-button,.bookingjs-form.error .bookingjs-form-button:hover{max-width:80px;background-color:#d83b46;cursor:not-allowed}.bookingjs-form.error .bookingjs-form-button .inactive-text,.bookingjs-form.error .bookingjs-form-button:hover .inactive-text{opacity:0}.bookingjs-form.error .bookingjs-form-button .error-text,.bookingjs-form.error .bookingjs-form-button:hover .error-text{opacity:1}.bookingjs-form.success .bookingjs-form-button,.bookingjs-form.success .bookingjs-form-button:hover{max-width:80px;background-color:#5baf56;cursor:not-allowed}.bookingjs-form.success .bookingjs-form-button.selfclosing,.bookingjs-form.success .bookingjs-form-button:hover.selfclosing{cursor:pointer}.bookingjs-form.success .bookingjs-form-button .inactive-text,.bookingjs-form.success .bookingjs-form-button:hover .inactive-text{opacity:0}.bookingjs-form.success .bookingjs-form-button .success-text,.bookingjs-form.success .bookingjs-form-button:hover .success-text{opacity:1}.bookingjs-form.success .bookingjs-form-button .success-text svg,.bookingjs-form.success .bookingjs-form-button:hover .success-text svg{-webkit-transform:scale(1);transform:scale(1)}.bookingjs-poweredby{position:absolute;bottom:0;left:0;right:0;text-align:center;padding:7px 10px}.bookingjs-poweredby a{-webkit-transition:color .2s ease;transition:color .2s ease;color:#aeaeae;text-decoration:none}.bookingjs-poweredby a svg path{-webkit-transition:fill .2s ease;transition:fill .2s ease;fill:#aeaeae}.bookingjs-poweredby a:hover{color:#333}.bookingjs-poweredby a:hover svg path{fill:#333}.bookingjs-timekitlogo{width:15px;height:15px;margin-right:5px;vertical-align:sub}", ""]);
	
	// exports


/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = "<svg class=\"bookingjs-timezoneicon\" viewBox=\"0 0 98 98\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\"><title>Shape</title><desc>Created with Sketch.</desc><defs></defs><g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\"><g id=\"timezone-icon\" sketch:type=\"MSLayerGroup\" fill=\"#AEAEAE\"><path d=\"M37.656,1.387 L39.381,2.516 L46.176,3.475 L49.313,2.778 L55.186,3.495 L56.364,5.065 L52.274,4.52 L48.092,6.262 L49.293,9.385 L53.613,11.348 L54.189,7.395 L58.285,7.133 L64.121,12.707 L65.775,14.887 L66.56,16.28 L62.029,18.067 L55.185,21.169 L54.624,24.206 L50.095,28.476 L50.271,32.572 L48.9,32.559 L48.353,29.086 L45.757,28.238 L38.294,28.631 L35.286,34.137 L37.901,37.274 L42.221,34.917 L42.516,38.755 L44.172,40.062 L47.131,43.46 L46.985,47.751 L52.448,49.034 L56.454,46.159 L58.284,46.768 L65.003,49.45 L74.433,52.985 L76.396,57.698 L83.111,60.968 L84.644,66.732 L80.062,71.857 L74.66,77.519 L68.933,80.482 L63.04,84.408 L55.185,89.515 L50.835,93.941 L49.292,92.263 L52.782,83.419 L53.663,73.167 L46.15,66.34 L46.199,60.596 L48.164,58.239 L50.471,51.415 L45.809,48.811 L42.664,43.706 L37.75,41.817 L30.047,37.667 L26.904,29.024 L25.334,33.344 L22.977,26.276 L23.762,15.671 L27.69,12.136 L26.512,9.779 L29.26,5.459 L23.905,6.99 C9.611,15.545 0.01,31.135 0.01,49.006 C0.01,76.062 21.945,98 49.006,98 C76.062,98 98,76.062 98,49.006 C98,21.947 76.062,0.012 49.006,0.012 C45.092,0.012 41.305,0.52 37.656,1.387 Z\" id=\"Shape\" sketch:type=\"MSShapeGroup\"></path></g></g></svg>"

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(47);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"bookingjs-timezonehelper\">");t.b("\n");t.b("\n" + i);t.b("  ");t.b(t.t(t.f("timezoneIcon",c,p,0)));t.b("\n");t.b("\n" + i);if(t.s(t.f("loading",c,p,1),c,p,0,79,117,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("    <span>");t.b(t.v(t.f("loadingText",c,p,0)));t.b("</span>");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.f("loading",c,p,1),c,p,1,0,0,"")){if(t.s(t.f("timezoneDifference",c,p,1),c,p,0,179,227,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("      <span>");t.b(t.v(t.f("timezoneDifferent",c,p,0)));t.b("</span>");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.f("timezoneDifference",c,p,1),c,p,1,0,0,"")){t.b("      <span>");t.b(t.v(t.f("timezoneSame",c,p,0)));t.b("</span>");t.b("\n" + i);};};t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"bookingjs-timezonehelper\">\n\n  {{& timezoneIcon }}\n\n  {{# loading }}\n    <span>{{ loadingText }}</span>\n  {{/ loading }}\n\n  {{^ loading }}\n    {{# timezoneDifference }}\n      <span>{{ timezoneDifferent }}</span>\n    {{/ timezoneDifference }}\n\n    {{^ timezoneDifference }}\n      <span>{{ timezoneSame }}</span>\n    {{/ timezoneDifference }}\n  {{/ loading }}\n\n</div>\n", H);return T; }();

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */
	
	// This file is for use with Node.js. See dist/ for browser files.
	
	var Hogan = __webpack_require__(48);
	Hogan.Template = __webpack_require__(49).Template;
	Hogan.template = Hogan.Template;
	module.exports = Hogan;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */
	
	(function (Hogan) {
	  // Setup regex  assignments
	  // remove whitespace according to Mustache spec
	  var rIsWhitespace = /\S/,
	      rQuot = /\"/g,
	      rNewline =  /\n/g,
	      rCr = /\r/g,
	      rSlash = /\\/g,
	      rLineSep = /\u2028/,
	      rParagraphSep = /\u2029/;
	
	  Hogan.tags = {
	    '#': 1, '^': 2, '<': 3, '$': 4,
	    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
	    '{': 10, '&': 11, '_t': 12
	  };
	
	  Hogan.scan = function scan(text, delimiters) {
	    var len = text.length,
	        IN_TEXT = 0,
	        IN_TAG_TYPE = 1,
	        IN_TAG = 2,
	        state = IN_TEXT,
	        tagType = null,
	        tag = null,
	        buf = '',
	        tokens = [],
	        seenTag = false,
	        i = 0,
	        lineStart = 0,
	        otag = '{{',
	        ctag = '}}';
	
	    function addBuf() {
	      if (buf.length > 0) {
	        tokens.push({tag: '_t', text: new String(buf)});
	        buf = '';
	      }
	    }
	
	    function lineIsWhitespace() {
	      var isAllWhitespace = true;
	      for (var j = lineStart; j < tokens.length; j++) {
	        isAllWhitespace =
	          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
	          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
	        if (!isAllWhitespace) {
	          return false;
	        }
	      }
	
	      return isAllWhitespace;
	    }
	
	    function filterLine(haveSeenTag, noNewLine) {
	      addBuf();
	
	      if (haveSeenTag && lineIsWhitespace()) {
	        for (var j = lineStart, next; j < tokens.length; j++) {
	          if (tokens[j].text) {
	            if ((next = tokens[j+1]) && next.tag == '>') {
	              // set indent to token value
	              next.indent = tokens[j].text.toString()
	            }
	            tokens.splice(j, 1);
	          }
	        }
	      } else if (!noNewLine) {
	        tokens.push({tag:'\n'});
	      }
	
	      seenTag = false;
	      lineStart = tokens.length;
	    }
	
	    function changeDelimiters(text, index) {
	      var close = '=' + ctag,
	          closeIndex = text.indexOf(close, index),
	          delimiters = trim(
	            text.substring(text.indexOf('=', index) + 1, closeIndex)
	          ).split(' ');
	
	      otag = delimiters[0];
	      ctag = delimiters[delimiters.length - 1];
	
	      return closeIndex + close.length - 1;
	    }
	
	    if (delimiters) {
	      delimiters = delimiters.split(' ');
	      otag = delimiters[0];
	      ctag = delimiters[1];
	    }
	
	    for (i = 0; i < len; i++) {
	      if (state == IN_TEXT) {
	        if (tagChange(otag, text, i)) {
	          --i;
	          addBuf();
	          state = IN_TAG_TYPE;
	        } else {
	          if (text.charAt(i) == '\n') {
	            filterLine(seenTag);
	          } else {
	            buf += text.charAt(i);
	          }
	        }
	      } else if (state == IN_TAG_TYPE) {
	        i += otag.length - 1;
	        tag = Hogan.tags[text.charAt(i + 1)];
	        tagType = tag ? text.charAt(i + 1) : '_v';
	        if (tagType == '=') {
	          i = changeDelimiters(text, i);
	          state = IN_TEXT;
	        } else {
	          if (tag) {
	            i++;
	          }
	          state = IN_TAG;
	        }
	        seenTag = i;
	      } else {
	        if (tagChange(ctag, text, i)) {
	          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
	                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
	          buf = '';
	          i += ctag.length - 1;
	          state = IN_TEXT;
	          if (tagType == '{') {
	            if (ctag == '}}') {
	              i++;
	            } else {
	              cleanTripleStache(tokens[tokens.length - 1]);
	            }
	          }
	        } else {
	          buf += text.charAt(i);
	        }
	      }
	    }
	
	    filterLine(seenTag, true);
	
	    return tokens;
	  }
	
	  function cleanTripleStache(token) {
	    if (token.n.substr(token.n.length - 1) === '}') {
	      token.n = token.n.substring(0, token.n.length - 1);
	    }
	  }
	
	  function trim(s) {
	    if (s.trim) {
	      return s.trim();
	    }
	
	    return s.replace(/^\s*|\s*$/g, '');
	  }
	
	  function tagChange(tag, text, index) {
	    if (text.charAt(index) != tag.charAt(0)) {
	      return false;
	    }
	
	    for (var i = 1, l = tag.length; i < l; i++) {
	      if (text.charAt(index + i) != tag.charAt(i)) {
	        return false;
	      }
	    }
	
	    return true;
	  }
	
	  // the tags allowed inside super templates
	  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};
	
	  function buildTree(tokens, kind, stack, customTags) {
	    var instructions = [],
	        opener = null,
	        tail = null,
	        token = null;
	
	    tail = stack[stack.length - 1];
	
	    while (tokens.length > 0) {
	      token = tokens.shift();
	
	      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
	        throw new Error('Illegal content in < super tag.');
	      }
	
	      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
	        stack.push(token);
	        token.nodes = buildTree(tokens, token.tag, stack, customTags);
	      } else if (token.tag == '/') {
	        if (stack.length === 0) {
	          throw new Error('Closing tag without opener: /' + token.n);
	        }
	        opener = stack.pop();
	        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
	          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
	        }
	        opener.end = token.i;
	        return instructions;
	      } else if (token.tag == '\n') {
	        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
	      }
	
	      instructions.push(token);
	    }
	
	    if (stack.length > 0) {
	      throw new Error('missing closing tag: ' + stack.pop().n);
	    }
	
	    return instructions;
	  }
	
	  function isOpener(token, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].o == token.n) {
	        token.tag = '#';
	        return true;
	      }
	    }
	  }
	
	  function isCloser(close, open, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].c == close && tags[i].o == open) {
	        return true;
	      }
	    }
	  }
	
	  function stringifySubstitutions(obj) {
	    var items = [];
	    for (var key in obj) {
	      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
	    }
	    return "{ " + items.join(",") + " }";
	  }
	
	  function stringifyPartials(codeObj) {
	    var partials = [];
	    for (var key in codeObj.partials) {
	      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
	    }
	    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
	  }
	
	  Hogan.stringify = function(codeObj, text, options) {
	    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
	  }
	
	  var serialNo = 0;
	  Hogan.generate = function(tree, text, options) {
	    serialNo = 0;
	    var context = { code: '', subs: {}, partials: {} };
	    Hogan.walk(tree, context);
	
	    if (options.asString) {
	      return this.stringify(context, text, options);
	    }
	
	    return this.makeTemplate(context, text, options);
	  }
	
	  Hogan.wrapMain = function(code) {
	    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
	  }
	
	  Hogan.template = Hogan.Template;
	
	  Hogan.makeTemplate = function(codeObj, text, options) {
	    var template = this.makePartials(codeObj);
	    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
	    return new this.template(template, text, this, options);
	  }
	
	  Hogan.makePartials = function(codeObj) {
	    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
	    for (key in template.partials) {
	      template.partials[key] = this.makePartials(template.partials[key]);
	    }
	    for (key in codeObj.subs) {
	      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
	    }
	    return template;
	  }
	
	  function esc(s) {
	    return s.replace(rSlash, '\\\\')
	            .replace(rQuot, '\\\"')
	            .replace(rNewline, '\\n')
	            .replace(rCr, '\\r')
	            .replace(rLineSep, '\\u2028')
	            .replace(rParagraphSep, '\\u2029');
	  }
	
	  function chooseMethod(s) {
	    return (~s.indexOf('.')) ? 'd' : 'f';
	  }
	
	  function createPartial(node, context) {
	    var prefix = "<" + (context.prefix || "");
	    var sym = prefix + node.n + serialNo++;
	    context.partials[sym] = {name: node.n, partials: {}};
	    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
	    return sym;
	  }
	
	  Hogan.codegen = {
	    '#': function(node, context) {
	      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
	                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
	                      't.rs(c,p,' + 'function(c,p,t){';
	      Hogan.walk(node.nodes, context);
	      context.code += '});c.pop();}';
	    },
	
	    '^': function(node, context) {
	      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
	      Hogan.walk(node.nodes, context);
	      context.code += '};';
	    },
	
	    '>': createPartial,
	    '<': function(node, context) {
	      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
	      Hogan.walk(node.nodes, ctx);
	      var template = context.partials[createPartial(node, context)];
	      template.subs = ctx.subs;
	      template.partials = ctx.partials;
	    },
	
	    '$': function(node, context) {
	      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
	      Hogan.walk(node.nodes, ctx);
	      context.subs[node.n] = ctx.code;
	      if (!context.inPartial) {
	        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
	      }
	    },
	
	    '\n': function(node, context) {
	      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
	    },
	
	    '_v': function(node, context) {
	      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	    },
	
	    '_t': function(node, context) {
	      context.code += write('"' + esc(node.text) + '"');
	    },
	
	    '{': tripleStache,
	
	    '&': tripleStache
	  }
	
	  function tripleStache(node, context) {
	    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	  }
	
	  function write(s) {
	    return 't.b(' + s + ');';
	  }
	
	  Hogan.walk = function(nodelist, context) {
	    var func;
	    for (var i = 0, l = nodelist.length; i < l; i++) {
	      func = Hogan.codegen[nodelist[i].tag];
	      func && func(nodelist[i], context);
	    }
	    return context;
	  }
	
	  Hogan.parse = function(tokens, text, options) {
	    options = options || {};
	    return buildTree(tokens, '', [], options.sectionTags || []);
	  }
	
	  Hogan.cache = {};
	
	  Hogan.cacheKey = function(text, options) {
	    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
	  }
	
	  Hogan.compile = function(text, options) {
	    options = options || {};
	    var key = Hogan.cacheKey(text, options);
	    var template = this.cache[key];
	
	    if (template) {
	      var partials = template.partials;
	      for (var name in partials) {
	        delete partials[name].instance;
	      }
	      return template;
	    }
	
	    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
	    return this.cache[key] = template;
	  }
	})( true ? exports : Hogan);


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */
	
	var Hogan = {};
	
	(function (Hogan) {
	  Hogan.Template = function (codeObj, text, compiler, options) {
	    codeObj = codeObj || {};
	    this.r = codeObj.code || this.r;
	    this.c = compiler;
	    this.options = options || {};
	    this.text = text || '';
	    this.partials = codeObj.partials || {};
	    this.subs = codeObj.subs || {};
	    this.buf = '';
	  }
	
	  Hogan.Template.prototype = {
	    // render: replaced by generated code.
	    r: function (context, partials, indent) { return ''; },
	
	    // variable escaping
	    v: hoganEscape,
	
	    // triple stache
	    t: coerceToString,
	
	    render: function render(context, partials, indent) {
	      return this.ri([context], partials || {}, indent);
	    },
	
	    // render internal -- a hook for overrides that catches partials too
	    ri: function (context, partials, indent) {
	      return this.r(context, partials, indent);
	    },
	
	    // ensurePartial
	    ep: function(symbol, partials) {
	      var partial = this.partials[symbol];
	
	      // check to see that if we've instantiated this partial before
	      var template = partials[partial.name];
	      if (partial.instance && partial.base == template) {
	        return partial.instance;
	      }
	
	      if (typeof template == 'string') {
	        if (!this.c) {
	          throw new Error("No compiler available.");
	        }
	        template = this.c.compile(template, this.options);
	      }
	
	      if (!template) {
	        return null;
	      }
	
	      // We use this to check whether the partials dictionary has changed
	      this.partials[symbol].base = template;
	
	      if (partial.subs) {
	        // Make sure we consider parent template now
	        if (!partials.stackText) partials.stackText = {};
	        for (key in partial.subs) {
	          if (!partials.stackText[key]) {
	            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
	          }
	        }
	        template = createSpecializedPartial(template, partial.subs, partial.partials,
	          this.stackSubs, this.stackPartials, partials.stackText);
	      }
	      this.partials[symbol].instance = template;
	
	      return template;
	    },
	
	    // tries to find a partial in the current scope and render it
	    rp: function(symbol, context, partials, indent) {
	      var partial = this.ep(symbol, partials);
	      if (!partial) {
	        return '';
	      }
	
	      return partial.ri(context, partials, indent);
	    },
	
	    // render a section
	    rs: function(context, partials, section) {
	      var tail = context[context.length - 1];
	
	      if (!isArray(tail)) {
	        section(context, partials, this);
	        return;
	      }
	
	      for (var i = 0; i < tail.length; i++) {
	        context.push(tail[i]);
	        section(context, partials, this);
	        context.pop();
	      }
	    },
	
	    // maybe start a section
	    s: function(val, ctx, partials, inverted, start, end, tags) {
	      var pass;
	
	      if (isArray(val) && val.length === 0) {
	        return false;
	      }
	
	      if (typeof val == 'function') {
	        val = this.ms(val, ctx, partials, inverted, start, end, tags);
	      }
	
	      pass = !!val;
	
	      if (!inverted && pass && ctx) {
	        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
	      }
	
	      return pass;
	    },
	
	    // find values with dotted names
	    d: function(key, ctx, partials, returnFound) {
	      var found,
	          names = key.split('.'),
	          val = this.f(names[0], ctx, partials, returnFound),
	          doModelGet = this.options.modelGet,
	          cx = null;
	
	      if (key === '.' && isArray(ctx[ctx.length - 2])) {
	        val = ctx[ctx.length - 1];
	      } else {
	        for (var i = 1; i < names.length; i++) {
	          found = findInScope(names[i], val, doModelGet);
	          if (found !== undefined) {
	            cx = val;
	            val = found;
	          } else {
	            val = '';
	          }
	        }
	      }
	
	      if (returnFound && !val) {
	        return false;
	      }
	
	      if (!returnFound && typeof val == 'function') {
	        ctx.push(cx);
	        val = this.mv(val, ctx, partials);
	        ctx.pop();
	      }
	
	      return val;
	    },
	
	    // find values with normal names
	    f: function(key, ctx, partials, returnFound) {
	      var val = false,
	          v = null,
	          found = false,
	          doModelGet = this.options.modelGet;
	
	      for (var i = ctx.length - 1; i >= 0; i--) {
	        v = ctx[i];
	        val = findInScope(key, v, doModelGet);
	        if (val !== undefined) {
	          found = true;
	          break;
	        }
	      }
	
	      if (!found) {
	        return (returnFound) ? false : "";
	      }
	
	      if (!returnFound && typeof val == 'function') {
	        val = this.mv(val, ctx, partials);
	      }
	
	      return val;
	    },
	
	    // higher order templates
	    ls: function(func, cx, partials, text, tags) {
	      var oldTags = this.options.delimiters;
	
	      this.options.delimiters = tags;
	      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
	      this.options.delimiters = oldTags;
	
	      return false;
	    },
	
	    // compile text
	    ct: function(text, cx, partials) {
	      if (this.options.disableLambda) {
	        throw new Error('Lambda features disabled.');
	      }
	      return this.c.compile(text, this.options).render(cx, partials);
	    },
	
	    // template result buffering
	    b: function(s) { this.buf += s; },
	
	    fl: function() { var r = this.buf; this.buf = ''; return r; },
	
	    // method replace section
	    ms: function(func, ctx, partials, inverted, start, end, tags) {
	      var textSource,
	          cx = ctx[ctx.length - 1],
	          result = func.call(cx);
	
	      if (typeof result == 'function') {
	        if (inverted) {
	          return true;
	        } else {
	          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
	          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
	        }
	      }
	
	      return result;
	    },
	
	    // method replace variable
	    mv: function(func, ctx, partials) {
	      var cx = ctx[ctx.length - 1];
	      var result = func.call(cx);
	
	      if (typeof result == 'function') {
	        return this.ct(coerceToString(result.call(cx)), cx, partials);
	      }
	
	      return result;
	    },
	
	    sub: function(name, context, partials, indent) {
	      var f = this.subs[name];
	      if (f) {
	        this.activeSub = name;
	        f(context, partials, this, indent);
	        this.activeSub = false;
	      }
	    }
	
	  };
	
	  //Find a key in an object
	  function findInScope(key, scope, doModelGet) {
	    var val;
	
	    if (scope && typeof scope == 'object') {
	
	      if (scope[key] !== undefined) {
	        val = scope[key];
	
	      // try lookup with get for backbone or similar model data
	      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
	        val = scope.get(key);
	      }
	    }
	
	    return val;
	  }
	
	  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
	    function PartialTemplate() {};
	    PartialTemplate.prototype = instance;
	    function Substitutions() {};
	    Substitutions.prototype = instance.subs;
	    var key;
	    var partial = new PartialTemplate();
	    partial.subs = new Substitutions();
	    partial.subsText = {};  //hehe. substext.
	    partial.buf = '';
	
	    stackSubs = stackSubs || {};
	    partial.stackSubs = stackSubs;
	    partial.subsText = stackText;
	    for (key in subs) {
	      if (!stackSubs[key]) stackSubs[key] = subs[key];
	    }
	    for (key in stackSubs) {
	      partial.subs[key] = stackSubs[key];
	    }
	
	    stackPartials = stackPartials || {};
	    partial.stackPartials = stackPartials;
	    for (key in partials) {
	      if (!stackPartials[key]) stackPartials[key] = partials[key];
	    }
	    for (key in stackPartials) {
	      partial.partials[key] = stackPartials[key];
	    }
	
	    return partial;
	  }
	
	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;
	
	  function coerceToString(val) {
	    return String((val === null || val === undefined) ? '' : val);
	  }
	
	  function hoganEscape(str) {
	    str = coerceToString(str);
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }
	
	  var isArray = Array.isArray || function(a) {
	    return Object.prototype.toString.call(a) === '[object Array]';
	  };
	
	})( true ? exports : Hogan);


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(47);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"bookingjs-avatar\">");t.b("\n" + i);t.b("  <img src=\"");t.b(t.t(t.f("image",c,p,0)));t.b("\" />");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"bookingjs-avatar\">\n  <img src=\"{{& image }}\" />\n</div>\n", H);return T; }();

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(47);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"bookingjs-displayname\">");t.b("\n" + i);t.b("  <span>");t.b(t.v(t.f("name",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"bookingjs-displayname\">\n  <span>{{ name }}</span>\n</div>\n", H);return T; }();

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(47);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("\n" + i);t.b("<input");t.b("\n" + i);t.b("  class=\"bookingjs-form-input input-name\"");t.b("\n" + i);t.b("  type=\"text\"");t.b("\n" + i);t.b("  name=\"name\"");t.b("\n" + i);t.b("  placeholder=\"");t.b(t.v(t.d("fields.name.placeholder",c,p,0)));t.b("\"");t.b("\n" + i);t.b("  ");if(t.s(t.d("fields.name.prefilled",c,p,1),c,p,0,154,191,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" value=\"");t.b(t.v(t.d("fields.name.prefilled",c,p,0)));t.b("\" ");});c.pop();}t.b("\n" + i);t.b("  ");if(t.s(t.d("fields.name.locked",c,p,1),c,p,0,247,257,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" readonly ");});c.pop();}t.b("\n" + i);t.b("  required");t.b("\n" + i);t.b("/>");t.b("\n");t.b("\n" + i);t.b("<input");t.b("\n" + i);t.b("  class=\"bookingjs-form-input input-email\"");t.b("\n" + i);t.b("  type=\"email\"");t.b("\n" + i);t.b("  name=\"email\"");t.b("\n" + i);t.b("  placeholder=\"");t.b(t.v(t.d("fields.email.placeholder",c,p,0)));t.b("\"");t.b("\n" + i);t.b("  ");if(t.s(t.d("fields.email.prefilled",c,p,1),c,p,0,456,494,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" value=\"");t.b(t.v(t.d("fields.email.prefilled",c,p,0)));t.b("\" ");});c.pop();}t.b("\n" + i);t.b("  ");if(t.s(t.d("fields.email.locked",c,p,1),c,p,0,552,562,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" readonly ");});c.pop();}t.b("\n" + i);t.b("  required");t.b("\n" + i);t.b("/>");t.b("\n");t.b("\n" + i);if(t.s(t.d("fields.phone.enabled",c,p,1),c,p,0,631,1011,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  <input");t.b("\n" + i);t.b("    class=\"bookingjs-form-input input-phone\"");t.b("\n" + i);t.b("    type=\"tel\"");t.b("\n" + i);t.b("    name=\"phone\"");t.b("\n" + i);t.b("    placeholder=\"");t.b(t.v(t.d("fields.phone.placeholder",c,p,0)));t.b("\"");t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.phone.prefilled",c,p,1),c,p,0,800,838,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" value=\"");t.b(t.v(t.d("fields.phone.prefilled",c,p,0)));t.b("\" ");});c.pop();}t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.phone.required",c,p,1),c,p,0,900,910,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" required ");});c.pop();}t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.phone.locked",c,p,1),c,p,0,969,979,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" readonly ");});c.pop();}t.b("\n" + i);t.b("  />");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(t.s(t.d("fields.voip.enabled",c,p,1),c,p,0,1066,1437,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  <input");t.b("\n" + i);t.b("    class=\"bookingjs-form-input input-voip\"");t.b("\n" + i);t.b("    type=\"text\"");t.b("\n" + i);t.b("    name=\"voip\"");t.b("\n" + i);t.b("    placeholder=\"");t.b(t.v(t.d("fields.voip.placeholder",c,p,0)));t.b("\"");t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.voip.prefilled",c,p,1),c,p,0,1232,1269,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" value=\"");t.b(t.v(t.d("fields.voip.prefilled",c,p,0)));t.b("\" ");});c.pop();}t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.voip.required",c,p,1),c,p,0,1329,1339,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" required ");});c.pop();}t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.voip.locked",c,p,1),c,p,0,1396,1406,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" readonly ");});c.pop();}t.b("\n" + i);t.b("  />");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(t.s(t.d("fields.location.enabled",c,p,1),c,p,0,1495,1906,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  <input");t.b("\n" + i);t.b("    class=\"bookingjs-form-input input-location\"");t.b("\n" + i);t.b("    type=\"text\"");t.b("\n" + i);t.b("    name=\"location\"");t.b("\n" + i);t.b("    placeholder=\"");t.b(t.v(t.d("fields.location.placeholder",c,p,0)));t.b("\"");t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.location.prefilled",c,p,1),c,p,0,1677,1718,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" value=\"");t.b(t.v(t.d("fields.location.prefilled",c,p,0)));t.b("\" ");});c.pop();}t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.location.required",c,p,1),c,p,0,1786,1796,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" required ");});c.pop();}t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.location.locked",c,p,1),c,p,0,1861,1871,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" readonly ");});c.pop();}t.b("\n" + i);t.b("  />");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(t.s(t.d("fields.comment.enabled",c,p,1),c,p,0,1967,2360,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  <textarea");t.b("\n" + i);t.b("    class=\"bookingjs-form-input input-comment\"");t.b("\n" + i);t.b("    rows=\"3\"");t.b("\n" + i);t.b("    name=\"comment\"");t.b("\n" + i);t.b("    placeholder=\"");t.b(t.v(t.d("fields.comment.placeholder",c,p,0)));t.b("\"");t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.comment.required",c,p,1),c,p,0,2144,2154,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" required ");});c.pop();}t.b("\n" + i);t.b("    ");if(t.s(t.d("fields.comment.locked",c,p,1),c,p,0,2217,2227,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(" readonly ");});c.pop();}t.b(">");if(t.s(t.d("fields.comment.prefilled",c,p,1),c,p,0,2287,2317,"{{ }}")){t.rs(c,p,function(c,p,t){t.b(t.v(t.d("fields.comment.prefilled",c,p,0)));});c.pop();}t.b("</textarea>");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }}, "\n<input\n  class=\"bookingjs-form-input input-name\"\n  type=\"text\"\n  name=\"name\"\n  placeholder=\"{{ fields.name.placeholder }}\"\n  {{# fields.name.prefilled }} value=\"{{ fields.name.prefilled }}\" {{/ fields.name.prefilled }}\n  {{# fields.name.locked }} readonly {{/ fields.name.locked }}\n  required\n/>\n\n<input\n  class=\"bookingjs-form-input input-email\"\n  type=\"email\"\n  name=\"email\"\n  placeholder=\"{{ fields.email.placeholder }}\"\n  {{# fields.email.prefilled }} value=\"{{ fields.email.prefilled }}\" {{/ fields.email.prefilled }}\n  {{# fields.email.locked }} readonly {{/ fields.email.locked }}\n  required\n/>\n\n{{# fields.phone.enabled }}\n  <input\n    class=\"bookingjs-form-input input-phone\"\n    type=\"tel\"\n    name=\"phone\"\n    placeholder=\"{{ fields.phone.placeholder }}\"\n    {{# fields.phone.prefilled }} value=\"{{ fields.phone.prefilled }}\" {{/ fields.phone.prefilled }}\n    {{# fields.phone.required }} required {{/ fields.phone.required }}\n    {{# fields.phone.locked }} readonly {{/ fields.phone.locked }}\n  />\n{{/ fields.phone.enabled }}\n\n{{# fields.voip.enabled }}\n  <input\n    class=\"bookingjs-form-input input-voip\"\n    type=\"text\"\n    name=\"voip\"\n    placeholder=\"{{ fields.voip.placeholder }}\"\n    {{# fields.voip.prefilled }} value=\"{{ fields.voip.prefilled }}\" {{/ fields.voip.prefilled }}\n    {{# fields.voip.required }} required {{/ fields.voip.required }}\n    {{# fields.voip.locked }} readonly {{/ fields.voip.locked }}\n  />\n{{/ fields.voip.enabled }}\n\n{{# fields.location.enabled }}\n  <input\n    class=\"bookingjs-form-input input-location\"\n    type=\"text\"\n    name=\"location\"\n    placeholder=\"{{ fields.location.placeholder }}\"\n    {{# fields.location.prefilled }} value=\"{{ fields.location.prefilled }}\" {{/ fields.location.prefilled }}\n    {{# fields.location.required }} required {{/ fields.location.required }}\n    {{# fields.location.locked }} readonly {{/ fields.location.locked }}\n  />\n{{/ fields.location.enabled }}\n\n{{# fields.comment.enabled }}\n  <textarea\n    class=\"bookingjs-form-input input-comment\"\n    rows=\"3\"\n    name=\"comment\"\n    placeholder=\"{{ fields.comment.placeholder }}\"\n    {{# fields.comment.required }} required {{/ fields.comment.required }}\n    {{# fields.comment.locked }} readonly {{/ fields.comment.locked }}>{{# fields.comment.prefilled }}{{ fields.comment.prefilled }}{{/ fields.comment.prefilled }}</textarea>\n{{/ fields.comment.enabled }}\n", H);return T; }();

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(47);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"bookingjs-bookpage\">");t.b("\n" + i);t.b("  <a class=\"bookingjs-bookpage-close\" href=\"#\">");t.b(t.t(t.f("closeIcon",c,p,0)));t.b("</a>");t.b("\n" + i);t.b("  <h2 class=\"bookingjs-bookpage-date\">");t.b(t.v(t.f("chosenDate",c,p,0)));t.b("</h2>");t.b("\n" + i);t.b("  <h3 class=\"bookingjs-bookpage-time\">");t.b(t.v(t.f("chosenTime",c,p,0)));t.b("</h3>");t.b("\n" + i);t.b("  <form class=\"bookingjs-form\" action=\"#\">");t.b("\n" + i);t.b("    <div class=\"bookingjs-form-box\">");t.b("\n" + i);t.b("      <div class=\"bookingjs-form-success-message\">");t.b("\n" + i);t.b("        <div class=\"title\">");t.b(t.v(t.f("successMessageTitle",c,p,0)));t.b("</div>");t.b("\n" + i);t.b("        <div class=\"body\">");t.b(t.t(t.f("successMessageBody",c,p,0)));t.b("</div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("      <div class=\"bookingjs-form-fields\">");t.b("\n" + i);t.b("        <input class=\"bookingjs-form-input hidden\" type=\"text\" name=\"start\" value=\"");t.b(t.v(t.f("start",c,p,0)));t.b("\" />");t.b("\n" + i);t.b("        <input class=\"bookingjs-form-input hidden\" type=\"text\" name=\"end\" value=\"");t.b(t.v(t.f("end",c,p,0)));t.b("\" />");t.b("\n" + i);t.b(t.rp("<formFields0",c,p,"        "));t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <button class=\"bookingjs-form-button\" type=\"submit\">");t.b("\n" + i);t.b("      <span class=\"inactive-text\">");t.b(t.v(t.f("submitText",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("      <span class=\"loading-text\">");t.b(t.t(t.f("loadingIcon",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("      <span class=\"error-text\">");t.b(t.t(t.f("errorIcon",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("      <span class=\"success-text\">");t.b(t.t(t.f("checkmarkIcon",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("    </button>");t.b("\n" + i);t.b("  </form>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {"<formFields0":{name:"formFields", partials: {}, subs: {  }}}, subs: {  }}, "<div class=\"bookingjs-bookpage\">\n  <a class=\"bookingjs-bookpage-close\" href=\"#\">{{& closeIcon }}</a>\n  <h2 class=\"bookingjs-bookpage-date\">{{ chosenDate }}</h2>\n  <h3 class=\"bookingjs-bookpage-time\">{{ chosenTime }}</h3>\n  <form class=\"bookingjs-form\" action=\"#\">\n    <div class=\"bookingjs-form-box\">\n      <div class=\"bookingjs-form-success-message\">\n        <div class=\"title\">{{ successMessageTitle }}</div>\n        <div class=\"body\">{{& successMessageBody }}</div>\n      </div>\n      <div class=\"bookingjs-form-fields\">\n        <input class=\"bookingjs-form-input hidden\" type=\"text\" name=\"start\" value=\"{{ start }}\" />\n        <input class=\"bookingjs-form-input hidden\" type=\"text\" name=\"end\" value=\"{{ end }}\" />\n        {{> formFields }}\n      </div>\n    </div>\n    <button class=\"bookingjs-form-button\" type=\"submit\">\n      <span class=\"inactive-text\">{{ submitText }}</span>\n      <span class=\"loading-text\">{{& loadingIcon }}</span>\n      <span class=\"error-text\">{{& errorIcon }}</span>\n      <span class=\"success-text\">{{& checkmarkIcon }}</span>\n    </button>\n  </form>\n</div>\n", H);return T; }();

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = "<svg class=\"bookingjs-closeicon\" viewBox=\"0 0 90 90\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\"><title>close-icon</title><desc>Created with Sketch.</desc><defs></defs><g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\"><g id=\"close-icon\" sketch:type=\"MSLayerGroup\" fill=\"#000000\"><path d=\"M58,45 L87.2,15.8 C90.9,12.1 90.9,6.3 87.3,2.7 C83.7,-0.9 77.8,-0.8 74.2,2.8 L45,32 L15.8,2.8 C12.1,-0.9 6.3,-0.9 2.7,2.7 C-0.9,6.3 -0.8,12.2 2.8,15.8 L32,45 L2.8,74.2 C-0.9,77.9 -0.9,83.7 2.7,87.3 C6.3,90.9 12.2,90.8 15.8,87.2 L45,58 L74.2,87.2 C77.9,90.9 83.7,90.9 87.3,87.3 C90.9,83.7 90.8,77.8 87.2,74.2 L58,45 L58,45 Z\" id=\"Shape\" sketch:type=\"MSShapeGroup\"></path></g></g></svg>"

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = "<svg viewBox=\"0 0 38 26\" x=\"0px\" y=\"0px\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\"><path fill=\"#fff\" d=\"M4.59255916,9.14153015 L4.59255916,9.14153015 L4.59255917,9.14153016 C3.61060488,8.15335155 2.0152224,8.15314806 1.03260582,9.1419932 L0.737322592,9.43914816 C-0.245558943,10.4282599 -0.245836003,12.0327396 0.736862454,13.0216671 L12.8967481,25.2586313 C13.4826504,25.8482474 14.3060779,26.1023412 15.1093609,25.9623831 L15.1946218,25.9520176 C15.7962843,25.9101633 16.3621851,25.6553951 16.7974015,25.21742 L37.2642739,4.6208133 C38.2456495,3.63321696 38.2453889,2.02851586 37.2626092,1.03950653 L36.967326,0.742351578 C35.9843771,-0.246827998 34.390543,-0.247513927 33.4085772,0.740676315 L15.4197831,18.8434968 L14.826599,19.4404409 L14.2334149,18.8434968 L4.59255916,9.14153015 Z\" id=\"Path\"></path></svg>"

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = "<svg version=\"1.1\" id=\"loader-1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 38 38\" xml:space=\"preserve\"><path fill=\"#fff\" d=\"M38,19 C38,8.50658975 29.4934102,0 19,0 C8.50658975,0 0,8.50658975 0,19 L5,19 C5,11.2680135 11.2680135,5 19,5 C26.7319865,5 33,11.2680135 33,19 L38,19 Z\" id=\"Oval-1\" sketch:type=\"MSShapeGroup\"></path></path></svg>"

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = "<svg class=\"bookingjs-closeicon\" viewBox=\"0 0 90 90\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\"><title>error-icon</title><desc>Created with Sketch.</desc><defs></defs><g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\"><g id=\"error-icon\" sketch:type=\"MSLayerGroup\" fill=\"#FFFFFF\"><path d=\"M58,45 L87.2,15.8 C90.9,12.1 90.9,6.3 87.3,2.7 C83.7,-0.9 77.8,-0.8 74.2,2.8 L45,32 L15.8,2.8 C12.1,-0.9 6.3,-0.9 2.7,2.7 C-0.9,6.3 -0.8,12.2 2.8,15.8 L32,45 L2.8,74.2 C-0.9,77.9 -0.9,83.7 2.7,87.3 C6.3,90.9 12.2,90.8 15.8,87.2 L45,58 L74.2,87.2 C77.9,90.9 83.7,90.9 87.3,87.3 C90.9,83.7 90.8,77.8 87.2,74.2 L58,45 L58,45 Z\" id=\"Shape\" sketch:type=\"MSShapeGroup\"></path></g></g></svg>"

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(47);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"bookingjs-poweredby\">");t.b("\n" + i);t.b("  <a href=\"http://timekit.io?utm_medium=link&utm_source=");t.b(t.v(t.f("campaignSource",c,p,0)));t.b("&utm_campaign=");t.b(t.v(t.f("campaignName",c,p,0)));t.b("&utm_content=powered-by\" target=\"_blank\">");t.b("\n" + i);t.b("    ");t.b(t.t(t.f("timekitLogo",c,p,0)));t.b("\n" + i);t.b("    <span>Powered by Timekit</span>");t.b("\n" + i);t.b("  </a>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"bookingjs-poweredby\">\n  <a href=\"http://timekit.io?utm_medium=link&utm_source={{ campaignSource }}&utm_campaign={{ campaignName }}&utm_content=powered-by\" target=\"_blank\">\n    {{& timekitLogo }}\n    <span>Powered by Timekit</span>\n  </a>\n</div>\n", H);return T; }();

/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = "<svg class=\"bookingjs-timekitlogo\" viewBox=\"0 0 513 548\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><title>timekit-logo</title><desc>Created with Sketch.</desc><defs></defs><g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\"><g id=\"timekit-logo\" transform=\"translate(9.000000, 9.000000)\" fill=\"#AEAEAE\"><path d=\"M55.2163313,275.621588 L198.50357,163.134257 C227.693194,140.219007 274.527519,140.836287 303.106573,164.516436 L439.222777,277.300154 L294.687237,386.088734 C265.004826,408.430003 217.635083,407.547293 188.834846,384.15411 L55.2163313,275.621588 Z M29.1450782,296.088768 L22.5453033,301.269906 C-6.64628574,324.186699 -6.96035256,361.73094 21.8567615,385.137832 L188.814783,520.750588 C217.626101,544.152772 265.020127,545.031261 294.666324,522.71725 L471.933566,389.292269 C501.58244,366.976243 502.456142,329.694313 473.870647,306.008826 L465.168534,298.798395 L304.79022,419.511467 C268.948833,446.488455 213.042282,445.460488 178.242802,417.194379 L29.1450782,296.088768 Z\" id=\"Base-layer\"></path><path d=\"M303.106573,18.9036609 L473.870647,160.396052 C502.470886,184.093754 501.573077,221.370515 471.912654,243.695235 L294.687237,377.088734 C265.004826,399.430003 217.635083,398.547293 188.834846,375.15411 L21.8366979,239.50876 C-6.94564818,216.130109 -6.64628574,178.573924 22.5453033,155.657132 L198.50357,17.5214821 C227.708304,-5.40562963 274.527519,-4.77648801 303.106573,18.9036609 Z M292.387775,31.8399435 C269.89295,13.2010897 231.857075,12.6958644 208.877526,30.7359084 L32.9192595,168.871558 C12.2117199,185.127966 12.006219,209.880161 32.4287426,226.468491 L199.426891,362.113841 C222.242635,380.64608 261.076006,381.360119 284.584254,363.666001 L461.809671,230.272501 C482.810002,214.466035 483.387128,190.098964 463.151849,173.332334 L292.387775,31.8399435 Z\" id=\"Middle-layer\" stroke=\"#AEAEAE\" stroke-width=\"18\"></path></g></g></svg>"

/***/ }
/******/ ])
});
;
//# sourceMappingURL=booking.js.map