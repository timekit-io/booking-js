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

    render(serviceUuid) {
        this.sdk.makeRequest({
            method: 'get',
            url: '/locations?search=services.uuid:' + serviceUuid + ';deleted_at:null'
        })
        .then(({ data }) => {
            const template = require('../templates/locations.html');
            this.template.pageTarget = this.htmlToElement(template({
                locations: data,
                backIcon: BackIcon,
                closeIcon: CloseIcon,
            }));

            const serviceLinks = this.template.pageTarget.querySelectorAll('.card-container');

            for (let i=0; i < serviceLinks.length; i++) {
                serviceLinks[i].addEventListener("click", (e) => {
                    const wrapper = e.target.closest(".card-container"); 
                    wrapper.id && this.template.initCalendar(wrapper.id);
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

module.exports = LocationsPage;