'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var mockAjax = require('./utils/mockAjax');
var baseConfig = require('./utils/defaultConfig');

describe('Initialization regular', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to load the fixture page', function() {
    expect(window).toBeDefined();
    expect($('#bookingjs')).toBeInDOM();
  });

  it('should be able init and display the widget with instance pattern', function() {
    var widget = new TimekitBooking();
    widget.init(baseConfig);

    expect(widget).toBeDefined();
    expect(widget.getConfig().all()).toBeDefined();
    expect($('.bookingjs-calendar')).toBeInDOM();
  });

  it('should be able init and display the widget with singleton pattern', function() {
    new TimekitBooking().init(baseConfig);
    expect($('.bookingjs-calendar')).toBeInDOM();
  });

});

describe('Initialization minified', function() {

  beforeEach(function(){
    loadFixtures('minified.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to load the fixture page', function() {
    expect(window).toBeDefined();
    expect($).toBeDefined();
    expect($('#bookingjs')).toBeInDOM();
  });

  it('should be able init and display the widget with instance pattern', function() {
    var widget = new TimekitBooking();
    widget.init(baseConfig);

    expect(widget).toBeDefined();
    expect(widget.getConfig().all()).toBeDefined();
    expect($('.bookingjs-calendar')).toBeInDOM();
  });

  it('should be destroy and cleanup itself', function() {
    var widget = new TimekitBooking();
    widget.init(baseConfig);

    expect(widget).toBeDefined();
    expect(widget.getConfig().all()).toBeDefined();
    expect($('.bookingjs-calendar')).toBeInDOM();

    widget.destroy();
    expect($('.bookingjs-calendar')).not.toBeInDOM();
  });

});
