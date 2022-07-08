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

  it('should be able to add custom fields', function(done) {

    var config = {
      customer_fields: {
        comment: {
          title: 'Comment'
        },
        phone: {
          title: 'Phone',
          required: true
        },
        custom_field_1: {
          title: 'Custom 1',
          format: 'textarea'
        },
        custom_field_2: {
          title: 'Custom 2',
          format: 'checkbox',
          required: true
        },
        custom_field_3: {
          title: 'Custom 3',
          format: 'select',
          enum: ['One', 'Of', 'Many']
        },
      }
    }

    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        var commentInput = $('.input-comment');
        expect(commentInput).toBeInDOM();
        expect(commentInput).toBeVisible();
        expect(commentInput.attr('placeholder')).toBe('Comment');
        expect(commentInput.attr('required')).toBe(undefined);

        var phoneInput = $('.input-phone');
        expect(phoneInput).toBeInDOM();
        expect(phoneInput).toBeVisible();
        expect(phoneInput.attr('placeholder')).toBe('Phone');
        expect(phoneInput.attr('required')).toBe('required');
        expect(phoneInput.val()).toBe('');

        var custom1Input = $('.input-custom_field_1');
        expect(custom1Input).toBeInDOM();
        expect(custom1Input).toBeVisible();
        expect(custom1Input.is('textarea')).toBeTruthy();

        var custom2Input = $('.input-custom_field_2');
        expect(custom2Input).toBeInDOM();
        expect(custom2Input).toBeVisible();
        expect(custom2Input.attr('type')).toBe('checkbox');
        expect(custom2Input.attr('required')).toBe('required');
        expect(custom2Input.prop('checked')).toBeFalsy();

        var custom3Input = $('.input-custom_field_3');
        expect(custom3Input).toBeInDOM();
        expect(custom3Input).toBeVisible();
        expect(custom3Input.is('select')).toBeTruthy();
        expect(custom3Input.children().length).toBe(3);
        expect($(custom3Input.children()[0]).is('option')).toBeTruthy();
        expect($(custom3Input.children()[0]).val()).toBe('One');

        done();

      }, 500);
    }, 500);

  });

  it('should be able to add the phone field, prefilled and required', function(done) {

    var config = {
      customer_fields: {
        phone: {
          title: 'My custom placeholder',
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
        expect(phoneInput.attr('placeholder')).toBe(config.customer_fields.phone.title);
        expect(phoneInput.attr('required')).toBe('required');
        expect(phoneInput.attr('type')).toBe('tel');
        expect(phoneInput.val()).toBe(config.customer_fields.phone.prefilled);

        done();

      }, 500);
    }, 500);

  });

  it('should not output comment field by default', function(done) {

    var config = {
      customer_fields: {}
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
      customer_fields: {
        name: {
          readonly: true,
          prefilled: 'My Test Name'
        },
        email: {
          readonly: false
        },
        comment: {
          title: 'Comment',
          readonly: true,
          prefilled: 'This should be submitted'
        }
      }
    }

    createWidget(config);

    setTimeout(function() {

      interact.clickEvent();
      setTimeout(function() {

        var nameInput = $('#input-name');
        expect(nameInput.prop('readonly')).toBe(true);
        expect(nameInput.is('[readonly]')).toBe(true);

        var emailInput = $('#input-email');
        expect(emailInput.prop('readonly')).toBe(false);
        expect(emailInput.is('[readonly]')).toBe(false);

        emailInput.val('someemail@timekit.io');

        var commentInput = $('#input-comment');
        expect(commentInput.prop('readonly')).toBe(true);
        expect(commentInput.is('[readonly]')).toBe(true);
        expect(commentInput.val()).toBe('This should be submitted');

        document.querySelector('.bookingjs-form-button').click();
        expect($('.bookingjs-form').hasClass('loading')).toBe(true);

        setTimeout(function() {

          expect($('.bookingjs-form').hasClass('success')).toBe(true);

          var request = jasmine.Ajax.requests.mostRecent();
          let expectedDescription = 'Name: ' + config.customer_fields.name.prefilled + '\nEmail: someemail@timekit.io\nComment: ' + config.customer_fields.comment.prefilled + '\n';

          var requestDescription = JSON.parse(request.params).description
          expect(requestDescription).toBe(expectedDescription);

          done();

        }, 200);
      }, 500);
    }, 500);

  });

});
