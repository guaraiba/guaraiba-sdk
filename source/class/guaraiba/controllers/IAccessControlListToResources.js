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
 * This interface define the basic features to allow or block access to resources.
 */
qx.Interface.define("guaraiba.controllers.IAccessControlListToResources", {
    members: {
        /**
         * Add Access Control List conditions to sql where clause.
         *
         * @param qb {guaraiba.orm.QueryBuilder}
         * @param permission {String?}
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        applyAccessControlListWhereConditionsToResources: function (qb, permission, done) {},

        /**
         * Create Access Control List with default role of current user over given record.
         *
         * @param record {guaraiba.orm.Record|Object}
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        saveAccessControlListToResources: function (record, done) {},

        /**
         * Remove all Access Control List for given record.
         *
         * @param record {guaraiba.orm.Record|Object}
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        destroyAccessControlListToResources: function (record, done) {},

        /**
         * Returns default permission to be applied according requested action.
         *
         * @return {number}
         */
        getDefaultPermissionToResources: function () {}
    }
});
