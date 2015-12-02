'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');

/**
 * Basic configuration of the library
 */
describe('Basic configuration', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to set the name', function() {

    var config = {
      name: 'Demo Name'
    }
    createWidget(config);

    expect($('.bookingjs-displayname')).toBeInDOM();
    expect($('.bookingjs-displayname')).toBeVisible();
    expect($('.bookingjs-displayname')).toContainElement('span');
    expect($('.bookingjs-displayname span')).toContainText(config.name);

  });

  it('should be able to set an avatar image', function() {

    var config = {
      avatar: '/base/misc/avatar-doc.jpg'
    }
    createWidget(config);

    expect($('.bookingjs-avatar')).toBeInDOM();
    expect($('.bookingjs-avatar')).toBeVisible();
    expect($('.bookingjs-avatar')).toContainElement('img');

    var source = $('.bookingjs-avatar img').prop('src');
    var contains = source.indexOf(config.avatar) > -1;
    expect(contains).toBe(true);

  });

});
