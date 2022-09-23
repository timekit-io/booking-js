
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
      buttonImage: '/assets/appointment/button.png'
    }
};
  
module.exports = {
    primary: primary,
}