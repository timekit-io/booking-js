'use strict';

var timekitSDK = require('timekit-sdk');
var config     = require('./config');

// SDK instance
var timekitInstance = timekitSDK.newInstance();

// Setup the Timekit SDK with correct config
var timekitSetupConfig = function() {
  timekitInstance.configure(config.retrieve().timekitConfig);
};

module.exports = {
  instance: timekitInstance,
  timekitSetupConfig: timekitSetupConfig
}
