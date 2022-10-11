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
        return new Promise(async (resolve, reject) => {
            try {
                this.config.parseAndUpdate(configs);
                this.sdk.configure(this.config.get('sdk'));
                this.template.init(this.config.all());
            } catch (e) {
                this.utils.logError(e);
                return this;
            }
    
            // Check whether a config is supplied
            if (!this.utils.doesConfigExist(configs)) {
                this.template.triggerError('No configuration was supplied. Please supply a config object upon library initialization');
                return this;
            }
    
            try {
                this.render();
            } catch (e) {
                this.utils.logError(e);
                return reject(e.message);
            }
            resolve(true);
        });
    }

    destroy() {
        this.template.destroy();
    }
    
    render() {
        this.utils.doCallback('renderStarted');
        this.template.initButton().initPage();
        this.utils.doCallback('renderCompleted');
        return this;
    }
}

module.exports = BookingWidget;