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
    }
});
