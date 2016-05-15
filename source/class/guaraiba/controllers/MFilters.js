/**
 * Copyright ©:
 *      2015 Yoandry Pacheco Aguila
 *
 * License:
 *      LGPL-3.0: http://spdx.org/licenses/LGPL-3.0.html#licenseText
 *      EPL-1.0: http://spdx.org/licenses/EPL-1.0.html#licenseText
 *      See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *      Yoandry Pacheco Aguila < yoandrypa@gmail.com >
 *
 */

/**
 * This mixin offers the basic features for execute any method before or after execute any controller action.
 */
qx.Mixin.define('guaraiba.controllers.MFilters', {

    members: {
        /**
         * Filters list to perform before running the action.
         */
        __beforeFilters: null,

        /**
         * Filters list to perform after finishing the response.
         */
        __afterFilters: null,

        /**
         * Execute all filters of the specified action and phase.
         *
         * @param action {String} - Action in that is applied the filters.
         * @param phase {String} - Phase ('before' or 'after') in that execute the filters.
         * @param callback {Function?} Callback function to return control to actionHandler method.
         * @protected
         */
        execFilters: function (action, phase, callback) {
            var vThis = this,
                filters = this['__' + phase + 'Filters'],
                filter, index, actions = [],

                /**
                 * Create an async wrapper for sync filters.
                 *
                 * @param method {Function} Function with name or of one existent function.
                 * @return {Function}
                 */
                createWrappedFilter = function (method) {
                    return function (done) {
                        if (!vThis.getCompleted()) {
                            method.call(vThis, done);
                        } else {
                            done()
                        }
                    };
                };

            for (filter in filters) {
                index = filters[filter].actions.indexOf(action)
                if ((filters[filter].type === 'ONLY' && index > -1) || (filters[filter].type === 'EXCEPT' && index == -1)) {
                    actions.push(createWrappedFilter(filters[filter].method));
                }
            }

            guaraiba.async.series(actions, function (err) {
                // callback is null when phase is 'after'.
                callback && callback.call(vThis);
            });
        },

        /**
         * Save filter params.
         *
         * @param phase {String} ('before' or 'after')
         * @param method {String|Function} Function with name or of one existent function.
         * @param actions {Array}
         * @param type {String} ('EXCEPT' or 'ONLY')
         */
        __saveFilter: function (phase, method, actions, type) {
            var name;

            if (qx.lang.Type.isString(method)) {
                name = method;
                method = this[method];
            } else if (qx.lang.Type.isFunction(method)) {
                name = method.name;
            }

            if (!name || !method) {
                throw "Invalid value '"+name+"' for method parameter in before or after filter called. " +
                "Was expected one function or string with name of one existent method.";
            }

            phase = '__' + phase + 'Filters';

            this[phase] = this[phase] || {};
            this[phase][name] = {
                method: method,
                actions: actions,
                type: type
            }
        },

        /**
         * Set one method to be executed before all actions.
         *
         * @param method {String|Function} Function with name or of one existent function.
         */
        beforeAll: function (method) {
            this.__saveFilter('before', method, [], 'EXCEPT');
        },

        /**
         * Set one method to be executed before given actions
         *
         * @param method {String|Function} Function with name or of one existent function.
         * @param actions {Array}
         */
        beforeOnly: function (method, actions) {
            this.__saveFilter('before', method, actions, 'ONLY');
        },

        /**
         * Set one method to be executed before all actions except given actions.
         *
         * @param method {String|Function} Function with name or of one existent function.
         * @param actions {Array}
         */
        beforeExcept: function (method, actions) {
            this.__saveFilter('before', method, actions, 'EXCEPT');
        },

        /**
         * Remove one method to be executed before any actions.
         *
         * @param method {String|Function} Function with name or of one existent function.
         */
        beforeClean: function (method) {
            var name;

            if (qx.lang.Type.isString(method)) {
                name = method;
                method = this[method];
            } else if (qx.lang.Type.isFunction(method)) {
                name = method.name;
            }

            if (!name || !method) {
                throw "Invalid value for method parameter in beforeClean called. " +
                "Was expected one function or string with name of one existent function.";
            }

            this.__beforeFilters[name] = null;
            delete this.__beforeFilters[name];
        },

        /**
         * Set one method to be executed after all actions.
         *
         * @param method {String|Function} Function with name or of one existent function.
         */
        afterAll: function (method) {
            this.__saveFilter('after', method, [], 'EXCEPT');
        },

        /**
         * Set one method to be executed after given actions
         *
         * @param method {String|Function} Function with name or of one existent function.
         * @param actions {Array}
         */
        afterOnly: function (method, actions) {
            this.__saveFilter('after', method, actions, 'ONLY');
        },

        /**
         * Set one method to be executed after all actions except given actions.
         *
         * @param method {String|Function} Function with name or of one existent function.
         * @param actions {Array}
         */
        afterExcept: function (method, actions) {
            this.__saveFilter('after', method, actions, 'EXCEPT');
        },

        /**
         * Remove one method to be executed after any actions.
         *
         * @param method {String|Function} Function with name or of one existent function.
         */
        afterClean: function (method) {
            var name;

            if (qx.lang.Type.isString(method)) {
                name = method;
                method = this[method];
            } else if (qx.lang.Type.isFunction(method)) {
                name = method.name;
            }

            if (!name || !method) {
                throw "Invalid value for method parameter in afterClean called. " +
                "Was expected one function or string with name of one existent method.";
            }

            this.__afterFilters[name] = null;
            delete this.__afterFilters[name];
        }

    }
});
