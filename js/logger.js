// Logger utility for production/debug mode
class Logger {
    constructor() {
        // Check if debug mode is enabled from config
        this.debugMode = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.debug) || false;
    }

    log(...args) {
        if (this.debugMode) {
            console.log(...args);
        }
    }

    error(...args) {
        // Always log errors
        console.error(...args);
    }

    warn(...args) {
        if (this.debugMode) {
            console.warn(...args);
        }
    }

    info(...args) {
        if (this.debugMode) {
            console.info(...args);
        }
    }

    debug(...args) {
        if (this.debugMode) {
            console.debug(...args);
        }
    }

    table(...args) {
        if (this.debugMode) {
            console.table(...args);
        }
    }

    time(label) {
        if (this.debugMode) {
            console.time(label);
        }
    }

    timeEnd(label) {
        if (this.debugMode) {
            console.timeEnd(label);
        }
    }
}

// Create global logger instance
window.logger = new Logger();