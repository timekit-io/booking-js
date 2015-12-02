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

  // Create event endpoint
  createEvent: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/events'
    ).andReturn({
      status: 201,
      statusText: 'HTTP/1.1 201 Created',
      contentType: 'application/json',
      responseText: '{"meta":{"message":"Event created"}}'
    });

  },

  // Mocks all common endpoints
  all: function() {

    this.findTime();
    this.userTimezone();
    this.createEvent();

  }

};