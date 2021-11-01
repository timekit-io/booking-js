'use strict';

var _ = require('lodash');

var oldTimeZones = [
  { key: 'Pacific/Midway', value: 'Pacific/Midway', name: '(-11:00) Midway Island' },
  { key: 'Pacific/Samoa', value: 'Pacific/Samoa', name: '(-11:00) Samoa' },
  { key: 'Pacific/Honolulu', value: 'Pacific/Honolulu', name: '(-10:00) Hawaii' },
  { key: 'US/Alaska', value: 'US/Alaska', name: '(-09:00) Alaska' },
  { key: 'America/Los_Angeles', value: 'America/Los_Angeles', name: '(-08:00) Pacific Time (US & Canada)' },
  { key: 'America/Tijuana', value: 'America/Tijuana', name: '(-08:00) Tijuana' },
  { key: 'US/Arizona', value: 'US/Arizona', name: '(-07:00) Arizona' },
  { key: 'America/Chihuahua', value: 'America/Chihuahua', name: '(-07:00) Chihuahua' },
  { key: 'America/Chihuahua', value: 'America/Chihuahua', name: '(-07:00) La Paz' },
  { key: 'America/Mazatlan', value: 'America/Mazatlan', name: '(-07:00) Mazatlan' },
  { key: 'US/Mountain', value: 'US/Mountain', name: '(-07:00) Mountain Time (US & Canada)' },
  { key: 'America/Managua', value: 'America/Managua', name: '(-06:00) Central America' },
  { key: 'US/Central', value: 'US/Central', name: '(-06:00) Central Time (US & Canada)' },
  { key: 'America/Mexico_City', value: 'America/Mexico_City', name: '(-06:00) Guadalajara' },
  { key: 'America/Mexico_City', value: 'America/Mexico_City', name: '(-06:00) Mexico City' },
  { key: 'America/Monterrey', value: 'America/Monterrey', name: '(-06:00) Monterrey' },
  { key: 'Canada/Saskatchewan', value: 'Canada/Saskatchewan', name: '(-06:00) Saskatchewan' },
  { key: 'America/Bogota', value: 'America/Bogota', name: '(-05:00) Bogota' },
  { key: 'US/Eastern', value: 'US/Eastern', name: '(-05:00) Eastern Time (US & Canada)' },
  { key: 'US/East-Indiana', value: 'US/East-Indiana', name: '(-05:00) Indiana (East)' },
  { key: 'America/Lima', value: 'America/Lima', name: '(-05:00) Lima' },
  { key: 'America/Bogota', value: 'America/Bogota', name: '(-05:00) Quito' },
  { key: 'Canada/Atlantic', value: 'Canada/Atlantic', name: '(-04:00) Atlantic Time (Canada)' },
  { key: 'America/Caracas', value: 'America/Caracas', name: '(-04:30) Caracas' },
  { key: 'America/La_Paz', value: 'America/La_Paz', name: '(-04:00) La Paz' },
  { key: 'America/Santiago', value: 'America/Santiago', name: '(-04:00) Santiago' },
  { key: 'Canada/Newfoundland', value: 'Canada/Newfoundland', name: '(-03:30) Newfoundland' },
  { key: 'America/Sao_Paulo', value: 'America/Sao_Paulo', name: '(-03:00) Brasilia' },
  { key: 'America/Buenos_Aires', value: 'America/Argentina/Buenos_Aires', name: '(-03:00) Buenos Aires' },
  { key: 'America/Argentina/Buenos_Aires', value: 'America/Argentina/Buenos_Aires', name: '(-03:00) Georgetown' },
  { key: 'America/Godthab', value: 'America/Godthab', name: '(-03:00) Greenland' },
  { key: 'America/Noronha', value: 'America/Noronha', name: '(-02:00) Mid-Atlantic' },
  { key: 'Atlantic/Azores', value: 'Atlantic/Azores', name: '(-01:00) Azores' },
  { key: 'Atlantic/Cape_Verde', value: 'Atlantic/Cape_Verde', name: '(-01:00) Cape Verde Is.' },
  { key: 'Africa/Casablanca', value: 'Africa/Casablanca', name: '(+00:00) Casablanca' },
  { key: 'Europe/London', value: 'Europe/London', name: '(+00:00) Edinburgh' },
  { key: 'Etc/Greenwich', value: 'Etc/Greenwich', name: '(+00:00) Dublin (Greenwich Mean Time)' },
  { key: 'Europe/Lisbon', value: 'Europe/Lisbon', name: '(+00:00) Lisbon' },
  { key: 'Europe/London', value: 'Europe/London', name: '(+00:00) London' },
  { key: 'Africa/Monrovia', value: 'Africa/Monrovia', name: '(+00:00) Monrovia' },
  { key: 'UTC', value: 'UTC', name: '(+00:00) UTC' },
  { key: 'Europe/Amsterdam', value: 'Europe/Amsterdam', name: '(+01:00) Amsterdam' },
  { key: 'Europe/Belgrade', value: 'Europe/Belgrade', name: '(+01:00) Belgrade' },
  { key: 'Europe/Berlin', value: 'Europe/Berlin', name: '(+01:00) Berlin' },
  { key: 'Europe/Berlin', value: 'Europe/Berlin', name: '(+01:00) Bern' },
  { key: 'Europe/Bratislava', value: 'Europe/Bratislava', name: '(+01:00) Bratislava' },
  { key: 'Europe/Brussels', value: 'Europe/Brussels', name: '(+01:00) Brussels' },
  { key: 'Europe/Budapest', value: 'Europe/Budapest', name: '(+01:00) Budapest' },
  { key: 'Europe/Copenhagen', value: 'Europe/Copenhagen', name: '(+01:00) Copenhagen' },
  { key: 'Europe/Ljubljana', value: 'Europe/Ljubljana', name: '(+01:00) Ljubljana' },
  { key: 'Europe/Madrid', value: 'Europe/Madrid', name: '(+01:00) Madrid' },
  { key: 'Europe/Paris', value: 'Europe/Paris', name: '(+01:00) Paris' },
  { key: 'Europe/Prague', value: 'Europe/Prague', name: '(+01:00) Prague' },
  { key: 'Europe/Rome', value: 'Europe/Rome', name: '(+01:00) Rome' },
  { key: 'Europe/Sarajevo', value: 'Europe/Sarajevo', name: '(+01:00) Sarajevo' },
  { key: 'Europe/Skopje', value: 'Europe/Skopje', name: '(+01:00) Skopje' },
  { key: 'Europe/Stockholm', value: 'Europe/Stockholm', name: '(+01:00) Stockholm' },
  { key: 'Europe/Vienna', value: 'Europe/Vienna', name: '(+01:00) Vienna' },
  { key: 'Europe/Warsaw', value: 'Europe/Warsaw', name: '(+01:00) Warsaw' },
  { key: 'Africa/Lagos', value: 'Africa/Lagos', name: '(+01:00) West Central Africa' },
  { key: 'Europe/Zagreb', value: 'Europe/Zagreb', name: '(+01:00) Zagreb' },
  { key: 'Europe/Athens', value: 'Europe/Athens', name: '(+02:00) Athens' },
  { key: 'Europe/Bucharest', value: 'Europe/Bucharest', name: '(+02:00) Bucharest' },
  { key: 'Africa/Cairo', value: 'Africa/Cairo', name: '(+02:00) Cairo' },
  { key: 'Africa/Harare', value: 'Africa/Harare', name: '(+02:00) Harare' },
  { key: 'Europe/Helsinki', value: 'Europe/Helsinki', name: '(+02:00) Helsinki' },
  { key: 'Europe/Istanbul', value: 'Europe/Istanbul', name: '(+02:00) Istanbul' },
  { key: 'Asia/Jerusalem', value: 'Asia/Jerusalem', name: '(+02:00) Jerusalem' },
  { key: 'Europe/Helsinki', value: 'Europe/Helsinki', name: '(+02:00) Kyiv' },
  { key: 'Africa/Johannesburg', value: 'Africa/Johannesburg', name: '(+02:00) Pretoria' },
  { key: 'Europe/Riga', value: 'Europe/Riga', name: '(+02:00) Riga' },
  { key: 'Europe/Sofia', value: 'Europe/Sofia', name: '(+02:00) Sofia' },
  { key: 'Europe/Tallinn', value: 'Europe/Tallinn', name: '(+02:00) Tallinn' },
  { key: 'Europe/Vilnius', value: 'Europe/Vilnius', name: '(+02:00) Vilnius' },
  { key: 'Asia/Baghdad', value: 'Asia/Baghdad', name: '(+03:00) Baghdad' },
  { key: 'Asia/Kuwait', value: 'Asia/Kuwait', name: '(+03:00) Kuwait' },
  { key: 'Europe/Minsk', value: 'Europe/Minsk', name: '(+03:00) Minsk' },
  { key: 'Africa/Nairobi', value: 'Africa/Nairobi', name: '(+03:00) Nairobi' },
  { key: 'Asia/Riyadh', value: 'Asia/Riyadh', name: '(+03:00) Riyadh' },
  { key: 'Europe/Volgograd', value: 'Europe/Volgograd', name: '(+03:00) Volgograd' },
  { key: 'Asia/Tehran', value: 'Asia/Tehran', name: '(+03:30) Tehran' },
  { key: 'Asia/Muscat', value: 'Asia/Muscat', name: '(+04:00) Abu Dhabi' },
  { key: 'Asia/Baku', value: 'Asia/Baku', name: '(+04:00) Baku' },
  { key: 'Europe/Moscow', value: 'Europe/Moscow', name: '(+04:00) Moscow' },
  { key: 'Asia/Muscat', value: 'Asia/Muscat', name: '(+04:00) Muscat' },
  { key: 'Europe/Moscow', value: 'Europe/Moscow', name: '(+04:00) St. Petersburg' },
  { key: 'Asia/Tbilisi', value: 'Asia/Tbilisi', name: '(+04:00) Tbilisi' },
  { key: 'Asia/Yerevan', value: 'Asia/Yerevan', name: '(+04:00) Yerevan' },
  { key: 'Asia/Kabul', value: 'Asia/Kabul', name: '(+04:30) Kabul' },
  { key: 'Asia/Karachi', value: 'Asia/Karachi', name: '(+05:00) Islamabad' },
  { key: 'Asia/Karachi', value: 'Asia/Karachi', name: '(+05:00) Karachi' },
  { key: 'Asia/Tashkent', value: 'Asia/Tashkent', name: '(+05:00) Tashkent' },
  { key: 'Asia/Calcutta', value: 'Asia/Calcutta', name: '(+05:30) Chennai' },
  { key: 'Asia/Kolkata', value: 'Asia/Kolkata', name: '(+05:30) Kolkata' },
  { key: 'Asia/Calcutta', value: 'Asia/Calcutta', name: '(+05:30) Mumbai' },
  { key: 'Asia/Calcutta', value: 'Asia/Calcutta', name: '(+05:30) New Delhi' },
  { key: 'Asia/Calcutta', value: 'Asia/Calcutta', name: '(+05:30) Sri Jayawardenepura' },
  { key: 'Asia/Katmandu', value: 'Asia/Katmandu', name: '(+05:45) Kathmandu' },
  { key: 'Asia/Almaty', value: 'Asia/Almaty', name: '(+06:00) Almaty' },
  { key: 'Asia/Dhaka', value: 'Asia/Dhaka', name: '(+06:00) Astana' },
  { key: 'Asia/Dhaka', value: 'Asia/Dhaka', name: '(+06:00) Dhaka' },
  { key: 'Asia/Yekaterinburg', value: 'Asia/Yekaterinburg', name: '(+06:00) Ekaterinburg' },
  { key: 'Asia/Rangoon', value: 'Asia/Rangoon', name: '(+06:30) Rangoon' },
  { key: 'Asia/Bangkok', value: 'Asia/Bangkok', name: '(+07:00) Bangkok' },
  { key: 'Asia/Bangkok', value: 'Asia/Bangkok', name: '(+07:00) Hanoi' },
  { key: 'Asia/Jakarta', value: 'Asia/Jakarta', name: '(+07:00) Jakarta' },
  { key: 'Asia/Novosibirsk', value: 'Asia/Novosibirsk', name: '(+07:00) Novosibirsk' },
  { key: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong', name: '(+08:00) Beijing' },
  { key: 'Asia/Chongqing', value: 'Asia/Chongqing', name: '(+08:00) Chongqing' },
  { key: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong', name: '(+08:00) Hong Kong' },
  { key: 'Asia/Krasnoyarsk', value: 'Asia/Krasnoyarsk', name: '(+08:00) Krasnoyarsk' },
  { key: 'Asia/Kuala_Lumpur', value: 'Asia/Kuala_Lumpur', name: '(+08:00) Kuala Lumpur' },
  { key: 'Australia/Perth', value: 'Australia/Perth', name: '(+08:00) Perth' },
  { key: 'Asia/Singapore', value: 'Asia/Singapore', name: '(+08:00) Singapore' },
  { key: 'Asia/Taipei', value: 'Asia/Taipei', name: '(+08:00) Taipei' },
  { key: 'Asia/Ulan_Bator', value: 'Asia/Ulan_Bator', name: '(+08:00) Ulaan Bataar' },
  { key: 'Asia/Urumqi', value: 'Asia/Urumqi', name: '(+08:00) Urumqi' },
  { key: 'Asia/Irkutsk', value: 'Asia/Irkutsk', name: '(+09:00) Irkutsk' },
  { key: 'Asia/Tokyo', value: 'Asia/Tokyo', name: '(+09:00) Osaka' },
  { key: 'Asia/Tokyo', value: 'Asia/Tokyo', name: '(+09:00) Sapporo' },
  { key: 'Asia/Seoul', value: 'Asia/Seoul', name: '(+09:00) Seoul' },
  { key: 'Asia/Tokyo', value: 'Asia/Tokyo', name: '(+09:00) Tokyo' },
  { key: 'Australia/Adelaide', value: 'Australia/Adelaide', name: '(+09:30) Adelaide' },
  { key: 'Australia/Darwin', value: 'Australia/Darwin', name: '(+09:30) Darwin' },
  { key: 'Australia/Brisbane', value: 'Australia/Brisbane', name: '(+10:00) Brisbane' },
  { key: 'Australia/Canberra', value: 'Australia/Canberra', name: '(+10:00) Canberra' },
  { key: 'Pacific/Guam', value: 'Pacific/Guam', name: '(+10:00) Guam' },
  { key: 'Australia/Hobart', value: 'Australia/Hobart', name: '(+10:00) Hobart' },
  { key: 'Australia/Melbourne', value: 'Australia/Melbourne', name: '(+10:00) Melbourne' },
  { key: 'Pacific/Port_Moresby', value: 'Pacific/Port_Moresby', name: '(+10:00) Port Moresby' },
  { key: 'Australia/Sydney', value: 'Australia/Sydney', name: '(+10:00) Sydney' },
  { key: 'Asia/Yakutsk', value: 'Asia/Yakutsk', name: '(+10:00) Yakutsk' },
  { key: 'Asia/Vladivostok', value: 'Asia/Vladivostok', name: '(+11:00) Vladivostok' },
  { key: 'Pacific/Auckland', value: 'Pacific/Auckland', name: '(+12:00) Auckland' },
  { key: 'Pacific/Fiji', value: 'Pacific/Fiji', name: '(+12:00) Fiji' },
  { key: 'Pacific/Kwajalein', value: 'Pacific/Kwajalein', name: '(+12:00) International Date Line West' },
  { key: 'Asia/Kamchatka', value: 'Asia/Kamchatka', name: '(+12:00) Kamchatka' },
  { key: 'Asia/Magadan', value: 'Asia/Magadan', name: '(+12:00) Magadan' },
  { key: 'Pacific/Fiji', value: 'Pacific/Fiji', name: '(+12:00) Marshall Is.' },
  { key: 'Asia/Magadan', value: 'Asia/Magadan', name: '(+12:00) New Caledonia' },
  { key: 'Asia/Magadan', value: 'Asia/Magadan', name: '(+12:00) Solomon Is.' },
  { key: 'Pacific/Auckland', value: 'Pacific/Auckland', name: '(+12:00) Wellington' },
  { key: 'Pacific/Tongatapu', value: 'Pacific/Tongatapu', name: '(+13:00) Nuku\'alofa' }
]

var newTimeZones = {
  'Africa/Nairobi': 'Africa/Asmera',
  'Africa/Abidjan': 'Africa/Timbuktu',
  'America/Argentina/Catamarca': [
      'America/Argentina/ComodRivadavia',
      'America/Catamarca'
  ],
  'America/Adak': [
      'America/Atka',
      'US/Aleutian'
  ],
  'America/Argentina/Buenos_Aires': 'America/Buenos_Aires',
  'America/Atikokan': 'America/Coral_Harbour',
  'America/Argentina/Cordoba': [
      'America/Cordoba',
      'America/Rosario'
  ],
  'America/Tijuana': [
      'America/Ensenada',
      'America/Santa_Isabel',
      'Mexico/BajaNorte'
  ],
  'America/Indiana/Indianapolis': [
      'America/Fort_Wayne',
      'America/Indianapolis',
      'US/East-Indiana'
  ],
  'America/Indiana/Knox': [
      'America/Knox_IN',
      'US/Indiana-Starke'
  ],
  'America/Nuuk': 'America/Godthab',
  'America/Argentina/Jujuy': 'America/Jujuy',
  'America/Kentucky/Louisville': 'America/Louisville',
  'America/Argentina/Mendoza': 'America/Mendoza',
  'America/Toronto': [
      'America/Montreal',
      'Canada/Eastern'
  ],
  'America/Rio_Branco': [
      'America/Porto_Acre',
      'Brazil/Acre'
  ],
  'America/Denver': [
      'America/Shiprock',
      'Navajo',
      'US/Mountain'
  ],
  'Pacific/Auckland': [
      'NZ',
      'Antarctica/South_Pole'
  ],
  'America/Port_of_Spain': 'America/Virgin',
  'Asia/Ashgabat': 'Asia/Ashkhabad',
  'Asia/Kolkata': 'Asia/Calcutta',
  'Asia/Shanghai': [
      'Asia/Chongqing',
      'Asia/Chungking',
      'Asia/Harbin',
      'PRC'
  ],
  'Asia/Jerusalem': [
      'Israel',
      'Asia/Tel_Aviv'
  ],
  'Asia/Dhaka': 'Asia/Dacca',
  'Asia/Urumqi': 'Asia/Kashgar',
  'Asia/Kathmandu': 'Asia/Katmandu',
  'Asia/Macau': 'Asia/Macao',
  'Asia/Yangon': 'Asia/Rangoon',
  'Asia/Ho_Chi_Minh': 'Asia/Saigon',
  'Asia/Thimphu': 'Asia/Thimbu',
  'Asia/Makassar': 'Asia/Ujung_Pandang',
  'Asia/Ulaanbaatar': 'Asia/Ulan_Bator',
  'Atlantic/Faroe': 'Atlantic/Faeroe',
  'Europe/Oslo': 'Atlantic/Jan_Mayen',
  'Australia/Sydney': [
      'Australia/ACT',
      'Australia/Canberra',
      'Australia/NSW'
  ],
  'Australia/Lord_Howe': 'Australia/LHI',
  'Australia/Darwin': 'Australia/North',
  'Australia/Brisbane': 'Australia/Queensland',
  'Australia/Adelaide': 'Australia/South',
  'Australia/Hobart': 'Australia/Tasmania',
  'Australia/Melbourne': 'Australia/Victoria',
  'Australia/Perth': 'Australia/West',
  'Australia/Broken_Hill': 'Australia/Yancowinna',
  'America/Noronha': 'Brazil/DeNoronha',
  'America/Sao_Paulo': 'Brazil/East',
  'America/Manaus': 'Brazil/West',
  'America/Halifax': 'Canada/Atlantic',
  'America/Winnipeg': 'Canada/Central',
  'America/Regina': [
      'Canada/East-Saskatchewan',
      'Canada/Saskatchewan'
  ],
  'America/Edmonton': 'Canada/Mountain',
  'America/St_Johns': 'Canada/Newfoundland',
  'America/Vancouver': 'Canada/Pacific',
  'America/Whitehorse': 'Canada/Yukon',
  'America/Santiago': 'Chile/Continental',
  'Pacific/Easter': 'Chile/EasterIsland',
  'America/Havana': 'Cuba',
  'Africa/Cairo': 'Egypt',
  'Europe/Dublin': 'Eire',
  'Etc/UTC': [
      'Etc/UCT',
      'UCT',
      'UTC',
      'Zulu',
      'Universal'
  ],
  'Europe/London': [
      'GB',
      'GB-Eire',
      'Europe/Belfast'
  ],
  'Europe/Chisinau': 'Europe/Tiraspol',
  'Etc/GMT': [
      'GMT+0',
      'GMT-0',
      'GMT0',
      'Greenwich'
  ],
  'Asia/Hong_Kong': 'Hongkong',
  'Atlantic/Reykjavik': 'Iceland',
  'Asia/Tehran': 'Iran',
  'America/Jamaica': 'Jamaica',
  'Asia/Tokyo': 'Japan',
  'Pacific/Kwajalein': 'Kwajalein',
  'Africa/Tripoli': 'Libya',
  'America/Mazatlan': 'Mexico/BajaSur',
  'America/Mexico_City': 'Mexico/General',
  'Pacific/Chatham': 'NZ-CHAT',
  'Pacific/Pohnpei': 'Pacific/Ponape',
  'Pacific/Pago_Pago': [
      'Pacific/Samoa',
      'US/Samoa'
  ],
  'Pacific/Chuuk': [
      'Pacific/Truk',
      'Pacific/Yap'
  ],
  'Pacific/Honolulu': [
      'US/Hawaii',
      'Pacific/Johnston'
  ],
  'Europe/Warsaw': 'Poland',
  'Europe/Lisbon': 'Portugal',
  'Asia/Taipei': 'ROC',
  'Asia/Seoul': 'ROK',
  'Asia/Singapore': 'Singapore',
  'Europe/Istanbul': 'Turkey',
  'America/Anchorage': 'US/Alaska',
  'America/Phoenix': 'US/Arizona',
  'America/Chicago': 'US/Central',
  'America/New_York': 'US/Eastern',
  'America/Detroit': 'US/Michigan',
  'America/Los_Angeles': 'US/Pacific',
  'Europe/Moscow': 'W-SU'
}

var findElementKey = function (tz, newTz) {
  _.findKey(oldTimeZones, function(value, key) {
    if (tz === value.key && oldTimeZones[key] !== undefined) {
      oldTimeZones[key].value = newTz;
      oldTimeZones.splice(key, 1, oldTimeZones[key]);
    }
  });
}

_.forOwn(newTimeZones, function(tz, newTz) {
  if(Array.isArray(tz)) {
    _.forEach(tz, (tz2) => findElementKey(tz2, newTz));
  } else {
    findElementKey(tz, newTz)
  }
})

module.exports = oldTimeZones;
