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
 * This class offers the basic properties and features for create adapter engine for render template.
 */
qx.Class.define('guaraiba.template.adapters.Common', {
    type: 'abstract',
    extend: qx.core.Object,

    /**
     * @param engime {String}
     */
    construct: function (engime) {
        this._engine = require(engime);
    },

    members: {
        /** @type {Object} Native instance of template engine (ejs, handlebars, jade, or JasperReport). */
        _engine: null,

        /**
         * Compile template written in ejs code.
         *
         * @param template {String} - Template write in ejs code.
         * @param options {Object?}
         * @return {Function}
         */
        compile: function (template, options) {
            throw new Error("Abstract method call.");
        },

        /**
         * Render data in template.
         *
         * @param data {Object} - Data to renderer in template.
         * @param fnOrTmpl {Function|Engine}
         * @return {String}
         */
        render: function (data, fnOrTmpl) {
            return qx.lang.Type.isFunction(fnOrTmpl)
                ? fnOrTmpl(data)
                : qx.lang.Type.isFunction(this._engine.render)
                ? this._engine.render(data, fnOrTmpl)
                : this.compile(fnOrTmpl)(data);
        }
    }
});