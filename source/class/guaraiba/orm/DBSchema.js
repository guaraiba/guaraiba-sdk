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
 * This class offers the basic features and properties to create database schema.
 *
 * This class required knex modules.
 *
 * @ignore(complete)
 */
qx.Class.define('guaraiba.orm.DBSchema', {
    extend: qx.core.Object,
    include: [guaraiba.utils.MInflection],

    statics: {
        /**
         * Type for define orm record field and check property value.
         *
         * @param v {String}
         * @return {String|Boolean}
         */
        String: function (v) {
            var nv = new String(v);
            // When caller from native schema.
            if (this == window) {
                return nv;
            }

            // When caller a simple check function.
            return qx.lang.Type.isString(v) || (nv == v) ? true : false;
        },

        /**
         * Type for define orm record field and check property value.
         *
         * @param v {Boolean}
         * @return {Boolean}
         */
        Boolean: function (v) {
            if (qx.lang.Type.isString(v)) {
                v = v.toLowerCase();
            }

            v = ( v === 'false' || v === '0' || v == null) ? false : true;

            var nv = new Boolean(v);
            // When caller from native schema.
            if (this == window) {
                return nv;
            }

            // When caller a simple check function.
            return qx.lang.Type.isBoolean(v) || (nv === v) ? true : false;
        },

        Number: Number,

        /**
         * Type for define orm record field and check property value.
         *
         * @param v {Date|String}
         * @return {Date|Boolean}
         */
        Date: function (v) {
            var nv = new Date(v);

            // When caller from native schema.
            if (this == window) {
                return nv;
            }

            // When caller a simple check function.
            return qx.lang.Type.isDate(nv) ? true : false;
        },

        /**
         * Type for define orm record field and check property value.
         *
         * @param v {String}
         * @return {String|Boolean}
         */
        Text: function (v) {
            var nv = new String(v);
            // When caller from native schema.
            if (this == window) {
                return nv;
            }

            // When caller a simple check function.
            return qx.lang.Type.isString(v) || (nv == v) ? true : false;
        },

        /**
         * Type for define orm record field and check property value.
         *
         * @param v {String} String of only one character.
         * @return {String|Boolean}
         */
        Character: function (v) {
            var nv = new String(v);
            // When caller from native schema.
            if (this == window) {
                return nv;
            }

            // When caller a simple check function.
            return qx.lang.Type.isString(v) && v.length <= 1 ? true : false;
        },

        /**
         * Type for define orm record field and check property value.
         *
         * @param v {Number}
         * @return {Number|Boolean}
         */
        Integer: function (v) {
            var nv = Number(v);
            // When caller from native schema.
            if (this == window) {
                return nv;
            }
            return parseInt(v) === nv ? true : false;
        },

        /**
         * Type for define orm record field and check property value.
         *
         * @param v {Number}
         * @return {Number|Boolean}
         */
        Serial: function (v) {
            var nv = Number(v);
            // When caller from native schema.
            if (this == window) {
                return nv;
            }
            return parseInt(v) === nv ? true : false;
        },

        /**
         * Type for define orm record field and check property value.
         *
         * @param v {Number}
         * @return {Number|Boolean}
         */
        Float: function (v) {
            var nv = Number(v);
            // When caller from native schema.
            if (this == window) {
                return nv;
            }
            return parseFloat(v) === nv ? true : false;
        }
    },

    /**
     * Constructor
     *
     * @param name {String} Name of datebase schema.
     * @param knexSetting {Map} Knex connection settings. This has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>client</th><td>String</td><td>Any client suported by knex molule. Ex: ('pg', 'mysql', 'mariasql', 'sqlite3' ...).</td></tr>
     *     <tr><th>connection</th><td>String</td><td>Connection string setting. Ex: 'postgres://user:passwd@127.0.0.1:5432/dbName'. </td></tr>
     *     <tr><th>debug</th><td>Boolean</td><td>Debug query execution.</td></tr>
     *   </table>
     */
    construct: function (name, knexSetting) {
        var knex = require('knex'),
            migrationsPath = guaraiba.resourcePath + '/data/migrations/' + name,
            seedsPath = guaraiba.resourcePath + '/data/seeds/' + name;

        this.setName(name);

        knexSetting.migrations = knexSetting.migrations || {};
        knexSetting.migrations.directory = knexSetting.migrations.directory || migrationsPath;
        knexSetting.migrations.tableName = knexSetting.migrations.tableName || name + '_migrations';

        knexSetting.seeds = knexSetting.seeds || {};
        knexSetting.seeds.directory = knexSetting.seeds.directory || seedsPath;

        this.setDebug(knexSetting.debug || false);
        knexSetting.debug = false;

        this.__models = [];
        this.driverSettings(require(knexSetting.client));
        this.__knex = knex(knexSetting);

        this.init();
    },

    properties: {
        /** Database schema identification name.*/
        name: {
            init: 'String'
        },

        /** Model name prefix used in getModel method. */
        modelPrefixName: {
            check: 'String',
            init: ''
        },

        /** Enable or disable the debug option. */
        debug: {
            check: 'Boolean',
            init: false
        }
    },

    members: {
        __models: null,
        __knex: null,

        /**
         * Initialize data base schemas of demo application.
         *
         * This method is called immediately after construction of the schemes and
         * in this must be registered each of the model classes.
         */
        init: function () {
        },

        /**
         * Register record class in this database schema.
         * This action define new basic model from record class.
         *
         * @param recordClass {Class}
         * @return {guaraiba.orm.Model}
         */
        register: function (recordClass) {
            var model = guaraiba.orm.Model.getModel(recordClass, this);

            this.__models[model.getModelName()] = model;

            return model;
        },

        /**
         * Get model instance.
         *
         * @param name {String} Name of model class.
         * @param throwUndefined {Boolean?true} Throw exception if model is not defiened.
         * @return {Class|null}
         */
        getModel: function (name, throwUndefined) {
            throwUndefined = (throwUndefined || typeof throwUndefined == 'undefined');

            var _name = name.split('.');
            _name[_name.length - 1] = this._toCamelCase(_name[_name.length - 1]);
            name = _name.join('.');

            var model = this.__models[name]
                || this.__models[this.getModelPrefixName() + name]
                || this.__models[this.getModelPrefixName() + '.' + name];

            if (throwUndefined && !model) {
                throw Error('The model \'' + name + '\' is not defined.')
            }

            return model;
        },

        /**
         * Returns models collection class.
         *
         * @return {Array}
         */
        getModels: function () {
            return this.__models;
        },

        /**
         * Create query builder.
         *
         * @return {guaraiba.orm.QueryBuilder}
         */
        createQueryBuilder: function () {
            return new guaraiba.orm.QueryBuilder(this);
        },

        /**
         * Returns KNex connection instance.
         *
         * @return {KNex}
         */
        getKNex: function () {
            return this.__knex;
        },

        /**
         * Begin new transaction.
         *
         * @param prepareCallback {Function} Function where will be preparing the transaction body.
         *  Ex: function(schema, commit, rollback) { ... }
         * @param commitCallback {Function} Function to will be call after commit.
         * @param rollbackCallback {Function} Function to will be call after rollback.
         * @param scope {Object} Callback functions scope.
         */
        transaction: function (prepareCallback, commitCallback, rollbackCallback, scope) {
            var vThis = this;

            scope = scope || this

            this.__knex.transaction(function (trx) {
                vThis._trx = trx;
                prepareCallback.call(scope, this, trx.commit, trx.rollback);
            })['then'](function (data) {
                vThis.debug('TRANSACTION IS COMMIT.');
                commitCallback && commitCallback.call(scope, data)
            })['catch'](function (data) {
                vThis.debug('TRANSACTION IS ROLLBACK.');
                rollbackCallback && rollbackCallback.call(scope, data)
            })['finally'](function (err) {
                vThis._trx = null;
            });
        },

        /**
         * Returns current transaction.
         *
         * @return {Object} KNext transaction.
         */
        getTransaction: function () {
            return this._trx;
        },

        /**
         * Returns true if transaction is started.
         *
         * @return {Boolean}.
         */
        isTransaction: function () {
            return this._trx !== null;
        },

        /**
         * Excecute custom query.
         *
         * @param sql {String} SQL query string.
         * @param params {Array?} Parameters pased to query.
         * @param callback {Function?} Callback function with two argument Ex: function(err, result) {...}
         * @param scope {Object?} Callback function scope.
         */
        query: function (sql, params, callback, scope) {
            if (qx.lang.Type.isFunction(params)) {
                scope = callback;
                callback = params;
                params = [];
            }

            scope = scope || this;

            this.__knex.raw(sql, params).then(function (result) {
                callback && callback.call(scope, null, result);
            })['catch'](function (err) {
                callback && callback.call(scope, err, null);
            });
        },

        /**
         *
         * @param name {String} Table name.
         * @param callback {Function} Callback function with two argument Ex: function(err, exists) {...}
         * @param scope {Object?} Callback function scope.
         */
        hasTable: function (name, callback, scope) {
            scope = scope || this;

            this.__knex.schema.hasTable(name).then(function (exists) {
                callback.call(scope, null, exists);
            })['catch'](function (err) {
                callback.call(scope, err, null);
            });
        },

        /**
         * Configures the driver to access the database.
         *
         * This method is empty and must be overridden in child classes.
         *
         * @param driver {Object}
         */
        driverSettings: function (driver) {
        }
    }
});