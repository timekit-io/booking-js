'use strict';

// Set of shorthands for common interactions
module.exports = {

  clickNextArrow: function () {
    document.querySelector(".fc-next-button").click();
  },

  clickEvent: function() {
    var calEvent = document.querySelector(".fc-timegrid-event");
    calEvent.click();
    return calEvent.querySelector(".fc-event-time").innerHTML;
  },

  clickListEvent: function() {
    var calEvent = document.querySelector('.fc-list-event');
    calEvent.click();
    return calEvent.querySelector('.fc-list-event-time').innerHTML;
  },

  fillSubmit: function() {
    const data = {
      name: 'Joe Test',
      email: 'test@timekit.io',
      comment: 'This is a test'
    };

    let nameInput = document.getElementById('input-name');
    let emailInput = document.getElementById('input-email');
    let commentInput = document.getElementById('input-comment');

    nameInput && (nameInput.value = data.name);
    emailInput && (emailInput.value = data.email);
    commentInput && (commentInput.value = data.comment);

    document.querySelector('.bookingjs-form-button').click();

    return data;
  }
}
