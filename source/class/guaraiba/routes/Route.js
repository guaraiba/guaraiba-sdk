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
 * Class middleware to barista route.
 *
 * See details barista into your homepage: {@link http://kieran.github.io/barista}
 */
qx.Class.define("guaraiba.routes.Route", {
    extend: qx.core.Object,
    include: [guaraiba.routes.MRoute],

    /**
     * Constructor
     *
     * @param router {guaraiba.routes.Router}
     * @param native {NodeJS.Barista.Route} Instance of native barista route.
     */
    construct: function (router, nativeRoute) {
        this.__router = router;
        this.__native = nativeRoute;
    },

    members: {
        /** @type {guaraiba.routes.Router} */
        __router: null,

        /** @type {NodeJS.Barista.Route} Native instance of barista route. */
        __native: null,

        /**
         * Create and returns new route that match with given path and HTTP method.
         *
         * @param path {String} URL pattern that matches with new route.
         * @param method {String} HTTP method that matches with request of new route.
         * @return {guaraiba.routes.Route}
         */
        match: function (path, method) {
            return new guaraiba.routes.Route(this.__router, this.__native.match(
                this.__router.getNative(), path, method
            ));
        }
    }
});