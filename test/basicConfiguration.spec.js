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

  it('should be able to set the name', function(done) {

    var config = {
      ui: {
        display_name: 'Demo Name'
      }
    }
    createWidget(config);

    expect($('.bookingjs-displayname')).toBeInDOM();
    expect($('.bookingjs-displayname')).toBeVisible();
    expect($('.bookingjs-displayname')).toContainElement('span');
    expect($('.bookingjs-displayname span')).toContainText(config.ui.display_name);

    done()

  });

  it('should be able to set an avatar image', function(done) {

    var config = {
      ui: {
        avatar: '/base/misc/avatar-doc.jpg'
      }
    }
    createWidget(config);

    expect($('.bookingjs-avatar')).toBeInDOM();
    expect($('.bookingjs-avatar')).toBeVisible();
    expect($('.bookingjs-avatar')).toContainElement('img');

    var source = $('.bookingjs-avatar img').prop('src');
    var contains = source.indexOf(config.ui.avatar) > -1;
    expect(contains).toBe(true);

    done()

  });

  it('should be able to set app key in the root-level config key', function(done) {

    var appKey = '123';

    var config = {
      app_key: appKey
    }
    var widget = createWidget(config);

    expect(widget.getConfig().app_key).toBe(appKey)
    expect(widget.timekitSdk.getConfig().appKey).toBe(appKey)

    done()

  });

  it('should be able expose current library version', function(done) {

    var widget = createWidget();

    var widgetVersion = widget.getVersion()

    expect(widgetVersion).toBeDefined()
    expect(typeof widgetVersion.charAt(1)).toBe('string')

    done()

  });

  it('should not have test mode ribbon by default', function(done) {

    createWidget();

    expect($('.bookingjs-ribbon-wrapper')).not.toBeInDOM();
    expect($('.bookingjs-ribbon-wrapper')).not.toBeVisible();
    done();

  });

  it('should have test mode ribbon when set', function(done) {

    mockAjax.findTimeOnTestModeApp();

    createWidget();

    setTimeout(function() {

      expect($('.bookingjs-ribbon-wrapper')).toBeInDOM();
      expect($('.bookingjs-ribbon-wrapper')).toBeVisible();
      done();

    }, 200);

  });

});
