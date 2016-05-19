'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var mockAjax = require('./utils/mockAjax');

/**
 * Intilialize the library with plain build
 */
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
      widgetSlug: 'my-widget-slug'
    };
    widget.init(config);

    expect(widget).toBeDefined();

    setTimeout(function() {

      var request = jasmine.Ajax.requests.first();

      expect(request.url).toBe('https://api.timekit.io/v2/widgets/hosted/my-widget-slug');
      expect(widget.getConfig().email).toBeDefined();
      expect($('.bookingjs-calendar')).toBeInDOM();
      done();

    }, 50)
  });


  it('should be able to load remote config with id', function(done) {

    var widget = new TimekitBooking();
    var config = {
      widgetId: '12345'
    };
    widget.init(config);

    expect(widget).toBeDefined();

    setTimeout(function() {

      var request = jasmine.Ajax.requests.first();

      expect(request.url).toBe('https://api.timekit.io/v2/widgets/embed/12345');
      expect(widget.getConfig().email).toBeDefined();
      expect($('.bookingjs-calendar')).toBeInDOM();
      done();

    }, 50)
  });

});
