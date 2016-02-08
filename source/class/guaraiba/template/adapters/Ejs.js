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
        }
    }
});