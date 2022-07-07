'use strict';

var baseConfig = require('./defaultConfig.js');

// Creates a new widget instance with supplied config, inits it and returns it
module.exports = function(config, global) {

  var newConfig = {};
  $.extend(true, newConfig, baseConfig, config);

  var widget = new TimekitBooking();
  widget.init(newConfig, global);

  return widget;
}
