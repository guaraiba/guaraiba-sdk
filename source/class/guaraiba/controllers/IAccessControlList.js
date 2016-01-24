qx.Interface.define("guaraiba.controllers.IAccessControlList", {
    members: {
        /**
         * Add Access Control List conditions to sql where clause.
         *
         * @param qb {guaraiba.orm.QueryBuilder}
         * @param permission {String?}
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        applyAccessControlListWhereConditions: function (qb, permission, done) {},

        /**
         * Create Access Control List with default role of current user over given record.
         *
         * @param record {guaraiba.orm.Record|Object}
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        saveAccessControlList: function (record, done) {},

        /**
         * Returns default permission to be applied according requested action.
         *
         * @return {number}
         */
        getDefaultPermission: function () {}
    }
});
