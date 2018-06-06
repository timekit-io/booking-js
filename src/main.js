'use strict';

/*!
 * Booking.js
 * http://timekit.io
 *
 * Copyright 2018 Timekit, Inc.
 * Booking.js is freely distributable under the MIT license.
 *
 */

var $          = require('jquery');
var Initialize = require('./init')

// Autoload if config is available on window, else export function
var globalLibraryConfig = window.timekitBookingConfig
if (window && globalLibraryConfig && globalLibraryConfig.autoload !== false) {
  $(window).on('load', function(){
    var instance = new Initialize();
    instance.init(globalLibraryConfig);
    module.exports = instance;
  });
} else {
  module.exports = Initialize;
}
