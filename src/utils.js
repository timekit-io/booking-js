'use strict';

require('console-polyfill');

function InitUtils(deps) {

  var getConfig = deps.config.retrieve;

  var isFunction = function(object) {
   return !!(object && object.constructor && object.call && object.apply);
  }

  var isArray = function(object) {
   return object && object.constructor === Array;
  }

  var doCallback = function(hook, arg, deprecated) {
    if(getConfig().callbacks && this.isFunction(getConfig().callbacks[hook])) {
      if (deprecated) {
        this.logDeprecated(hook + ' callback has been replaced, please see docs');
      }
      getConfig().callbacks[hook](arg);
    }
    this.logDebug(['Trigger callback "' + hook + '" with arguments:', arg]);
  }

  var logDebug = function(message) {
    if (getConfig().debug) console.log('TimekitBooking Debug: ', message);
  }

  var logError = function(message) {
    console.warn('TimekitBooking Error: ', message);
  }

  var logDeprecated = function(message) {
    console.warn('TimekitBooking Deprecated: ', message);
  }

  // Helper to decide if it's an embedded remote project
  var isEmbeddedProject = function(suppliedConfig) {
    return typeof suppliedConfig.project_id !== 'undefined'
  };

  // Helper to decide if it's an hosted remote project
  var isHostedProject = function(suppliedConfig) {
    return typeof suppliedConfig.project_slug !== 'undefined'
  };

  // Helper to decide if it's an embedded or hosted remote project
  var isRemoteProject = function(suppliedConfig) {
    return (isEmbeddedProject(suppliedConfig) || isHostedProject(suppliedConfig))
  };

  var doesConfigExist = function (suppliedConfig) {
    return (suppliedConfig !== undefined && typeof suppliedConfig === 'object' && !$.isEmptyObject(suppliedConfig))
  }

  return {
    isFunction: isFunction,
    isArray: isArray,
    doCallback: doCallback,
    logDebug: logDebug,
    logError: logError,
    logDeprecated: logDeprecated,
    isEmbeddedProject: isEmbeddedProject,
    isHostedProject: isHostedProject,
    isRemoteProject: isRemoteProject,
    doesConfigExist: doesConfigExist
  }
}

module.exports = InitUtils
