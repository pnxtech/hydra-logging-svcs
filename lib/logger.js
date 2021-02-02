const chalk = require('chalk');
const hydra = require('hydra');
const Utils = hydra.getUtilsHelper();
const bunyan = require('bunyan');

/**
 * @name Logger
 * @description distributed logger module
 */
class Logger {
  /**
   * @name init
   * @description initialize logger
   * @param {object} options object
   * @return {undefined}
   */
  init(options) {
    this.logToFile = false;
    if (options.logToFile || options.logToDB) {
      this.logToFile = true;
    }
    this.useGCPBunyanLogger = options.useGCPBunyanLogger || false;
    this.logToDB = options.logToDB || true;
    this.logToConsole = options.logToConsole || true;

    if (this.useGCPBunyanLogger) {
      // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
      const {LoggingBunyan} = require('@google-cloud/logging-bunyan');
      const loggingBunyan = new LoggingBunyan({
        'projectId': options.GCPProjectId,
        'keyFilename': options.GCPCredentialsKeyPath
      });
      let updatedConfig = {
        name: options.config.name,
        streams: [
          {
            stream: process.stdout,
            level: options.config.streams.level
          },
          loggingBunyan.stream(options.config.streams.level)
        ]
      };
      this.log = bunyan.createLogger(updatedConfig);
    } else {
      this.log = bunyan.createLogger(options.config);
    }
  }

  /**
   * @name process
   * @param {object} msg - process a log message
   * @return {undefined}
   */
  process(msg) {
    let ts = new Date().getTime() / 1000 | 0;
    let obj = Object.assign({}, msg.bdy, {
      ts,
      date: new Date(ts * 1000).toLocaleString()
    });

    let severity = '';
    switch (obj.severity) {
      case 'info':
        severity = `${chalk.cyan(obj.severity.toUpperCase())}`;
        break;
      case 'error':
        severity = `${chalk.red(obj.severity.toUpperCase())}`;
        break;
      case 'fatal':
        severity = `${chalk.white.bgRed(obj.severity.toUpperCase())}`;
        break;
      default:
        if ('severity' in obj) {
          severity = `${chalk.white.underline(obj.severity.toUpperCase())}`;
        } else {
          severity = 'unknown';
        }
        break;
    }

    if (this.logToConsole) {
      let text = (typeof msg.bdy.body === 'string') ? msg.bdy.body : Utils.safeJSONStringify(msg.bdy.body);
      console.log(`${obj.ts} ${severity} ${obj.serviceName} | ${text}`);
    }
    if (this.logToDB || this.logToFile) {
      let objBody = {};
      objBody['serviceName'] = msg.bdy['serviceName'];
      objBody['serviceVersion'] = msg.bdy['serviceVersion'];
      objBody['instanceID'] = msg.bdy['instanceID'];
      if (typeof msg.bdy.body === 'string') {
        objBody['message'] = msg.bdy['body'];
      } else {
        if ('body' in msg) {
          if ('message' in msg.body) {
            objBody['message'] = msg.body.message;
          } else {
            objBody['message'] = msg.body.message;
            objBody['body'] = msg.bdy['body'];
          }
        } else {
          objBody['message'] = 'json';
          if ('body' in msg.bdy) {
            objBody['body'] = msg.bdy.body;
          } else {
            objBody['body'] = msg.bdy;
          }
        }
      }
      this.log[obj.severity](objBody);
    }
  }
}

module.exports = Logger;
