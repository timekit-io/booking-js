'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var moment = require('moment');

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');

/**
 * Basic configuration of the library
 */
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

      var future = moment().add(1, 'month');

      var calendarDate = widget.fullCalendar('getDate');
      expect(calendarDate.format('YYYY-MM-DD')).toBe(future.format('YYYY-MM-DD'));
      done();

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
      done();

    }, 100);

  });

});
