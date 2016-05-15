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
 * This interface offers the basic properties and features to configure guaraiba application.
 *
 * @require(guaraiba.Passport)
 * @ignore(__dirname)
 */
qx.Interface.define("guaraiba.IConfiguration", {

    members: {
        /**
         * Initialise the configuration.
         * This method is caller immediately after constructor execute.
         */
        init: function () {}
    }
});