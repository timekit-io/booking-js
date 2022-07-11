'use strict';

const merge = require("lodash/merge");
const timekitSdk = require('timekit-sdk');

const Util = require('./helpers/util');
const Config = require('./helpers/config');
const Template = require('./helpers/template');

class BookingWidget {
    constructor() {
        this.config = new Config();
        this.utils = new Util(this.config);
        this.sdk = timekitSdk.newInstance();
        this.template = new Template(this.config, this.utils, this.sdk);
    }

    getVersion() {
        return VERSION;
    }

    getSdk() {
        return this.sdk;
    }
    
    getConfig() {
        return this.config;
    }

    getCalendar() {
        return this.template.getCalendar();
    }
    
    destroy() {
        this.template.destroy();
    }

    timekitCreateBooking(formData, eventData) {
        return this.template.bookingPage.timekitCreateBooking(formData, eventData);
    }

    render() {
        this.utils.doCallback('renderStarted');

        // Setup the Timekit SDK with correct config
        this.sdk.configure(this.config.get('sdk'));

        const timezone = this.config.get("ui.timezone");

        // Start by guessing customer timezone
        if (timezone) {
            this.template.setCustomerTimezone(timezone);
        } else {
            this.template.guessCustomerTimezone();
        }

        // Initialize FullCalendar
        this.template.initializeCalendar()
            .getAvailability()
            .renderAvatarImage()
            .renderDisplayName()
            .renderFooter();

        this.utils.doCallback('renderCompleted');

        return this;
    }

    init(suppliedConfig, global) {

        // Allows mokcing the window object if passed
        global = global || window;
        this.config.setGlobal(global);

        // Make sure that SDK is ready and debug flag is checked early
        this.config.set(suppliedConfig || {});

        this.utils.logDebug(['Version:', this.getVersion()]);
        this.utils.logDebug(['Supplied config:', suppliedConfig]);

        try {
            this.template.render(suppliedConfig || {});
        } catch (e) {
            this.utils.logError(e);
            return this;
        }

        // Check whether a config is supplied
        if (!this.utils.doesConfigExist(suppliedConfig)) {
            this.template.triggerError('No configuration was supplied. Please supply a config object upon library initialization');
            return this;
        }

        // Start from local config
        if (!this.utils.isRemoteProject(suppliedConfig) || suppliedConfig.disable_remote_load) {
            return this.startWithConfig(this.config.setDefaultsWithoutProject(suppliedConfig));
        }

        // Load remote embedded config
        if (this.utils.isEmbeddedProject(suppliedConfig)) {
            this.loadRemoteEmbeddedProject(suppliedConfig);
        }
  
        // Load remote hosted config
        if (this.utils.isHostedProject(suppliedConfig)) {
            this.loadRemoteHostedProject(suppliedConfig);
        }
          
        return this;
    }
    
    startWithConfig(suppliedConfig) {
        try {
            // Handle config and defaults
            const configs = this.config.parseAndUpdate(suppliedConfig);
            this.utils.logDebug(['Final config:', configs]);
            this.render();
        } catch (e) {
            this.template.triggerError(e);
            return this;
        }
    }

    loadRemoteHostedProject(suppliedConfig) {
        this.sdk.configure(this.config.get('sdk'));
        this.sdk.makeRequest({
            method: 'get',
            url: '/projects/hosted/' + suppliedConfig.project_slug
          })
          .then((response) => this.remoteProjectLoaded(response, suppliedConfig))
          .catch(e => this.template.triggerError(['The project could not be found, please double-check your "project_slug"', e]));
    }

    loadRemoteEmbeddedProject(suppliedConfig) {
        // App key is required when fetching an embedded project, bail if not fund
        if (!suppliedConfig.app_key) {
            this.template.triggerError('Missing "app_key" in conjunction with "project_id", please provide your "app_key" for authentication');
            return this;
        }

        this.sdk.configure(this.config.get('sdk'));
        this.sdk.makeRequest({
            method: 'get',
            url: '/projects/embed/' + suppliedConfig.project_id
          })
          .then((response) => this.remoteProjectLoaded(response, suppliedConfig))
          .catch(e => this.template.triggerError(['The project could not be found, please double-check your "project_id" and "app_key"', e]));
    }

    remoteProjectLoaded(response, suppliedConfig) {
        const remoteConfig = response.data;
            
        if (remoteConfig.id) {
            remoteConfig.project_id = remoteConfig.id;
            delete remoteConfig.id;
        }
        if (remoteConfig.slug) {
            remoteConfig.project_slug = remoteConfig.slug;
            delete remoteConfig.slug;
        }

        this.utils.logDebug(['Remote config:', remoteConfig]);
        return this.startWithConfig(merge({}, remoteConfig, suppliedConfig));
    }
}

module.exports = BookingWidget;