'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var moment = require('moment');
var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');

describe('Advanced configuration', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should go to the first upcoming event when goToFirstEvent is set', function(done) {

    mockAjax.findTimeWithDateInFuture();

    var config = {
      goToFirstEvent: true
    }
    var widget = createWidget(config);

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

  it('should go to current date when goToFirstEvent is disabled', function(done) {

    mockAjax.findTimeWithDateInFuture();

    var config = {
      goToFirstEvent: false
    }
    var widget = createWidget(config);

    setTimeout(function() {

      var today = moment();

      var calendarDate = widget.fullCalendar('getDate');
      expect(calendarDate.format('YYYY-MM-DD')).toBe(today.format('YYYY-MM-DD'));

      setTimeout(function() {

        var scrollable = $('.bookingjs-calendar').find('.fc-scroller');
        var scrollTop = scrollable.scrollTop();
        expect(scrollTop).toBe(321);

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
      widgetId: '12345',
      callbacks: {
        renderStarted: updateConfig
      }
    };

    spyOn(config.callbacks, 'renderStarted').and.callThrough();

    widget.init(config);

    setTimeout(function() {

      expect(config.callbacks.renderStarted).toHaveBeenCalled();

      var request = jasmine.Ajax.requests.first();
      expect(request.url).toBe('https://api.timekit.io/v2/widgets/embed/12345');

      var widgetConfig = widget.getConfig()

      expect(widgetConfig.name).toBe('Marty McFly 2')

      done();

    }, 100)

  });

});
