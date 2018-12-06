'use strict';

var interpolate     = require('sprintf-js');
var $               = require('jquery');
var moment          = window.moment = require('moment');
var stringify       = require('json-stringify-safe');
window.fullcalendar = require('fullcalendar');
require('moment-timezone/builds/moment-timezone-with-data-2012-2022.js');
require('fullcalendar/dist/fullcalendar.css');
require('./styles/fullcalendar.scss');
require('./styles/utils.scss');
require('./styles/main.scss');
require('./styles/testmoderibbon.scss');

var timezones    = require('./timezones');

function InitRender(deps) {

  var utils = deps.utils;
  var sdk = deps.sdk;
  var getConfig = deps.config.retrieve;

  // DOM nodes
  var rootTarget;
  var calendarTarget;
  var bookingPageTarget;
  var loadingTarget;
  var errorTarget;

  // State
  var customerTimezone;

  // Make sure DOM element is ready and clean it
  var prepareDOM = function(suppliedConfig) {

    var targetElement = suppliedConfig.el || getConfig().el;

    rootTarget = $(targetElement);

    if (rootTarget.length === 0) {
      throw triggerError('No target DOM element was found (' + targetElement + ')');
    }

    rootTarget.addClass('bookingjs');
    rootTarget.children(':not(script)').remove();

  };

  // Fetch availabile time through Timekit SDK
  var timekitFetchAvailability = function() {

    var args = {
      output_timezone: customerTimezone
    };

    if (getConfig().project_id) args.project_id = getConfig().project_id
    if (getConfig().resources) args.resources = getConfig().resources
    if (getConfig().availability_constraints) args.constraints = getConfig().availability_constraints

    $.extend(args, getConfig().availability);

    utils.doCallback('fetchAvailabilityStarted', args);

    sdk
    .makeRequest({
      method: 'post',
      url: '/availability',
      data: args
    })
    .then(function(response){

      utils.doCallback('fetchAvailabilitySuccessful', response);
      hideLoadingScreen();

      // Render available timeslots in FullCalendar
      if(response.data.length > 0) renderCalendarEvents(response.data);

      // Render test ribbon if enabled
      if (response.headers['timekit-testmode']) renderTestModeRibbon();

    }).catch(function(response){
      utils.doCallback('fetchAvailabilityFailed', response);
      hideLoadingScreen();
      triggerError(['An error with Timekit Fetch Availability occured', response]);
    });

  };

  // Fetch availabile time through Timekit SDK
  var timekitGetBookingSlots = function() {

    utils.doCallback('GetBookingSlotsStarted');

    var requestData = {
      url: '/bookings/groups',
      method: 'get',
      headers: {
        'Timekit-Timezone': customerTimezone
      }
    }

    // scope group booking slots by widget ID if possible
    if (getConfig().project_id) requestData.params = {
      search: 'project.id:' + getConfig().project_id
    }

    sdk
    .makeRequest(requestData)
    .then(function(response){

      var slots = response.data.map(function(item) {
        return {
          title: item.attributes.event_info.what,
          start: item.attributes.event_info.start,
          end: item.attributes.event_info.end,
          booking: item
        }
      })

      // Make sure to sort the slots chronologically,
      // otherwise FullCalendar might skip rendering some of them
      slots.sort(function(a, b) {
        return moment(a.start) - moment(b.start);
      })

      utils.doCallback('getBookingSlotsSuccessful', response);
      hideLoadingScreen();

      // Render available timeslots in FullCalendar
      if(slots.length > 0) renderCalendarEvents(slots);

      // Render test ribbon if enabled
      if (response.headers['timekit-testmode']) renderTestModeRibbon();

    }).catch(function(response){
      utils.doCallback('getBookingSlotsFailed', response);
      hideLoadingScreen();
      triggerError(['An error with Timekit Get Booking Slots occured', response]);
    });

  };

  // Universal functional to retrieve availability through either findtime or group booking slots
  var getAvailability = function() {

    showLoadingScreen();

    calendarTarget.fullCalendar('removeEventSources');

    if (getConfig().booking.graph === 'group_customer' || getConfig().booking.graph === 'group_customer_payment') {
      // If in group bookings mode, fetch slots
      timekitGetBookingSlots();
    } else {
      // If in normal single-participant mode, call findtime
      timekitFetchAvailability();
    }

  };

  // Go to the first timeslot in a list of timeslots
  var goToFirstEvent = function(firstEventStart) {

    calendarTarget.fullCalendar('gotoDate', firstEventStart);

    var firstEventStartHour = moment(firstEventStart).format('H');
    scrollToTime(firstEventStartHour);

  };

  // Scrolls fullcalendar to the specified hour
  var scrollToTime = function(time) {

    // Only proceed for agendaWeek view
    if (calendarTarget.fullCalendar('getView').name !== 'agendaWeek'){
      return;
    }

    // Get height of each hour row
    var slotDuration = calendarTarget.fullCalendar('option', 'slotDuration');
    var slotDurationMinutes = 30;
    if (slotDuration) slotDurationMinutes = slotDuration.slice(3, 5);
    var hours = calendarTarget.find('.fc-slats .fc-minor');
    var hourHeight = $(hours[0]).height() * (60 / slotDurationMinutes);

    // If minTime is set in fullCalendar config, subtract that from the scollTo calculationn
    var minTimeHeight = 0;
    if (getConfig().fullcalendar.minTime) {
      var minTime = moment(getConfig().fullcalendar.minTime, 'HH:mm:ss').format('H');
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

  // Display ribbon if in testmode
  var renderTestModeRibbon = function() {

    var template = require('./templates/testmoderibbon.html');

    var testModeRibbonTarget = $(template.render({
      ribbonText: 'Test Mode',
    }));

    rootTarget.append(testModeRibbonTarget);

  };

  // Calculate and display timezone helper
  var renderFooter = function() {

    var showTimezoneHelper = getConfig().ui.show_timezone_helper;
    var showCredits = getConfig().ui.show_credits;

    // If neither TZ helper or credits is shown, dont render the footer
    if (!showTimezoneHelper && !showCredits) return

    var campaignName = 'widget';
    var campaignSource = window.location.hostname.replace(/\./g, '-');
    if (getConfig().project_id) { campaignName = 'embedded-widget'; }
    if (getConfig().project_slug) { campaignName = 'hosted-widget'; }

    var timezoneIcon = require('!svg-inline!./assets/timezone-icon.svg');
    var arrowDownIcon = require('!svg-inline!./assets/arrow-down-icon.svg');
    var timekitLogo = require('!svg-inline!./assets/timekit-logo.svg');
    var template = require('./templates/footer.html');

    var footerTarget = $(template.render({
      timezoneIcon: timezoneIcon,
      arrowDownIcon: arrowDownIcon,
      listTimezones: timezones,
      timekitLogo: timekitLogo,
      campaignName: campaignName,
      campaignSource: campaignSource,
      showCredits: showCredits,
      showTimezoneHelper: showTimezoneHelper
    }));
    rootTarget.append(footerTarget);

    // Set initial customer timezone
    var pickerSelect = $('.bookingjs-footer-tz-picker-select');
    pickerSelect.val(customerTimezone);
    
    // Listen to changes by the user
    pickerSelect.change(function() {
      setCustomerTimezone(pickerSelect.val());
      $(rootTarget).trigger('customer-timezone-changed');
    })
  };

  // Guess the timezone and set global variable
  var guessCustomerTimezone = function () {
    var tzGuess = moment.tz.guess() || 'UTC';
    setCustomerTimezone(tzGuess);

    // Add the guessed customer timezone to list if its unknwon
    var knownTimezone = $.grep(timezones, function (tz) {
      return tz.key === customerTimezone
    }).length > 0
    if (!knownTimezone) {
      var name = '(' + moment().tz(customerTimezone).format('Z') + ') ' + customerTimezone
      timezones.unshift({
        key: customerTimezone,
        name: name
      });
    }
  }

  // Set timezone
  var setCustomerTimezone = function (newTz) {
    if (!newTz || !moment.tz.zone(newTz)) {
      throw triggerError(['Trying to set invalid or unknown timezone', newTz]);
    }
    customerTimezone = newTz;
  }

  // Setup and render FullCalendar
  var initializeCalendar = function() {

    var sizing = decideCalendarSize(getConfig().fullcalendar.defaultView);

    var args = {
      height: sizing.height,
      eventClick: clickTimeslot,
      windowResize: function() {
        var sizing = decideCalendarSize();
        calendarTarget.fullCalendar('changeView', sizing.view);
        calendarTarget.fullCalendar('option', 'height', sizing.height);
      }
    };

    $.extend(true, args, getConfig().fullcalendar);
    args.defaultView = sizing.view;

    calendarTarget = $('<div class="bookingjs-calendar empty-calendar">');
    rootTarget.append(calendarTarget);

    calendarTarget.fullCalendar(args);

    $(rootTarget).on('customer-timezone-changed', function () {
      if (!calendarTarget) return
      getAvailability();
      calendarTarget.fullCalendar('option', 'now', moment().tz(customerTimezone).format());
    })

    utils.doCallback('fullCalendarInitialized');

  };

  // Clicking a timeslot
  var clickTimeslot = function(eventData) {

    if (!getConfig().disable_confirm_page) {
      showBookingPage(eventData)
    } else {
      $('.fc-event-clicked').removeClass('fc-event-clicked');
      $(this).addClass('fc-event-clicked');
      utils.doCallback('clickTimeslot', eventData);
    }

  };

  // Fires when window is resized and calendar must adhere
  var decideCalendarSize = function(currentView) {

    currentView = currentView || calendarTarget.fullCalendar('getView').name

    var view = getConfig().fullcalendar.defaultView
    var height = 385;

    if (rootTarget.width() < 480) {
      rootTarget.addClass('is-small');
      if (getConfig().ui.avatar) height -= 15;
      if (currentView === 'agendaWeek' || currentView === 'basicDay') {
        view = 'basicDay';
      }
    } else {
      rootTarget.removeClass('is-small');
    }

    $.each(getConfig().customer_fields, function(key, field) {
      if (field.format === 'textarea') height += 98;
      else if (field.format === 'checkbox') height += 51;
      else height += 66;
    })

    return {
      height: height,
      view: view
    };

  };

  // Render the supplied calendar events in FullCalendar
  var renderCalendarEvents = function(eventData) {

    var firstEventStart = moment(eventData[0].start)
    var firstEventEnd = moment(eventData[0].end)
    var firstEventDuration = firstEventEnd.diff(firstEventStart, 'minutes')

    if (firstEventDuration <= 90) {
      calendarTarget.fullCalendar('option', 'slotDuration', '00:15:00')
    }

    calendarTarget.fullCalendar('addEventSource', {
      events: eventData
    });

    calendarTarget.removeClass('empty-calendar');

    // Go to first event if enabled
    goToFirstEvent(eventData[0].start);

  };

  // Render the avatar image
  var renderAvatarImage = function() {

    var template = require('./templates/user-avatar.html');
    var avatarTarget = $(template.render({
      image: getConfig().ui.avatar
    }));

    rootTarget.addClass('has-avatar');
    rootTarget.append(avatarTarget);

  };

  // Render the avatar image
  var renderDisplayName = function() {

    var template = require('./templates/user-displayname.html');
    var displayNameTarget = $(template.render({
      name: getConfig().ui.display_name
    }));

    rootTarget.addClass('has-displayname');
    rootTarget.append(displayNameTarget);

  };

  // Show loading spinner screen
  var showLoadingScreen = function() {

    utils.doCallback('showLoadingScreen');

    var template = require('./templates/loading.html');
    loadingTarget = $(template.render({
      loadingIcon: require('!svg-inline!./assets/loading-spinner.svg')
    }));

    rootTarget.append(loadingTarget);

  };

  // Remove the booking page DOM node
  var hideLoadingScreen = function() {

    utils.doCallback('hideLoadingScreen');
    loadingTarget.removeClass('show');

    setTimeout(function(){
      loadingTarget.remove();
    }, 500);

  };

  // Show error and warning screen
  var triggerError = function(message) {

    // If an error already has been thrown, exit
    if (errorTarget) return message

    utils.doCallback('errorTriggered', message);
    utils.logError(message)

    // If no target DOM element exists, only do the logging
    if (!rootTarget) return message

    var messageProcessed = message
    var contextProcessed = null

    if (utils.isArray(message)) {
      messageProcessed = message[0]
      if (message[1].data) {
        contextProcessed = stringify(message[1].data.errors || message[1].data.error || message[1].data)
      } else {
        contextProcessed = stringify(message[1])
      }
    }

    var template = require('./templates/error.html');
    errorTarget = $(template.render({
      errorWarningIcon: require('!svg-inline!./assets/error-warning-icon.svg'),
      message: messageProcessed,
      context: contextProcessed
    }));

    rootTarget.append(errorTarget);

    return message

  };

  // Render customer fields
  var renderCustomerFields = function () {
    
    var textTemplate = require('./templates/fields/text.html');
    var textareaTemplate = require('./templates/fields/textarea.html');
    var selectTemplate = require('./templates/fields/select.html');
    var checkboxTemplate = require('./templates/fields/checkbox.html');

    var fieldsTarget = []
    $.each(getConfig().customer_fields, function(key, field) {
      var tmpl = textTemplate
      if (field.format === 'textarea') tmpl = textareaTemplate
      if (field.format === 'select') tmpl = selectTemplate
      if (field.format === 'checkbox') tmpl = checkboxTemplate
      if (!field.format) field.format = 'text'
      if (key === 'email') field.format = 'email'
      var data = $.extend({
        key: key,
        arrowDownIcon: require('!svg-inline!./assets/arrow-down-icon.svg')
      }, field)
      var fieldTarget = $(tmpl.render(data))
      fieldsTarget.push(fieldTarget)
    })

    return fieldsTarget
  }

  // Event handler when a timeslot is clicked in FullCalendar
  var showBookingPage = function(eventData) {

    utils.doCallback('showBookingPage', eventData);

    var template = require('./templates/booking-page.html');

    var dateFormat = getConfig().ui.booking_date_format || moment.localeData().longDateFormat('LL');
    var timeFormat = getConfig().ui.booking_time_format || moment.localeData().longDateFormat('LT');
    var allocatedResource = eventData.resources ? eventData.resources[0].name : false;

    bookingPageTarget = $(template.render({
      chosenDate:               formatTimestamp(eventData.start, dateFormat),
      chosenTime:               formatTimestamp(eventData.start, timeFormat) + ' - ' + formatTimestamp(eventData.end, timeFormat),
      allocatedResourcePrefix:  getConfig().ui.localization.allocated_resource_prefix,
      allocatedResource:        allocatedResource,
      closeIcon:                require('!svg-inline!./assets/close-icon.svg'),
      checkmarkIcon:            require('!svg-inline!./assets/checkmark-icon.svg'),
      loadingIcon:              require('!svg-inline!./assets/loading-spinner.svg'),
      errorIcon:                require('!svg-inline!./assets/error-icon.svg'),
      submitText:               getConfig().ui.localization.submit_button,
      successMessage:           interpolate.sprintf(getConfig().ui.localization.success_message, '<span class="booked-email"></span>')
    }));

    var formFields = bookingPageTarget.find('.bookingjs-form-fields');
    $(formFields).append(renderCustomerFields());
    
    var form = bookingPageTarget.children('.bookingjs-form');

    bookingPageTarget.children('.bookingjs-bookpage-close').click(function(e) {
      e.preventDefault();
      var bookingHasBeenCreated = $(form).hasClass('success');
      if (bookingHasBeenCreated) getAvailability();
      hideBookingPage();
    });

    if (eventData.resources) {
      utils.logDebug(['Available resources for chosen timeslot:', eventData.resources]);
    }

    form.find('.bookingjs-form-input').on('input', function() {
      var field = $(this).closest('.bookingjs-form-field');
      if (this.value) field.addClass('bookingjs-form-field--dirty');
      else field.removeClass('bookingjs-form-field--dirty');
    });

    form.submit(function(e) {
      submitBookingForm(this, e, eventData);
    });

    $(rootTarget).on('customer-timezone-changed', function () {
      if (!bookingPageTarget) return
      $('.bookingjs-bookpage-date').text(formatTimestamp(eventData.start, dateFormat));
      $('.bookingjs-bookpage-time').text(formatTimestamp(eventData.start, timeFormat) + ' - ' + formatTimestamp(eventData.end, timeFormat));
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

  // Output timestamp into given format in customers timezone
  var formatTimestamp = function (start, format) {
    return moment(start).tz(customerTimezone).format(format);
  }

  // Remove the booking page DOM node
  var hideBookingPage = function() {

    utils.doCallback('closeBookingPage');

    bookingPageTarget.removeClass('show');

    setTimeout(function(){
      bookingPageTarget.remove();
    }, 200);

    $(document).off('keyup');

  };

  // Event handler on form submit
  var submitBookingForm = function(form, e, eventData) {

    e.preventDefault();

    var formElement = $(form);

    if(formElement.hasClass('success')) {
      getAvailability();
      hideBookingPage();
      return;
    }

    // Abort if form is submitting, have submitted or does not validate
    if(formElement.hasClass('loading') || formElement.hasClass('error') || !e.target.checkValidity()) {
      var submitButton = formElement.find('.bookingjs-form-button');
      submitButton.addClass('button-shake');
      setTimeout(function() {
        submitButton.removeClass('button-shake');
      }, 500);
      return;
    }

    var formData = {};
    $.each(formElement.serializeArray(), function(i, field) {
      formData[field.name] = field.value;
    });

    formElement.addClass('loading');

    utils.doCallback('submitBookingForm', formData);

    // Call create event endpoint
    timekitCreateBooking(formData, eventData).then(function(response){

      formElement.find('.booked-email').html(formData.email);
      formElement.removeClass('loading').addClass('success');

    }).catch(function(response){

      showBookingFailed(formElement)

    });

  };

  var showBookingFailed = function (formElement) {

    var submitButton = formElement.find('.bookingjs-form-button');
    submitButton.addClass('button-shake');
    setTimeout(function() {
      submitButton.removeClass('button-shake');
    }, 500);

    formElement.removeClass('loading').addClass('error');
    setTimeout(function() {
      formElement.removeClass('error');
    }, 2000);

  }

  // Create new booking
  var timekitCreateBooking = function(formData, eventData) {

    var nativeFields = ['name', 'email', 'location', 'comment', 'phone', 'voip']

    var args = {
      start: eventData.start.format(),
      end: eventData.end.format(),
      description: '',
      customer: {
        name: formData.name,
        email: formData.email,
        timezone: customerTimezone
      },
      participants: [formData.email]
    };

    if (getConfig().project_id) {
      args.project_id = getConfig().project_id
    } else {
      $.extend(true, args, {
        what: 'Meeting with ' + formData.name,
        where: 'TBD'
      });
    }

    if (getConfig().customer_fields.location) {
      args.customer.where = formData.location;
      args.where = formData.location;
    }
    if (getConfig().customer_fields.comment) {
      args.customer.comment = formData.comment;
      args.description += (getConfig().customer_fields.comment.title || 'Comment') + ': ' + formData.comment + '\n';
    }
    if (getConfig().customer_fields.phone) {
      args.customer.phone = formData.phone;
      args.description += (getConfig().customer_fields.phone.title || 'Phone') + ': ' + formData.phone + '\n';
    }
    if (getConfig().customer_fields.voip) {
      args.customer.voip = formData.voip;
      args.description += (getConfig().customer_fields.voip.title || 'Voip') + ': ' + formData.voip + '\n';
    }

    // Save custom fields in meta object
    $.each(getConfig().customer_fields, function(key, field) {
      if ($.inArray(key, nativeFields) >= 0) return
      if (field.format === 'checkbox') formData[key] = !!formData[key]
      args.customer[key] = formData[key]
      args.description += (getConfig().customer_fields[key].title || key) + ': ' + formData[key] + '\n';
    })

    if (getConfig().booking.graph === 'group_customer' || getConfig().booking.graph === 'group_customer_payment') {
      args.related = { owner_booking_id: eventData.booking.id }
      args.resource_id = eventData.booking.resource.id
    } else if (typeof eventData.resources === 'undefined' || eventData.resources.length === 0) {
      throw triggerError(['No resources to pick from when creating booking']);
    } else {
      args.resource_id = eventData.resources[0].id
    }

    $.extend(true, args, getConfig().booking);

    utils.doCallback('createBookingStarted', args);

    var request = sdk
    .include(getConfig().create_booking_response_include)
    .createBooking(args);

    request
    .then(function(response){
      utils.doCallback('createBookingSuccessful', response);
    }).catch(function(response){
      utils.doCallback('createBookingFailed', response);
      triggerError(['An error with Timekit Create Booking occured', response]);
    });

    return request;

  };

  // Destory fullcalendar and cleanup event listeners etc.
  var destroyFullCalendar = function() {
    if (!calendarTarget || calendarTarget.fullCalendar === undefined) return
    calendarTarget.fullCalendar('destroy')
  }

  // The fullCalendar object for advanced puppeting
  var fullCalendar = function() {

    if (calendarTarget.fullCalendar === undefined) { return undefined; }
    return calendarTarget.fullCalendar.apply(calendarTarget, arguments);

  };

  return {
    prepareDOM: prepareDOM,
    getAvailability: getAvailability,
    initializeCalendar: initializeCalendar,
    renderAvatarImage: renderAvatarImage,
    renderDisplayName: renderDisplayName,
    triggerError: triggerError,
    timekitCreateBooking: timekitCreateBooking,
    fullCalendar: fullCalendar,
    destroyFullCalendar: destroyFullCalendar,
    renderFooter: renderFooter,
    guessCustomerTimezone: guessCustomerTimezone,
    setCustomerTimezone: setCustomerTimezone
  }
}

module.exports = InitRender
