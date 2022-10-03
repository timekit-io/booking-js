const merge= require('lodash/merge');
const moment = require('moment-timezone');
const interpolate = require('sprintf-js');
const BaseTemplate = require('../helpers/base');

class BookingPage extends BaseTemplate {
    constructor(template) {
        super();
        this.template = template;
        this.utils = template.utils;
        this.config = template.config;
		this.bookingPageTarget = null;
    }

    render(eventData) {
        this.utils.doCallback('showBookingPage', eventData);

        const template = require('../templates/booking-page.html');
		const successMessage = this.config.get('ui.localization.success_message');
        const dateFormat = this.config.get('ui.booking_date_format') || moment.localeData().longDateFormat('LL');
        const timeFormat = this.config.get('ui.booking_time_format') || moment.localeData().longDateFormat('LT');
        const allocatedResource = eventData.extendedProps.resources ? eventData.extendedProps.resources[0].name : false;

        this.bookingPageTarget = this.htmlToElement(
			template({
				allocatedResource: allocatedResource,
				submitText: this.config.get('ui.localization.submit_button'),
				chosenDate: this.formatTimestamp(eventData.startStr, dateFormat),
				closeIcon: require('!svg-inline-loader!../assets/close-icon.svg'),
				errorIcon: require('!svg-inline-loader!../assets/error-icon.svg'),
				loadingIcon: require('!svg-inline-loader!../assets/loading-spinner.svg'),
				checkmarkIcon: require('!svg-inline-loader!../assets/checkmark-icon.svg'),
				allocatedResourcePrefix: this.config.get('ui.localization.allocated_resource_prefix'),
				chosenTime: this.formatTimestamp(eventData.startStr, timeFormat) + ' - ' + this.formatTimestamp(eventData.endStr, timeFormat),
				successMessage: interpolate.sprintf(
					successMessage.indexOf('%s') !== -1 ? successMessage : successMessage + ' %s', '<span class="booked-email"></span>'
				)
			})
		);

		this.renderCustomerFields(eventData);
		this.initCloseButton(this.bookingPageTarget);
		this.template.rootTarget.append(this.bookingPageTarget);

        if (eventData.extendedProps.resources) {
			this.utils.logDebug([
				'Available resources for chosen timeslot:',
				eventData.extendedProps.resources
			]);
		}

		this.template.rootTarget.addEventListener("customer-timezone-changed", (e) => {
			e.preventDefault();
			if (!this.bookingPageTarget) return;

			const bookingPageDate = this.bookingPageTarget.querySelector('.bookingjs-bookpage-date');
			bookingPageDate.innerHTML = this.formatTimestamp(eventData.startStr, dateFormat);

			const bookingPageTime = this.bookingPageTarget.querySelector('.bookingjs-bookpage-time');
			bookingPageTime.innerHTML = this.formatTimestamp(eventData.startStr, timeFormat) + ' - ' + this.formatTimestamp(eventData.endStr, timeFormat);
		});

		setTimeout(() => this.bookingPageTarget.classList.add('show'), 100);

		return this;
    }

    renderCustomerFields(eventData) {
        const telTemplate = require('../templates/fields/tel.html');
        const textTemplate = require('../templates/fields/text.html');
		const labelTemplate = require('../templates/fields/label.html');
		const selectTemplate = require('../templates/fields/select.html');
		const textareaTemplate = require('../templates/fields/textarea.html');
		const checkboxTemplate = require('../templates/fields/checkbox.html');
		const multiCheckboxTemplate = require('../templates/fields/multi-checkbox.html');

        const form = this.bookingPageTarget.querySelector('.bookingjs-form');
        const formFieldsEle = this.bookingPageTarget.querySelector('.bookingjs-form-fields');

        const customerFields = this.config.get('customer_fields');
        const customerFieldsKeys = Object.keys(customerFields);

        for(let i=0; i<customerFieldsKeys.length; i++) {
            const key = customerFieldsKeys[i];
            const field = customerFields[key];

            let tmpl = textTemplate;

            if (field.format === 'tel') tmpl = telTemplate;
			if (field.format === 'label') tmpl = labelTemplate;
			if (field.format === 'select') tmpl = selectTemplate;
			if (field.format === 'textarea') tmpl = textareaTemplate;
			if (field.format === 'checkbox') tmpl = checkboxTemplate;
			if (field.format === 'checkbox' && field.enum) tmpl = multiCheckboxTemplate;

			if (!field.format) field.format = 'text';
			if (key === 'email') field.format = 'email';

			if (key === 'name' && field.split_name) {

                let nameFields = [];
				nameFields.push(merge({}, field, {hidden: true, key}));
				nameFields.push(merge({}, field, {title: 'First Name', key: 'first_name'}));
				nameFields.push(merge({}, field, {title: 'Last Name', key: 'last_name'}));

				for(let j=0; j<nameFields.length; j++) {
					const data = merge({
							key: nameFields[j].key,
							arrowDownIcon: require('!svg-inline-loader!../assets/arrow-down-icon.svg'),
						},
						this.parseHtmlTags(nameFields[j])
					);
					formFieldsEle.append(this.htmlToElement(tmpl(data)));
				}
			} else {
				const data = merge({
						key: key,
						arrowDownIcon: require('!svg-inline-loader!../assets/arrow-down-icon.svg'),
					},
					this.parseHtmlTags(field)
				);
				formFieldsEle.append(this.htmlToElement(tmpl(data)));
			}
        }

		this.initFormValidation(form);
		form.addEventListener("submit", e => this.submitForm(e, eventData));
    }
	
    submitForm(e, eventData) {
        e.preventDefault();

        const form = e.target;

        // close the form if submitted
        if (form.classList.contains('success')) {
            this.template.getAvailability();
            this.hidePageModel(this.bookingPageTarget);
            return;
        }

        // Abort if form is submitting,
        // have submitted or does not validate
		if (
            form.classList.contains('loading') ||
            form.classList.contains('error') ||
			!form.checkValidity()
		) {
			const submitButton = form.querySelector('.bookingjs-form-button');
			submitButton.classList.add('button-shake');
			setTimeout(() => submitButton.classList.remove('button-shake'), 500);
			return;
		}

        let formData = this.prepareFormFields(form);

        // fix for first/last name
		if (formData.first_name || formData.last_name) {
			formData.name = formData.first_name + ' ' + formData.last_name;
		}

        form.classList.add('loading');
		this.utils.doCallback('submitBookingForm', formData);

		// Call create event endpoint
		this.timekitCreateBooking(formData, eventData)
			.then(() => {
				const successEle = form.querySelector('.booked-email');
				if (successEle) form.querySelector('.booked-email').innerHTML = formData.email;
				form.classList.remove('loading');
                form.classList.add('success');
			})
			.catch((error) => this.showBookingFailed(form, error));
    }

    timekitCreateBooking(formData, eventData) {
		const nativeFields = [
			'name',
			'email',
			'location',
			'comment',
			'phone',
			'voip',
		];

        const extendedProps = eventData.extendedProps;
        const end = moment(eventData.endStr).tz(this.template.customerTimezoneSelected);
        const start = moment(eventData.startStr).tz(this.template.customerTimezoneSelected);

		let payload = {
			description: '',
			end: end.format(),
			start: start.format(),
			customer: {
				name: formData.name,
				email: formData.email,
				timezone: this.template.customerTimezoneSelected,
			},
		};

        // fix for first/last name
		if (formData.first_name || formData.last_name) {
			payload.customer.last_name = formData.last_name;
			payload.customer.first_name = formData.first_name;
		}

        if (this.config.get('project_id')) {
			payload.project_id = this.config.get('project_id');
		} else {
			payload = merge(payload, {
				where: 'TBD',
				what: 'Meeting with ' + formData.name,
			});
		}

        payload.description += (this.config.get('customer_fields.name.title') || 'Name') +': ' +formData.name +'\n';
        payload.description += (this.config.get('customer_fields.name.email') || 'Email') + ': ' + formData.email + '\n';

        if (this.config.get('customer_fields.location')) {
			payload.where = formData.location;
			payload.customer.where = formData.location;
		}
		if (this.config.get('customer_fields.comment')) {
			payload.customer.comment = formData.comment;
			payload.description += (this.config.get('customer_fields.comment.title') || 'Comment') + ': ' + formData.comment +'\n';
		}
		if (this.config.get('customer_fields.phone')) {
			payload.customer.phone = formData.phone;
			payload.description += (this.config.get('customer_fields.phone.title')|| 'Phone') +': ' +formData.phone +'\n';
		}
		if (this.config.get('customer_fields.voip')) {
			payload.customer.voip = formData.voip;
			payload.description += (this.config.get('customer_fields.voip.title') || 'Voip') +': ' +formData.voip +'\n';
		}

        const customerFields = this.config.get('customer_fields');
        const customerFieldsKeys = Object.keys(customerFields);

        for(let i=0; i<customerFieldsKeys.length; i++) {
            const key = customerFieldsKeys[i];
            const field = customerFields[key];
			if (nativeFields.includes(key)) continue;
			if (field.format === 'checkbox') {
				if (!Array.isArray(formData[key])) {
					if (!field.enum) {
						formData[key] = !!formData[key];
					} else {
						formData[key] = [formData[key]];
					}
				}
			}
			if (field.format !== 'label') {
				payload.customer[key] = formData[key];
				payload.description += (this.config.get('customer_fields.' + key + '.title') || key) +': ' +formData[key] +'\n';
			}
        }

        if (
            this.config.get('booking.graph') === 'group_customer' ||
            this.config.get('booking.graph') === 'group_customer_payment'
        ) {
			payload.resource_id = extendedProps.booking.resource.id;
			payload.related = { owner_booking_id: extendedProps.booking.id };
		} else if (
            typeof extendedProps.resources === 'undefined' ||
            extendedProps.resources.length === 0
        ) {
			throw this.template.triggerError(['No resources to pick from when creating booking']);
		} else {
			payload.resource_id = extendedProps.resources[0].id;
		}

        payload = merge(payload, this.config.get('booking'));
		this.utils.doCallback('createBookingStarted', payload);

		const request = this.template.sdk
			.include(this.config.get('create_booking_response_include'))
			.createBooking(payload);

		request
			.then((response) => this.utils.doCallback('createBookingSuccessful', response))
			.catch((response) => {
				this.utils.doCallback('createBookingFailed', response);
				this.template.triggerError([
					'An error with Timekit Create Booking occured',
					response,
				]);
			});

		return request;
    }
}

module.exports = BookingPage;
