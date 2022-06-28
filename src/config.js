'use strict';

var defaultConfig = require('./defaults');
var qs = require('querystringify');

function InitConfig() {

  // Current state
  var config = {};
  var global = null;

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

  // Set default formats for native fields
  var setCustomerFieldsNativeFormats = function(config) {
    $.each(config.customer_fields, function (key, field) {
      if (!defaultConfig.customerFieldsNativeFormats[key]) return
      config.customer_fields[key] = $.extend({}, defaultConfig.customerFieldsNativeFormats[key], field);
    })
    return config
  };

  // Apply the config presets given a configuration
  var applyConfigPreset = function (localConfig, propertyName, propertyObject) {
    var presetCheck = defaultConfig.presets[propertyName][propertyObject];
    if (presetCheck) return $.extend(true, {}, presetCheck, localConfig);
    return localConfig
  };

  // Prefill customer fields based on URL query string
  var applyPrefillFromUrlGetParams = function (suppliedConfig, urlParams) {
    $.each(suppliedConfig.customer_fields, function (key) {
      if (!urlParams['customer.' + key]) return
      suppliedConfig.customer_fields[key].prefilled = urlParams['customer.' + key];
    });
    return suppliedConfig
  }

  // Setup config
  var parseAndUpdate = function(suppliedConfig) {

    // Extend the default config with supplied settings
    var newConfig = setDefaults(suppliedConfig);

    // Apply presets
    newConfig = applyConfigPreset(newConfig, 'timeDateFormat', newConfig.ui.time_date_format)
    newConfig = applyConfigPreset(newConfig, 'availabilityView', newConfig.ui.availability_view)

    // Set default formats for native fields
    newConfig = setCustomerFieldsNativeFormats(newConfig)

    // Check for required settings
    if (!newConfig.app_key) throw 'A required config setting ("app_key") was missing';

    // Prefill fields based on query string
    var urlParams = qs.parse(getGlobal().location && getGlobal().location.search);
    if (urlParams) newConfig = applyPrefillFromUrlGetParams(newConfig, urlParams);
    if (urlParams['booking.uuid']) {
      newConfig.booking.uuid = urlParams['booking.uuid'];
    } else {
      newConfig.booking.uuid = false;
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

  var setGlobal = function(val) {
    global = val
  }

  var getGlobal = function(val) {
    return global
  }

  return {
    parseAndUpdate: parseAndUpdate,
    setDefaults: setDefaults,
    setDefaultsWithoutProject: setDefaultsWithoutProject,
    update: update,
    retrieve: retrieve,
    setGlobal: setGlobal,
    getGlobal: getGlobal
  }
}

module.exports = InitConfig
