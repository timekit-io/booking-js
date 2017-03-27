'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

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

  it('should be able to set app slug in the root-level config key', function(done) {

    var appName = 'my-test-app';

    var config = {
      app: appName
    }
    var widget = createWidget(config);

    expect(widget.getConfig().app).toBe(appName)
    expect(widget.timekitSdk.getConfig().app).toBe(appName)

    setTimeout(function() {

      interact.clickEvent();

      setTimeout(function() {

        interact.fillSubmit();

        setTimeout(function() {

          var request = jasmine.Ajax.requests.mostRecent();
          expect(request.requestHeaders['Timekit-App']).toBe(appName);
          done();

        }, 200);
      }, 500);
    }, 500);

  });

  it('should be able expose current library version', function(done) {

    var widget = createWidget();

    var widgetVersion = widget.getVersion()

    expect(widgetVersion).toBeDefined()
    expect(typeof widgetVersion.charAt(1)).toBe('string')

    done()

  });

});
