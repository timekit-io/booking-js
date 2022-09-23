
'use strict';

const BookingWidget = require('./widget');
const globalLibraryConfig = window.timekitBookingConfig;

// Autoload if config is available on window, else export function
if (window && globalLibraryConfig && globalLibraryConfig.autoload !== false) {
  const instance = new BookingWidget();
  module.exports = instance.init(globalLibraryConfig);
} else {
  module.exports = BookingWidget;
}