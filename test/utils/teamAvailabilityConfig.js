'use strict';

// Default config used across tests
module.exports = {
  email:    'marty.mcfly@timekit.io',
  apiToken: 'XT1JO879JF1qUXXzmETD5ucgxaDwsFsd',
  timekitConfig: {
    app: 'bookingjs-demo'
  },
  timekitFindTimeTeam: {
    length: '2 hours',
    users: [
      {
        _email: 'marty.mcfly@timekit.io',
        _calendar: '22f86f0c-ee80-470c-95e8-dadd9d05edd2',
        calendar_ids: ['22f86f0c-ee80-470c-95e8-dadd9d05edd2']
      },
      {
        _email: 'doc.brown@timekit.io',
        _calendar: '11d86f0c-ee80-470c-95e8-dadd9d05edd2',
        calendar_ids: ['11d86f0c-ee80-470c-95e8-dadd9d05edd2']
      }
    ]
  }
}
