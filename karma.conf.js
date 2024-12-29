module.exports = function (config) {

  if (process.env.TRAVIS) {
    config.browsers = ['ChromeHeadlessNoSandbox'];
  }

  config.set({
    frameworks: ['mocha', 'chai'],

    // Load these plugins so Karma recognizes 'rollup' as a preprocessor
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-rollup-preprocessor'
    ],

    files: [
      // Test files
      { pattern: './node_modules/ramda/dist/ramda.min.js', watched: false },
      { pattern: './node_modules/rxjs/**/*.js', included: false, watched: false },

      // Your test files:
      { pattern: './src/tests/index.test.js', watched: true },
      { pattern: './src/tests/spyne-app.test.js', watched: true },
      { pattern: './src/tests/package-json.spec.test.js', watched: true },
      { pattern: './src/tests/channels/*.test.js', watched: true },
      { pattern: './src/tests/utils/*.test.js', watched: true },
      { pattern: './src/tests/views/*.test.js', watched: true }    ],

    preprocessors: {
      // We want to run Rollup on our test files (and any imports they pull in)
      './src/tests/*.test.js': ['rollup'],
      './src/tests/channels/*.test.js': ['rollup'],
      './src/tests/utils/*.test.js': ['rollup'],
      './src/tests/views/*.test.js': ['rollup']
    },

    rollupPreprocessor: {
      // In test mode, you can build ESM or IIFE—depends on how you want the browser to load it.
      // If you want to keep it pure ESM, Karma's internal test runner loads them via a script tag,
      // which can be tricky. An easier path is to bundle as IIFE or UMD for the tests only.
      // For coverage, consider "rollup-plugin-istanbul" or similar.
      output: {
        format: 'iife',
        name: 'SpyneTest', // global name for your test bundle
        sourcemap: 'inline'
      },
      plugins: [
        require('@rollup/plugin-node-resolve').default(),
        require('@rollup/plugin-commonjs')({
          transformMixedEsModules: true
        }),
        require('@rollup/plugin-json')()


      ]
    },

    // Browsers
    browsers: ['Chrome'],

    // run once and exit or watch
    singleRun: true
  });
};
