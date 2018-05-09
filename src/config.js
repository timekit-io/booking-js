'use strict';

var defaultConfig = require('./defaults');

function InitConfig() {

  // Current state
  var config = {};

  // Setup defaults for the SDK
  var prepareSdkConfig = function(suppliedConfig) {
    if (typeof suppliedConfig.sdk === 'undefined') suppliedConfig.sdk = {}
    if (suppliedConfig.app_key) suppliedConfig.sdk.appKey = suppliedConfig.app_key
    return $.extend(true, {}, defaultConfig.primary.sdk, suppliedConfig.sdk);
  }

  // Merge defaults into passed config
  var setDefaults = function(suppliedConfig) {
    suppliedConfig.sdk = prepareSdkConfig(suppliedConfig)
    return $.extend(true, {}, defaultConfig.primary, suppliedConfig);
  };

  // Merge defaults into passed config
  var setDefaultsWithoutProject = function(suppliedConfig) {
    return $.extend(true, {}, defaultConfig.primaryWithoutProject, suppliedConfig);
  };

  // Apply the config presets given a configuration
  var applyConfigPreset = function (localConfig, propertyName, propertyObject) {
    var presetCheck = defaultConfig.presets[propertyName][propertyObject];
    if (presetCheck) return $.extend(true, {}, presetCheck, localConfig);
    return localConfig
  };

  // Setup config
  var parseAndUpdate = function(suppliedConfig) {

    // Extend the default config with supplied settings
    var newConfig = setDefaults(suppliedConfig);

    // Apply presets
    newConfig = applyConfigPreset(newConfig, 'timeDateFormat', newConfig.ui.time_date_format)
    newConfig = applyConfigPreset(newConfig, 'availabilityView', newConfig.ui.availability_view)

    // Check for required settings
    if (!newConfig.app_key) {
      throw 'A required config setting ("app_key") was missing';
    }

    // Set new config to instance config
    update(newConfig);

    return config;

  };

  var update = function (passedConfig) {
    config = passedConfig
  }

  var retrieve = function () {
    return config
  }

  return {
    parseAndUpdate: parseAndUpdate,
    setDefaults: setDefaults,
    setDefaultsWithoutProject: setDefaultsWithoutProject,
    update: update,
    retrieve: retrieve
  }
}

module.exports = InitConfig
