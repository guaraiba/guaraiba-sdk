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
 * Mustache is a logic-less template syntax.
 * It can be used for HTML, config files, source code - anything.
 * It works by expanding tags in a template using values provided in a hash or object.
 *
 * Full documentation is at {@link http://http://mustache.github.io}
 * NodeJS module {@link https://github.com/janl/mustache.js}
 */
qx.Class.define('guaraiba.template.adapters.Mustache', {
    type: 'singleton',
    extend: guaraiba.template.adapters.Common,

    construct: function () {
        this.base(arguments, 'mustache');
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
            var vThis = this;

            // Speeds up future uses. (Optional)
            this._engine.parse(template);

            return function (data) {
                return vThis._engine.render(template, data);
            }
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
                    return function () {
                        return function (text, render) {
                            return helper.call(this, render(text));
                        }
                    }
                };

            for (var name in helpers) {
                data[name] = wrapHelper(helpers[name]);
            }

            return this.base(arguments, data, fnOrTmpl)
        }
    }
});