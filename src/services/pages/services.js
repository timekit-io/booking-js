const BaseTemplate = require('../classes/base');

const BackIcon = require('!file-loader!../assets/icon_back.svg').default;
const CloseIcon = require('!file-loader!../assets/icon_close.svg').default;

class ServicesPage extends BaseTemplate {
    constructor(template) {
        super(template);
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
    }

    render() {
        this.sdk.makeRequest({
            method: 'get',
            url: '/location/services?include=locations'
        })
        .then(({ data }) => {
            this.config.setSession('services', data);
            this.config.setSession('step', 'services');

            const template = require('../templates/services.html');
            this.template.pageTarget = this.htmlToElement(template({
                services: data,
                backIcon: BackIcon,
                closeIcon: CloseIcon,
                selectorOptions: this.config.get('selectorOptions.service')
            }));

            const serviceLinks = this.template.pageTarget.querySelectorAll('.card-wrapper');

            for (let i=0; i < serviceLinks.length; i++) {
                serviceLinks[i].addEventListener("click", (e) => {
                    const wrapper = e.target.closest(".card-wrapper"); 
                    wrapper.id && this.template.initLocations(wrapper.id);
                    e.preventDefault();
                });
            }
            
            this.renderAndInitActions(this.template.pageTarget);
        })
        .catch((response) => {
            this.utils.doCallback('submitReschduleBookingFailed', response);
            this.template.triggerError([
                'An error occurred fetching services',
                response,
            ]);
        });

        return this.template;
    }
}

module.exports = ServicesPage;