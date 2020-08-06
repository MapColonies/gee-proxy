'use strict';

var Gee = require('../service/GeeService');

module.exports.addImageryResource = function addImageryResource(req, res, next) {
    Gee.addImageryResource(req.swagger.params, res, next);
};

module.exports.cleanResource = function cleanResource(req, res, next) {
    Gee.cleanResource(req.swagger.params, res, next);
};

module.exports.publishDB = function publishDB(req, res, next) {
    Gee.publishDB(req.swagger.params, res, next);
};

module.exports.splitFile = function splitFile(req, res, next) {
    Gee.splitFile(req.swagger.params, res, next);
};

module.exports.updateImageryResource = function updateImageryResource(req, res, next) {
    Gee.updateImageryResource(req.swagger.params, res, next);
};
