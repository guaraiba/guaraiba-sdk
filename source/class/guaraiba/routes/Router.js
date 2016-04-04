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

var Barista = require('barista');

/**
 * Class middleware to barista router.
 *
 * See details barista into your homepage: {@link http://kieran.github.io/barista}
 * @require(guaraiba.Controller)
 * @require(guaraiba.controllers.RestController)
 */
qx.Class.define("guaraiba.routes.Router", {
    type: 'abstract',
    extend: qx.core.Object,
    include: [guaraiba.routes.MRoute],

    /**
     * Constructor
     *
     * @param nativeRouter {NodeJS.Barista.Router?} Instance of native barista router.
     */
    construct: function (nativeRouter) {
        this.__native = nativeRouter || new Barista.Router();
    },

    members: {
        /** @type {NodeJS.Barista.Router} Native instance of barista router. */
        __native: null,

        /**
         * Initialise the routes for any action.
         *
         * Iden examples:
         *<pre class='javascript'>
         *   this.resource(demo.controllers.User));
         *</pre>
         *<pre class='javascript'>
         *   this.resource(demo.controllers.User, 'both'));
         *</pre>
         *<pre class='javascript'>
         *   this.resource('user', demo.controllers.User));
         *</pre>
         *<pre class='javascript'>
         *   this.resource('user', demo.controllers.User, 'both'));
         *</pre>
         *<pre class='javascript'>
         *   this.get("/user(.:format)").to("demo/controllers/User.index");
         *   this.get("/user/add(.:format)").to("demo/controllers/User.add");
         *   this.get("/user/:id(.:format)").to("demo/controllers/User.show");
         *   this.get("/user/:id/edit(.:format)").to("demo/controllers/User.edit");
         *   this.get("/user/count(.:format)").to("demo/controllers/User.count");
         *
         *   this.post("/user(.:format)").to("demo/controllers/User.create");
         *   this.get("/user/create(.:format)").to("demo/controllers/User.create");

         *   this.put("/user/:id(.:format)").to("demo/controllers/User.update");
         *   this.get("/user/:id/update(.:format)").to("demo/controllers/User.update");
         *
         *   this.del("/user/:id(.:format)").to("demo/controllers/User.destroy");
         *   this.get("/user/:id/destroy(.:format)").to("demo/controllers/User.destroy");
         * </pre>
         *
         * @abstract
         */
        init: function () {
            throw new Error("Abstract method call.");
        },

        /**
         * Returns native instance of barista router.
         *
         * @return {NodeJS.Barista.Router}
         */
        getNative: function () {
            return this.__native;
        },

        /**
         * Create and returns new route that match with given path and HTTP method.
         *
         * @param path {String} URL pattern that matches with new route.
         * @param method {String} HTTP method that matches with request of new route.
         * @return {guaraiba.routes.Route}
         */
        match: function (path, method) {
            return new guaraiba.routes.Route(this, this.__native.match(path, method));
        },

        /**
         * Find and returns the parse params for first route that match with given path and method.
         *
         * @param path {String} URL pattern that matches with search route.
         * @param method {String} HTTP method that matches with search route.
         * @return {Object|false}
         */
        first: function (path, method) {
            return this.__native.first(path, method);
        },

        /**
         * Find and returns the parse params for all route that match with given path and method.
         *
         * @param path {String} URL pattern that matches with search route.
         * @param method {String} HTTP method that matches with search route.
         * @return {Array}
         */
        all: function (path, method) {
            return this.__native.all(path, method);
        },

        /**
         * Generates a URL from a params map
         *
         * @param params {Object} Request parameters hash.
         * @param querystring {Boolean ? false} Add query string to url result.
         * @return {String|false}
         */
        url: function (params, querystring) {
            return this.__native.url(params, querystring);
        },

        /**
         * Remove any route with name iqual to given name.
         *
         * @param name {String}
         */
        remove: function (name) {
            this.__native.remove(name);
        },

        /**
         * Create defer route.
         *
         * @param fn {Function}
         * @return {guaraiba.routes.Router}
         */
        defer: function (fn) {
            return new guaraiba.routes.Router(this.__native.defer(fn));
        }
    }
});