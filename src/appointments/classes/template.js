const BaseTemplate = require('./base');

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
        const template = require('../templates/widget.html');
        this.widgetTarget = this.htmlToElement(template({
            
        }));
         
        this.rootTarget.append(this.widgetTarget);

        return this;
    }
}

module.exports = Template;