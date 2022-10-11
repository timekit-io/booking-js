/*
 * Default configuration
 */
const primary = {
    debug: false,
    autoload: true,
    elBtn: '#tk-bot-btn',
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
          placeholder: 'Search for a city or postal code.'
        },
      },
      booking: {
        title: 'Complete Booking Details',
        description: 'Please select an appointment time and fill out the booking form.',
      }
    }
};
  
module.exports = {
    primary: primary,
}