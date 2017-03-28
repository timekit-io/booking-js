'use strict';

var moment = require('moment');

module.exports = {

  // Find time endpoint with results in near future
  findTime: function() {

    var today = moment();
    var tomorrow = moment().add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/findtime'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '"},' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '"},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '"},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '"}' +
      ']}'
    });

  },

  // Find time endpoint with results long into the future
  findTimeWithDateInFuture: function() {

    var future = moment().add(1, 'month').startOf('day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/findtime'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{"start":"' + future.format() + '","end":"' + future.add(1, 'hour').format() + '"}' +
      ']}'
    });

  },

  // Find time endpoint with no results
  findTimeWithNoTimeslots: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/findtime'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[]}'
    });

  },

  // Find time team endpoint with results in near future
  findTimeTeam: function() {

    var today = moment();
    var tomorrow = moment().add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/findtime/team'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","users": [ { "email": "marty.mcfly@timekit.io", "user_id": "bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2", "calendar_ids": [ "22f86f0c-ee80-470c-95e8-dadd9d05edd2" ], "token": "nvHfRSlhvsnlg4rS7Wt28Ty47qdgegwSu3YK7hPW" }, { "email": "doc.brown@timekit.io", "user_id": "gxa0b9fa-36aa-4ae6-8096-f3b20fbed1d2", "calendar_ids": [ "11d86f0c-ee80-470c-95e8-dadd9d05edd2" ], "token": "dwHfRSlhvsnlg4rS7Wt28Ty47qdgegwSu3YK7hPW" } ]},' +
        '{"start":"' + today.format() + '","end":"' + today.add(1, 'hour').format() + '","users": [ { "email": "marty.mcfly@timekit.io", "user_id": "bfa0b9fa-36aa-4ae6-8096-f3b20fbed1d2", "calendar_ids": [ "22f86f0c-ee80-470c-95e8-dadd9d05edd2" ], "token": "nvHfRSlhvsnlg4rS7Wt28Ty47qdgegwSu3YK7hPW" } ]},' +
        '{"start":"' + tomorrow.format() + '","end":"' + tomorrow.add(1, 'hour').format() + '","users": [ { "email": "doc.brown@timekit.io", "user_id": "gxa0b9fa-36aa-4ae6-8096-f3b20fbed1d2", "calendar_ids": [ "11d86f0c-ee80-470c-95e8-dadd9d05edd2" ], "token": "dwHfRSlhvsnlg4rS7Wt28Ty47qdgegwSu3YK7hPW" } ]}' +
      ']}'
    });

  },

  // Get user timezone endpoint
  userTimezone: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/users/timezone/marty.mcfly@timekit.io'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":{"timezone":"America\/Los_Angeles","utc_offset":-8}}'
    });

  },

  // Update booking endpoint
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

  // Get widget endpoint
  getHostedWidget: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/widgets/hosted/my-widget-slug'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{ "data": { "id": "886c0efc-b76b-47c8-945d-bc4e43924c79", "slug": "my-widget-slug", "config": { "email": "marty.mcfly@timekit.io", "apiToken": "XT1JO879JF1qUXXzmETD5ucgxaDwsFsd", "calendar": "22f86f0c-ee80-470c-95e8-dadd9d05edd2", "email": "marty.mcfly@timekit.io", "timekitConfig": { "app": "bookingjs-demo" } } } }'
    });

  },

  // Get widget endpoint
  getEmbedWidget: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/widgets/embed/12345'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{ "data": { "id": "12345", "slug": "my-widget-slug", "config": { "email": "marty.mcfly@timekit.io", "apiToken": "XT1JO879JF1qUXXzmETD5ucgxaDwsFsd", "calendar": "22f86f0c-ee80-470c-95e8-dadd9d05edd2", "name": "Marty McFly", "timekitConfig": { "app": "bookingjs-demo" } } } }'
    });

  },

  // Find time endpoint with results in near future
  groupSlots: function() {

    var today = moment();
    var tomorrow = moment().add(1, 'day');

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings/groups'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":[' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 1 what", "where": "Event 1 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + today.format() + '", "end": "' + today.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"] },' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 2 what", "where": "Event 2 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + today.format() + '", "end": "' + today.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"] },' +
        '{ "id": "87623db3-cb5f-41e8-b85b-23b5efd04e07", "state": "tentative", "graph": "group_owner", "completed": false, "created_at": "2017-02-16T12:40:25+0100", "updated_at": "2017-02-16T12:40:26+0100", "attributes": { "group_booking": { "max_seats": 3, "current_seats": 0 }, "event_info": { "what": "Event 3 what", "where": "Event 3 where", "calendar_id": "da5c5fec-01bb-4686-af20-d7dfb4afa63b", "description": "", "participants": [], "start": "' + tomorrow.format() + '", "end": "' + tomorrow.add(2, 'hour').format() + '" } }, "available_actions": ["complete", "cancel"] }' +
      ']}'
    });

  },

  // Mocks all common endpoints
  all: function() {

    this.findTime();
    this.findTimeTeam();
    this.userTimezone();
    this.createBooking();
    this.getHostedWidget();
    this.getEmbedWidget();
    this.groupSlots();

  }

};
