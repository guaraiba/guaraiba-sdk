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

            // Register yield helper method.
            this.registerHelper('yield', qx.lang.Function.bind(function () {
                var partial = new guaraiba.template.Partial(templatePath, data || this._data, helpers);

                this._partials.push(partial);

                return '###partial###' + partial._id;
            }, this));
        }
    }
});
