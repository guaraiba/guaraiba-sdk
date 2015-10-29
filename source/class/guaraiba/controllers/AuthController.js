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

    members: {
        _options: null,

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
         * @param localUser {Map}
         * @param username {String}
         * @param password {String}
         * @param done {Function} Callback function with two params (err, profile)
         * @internal
         */
        _localStrategy: function (passport, localUser, username, password, done) {
            var options = passport.getOptions(),
                config = this.getConfiguration(),
                usernameField = options.usernameField || config.getPassportUsernameField(),
                passwordField = options.passwordField || config.getPassportPasswordField(),
                localPassword = localUser[passwordField] || localUser.get(passwordField),
                localUsername = localUser[usernameField] || localUser.get(usernameField);

            if (localPassword != password || localUsername != username) {
                this.respordWithStatusForbidden()
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
         * @param localUser {Map}
         * @param ldapUser {Map}
         * @param done {Function} Callback function with two params (err, profile)
         * @internal
         */
        _ldapStrategy: function (passport, localUser, ldapUser, done) {
            var profile, profileMap = {
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
         * Action to open authentication session.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map?} Params map object.
         */
        login: function (request, response, params) {
            var vThis = this,
                config = this.getConfiguration(),
                passport;

            this._findFirstUser(params['username'], function (err, user) {
                if (err) {
                    vThis.error(err);
                    return;
                }

                if (!user) {
                    vThis.respordWithStatusForbidden();
                    return;
                }

                passport = config.getPassport(user.passport || user.getPassport());

                var pModule = passport.getModule(),
                    StrategyName = passport.getStrategy(),
                    StrategyClass = passport.getStrategyClass(),
                    options = passport.getOptions();

                guaraiba.passport.use(StrategyName, new StrategyClass(options, function () {
                    var args = qx.lang.Array.fromArguments(arguments),
                        method = '_' + qx.lang.String.camelCase(StrategyName.replace(/ +/g, '-')) + 'Strategy';

                    args.unshift(user);
                    args.unshift(passport);

                    if (qx.lang.Type.isFunction(vThis[method])) {
                        vThis[method].apply(vThis, args)
                    } else {
                        vThis.respordWithStatusForbidden("Unsupported '" + StrategyName + "' passport strategy");
                    }
                }));

                var authenticate = guaraiba.passport.authenticate(StrategyName, options, function (err, profile, info, statuses) {
                    if (err && !err.statusCode) {
                        err.statusCode = 403;
                    }
                    if (!profile && info) {
                        vThis.respordWithStatusForbidden(info.message || info)
                    } else if (!vThis.respondError(err)) {
                        vThis.getSession().set('profile', profile);

                        vThis.respond({
                            statusCode: 200,
                            item: profile
                        });
                    }
                });

                authenticate(request);
            });
        },

        /**
         * Action to close the authentication session.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map?} Params map object.
         */
        logout: function (request, response, params) {
            var profile = this.getCurrentUserProfile();

            this.getSession().unset('profile');
            this.respond({
                statusCode: 200,
                item: profile
            });
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

