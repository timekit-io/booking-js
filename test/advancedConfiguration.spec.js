'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var moment = require('moment');
var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Advanced configuration', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should go to the first upcoming event automatically', function(done) {

    mockAjax.findTimeWithDateInFuture();

    var widget = createWidget();

    setTimeout(function() {

      var future = moment().add(1, 'month').startOf('day');

      var calendarDate = widget.fullCalendar('getDate');
      expect(calendarDate.format('YYYY-MM-DD')).toBe(future.format('YYYY-MM-DD'));

      setTimeout(function() {

        var scrollable = $('.bookingjs-calendar').find('.fc-scroller');
        var scrollTop = scrollable.scrollTop();
        expect(scrollTop).not.toBe(321);

        done();

      }, 300);
    }, 100);

  });

  it('should be able to load even though no timeslots are available', function(done) {

    mockAjax.findTimeWithNoTimeslots();

    createWidget();

    setTimeout(function() {

      var availableTimeslots = $('.fc-time-grid-event')
      expect(availableTimeslots.length).toBe(0)

      done();

    }, 300);

  });

  it('should be able override config settings fetched remotely, but before render', function(done) {

    mockAjax.all();

    function updateConfig () {
      var widgetConfig = widget.getConfig()
      expect(widgetConfig.name).toBe('Marty McFly')
      widgetConfig.name = 'Marty McFly 2'
      widget.setConfig(widgetConfig)
    }

    var widget = new TimekitBooking();
    var config = {
      app_key: '12345',
      project_id: '12345',
      callbacks: {
        renderStarted: updateConfig
      }
    };

    spyOn(config.callbacks, 'renderStarted').and.callThrough();

    widget.init(config);

    setTimeout(function() {

      expect(config.callbacks.renderStarted).toHaveBeenCalled();

      var request = jasmine.Ajax.requests.first();
      expect(request.url).toBe('https://api.timekit.io/v2/projects/embed/12345');

      var widgetConfig = widget.getConfig()

      expect(widgetConfig.name).toBe('Marty McFly 2')

      done();

    }, 100)

  });

  it('should be able to inject custom fullcalendar settings and register callbacks', function(done) {

    mockAjax.all();

    function fcCallback () {}

    var config = {
      fullcalendar: {
        buttonText: {
          today: 'idag'
        }
      },
      callbacks: {
        fullCalendarInitialized: function () {}
      }
    }

    spyOn(config.callbacks, 'fullCalendarInitialized').and.callThrough();

    createWidget(config);

    setTimeout(function() {

      expect(config.callbacks.fullCalendarInitialized).toHaveBeenCalled();

      var todayButton = $('.fc-today-button')
      expect(todayButton.text()).toBe('idag')

      done();

    }, 600);

  });

  it('should be able to set which dynamic includes that CreateBooking request returns in response', function(done) {

    mockAjax.createBookingWithCustomIncludes();

    var config = {
      create_booking_response_include: ['provider_event', 'attributes', 'event', 'user']
    }
    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        interact.fillSubmit();

        setTimeout(function() {

          var request = jasmine.Ajax.requests.mostRecent();
          var requestData = JSON.parse(request.params);

          expect(request.url).toBe('https://api.timekit.io/v2/bookings?include=provider_event,attributes,event,user');
          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
