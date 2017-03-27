'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var teamAvailabilityConfig = require('./utils/teamAvailabilityConfig');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Team availability', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to book a timeslot', function(done) {

    createWidget(teamAvailabilityConfig);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        interact.fillSubmit();

        expect($('.bookingjs-form').hasClass('loading')).toBe(true);

        setTimeout(function() {

          expect($('.bookingjs-form').hasClass('success')).toBe(true);
          expect($('.bookingjs-form-success-message')).toBeVisible();

          var successMessage = $('.bookingjs-form-success-message').html();
          var contains = successMessage.indexOf('An invitation has been sent to') > -1;
          expect(contains).toBe(true);

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
