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
 * This class offers the basic properties and features to configure guaraiba application.
 *
 * @require(guaraiba.Passport)
 * @ignore(__dirname)
 */
qx.Class.define("guaraiba.Configuration", {
    type: 'abstract',
    extend: qx.core.Object,
    implement: guaraiba.IConfiguration,
    include: qx.core.MAssert,

    construct: function () {
        var regExp = new RegExp('.' + this.basename + '$'),
            appBaseNameSpace = this.classname.replace(regExp, '');

        // Set base path for application resources.
        this.registerResourceUri(appBaseNameSpace, guaraiba.resourcePath)
        // Set base path for guaraiba resources.
        if (guaraiba.fs.existsSync(guaraiba.path.join(guaraiba.resourcePath, 'guaraiba'))) {
            this.registerResourceUri("guaraiba", guaraiba.resourcePath);
        } else {
            this.registerResourceUri("guaraiba", guaraiba.path.join(__dirname, '/../../resource'));
        }

        this.__cacheControlExpires = {'default': 0};
        this.__passports = {};
        this.__dBSchemas = {};

        // Register local passport.
        this.registerPassport(new guaraiba.Passport('passport-local', 'local', {
            usernameField: this.getPassportUsernameField(),
            passwordField: this.getPassportPasswordField()
        }));

        // Register ldap passport.
        if (this.getPassportLdapUrl()) {
            var passport = new guaraiba.Passport('passport-ldapauth', 'ldap', {
                usernameField: this.getPassportUsernameField(),
                passwordField: this.getPassportPasswordField(),
                server: {
                    url: this.getPassportLdapUrl(),
                    adminDn: this.getPassportLdapAdminDn(),
                    adminPassword: this.getPassportLdapAdminPassword(),
                    searchBase: this.getPassportLdapSearchBase(),
                    searchFilter: this.getPassportLdapSearchFilter()
                }
            });

            passport.setProfileMap({
                username: 'sAMAccountName',
                familyName: "sn",
                givenName: 'givenName',
                email: 'mail'
            });

            this.registerPassport(passport);
        }

        this.init();
    },

    properties: {
        /** @type {Integer} Maximum number of application workers running in parallel. */
        maxWorkers: {
            init: 'auto'
        },

        /** Listening port of the application. */
        port: {
            check: 'Integer',
            init: 3002
        },

        /** Environment of execution */
        environment: {
            check: 'String',
            init: 'development'
        },

        /**
         * Output stream for writing log lines.<br/>
         * See details in: https://github.com/expressjs/morgan#stream
         */
        logStream: {
            init: process.stdout
        },

        /** Path to certificate key for run the application over https. */
        SSLSecurityKeyPath: {
            check: 'String',
            init: 'guaraiba/data/ssl/server.key'
        },

        /** Path to certificate for run the application over https. */
        SSLSecurityCertPath: {
            check: 'String',
            init: 'guaraiba/data/ssl/server.crt'
        },

        /**
         * Function to call to generate a new session ID.
         *
         * See details in: https://github.com/expressjs/session#genid
         */
        sessionGenId: {
            check: 'Function',
            nullable: true
        },

        /**
         * The name of the session ID cookie to set in the response (and read from in the request).
         *
         * See details in: https://github.com/expressjs/session#name
         */
        sessionName: {
            check: 'Function',
            nullable: true,
            init: 'guaraiba'
        },

        /**
         * Trust the reverse proxy when setting secure cookies (via the "X-Forwarded-Proto" header).
         *
         * See details in: https://github.com/expressjs/session#proxy
         */
        sessionProxy: {
            check: 'Boolean',
            init: false
        },

        /**
         * Forces the session to be saved back to the session store.
         *
         * See details in: https://github.com/expressjs/session#resave
         */
        sessionResave: {
            check: 'Boolean',
            init: true
        },

        /**
         * Force a cookie to be set on every response. This resets the expiration date.
         *
         * See details in: https://github.com/expressjs/session#rolling
         */
        sessionRolling: {
            check: 'Boolean',
            init: true
        },

        /**
         * Forces a session that is "uninitialized" to be saved to the store.
         *
         * See details in: https://github.com/expressjs/session#saveuninitialized
         */
        sessionSaveUninitialized: {
            check: 'Boolean',
            init: true
        },

        /**
         * This is the secret used to sign the session ID cookie.
         *
         * See details in: https://github.com/expressjs/session#secret
         */
        sessionSecret: {
            check: 'String',
            init: 'a3d68565c5bd86c8d13af3b98c23e6bb'
        },

        /**
         * The session store instance, defaults to a new MemoryStore instance.
         *
         * See details in: https://github.com/expressjs/session#store
         */
        sessionStore: {
            check: 'Object',
            nullable: true
        },

        /**
         * Control the result of unsetting req.session (through delete, setting to null, etc.).
         *
         * See details in: https://github.com/expressjs/session#unset
         */
        sessionUnset: {
            check: 'String',
            init: 'keep'
        },

        /**
         * Path in the server where the cookies are available.
         * If you use '/', the cookie will be available on the entire domain.
         *
         * See details in: https://github.com/jshttp/cookie#path
         */
        cookiePath: {
            check: 'String',
            init: '/'
        },

        /**
         * Absolute expiration date for the cookie.
         *
         * See details in: https://github.com/jshttp/cookie#expires
         */
        cookieExpires: {
            check: 'Date',
            nullable: true
        },

        /**
         * Relative max age of the cookie from when the client receives it (seconds)
         *
         * See details in: https://github.com/jshttp/cookie#maxAge
         */
        cookieMaxAge: {
            check: 'Integer',
            nullable: true
        },

        /**
         * Domain where the cookies are available.
         *
         * See details in: https://github.com/jshttp/cookie#domain
         */
        cookieDomain: {
            check: 'String',
            nullable: true
        },

        /**
         * Sets whether cookies are only transmitted over a secure HTTPS connection from the client.
         *
         * See details in: https://github.com/jshttp/cookie#secure
         */
        cookieSecure: {
            check: 'Boolean',
            init: false
        },

        /**
         * Sets whether cookies will be accessible only through the HTTP protocol and not from scripting languages,
         * as JavaScript. This helps to reduce identity theft through XSS attacks.
         *
         * See details in: https://github.com/jshttp/cookie#httponly
         */
        cookieHttpOnly: {
            check: 'Boolean',
            init: false
        },

        /** Define if allow access to any action in cross-browser an cross-domain. */
        allowCORS: {
            check: 'Boolean',
            init: false
        },

        /** Field name used to obtain the username from the login request parameters. */
        passportUsernameField: {
            check: 'String',
            init: 'username'
        },

        /** Field name used to obtain the password from the login request parameters. */
        passportPasswordField: {
            check: 'String',
            init: 'password'
        },

        /** Ldap server url */
        passportLdapUrl: {
            check: 'String',
            nullable: true
        },

        /** User DN for authentication in ldap server for search of user information. */
        passportLdapAdminDn: {
            check: 'String',
            nullable: true
        },

        /** Password of user for authentication in ldap server for search of user information. */
        passportLdapAdminPassword: {
            check: 'String',
            nullable: true
        },

        /** Path base to search user information in ldap server. */
        passportLdapSearchBase: {
            check: 'String',
            nullable: true
        },

        /** Filter to search user information in ldap server. */
        passportLdapSearchFilter: {
            check: 'String',
            init: '(samaccountname={{username}})'
        },

        /** Parameters to authentication and search of user information in ldap server */
        passportLdap: {
            group: [
                'passportLdapUrl',
                'passportLdapAdminDn',
                'passportLdapAdminPassword',
                'passportLdapSearchBase',
                'passportLdapSearchFilter'
            ]
        },

        /** Default format for any request. */
        defaultFormat: {
            check: 'String',
            init: 'xml',
            nullable: true
        },

        /** Default template engine. */
        defaultTemplateEngine: {
            check: ['ejs', 'jade', 'hbs', 'handlebars', 'swig', 'jrxml'],
            init: 'ejs'
        },

        /** Application locale ('en', 'es', 'fr', ...) */
        locale: {
            check: 'String',
            nullable: true,
            apply: '_applyLocale'
        },

        /** Default charsets. */
        charsets: {
            check: 'String',
            init: 'UTF-8'
        }
    },

    members: {
        /**
         * Expiry times for cache control.
         */
        __cacheControlExpires: null,

        /**
         * Session passport settings.
         */
        __passports: null,

        /**
         * Settings of database connection schemas.
         */
        __dBSchemas: null,

        /**
         * Set
         *
         * @param value {String}
         */
        _applyLocale: function (value) {
            qx.locale.Manager.getInstance().setLocale(value);
        },

        /**
         * Return the expiry time in seconds for cache control.
         *
         * @param contentType {String}
         * @return {Integer}
         */
        getCacheControlExpires: function (contentType) {
            return this.__cacheControlExpires[contentType] || this.__cacheControlExpires['default'] || 0;
        },

        /**
         * Set the expiry time in seconds for cache control
         *
         * @param contentType {String}
         * @param value {Integer}
         */
        setCacheControlExpires: function (contentType, value) {
            this.__cacheControlExpires[contentType] = value;
        },

        /**
         * Set default expiry time in seconds for cache control
         *
         * @param value {Integer}
         */
        setDefaultCacheControlExpires: function (value) {
            this.setCacheControlExpires('default', value);
        },

        /**
         * Get the options to be used in configiración of express-session middleware.
         *
         * @return {Map} Session options as {name: *, secret: *, resave: *, rolling: *, cookie: * ...}
         */
        getSessionOptions: function () {
            return {
                genId: this.getSessionGenId(),
                name: this.getSessionName(),
                proxy: this.getSessionProxy(),
                resave: this.getSessionResave(),
                rolling: this.getSessionRolling(),
                saveUninitialized: this.getSessionSaveUninitialized(),
                secret: this.getSessionSecret(),
                store: this.getSessionStore(),
                unset: this.getSessionUnset(),
                cookie: {
                    path: this.getCookiePath(),
                    expires: this.getCookieExpires(),
                    maxAge: this.getCookieMaxAge(),
                    domain: this.getCookieDomain(),
                    httpOnly: this.getCookieHttpOnly(),
                    secure: this.getCookieSecure()
                }
            }
        },

        /**
         * Get instance of register passport.
         *
         * @param strategy {String} Passport identification name.
         * @return {guaraiba.Passport}
         * @throws {qx.core.AssertionError}
         */
        getPassport: function (strategy) {
            this.assertTrue(this.existPassport(strategy), 'The passport (' + strategy + ') is not registered.');
            return this.__passports[strategy];
        },

        /**
         * Register new resource uri.
         *
         * @param namespace {String} Resources namespace.
         * @param resourcePath {String} Path to resources.
         */
        registerResourceUri: function (namespace, resourcePath) {
            // Set base path for namespace resources.
            qx.util.LibraryManager.getInstance().set(namespace, "resourceUri", resourcePath || guaraiba.resourcePath);
        },

        /**
         * Register new passport for authentication actions.
         *
         * @param passport {guaraiba.Passport}
         * @throws {qx.core.AssertionError}
         */
        registerPassport: function (passport) {
            this.assertInstance(passport, guaraiba.Passport);
            this.assertFalse(this.existPassport(passport.getStrategy()),
                'The passport (' + passport.getStrategy() + ') is already register.'
            );
            this.__passports[passport.getStrategy()] = passport;
        },

        /**
         * Checks if passport is already registered.
         *
         * @param strategy {String} Passport identification name.
         * @return {boolean}
         */
        existPassport: function (strategy) {
            return (this.__passports[strategy]) ? true : false;
        },

        /**
         * Register new database connection schema.
         *
         * @param dBSchema {guaraiba.orm.DBSchema}
         * @throws {qx.core.AssertionError}
         */
        registerDBSchema: function (dBSchema) {
            this.assertInstance(dBSchema, guaraiba.orm.DBSchema);
            this.assertFalse(this.existDBSchema(dBSchema.getName()),
                'The database connection schema (' + dBSchema.getName() + ') is already register.'
            );
            this.__dBSchemas[dBSchema.getName()] = dBSchema;
        },

        /**
         * Return all instances of register database connection schema.
         *
         * @return {Array}
         */
        getDBSchemas: function () {
            return qx.lang.Object.getValues(this.__dBSchemas);
        },

        /**
         * Return instance of register database connection schema.
         *
         * @param name {String?'default'} Database connection schema identification name.
         * @return {guaraiba.orm.DBSchema}
         * @throws {qx.core.AssertionError}
         */
        getDBSchema: function (name) {
            name = name || 'default';
            this.assertTrue(this.existDBSchema(name), 'The database connection schema (' + name + ') is not registered.');

            return this.__dBSchemas[name];
        },

        /**
         * Checks if database connection schema is already registered.
         *
         * @param name {String} Database connection schema identification name.
         * @return {boolean}
         */
        existDBSchema: function (name) {
            return (this.__dBSchemas[name]) ? true : false;
        }
    }
});