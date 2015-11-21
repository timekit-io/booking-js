'use strict';

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
loadFixtures('main.html')
var $ = jQuery;
/**
 * Intilialise the library
 */
describe('Configuration', function() {

  it('should be able initialize the library', function() {

    expect(jQuery('#my-fixture')[0]).toBeInDOM();
    expect(true).toEqual(true);

  });

});
