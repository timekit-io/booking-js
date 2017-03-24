'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Disable booking page', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able disable booking page, create booking externally and register callback', function(done) {

    var successResponse;
    var clickedTimeslot;

    var config = {
      disableConfirmPage: true,
      callbacks: {
        clickTimeslot: function (response) {
          clickedTimeslot = response;
        },
        createBookingSuccessful: function (response) {
          successResponse = response;
        }
      }
    }

    spyOn(config.callbacks, 'clickTimeslot').and.callThrough();
    spyOn(config.callbacks, 'createBookingSuccessful').and.callThrough();

    var widget = createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        expect(config.callbacks.clickTimeslot).toHaveBeenCalled();
        expect(clickedTimeslot.start).toBeDefined();

        var request = widget.timekitCreateBooking({
          name: 'John Doe',
          email: 'test@timekit.io'
        }, clickedTimeslot);

        expect(request.then).toBeDefined();
        spyOn(request, 'then').and.callThrough();

        request.then(function(){});

        setTimeout(function() {

          expect(request.then).toHaveBeenCalled();
          expect(config.callbacks.createBookingSuccessful).toHaveBeenCalled();
          expect(successResponse.data).toBeDefined();

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
