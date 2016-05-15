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