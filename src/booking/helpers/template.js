const find = require("lodash/find");
const merge= require('lodash/merge');
const moment = require('moment-timezone');
const stringify = require('json-stringify-safe');
const { Calendar } = require("@fullcalendar/core");

const BaseTemplate = require('./base');
const BookingPage = require("../pages/booking");
const timezones = require("../services/timezones");
const BookingReschudlePage = require("../pages/reschedule");

require('../styles/fullcalendar.scss');
require('../styles/utils.scss');
require('../styles/main.scss');
require('../styles/testmoderibbon.scss');

class Template extends BaseTemplate {
    constructor(config, utils, sdk) {
        super();

        // config and utils
        this.sdk = sdk;
        this.utils = utils;
        this.config = config;

        // dom nodes
        this.calendar = null;
        this.rootTarget = null;
        this.errorTarget = null;
        this.loadingTarget = null;
        this.calendarTarget = null;
        this.bookingPageTarget = null;

        // customer states
        this.customerTimezone = null;
        this.timezones = timezones.list;
        this.customerTimezoneSelected = null;        

        // initialize pages
        this.bookingPage = new BookingPage(this);
        this.bookingReschudlePage = new BookingReschudlePage(this);
    }

    destroy() {
        this.calendar = null;
        this.config.set({});
        this.render({});
    }

    getCalendar() {
        return this.calendar;
    }

    render(configs) {
        const targetElement = configs.el || this.config.get('el');        
        this.rootTarget = document.getElementById(targetElement.replace('#', ''));

        if (!this.rootTarget) {
			throw this.triggerError(
				'No target DOM element was found (' + targetElement + ')'
			);
        }

        this.rootTarget.classList.add("bookingjs");
        let child = this.rootTarget.lastElementChild; 
        
        while (child) {
            this.rootTarget.removeChild(child);
            child = this.rootTarget.lastElementChild;
        }
    }

    renderAvatarImage() {
        if (this.config.get('ui.avatar')) {
            const template = require('../templates/user-avatar.html');
            const avatarTarget = this.htmlToElement(template({
                image: this.config.get('ui.avatar')
            }));
            this.rootTarget.classList.add('has-avatar');
            this.rootTarget.append(avatarTarget);    
        }
        return this;
    }

    renderDisplayName() {
        if (this.config.get('ui.display_name')) {
            const titleEle = this.calendarTarget.querySelector(".fc-header-toolbar:first-child .fc-toolbar-chunk");
            if (titleEle) {
                titleEle.innerHTML = this.config.get('ui.display_name');
            }
        }
        return this;
    }   

    showLoadingScreen() {
        this.utils.doCallback('showLoadingScreen');
        const template = require('../templates/loading.html');
        this.loadingTarget = this.htmlToElement(template({
            loadingIcon: require('!svg-inline-loader!../assets/loading-spinner.svg')
        }));
        this.rootTarget.append(this.loadingTarget);
    }

    renderTestModeRibbon() {
		const template = require('../templates/testmoderibbon.html');
		const testModeRibbonTarget = this.htmlToElement(
            template({ribbonText: 'Test Mode'})
		);
        this.rootTarget.append(testModeRibbonTarget);
    }

    guessCustomerTimezone() {
		this.setCustomerTimezone(timezones.guess());
        const knownTimezone = timezones.knownTimezone(this.customerTimezone);
        if (!knownTimezone) {
            const name = timezones.getTimeZoneName(this.customerTimezone);
            this.timezones.unshift({
				name: name,
				key: this.customerTimezone,
				value: this.customerTimezone,
			});
        }
    }

    setCustomerTimezone(newTz) {
		const found = find(timezones.list, { key: newTz });
		if (!newTz || !timezones.getZone(newTz)) {
			throw this.triggerError(['Trying to set invalid or unknown timezone', newTz]);
		}
		this.customerTimezone = newTz;
		this.customerTimezoneSelected = found !== undefined ? found.value : newTz;
    }

    initializeCalendar() {
        const sizing = this.decideCalendarSize(this.config.get("fullcalendar.initialView"));        
        const args = merge({
			height: sizing.height,
            eventClick: (info) => {
                if (!this.config.get('disable_confirm_page')) {
                    if (this.isReschdulePage()) {
                        this.bookingReschudlePage.initBookingAndRender(info.event);
                    }
                    else {
                        this.bookingPage.render(info.event);
                    }
                } else {
                    info.el.classList.remove('fc-event-clicked');
                    info.el.classList.add('fc-event-clicked');
                    this.utils.doCallback('clickTimeslot', info.event);
                }
            },
            windowResize: (arg) => {
                if(!this.calendar) return;
                var sizing = this.decideCalendarSize(arg.view.type);
				this.calendar.changeView(sizing.view);
				this.calendar.setOption('height', sizing.height);
            }
		}, this.config.get("fullcalendar"));

        args.initialView = sizing.view;
        this.calendarTarget = document.createElement("div");
        this.calendarTarget.classList.add("bookingjs-calendar");
        this.calendarTarget.classList.add("empty-calendar");      
                
        this.rootTarget.append(this.calendarTarget);
        this.calendar = new Calendar(this.calendarTarget, args);
        this.calendar.render();

        this.rootTarget.addEventListener("customer-timezone-changed", (e) => {
            e.preventDefault();
            if (!this.calendarTarget) return;
            this.calendar.setOption("timeZone", this.customerTimezoneSelected);
            this.getAvailability();
        });

        // TODO: add timezone event listener
        this.utils.doCallback('fullCalendarInitialized');

        return this;
    }

    getAvailability() {
        this.showLoadingScreen();
        const bookingGraph = this.config.get('booking.graph');

        if (
			bookingGraph === 'group_customer' ||
			bookingGraph === 'group_customer_payment'
		) {
			// If in group bookings mode, fetch slots
			this.timekitGetBookingSlots();
		} else {
			// If in normal single-participant mode, call findtime
			this.timekitFetchAvailability();
		}

        return this;
    } 

    renderFooter() {
		const showCredits = this.config.get('ui.show_credits');
		const showTimezoneHelper = this.config.get('ui.show_timezone_helper');
        
        // If neither TZ helper or credits is shown, dont render the footer
		if (!showTimezoneHelper && !showCredits) return;

        let campaignName = 'widget';
		const campaignSource = window.location.hostname.replace(/\./g, '-');

		if (this.config.get('project_id')) {
			campaignName = 'embedded-widget';
		}
		if (this.config.get('project_slug')) {
			campaignName = 'hosted-widget';
		}

        const timekitLogo = require('!svg-inline-loader!../assets/timekit-logo.svg');
		const timezoneIcon = require('!svg-inline-loader!../assets/timezone-icon.svg');
		const arrowDownIcon = require('!svg-inline-loader!../assets/arrow-down-icon.svg');

        const template = require('../templates/footer.html');
        const footerTarget = this.htmlToElement(
			template({
				showCredits: showCredits,
				timekitLogo: timekitLogo,
				campaignName: campaignName,
				timezoneIcon: timezoneIcon,
				arrowDownIcon: arrowDownIcon,
				listTimezones: timezones.list,
				campaignSource: campaignSource,
				showTimezoneHelper: showTimezoneHelper,
			})
		);
		this.rootTarget.append(footerTarget);

        // Set initial customer timezone
		const pickerSelect = document.querySelector('.bookingjs-footer-tz-picker-select');

        pickerSelect.value = this.customerTimezone;
        pickerSelect.addEventListener('change', (e) => {
            e.preventDefault();
            this.setCustomerTimezone(e.target.value);
            this.calendar.setOption("timeZone", this.customerTimezoneSelected);
            this.rootTarget.dispatchEvent(new Event('customer-timezone-changed'));
        });

        return this;
    }    

    hideLoadingScreen() {
		this.utils.doCallback('hideLoadingScreen');
		this.loadingTarget.classList.remove('show');
		setTimeout(() => this.loadingTarget.remove(), 500);
    }

    timekitGetBookingSlots() {
        this.utils.doCallback('GetBookingSlotsStarted');

        let requestData = {
			method: 'get',
			url: '/bookings/groups',
			headers: {
				'Timekit-Timezone': this.customerTimezoneSelected,
			},
		};

		// scope group booking slots by widget ID if possible
		if (this.config.get('project_id'))
			requestData.params = {
				search: 'project.id:' + this.config.get('project_id')
			};

		this.sdk
			.makeRequest(requestData)
			.then((response) => {
				const slots = response.data.map(function (item) {
					return {
						booking: item,
						end: item.attributes.event_info.end,
						title: item.attributes.event_info.what,
						start: item.attributes.event_info.start,
					};
				});

				// Make sure to sort the slots chronologically,
				// otherwise FullCalendar might skip rendering some of them
				slots.sort(function (a, b) {
					return moment(a.start) - moment(b.start);
				});

				this.utils.doCallback('getBookingSlotsSuccessful', response);
				this.hideLoadingScreen();

				// Render available timeslots in FullCalendar
				if (slots.length > 0) this.renderCalendarEvents(slots);

				// Render test ribbon if enabled
				if (response.headers['timekit-testmode']) this.renderTestModeRibbon();
			})
			.catch((response) => {
				this.utils.doCallback('getBookingSlotsFailed', response);
				this.hideLoadingScreen();
				this.triggerError([
					'An error with Timekit Get Booking Slots occured',
					response,
				]);
			});
    }

    timekitFetchAvailability() {
        let args = {
			output_timezone: this.customerTimezoneSelected,
		}

        if (this.config.get('project_id')) {
            args.project_id = this.config.get('project_id')
        }
		if (this.config.get('resources')) {
            args.resources = this.config.get('resources')
        }
		if (this.config.get('availability_constraints')) {
            args.constraints = this.config.get('availability_constraints');
        }
		
        args = merge(args, this.config.get('availability'));
		this.utils.doCallback('fetchAvailabilityStarted', args);

        this.sdk
            .makeRequest({
                data: args,
                method: 'post',
                url: '/availability',
            })
            .then((response) => {                
                this.utils.doCallback('fetchAvailabilitySuccessful', response);
                this.hideLoadingScreen();

                // Render available timeslots in FullCalendar
                if (response.data.length > 0) {
                    this.renderCalendarEvents(response.data);
                };

                // Render test ribbon if enabled
                if (response.headers['timekit-testmode']) {
                    this.renderTestModeRibbon();
                };
            })
            .catch((response) => {
                this.utils.doCallback('fetchAvailabilityFailed', response);
                this.hideLoadingScreen();
                this.triggerError([
                    'An error with Timekit Fetch Availability occured',
                    response,
                ]);
            });
    }

    renderCalendarEvents(eventData) {
		const firstEventEnd = moment(eventData[0].end);
        const firstEventStart = moment(eventData[0].start);

        const eventSources = this.calendar.getEventSources();
		const firstEventDuration = firstEventEnd.diff(firstEventStart, 'minutes');

		if (firstEventDuration <= 90) {
			this.calendar.setOption('slotDuration', '00:15:00');
		}

        // remove previous events
        for(let i=0; i<eventSources.length; i++) {
            eventSources[i].remove();
        }

		this.calendar.addEventSource(eventData);
		this.calendarTarget.classList.remove('empty-calendar');
        
		// Go to first event if enabled
		this.goToFirstEvent(eventData[0].start);
    }

    goToFirstEvent(firstEventStart) {
        this.calendar.gotoDate(firstEventStart);
        this.scrollToTime(moment(firstEventStart).format('H'));
    }

    scrollToTime(time) {
        if (this.calendar.getOption('initialView') !== 'timeGridWeek') {
            return;
        }

        let slotDurationMinutes = 30;
        const slotDuration = this.calendar.getOption('slotDuration');
		
        if (slotDuration) {
            slotDurationMinutes = slotDuration.slice(3, 5);
        }

        // Get height of each hour row
        const timeSlot = document.querySelector('.fc-timegrid-slots .fc-timegrid-slot-minor');
		const timeSlotHeight = timeSlot.clientHeight * (60 / slotDurationMinutes);

        // If minTime is set in fullCalendar config, subtract that from the scollTo calculationn
		let minTimeHeight = 0;
		if (this.config.get('fullcalendar.minTime')) {
			const minTime = moment(this.config.get('fullcalendar.minTime'), 'HH:mm:ss').format('H');
			minTimeHeight = hourHeight * minTime;
		}

        // Calculate scrolling location and container sizes
		let scrollTo = timeSlotHeight * time - minTimeHeight;
		const scrollable = document.querySelector('.fc-scroller-liquid-absolute');

		const scrollableHeight = scrollable.clientHeight;
		const scrollableScrollTop = scrollable.scrollTop;
		const maximumHeight = scrollable.querySelector('.fc-timegrid-body').clientHeight;

        // Only perform the scroll if the scrollTo is outside the current visible boundary
		if (
			scrollTo > scrollableScrollTop &&
			scrollTo < scrollableScrollTop + scrollableHeight
		) {
			return;
		}

		// If scrollTo point is past the maximum height, then scroll to maximum possible while still animating
		if (scrollTo > maximumHeight - scrollableHeight) {
			scrollTo = maximumHeight - scrollableHeight;
		}

        // Perform the scrollTo animation
		scrollable.animate({ scrollTop: scrollTo });
    }

    getWidthOfElement(element) {
        return parseInt(element.getBoundingClientRect().width);
    }

    decideCalendarSize(currentView) {
        let height = 385;
        let view = currentView || this.config.get("fullcalendar.initialView");

        if (this.getWidthOfElement(this.rootTarget) < 480) {
			this.rootTarget.classList.add("is-small");
			if (this.config.get("ui.avatar")) height -= 15;
			if (currentView === 'timeGridWeek' || currentView === 'dayGridDay') {
				view = 'dayGridDay';
			}
		} else {
			this.rootTarget.classList.remove('is-small');
		}

        const customerFields = this.config.get("customer_fields");
        const customerFieldsKeys = Object.keys(customerFields);

        for(let i=0; i < customerFieldsKeys.length; i++) {
            const field = customerFields[customerFieldsKeys[i]];
			if (field.format === 'textarea') height += 98;
            if (field.split_name) height += 132;
			else if (field.format === 'checkbox') {
                if (field.enum) {
                    height += 51 * field.enum.length;
                } else {
                    height += 51;
                }
            }
			else height += 66;
        }

        if (this.isReschdulePage()) {
            height += 100;
        }
        
        return {
			view: view,
			height: height
		};
    }

    isReschdulePage() {
        return this.config.get('reschedule.uuid') && this.config.get('reschedule.action') === 'reschedule';
    }

    triggerError(message) {
		// If an error already has been thrown, exit
        // If no target DOM element exists, only do the logging
		if (this.errorTarget) return message;
		if (!this.rootTarget) return message;

		this.utils.logError(message);        
		this.utils.doCallback('errorTriggered', message);

		let contextProcessed = null;
        let messageProcessed = message;

        if (this.utils.isArray(message)) {
            messageProcessed = message[0];
            if (message[1].data) {
                contextProcessed = stringify(
                    message[1].data.errors || message[1].data.error || message[1].data
                );
            } else {
                contextProcessed = stringify(message[1]);
            }
        }

		const template = require('../templates/error.html');
        this.errorTarget = this.htmlToElement(
			template({
				message: messageProcessed,
				context: contextProcessed,
				errorWarningIcon: require('!svg-inline-loader!../assets/error-warning-icon.svg'),
			})
		);
		this.rootTarget.append(this.errorTarget);

        return message;
    }
}

module.exports = Template;