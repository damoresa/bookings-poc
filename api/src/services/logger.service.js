const moment = require('moment');
const stacktrace = require('stack-trace');
const winston = require('winston');

// Configure the logger appenders and level
// FIXME: Be careful of the winston v3 changes
winston.level = process.env.LOGLEVEL || 'debug';

class Logger {
    constructor() {
        this.debug.bind(this);
        this.error.bind(this);
        this.info.bind(this);
        this._getStackTrace.bind(this);
    }

    debug(message) {
        winston.debug(this._getStackTrace(message));
    }

    error(message) {
        winston.error(this._getStackTrace(message));
    }

    info(message) {
        winston.info(this._getStackTrace(message));
    }

    _getStackTrace(message) {
        const traces = stacktrace.get();

        const fileName = traces[2].getFileName();
        const fnName = traces[2].getFunctionName();
        const lineNumber = traces[2].getLineNumber();
        const columnNumber = traces[2].getColumnNumber();

        return `[${moment().format('DD/MM/YYYY HH:mm:ss')}][${fileName}][${fnName} - ${lineNumber}:${columnNumber}] ${message}`;
    }
}

module.exports = new Logger();