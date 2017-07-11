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
      email:    'marty.mcfly@timekit.io',
      apiToken: 'XT1JO879JF1qUXXzmETD5ucgxaDwsFsd',
      calendar: '22f86f0c-ee80-470c-95e8-dadd9d05edd2',
      timekitConfig: {
        app: 'widget-app-1'
      }
    });

    var widget2 = new TimekitBooking();
    widget2.init({
      email:    'doc.brown@timekit.io',
      apiToken: 'XT1JO879JF1qUXXzmETD5ucgxaDwsFsX',
      calendar: '22f86f0c-ee80-470c-95e8-dadd9d05eddX',
      timekitConfig: {
        app: 'widget-app-2'
      }
    });

    var widget1App = widget1.timekitSdk.getConfig().app
    var widget2App = widget2.timekitSdk.getConfig().app

    expect(widget1App).not.toEqual(widget2App);

  });

});
