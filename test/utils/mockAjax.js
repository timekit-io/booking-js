'use strict';

const moment = require('moment');

module.exports = {

  // Find time endpoint with results in near future
  findTime: function() {

    const today = moment();
    const tomorrow = moment().add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/availability'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]}' +
      ']}'
    });

  },

  // Find time endpoint with testmode: true
  findTimeOnTestModeApp: function() {

    const today = moment();
    const tomorrow = moment().add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/availability'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseHeaders: {
        "Timekit-TestMode": 'true'
      },
      responseText: '{"data":[' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]}' +
      ']}'
    });

  },

  // Find time endpoint with results long into the future
  findTimeWithDateInFuture: function() {

    const future = moment().add(1, 'month').startOf('day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/availability'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{"start":"' + future.format() + '","end":"' + future.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]}' +
      ']}'
    });

  },

  // Find time endpoint with no results
  findTimeWithNoTimeslots: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/availability'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[]}'
    });

  },

  // Find time endpoint with no results
  findTimeWithError: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/availability'
    ).andReturn({
      status: 422,
      statusText: 'HTTP/1.1 422 Unprocessable Entity',
      contentType: 'application/json',
      responseText: '{"errors":{"future":["future in not a valid timestamp or relative time"]}}'
    });

  },

  // Find time endpoint with results in near future
  findTimeWithTimezone: function(timezone) {

    const today = moment().tz(timezone);
    const tomorrow = moment().tz(timezone).add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/availability'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]}' +
      ']}'
    });

  },

  // Find time team endpoint with results in near future
  findTimeTeam: function() {

    const today = moment();
    const tomorrow = moment().add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/availability'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2","gxa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2","gxa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2","gxa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","resources":["bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2","gxa0b9fa-36aa-4ae6-8096-f3b20fbed1d2"]}' +
      ']}'
    });

  },

  // Create booking endpoint
  createBooking: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings?include=attributes,event,user',
      undefined,
      'POST'
    ).andReturn({
      status: 201,
      statusText: 'HTTP/1.1 201 Created',
      contentType: 'application/json',
      responseText: '{"data": { "id": "58190fc6-1ec0-4ebb-b627-7ce6aa9fc703", "graph": "confirm_decline", "state": "tentative", "completed": false, "possible_actions": [ "decline", "confirm" ], "created_at": "2016-02-11T11:58:45+0100", "updated_at": "2016-02-11T11:58:47+0100", "attributes": { "event_info": { "start": "2015-03-01T08:00:00+00:00", "end": "2015-03-01T13:00:00+00:00", "what": "Mens haircut", "where": "Sesame St, Middleburg, FL 32068, USA", "description": "Please arrive 10 minutes before you time begin" } }, "calendar": { "id": "c91c5d04-2a57-46c0-ab35-e489dadf132e", "name": "My calendar", "display_name": "My calendar", "description": "Ut adipisci non autem cum ut id.", "foregroundcolor": "#25d6be", "backgroundcolor": "#ea1cb8", "created_at": "2016-02-15T13:21:42+0100", "updated_at": "2016-02-15T13:21:42+0100" }, "customers": [ { "id": "a728e860-99c7-4009-8843-7d9ac5d7f53f", "name": "Marty McFly", "email": "marty.mcfly@timekit.io", "phone": "1-591-001-5403", "voip": "McFly", "timezone": "America/Los_Angeles" } ] } }'
    });

  },

  // Create booking endpoint with custom dynamic include in response
  createBookingWithCustomIncludes: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings?include=provider_event,attributes,event,user',
      undefined,
      'POST'
    ).andReturn({
      status: 201,
      statusText: 'HTTP/1.1 201 Created',
      contentType: 'application/json',
      responseText: '{"data": { "provider_event": { "id": "35653134386234302d623230352d343166622d386132332d613034396339613534326630" }, "id": "58190fc6-1ec0-4ebb-b627-7ce6aa9fc703", "graph": "confirm_decline", "state": "tentative", "completed": false, "possible_actions": [ "decline", "confirm" ], "created_at": "2016-02-11T11:58:45+0100", "updated_at": "2016-02-11T11:58:47+0100", "attributes": { "event_info": { "start": "2015-03-01T08:00:00+00:00", "end": "2015-03-01T13:00:00+00:00", "what": "Mens haircut", "where": "Sesame St, Middleburg, FL 32068, USA", "description": "Please arrive 10 minutes before you time begin" } }, "calendar": { "id": "c91c5d04-2a57-46c0-ab35-e489dadf132e", "name": "My calendar", "display_name": "My calendar", "description": "Ut adipisci non autem cum ut id.", "foregroundcolor": "#25d6be", "backgroundcolor": "#ea1cb8", "created_at": "2016-02-15T13:21:42+0100", "updated_at": "2016-02-15T13:21:42+0100" }, "customers": [ { "id": "a728e860-99c7-4009-8843-7d9ac5d7f53f", "name": "Marty McFly", "email": "marty.mcfly@timekit.io", "phone": "1-591-001-5403", "voip": "McFly", "timezone": "America/Los_Angeles" } ] } }'
    });

  },

  // Create booking endpoint that throws error
  createBookingWithError: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings?include=attributes,event,user',
      undefined,
      'POST'
    ).andReturn({
      status: 422,
      statusText: 'HTTP/1.1 422 Unprocessable Entity',
      contentType: 'application/json',
      responseText: '{"errors":{"event":["calendar id must be a valid UUID"]},"action":"save_booking_data"}'
    });

  },

  // Get widget endpoint
  getHostedWidget: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/projects/hosted/my-widget-slug'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{ "data": { "id": "12345", "slug": "my-widget-slug", "name": "Marty McFly", "app_key": "XT1JO879JF1qUXXzmETD5ucgxaDwsFsd", "ui": { "display_name": "", "show_credits": true, "availability_view": "agendaWeek", "avatar": "", "time_date_format": "12h-mdy-sun", "localization": { "allocated_resource_prefix": "with", "submit_button": "Book it", "success_message": "We have received your booking and sent a confirmation to %s" } }, "booking": { "graph": "instant" }, "customer_fields": { "name": { "type": "string", "title": "Name", "required": true }, "email": { "type": "string", "title": "E-mail", "format": "email", "required": true } } } }'
    });

  },

  // Get widget endpoint
  getEmbedWidget: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/projects/embed/12345'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{ "data": { "id": "12345", "slug": "my-widget-slug", "name": "Marty McFly", "app_key": "XT1JO879JF1qUXXzmETD5ucgxaDwsFsd", "ui": { "display_name": "", "show_credits": true, "availability_view": "agendaWeek", "avatar": "", "time_date_format": "12h-mdy-sun", "localization": { "allocated_resource_prefix": "with", "submit_button": "Book it", "success_message": "We have received your booking and sent a confirmation to %s" } }, "booking": { "graph": "instant" }, "customer_fields": { "name": { "type": "string", "title": "Name", "required": true }, "email": { "type": "string", "title": "E-mail", "format": "email", "required": true } } } }'
    });

  },

  // Get widget endpoint
  getEmbedWidgetExtended: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/projects/embed/12345'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{ "data": { "id": "12345", "slug": "my-widget-slug", "name": "Marty McFly", "app_key": "XT1JO879JF1qUXXzmETD5ucgxaDwsFsd", "ui": { "display_name": "McFlys Widget", "show_credits": true, "availability_view": "agendaWeek", "avatar": "", "time_date_format": "12h-mdy-sun", "localization": { "allocated_resource_prefix": "with", "submit_button": "Book McFly", "success_message": "We have received your booking and sent a confirmation to %s" } }, "booking": { "graph": "confirm_decline" }, "customer_fields": { "name": { "type": "string", "title": "Name", "required": true }, "email": { "type": "string", "title": "E-mail", "format": "email", "required": true }, "phone": { "title": "Phone Number" } } } }'
    });

  },

  // Get widget endpoint
  getNonExistingEmbedWidget: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/projects/embed/54321'
    ).andReturn({
      status: 404,
      statusText: 'HTTP/1.1 404 Not Found',
      contentType: 'application/json',
      responseText: '{ "error": "Resource does not exist", "model": "Widget" }'
    });

  },

  // Find time endpoint with results in near future
  groupSlots: function() {

    const today = moment();
    const tomorrow = moment().add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings/groups'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 1 what", "where": "Event 1 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + today.format() + '", "end": "' + today.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"], "resource": { "id": "67623db3-cb5f-41e8-b85b-23b5efd04e07", "name": "Marty" } },' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 2 what", "where": "Event 2 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + today.format() + '", "end": "' + today.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"], "resource": { "id": "67623db3-cb5f-41e8-b85b-23b5efd04e07", "name": "Marty" } },' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 3 what", "where": "Event 3 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + tomorrow.format() + '", "end": "' + tomorrow.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"], "resource": { "id": "67623db3-cb5f-41e8-b85b-23b5efd04e07", "name": "Marty" } }' +
      ']}'
    });

  },

  // Find time endpoint with results in near future
  groupSlotsWithTimezone: function(timezone) {

    const today = moment().tz(timezone);
    const tomorrow = moment().tz(timezone).add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings/groups'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 1 what", "where": "Event 1 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + today.format() + '", "end": "' + today.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"], "resource": { "id": "67623db3-cb5f-41e8-b85b-23b5efd04e07", "name": "Marty" } },' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 2 what", "where": "Event 2 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + today.format() + '", "end": "' + today.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"], "resource": { "id": "67623db3-cb5f-41e8-b85b-23b5efd04e07", "name": "Marty" } },' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 3 what", "where": "Event 3 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + tomorrow.format() + '", "end": "' + tomorrow.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"], "resource": { "id": "67623db3-cb5f-41e8-b85b-23b5efd04e07", "name": "Marty" } }' +
      ']}'
    });

  },

  // Mocks all common endpoints
  all: function() {
    this.findTime();
    this.findTimeTeam();
    this.createBooking();
    this.getHostedWidget();
    this.getEmbedWidget();
    this.groupSlots();
  }
};
