'use strict';

const Helpers = require('../utils/helpers');
const ScriptUtils = require('../utils/script-utils');
const SshExecCommand = require('../ssh/ssh-exec-command');
const fs = require('fs');
const path = require('path');
const {DatabaseData, ImageryProjectData, ResourceData, ImageryResourceData, DefaultMaskTypeParameters, PublishDBToServerData, UnifiedResponse} = require('../model/gee-model');
const logger = require('../logger-config');
/**
 * Add new Imagery resource
 * Add Imagery new resource
 *
 * body AssetData Asset data that needs to be added to GEE
 * returns GEEResponse
 **/
exports.addImageryResource = async function (args, res, next) {
    logger.log('info', 'addImageryResource req : %j', args, {});
    let script;
    try {
        let addImageryResourceData = args.assetData.value;
        if (!Boolean(addImageryResourceData) ||
            !Boolean(addImageryResourceData.dataBase) ||
            !Boolean(addImageryResourceData.project) ||
            !Boolean(addImageryResourceData.resource)) {
            const response = new UnifiedResponse(400, 'Invalid Arguments');
            res.statusCode = response.statusCode;
            res.end(JSON.stringify({response}));
            return;
        }

        const databaseData = addImageryResourceData.dataBase;
        const imageryProjectData = addImageryResourceData.project;
        const resourceData = addImageryResourceData.resource;
        const imageryResourceData = new ImageryResourceData(databaseData, imageryProjectData, resourceData);
        script = ScriptUtils.addImageryResource(imageryResourceData);
    } catch (err) {
        handleError(res, err, 'failed to add Imagery Resource:');
    }
    await runGeeScript(script, res, next, 'failed to run add Imagery Resource script:');
};

/**
 * Clean Imagery Asset
 *
 *
 * assetName String Imagery Asset Name
 * version String <version> can be a number, 'current', or 'lastgood' if ommited <assetname> is checked for '?version=...' (optional)
 * returns GEEResponse
 **/
exports.cleanResource = async function (args, res, next) {
    logger.log('info', 'cleanResource req : %j', args, {});
    let script;
    try {
        var assetName = args.assetName.value;
        var version = args.version.value;
        script = ScriptUtils.cleanResource(assetName, version);
    } catch (err) {
        handleError(res, err, 'failed to create clean resource script:');
    }
    await runGeeScript(script, res, next, 'failed to run clean resource script:');
};

/**
 * publish existing DB to GEE Server
 * publish existing DB to GEE Server
 *
 * body PublishDB Publish DB Data
 * returns GEEResponse
 **/
exports.publishDB = async function (args, res, next) {
    logger.log('info', 'publishDB req : %j', args, {});
    let script;
    try {
        let publishDBData = args.publishDB.value;
        script = ScriptUtils.publishDB(publishDBData);
    } catch (err) {
        handleError(res, err, 'failed to create publishDB script:');
    }
    await runGeeScript(script, res, next, 'failed to run publishDB Script');
};

/**
 * split file if needed
 * check if file need to be split and split it
 *
 * body AssetMinifiedData Split File Data
 * returns GEEResponse
 **/
exports.splitFile = async function (args, res, next) {
    logger.log('info', 'splitFile req : %j', args, {});
    let script;
    try {
        let assetMinifiedData = args.assetMinifiedData.value;
        if (assetMinifiedData.sizeInGB < 80) {
            const description = 'file size is valid, you don\'t need to split it';
            const response = new UnifiedResponse(500, description, description);
            res.statusCode = response.statusCode;
            res.end(JSON.stringify(response));
            return;
        }

        script = ScriptUtils.splitFile(assetMinifiedData);
    } catch (err) {
        handleError(res, err, 'failed to create splitFile script:');
    }
    await runGeeScript(script, res, next, 'failed to run splitFile Script');

    //     const filePath = path.join(__dirname, '../../test.png');
    //
    //     const fileSize = getFilesizeInBytes(filePath);
    //     console.log(fileSize + ' bytes');
    //     console.log(fileSize / 1024 + ' KB');
    //     console.log(fileSize / (1024 * 1024) + ' MB');
    //     console.log(fileSize / (1024 * 1024 * 1024) + ' GB');
    //     const gbPow = Math.pow(1024, 3);
    //     console.log(fileSize / gbPow + ' GB');
    //     const gb = fileSize / gbPow;
    //
    //     let result = `${gb} > 79.5 = ${gb > 79.5} GB`;
    //     if (gb > 79.5) { // 80 GB limit
    //         // split here
    //         result += ' need to split';
    //     } else {
    //         result += ' don\'t need to split';
    //     }
    //     console.log(result);
    //     const response = new UnifiedResponse(200, result);
    //     res.statusCode = response.statusCode;
    //     res.end(JSON.stringify({response}));
    // } catch (err) {
    //     const response = new UnifiedResponse(err.statusCode || 500, err.message || err, err.stack || err);
    //     res.statusCode = response.statusCode;
    //     res.end(JSON.stringify(response));
    // }
};

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
}

/**
 * Update new Imagery resource
 * Update Imagery new resource
 *
 * body ResourceData Asset data that needs to be updated to GEE
 * returns GEEResponse
 **/
exports.updateImageryResource = async function (args, res, next) {
    logger.log('info', 'updateImageryResource req : %j', args, {});
    let script;
    try {
        let resourceData = args.resourceData.value;
        script = ScriptUtils.updateImageryResource(resourceData);
    } catch (err) {
        handleError(res, err, 'failed to add Imagery Resource:');
    }
    await runGeeScript(script, res, next, 'failed to run update Imagery Resource script:');
};

async function runGeeScript(script, res, next, errorMessage) {
    try {
        const result = await SshExecCommand.executeCommand(script, res, next)
            .catch((error) => {
                throw error;
            });
        const response = new UnifiedResponse(200, result);
        res.statusCode = response.statusCode;
        res.end(JSON.stringify({response}));
    } catch (err) {
        logger.log('error', `Error ${errorMessage}, while running script ${script}, because : ${err.message}`);
        if (Helpers.isString(err)) {
            err = new Error(err);
        }
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        const response = new UnifiedResponse(err.statusCode, err.message, err.stack);
        res.statusCode = response.statusCode;
        res.end(JSON.stringify(response));
    }
}

function handleError(res, err, errorMessage) {
    logger.log('error', `Error ${errorMessage}, because : ${err.message}`);
    if (Helpers.isString(err)) {
        err = new Error(err);
    }
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    const response = new UnifiedResponse(err.statusCode, err.message, err.stack);
    res.statusCode = err.statusCode;
    res.end(JSON.stringify({response}));
}
