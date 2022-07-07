'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var baseConfig = require('./utils/defaultConfig');
var mockAjax = require('./utils/mockAjax');

describe('Multiple instances', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to create load multiple instances with isolated SDK configs', function() {

    var widget1 = new TimekitBooking();
    widget1.init({
      app_key: '12345'
    });

    var widget2 = new TimekitBooking();
    widget2.init({
      app_key: '67890'
    });

    var widget1SdkAppKey = widget1.getSdk().getConfig().appKey;
    var widget2SdkAppKey = widget2.getSdk().getConfig().appKey;

    expect(widget1SdkAppKey).not.toEqual(widget2SdkAppKey);

    var widget1ConfigAppKey = widget1.getConfig().get('app_key');
    var widget2ConfigAppKey = widget2.getConfig().get('app_key');

    expect(widget1ConfigAppKey).not.toEqual(widget2ConfigAppKey);

  });

});
