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
      appKey: '12345'
    });

    var widget2 = new TimekitBooking();
    widget2.init({
      appKey: '67890'
    });

    var widget1SdkAppKey = widget1.timekitSdk.getConfig().appKey
    var widget2SdkAppKey = widget2.timekitSdk.getConfig().appKey

    expect(widget1SdkAppKey).not.toEqual(widget2SdkAppKey);

    var widget1ConfigAppKey = widget1.getConfig().appKey
    var widget2ConfigAppKey = widget2.getConfig().appKey

    expect(widget1ConfigAppKey).not.toEqual(widget2ConfigAppKey);

  });

});
