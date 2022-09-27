const get = require("lodash/get");
const find = require("lodash/find");
const BaseTemplate = require('../classes/base');

const BackIcon = require('!file-loader!../assets/icon_back.svg').default;
const CloseIcon = require('!file-loader!../assets/icon_close.svg').default;

class LocationsPage extends BaseTemplate {
    constructor(template) {
        super();
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
    }

    render(serviceId) {
        this.config.setSession('step', 'locations');

        const services = this.config.getSession('services');
        const service = find(services, { id: serviceId });

        const locations = get(service, 'locations', []);
        const template = require('../templates/locations.html');

        this.config.setSession('locations', locations);
        this.config.setSession('selectedService', service);

        this.template.pageTarget = this.htmlToElement(template({
            backIcon: BackIcon,
            closeIcon: CloseIcon,
            locations: locations,
            service: get(service, 'name'),
            selectorOptions: this.config.get('selectorOptions.location')
        }));

        const serviceLinks = this.template.pageTarget.querySelectorAll('.card-container');

        for (let i=0; i < serviceLinks.length; i++) {
            serviceLinks[i].addEventListener("click", (e) => {
                const wrapper = e.target.closest(".card-container"); 
                if (wrapper.id) {
                    this.config.setSession('selectedLocation', find(locations, { 
                        id: wrapper.id 
                    }));
                    this.template.initCalendar(serviceId, wrapper.id);
                }
                e.preventDefault();
            });
        }
        
        this.renderAndInitActions(this.template.pageTarget);

        return this.template;
    }
}

module.exports = LocationsPage;