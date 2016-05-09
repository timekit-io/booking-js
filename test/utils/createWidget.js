'use strict';

var baseConfig = require('./defaultConfig.js');

// Creates a new widget instance with supplied config, inits it and returns it
module.exports = function(config) {

  var newConfig = {};
  $.extend(true, newConfig, config, baseConfig);

  var widget = new TimekitBooking();
  widget.init(newConfig);

  return widget;

}