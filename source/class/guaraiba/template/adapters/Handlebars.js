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
 * Handlebars.js is an extension to the Mustache templating language created by Chris Wanstrath.
 *
 * Handlebars.js and Mustache are both logicless templating languages that keep the view and the
 * code separated like we all know they should be.
 *
 * Full documentation is at {@link http://handlebarsjs.com/}
 * NodeJS module {@link https://github.com/wycats/handlebars.js}
 */
qx.Class.define('guaraiba.template.adapters.Handlebars', {
    type: 'singleton',
    extend: guaraiba.template.adapters.Common,

    construct: function () {
        this.base(arguments, 'handlebars');
    },

    members: {
        /**
         * Compile template written in Handlebars or Mustache code.
         *
         * @param template {String} - Template write in Handlebars or Mustache code.
         * @param options {Object?}
         * @return {Function}
         */
        compile: function (template, options) {
            return this._engine.compile(template, options);
        },

        /**
         * Render data in template.
         *
         * @param data {Object} - Data to renderer in template.
         * @param fnOrTmpl {Function|Engine}
         * @return {String}
         */
        render: function (data, fnOrTmpl) {
            var helpers = data.helpers || {},
                wrapHelper = function (helper) {
                    return function (options) {
                        return helper.call(this, options.fn ? options.fn(this) : null);
                    }
                };

            for (var name in helpers) {
                this._engine.registerHelper(name, wrapHelper(helpers[name]));
            }

            return this.base(arguments, data, fnOrTmpl)
        }
    }
});