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
 * This class offers the basic properties and features to management session.
 */
qx.Class.define('guaraiba.Session', {
    extend: qx.core.Object,

    /**
     * @param request {guaraiba.Request}
     */
    construct: function (request) {
        this.__nativeSession = request.getNativeRequest().session;
    },

    members: {
        __nativeSession: null,

        /**
         * To regenerate the session simply invoke the method, once complete
         * a new SID and `Session` instance will be initialized at `req.session`.
         *
         * @param callback {function}
         */
        regenerate: function (callback) {
            this.__nativeSession.regenerate(callback)
        },

        /**
         * Reloads the session data.
         *
         * @param callback {function}
         */
        reload: function (callback) {
            this.__nativeSession.reload(callback)
        },

        /**
         * Save the session.
         *
         * @param callback {function}
         */
        save: function (callback) {
            this.__nativeSession.save(callback);
        },

        /**
         * Updates the `.maxAge` property. Typically this is
         * not necessary to call, as the session middleware does this for you.
         */
        touch: function () {
            this.__nativeSession.touch();
        },

        /**
         * Destroys the session, removing `req.session`, will be re-generated next request.
         *
         * @param callback {function}
         */
        destroy: function (callback) {
            this.__nativeSession.destroy(callback);
        },

        /**
         *  Get cookie object.
         *
         * @return {object}
         */
        getCookies: function () {
            return this.__nativeSession.cookie;
        },

        /**
         * Get cookie time remaining in milliseconds
         *
         * @return {number}
         */
        getMaxAge: function () {
            return this.__nativeSession.cookie.maxAge;
        },

        /**
         * Get cookie expires date.
         *
         * @return {Date}
         */
        getExpires: function () {
            return this.__nativeSession.cookie.expires;
        },

        /**
         * Set cookie max age
         *
         * @param milliseconds {Integer} for cookie max age
         */
        setMaxAge: function (milliseconds) {
            this.__nativeSession.cookie.maxAge = milliseconds;
            this.__nativeSession.cookie.expires = new Date(Date.now() + milliseconds)
        },

        /**
         * Get current user profile.
         */
        getProfile: function () {
            var profile = this.get('profile');

            if (!profile) {
                profile = {}
                this.set('profile', profile);
            }

            return profile
        },

        /**
         * Get session attribute value.
         *
         * @param key {String}
         * @return {Any}
         */
        get: function (key) {
            return this.__nativeSession[key];
        },

        /**
         * Defined an initialize session attribute.
         *
         * @param key {String}
         * @param value {}
         */
        set: function (key, value) {
            this.__nativeSession[key] = value;
        },

        /**
         * Delete session attribute.
         *
         * @param key {String}
         * @return {Any}
         */
        unset: function (key) {
            var value = this.__nativeSession[key];
            delete this.__nativeSession[key];
            return value;
        }

    }
});