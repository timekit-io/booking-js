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

  return {
    isFunction: isFunction,
    isArray: isArray,
    doCallback: doCallback,
    logDebug: logDebug,
    logError: logError,
    logDeprecated: logDeprecated
  }
}

module.exports = InitUtils
