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
        this.latitude = 0;
        this.longitude = 0;
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.locationsTarget = null;
        this.config = template.config;
    }

    getDegreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    getDistanceInKmBetweenEarthCoordinates(latitude, longitude) {
        const earthRadiusKm = 6371;
        
        let destLatitudeInRadians = this.getDegreesToRadians(this.latitude - latitude);
        let destLongitudeInRadians = this.getDegreesToRadians(this.longitude - longitude);
        
        latitude = this.getDegreesToRadians(latitude);
        let latitudeInRadiants = this.getDegreesToRadians(this.latitude);
        
        let a = Math.sin(destLatitudeInRadians/2) * Math.sin(destLatitudeInRadians/2) + Math.sin(destLongitudeInRadians/2) * Math.sin(destLongitudeInRadians/2) * Math.cos(latitude) * Math.cos(latitudeInRadiants); 
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return parseFloat((earthRadiusKm * c).toFixed(1));
    }

    getDistance(project) {
        return this.getDistanceInKmBetweenEarthCoordinates(get(project, 'meta.t_latitude') || 0, get(project, 'meta.t_longitude') || 0);
    }

    getLocationsTemplate(locations) {
        const template = require('../templates/slots/locations.html');
        return this.htmlToElement(template({
            selectorOptions: this.config.get('selectorOptions.location'),
            locations: locations.map((projectData) => ({
                ...projectData,
                distance: this.getDistance(projectData)
            }))
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
        const searchGeoLocBtn = this.template.pageTarget.querySelector('#geolocation-search');

        locationsEle.append(this.locationsTarget);

        searchInput && searchInput.addEventListener("focus", (e) => {
            if (this.config.get('selectorOptions.location.search_bar.enabled')) {
                searchGeoLocBtn && searchGeoLocBtn.classList.remove('hide');
            }
            e.preventDefault();
        });

        searchGeoLocBtn && searchGeoLocBtn.addEventListener("focusout", (e) => {
            e.target.classList.add('hide');
            e.preventDefault();
        });

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

        searchGeoLocBtn && searchGeoLocBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.target.classList.add('hide');
            return await new Promise(async (resolve) => {
                const options = {
                    timeout: 5000,
                    enableHighAccuracy: false,
                    maximumAge: 600000 // Keep cached data for 10 mins
                };
                return await window.navigator.geolocation.getCurrentPosition((position) => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    return resolve({});
                }, () => {
                    this.latitude = null;
                    this.longitude = null;
                    return resolve({});
                }, options);
            }).then(() => {
                locations.sort((prev, next) => prev.distance - next.distance);

                locationsEle.removeChild(this.locationsTarget);
                this.locationsTarget = this.getLocationsTemplate(locations);
                
                locationsEle.append(this.locationsTarget);
                this.initLocationClick(locations, serviceId);
            })
        });

        this.initLocationClick(locations, serviceId);
        this.renderAndInitActions(this.template.pageTarget);

        return this.template;
    }
}

module.exports = LocationsPage;