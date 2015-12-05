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
 * This class offers the basic features for create authentication controller.
 */
qx.Class.define("guaraiba.controllers.AuthController", {
    type: 'abstract',
    extend: guaraiba.Controller,

    // override
    construct: function (request, response, params) {
        this.base(arguments, request, response, params);

        this.beforeOnly('_decryptCredentials', ['login'])
    },

    members: {
        _options: null,

        /**
         * Hook, fired before execute the login action.
         * Decrypt credential parameter before checking.
         *
         * @param proceed {Function} Function to continue normal workflow.
         * @internal
         */
        _decryptCredentials: function (proceed) {
            var CryptoJS = require('crypto-js'),
                params = this.getParams(),
                oneWayToken = this.getSession('one-way-token') || {};

            if (oneWayToken.address != this.getRequest().getClientAddress()) {
                this.respordWithStatusForbidden()
            } else {
                var decrypted = CryptoJS.AES.decrypt(params.credentials, oneWayToken.token);

                // Add decrypted credentials to request parameters. Ex: { username: '...,' password: '...' }
                qx.lang.Object.mergeWith(params, JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)));

                // Continue normal workflow.
                proceed();
            }

            // Destroy one-way-token.
            this.setSession('one-way-token', null);
        },

        /**
         * Prepares information of authenticated user profile.
         * Update the local user with remote user data.
         *
         * @param localUser {Map}
         * @param remoteUser {Map}
         * @param profileMap {Map}
         * @param done {Function} Callback function with two params (err, profile)
         * @internal
         */
        _getProfile: function (localUser, remoteUser, profileMap, done) {
            var value, attr, profile = {};
            for (attr in profileMap) {
                if (qx.lang.Type.isFunction(profileMap[attr])) {
                    value = profileMap[attr]();
                } else if (typeof remoteUser[profileMap[attr]] != 'undefined') {
                    value = remoteUser[profileMap[attr]];
                } else if (qx.Class.hasProperty(localUser.constructor, attr)) {
                    value = localUser.get(attr);
                }
                if (value) {
                    profile[attr] = qx.lang.Type.isFunction(value) ? value() : value;
                    if (qx.Class.hasProperty(localUser.constructor, attr)) {
                        localUser.set(attr, profile[attr]);
                    }
                }
            }

            localUser.save(function (err, record) {
                if (err) throw err;
                profile.localId = record.getId();
                done(null, profile);
            }, this);
        },

        /**
         * Executes the local user authentication strategy and prepares information of authenticated user profile.
         *
         * @param passport {guaraiba.Passport}
         * @param localUser {guaraiba.orm.IUser}
         * @param username {String}
         * @param password {String}
         * @param done {Function} Callback function with two params (err, profile)
         * @internal
         */
        _localStrategy: function (passport, localUser, username, password, done) {
            if (localUser.isExpired()) {
                this.respordWithStatusForbidden('Expired credential.')
            }
            if (!localUser.isValidCredential(username, password)) {
                this.respordWithStatusForbidden('Bat credential.')
            } else {
                var profileMap = {
                    username: 'username',
                    email: 'email'
                };

                guaraiba.utils.mixin(profileMap, passport.getProfileMap());
                if (localUser.getProfile) {
                    localUser.getProfile(null, profileMap, done)
                } else {
                    this._getProfile(localUser, {}, profileMap, done);
                }
            }
        },

        /**
         * Executes the ldap user authentication strategy and prepares information of authenticated user profile.
         *
         * @param passport {guaraiba.Passport}
         * @param localUser {guaraiba.orm.IUser}
         * @param ldapUser {Object}
         * @param done {Function} Callback function with two params (err, profile)
         * @internal
         */
        _ldapStrategy: function (passport, localUser, ldapUser, done) {
            var profileMap = {
                username: 'sAMAccountName',
                email: 'mail'
            };

            guaraiba.utils.mixin(profileMap, passport.getProfileMap());
            if (localUser.getProfile) {
                localUser.getProfile(ldapUser, profileMap, done)
            } else {
                this._getProfile(localUser, ldapUser, profileMap, done);
            }
        },

        /**
         * Action to start authentication process.
         * Generate new token to encrypt one-way-password.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Object} Request parameters hash.
         */
        start: function (request, response, params) {
            var CryptoJS = require('crypto-js'),
                salt = CryptoJS.lib.WordArray.random(128 / 8),
                secret = CryptoJS.lib.WordArray.random(128 / 8),
                key256Bits = CryptoJS.PBKDF2(secret, salt, { keySize: 256 / 32 }).toString();

            this.setSession('one-way-token', {
                token: key256Bits,
                address: request.getClientAddress(),
                date: new Date()
            });

            this.respond({ statusCode: 200, token: key256Bits });
        },

        /**
         * Action to open authentication session.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Object} Request parameters hash.
         */
        login: function (request, response, params) {
            var config = this.getConfiguration(),
                passport;

            this._findFirstUser(params['username'],
                qx.lang.Function.bind(function (err, user) {
                    if (err) {
                        this.error(err);
                        return;
                    }

                    if (!user) {
                        this.respordWithStatusForbidden();
                        return;
                    }

                    passport = config.getPassport(user.passport || user.getPassport());

                    var StrategyName = passport.getStrategy(),
                        StrategyClass = passport.getStrategyClass(),
                        options = passport.getOptions();

                    guaraiba.passport.use(StrategyName,
                        new StrategyClass(options,
                            qx.lang.Function.bind(function () {
                                var args = qx.lang.Array.fromArguments(arguments),
                                    method = '_' + qx.lang.String.camelCase(StrategyName.replace(/ +/g, '-'))
                                        + 'Strategy';

                                args.unshift(user);
                                args.unshift(passport);

                                if (qx.lang.Type.isFunction(this[method])) {
                                    this[method].apply(this, args)
                                } else {
                                    this.respordWithStatusForbidden(
                                        "Unsupported '" + StrategyName + "' passport strategy"
                                    );
                                }
                            }, this)
                        )
                    );

                    var authenticate = guaraiba.passport.authenticate(StrategyName, options,
                        qx.lang.Function.bind(function (err, profile, info, statuses) {
                            if (err && !err.statusCode) {
                                err.statusCode = 403;
                            }
                            if (!profile && info) {
                                this.respordWithStatusForbidden(info)
                            } else if (!this.respondError(err)) {
                                this.getSession().set('profile', profile);
                                this.respond({ statusCode: 200, item: profile });
                            }
                        }, this)
                    );

                    authenticate(request.getNativeRequest());
                }, this)
            );
        },

        /**
         * Action to close the authentication session.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Object} Request parameters hash.
         */
        logout: function (request, response, params) {
            var profile = this.getCurrentUserProfile();

            this.getSession().unset('profile');
            this.respond({ statusCode: 200, item: profile });
        },

        /**
         * Find the first user in the data source defined for the application
         * that contain the username equal to given param.
         *
         * @abstract
         * @param username {String}
         * @param callBack {Function} - Function to process user searching results.
         */
        _findFirstUser: function (username, callBack) {
            throw new Error("Abstract method call.");
        }
    }
});

