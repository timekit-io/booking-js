'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var baseConfig = require('./utils/defaultConfig');
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

  it('should be able to load remote config', function(done) {

    var widget = new TimekitBooking();
    var config = {
      widgetId: 'my-widget-slug'
    };
    widget.init(config);

    expect(widget).toBeDefined();

    setTimeout(function() {

      var request = jasmine.Ajax.requests.first();

      expect(request.url).toBe('https://api.timekit.io/v2/widgets/public/my-widget-slug');
      expect(widget.getConfig().email).toBeDefined();
      expect($('.bookingjs-calendar')).toBeInDOM();
      done();

    }, 50)
  });

});
