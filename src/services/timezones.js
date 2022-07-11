'use strict';

const moment = require('moment');
const map = require('lodash/map');
const filter = require('lodash/filter');
const orderBy = require('lodash/orderBy');

require('moment-timezone/builds/moment-timezone-with-data-2012-2022.js');

const tzNames = moment.tz.names();
const getFriendlyName = function(tzName) {

    const tzObj = moment().tz(tzName);
    const prefix = '(' + tzObj.format('Z') + ') ';
   
    return {
        key: tzName,
        value: tzName,
        name: prefix + tzName
    }
}

const newList = map(tzNames, (tzName) => getFriendlyName(tzName));
const timezones = orderBy(newList, ['key'], ['asc']);

const guess = () => moment.tz.guess() || 'UTC';
const getZone = (newTz) => moment.tz.zone(newTz);
const knownTimezone = (customerTimezone) => filter(timezones, { key: customerTimezone }).length > 0;
const getTimeZoneName = (customerTimezone) => '(' + moment().tz(customerTimezone).format('Z') + ') ' + customerTimezone;

module.exports = {
    guess,
    getZone,
    knownTimezone,
    getTimeZoneName,
    list: timezones
};
