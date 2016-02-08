/* ************************************************************************

 Copyright:

 License:

 Authors:

 ************************************************************************ */

/**
 * This is the main application class of your custom application "${Name}" server.
 *
 *
 * @asset(public/*)
 * @asset(data/*)
 * @asset(views/*)
 *
 * @ignore(environment)
 * @ignore(process)
 */
qx.Class.define("${Namespace}.Application", {
    extend: guaraiba.Application,

    /**
     * Constructor
     */
    construct: function () {
        this.base(arguments, ${Namespace}.Configuration.getInstance(), ${Namespace}.Router.getInstance());
    },

    members: {
        // override
        getServerStaticPaths: function () {
            var paths = this.base(arguments);

            var guiSourcePath = guaraiba.appRoot + '/../../../${Namespace}-gui/source',
                qxSourcePath = guaraiba.appRoot + '/../../../qooxdoo-5.0.1-sdk';

            qx.lang.Array.append(paths, [
                { urlPattern: '/source', resoursePath: guiSourcePath },
                { urlPattern: '/qooxdoo-5.0.1-sdk', resoursePath: qxSourcePath }
            ]);

            return paths;
        }
    }
});
