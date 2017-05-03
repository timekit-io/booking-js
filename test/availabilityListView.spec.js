'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var createWidget = require('./utils/createWidget');
var mockAjax = require('./utils/mockAjax');
var interact = require('./utils/commonInteractions');

describe('Availability view', function() {

  beforeEach(function(){
    loadFixtures('main.html');
    jasmine.Ajax.install();
    mockAjax.all();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should be able to render list view', function(done) {

    createWidget({
      availabilityView: 'listing'
    });

    expect($('.fc-listing-view')).toBeInDOM();

    setTimeout(function() {

      interact.clickListEvent();

      setTimeout(function() {

        expect($('.bookingjs-bookpage')).toBeInDOM();
        expect($('.bookingjs-bookpage')).toBeVisible();

        done();

      }, 500);

    }, 500);

  });

});
