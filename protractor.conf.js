'use strict';

exports.config = {
  directConnect: true,
  baseUrl: 'http://localhost:8100',
  getPageTimeout: 60000,
  allScriptsTimeout: 500000,
  // Specify the patterns for test files
  // to include in the test run
  specs: [
    'features/**/*.feature'
  ],
  // Use this to exclude files from the test run.
  // In this case it's empty since we want all files
  // that are mentioned in the specs.
  exclude: [],
  // Use cucumber for the tests
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  // Contains additional settings for cucumber-js
  cucumberOpts: {
    compiler: 'ts:ts-node/register',
    monochrome: true,
    strict: true,
    plugin: ['pretty'],
    require: ['features/step_definitions/**/*.steps.ts', 'features/support/**/*.ts'],
    tags: [
      '@HomeScreenScenario',
      '@FirstTimeSignInScreenScenario',
      '@SignInScreenOpenTermsAndConditionsScenario',
      '@SignInScreenExitTermsAndConditionsScenario',
    ].join(',')
  },
  onPrepare: function () {
    var globals = require('protractor');
    var browser = globals.browser;
    
    browser.ignoreSynchronization = true;
    browser.manage().window().maximize();
  },
  // These capabilities tell protractor about the browser
  // it should use for the tests. In this case chrome.
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
    }
  },
  // This setting tells protractor to wait for all apps
  // to load on the page instead of just the first.
  useAllAngular2AppRoots: true,
};
