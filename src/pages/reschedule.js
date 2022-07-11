const merge = require('lodash/merge');
const moment = require('moment-timezone');
const interpolate = require('sprintf-js');
const BaseTemplate = require('../helpers/base');

class BookingReschdulePage extends BaseTemplate {
    constructor(template) {
        super();
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
        this.bookingReschdulePageTarget = null;
    }

    async initBookingAndRender(eventData) {
        const dateFormat = this.config.get('ui.booking_date_format') || moment.localeData().longDateFormat('LL');
        const timeFormat = this.config.get('ui.booking_time_format') || moment.localeData().longDateFormat('LT');
        const data = await this.template.sdk
            .makeRequest({
                method: 'get',
                url: '/bookings/' + this.config.get('reschedule.uuid') + '/external_action/view?include=resource',
            }).then((response) => ({
                oldResource: response.data.resource.name,
                oldDate: this.formatTimestamp(response.data.start, dateFormat),
                oldTime: this.formatTimestamp(response.data.start, timeFormat) + ' - ' + this.formatTimestamp(response.data.end, timeFormat),
            })).catch((e) => this.template.triggerError(e));
        return this.render(merge(eventData, data));
    }

    render(eventData) {
        this.utils.doCallback('showBookingReschdulePage', eventData);
        
        const template = require('../templates/reschedule-page.html');
        const dateFormat = this.config.get('ui.booking_date_format') || moment.localeData().longDateFormat('LL');
        const timeFormat = this.config.get('ui.booking_time_format') || moment.localeData().longDateFormat('LT');
        const allocatedResource = eventData.extendedProps.resources ? eventData.extendedProps.resources[0].name : false;

        this.bookingReschdulePageTarget = this.htmlToElement(
			template({
                oldTime: eventData.oldTime,
                oldDate: eventData.oldDate,
                oldResource: eventData.oldResource,
				allocatedResource: allocatedResource,
				chosenDate: this.formatTimestamp(eventData.startStr, dateFormat),
				closeIcon: require('!svg-inline-loader!../assets/close-icon.svg'),
				errorIcon: require('!svg-inline-loader!../assets/error-icon.svg'),
				submitText: this.config.get('ui.localization.reschedule_submit_button'),
				loadingIcon: require('!svg-inline-loader!../assets/loading-spinner.svg'),
				checkmarkIcon: require('!svg-inline-loader!../assets/checkmark-icon.svg'),
				allocatedResourcePrefix: this.config.get('ui.localization.allocated_resource_prefix'),
				chosenTime: this.formatTimestamp(eventData.startStr, timeFormat) + ' - ' + this.formatTimestamp(eventData.endStr, timeFormat),
				successMessage: interpolate.sprintf(
					this.config.get('ui.localization.reschedule_success_message'), '<span class="booked-email"></span>'
				)
			})
		);

        this.renderCustomerFields(eventData);
        this.initCloseButton(this.bookingReschdulePageTarget);
        this.template.rootTarget.append(this.bookingReschdulePageTarget);

        this.template.rootTarget.addEventListener("customer-timezone-changed", (e) => {
            e.preventDefault();
            if (!this.bookingReschdulePageTarget) return;
            
            const bookingPageDate = this.bookingReschdulePageTarget.querySelector('.bookingjs-bookpage-date');
            bookingPageDate.innerHTML = this.formatTimestamp(eventData.startStr, dateFormat);

            const bookingPageTime = this.bookingReschdulePageTarget.querySelector('.bookingjs-bookpage-time');
            bookingPageTime.innerHTML = this.formatTimestamp(eventData.startStr, timeFormat) + ' - ' + this.formatTimestamp(eventData.endStr, timeFormat);
        });

        setTimeout(() => this.bookingReschdulePageTarget.classList.add('show'), 100);

        return this;
    }

    renderCustomerFields(eventData) {
        const textareaTemplate = require('../templates/fields/textarea.html');
        const form = this.bookingReschdulePageTarget.querySelector('.bookingjs-form');
        const formFieldsEle = this.bookingReschdulePageTarget.querySelector('.bookingjs-form-fields');

        formFieldsEle.append(this.htmlToElement(textareaTemplate({
            key: 'message',
            format: 'text',
            prefilled: '',
            required: true,
            readonly: false,
            title: 'Message to the host',
            arrowDownIcon: require('!svg-inline-loader!../assets/arrow-down-icon.svg'),
        })));

        this.initFormValidation(form);
		form.addEventListener("submit", e => this.submitForm(e, eventData));
    }

    submitForm(e, eventData) {
        e.preventDefault();

        const form = e.target;
        const formData = this.prepareFormFields(form);

        // close the form if submitted
        if (form.classList.contains('success') || !this.config.get('reschedule.uuid')) {
            this.template.getAvailability();
            this.initCloseButton(this.bookingReschdulePageTarget);
            return;
        }

        form.classList.add('loading');
		this.utils.doCallback('submitBookingReschduleForm', formData);

        // Call create event endpoint
		this.timekitRescheduleBooking(formData, eventData)
        .then(() => {
            form.classList.remove('loading');
            form.classList.add('success');
            setTimeout(() => (window.location.href = window.location.href.split('?')[0]), 500);
        })
        .catch(() => this.showBookingFailed(form));
    }

    timekitRescheduleBooking(formData, eventData) {
        const extendedProps = eventData.extendedProps;
        const end = moment(eventData.endStr).tz(this.template.customerTimezoneSelected);
        const start = moment(eventData.startStr).tz(this.template.customerTimezoneSelected);

        const payLoad = {
			end: end.format(),
			start: start.format(),
            message: formData.message,
            resource_id: extendedProps.resources[0].id
        };
        
        this.utils.doCallback('submitReschduleBookingStarted', payLoad);

        const request = this.template.sdk
            .include(this.config.get('create_booking_response_include'))
            .makeRequest({
                data: payLoad,
                method: 'post',
                url: '/bookings/' + this.config.get('reschedule.uuid') + '/reschedule',
            });

        request
            .then((response) => this.utils.doCallback('submitReschduleBookingSuccessful', response))
			.catch((response) => {
				this.utils.doCallback('submitReschduleBookingFailed', response);
				this.template.triggerError([
					'An error with Timekit Reschdule Booking occured',
					response,
				]);
            });

        return request;
    }
}

module.exports = BookingReschdulePage;