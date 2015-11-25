'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');

/**
 * Basic interaction of the library
 */
describe('Basic interaction', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    mockAjax();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to click on an event', function(done) {

    createWidget();

    expect($('.bookingjs-calendar')).toBeInDOM();
    expect($('.bookingjs-calendar')).toBeVisible();

    setTimeout(function() {

      var calEvent = $('.fc-time-grid-event')[0];
      var calEventStart = $(calEvent).find('.fc-time').attr('data-start');

      $(calEvent).click();

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

});
