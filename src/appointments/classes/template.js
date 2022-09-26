const BaseTemplate = require('./base');
const stringify = require('json-stringify-safe');
const ServicesPage = require('../pages/services');

require('../styles/base.scss');

class Template extends BaseTemplate {
    constructor(config, utils, sdk) {
        super();

        // config and utils
        this.sdk = sdk;
        this.utils = utils;
        this.config = config;

        // dom nodes
        this.rootTarget = null;
        this.errorTarget = null;
        this.buttonTarget = null;
        this.widgetTarget = null;
    }

    init(configs) {
        const targetElement = configs.el || this.config.get('el');

        this.rootTarget = document.createElement('div');
        this.rootTarget.classList.add("tk-appt-window");
        this.rootTarget.id = targetElement.replace('#', '');

        document.body.appendChild(this.rootTarget);

        this.rootTarget = document.getElementById(targetElement.replace('#', ''));

        if (!this.rootTarget) {
			throw this.triggerError(
				'No target DOM element was found (' + targetElement + ')'
			);
        }

        let child = this.rootTarget.lastElementChild; 
        
        while (child) {
            this.rootTarget.removeChild(child);
            child = this.rootTarget.lastElementChild;
        }
    }

    initButton() {
        const template = require('../templates/button.html');
        this.buttonTarget = this.htmlToElement(template({
            url: this.config.get('ui.buttonImage')
        }));
        
        this.buttonTarget.addEventListener('click', (e) => {
            e.preventDefault();
            this.widgetTarget && this.widgetTarget.classList.toggle("hide");
        });
                
        this.rootTarget.append(this.buttonTarget);

        return this;
    }

    initWidget() {
        return new ServicesPage(this).render();
    }

    triggerError(message) {
		// If an error already has been thrown, exit
        // If no target DOM element exists, only do the logging
		if (this.errorTarget) return message;
		if (!this.rootTarget) return message;

		this.utils.logError(message);        
		this.utils.doCallback('errorTriggered', message);

		let contextProcessed = null;
        let messageProcessed = message;

        if (this.utils.isArray(message)) {
            messageProcessed = message[0];
            if (message[1].data) {
                contextProcessed = stringify(
                    message[1].data.errors || message[1].data.error || message[1].data
                );
            } else {
                contextProcessed = stringify(message[1]);
            }
        }

		const template = require('../templates/error.html');
        this.errorTarget = this.htmlToElement(
			template({
				message: messageProcessed,
				context: contextProcessed,
				errorWarningIcon: require('!svg-inline-loader!../assets/error-warning-icon.svg'),
			})
		);
		this.rootTarget.append(this.errorTarget);

        return message;
    }
}

module.exports = Template;