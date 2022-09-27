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
    selectorOptions: {
      service: {
        title: 'Select an Appointment Type',
        description: 'Which appointment type would you like?',
      },
      location: {
        title: 'Select a Location',
        description: 'Choose a location from the following that you will be visiting for your appointment.',
        search_bar: {
          enabled: true,
          placeholder: 'Choose a location from the following that you will be visiting for your appointment.'
        },
      }
    }
};
  
module.exports = {
    primary: primary,
}