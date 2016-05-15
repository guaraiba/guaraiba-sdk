/**
 * Copyright ©:
 *      2015 Yoandry Pacheco Aguila
 *
 * License:
 *      LGPL-3.0: http://spdx.org/licenses/LGPL-3.0.html#licenseText
 *      EPL-1.0: http://spdx.org/licenses/EPL-1.0.html#licenseText
 *      See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *      Yoandry Pacheco Aguila < yoandrypa@gmail.com >
 *
 */

/**
 * This class offers the basic properties and features to create passport configuration.
 */
qx.Class.define("guaraiba.Passport", {
    extend: qx.core.Object,
    include: [qx.core.MProperty],

    /**
     * Create new instance of passport for register in the {@link guaraiba.Configuration} and use in the authentication.
     *
     * @param module {String} Name of install NodeJS passport module.
     * @param strategy {String ? 'local'} Strategy name.
     * @param options {Object ? {usernameField: 'username', passwordField: 'password'} } Options to pass to passport module constructor.
     */
    construct: function (module, strategy, options) {
        this.setModule(module);
        strategy && this.setStrategy(strategy);
        options && this.setOptions(options);
    },

    properties: {
        /** Name of install NodeJS passport module.*/
        module: {
            check: 'String',
            apply: '__applyModule'
        },

        /** Strategy class. */
        strategyClass: {
            check: 'Function'
        },

        /** Passport identification name. Strategy name. */
        strategy: {
            check: 'String',
            init: 'local'
        },

        /** Options to pass to passport module constructor. */
        options: {
            check: 'Object',
            init: {
                usernameField: 'username',
                passwordField: 'password'
            }
        },

        /** Mapping attributes to create the authentication profile. */
        profileMap: {
            check: 'Object',
            init: {
                username: 'username',
                familyName: "family_name",
                givenName: 'given_name',
                email: 'email'
            }
        }
    },

    members: {
        /**
         * Load the NodeJS module and get the strategy class.
         *
         * @param value {String} Module name.
         * @internal
         */
        __applyModule: function (value) {
            this.setStrategyClass(require(value).Strategy);
        }
    }
});