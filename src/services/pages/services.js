const get = require("lodash/get");
const find = require("lodash/find");

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

    renderElement(services) {
        this.config.setSession('services', services);
        this.config.setSession('stratergy', 'service');

        const template = require('../templates/services.html');
        this.template.pageTarget = this.htmlToElement(template({
            services,
            backIcon: BackIcon,
            closeIcon: CloseIcon,
            selectorOptions: this.config.get('selectorOptions.service')
        }));

        const serviceLinks = this.template.pageTarget.querySelectorAll('.card-wrapper');

        for (let i=0; i < serviceLinks.length; i++) {
            serviceLinks[i].addEventListener("click", (e) => {
                e.preventDefault();
                const wrapper = e.target.closest(".card-wrapper"); 
                const selectedLocation = this.config.getSession('selectedLocation');
                if (wrapper.id) {
                    this.config.setSession('selectedService', find(services, { 
                        id: wrapper.id 
                    }));
                    if (selectedLocation && selectedLocation.id) {
                        this.template.initCalendar(wrapper.id, selectedLocation.id);
                    } else {
                        this.template.initLocations();
                    }    
                }               
            });
        }
        
        this.renderAndInitActions(this.template.pageTarget);
    }

    render() {
        const selectedLocation = this.config.getSession('selectedLocation');
        const selectedLocationServices = get(selectedLocation, 'services', []);
        
        // when location is already selected in step-1
        if (selectedLocation?.id) {
            if (selectedLocationServices.length > 0) {
                this.renderElement(selectedLocationServices);
            } else {
                this.template.triggerError([
                    'No services found for location: ' + selectedLocation.name,
                ]);
            }
        }

        // when location is not selected and service is step-1
        else {
            this.sdk.makeRequest({
                method: 'get',
                url: '/location/services?include=locations'
            })
            .then(({ data: services }) => this.renderElement(services))
            .catch((response) => {
                this.utils.doCallback('initServiceFailed', response);
                this.template.triggerError([
                    'An error occurred fetching services',
                    response,
                ]);
            });
        }

        return this.template;
    }
}

module.exports = ServicesPage;