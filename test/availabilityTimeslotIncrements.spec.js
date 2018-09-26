'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');

describe('Availability timeslot increments', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to render timeslots sequentially with increments', function(done) {

    var lengthInHours = 1;
    var incrementInMinutes = 30;

    mockAjax.findTimeWithIncrements(lengthInHours, incrementInMinutes);

    createWidget({
      availability: {
        length: lengthInHours + ' hour',
        timeslot_increments: incrementInMinutes + ' minutes'
      }
    });

    setTimeout(function() {

      var firstTimeslot = $('.fc-event').eq(0).find('.fc-time').data('start');
      var firstStart = moment(firstTimeslot, 'h:mma')

      var secondTimeslot = $('.fc-event').eq(1).find('.fc-time').data('start');
      var secondStart = moment(secondTimeslot, 'h:mma')

      var diff = secondStart.diff(firstStart, 'minutes');

      expect(diff).toBe(incrementInMinutes);

      done();

    }, 500);

  });

});
