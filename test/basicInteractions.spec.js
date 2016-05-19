'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

/**
 * Basic interaction of the library
 */
describe('Basic interaction', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to click on an event', function(done) {

    createWidget();

    expect($('.bookingjs-calendar')).toBeInDOM();
    expect($('.bookingjs-calendar')).toBeVisible();

    setTimeout(function() {

      var calEventStart = interact.clickEvent();

      setTimeout(function() {

        expect($('.bookingjs-bookpage')).toBeInDOM();
        expect($('.bookingjs-bookpage')).toBeVisible();

        var pageTime = $('.bookingjs-bookpage-time').text();
        var contains = pageTime.indexOf(calEventStart) > -1;
        expect(contains).toBe(true);

        done();

      }, 500);
    }, 500);

  });

  it('should be able to close the booking page', function(done) {

    createWidget();

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        expect($('.bookingjs-bookpage')).toBeInDOM();
        expect($('.bookingjs-bookpage')).toBeVisible();

        $('.bookingjs-bookpage-close').click();

        setTimeout(function() {

          expect($('.bookingjs-bookpage').length).toBe(0);

          done();

        }, 500);
      }, 500);
    }, 500);

  });

  it('should be able to book an event', function(done) {

    createWidget();

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        var inputs = interact.fillSubmit();

        expect($('.bookingjs-form').hasClass('loading')).toBe(true);

        setTimeout(function() {

          expect($('.bookingjs-form').hasClass('success')).toBe(true);
          expect($('.bookingjs-form-success-message')).toBeVisible();

          var successMessage = $('.bookingjs-form-success-message').html();
          var contains = successMessage.indexOf(inputs.email) > -1;
          expect(contains).toBe(true);

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
