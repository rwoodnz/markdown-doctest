'use strict';

var fs = require('fs');

var CONFIG_FILEPATH = process.cwd() + '/.markdown-doctest-setup.js';
var PACKAGE_FILEPATH = process.cwd() + '/package.json';

const FAIL = 1;
const SUCCESS = 0;

const ERR_SETUP_FILE_READ_FAIL = 'Error running .markdown-doctest-setup.js:';
const ERR_SETUP_FILE_ALREADY_EXISTS = 'Error creating .markdown-doctest-setup.js: File already exists\n';
const ERR_SETUP_FILE_CREATE_FAIL = 'Error creating .markdown-doctest-setup.js:';
const ERR_PACKAGE_FILE_DOESNT_EXIST = 'Error finding package.json\n';
const ERR_PACKAGE_FILE_READ_FAIL = 'Error reading package.json:';
const SETUP_FILE_CREATED = 'Successfully created .markdown-doctest-setup.js with default values\n';


function defaultSetup(name) {
    var content =
`
const packageName = require('.');

module.exports = {
  require: {
    '${ name }' : packageName
  },
  globals: {
    '${ name }' : packageName 
  } 
}

`
    return content;
}

function createSetupFile() {

    if (setupFileExists()) {
        console.log(ERR_SETUP_FILE_ALREADY_EXISTS);
        return FAIL;
    }

    if (!packageFileExists()) {
        console.log(ERR_PACKAGE_FILE_DOESNT_EXIST)
        return FAIL;
    }

    // retrieve package name from package.json to put into defaults
    var packageConfig;

    try {
        packageConfig = require(PACKAGE_FILEPATH)
    } catch (e) {
        console.log(ERR_PACKAGE_FILE_READ_FAIL);
        console.error(e);
        return FAIL;
    }

    try {
        fs.writeFile(
            CONFIG_FILEPATH,
            defaultSetup(packageConfig.name)
        )
    } catch (e) {
        console.log(ERR_SETUP_FILE_CREATE_FAIL);
        console.error(e);
        return FAIL;
    }

    console.log(SETUP_FILE_CREATED);
    return SUCCESS;
}

function packageFileExists() {
    return fs.existsSync(PACKAGE_FILEPATH);
}

function setupFileExists() {
    return fs.existsSync(CONFIG_FILEPATH);
}

function getSetupFile() {

    try {
        return require(CONFIG_FILEPATH);
    } catch (e) {
        console.log(ERR_SETUP_FILE_READ_FAIL);
        console.error(e);
        return null;
    }

}

module.exports = { createSetupFile, setupFileExists, getSetupFile }