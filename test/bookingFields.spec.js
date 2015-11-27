'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

/**
 * Basic interaction of the library
 */
describe('Booking fields', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    mockAjax();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to add the phone, voip and location field', function(done) {

    var config = {
      bookingFields: {
        phone: {
          enabled: true
        },
        voip: {
          enabled: true
        },
        location: {
          enabled: true
        }
      }
    }

    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        var phoneInput = $('.input-phone');
        expect(phoneInput).toBeInDOM();
        expect(phoneInput).toBeVisible();
        expect(phoneInput.attr('placeholder')).toBe('Your phone number');
        expect(phoneInput.attr('required')).toBe(undefined);
        expect(phoneInput.val()).toBe('');

        var voipInput = $('.input-voip');
        expect(voipInput).toBeInDOM();
        expect(voipInput).toBeVisible();
        expect(voipInput.attr('placeholder')).toBe('Your Skype username');
        expect(voipInput.attr('required')).toBe(undefined);
        expect(voipInput.val()).toBe('');

        var locationInput = $('.input-location');
        expect(locationInput).toBeInDOM();
        expect(locationInput).toBeVisible();
        expect(locationInput.attr('placeholder')).toBe('Location');
        expect(locationInput.attr('required')).toBe(undefined);
        expect(locationInput.val()).toBe('');

        done();

      }, 500);
    }, 500);

  });

  it('should be able to add the phone field, prefilled and required', function(done) {

    var config = {
      bookingFields: {
        phone: {
          enabled: true,
          placeholder: 'My custom placeholder',
          prefilled: '12345678',
          required: true
        }
      }
    }

    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        var phoneInput = $('.input-phone');
        expect(phoneInput).toBeInDOM();
        expect(phoneInput).toBeVisible();
        expect(phoneInput.attr('placeholder')).toBe(config.bookingFields.phone.placeholder);
        expect(phoneInput.attr('required')).toBe('required');
        expect(phoneInput.val()).toBe(config.bookingFields.phone.prefilled);

        done();

      }, 500);
    }, 500);

  });

  it('should be able to disable the comment field', function(done) {

    var config = {
      bookingFields: {
        comment: {
          enabled: false
        }
      }
    }

    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        var commentInput = $('.input-comment');
        expect(commentInput.length).toBe(0);

        done();

      }, 500);
    }, 500);

  });

});
