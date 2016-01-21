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

  // Update booking endpoint
  createBooking: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings',
      undefined,
      'POST'
    ).andReturn({
      status: 201,
      statusText: 'HTTP/1.1 201 Created',
      contentType: 'application/json',
      responseText: '{"data":{"id":"0096163d-54a4-488f-aa3a-0b40111ee4be","state":"initialized","graph":"instant","all_states":["initialized","confirm","customer_data_saved","input_saved","event_created","notified_owner_by_email","notified_customer_by_email","webhook_triggered","confirmed","error"],"all_actions":["confirm","save_customer_data","save_input","create_event","notify_owner_by_email","notify_customer_by_email","trigger_webhook","confirmed"],"possible_actions":["confirm"]}}'
    });

  },

  // Update booking endpoint
  updateBooking: function() {

    jasmine.Ajax.stubRequest(
      'https://api.timekit.io/v2/bookings/0096163d-54a4-488f-aa3a-0b40111ee4be/confirm',
      undefined,
      'PUT'
    ).andReturn({
      status: 200,
      statusText: 'HTTP/1.1 200 OK',
      contentType: 'application/json',
      responseText: '{"data":{"id":"0096163d-54a4-488f-aa3a-0b40111ee4be","state":"confirmed","graph":"instant","all_states":["initialized","confirm","customer_data_saved","input_saved","event_created","notified_owner_by_email","notified_customer_by_email","webhook_triggered","confirmed","error"],"all_actions":["confirm","save_customer_data","save_input","create_event","notify_owner_by_email","notify_customer_by_email","trigger_webhook","confirmed"],"possible_actions":[]}}'
    });

  },

  // Mocks all common endpoints
  all: function() {

    this.findTime();
    this.userTimezone();
    this.createBooking();
    this.updateBooking();

  }

};