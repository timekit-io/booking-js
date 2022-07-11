const get = require("lodash/get");
const qs = require('querystringify');
const merge = require("lodash/merge");

class Config {
    constructor() {
        this.config = {};
        this.global = null;
        this.defaultConfigs = require('../configs');
    }

    all() {
        return this.config;        
    }

    get(key) {
        return get(this.config, key);        
    }
    
    getGlobal(key) {
        return get(this.global, key);
    }

    set(configs) {
        return (this.config = this.setDefaults(configs));
    }

    setGlobal(value) {
        this.global = value;
        return this;
    }

    parseAndUpdate(suppliedConfig) {

        // Extend the default config with supplied settings
        let newConfig = this.setDefaults(suppliedConfig);
        
        // Apply presets
        newConfig = this.applyConfigPreset(newConfig, 'timeDateFormat', newConfig.ui.time_date_format)
        newConfig = this.applyConfigPreset(newConfig, 'availabilityView', newConfig.ui.availability_view)

        // Set default formats for native fields
        newConfig = this.setCustomerFieldsNativeFormats(newConfig);

        // Check for required settings
        if (!newConfig.app_key) throw 'A required config setting ("app_key") was missing';

        // Prefill fields based on query string
        const urlParams = this.getGlobal("location") && this.getGlobal("location.search");
        if (urlParams) newConfig = this.applyPrefillFromUrlGetParams(newConfig, qs.parse(urlParams));

        return this.set(newConfig);
    }

    setDefaultsWithoutProject(suppliedConfig) {
        return merge({}, this.defaultConfigs.primaryWithoutProject, suppliedConfig);
    }

    applyPrefillFromUrlGetParams(suppliedConfig, urlParams) {
        const customerFields = suppliedConfig.customer_fields;
        const customerFieldsKeys = Object.keys(customerFields);

        for(let i=0; i < customerFieldsKeys.length; i++) {
            const key = customerFieldsKeys[i];

            if (!urlParams['customer.' + key]) continue;
            suppliedConfig.customer_fields[key].prefilled = urlParams['customer.' + key];
        }

        return suppliedConfig;
    }

    setCustomerFieldsNativeFormats(config) {
        const customerFields = config.customer_fields;
        const customerFieldsKeys = Object.keys(customerFields);

        for(let i=0; i < customerFieldsKeys.length; i++) {
            const key = customerFieldsKeys[i];
            const field = customerFields[customerFieldsKeys[i]];

            if (!this.defaultConfigs.customerFieldsNativeFormats[key]) continue;
            config.customer_fields[key] = merge(this.defaultConfigs.customerFieldsNativeFormats[key], field);
        }
        
        return config;
    }

    applyConfigPreset(localConfig, propertyName, propertyObject) {
        const presetCheck = this.defaultConfigs.presets[propertyName][propertyObject];
        if (presetCheck) return merge({}, presetCheck, localConfig);
        return localConfig;
    }

    setDefaults(suppliedConfig) {
        suppliedConfig.sdk = this.prepareSdkConfig(suppliedConfig);
        return merge({}, this.defaultConfigs.primary, suppliedConfig);
    }

    prepareSdkConfig(suppliedConfig) {
        if (typeof suppliedConfig.sdk === 'undefined') {
            suppliedConfig.sdk = {};
        }
        if (suppliedConfig.app_key) {
            suppliedConfig.sdk.appKey = suppliedConfig.app_key;
        }
        if (suppliedConfig.api_base_url) {
            suppliedConfig.sdk.apiBaseUrl = suppliedConfig.api_base_url;
        }
        return merge({}, this.defaultConfigs.primary.sdk, suppliedConfig.sdk);
    }
}

module.exports = Config;