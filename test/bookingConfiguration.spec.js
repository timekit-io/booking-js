'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Booking configuration', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able override default configuration for timekitCreateBooking and book', function(done) {

    var config = {
      timekitCreateBooking: {
        event: {
          invite: false
        }
      }
    }
    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        interact.fillSubmit();

        setTimeout(function() {

          var request = jasmine.Ajax.requests.mostRecent();
          var requestData = JSON.parse(request.params);

          expect(request.url).toBe('https://api.timekit.io/v2/bookings?include=attributes,event,user');
          expect(requestData.event.invite).toBe(false);

          done();

        }, 200);
      }, 500);
    }, 500);

  });

  it('should be able override default configuration (extended) for timekitCreateBooking and book', function(done) {

    mockAjax.getEmbedWidgetExtended()

    var config = {
      widgetId: '12345',
      timekitCreateBooking: {
        notify_customer_by_email: {
          enabled: false
        }
      }
    }
    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        interact.fillSubmit();

        setTimeout(function() {

          var request = jasmine.Ajax.requests.mostRecent();
          var requestData = JSON.parse(request.params);

          expect(request.url).toBe('https://api.timekit.io/v2/bookings?include=attributes,event,user');
          expect(requestData.notify_customer_by_email.enabled).toBe(false);

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
