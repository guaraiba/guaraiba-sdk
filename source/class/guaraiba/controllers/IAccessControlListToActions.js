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
 * This interface define the basic features to allow or block access to actions.
 */
qx.Interface.define("guaraiba.controllers.IAccessControlListToActions", {
    members: {
         /**
         * Hook, fired before execute any action.
         * Check access to any action before it's execute.
         *
         * @param proceed {Function} Callback function to continue with normal workflow.
         */
        checkAccessControlListToActions: function (proceed) {}
    }
});
