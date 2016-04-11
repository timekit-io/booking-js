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

    expect($('.hourwidget-displayname')).toBeInDOM();
    expect($('.hourwidget-displayname')).toBeVisible();
    expect($('.hourwidget-displayname')).toContainElement('span');
    expect($('.hourwidget-displayname span')).toContainText(config.name);

  });

  it('should be able to set an avatar image', function() {

    var config = {
      avatar: '/base/misc/avatar-doc.jpg'
    }
    createWidget(config);

    expect($('.hourwidget-avatar')).toBeInDOM();
    expect($('.hourwidget-avatar')).toBeVisible();
    expect($('.hourwidget-avatar')).toContainElement('img');

    var source = $('.hourwidget-avatar img').prop('src');
    var contains = source.indexOf(config.avatar) > -1;
    expect(contains).toBe(true);

  });

});
