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
