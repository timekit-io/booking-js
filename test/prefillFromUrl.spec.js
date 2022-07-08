'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var qs = require('querystringify');
var mockAjax = require('./utils/mockAjax');
var createWidget = require('./utils/createWidget');
var interact = require('./utils/commonInteractions');

describe('Prefill fields from URL', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to prefill fields from URL query string', function(done) {

    var prefill = {
      'customer.name': 'Marty',
      'customer.email': 'marty.mcfly@timekit.io',
      'customer.phone': '12345',
      'customer.custom': 'foo'
    }

    var global = {
      location: {
        search: qs.stringify(prefill)
      }
    }

    var config = {
      customer_fields: {
        name: {
          title: 'Your name'
        },
        email: {
          title: 'Your email'
        },
        phone: {
          title: 'Your phone'
        }
      }
    }

    createWidget(config, global);
    setTimeout(function() {

      interact.clickEvent();
      setTimeout(function() {

        var nameInput = $('.input-name');
        expect(nameInput).toBeInDOM();
        expect(nameInput).toBeVisible();
        expect(nameInput.val()).toBe(prefill['customer.name']);

        var emailInput = $('.input-email');
        expect(emailInput).toBeInDOM();
        expect(emailInput).toBeVisible();
        expect(emailInput.val()).toBe(prefill['customer.email']);

        var phoneInput = $('.input-phone');
        expect(phoneInput).toBeInDOM();
        expect(phoneInput).toBeVisible();
        expect(phoneInput.val()).toBe(prefill['customer.phone']);

        var customInput = $('.input-custom');
        expect(customInput.length).toBe(0);

        done();

      }, 500);
    }, 500);

  });

});
