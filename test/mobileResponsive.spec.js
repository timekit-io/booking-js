'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var mockAjax = require('./utils/mockAjax');
var createWidget = require('./utils/createWidget');
var interact = require('./utils/commonInteractions');

describe('Mobile & responsive', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
    viewport.set(360, 740);
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    viewport.reset()
  });

  it('should be able change day in mobile mode by clicking arrows', function(done) {

    createWidget({
      ui: {
        display_name: 'John Doe',
        availability_view: 'agendaWeek'
      }
    });

    expect($('.fc-dayGridDay-view')).toBeInDOM()
    var currentDay = $('.fc-col-header-cell-cushion')[0].textContent;

    var displayNameRect = $('.bookingjs-displayname')[0].getBoundingClientRect();
    var clickableArrowRect = $('.fc-next-button')[0].getBoundingClientRect();

    var overlap = !(displayNameRect.right < clickableArrowRect.left ||
                displayNameRect.left > clickableArrowRect.right ||
                displayNameRect.bottom < clickableArrowRect.top ||
                displayNameRect.top > clickableArrowRect.bottom)
    expect(overlap).toBe(false);

    setTimeout(function() {

      interact.clickNextArrow();
      setTimeout(function() {

        var nextDay = $('.fc-col-header-cell-cushion')[0].textContent;
        expect(currentDay).not.toBe(nextDay);
        done();

      }, 100);
    }, 200);

  });

});
