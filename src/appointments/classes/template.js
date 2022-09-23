const BaseTemplate = require('./base');

class Template extends BaseTemplate {
    constructor(config, utils, sdk) {
        super();

        // config and utils
        this.sdk = sdk;
        this.utils = utils;
        this.config = config;

        // dom nodes
        this.rootTarget = null;
    }

    init(configs) {
        const targetElement = configs.el || this.config.get('el');        
        this.rootTarget = document.getElementById(targetElement.replace('#', ''));

        if (!this.rootTarget) {
			throw this.triggerError(
				'No target DOM element was found (' + targetElement + ')'
			);
        }

        this.rootTarget.classList.add("tk-appointments");
        let child = this.rootTarget.lastElementChild; 
        
        while (child) {
            this.rootTarget.removeChild(child);
            child = this.rootTarget.lastElementChild;
        }
    }
}

module.exports = Template;