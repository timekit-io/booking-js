'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var mockAjax = require('./utils/mockAjax');
var createWidget = require('./utils/createWidget');
var interact = require('./utils/commonInteractions');

describe('Group bookings', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to book a seat', function(done) {

    createWidget({
      booking: {
        graph: 'group_customer'
      }
    });

    setTimeout(function() {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe('https://api.timekit.io/v2/bookings/groups');

      interact.clickEvent();
      setTimeout(function() {

        interact.fillSubmit();
        expect($('.bookingjs-form').hasClass('loading')).toBe(true);

        setTimeout(function() {

          expect($('.bookingjs-form').hasClass('success')).toBe(true);
          expect($('.bookingjs-form-success-message')).toBeVisible();

          var request = jasmine.Ajax.requests.mostRecent();
          var requestData = JSON.parse(request.params)
          
          expect(request.url).toBe('https://api.timekit.io/v2/bookings?include=attributes,event,user');
          expect(requestData.graph).toBe('group_customer')
          expect(requestData.related.owner_booking_id).toBe('87623db3-cb5f-41e8-b85b-23b5efd04e07')

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
