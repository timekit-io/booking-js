'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var mockAjax = require('./utils/mockAjax');
var createWidget = require('./utils/createWidget');
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

    }, 500);

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

      const changeEvent = new Event("change");
      const pickerSelect = document.querySelector('.bookingjs-footer-tz-picker-select');

      // Change timezone to LA
      var firstTimezone = 'America/Los_Angeles';
      mockAjax.findTimeWithTimezone(firstTimezone);
      
      pickerSelect.value = firstTimezone;
      pickerSelect.dispatchEvent(changeEvent);
      
      setTimeout(function() {

        expect(pickerSelect.value).toBe(firstTimezone);

        var tkEventText = document.querySelector('.fc-timegrid-col .fc-timegrid-col-events .fc-timegrid-event-harness .fc-event-time').innerHTML;
        var laTimeslot = tkEventText.split("-")[0].trim();
        var laStart = moment(laTimeslot, 'h:mma')
        
        // Change timezone to CPH
        var secondTimezone = 'Europe/Copenhagen';
        mockAjax.findTimeWithTimezone(secondTimezone);

        pickerSelect.value = secondTimezone;
        pickerSelect.dispatchEvent(changeEvent);

        setTimeout(function() {

          expect(pickerSelect.value).toBe(secondTimezone);
          var tkEventText2 = document.querySelector('.fc-timegrid-col .fc-timegrid-col-events .fc-timegrid-event-harness .fc-event-time').innerHTML;

          // Make sure that the two rendered timeslots timestamps are not the same
          var cphTimeslot = tkEventText2.split("-")[0].trim();
          
          var cphStart = moment(cphTimeslot, 'h:mma');
          var diffInMins = moment(laStart, 'h:mma').diff(moment(cphStart, 'h:mma'), 'minutes');

          expect(diffInMins).not.toBe(0);

          // Make sure that the rendered timeslot timestamps are correctly skewed by the timezone offset
          var controlLaTime = moment().tz(firstTimezone).format('h:mma');
          var controlCphTime = moment().tz(secondTimezone).format('h:mma');
          var controlDiffInMins = moment(controlLaTime, 'h:mma').diff(moment(controlCphTime, 'h:mma'), 'minutes');

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

      const changeEvent = new Event("change");
      const pickerSelect = document.querySelector('.bookingjs-footer-tz-picker-select');

      // Change timezone to LA
      var firstTimezone = 'America/Los_Angeles';
      mockAjax.findTimeWithTimezone(firstTimezone);

      pickerSelect.value = firstTimezone;
      pickerSelect.dispatchEvent(changeEvent);

      setTimeout(function() {

        expect(pickerSelect.value).toBe(firstTimezone);

        var laTimeString = $('.bookingjs-bookpage-time').text();
        var laTimeslot = laTimeString.split(' - ')[0];
        var laStart = moment(laTimeslot, 'h:mma')
        
        // Change timezone to CPH
        var secondTimezone = 'Europe/Copenhagen';
        mockAjax.findTimeWithTimezone(secondTimezone);

        pickerSelect.value = secondTimezone;
        pickerSelect.dispatchEvent(changeEvent);

        setTimeout(function() {

          expect(pickerSelect.value).toBe(secondTimezone);

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

      const changeEvent = new Event("change");
      const pickerSelect = document.querySelector('.bookingjs-footer-tz-picker-select');

      // Change timezone to LA
      var firstTimezone = 'America/Los_Angeles';
      mockAjax.findTimeWithTimezone(firstTimezone);
      
      pickerSelect.value = firstTimezone;
      pickerSelect.dispatchEvent(changeEvent);

      setTimeout(function() {

        expect(pickerSelect.value).toBe(firstTimezone);
        interact.clickEvent();

        setTimeout(function() {

          interact.fillSubmit();

          var laTimeString = $('.bookingjs-bookpage-time').text();
          var laTimeslot = laTimeString.split(' - ')[0];
          
          setTimeout(function() {

            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('https://api.timekit.io/v2/bookings?include=attributes,event,user');
            
            var requestData = JSON.parse(request.params);            
            var startTime = moment.parseZone(requestData.start).format('h:mma');
            
            expect(startTime).toBe(laTimeslot.replace(/^0+/, ''));
            expect(requestData.customer.timezone).toBe(firstTimezone);

            done()

          }, 500)
        }, 500)
      }, 500)
    }, 500)

  });

  it('should be able to handle timezone for group booking slots', function(done) {

    createWidget({
      booking: {
        graph: 'group_customer'
      }
    });

    setTimeout(function() {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe('https://api.timekit.io/v2/bookings/groups');

      const changeEvent = new Event("change");
      const pickerSelect = document.querySelector('.bookingjs-footer-tz-picker-select');

      // Change timezone to LA
      var firstTimezone = 'America/Los_Angeles';
      mockAjax.groupSlotsWithTimezone(firstTimezone);

      pickerSelect.value = firstTimezone;
      pickerSelect.dispatchEvent(changeEvent);

      setTimeout(function() {

        expect(pickerSelect.value).toBe(firstTimezone);

        var tkEventText = document.querySelector('.fc-timegrid-col .fc-timegrid-col-events .fc-timegrid-event-harness .fc-event-time').innerHTML;
        var laTimeslot = tkEventText.split("-")[0].trim();
        var laStart = moment(laTimeslot, 'h:mma')
        
        // Change timezone to CPH
        var secondTimezone = 'Europe/Copenhagen';
        mockAjax.groupSlotsWithTimezone(secondTimezone);

        pickerSelect.value = secondTimezone;
        pickerSelect.dispatchEvent(changeEvent);

        setTimeout(function() {

          expect(pickerSelect.value).toBe(secondTimezone);

          var tkEventText = document.querySelector('.fc-timegrid-col .fc-timegrid-col-events .fc-timegrid-event-harness .fc-event-time').innerHTML;
          var cphTimeslot = tkEventText.split("-")[0].trim();
          var cphStart = moment(cphTimeslot, 'h:mma');
  
          // Make sure that the two rendered timeslots timestamps are not the same
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

});
