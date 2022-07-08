'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Booking configuration', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able override default configuration for booking and book', function(done) {

    mockAjax.all();

    var config = {
      booking: {
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

  it('should be able override default configuration (extended) for booking and book', function(done) {

    mockAjax.getEmbedWidgetExtended();
    mockAjax.findTime();
    mockAjax.createBooking();

    var config = {
      project_id: '12345',
      app_key: '123',
      booking: {
        notify_customer_by_email: {
          enabled: false
        }
      }
    }
    createWidget(config);

    setTimeout(function() {

      expect($('.bookingjs-displayname span')).toContainText('McFlys Widget');
      interact.clickEvent();

      setTimeout(function() {

        var submitButton = $('.bookingjs-form-button .inactive-text')
        expect(submitButton.text()).toBe('Book McFly')

        var phoneNumberLabel = $('.bookingjs-form-label.label-phone')
        expect(phoneNumberLabel).toContainText('Phone Number')

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
