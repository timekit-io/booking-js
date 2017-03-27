'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

var browserWidth;

describe('Mobile & responsive', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
    browserWidth = $('body').width();
    $('body').width(400);
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    $('body').width(browserWidth);
  });

  it('should be able change day in mobile mode by clicking arrows', function(done) {

    createWidget({
      name: 'John Doe'
    });

    expect($('.fc-basicDay-view')).toBeInDOM()
    var currentDay = $('.fc-day-header')[0].textContent;

    var displayNameRect = $('.bookingjs-displayname')[0].getBoundingClientRect();
    var clickableArrowRect = $('.fc-next-button')[0].getBoundingClientRect();

    var overlap = !(displayNameRect.right < clickableArrowRect.left ||
                displayNameRect.left > clickableArrowRect.right ||
                displayNameRect.bottom < clickableArrowRect.top ||
                displayNameRect.top > clickableArrowRect.bottom)
    expect(overlap).toBe(false);

    setTimeout(function() {

      var calEventStart = interact.clickNextArrow();

      setTimeout(function() {

        var nextDay = $('.fc-day-header')[0].textContent;
        expect(currentDay).not.toBe(nextDay);
        done();

      }, 100);
    }, 200);

  });

});
