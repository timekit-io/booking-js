const BaseTemplate = require('../classes/base');

class ServicesPage extends BaseTemplate {
    constructor(template) {
        super();
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
		this.currentPageTarget = null;
    }

    render() {
        this.sdk.makeRequest({
            method: 'get',
            url: '/projects/embed/' + this.config.get('project_id')
        })
        .then((response) => {
            const template = require('../templates/services.html');
            this.currentPageTarget = this.htmlToElement(template({
                closeIcon: require('!svg-inline-loader!../assets/close-icon.svg'),
            }));
            this.template.rootTarget.append(this.currentPageTarget);
        })
        .catch((response) => {
            this.utils.doCallback('submitReschduleBookingFailed', response);
            this.template.triggerError([
                'An error with Timekit Reschdule Booking occured',
                response,
            ]);
        });

        return this.template;
    }
}

module.exports = ServicesPage;