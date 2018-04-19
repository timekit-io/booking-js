'use strict';

var defaultConfig = require('./defaults');

function InitConfig() {

  var config = {};

  // Merge defaults into passed config
  var setDefaults = function(suppliedConfig) {

    if (suppliedConfig.appKey) {
      if (typeof suppliedConfig.timekitConfig === 'undefined') suppliedConfig.timekitConfig = {}
      suppliedConfig.timekitConfig.appKey = suppliedConfig.appKey
    }
    return $.extend(true, {}, defaultConfig.primary, suppliedConfig);

  };

  // Apply the config presets given a configuration
  var applyConfigPreset = function (localConfig, propertyName, propertyObject) {

    var presetCheck = defaultConfig.presets[propertyName][propertyObject];
    if (presetCheck) return $.extend(true, {}, presetCheck, localConfig);
    return localConfig

  };

  // Setup config
  var parseAndUpdate = function(suppliedConfig) {

    // Check whether a config is supplied
    if(suppliedConfig === undefined || typeof suppliedConfig !== 'object' || $.isEmptyObject(suppliedConfig)) {
      throw 'No configuration was supplied or found. Please supply a config object upon library initialization';
    }

    // Extend the default config with supplied settings
    var newConfig = setDefaults(suppliedConfig);

    // Apply presets
    newConfig = applyConfigPreset(newConfig, 'timeDateFormat', newConfig.localization.timeDateFormat)
    newConfig = applyConfigPreset(newConfig, 'bookingGraph', newConfig.booking.graph)
    newConfig = applyConfigPreset(newConfig, 'availabilityView', newConfig.availabilityView)

    // Check for required settings
    if (!newConfig.appKey) {
      throw 'A required config setting ("appKey") was missing';
    }

    // Set new config to instance config
    config = newConfig;

    return config;

  };

  return {
    parseAndUpdate: parseAndUpdate,
    setDefaults: setDefaults,
    update: function (passedConfig) {
      config = passedConfig
    },
    retrieve: function () {
      return config
    }
  }
}

module.exports = InitConfig
