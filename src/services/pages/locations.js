const get = require("lodash/get");
const find = require("lodash/find");
const filter = require("lodash/filter");
const BaseTemplate = require('../classes/base');

const BackIcon = require('!file-loader!../assets/icon_back.svg').default;
const CloseIcon = require('!file-loader!../assets/icon_close.svg').default;
const SearchIcon = require('!file-loader!../assets/icon_search.svg').default;

class LocationsPage extends BaseTemplate {
    constructor(template) {
        super(template);
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.locationsTarget = null;
        this.config = template.config;
    }

    getLocationsTemplate(locations) {
        const template = require('../templates/slots/locations.html');
        return this.htmlToElement(template({
            locations: locations
        }));
    }

    initLocationClick(locations, serviceId) {
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
            searchIcon: SearchIcon,
            service: get(service, 'name'),
            selectorOptions: this.config.get('selectorOptions.location'),
        }));

        this.locationsTarget = this.getLocationsTemplate(locations);

        const searchInput = this.template.pageTarget.querySelector('#search-bar');
        const locationsEle = this.template.pageTarget.querySelector('#location-list');

        locationsEle.append(this.locationsTarget);

        searchInput && searchInput.addEventListener("input", (e) => {
            const filteredLocations = filter(locations, function({ meta }) { 
                const searchText = e.target.value.toLowerCase();
                return meta.t_store_city.toLowerCase().includes(searchText) || 
                    (meta.t_store_name && meta.t_store_name.toLowerCase().includes(searchText)) ||
                    (meta.t_store_postal_code && meta.t_store_postal_code.toLowerCase().includes(searchText)); 
            });

            locationsEle.removeChild(this.locationsTarget);
            this.locationsTarget = this.getLocationsTemplate(filteredLocations);
            
            locationsEle.append(this.locationsTarget);
            this.initLocationClick(filteredLocations, serviceId);

            e.preventDefault();
        });

        this.initLocationClick(locations, serviceId);
        this.renderAndInitActions(this.template.pageTarget);

        return this.template;
    }
}

module.exports = LocationsPage;