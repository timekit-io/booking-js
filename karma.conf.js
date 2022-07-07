module.exports = function (config) {
	process.env.CHROME_BIN = require('puppeteer').executablePath();
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: './',

		// web server port
		port: 9876,

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine-ajax', 'jasmine', 'browserify', 'viewport'],

		preprocessors: {
			'test/*.spec.js': [ 'browserify' ]
		},

		// list of files / patterns to load in the browser
		files: [
			'node_modules/jquery/dist/jquery.js',
			'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
			{ pattern: 'misc/**/*.*', included: false, served: true, watched: false },
			{ pattern: 'public/build/**/*', included: false, served: true, watched: true },			
			{
				pattern: 'test/*.spec.js',
				included: true,
				watched: true,
				served: true,
			},
			{
				pattern: 'test/fixtures/**/*.html',
				included: false,
				watched: true,
				served: true,
			}
		],

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['ChromeHeadless'],

		// enable / disable colors in the output (reporters and logs)
		colors: true,		

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,		

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,		

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		// reporters: ['coverage'],
		reporters: ['spec']		
	});
};
