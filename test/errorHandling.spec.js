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
    // disable console log temporarily
    window.console.warn = function() {}
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should show error if no email is provided', function() {

    var widget = new TimekitBooking();
    widget.init({
      apiToken: 'XT1JO879JF1qUXXzmETD5ucgxaDwsFsd',
      calendar: '22f86f0c-ee80-470c-95e8-dadd9d05edd2',
      app:      'my-demo-app'
    });

    expect($('.bookingjs-error')).toBeInDOM();
    expect($('.bookingjs-error-text-message')).toContainText('A required config setting ("email") was missing');

  });

  it('should show error if no app is provided', function() {

    var widget = new TimekitBooking();
    widget.init({
      email:    'marty.mcfly@timekit.io',
      apiToken: 'XT1JO879JF1qUXXzmETD5ucgxaDwsFsd',
      calendar: '22f86f0c-ee80-470c-95e8-dadd9d05edd2',
      app:      '',
      timekitConfig: {
        app:    ''
      }
    });

    expect($('.bookingjs-error')).toBeInDOM();
    expect($('.bookingjs-error-text-message')).toContainText('A required config setting ("app") was missing');

  });

  it('should show error if remote widget ID is not found', function(done) {

    mockAjax.getNonExistingEmbedWidget();

    var widget = new TimekitBooking();
    widget.init({
      widgetId: '54321'
    });

    setTimeout(function() {

      expect($('.bookingjs-error')).toBeInDOM();
      expect($('.bookingjs-error-text-message')).toContainText('The widget could not be found, please double-check your widgetId/widgetSlug');

      done()

    }, 100);

  });

  it('should show error if no config is supplied at all', function(done) {

    var widget = new TimekitBooking();
    widget.init();

    expect($('.bookingjs-error')).toBeInDOM();
    expect($('.bookingjs-error-text-message')).toContainText('No configuration was supplied or found. Please supply a config object upon library initialization');

    done()

  });

  it('should show error if an invalid FindTime parameter is sent', function(done) {

    mockAjax.findTimeWithError()

    var widget = new TimekitBooking();
    widget.init({
      widgetId: '12345',
      timekitFindTime: {
        future: 'wrong'
      }
    });

    setTimeout(function() {

      expect($('.bookingjs-error')).toBeInDOM();
      expect($('.bookingjs-error-text-message')).toContainText('An error with Timekit FindTime occured');

      done()

    }, 100);

  });

  it('should show error if booking could not be created', function(done) {

    mockAjax.createBookingWithError()

    var widget = new TimekitBooking();
    widget.init({
      app:      'my-demo-app',
      email:    'marty.mcfly@timekit.io',
      apiToken: 'XT1JO879JF1qUXXzmETD5ucgxaDwsFsd',
      calendar: '22f86f0c-ee80-470c-95e8-dadd9d05edd2',
      timekitCreateBooking: {
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
          expect($('.bookingjs-error-text-message')).toContainText('An error with Timekit CreateBooking occured');

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
