'use strict';

let config = require('config');
let logConfig = config.get('logger');
let serviceData = require('./package.json');
let { MCLogger } = require('@map-colonies/mc-logger');

let logger = new MCLogger(logConfig, serviceData);

module.exports = logger;
