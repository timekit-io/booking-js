const get = require("lodash/get");
const BaseTemplate = require('../classes/base');

const BackIcon = require('!file-loader!../assets/icon_back.svg').default;
const CloseIcon = require('!file-loader!../assets/icon_close.svg').default;

class CalendarWidgetPage extends BaseTemplate {
    constructor(template) {
        super(template);
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
    }

    render(serviceId, locationId) {
        this.config.setSession('step', 'calendar');

        this.sdk.makeRequest({
            method: 'get',
            url: '/locations/' + locationId + '?search=services.uuid:' + serviceId + ';deleted_at:null&include=services,projects'
        })
        .then(({ data }) => {

            const project = get(data, 'projects.0');
            const template = require('../templates/calendar.html');
    
            const service = this.config.getSession('selectedService');
            const location = this.config.getSession('selectedLocation');
            
            this.template.pageTarget = this.htmlToElement(template({
                backIcon: BackIcon,
                closeIcon: CloseIcon,
                serviceName: get(service, 'name'),
                locationName: get(location, 'name'),
                selectorOptions: this.config.get('selectorOptions.booking')
            }));
    
            this.renderAndInitActions(this.template.pageTarget);

            new TimekitBooking().init({
                project_id: project.id,
                app_key: this.config.get('sdk.appKey'),
                api_base_url: this.config.get('sdk.apiBaseUrl'),
            });
        })
        .catch((response) => {
            this.utils.doCallback('submitReschduleBookingFailed', response);
            this.template.triggerError([
                'An error occurred fetching services',
                response,
            ]);
        });
    }
}

module.exports = CalendarWidgetPage;