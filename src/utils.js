'use strict';

/*
 * Utily functions for Booking.js
 */

module.exports = {

  isFunction: function(object) {
   return !!(object && object.constructor && object.call && object.apply);
  },

  doCallback: function(name, config, args) {
    if(this.isFunction(config.callbacks[name])) {
      config.callbacks[name](args);
    }
  },

  haveHook: function(name, config) {
    return this.isFunction(config.hooks[name]);
  },

  doHook: function(name, config, args) {
    if (this.haveHook(name, config)) {
      config.hooks[name](args);
    }
  }

};
