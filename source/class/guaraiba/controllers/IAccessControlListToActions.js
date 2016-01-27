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
