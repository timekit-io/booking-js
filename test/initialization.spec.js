'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var baseConfig = require('./utils/defaultConfig');
var mockAjax = require('./utils/mockAjax');

/**
 * Intilialize the library
 */
describe('Initialization regular', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    mockAjax();
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
    expect(widget.getConfig()).toBeDefined();

    expect($('.bookingjs-calendar')).toBeInDOM();

  });

  it('should be able init and display the widget with singleton pattern', function() {

    TimekitBooking().init(baseConfig);

    expect($('.bookingjs-calendar')).toBeInDOM();

  });

});