const BaseTemplate = require('../classes/base');

const BackIcon = require('!file-loader!../assets/icon_back.svg').default;
const CloseIcon = require('!file-loader!../assets/icon_close.svg').default;

class CalendarWidgetPage extends BaseTemplate {
    constructor(template) {
        super();
        this.sdk = template.sdk;
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
    }

    render(locationServiceId) {
        console.log(locationServiceId);

        const template = require('../templates/calendar.html');

        this.template.pageTarget = this.htmlToElement(template({
            backIcon: BackIcon,
            closeIcon: CloseIcon,
        }));

        this.renderAndInitActions(this.template.pageTarget);
    }
}

module.exports = CalendarWidgetPage;