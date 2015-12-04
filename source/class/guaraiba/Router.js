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
qx.Class.define("guaraiba.Router", {
    type: 'abstract',
    extend: qx.core.Object,
    include: [guaraiba.utils.MInflection],

    construct: function () {
        this.__nativeRouter = new Barista.Router();
    },

    members: {
        /** @type {NodeJS.Barista.Router} Native instance of barista router. */
        __nativeRouter: null,

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
        getNativeRouter: function () {
            return this.__nativeRouter;
        },

        /**
         * Create and returns new route that match with given path and HTTP method.
         *
         * @param path {String} URL pattern that matches with new route.
         * @param method {String} HTTP method that matches with request of new route.
         * @return {NodeJS.Barista.Route}
         */
        match: function (path, method) {
            return this.__nativeRouter.match(path, method)
        },

        /**
         * Create and returns new route that match with given path by GET HTTP method.
         * This is equivalent to match(path. 'GET').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {NodeJS.Barista.Route}
         */
        get: function (path) {
            return this.match(path, 'GET');
        },

        /**
         * Create and return new route that match with given path by OPTIONS HTTP method.
         * This is equivalent to match(path. 'OPTIONS').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {NodeJS.Barista.Route}
         */
        options: function (path) {
            return this.match(path, 'OPTIONS');
        },

        /**
         * Create and returns new route that match with given path by PUT HTTP method.
         * This is equivalent to match(path. 'PUT').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {NodeJS.Barista.Route}
         */
        put: function (path) {
            return this.match(path, 'PUT');
        },

        /**
         * Create and returns new route that match with given path by POST HTTP method.
         * This is equivalent to match(path. 'POST').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {NodeJS.Barista.Route}
         */
        post: function (path) {
            return this.match(path, 'POST');
        },

        /**
         * Create and returns new route that match with given path by PATCH HTTP method.
         * This is equivalent to match(path. 'PATCH').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {NodeJS.Barista.Route}
         */
        patch: function (path) {
            return this.match(path, 'PATCH');
        },

        /**
         * Create and returns new route that match with given path by DELETE HTTP method.
         * This is equivalent to match(path. 'DELETE').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {NodeJS.Barista.Route}
         */
        del: function (path) {
            return this.match(path, 'DELETE');
        },

        /**
         * Create and returns new standard resource routes (RESTFull) for a controller.
         *
         * <pre>
         *     init: function () {
         *        ...
         *        
         *        this.resource('user', demo.controllers.User, 'utl') // Returns the following routes.
         *        --------------------------------------------------------------------------------------------------
         *        this.get("/user(.:format)").to("demo/controllers/User.index")
         *        this.get("/user/count(.:format)").to("demo/controllers/User.count")
         *        this.get("/user/create(.:format)").to("demo/controllers/User.create")
         *        this.get("/user/add.html").to("demo/controllers/User.add")
         *        this.get("/user/:id(.:format)").to("demo/controllers/User.show")
         *        this.get("/user/:id/edit.html").to("demo/controllers/User.edit")
         *        this.get("/user/:id/update(.:format)").to("demo/controllers/User.update")
         *        this.get("/user/:id/destroy(.:format)").to("demo/controllers/User.destroy")
         *
         *        this.resource('user', demo.controllers.User, 'method') // Returns the following routes.
         *        --------------------------------------------------------------------------------------------------
         *        this.get("/user(.:format)").to("demo/controllers/User.index")
         *        this.get("/user/count(.:format)").to("demo/controllers/User.count")
         *        this.post("/user(.:format)").to("demo/controllers/User.create")
         *        this.get("/user/add.html").to("demo/controllers/User.add")
         *        this.get("/user/:id(.:format)").to("demo/controllers/User.show")
         *        this.get("/user/:id/edit.html").to("demo/controllers/User.edit")
         *        this.put("/user/:id(.:format)").to("demo/controllers/User.update")
         *        this.del("/user/:id(.:format)").to("demo/controllers/User.destroy")
         *
         *        this.resource('user', demo.controllers.User, 'both') // Returns the following routes.
         *        --------------------------------------------------------------------------------------------------
         *        this.get("/user(.:format)").to("demo/controllers/User.index")
         *        this.get("/user/count(.:format)").to("demo/controllers/User.count")
         *        this.get("/user/create(.:format)").to("demo/controllers/User.create")
         *        this.post("/user(.:format)").to("demo/controllers/User.create")
         *        this.get("/user/add.html").to("demo/controllers/User.add")
         *        this.get("/user/:id(.:format)").to("demo/controllers/User.show")
         *        this.get("/user/:id/edit.html").to("demo/controllers/User.edit")
         *        this.get("/user/:id/update(.:format)").to("demo/controllers/User.update")
         *        this.put("/user/:id(.:format)").to("demo/controllers/User.update")
         *        this.get("/user/:id/destroy(.:format)").to("demo/controllers/User.destroy")
         *        this.del("/user/:id(.:format)").to("demo/controllers/User.destroy")
         *
         *        ...
         *     }
         * </pre>
         *
         * @param path {String} URL pattern that matches with new routes.
         * @param controller {Class|String} Controller class or name of controller class.
         * @param style {String?'both'} Style of path (url, method, both).
         * @return {Array} REST routes
         */
        resource: function (path, controller, style) {
            style = style || 'both';

            if (typeof controller == 'undefined') {
                controller = path;
                path = null;
            }

            controller = qx.lang.Type.isString(controller) ? controller : controller.classname;
            var endpoint = controller.replace(/\./g, '/');

            if (path === null) {
                path = this._toUnderscoreCase(this._toPlural(controller.replace(/(.*\.)+/, '')))
            }

            var routes = [];

            if (style == 'url') {
                routes = [
                    this.get("/" + path + "(.:format)").to(endpoint + ".index"),
                    this.get("/" + path + "/count(.:format)").to(endpoint + ".count"),
                    this.get("/" + path + "/create(.:format)").to(endpoint + ".create"),
                    this.get("/" + path + "/add.html").to(endpoint + ".add"),
                    this.get("/" + path + "/:id(.:format)").to(endpoint + ".show"),
                    this.get("/" + path + "/:id/edit.html").to(endpoint + ".edit"),
                    this.get("/" + path + "/:id/update(.:format)").to(endpoint + ".update"),
                    this.get("/" + path + "/:id/destroy(.:format)").to(endpoint + ".destroy")
                ];
            } else if (style == 'method') {
                routes = [
                    this.get("/" + path + "(.:format)").to(endpoint + ".index"),
                    this.get("/" + path + "/count(.:format)").to(endpoint + ".count"),
                    this.post("/" + path + "(.:format)").to(endpoint + ".create"),
                    this.get("/" + path + "/add.html").to(endpoint + ".add"),
                    this.get("/" + path + "/:id(.:format)").to(endpoint + ".show"),
                    this.get("/" + path + "/:id/edit.html").to(endpoint + ".edit"),
                    this.put("/" + path + "/:id(.:format)").to(endpoint + ".update"),
                    this.del("/" + path + "/:id(.:format)").to(endpoint + ".destroy")
                ];
            } else if (style == 'both') {
                routes = [
                    this.get("/" + path + "(.:format)").to(endpoint + ".index"),
                    this.get("/" + path + "/count(.:format)").to(endpoint + ".count"),
                    this.get("/" + path + "/create(.:format)").to(endpoint + ".create"),
                    this.post("/" + path + "(.:format)").to(endpoint + ".create"),
                    this.get("/" + path + "/add.html").to(endpoint + ".add"),
                    this.get("/" + path + "/:id(.:format)").to(endpoint + ".show"),
                    this.get("/" + path + "/:id/edit.html").to(endpoint + ".edit"),
                    this.put("/" + path + "/:id(.:format)").to(endpoint + ".update"),
                    this.get("/" + path + "/:id/update(.:format)").to(endpoint + ".update"),
                    this.del("/" + path + "/:id(.:format)").to(endpoint + ".destroy"),
                    this.get("/" + path + "/:id/destroy(.:format)").to(endpoint + ".destroy")
                ];
            }

            return routes;
        },

        /**
         * Find and returns the parse params for first route that match with given path and method.
         *
         * @param path {String} URL pattern that matches with search route.
         * @param method {String} HTTP method that matches with search route.
         * @return {Object|false}
         */
        first: function (path, method) {
            return this.__nativeRouter.first(path, method);
        },

        /**
         * Find and returns the parse params for all route that match with given path and method.
         *
         * @param path {String} URL pattern that matches with search route.
         * @param method {String} HTTP method that matches with search route.
         * @return {Array}
         */
        all: function (path, method) {
            return this.__nativeRouter.all(path, method);
        },

        /**
         * Generates a URL from a params map
         *
         * @param params {Object} Request parameters hash.
         * @param querystring {Boolean ? false} Add query string to url result.
         * @return {String|false}
         */
        url: function (params, querystring) {
            return this.__nativeRouter.url(params, querystring);
        },

        /**
         * Remove any route with name iqual to given name.
         *
         * @param name {String}
         */
        remove: function (name) {
            this.__nativeRouter.remove(name);
        },

        /**
         * Create defer route.
         *
         * @param fn {Function}
         * @return {NodeJS.Barista.Route}
         */
        defer: function (fn) {
            return this.__nativeRouter.defer(fn);
        },

        /**
         * Returns the route path that matches the current request.
         *
         * @return {String}
         */
        toString: function () {
            return this.__nativeRouter.toString();
        }
    }
});