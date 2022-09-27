const get = require("lodash/get");
const merge = require("lodash/merge");

class Config {
    constructor() {
        this.config = {};
        this.session = {};
        this.defaultConfigs = require('../configs');
    }

    getSession(key) {
        return get(this.session, key);        
    }

    setSession(key, data) {
        this.session[key] = data;
    }

    all() {
        return this.config;        
    }

    get(key) {
        return get(this.config, key);        
    }
    
    set(configs) {
        return (this.config = this.setDefaults(configs));
    }

    parseAndUpdate(configs) {

        // Extend the default config with supplied settings
        let newConfig = this.setDefaults(configs);
        
        // Check for required settings
        if (!newConfig.app_key) throw 'A required config setting ("app_key") was missing';

        return this.set(newConfig);
    }

    setDefaults(configs) {
        configs.sdk = this.prepareSdkConfig(configs);
        return merge({}, this.defaultConfigs.primary, configs);
    }

    prepareSdkConfig(configs) {
        if (typeof configs.sdk === 'undefined') {
            configs.sdk = {};
        }
        if (configs.app_key) {
            configs.sdk.appKey = configs.app_key;
        }
        if (configs.api_base_url) {
            configs.sdk.apiBaseUrl = configs.api_base_url;
        }
        return merge({}, this.defaultConfigs.primary.sdk, configs.sdk);
    }
}

module.exports = Config;