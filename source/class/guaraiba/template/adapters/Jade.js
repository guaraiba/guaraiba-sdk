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
 * Jade is a terse language for writing HTML templates.
 * Is a high performance template engine heavily influenced by Haml and implemented with JavaScript for NodeJS.
 *
 * Full documentation is at {@link http://jade-lang.com}
 * NodeJS module {@link https://github.com/visionmedia/jade}
 */
qx.Class.define('guaraiba.template.adapters.Jade', {
    type: 'singleton',
    extend: guaraiba.template.adapters.Common,

    construct: function () {
        this.base(arguments, 'pug');
    },

    members: {
        /**
         * Compile template written in jade code.
         *
         * @param template {String} Template write in jade code.
         * @return {Function}
         */
        compile: function (template) {
            return this._engine.compile(template);
        },

        /**
         * Render data in template.
         *
         * @param data {Object} - Data to renderer in template.
         * @param fnOrTmpl {Function|Engine}
         * @param helpers {Map} - Helpers methods.
         * @return {String}
         */
        render: function (data, fnOrTmpl, helpers) {
            // Add helpers methods to data.
            helpers.forEach(function(method, name){
                data[name] = method;
            });

            return this.base(arguments, data, fnOrTmpl)
        }
    }
});