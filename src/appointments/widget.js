'use strict';

const Util = require('./classes/util');
const timekitSdk = require('timekit-sdk');
const Config = require('./classes/config');
const Template = require('./classes/template');

class BookingWidget {
    constructor() {
        this.config = new Config();
        this.utils = new Util(this.config);
        this.sdk = timekitSdk.newInstance();
        this.template = new Template(this.config, this.utils, this.sdk);
    }

    init(configs) {
        try {
            this.config.parseAndUpdate(configs);
            this.template.render(this.config.all());
        } catch (e) {
            this.utils.logError(e);
            return this;
        }
    }
}

module.exports = BookingWidget;