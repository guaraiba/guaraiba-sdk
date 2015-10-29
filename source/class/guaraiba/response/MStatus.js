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
 * This mixin offers the basic properties and features to process any error responds.
 */
qx.Mixin.define('guaraiba.response.MStatus', {
    statics: {
        /** List of http status codes.
         * <pre>
         * 100: 'Continue'
         * 101: 'Switching Protocols'
         * 102: 'Processing'
         * 200: 'OK'
         * 201: 'Created'
         * 202: 'Accepted'
         * 203: 'Non-Authoritative Information'
         * 204: 'No Content'
         * 205: 'Reset Content'
         * 206: 'Partial Content'
         * 207: 'Multi-Status'
         * 208: 'Already Reported'
         * 226: 'IM Used'
         * </pre>
         * <pre>
         * 300: 'Multiple Choices'
         * 301: 'Moved Permanently'
         * 302: 'Found'
         * 303: 'See Other'
         * 304: 'Not Modified'
         * 305: 'Use Proxy'
         * 306: 'Reserved'
         * 307: 'Temporary Redirect'
         * 308: 'Permanent Redirect'
         * </pre>
         * <pre>
         * 400: 'Bad Request'
         * 401: 'Unauthorized'
         * 402: 'Payment Required'
         * 403: 'Forbidden'
         * 404: 'Not Found'
         * 405: 'Method Not Allowed'
         * 406: 'Not Acceptable'
         * 407: 'Proxy Authentication Required'
         * 408: 'Request Timeout'
         * 409: 'Conflict'
         * 410: 'Gone'
         * 411: 'Length Required'
         * 412: 'Precondition Failed'
         * 413: 'Request Entity Too Large'
         * 414: 'Request-URI Too Long'
         * 415: 'Unsupported Media Type'
         * 416: 'Requested Range Not Satisfiable'
         * 417: 'Expectation Failed'
         * 422: 'Unprocessable Entity'
         * 423: 'Locked'
         * 424: 'Failed Dependency'
         * 425: 'Reserved for WebDAV advanced collections expired proposal'
         * 426: 'Upgrade Required'
         * 428: 'Precondition Required'
         * 429: 'Too Many Requests'
         * 431: 'Request Header Fields Too Large'
         * 440: 'Invalid user or password'
         * </pre>
         * <pre>
         * 500: 'Internal Server Error'
         * 501: 'Not Implemented'
         * 502: 'Bad Gateway'
         * 503: 'Service Unavailable'
         * 504: 'Gateway Timeout'
         * 505: 'HTTP Version Not Supported'
         * 506: 'Variant Also Negotiates'
         * 507: 'Insufficient Storage'
         * 508: 'Loop Detected'
         * 510: 'Not Extended'
         * 511: 'Network Authentication Required'
         * </pre>
         */
        HTTP_STATUS_CODES: {
            100: 'Continue',
            101: 'Switching Protocols',
            102: 'Processing',
            200: 'OK',
            201: 'Created',
            202: 'Accepted',
            203: 'Non-Authoritative Information',
            204: 'No Content',
            205: 'Reset Content',
            206: 'Partial Content',
            207: 'Multi-Status',
            208: 'Already Reported',
            226: 'IM Used',

            300: 'Multiple Choices',
            301: 'Moved Permanently',
            302: 'Found',
            303: 'See Other',
            304: 'Not Modified',
            305: 'Use Proxy',
            306: 'Reserved',
            307: 'Temporary Redirect',
            308: 'Permanent Redirect',

            400: 'Bad Request',
            401: 'Unauthorized',
            402: 'Payment Required',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            406: 'Not Acceptable',
            407: 'Proxy Authentication Required',
            408: 'Request Timeout',
            409: 'Conflict',
            410: 'Gone',
            411: 'Length Required',
            412: 'Precondition Failed',
            413: 'Request Entity Too Large',
            414: 'Request-URI Too Long',
            415: 'Unsupported Media Type',
            416: 'Requested Range Not Satisfiable',
            417: 'Expectation Failed',
            422: 'Unprocessable Entity',
            423: 'Locked',
            424: 'Failed Dependency',
            425: 'Reserved for WebDAV advanced collections expired proposal',
            426: 'Upgrade Required',
            428: 'Precondition Required',
            429: 'Too Many Requests',
            431: 'Request Header Fields Too Large',
            440: 'Invalid user or password',

            500: 'Internal Server Error',
            501: 'Not Implemented',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
            504: 'Gateway Timeout',
            505: 'HTTP Version Not Supported',
            506: 'Variant Also Negotiates',
            507: 'Insufficient Storage',
            508: 'Loop Detected',
            510: 'Not Extended',
            511: 'Network Authentication Required'
        },

        /**
         * Returns the message text for the given http status code.
         *
         * @param statusCode {Integer} http status code.
         * @return {String|null}
         * @see guaraiba.response.MStatus#HTTP_STATUS_CODES
         */
        HttpStatus: function (statusCode) {
            return guaraiba.response.MStatus.HTTP_STATUS_CODES[statusCode]
        }
    },

    members: {
        /**
         * Respond to a request with an appropriate HTTP error-code or status.
         * If a status-code is set on the error object, uses that as the error's
         * status-code. Otherwise, responds with a 500 for the status-code.
         *
         * @param err {String|Error|Object|Map?} The error to use as the basis for the response.
         * @param format {String?} Format of response.
         * @return {boolean}
         */
        respondError: function (err, format) {
            if (err) {
                var message = err.message || String(err);

                if (err instanceof Error) {
                    qx.log.Logger.error(err.stack);
                    err = {
                        type: err.name,
                        message: err.message,
                        stack: err.stack,
                        code: err.code
                    }
                } else {
                    qx.log.Logger.error(err.message || message);
                }

                this.respond({ message: message, error: err }, { statusCode: 500, format: format });

                return true;
            }

            return false;
        },

        /**
         * Send specific http response error with 'Continue' status.
         *
         * Response with StatusCode = 100.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusContinue: function (data) {
            return this.respondWithStatus(100, data);
        },

        /**
         * Send specific http response error with 'Switching protocols' status.
         *
         * Response with StatusCode = 101.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusSwitchingProtocols: function (data) {
            return this.respondWithStatus(101, data);
        },

        /**
         * Send specific http response error with 'Processing' status.
         *
         * Response with StatusCode = 102.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusProcessing: function (data) {
            return this.respondWithStatus(102, data);
        },

        /**
         * Send specific http response error with 'Ok' status.
         *
         * Response with StatusCode = 200.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusOK: function (data) {
            return this.respondWithStatus(200, data);
        },

        /**
         * Send specific http response error with 'Create' status.
         *
         * Response with StatusCode = 201.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusCreated: function (data) {
            return this.respondWithStatus(201, data);
        },

        /**
         * Send specific http response error with 'Accepted' status.
         *
         * Response with StatusCode = 202.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusAccepted: function (data) {
            return this.respondWithStatus(202, data);
        },

        /**
         * Send specific http response error with 'Non authoritative information' status.
         *
         * Response with StatusCode = 203.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusNonAuthoritativeInformation: function (data) {
            return this.respondWithStatus(203, data);
        },

        /**
         * Send specific http response error with 'No content' status.
         *
         * Response with StatusCode = 204.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusNoContent: function (data) {
            return this.respondWithStatus(204, data);
        },

        /**
         * Send specific http response error with 'Reset content' status.
         *
         * Response with StatusCode = 205.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusResetContent: function (data) {
            return this.respondWithStatus(205, data);
        },

        /**
         * Send specific http response error with 'Partial content' status.
         *
         * Response with StatusCode = 206.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusPartialContent: function (data) {
            return this.respondWithStatus(206, data);
        },

        /**
         * Send specific http response error with 'Multiple choices' status.
         *
         * Response with StatusCode = 300.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusMultipleChoices: function (data) {
            return this.respondWithStatus(300, data);
        },

        /**
         * Send specific http response error with 'Found' status.
         *
         * Response with StatusCode = 302.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusFound: function (data) {
            return this.respondWithStatus(302, data);
        },

        /**
         * Send specific http response error with 'See other' status.
         *
         * Response with StatusCode = 303.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusSeeOther: function (data) {
            return this.respondWithStatus(303, data);
        },

        /**
         * Send specific http response error with 'Not modified' status.
         *
         * Response with StatusCode = 304.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusNotModified: function (data) {
            return this.respondWithStatus(304, data);
        },

        /**
         * Send specific http response error with 'Bad request' status.
         *
         * Response with StatusCode = 400.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusBadRequest: function (data) {
            return this.respondWithStatus(400, data);
        },

        /**
         * Send specific http response error with 'Unauthorized' status.
         *
         * Response with StatusCode = 401.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusUnauthorized: function (data) {
            return this.respondWithStatus(401, data);
        },

        /**
         * Send specific http response error with 'Forbidden' status.
         *
         * Response with StatusCode = 403.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respordWithStatusForbidden: function (data) {
            return this.respondWithStatus(403, data);
        },

        /**
         * Send specific http response error with 'Not found' status.
         *
         * Response with StatusCode = 404.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respordWithStatusNotFound: function (data) {
            return this.respondWithStatus(404, data);
        },

        /**
         * Send specific http response error with 'Method not allowed' status.
         *
         * Response with StatusCode = 405.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusMethodNotAllowed: function (data) {
            return this.respondWithStatus(405, data);
        },

        /**
         * Send specific http response error with 'Not acceptable' status.
         *
         * Response with StatusCode = 406.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusNotAcceptable: function (data) {
            return this.respondWithStatus(406, data);
        },

        /**
         * Send specific http response error with 'Proxy authentication required' status.
         *
         * Response with StatusCode = 407.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusProxyAuthenticationRequired: function (data) {
            return this.respondWithStatus(407, data);
        },

        /**
         * Send specific http response error with 'Request timeout' status.
         *
         * Response with StatusCode = 408.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusRequestTimeout: function (data) {
            return this.respondWithStatus(408, data);
        },

        /**
         * Send specific http response error with 'Conflict' status.
         *
         * Response with StatusCode = 409.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusConflict: function (data) {
            return this.respondWithStatus(409, data);
        },

        /**
         * Send specific http response error with 'Precondition failed' status.
         *
         * Response with StatusCode = 412.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusPreconditionFailed: function (data) {
            return this.respondWithStatus(412, data);
        },

        /**
         * Send specific http response error with 'Request entity too large' status.
         *
         * Response with StatusCode = 413.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusRequestEntityTooLarge: function (data) {
            return this.respondWithStatus(413, data);
        },

        /**
         * Send specific http response error with 'Request URI too long' status.
         *
         * Response with StatusCode = 414.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusRequestURITooLong: function (data) {
            return this.respondWithStatus(414, data);
        },

        /**
         * Send specific http response error with 'Unsupported media type' status.
         *
         * Response with StatusCode = 415.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusUnsupportedMediaType: function (data) {
            return this.respondWithStatus(415, data);
        },

        /**
         * Send specific http response error with 'Requested range not satisfiable' status.
         *
         * Response with StatusCode = 416.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusRequestedRangeNotSatisfiable: function (data) {
            return this.respondWithStatus(416, data);
        },

        /**
         * Send specific http response error with 'Unprocessable entity' status.
         *
         * Response with StatusCode = 422.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusUnprocessableEntity: function (data) {
            return this.respondWithStatus(422, data);
        },

        /**
         * Send specific http response error with 'Locked' status.
         *
         * Response with StatusCode = 423.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusLocked: function (data) {
            return this.respondWithStatus(423, data);
        },

        /**
         * Send specific http response error with 'Failed dependency' status.
         *
         * Response with StatusCode = 424.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusFailedDependency: function (data) {
            return this.respondWithStatus(424, data);
        },

        /**
         * Send specific http response error with 'Upgrade required' status.
         *
         * Response with StatusCode = 426.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusUpgradeRequired: function (data) {
            return this.respondWithStatus(426, data);
        },

        /**
         * Send specific http response error with 'Precondition required' status.
         *
         * Response with StatusCode = 428.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusPreconditionRequired: function (data) {
            return this.respondWithStatus(428, data);
        },

        /**
         * Send specific http response error with 'Too many requests' status.
         *
         * Response with StatusCode = 429.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusTooManyRequests: function (data) {
            return this.respondWithStatus(429, data);
        },

        /**
         * Send specific http response error with 'Header fields too large' status.
         *
         * Response with StatusCode = 431.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusRequestHeaderFieldsTooLarge: function (data) {
            return this.respondWithStatus(431, data);
        },

        /**
         * Send specific http response error with 'Invalid user or password' status.
         *
         * Response with StatusCode = 440.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusInvalidUserOrPassword: function (data) {
            return this.respondWithStatus(440, data);
        },

        /**
         * Send specific http response error with 'Internal server error' status.
         *
         * Response with StatusCode = 500.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusInternalServerError: function (data) {
            return this.respondWithStatus(500, data);
        },

        /**
         * Send specific http response error with 'Not implemented' status.
         *
         * Response with StatusCode = 501.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusNotImplemented: function (data) {
            return this.respondWithStatus(501, data);
        },

        /**
         * Send specific http response error with 'Service unavailable' status.
         *
         * Response with StatusCode = 503.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusServiceUnavailable: function (data) {
            return this.respondWithStatus(503, data);
        },

        /**
         * Send specific http response error with 'Insufficient storage' status.
         *
         * Response with StatusCode = 507.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusInsufficientStorage: function (data) {
            return this.respondWithStatus(507, data);
        },

        /**
         * Send specific http response error with 'Loop detected' status.
         *
         * Response with StatusCode = 508.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusLoopDetected: function (data) {
            return this.respondWithStatus(508, data);
        },

        /**
         * Send specific http response error with 'network authentication required' status.
         *
         * Response with StatusCode = 511.
         *
         * @param data {String|Error|Map?} Data sent into response.
         * @return {boolean}
         */
        respondWithStatusNetworkAuthenticationRequired: function (data) {
            return this.respondWithStatus(511, data);
        },

        /**
         * Send specific http response error with 'network authentication required' status.
         *
         * @param statusCode {Integer} http status code.
         * @param data {String|Error|Map?} Data sent into response.
         * @param format {String?} Format of response.
         * @return {boolean}
         * @see guaraiba.response.MStatus#HTTP_STATUS_CODES
         */
        respondWithStatus: function (statusCode, data, format) {
            return this.respond(data, { statusCode: statusCode, format: format });
        }
    }
});
