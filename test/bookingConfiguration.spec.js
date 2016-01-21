'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

/**
 * Basic interaction of the library
 */
describe('Booking configuration', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able override default configuration for timekitUpdateBooking and book', function(done) {

    var config = {
      timekitUpdateBooking: {
        event: {
          invite: false
        },
      }
    }
    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        interact.fillSubmit();

        setTimeout(function() {

          var request = jasmine.Ajax.requests.mostRecent();
          var requestData = JSON.parse(request.params);

          expect(request.url).toBe('https://api.timekit.io/v2/bookings/0096163d-54a4-488f-aa3a-0b40111ee4be/confirm');
          expect(requestData.event.invite).toBe(false);

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
