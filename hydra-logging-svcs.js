/**
* @name HLS Service
* @summary User Hydra service entry point
* @description Hydra Logging Service
*/
const url = require('url');
const http = require('http');
const hydra = require('hydra');
const ServerResponse = hydra.getServerResponseHelper();
let serverResponse = new ServerResponse();
const Logger = require('./lib/logger');

/**
 * @name main
 * @description Load configuration file and initialize hydra app
 * @return {undefined}
 */
let main = async () => {
  try {
    let config = await hydra.init(`${__dirname}/config/config.json`, false);
    let serviceInfo = await hydra.registerService();

    let logEntry = `Starting service ${serviceInfo.serviceName}:${hydra.getInstanceVersion()} on ${serviceInfo.serviceIP}:${serviceInfo.servicePort}`;
    console.log(logEntry);

    let server = http.createServer((req, res) => {
      let urlData = url.parse(req.url);
      if (urlData.path === '/v1/hls/health') {
        let healthInfo = hydra.getHealth();
        serverResponse.sendOk(res, {
          result: healthInfo
        });
      } else {
        serverResponse.sendNotFound(res, {
        });
      }
    });
    server.listen(serviceInfo.servicePort);

    await hydra.registerRoutes([
      '[get]/v1/hls/health'
    ]);

    let logger = new Logger();
    logger.init(config.logger);
    logger.process({
      bdy: {
        serviceName: serviceInfo.serviceName,
        serviceVersion: hydra.getInstanceVersion(),
        instanceID: hydra.getInstanceID(),
        severity: 'info',
        bdy: logEntry
      }
    });
    hydra.on('message', (msg) => {
      logger.process(msg);
    });
  } catch (err) {
    console.log('err', err);
    process.exit(1);
  }
};

main();
