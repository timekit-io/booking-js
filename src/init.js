'use strict';

var $             = require('jquery');
var timekitSdk    = require('timekit-sdk');

var ConfigDep     = require('./config');
var UtilsDep      = require('./utils');
var RenderDep     = require('./render');

// Main library
function Initialize() {

  // SDK instance
  var sdk     = timekitSdk.newInstance();
  var config  = new ConfigDep();
  var utils   = new UtilsDep({ config: config });
  var render  = new RenderDep({ config: config, utils: utils, sdk: sdk });
  var getConfig = config.retrieve;

  // Initilization method
  var init = function(suppliedConfig) {
    // Make sure that SDK is ready and debug flag is checked early
    var localConfig = config.setDefaults(suppliedConfig || {});
    config.update(localConfig);
    utils.logDebug(['Version:', getVersion()]);
    utils.logDebug(['Supplied config:', suppliedConfig]);

    // Set rootTarget to the target element and clean before child nodes before continuing
    try {
      render.prepareDOM(suppliedConfig || {});
    } catch (e) {
      utils.logError(e)
      return this
    }

    // Check whether a config is supplied
    if (!utils.doesConfigExist(suppliedConfig)) {
      render.triggerError('No configuration was supplied. Please supply a config object upon library initialization');
      return this
    }

    // Start from local config
    if (!utils.isRemoteProject(suppliedConfig) || suppliedConfig.disable_remote_load) {
      var mergedConfig = config.setDefaultsWithoutProject(suppliedConfig)
      return startWithConfig(mergedConfig)
    }

    // Load remote embedded config
    if (utils.isEmbeddedProject(suppliedConfig)) {
      loadRemoteEmbeddedProject(suppliedConfig)
    }

    // Load remote hosted config
    if (utils.isHostedProject(suppliedConfig)) {
      loadRemoteHostedProject(suppliedConfig)
    }

    return this
  };

  // Setup the Timekit SDK with correct config
  var configureSdk = function(sdkConfig) {
    sdk.configure(getConfig().sdk);
  };

  var loadRemoteEmbeddedProject = function(suppliedConfig) {
    // App key is required when fetching an embedded project, bail if not fund
    if (!suppliedConfig.app_key) {
      render.triggerError('Missing "app_key" in conjunction with "project_id", please provide your "app_key" for authentication');
      return this
    }
    configureSdk();
    sdk.makeRequest({
      url: '/projects/embed/' + suppliedConfig.project_id,
      method: 'get'
    })
    .then(function(response) {
      remoteProjectLoaded(response, suppliedConfig)
    })
    .catch(function (e) {
      render.triggerError(['The project could not be found, please double-check your "project_id" and "app_key"', e]);
    })
  }

  var loadRemoteHostedProject = function (suppliedConfig) {
    configureSdk();
    sdk.makeRequest({
      url: '/projects/hosted/' + suppliedConfig.project_slug,
      method: 'get'
    })
    .then(function(response) {
      remoteProjectLoaded(response, suppliedConfig)
    })
    .catch(function (e) {
      render.triggerError(['The project could not be found, please double-check your "project_slug"', e]);
    })
  }

  // Process retrieved project config and start
  var remoteProjectLoaded = function (response, suppliedConfig) {
    var remoteConfig = response.data
    // streamline naming of object keys
    if (remoteConfig.id) {
      remoteConfig.project_id = remoteConfig.id
      delete remoteConfig.id
    }
    if (remoteConfig.slug) {
      remoteConfig.project_slug = remoteConfig.slug
      delete remoteConfig.slug
    }
    // merge with supplied config for overwriting settings
    var mergedConfig = $.extend(true, {}, remoteConfig, suppliedConfig);
    utils.logDebug(['Remote config:', remoteConfig]);
    startWithConfig(mergedConfig)
  }

  // Parse the config and start rendering
  var startWithConfig = function(suppliedConfig) {
    // Handle config and defaults
    try {
      config.parseAndUpdate(suppliedConfig);
    } catch (e) {
      render.triggerError(e);
      return this
    }

    utils.logDebug(['Final config:', getConfig()]);

    return startRender();
  };

  // Render method
  var startRender = function() {
    utils.doCallback('renderStarted');

    // Setup Timekit SDK config
    configureSdk();

    // Initialize FullCalendar
    render.initializeCalendar();

    // Get availability through Timekit SDK
    render.getAvailability();

    // Show image avatar if set
    if (getConfig().ui.avatar) {
      render.renderAvatarImage();
    }

    // Print out display name
    if (getConfig().ui.display_name) {
      render.renderDisplayName();
    }

    utils.doCallback('renderCompleted');

    return this;
  };

  // Get library version
  var getVersion = function() {
    return VERSION;
  };

  var destroy = function() {
    render.prepareDOM({});
    config.update({});
    return this;
  };

  // Expose methods
  return {
    setConfig:    config.parseAndUpdate,
    getConfig:    getConfig,
    getVersion:   getVersion,
    render:       startRender,
    init:         init,
    destroy:      destroy,
    timekitCreateBooking: render.timekitCreateBooking,
    fullCalendar: render.fullCalendar,
    timekitSdk:   sdk
  };

}

module.exports = Initialize
