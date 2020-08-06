'use strict';
const { Probe } = require('@map-colonies/mc-probe');
const app = require('connect')();
const http = require('http');
const serviceName = require('./package.json').name;
const url = require('url');
const morgan = require('morgan');
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const config = require('config');
const swaggerConfig = config.get('swagger');
const serverConfig = config.get('server');
const serverPort = serverConfig ? serverConfig.port : 3066;
const logger = require('./logger-config');
const serveStatic = require('serve-static');

const probe = new Probe(logger, {});

// swaggerRouter configuration
const options = {
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false, // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
const spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

//const parsedURL = url.parse("http://localhost:8080/api/v1/proxy/namespaces/default/services/");
const parsedURL = url.parse(swaggerConfig.host);
swaggerDoc.host = parsedURL.host || swaggerDoc.host;
parsedURL.path = parsedURL.path || `/`;
swaggerDoc.basePath = parsedURL.path + serviceName + swaggerDoc.basePath;

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    app.use(morgan('combined', {
        stream: {
            write: (msg) => {
                logger.log('info', msg)
            }
        }
    }));


    app.use(serveStatic('./docs'));

    //jsonBodyParser = middleware.bp.json({limit: '100mb'});
    // Validate Swagger requests
    //app.use(middleware.swaggerValidator());

    // CORS!!!! :) And OPTIONS handler
    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, UseCamelCase, x-clientid");
        if (req.method == 'OPTIONS') {
            res.statusCode = 200;
            res.end();
        }
        else
            next();
    });

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi({
        apiDocs: parsedURL.path + serviceName + "/api-docs",
        swaggerUi: '/docs'
    }));

    // Start the server
    probe.start(app, serverPort).then(() => {
        logger.log('info', `Your server is listening on port ${serverPort} http://${swaggerDoc.host}`);
        logger.log('info', `Swagger-ui is available on http://${swaggerDoc.host}/docs`);
        // logger.log('info', `Swagger-ui is available on http://${swaggerDoc.host}/${serviceName}/docs`);
    }).catch(err => {
        logger.log('error', `Cannot start server ${err}`);
    });

});

//init must done without errors in order to be readiness
(() => {
    try {
        probe.readyFlag = true;
    } catch (err) {
        probe.readyFlag = false;
        probe.liveFlag = false;
        probe.addError(err);
    }
})();
