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
 * This interface offers the basic properties and features to implement User record class.
 */
qx.Interface.define('guaraiba.orm.IUser', {

    members: {
        /**
         * Returns true/false depending on whether the user credentials are expired.
         */
        isExpired: function () {},

        /**
         * Returns true/false depending on whether the user credentials are valid.
         *
         * @param username {String}
         * @param password {String}
         * @return {Boolean}
         */
        isValidCredential: function (username, password) {}
    }
});