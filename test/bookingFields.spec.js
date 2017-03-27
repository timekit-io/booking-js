'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Booking fields', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
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
        expect(phoneInput.attr('placeholder')).toBe('Phone number');
        expect(phoneInput.attr('required')).toBe(undefined);
        expect(phoneInput.val()).toBe('');

        var voipInput = $('.input-voip');
        expect(voipInput).toBeInDOM();
        expect(voipInput).toBeVisible();
        expect(voipInput.attr('placeholder')).toBe('Skype username');
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

  it('should be able to lock fields for user input', function(done) {

    var config = {
      bookingFields: {
        name: {
          locked: true,
          prefilled: 'My Test Name'
        },
        email: {
          locked: false
        },
        comment: {
          locked: true,
          prefilled: 'This should be submitted'
        }
      }
    }

    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        var nameInput = $('.input-name');
        expect(nameInput.prop('readonly')).toBe(true);
        expect(nameInput.is('[readonly]')).toBe(true);

        var emailInput = $('.input-email');
        expect(emailInput.prop('readonly')).toBe(false);
        expect(emailInput.is('[readonly]')).toBe(false);

        emailInput.val('someemail@timekit.io');

        var commentInput = $('.input-comment');
        expect(commentInput.prop('readonly')).toBe(true);
        expect(commentInput.is('[readonly]')).toBe(true);

        $('.bookingjs-form-button').click();

        expect($('.bookingjs-form').hasClass('loading')).toBe(true);

        setTimeout(function() {

          expect($('.bookingjs-form').hasClass('success')).toBe(true);

          var request = jasmine.Ajax.requests.mostRecent();

          var requestDescription = JSON.parse(request.params).event.description
          expect(requestDescription).toBe('Comment: ' + config.bookingFields.comment.prefilled + '\n');

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
