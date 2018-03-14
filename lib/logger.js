const mdb = require('./mdb');
const chalk = require('chalk');
const hydra = require('hydra');
const Utils = hydra.getUtilsHelper();

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
    this.logToDB = options.logToDB || true;
    this.logToConsole = options.logToConsole || true;
  }

  /**
   * @name process
   * @param {object} msg - process a log message
   * @return {undefined}
   */
  process(msg) {
    let obj = Object.assign({}, msg.bdy, {
      ts: new Date().getTime() / 1000 | 0
    });
    if (this.logToConsole) {
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
      console.log(`${obj.ts} ${severity} ${obj.serviceName} | ${text}`);
    }
    if (this.logToDB) {
      let log = mdb.getCollection('log');
      if (log) {
        log.insertAsync(obj);
      }
    }
  }
}

module.exports = Logger;
