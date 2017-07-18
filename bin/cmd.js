#! /usr/bin/env node
'use strict';

var doctest = require('../lib/doctest');

var defaults = require('../src/defaults.js');

var fs = require('fs');

var glob = require('glob');

var DEFAULT_GLOB = '**/*.+(md|markdown)';
var DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/bower_components/**'
];

const FAIL = 1;
const SUCCESS = 0;

function displayHelp() {
  const helpText = [
    'Usage: markdown-doctest [glob]',
    'Options:',
    '  -h, --help    output help text',
    '  -i, --init    initialize setup file'
  ];

  console.log(helpText.join('\n'));
}

function main(args) {

  args = args || process.argv
  
  var userGlob = args[2];
  var config = { require: {} };

  if (args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1) {
    displayHelp();
    process.exitCode = SUCCESS;
    return;
  }

  if (userGlob == '--init' || userGlob == '-i') {
    process.exitCode = defaults.createSetupFile()
    return;
  }

  if(defaults.setupFileExists()) {
    config = defaults.getSetupFile()
    if(!config) {
      process.exitCode = FAIL;
      return
    }
  }
  
  var ignoredDirectories = config.ignore || [];

  glob(
    userGlob || DEFAULT_GLOB,
    { ignore: DEFAULT_IGNORE.concat(ignoredDirectories) },
    run
  );

  function run(err, files) {
    if (err) {
      console.trace(err);
    }

    var results = doctest.runTests(files, config);

    console.log('\n');

    doctest.printResults(results);

    var failures = results.filter(function (result) { return result.status === 'fail'; });

    if (failures.length > 0) {
      process.exitCode = FAIL;
    }
  }
}

main();
