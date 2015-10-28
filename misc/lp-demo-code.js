.fc-view-container {
  background-color: #FBFBFB;
}

.fc-row.fc-widget-header {
  border-bottom: 1px solid #ECECEC;
}

.fc-state-default {
  text-shadow: none;
  box-shadow: none;
  background-image: none;
  background-color: white;
  border-color: white;
}

.fc-state-disabled {
  color: #9FA9BD;
}

.fc-button {
  text-transform: uppercase;
  font-weight: 700;
  font-size: 13px;
}

.fc-content-skeleton {
  border-top: 1px solid #DDD;
}

.fc-toolbar {
  padding: 0px;
  margin-bottom: 0;
  border-bottom: 1px solid #ECECEC;
}

.fc .fc-toolbar > * > button {
  padding: 15px;
  height: auto;
  outline: 0;
  margin-left: 0;
}

.fc .fc-toolbar > * > button .fc-icon {
  font-size: 1.1em;
}

.fc-unthemed .fc-today {
  background: white;
}

.fc-body > tr > .fc-widget-content,
.fc-head > tr > .fc-widget-header {
  border: 0 !important;
}

.fc th {
  border-color: white;
  padding: 5px;
}

.fc-unthemed .fc-divider, .fc-unthemed .fc-popover .fc-header {
  background-color: transparent;
}

.fc-event {
  transition: all 200ms;
  border: none;
  border-left: 3px solid #689AD8;
  padding: 5px;
  background-color: white;
  border-radius: 4px;
  color: #444;
  margin: 1px 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.07);
  cursor: pointer;
}

.fc-event:hover {
  color: white;
  background-color: #4179BF;
  border-left: 3px solid #4179BF;
}

.fc-day-grid-event {
  padding: 15px;
  margin: 5px;
}

.fc-time-grid .fc-slats .fc-minor td {
  border-top-style: none;
}

.fc-time-grid-event .fc-time {
  font-size: 1.1em;
}

.fc-unthemed th, .fc-unthemed td, .fc-unthemed thead, .fc-unthemed tbody, .fc-unthemed .fc-divider, .fc-unthemed .fc-row, .fc-unthemed .fc-popover {
  border-color: #ECECEC;
}

.fc-agendaMonthly-view .fc-event {
  color: white;
}



------------------------------------




jQuery(document).ready(function($) {

  $('#form_success_link').click(function(){
    $('#email').focus();
    $('#email').addClass('input-focushighlight');
  });

  $('#timekit-link-header').click(function(e){
    ga('send', 'event', 'Timekit Link', 'Click', 'Header');
  });

  $('#timekit-link-footer').click(function(e){
    ga('send', 'event', 'Timekit Link', 'Click', 'Footer');
  });

  $('#notify-me-form').submit(function(e) {
    ga('send', 'event', 'Signup', 'Submit', 'Notify me');
  });

  var cal = $('#calendar');
  var localTzOffset = (new Date()).getTimezoneOffset()/60*-1;
  var localTzFormatted = (localTzOffset > 0 ? "+" : "") + localTzOffset;
  $('#localtimezone').text(localTzFormatted);

  var defaultView, height, deviceWidth = jQuery(window).width();
  if (deviceWidth > 480) {
    defaultView = 'agendaWeek';
    height = 600;
  } else {
    defaultView = 'basicDay';
    height = 530; //1132
  }

  cal.fullCalendar({
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
      defaultView: defaultView,
      timezone: 'America/Los_angeles',
      height: height,
      eventClick: timeslotClick,
      defaultDate: '2015-10-25'
    });

  timekit.configure({
    app: 'sign-up',
    timezone: 'America/Los_angeles'
  });

  timekit.setUser(
    'assistant@timekit.io',
    'S3x4oV7rukW2S9d6Fo5cybITiYQWlatiF2ktImi2'
  );

  timekit.findTime(
    ['marty.mcfly@timekit.io'],
    {
      'and': [
        { 'business_hours': {'timezone': 'America/Los_angeles'}},
        { 'exclude_weekend': {'timezone': 'America/Los_angeles'}}
      ],
      'or': [
        { 'specific_day_and_time': {'day': 'Monday', 'start': 10, 'end': 13, 'timezone': 'America/Los_angeles'}},
        { 'specific_day_and_time': {'day': 'Monday', 'start': 16, 'end': 17, 'timezone': 'America/Los_angeles'}},
        { 'specific_day_and_time': {'day': 'Tuesday', 'start': 15, 'end': 18, 'timezone': 'America/Los_angeles'}},
        { 'specific_day_and_time': {'day': 'Tuesday', 'start': 11, 'end': 13, 'timezone': 'America/Los_angeles'}},
        { 'specific_day_and_time': {'day': 'Wednesday', 'start': 15, 'end': 18, 'timezone': 'America/Los_angeles'}},
        { 'specific_day_and_time': {'day': 'Thursday', 'start': 10, 'end': 13, 'timezone': 'America/Los_angeles'}},
        { 'specific_day_and_time': {'day': 'Friday', 'start': 10, 'end': 13, 'timezone': 'America/Los_angeles'}}
      ]
    },
    '3 weeks',
    '1 hour'
  ).then(function(response){

    cal.fullCalendar( 'addEventSource', {
      events: response.data.data
    });

  });

  function timeslotClick(calEvent, jsEvent, view) {
    $('#widget_form_start').val(moment(calEvent.start).format());
    $('#widget_form_end').val(moment(calEvent.end).format());
    $('#widget_form_date').text(moment(calEvent.start).format('D. MMMM YYYY'));
    $('#widget_form_time').text(moment(calEvent.start).format('h:mm a') + ' to ' + moment(calEvent.end).format('h:mm a'));
    $('#widget_form').css('display','block');
    setTimeout(function(){ $('#widget_form').css('opacity','1'); }, 1);
    ga('send', 'event', 'Widget', 'Click', 'Event');
  };

  $('#widget_form_wrap').submit(function(e){
    e.preventDefault();

    var start = $('#widget_form_start').val();
    var end = $('#widget_form_end').val();
    var name = $('#widget_form_name').val()
    var email = $('#widget_form_email').val()
    var where = $('#widget_form_comment').val()
    var button = $('#widget_form_submit');

    ga('send', 'event', 'Widget', 'Click', 'Book It');
    button.val('Processing...');

    timekit.createEvent(
      start,
      end,
      'Booking.js demo appointment', // what
      'Timekit HQ, San Francisco', // where
      'a896241a-4e45-4f5e-ac40-e3442b9a10ca',
      true,
      [email, 'marty.mcfly@timekit.io']
    ).then(function(response) {
      $('#widget_form_block .w-form-done').show();
      $('#widget_form_block .w-form-fail').hide();
      $('#widget_form_wrap').hide();
      $('#widget_form_close').hide();
      button.val('Book it!');
    }).catch(function(result){
      console.log('An error happened booking the meeting!');
      console.log(result);
      $('#widget_form_block .w-form-fail').show();
      if (result.data.error.message) {
          $('#widget_form_error').text(result.data.error.message);
      }
    });
  });
});
