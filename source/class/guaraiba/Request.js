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
 * This class offers the basic features for create http requests.
 */
qx.Class.define('guaraiba.Request', {
    extend: qx.core.Object,

    /**
     * @param nativeRequest {NodeJS.http.ServerRequest} Native request object from NodeJS.
     * @param app {guaraiba.Application} Reference to application instance.
     */
    construct: function (nativeRequest, app) {
        // Set original request reference
        this.setNativeRequest(nativeRequest);
        // Set application reference
        this.setApplication(app);
    },

    properties: {
        /** Reference to application instance. */
        application: {
            check: 'guaraiba.Application'
        },

        /** @type {NodeJS.http.ServerRequest} Reference to native request object from NodeJS. */
        nativeRequest: {
            apply: '__applyNativeRequest'
        }
    },

    members: {
        /** @type {quaraiba.Session} Instance of the active session. */
        __session: null,

        /** @type {utils.EventBuffer} Instance of utils.EventBuffer module of NodeJS . */
        __buffer: null,

        /**
         * Init session and buffer instances from native request object.
         *
         * @param value {NodeJS.http.ServerRequest} Native request object from NodeJS.
         * @internal
         */
        __applyNativeRequest: function (value) {
            // Set up session.
            this.__session = new guaraiba.Session(this);
            // Set up buffering
            this.__buffer = new guaraiba.utils.EventBuffer(value);
        },

        /**
         * Get value of given property.
         * If the current object not contains the given property, then is get from native request object.
         *
         * @param property {String} Property name.
         * @return {var}
         */
        get: function (property) {
            if (qx.Class.hasProperty(this.constructor, property)) {
                return this.base(arguments, property);
            }

            return this.getNativeRequest()[property];
        },

        /**
         * Get the normalized url of the request.
         *
         * @return {String}
         */
        getUrl: function () {
            return this.normalizeUrl(this.get('url'));
        },

        /**
         * Get headers of the request.
         * <pre>
         * {
         *      host: '127.0.0.1:3002',
         *      user-agent: 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:40.0) Gecko/20100101 Firefox/40.0',
         *      accept: 'text/html,application/xhtml+xml,application/xml',
         *      accept-language: 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
         *      accept-encoding: 'gzip, deflate',
         *      cookie: 'guaraiba=....',
         *      connection: 'keep-alive',
         *      cache-control: 'max-age=0',
         *      ...
         * }
         * </pre>
         * @return {Map}
         */
        getHeaders: function () {
            return this.get('headers');
        },

        /**
         * Get parameters from URL of the request.
         *
         * @return {Map}
         */
        getUrlParams: function () {
            return guaraiba.url.parse(this.getUrl(), true).query;
        },

        /**
         * Get the parameters generated by the router of requests.
         *
         * @return {Map}
         */
        getRouterParams: function () {
            return guaraiba.router.first(this.getUrl(), this.getMethod());
        },

        /**
         * Get all request paramenters.
         * If there is coincidence in the name of some parameter then:
         * - The router parameters overwrite the body request parameters.
         * - The URL parameters overwrite any other parameters.
         *
         * @return {Map}.
         */
        getParams: function () {
            var params = this.getMethod() != 'GET' ? this.get('body') : {};

            guaraiba.utils.mixin(params, this.getRouterParams());
            guaraiba.utils.mixin(params, this.getUrlParams());

            if (!params && this.getMethod() === 'OPTIONS') {
                params = guaraiba.router.first(this.getUrl(), this.getNativeRequest().headers['access-control-request-method']);
            }

            if (params.items && params.itemsIsJsonEncode_) {
                params.items = this.parseJson(params.items);
            }

            return params;
        },

        /**
         * Get request method (GET, POST, PUT, DELETE, etc).
         * The parameter "_method" or header "x-http-method-override" overwrites the original value.
         *
         * @return {String}
         */
        getMethod: function () {
            return this.get('method').toUpperCase();
        },

        /**
         * Get active session instance.
         *
         * @return {guaraiba.Session}
         */
        getSession: function () {
            return this.__session;
        },

        /**
         * Flush the buffer and continue piping new events to the outlet.
         */
        sync: function () {
            this.__buffer.sync(this);
        },

        /**
         * Normalize a URL removed slashes "/" unnecessary.
         *
         * @param url {String?} URL to normalize.
         * @return {String} Normalized URL.
         */
        normalizeUrl: function (url) {
            // Sanitize URL; reduce multiple slashes to single slash
            url = url.replace(/\/{2,}/g, '/');
            // Strip trailing slash for the purpose of looking for a matching
            // route (will still check for directory + index on statics)
            // Don't strip if the entire path is just '/'
            url = url.replace(/(.+)\/$/, '$1');

            return url;
        },

        /**
         * Decode a string in JSON format restoring the date objects.
         *
         * @param str {String} String in JSON format.
         * @return {Map}
         */
        parseJson: function (str) {
            return qx.lang.Json.parse(str, function (key, value) {
                if (typeof value === 'string') {
                    var d = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (d) {
                        return new Date(Date.UTC(+d[1], +d[2] - 1, +d[3], +d[4], +d[5], +d[6]));
                    }

                    if (value === '#NULL#') {
                        return null
                    }
                }

                return value;
            });
        }
    }
});
