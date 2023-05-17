const BaseTemplate = require('./base');

const get = require("lodash/get");
const stringify = require('json-stringify-safe');

const ServicesPage = require('../pages/services');
const LocationsPage = require('../pages/locations');
const CalendarWidgetPage = require('../pages/calendar');

const LogoIcon = require('!file-loader!../assets/logo.png').default;
const BackIcon = require('!file-loader!../assets/icon_back.svg').default;
const CloseIcon = require('!file-loader!../assets/icon_close.svg').default;

require('../styles/base.scss');
require('@fontsource/open-sans');

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

        // page target
        this.pageTarget = null;
    }

    destroy() {
        this.clearRootElem();
        this.rootTarget.remove();
    }

    clearRootElem() {
        let child = this.rootTarget.lastElementChild;         
        while (child) {
            this.rootTarget.removeChild(child);
            child = this.rootTarget.lastElementChild;
        }
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

        this.clearRootElem();
    }

    initButton() {
        const defaultUI = this.config.get('defaultUI');
        if (defaultUI) {
            const targetElement = this.config.get('elBtn');        

            this.buttonTarget = document.createElement('a');
            this.buttonTarget.id = targetElement.replace('#', '');
            this.buttonTarget.style.backgroundImage = `url(${LogoIcon})`;

            this.buttonTarget.addEventListener('click', (e) => {
                e.preventDefault();
                this.pageTarget && this.pageTarget.classList.toggle("hide");
            });
                    
            this.rootTarget.append(this.buttonTarget);
        }
        return this;
    }

    initPage() {
        const defaultUI = this.config.get('defaultUI');
        const stratergy = this.config.getSession('stratergy', 'service');

        if (defaultUI) {
            if (stratergy === 'service') {
                this.initServices();
            } else if (stratergy === 'location') {
                this.initLocations();
            }   
        }
    }

    initServices() {
        return new ServicesPage(this).render();
    }

    initLocations() {
        return new LocationsPage(this).render();
    }

    initCalendar(serviceId, locationId) {
        return new CalendarWidgetPage(this).render(serviceId, locationId);
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
            if (message[1]?.data) {
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
                backIcon: BackIcon,
                closeIcon: CloseIcon,
				message: messageProcessed,
				context: contextProcessed,
			})
		);

        this.renderAndInitActions(this.errorTarget, true);

        return message;
    }
}

module.exports = Template;