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
 * Embedded JavaScript templates.
 *
 * Full documentation is at {@link http://embeddedjs.com}
 * NodeJS module {@link https://github.com/visionmedia/ejs}
 */
qx.Class.define('guaraiba.template.adapters.Ejs', {
    type: 'singleton',
    extend: guaraiba.template.adapters.Common,

    construct: function () {
        this.base(arguments, 'ejs');
    },

    members: {
        /**
         * Compile template written in ejs code.
         *
         * @param template {String} - Template write in ejs code.
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