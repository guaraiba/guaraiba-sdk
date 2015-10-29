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
     * @param layoutPath {String} - Path to layout template file.
     * @param templatePath {String} - Path to template file.
     * @param data {Map} - Data to renderer in template.
     */
    construct: function (layoutPath, templatePath, data) {
        var vThis = this;

        if (!layoutPath) {
            this.base(arguments, templatePath, data);
        } else {
            this.base(arguments, layoutPath, data);

            // `render` is just a special case of `partial` using the template-path
            // that the layout wraps -- just hard-code the path and pass along
            // the same data
            this._data.yield = function () {
                return vThis._data.partial(templatePath, data);
            };
        }
    }
});
