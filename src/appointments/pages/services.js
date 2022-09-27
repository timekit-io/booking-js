const BaseTemplate = require('../classes/base');
const CloseIcon = require('!file-loader!../assets/close-icon.svg').default;

class ServicesPage extends BaseTemplate {
    constructor(template) {
        super();
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
    }

    render() {
        this.sdk.makeRequest({
            method: 'get',
            url: '/location/services'
        })
        .then(({ data }) => {
            const template = require('../templates/services.html');
            this.template.pageTarget = this.htmlToElement(template({
                services: data,
                closeIcon: CloseIcon
            }));

            const serviceLinks = this.template.pageTarget.querySelectorAll('.card-wrapper');

            for (let i=0; i < serviceLinks.length; i++) {
                serviceLinks[i].addEventListener("click", (e) => {
                    const wrapper = e.target.closest(".card-wrapper"); 
                    wrapper.id && this.template.initLocations(wrapper.id);
                    e.preventDefault();
                });
            }
            
            this.template.rootTarget.append(this.template.pageTarget);
            this.initClose(this.template.pageTarget);
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