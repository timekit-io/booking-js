const moment = require('moment-timezone');

class BaseTemplate {

    parseHtmlTags(field) {
		if (field.format === 'label') {
			field.title = field.title.replace(/\(\((.*?)\)\)/g, function(match, token) {
				var linkTag = token.split(',');
				return '<a target="_blank" href="' + linkTag[1].trim() + '">' + linkTag[0].trim() + '</a>';
			});
		}
		return field;
	}

    htmlToElement(html) {
        const template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }

    formatTimestamp(start, format) {
        return moment(start).tz(this.template.customerTimezoneSelected).format(format);
    }	

	initCloseButton(page) {
		const form = page.querySelector('.bookingjs-form');
        const closeButton = page.querySelector('.bookingjs-bookpage-close');

        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (form.classList.contains('success')) {
                this.template.getAvailability();
            }
            this.hidePageModel(page);
        });
	}

	initFormValidation(form) {
		const formElements = form.querySelectorAll('.bookingjs-form-input');
		const selectElements = form.querySelectorAll('.bookingjs-form-input--select');
        const formCheckBoxElements = form.querySelectorAll('.bookingjs-form-field--checkbox-multi');

        for (let i = 0; i < formElements.length; i++) {
            if (formElements[i].value && formElements[i].value.trim()) {
                formElements[i].classList.remove('field-required');
            }
            formElements[i].addEventListener("input", function(e) {
                const field = e.target.closest('.bookingjs-form-field');
                if (e.target.value) {
                    e.target.classList.remove('field-required');
                    field.classList.add('bookingjs-form-field--dirty');
                } else {
                    e.target.classList.add('field-required');
                    field.classList.remove('bookingjs-form-field--dirty')
                };
                e.preventDefault();
            });
        }

        for (let j = 0; j < formCheckBoxElements.length; j++) {
            if (formCheckBoxElements[j].value && formCheckBoxElements[j].value.trim()) {
                formCheckBoxElements[j].classList.remove('field-required');
            }
            formCheckBoxElements[j].addEventListener("change", function(e) {
                if (e.target.checked) {
                    e.target.classList.remove('field-required');
                    formCheckBoxElements[j].removeAttribute('required');
                } else {
                    e.target.classList.add('field-required');
                    formCheckBoxElements[j].setAttribute('required', 'required');
                }
                e.preventDefault();
            });
        }

        for (let k = 0; k < selectElements.length; k++) {
            if (selectElements[k].value && selectElements[k].value.trim()) {
                selectElements[k].classList.remove('field-required');
            }
            selectElements[k].addEventListener("change", function(e) {
                if (e.target.value) {
                    e.target.classList.remove('field-required');
                } else {
                    e.target.classList.add('field-required');
                }
                e.preventDefault();
            });
        }
	}

	showBookingFailed(form, error) {
		const submitButton = form.querySelector('.bookingjs-form-button');
		
        submitButton.classList.add('button-shake');
		setTimeout(() => submitButton.classList.remove('button-shake'), 500);

		form.classList.add('loading');
        form.classList.add('error');

		setTimeout(() => form.classList.remove('error'), 2000);

        this.utils.logDebug(['Booking Error:', error]);
    }

	prepareFormFields(form) {
        const formData = {};
        const formElements = Array.from(form.elements);

        for(let i=0; i<formElements.length; i++) {
            const field = formElements[i];
			
            const fieldKey = field.name;
            const fieldType = field.type;
            
            if (fieldKey) {
                if (!formData.hasOwnProperty(fieldKey)) {
                    if (fieldType === 'checkbox') {
                        formData[fieldKey] = field.checked ? [field.value] : [];
                    } else {
                        formData[fieldKey] = field.value;
                    }
                } else {
                    if (Array.isArray(formData[fieldKey])) {
                        if (fieldType === 'checkbox') {
                            if (field.checked) {
                                formData[fieldKey].push(field.value);
                            }
                        } else {
                            formData[fieldKey].push(field.value);
                        }
                    }
                }    
            }
        }

		return formData;
	}

	hidePageModel(page) {
		this.utils.doCallback('closeBookingPage');
		page.classList.remove('show');
		setTimeout(() => page.remove(), 200);
    }
}

module.exports = BaseTemplate;