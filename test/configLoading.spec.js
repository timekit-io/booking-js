'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var mockAjax = require('./utils/mockAjax');
var createWidget = require('./utils/createWidget');

describe('Config loading', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to load remote config with slug', function(done) {

    var widget = new TimekitBooking();
    var config = {
      project_slug: 'my-widget-slug'
    };
    
    widget.init(config);
    expect(widget).toBeDefined();

    setTimeout(function() {

      var request = jasmine.Ajax.requests.first();
      expect(request.url).toBe('https://api.timekit.io/v2/projects/hosted/my-widget-slug');
      expect(widget.getConfig().get('app_key')).toBeDefined();
      expect($('.bookingjs-calendar')).toBeInDOM();
      done();

    }, 50)
  });

  it('should be able to load remote config with slug and set widget ID', function(done) {

    var widget = new TimekitBooking();
    var config = {
      project_slug: 'my-widget-slug'
    };
    
    widget.init(config);
    expect(widget).toBeDefined();

    setTimeout(function() {

      var request = jasmine.Ajax.requests.first();
      expect(request.url).toBe('https://api.timekit.io/v2/projects/hosted/my-widget-slug');
      expect(widget.getConfig().get('project_id')).toBeDefined();
      expect($('.bookingjs-calendar')).toBeInDOM();
      done();

    }, 50)
  });

  it('should be able to load remote config with id', function(done) {

    var widget = new TimekitBooking();
    var config = {
      app_key: '12345',
      project_id: '12345'
    };
    
    widget.init(config);
    expect(widget).toBeDefined();

    setTimeout(function() {

      var request = jasmine.Ajax.requests.first();
      expect(request.url).toBe('https://api.timekit.io/v2/projects/embed/12345');
      expect(widget.getConfig().get('project_slug')).toBeDefined();
      expect($('.bookingjs-calendar')).toBeInDOM();
      done();

    }, 50)
  });

  it('should be able to load local config with widget ID set by disabling remote load', function(done) {

    var config = {
      project_id: '12345',
      disable_remote_load: true
    }
    
    var widget = createWidget(config);
    setTimeout(function() {

      var request = jasmine.Ajax.requests.first();
      expect(request.url).toBe('https://api.timekit.io/v2/availability');
      expect(widget.getConfig().get('project_id')).toBe('12345');
      done();

    }, 50)
  });

});
