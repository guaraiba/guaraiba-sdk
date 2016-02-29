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
 * Mixin middleware to barista route.
 *
 * See details barista into your homepage: {@link http://kieran.github.io/barista}
 */
qx.Mixin.define("guaraiba.routes.MRoute", {
    include: [guaraiba.utils.MInflection],

    members: {
        /**
         * Create and returns new route that match with given path by GET HTTP method.
         * This is equivalent to match(path. 'GET').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {guaraiba.routes.Route}
         */
        get: function (path) {
            return this.match(path, 'GET');
        },

        /**
         * Create and return new route that match with given path by OPTIONS HTTP method.
         * This is equivalent to match(path. 'OPTIONS').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {guaraiba.routes.Route}
         */
        options: function (path) {
            return this.match(path, 'OPTIONS');
        },

        /**
         * Create and returns new route that match with given path by PUT HTTP method.
         * This is equivalent to match(path. 'PUT').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {guaraiba.routes.Route}
         */
        put: function (path) {
            return this.match(path, 'PUT');
        },

        /**
         * Create and returns new route that match with given path by POST HTTP method.
         * This is equivalent to match(path. 'POST').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {guaraiba.routes.Route}
         */
        post: function (path) {
            return this.match(path, 'POST');
        },

        /**
         * Create and returns new route that match with given path by PATCH HTTP method.
         * This is equivalent to match(path. 'PATCH').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {guaraiba.routes.Route}
         */
        patch: function (path) {
            return this.match(path, 'PATCH');
        },

        /**
         * Create and returns new route that match with given path by DELETE HTTP method.
         * This is equivalent to match(path. 'DELETE').
         *
         * @param path {String} URL pattern that matches with new route.
         * @return {guaraiba.routes.Route}
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
         * @param controller {Class} Controller class.
         * @param style {String?'both'} Style of path (url, method, both).
         * @return {Array} REST routes
         */
        resource: function (path, controller, style) {
            style = style || 'both';

            if (typeof controller == 'undefined') {
                controller = path;
                path = null;
            }

            var cClazz = this._toPlural(controller.basename),
                routes = [], paths;

            if (path === null) {
                paths = [/*CamelCase*/ cClazz, /*UnderscoreCase*/ this._toUnderscoreCase(cClazz)]
            } else {
                paths = [/*CamelCase*/ cClazz, /*custom path*/ path]
            }

            paths.forEach(function (path) {
                if (style == 'url') {
                    routes = [
                        this.get("/" + path + "(.:format)").to(controller, ".index"),
                        this.get("/" + path + "/count(.:format)").to(controller, "count"),
                        this.get("/" + path + "/create(.:format)").to(controller, "create"),
                        this.get("/" + path + "/add.html").to(controller, "add"),
                        this.get("/" + path + "/:id(.:format)").to(controller, "show"),
                        this.get("/" + path + "/:id/edit.html").to(controller, "edit"),
                        this.get("/" + path + "/:id/update(.:format)").to(controller, "update"),
                        this.get("/" + path + "/:id/destroy(.:format)").to(controller, "destroy")
                    ];
                } else if (style == 'method') {
                    routes = [
                        this.get("/" + path + "(.:format)").to(controller, "index"),
                        this.get("/" + path + "/count(.:format)").to(controller, "count"),
                        this.post("/" + path + "(.:format)").to(controller, "create"),
                        this.get("/" + path + "/add.html").to(controller, "add"),
                        this.get("/" + path + "/:id(.:format)").to(controller, "show"),
                        this.get("/" + path + "/:id/edit.html").to(controller, "edit"),
                        this.put("/" + path + "/:id(.:format)").to(controller, "update"),
                        this.del("/" + path + "/:id(.:format)").to(controller, "destroy")
                    ];
                } else if (style == 'both') {
                    routes = [
                        this.get("/" + path + "(.:format)").to(controller, "index"),
                        this.get("/" + path + "/count(.:format)").to(controller, "count"),
                        this.get("/" + path + "/create(.:format)").to(controller, "create"),
                        this.post("/" + path + "(.:format)").to(controller, "create"),
                        this.get("/" + path + "/add.html").to(controller, "add"),
                        this.get("/" + path + "/:id(.:format)").to(controller, "show"),
                        this.get("/" + path + "/:id/edit.html").to(controller, "edit"),
                        this.put("/" + path + "/:id(.:format)").to(controller, "update"),
                        this.get("/" + path + "/:id/update(.:format)").to(controller, "update"),
                        this.del("/" + path + "/:id(.:format)").to(controller, "destroy"),
                        this.get("/" + path + "/:id/destroy(.:format)").to(controller, "destroy")
                    ];
                }
            }, this);

            return routes;
        },

        test: function (path) {
            return this.__native.test(name);
        },

        /**
         * Defines the endpoint & mixes in optional params.
         *
         * @param controller {Class|String} Controller class or endpoint to controller.
         * @param action {String?'index'} Action name.
         * @param defaultParams {Object?} Default parameters.
         * @returns {guaraiba.routes.MRoute}
         */
        to: function (controller, action, defaultParams) {
            if (!qx.lang.Type.isString(controller)) {
                controller = controller.classname;
            }

            if (qx.lang.Type.isObject(action)) {
                defaultParams = action;
                action = 'index';
            }

            var endpoint = controller.replace(/\./g, '/') + '.' + (action || 'index');

            this.__native.to(endpoint, defaultParams);
            return this;
        },

        /**
         * Sets the route name.
         *
         * @param route_name {String} Name of route.
         * @return {guaraiba.routes.Route}
         */
        as: function (route_name) {
            this.__native.as(route_name);
            return this;
        },

        /**
         * Sets conditions that each url variable must match for the URL to be valid.
         *
         * @param conditions {Object}
         * @return {guaraiba.routes.Route}
         */
        where: function (conditions) {
            this.__native.where(conditions);
            return this;
        },

        /**
         * Builds a string url for this Route from a params object.
         *
         * @param params {Object}
         * @return {Array}
         */
        stringify: function (params) {
            return this.__native.stringify(params);
        },

        /**
         * Returns the route path that matches the current request.
         *
         * @return {String}
         */
        toString: function () {
            return this.__native.toString();
        }
    }
});