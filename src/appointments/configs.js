/*
 * Default configuration
 */
const primary = {
    debug: false,
    autoload: true,
    el: '#tk-appointments',
    sdk: {
      headers: {
        'Timekit-Context': 'widget'
      }
    },
};
  
module.exports = {
    primary: primary,
}