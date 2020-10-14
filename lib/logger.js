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
    this.logToDB = options.logToDB || true;
    this.logToConsole = options.logToConsole || true;
    this.log = bunyan.createLogger(options.config);
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

    let text = (typeof msg.bdy.body === 'string') ? msg.bdy.body : Utils.safeJSONStringify(msg.bdy.body);
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
        severity = `${chalk.white.underline(obj.severity.toUpperCase())}`;
        break;
    }

    if (this.logToConsole) {
      console.log(`${obj.ts} ${severity} ${obj.serviceName} | ${text}`);
    }
    if (this.logToDB || this.logToFile) {
      this.log[obj.severity](text);
    }
  }
}

module.exports = Logger;
