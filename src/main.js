'use strict';

/*!
 * Booking.js
 * http://timekit.io
 *
 * Copyright 2015 Timekit, Inc.
 * Booking.js is freely distributable under the MIT license.
 *
 */

var $             = require('jquery');
var utils         = require('./utils');
var defaultConfig = require('./defaults');
var config        = require('./config');
var render        = require('./render');
var sdk           = require('./sdk');

// Main library
function TimekitBooking() {

  // SDK instance
  var timekit = sdk.instance;

  // Initilization method
  var init = function(suppliedConfig) {

    var localConfig = config.setDefaults(suppliedConfig);
    config.update(localConfig);

    utils.logDebug(['Supplied config:', suppliedConfig]);
    utils.logDebug(render)

    try {

      // Set rootTarget to the target element and clean before child nodes before continuing
      render.prepareDOM(suppliedConfig || {});

      // Start from local config
      if (!suppliedConfig || (!suppliedConfig.projectId && !suppliedConfig.projectSlug) || suppliedConfig.disableRemoteLoad) {
        return start(suppliedConfig)
      }

    } catch (e) {
      utils.logError(e)
      return this
    }

    // Load remote config
    loadRemoteConfig(suppliedConfig)
    .then(function (response) {
      var remoteConfig = response.data
      // streamline naming of object keys
      if (remoteConfig.id) {
        remoteConfig.projectId = remoteConfig.id
        delete remoteConfig.id
      }
      if (remoteConfig.app_key) {
        remoteConfig.appKey = remoteConfig.app_key
        delete remoteConfig.app_key
      }
      // merge with supplied config for overwriting settings
      var mergedConfig = $.extend(true, {}, remoteConfig, suppliedConfig);
      utils.logDebug(['Remote config:', remoteConfig]);
      start(mergedConfig)
    })
    .catch(function () {
      render.triggerError('The project could not be found, please double-check your projectId/projectSlug');
    })

    return this

  };

  // Load config from remote (embed or hosted)
  var loadRemoteConfig = function(suppliedConfig) {

    var localConfig = config.setDefaults(suppliedConfig);
    config.update(localConfig);
    sdk.timekitSetupConfig();
    if (suppliedConfig.projectId && suppliedConfig.appKey) {
      return timekit
      .makeRequest({
        url: '/projects/embed/' + suppliedConfig.projectId,
        method: 'get'
      })
    }
    if (suppliedConfig.projectSlug) {
      return timekit
      .makeRequest({
        url: '/projects/hosted/' + suppliedConfig.projectSlug,
        method: 'get'
      })
    }
    throw render.triggerError('No widget configuration, projectSlug or projectId found');

  };

  // Parse the config and start rendering
  var start = function(suppliedConfig) {

    // Handle config and defaults
    try {
      config.parseAndUpdate(suppliedConfig);
      utils.logDebug(['Final config:', config.retrieve()]);
      utils.logDebug(['Version:', getVersion()]);
    } catch (e) {
      render.triggerError(e);
      return this
    }

    return startRender();

  };

  // Render method
  var startRender = function() {

    utils.doCallback('renderStarted');

    // Setup Timekit SDK config
    sdk.timekitSetupConfig();

    // Initialize FullCalendar
    render.initializeCalendar();

    // Get availability through Timekit SDK
    render.getAvailability();

    // TODO Show timezone helper if enabled
    if (config.retrieve().localization.showTimezoneHelper) {
      // renderTimezoneHelper();
    }

    // Show image avatar if set
    if (config.retrieve().avatar) {
      render.renderAvatarImage();
    }

    // Print out display name
    if (config.retrieve().name) {
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
    getConfig:    config.retrieve,
    getVersion:   getVersion,
    render:       render,
    init:         init,
    destroy:      destroy,
    timekitCreateBooking: render.timekitCreateBooking,
    fullCalendar: render.fullCalendar,
    timekitSdk:   timekit
  };

}

// Autoload if config is available on window, else export function
var globalLibraryConfig = window.timekitBookingConfig
if (window && globalLibraryConfig && globalLibraryConfig.autoload !== false) {
  $(window).on('load', function(){
    var instance = new TimekitBooking();
    instance.init(globalLibraryConfig);
    module.exports = instance;
  });
} else {
  module.exports = TimekitBooking;
}
