'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Error handling', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
    window.console.warn = function() {}
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should show error if no config is supplied at all', function(done) {

    var widget = new TimekitBooking();
    widget.init();

    expect($('.bookingjs-error')).toBeInDOM();
    expect($('.bookingjs-error-text-message')).toContainText('No configuration was supplied. Please supply a config object upon library initialization');

    done()

  });

  it('should show error if remote project ID is not found', function(done) {

    mockAjax.getNonExistingEmbedWidget();

    var widget = new TimekitBooking();
    widget.init({
      app_key: '12345',
      project_id: '54321'
    });

    setTimeout(function() {

      expect($('.bookingjs-error')).toBeInDOM();
      expect($('.bookingjs-error-text-message')).toContainText('The project could not be found, please double-check your "project_id" and "app_key"');

      done()

    }, 100);

  });

  it('should show error if project ID is supplied but no app key', function(done) {

    var widget = new TimekitBooking();
    widget.init({
      project_id: '54321'
    });

    setTimeout(function() {

      expect($('.bookingjs-error')).toBeInDOM();
      expect($('.bookingjs-error-text-message')).toContainText('Missing "app_key" in conjunction with "project_id", please provide your "app_key" for authentication');

      done()

    }, 100);

  });

  it('should show error if an invalid Fetch Availability parameter is sent', function(done) {

    mockAjax.findTimeWithError()

    var widget = new TimekitBooking();
    widget.init({
      app_key: '12345',
      project_id: '12345',
      availability: {
        future: 'wrong'
      }
    });

    setTimeout(function() {

      expect($('.bookingjs-error')).toBeInDOM();
      expect($('.bookingjs-error-text-message')).toContainText('An error with Timekit Fetch Availability occured');

      done()

    }, 100);

  });

  it('should show error if booking could not be created', function(done) {

    mockAjax.createBookingWithError()

    var widget = new TimekitBooking();
    widget.init({
      app_key: '12345',
      booking: {
        event: {
          calendar_id: 'doesnt exist'
        }
      }
    });

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        var inputs = interact.fillSubmit();

        expect($('.bookingjs-form').hasClass('loading')).toBe(true);

        setTimeout(function() {

          expect($('.bookingjs-error')).toBeInDOM();
          expect($('.bookingjs-error-text-message')).toContainText('An error with Timekit Create Booking occured');

          done();

        }, 200);
      }, 500);
    }, 500);

  });

  it('should show error if passed timezone is invalid', function(done) {

    var widget = new TimekitBooking();
    widget.init({
      app_key: '12345',
      ui: {
        timezone: 'this-is-invalid'
      }
    });

    setTimeout(function() {

      expect($('.bookingjs-error')).toBeInDOM();
      expect($('.bookingjs-error-text-message')).toContainText('Trying to set invalid or unknown timezone');

      done()

    }, 100);

  });

});
