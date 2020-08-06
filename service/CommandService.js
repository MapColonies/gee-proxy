'use strict';


/**
 * execute command on google terminal
 * execute command on google terminal
 *
 * command String linux command to be executed
 * returns GEEResponse
 **/
exports.sshCommand = function(args, res, next) {
    // logger.log('info', 'addImageryResource req : %j', args, {});
    try {
        let addImageryResourceData = args.assetData.value;
        // let result = metricsService.addMetric(metric);
        res.statusCode = 200;
        // logger.log('info', 'addImageryResource results : %j ', result, {});
        res.end("Ok.");
    }
    catch(err) {
        res.statusCode = 500;
        res.end(JSON.stringify(err.message));
    }
};
