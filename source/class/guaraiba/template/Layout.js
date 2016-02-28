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
 * This class offers the basic properties and features to process layout template.
 */
qx.Class.define('guaraiba.template.Layout', {
    extend: guaraiba.template.Partial,

    /**
     * Constructor.
     *
     * @param layoutPath {String} - Path to layout template file.
     * @param templatePath {String} - Path to template file.
     * @param data {Object} - Data to renderer in template.
     * @param helpers {Map} - Helpers methods.
     */
    construct: function (layoutPath, templatePath, data, helpers) {
        if (!layoutPath) {
            this.base(arguments, templatePath, data, helpers);
        } else {
            this.base(arguments, layoutPath, data, helpers);

            // Add yield helper method.
            this._helpers.set('yield', qx.lang.Function.bind(function () {
                var partial = new guaraiba.template.Partial(templatePath, data || this._data, helpers);

                this._partials.push(partial);

                return '###partial###' + partial._id;
            }, this));
        }
    }
});
