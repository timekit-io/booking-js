'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

var moment = require('moment');
require('moment-timezone/builds/moment-timezone-with-data-2012-2022.js');

describe('Timezone helper', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able set fixed user timezone', function(done) {

    var fixedTimezone = 'America/Los_Angeles';

    createWidget({
      ui: {
        timezone: fixedTimezone
      }
    });

    setTimeout(function() {

      var picker = $('.bookingjs-footer-tz-picker-select');
      
      expect(picker.val()).toBe(fixedTimezone);
      done()

    }, 5000);

  });

  it('should be able guess user timezone', function(done) {

    createWidget();

    setTimeout(function() {

      var picker = $('.bookingjs-footer-tz-picker-select');
      var guessedTimezone = moment.tz.guess();

      expect(picker).toBeInDOM();
      expect(picker).toBeVisible();
      expect(picker.val()).toBe(guessedTimezone);

      done()

    }, 500);

  });

  it('should be able change user timezone and re-render timeslots', function(done) {

    createWidget();

    setTimeout(function() {

      var picker = $('.bookingjs-footer-tz-picker-select');

      // Change timezone to LA
      var firstTimezone = 'America/Los_Angeles';
      mockAjax.findTimeWithTimezone(firstTimezone);
      picker.val(firstTimezone);
      picker.trigger('change');

      setTimeout(function() {

        expect(picker.val()).toBe(firstTimezone);

        var laTimeslot = $('.fc-event').eq(0).find('.fc-time').data('start');
        var laStart = moment(laTimeslot, 'h:mma')
        
        // Change timezone to CPH
        var secondTimezone = 'Europe/Copenhagen';
        mockAjax.findTimeWithTimezone(secondTimezone);
        picker.val(secondTimezone);
        picker.trigger('change');

        setTimeout(function() {

          expect(picker.val()).toBe(secondTimezone);

          // Make sure that the two rendered timeslots timestamps are not the same
          var cphTimeslot = $('.fc-event').eq(0).find('.fc-time').data('start');
          var cphStart = moment(cphTimeslot, 'h:mma');
          var diffInMins = moment(laStart, 'h:mma').diff(moment(cphStart, 'h:mma'), 'minutes')
          expect(diffInMins).not.toBe(0);

          // Make sure that the rendered timeslot timestamps are correctly skewed by the timezone offset
          var controlLaTime = moment().tz(firstTimezone).format('h:mma')
          var controlCphTime = moment().tz(secondTimezone).format('h:mma')
          var controlDiffInMins = moment(controlLaTime, 'h:mma').diff(moment(controlCphTime, 'h:mma'), 'minutes')
          expect(diffInMins).toBe(controlDiffInMins);

          done()

        }, 1000);
      }, 1000);
    }, 1000);

  });

  it('should be able change user timezone and re-render booking page', function(done) {

    createWidget();

    setTimeout(function() {

      interact.clickEvent();

      var picker = $('.bookingjs-footer-tz-picker-select');

      // Change timezone to LA
      var firstTimezone = 'America/Los_Angeles';
      mockAjax.findTimeWithTimezone(firstTimezone);
      picker.val(firstTimezone);
      picker.change();

      setTimeout(function() {

        expect(picker.val()).toBe(firstTimezone);

        var laTimeString = $('.bookingjs-bookpage-time').text();
        var laTimeslot = laTimeString.split(' - ')[0];
        var laStart = moment(laTimeslot, 'h:mma')
        
        // Change timezone to CPH
        var secondTimezone = 'Europe/Copenhagen';
        mockAjax.findTimeWithTimezone(secondTimezone);
        picker.val(secondTimezone);
        picker.change();

        setTimeout(function() {

          expect(picker.val()).toBe(secondTimezone);

          // Make sure that the two rendered timeslots timestamps are not the same
          var cphTimeString = $('.bookingjs-bookpage-time').text();
          var cphTimeslot = cphTimeString.split(' - ')[0];
          var cphStart = moment(cphTimeslot, 'h:mma');
          var diffInMins = moment(laStart, 'h:mma').diff(moment(cphStart, 'h:mma'), 'minutes')
          expect(diffInMins).not.toBe(0);

          // Make sure that the rendered timeslot timestamps are correctly skewed by the timezone offset
          var controlLaTime = moment().tz(firstTimezone).format('h:mma')
          var controlCphTime = moment().tz(secondTimezone).format('h:mma')
          var controlDiffInMins = moment(controlLaTime, 'h:mma').diff(moment(controlCphTime, 'h:mma'), 'minutes')
          expect(diffInMins).toBe(controlDiffInMins);

          done()

        }, 500)
      }, 500)
    }, 500)

  });

  it('should be able change user timezone and book a timeslot', function(done) {

    createWidget();

    setTimeout(function() {

      var picker = $('.bookingjs-footer-tz-picker-select');

      // Change timezone to LA
      var firstTimezone = 'America/Los_Angeles';
      mockAjax.findTimeWithTimezone(firstTimezone);
      picker.val(firstTimezone);
      picker.change();

      setTimeout(function() {

        expect(picker.val()).toBe(firstTimezone);
        interact.clickEvent();

        setTimeout(function() {

          interact.fillSubmit();

          var laTimeString = $('.bookingjs-bookpage-time').text();
          var laTimeslot = laTimeString.split(' - ')[0];
          var laStart = moment(laTimeslot, 'h:mma');
          
          setTimeout(function() {

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('https://api.timekit.io/v2/bookings?include=attributes,event,user');
            
            var requestData = JSON.parse(request.params);
            var startTime = moment.parseZone(requestData.start).format('h:mma')
            
            expect(startTime).toBe(laTimeslot)
            expect(requestData.customer.timezone).toBe(firstTimezone);

            done()

          }, 500)
        }, 500)
      }, 500)
    }, 500)

  });

});
