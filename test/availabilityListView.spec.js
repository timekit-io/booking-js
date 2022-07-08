'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

var mockAjax = require('./utils/mockAjax');
var createWidget = require('./utils/createWidget');
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
      ui: {
        availability_view: 'listing'
      }
    });

    setTimeout(function() {
      expect($('.fc-list-table')).toBeInDOM();
      interact.clickListEvent();
      setTimeout(function() {
        expect($('.bookingjs-bookpage')).toBeInDOM();
        expect($('.bookingjs-bookpage')).toBeVisible();
        done();
      }, 500);
    }, 500);

  });

});
