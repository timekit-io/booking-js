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
    ui: {
      buttonImage: require('!file-loader!./assets/logo.png').default
    }
};
  
module.exports = {
    primary: primary,
}