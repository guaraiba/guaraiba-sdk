/**
 * Singleton instance class for define any route for application action.
 *
 * @require(${Namespace}.controllers.Test1)
 */
qx.Class.define("${Namespace}.Router", {
    type: 'singleton',
    extend: guaraiba.routes.Router,

    members: {
        /**
         * Initialise the routes for any action.
         */
        init: function () {

            this.get('/').to('${Namespace}.controllers.Test1.index');
            this.get('/test1/:action(.:format)').to('${Namespace}.controllers.Test1.:action');

            // BEGIN REGISTER RESOURCE ROUTERS. DON'T REMOVE OR CHANGE THIS COMMENTARY.
            this.resource(${Namespace}.controllers.Peoples);
            // END REGISTER RESOURCE ROUTERS. DON'T REMOVE OR CHANGE THIS COMMENTARY.
        }
    }
});