/**
 * Copyright ©:
 *      2015 Yoandry Pacheco Aguila
 *
 * License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *      See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *      Yoandry Pacheco Aguila < yoandrypa@gmail.com >
 *
 */

/**
 * Log appender for qooxdoo applications running in Node.js. Writes log
 * messages to STDOUT/STDERR.
 *
 * @ignore(process)
 */

qx.Class.define("guaraiba.Console", {

    statics: {
        /**
         * process.stdout
         */
        __OUT: null,
        /**
         * process.stderr
         */
        __ERR: null,

        /**
         * Writes a message to the shell. Errors will be sent to STDERR, everything
         * else goes to STDOUT
         *
         * @param logMessage {String} Message to be logged
         * @param level {String} Log level. One of "debug", "info", "warn", "error"
         */
        log: function (logMessage, level) {
            var dateFormat = new qx.util.format.DateFormat('yyyy-MM-dd HH:mm:ss'),
                formatLevel = "[" + level.toUpperCase() + "]\t",
                formatDate = "[" + dateFormat.format(new Date()) + "]\t";

            level = level || 'debug';
            if (qx.lang.Type.isArray(logMessage) || qx.lang.Type.isObject(logMessage)) {
                logMessage = guaraiba.prettyData.json(logMessage);
            }

            logMessage = formatLevel + formatDate + String(logMessage)

            if (level == "error") {
                this.__ERR.write(logMessage + '\n');
            } else {
                this.__OUT.write(logMessage + '\n');
            }
        },

        /**
         * Logs a debug message
         *
         * @param logMessage {String} Message to be logged
         */
        debug: function (logMessage) {
            this.log(logMessage, "debug");
        },

        /**
         * Logs an info message
         *
         * @param logMessage {String} Message to be logged
         */
        info: function (logMessage) {
            this.log(logMessage, "info");
        },

        /**
         * Logs a warning message
         *
         * @param logMessage {String} Message to be logged
         */
        warn: function (logMessage) {
            this.log(logMessage, "warn");
        },

        /**
         * Logs an error message
         *
         * @param logMessage {String} Message to be logged
         */
        error: function (logMessage) {
            this.log(logMessage, "error");
        },

        /**
         * Process a log entry object from qooxdoo's logging system.
         *
         * @param entry {Map} Log entry object
         */
        process: function (entry) {
            var level = entry.level || "info";
            for (var prop in entry) {
                if (prop == "items") {
                    var items = entry[prop];
                    for (var p = 0; p < items.length; p++) {
                        this[level](items[p].text);
                        if (level == 'error') {
                            this[level](items[p].trace);
                        }
                    }
                }
            }
        }
    },

    /**
     * @ignore(process.*)
     */
    defer: function (statics) {
        if (typeof process != 'undefined') {
            statics.__OUT = process.stdout;
            statics.__ERR = process.stderr;
        }
    }

});