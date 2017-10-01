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
 * This class offers the basic properties and features to create records for persist objects.
 *
 * @require(guaraiba.orm.Model)
 */
qx.Class.define('guaraiba.orm.Record', {
    type: 'abstract',
    extend: qx.core.Object,
    include: [
        qx.core.MProperty,
        guaraiba.orm.MHooks,
        guaraiba.orm.MSerial,
        guaraiba.orm.MRelations,
        guaraiba.utils.MInflection
    ],

    statics: {
        /**
         * @type {String?} Name of relation (table) in database.
         */
        tableName: null
    },

    /**
     * Model class - base class for all persist objects provides **common API** to access any database adapter.
     *
     * @param data {Object|Array}
     * @param dbSchema {guaraiba.orm.DBSchema|String?'default'} Database schema instance or name.
     */
    construct: function (data, dbSchema) {
        data = data || {};

        dbSchema = dbSchema || 'default';

        if (qx.lang.Type.isString(dbSchema)) {
            dbSchema = guaraiba.config.getDBSchema(dbSchema);
        }
        this.__dbSchema = dbSchema;
        this.__model = guaraiba.orm.Model.getModel(this.constructor, dbSchema);

        if (qx.lang.Type.isArray(data)) {
            this.fromArray(data);
        } else {
            this.fromDataObject(data);
        }
    },

    properties: {
        /** Whether the record is new. */
        newRecord: {
            check: 'Boolean',
            init: true
        }
    },

    members: {
        __model: null,
        __dbSchema: null,

        /**
         * Get basic model instance for management records type.
         *
         * @param recordClass {guaraiba.orm.Record?}
         * @return {guaraiba.orm.Model}
         */
        getModel: function (recordClass) {
            if (recordClass) {
                return this.__dbSchema.getModel(recordClass);
            } else {
                return this.__model;
            }
        },

        /**
         * Save instance. When instance is new record, create method called instead.
         * Triggers: save, update | create
         *
         * @param callback {Function?} The function should have two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         * @tag triggers save hook before and after destroying object
         */
        save: function (callback, scope) {
            var vThis = this;

            if (!qx.lang.Type.isFunction(callback)) {
                scope = callback;
                callback = function () {};
            }

            scope = scope || vThis;

            vThis.beforeSave(function (resume) {
                if (resume === true) {
                    if (vThis.isNewRecord()) {
                        vThis.__model.create(vThis, function (err, records) {
                            if (err) return callback.call(scope, err, records ? records[0] : null);

                            vThis.afterSave(function () {
                                callback.call(scope, null, records ? records[0] : null);
                            });
                        });
                    } else {
                        var idFieldName = vThis.__model.getIdFieldName(),
                            data = vThis.toDataObject();

                        vThis.__model
                            .update(data)
                            .where(idFieldName, data[idFieldName])
                            .then(function (err, records) {
                                if (err) return callback.call(scope, err, this);

                                vThis.afterSave(function () {
                                    callback.call(scope, null, vThis);
                                });
                            });
                    }
                } else {
                    callback.call(scope, null, vThis);
                }
            });
        },

        /**
         * Delete object from persistence
         *
         * @param callback {Function?} The function should have two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         * @tag triggers destroy hook before and after destroying object
         */
        destroy: function (callback, scope) {
            var vThis = this,
                model = this.__model,
                idFieldName = model.getIdFieldName();

            if (!qx.lang.Type.isFunction(callback)) {
                scope = callback;
                callback = function () {
                };
            }
            scope = scope || vThis;
            vThis.beforeDestroy(function (resume) {
                if (resume === true) {
                    model.remove()
                        .where(idFieldName, vThis.get(idFieldName))
                        .then(function (err, record) {
                            if (err) return callback.call(scope, null, vThis);

                            vThis.afterDestroy(function () {
                                callback.call(scope, null, vThis);
                            });
                        });
                } else {
                    callback.call(scope, null, vThis);
                }
            });
        },

        /**
         * Returns serializable object with record properties values.
         *
         * @return {Object}
         */
        toDataObject: function () {
            var value, result = {};
            this.__model.getProperties().forEach(function (property) {
                value = this.get(property.qxName);
                if (typeof value == 'undefined') {
                    value = property.defaultValue;
                }
                result[property.qxName] = value;
            }, this);

            return result;
        },

        /**
         * Returns array with record properties values.
         *
         * @return {Array}
         */
        toArray: function () {
            var value, result = [];

            this.__model.getProperties().forEach(function (property) {
                value = this.get(property.qxName);
                if (typeof value == 'undefined') {
                    value = property.defaultValue;
                }
                result.push(value);
            }, this);

            return result;
        },

        /**
         * Returns JSON string with record properties
         *
         * @return {String}
         */
        toJSON: function () {
            return JSON.stringify(this.toDataObject());
        },

        /**
         * Fill record properties from data object param.
         *
         * @param data {Object} Object with property or field values.
         * @return {guaraiba.orm.Record}
         */
        fromDataObject: function (data) {
            data && this.__model.getProperties().forEach(function (property, dbField) {
                if (typeof data[property.qxName] != 'undefined') {
                    this.set(property.qxName, data[property.qxName]);
                } else if (typeof data[dbField] != 'undefined') {
                    this.set(property.qxName, data[dbField]);
                }
            }, this);

            return this;
        },

        /**
         * Fill record properties from array param.
         *
         * @param data {Object}
         * @return {guaraiba.orm.Record}
         */
        fromArray: function (data) {
            var index = 0;

            data && this.__model.getProperties().forEach(function (property) {
                this.set(property.qxName, data[index++])
            }, this);

            return this;
        },

        /**
         * Remove the current record from cache of model.
         */
        unCached: function () {
            var cache = guaraiba.orm.Model.getCacheRecords(this.getModel().getModelName());

            delete cache[this.getId()];
        },

        /**
         * Returns trasform value for string property type.
         * @param v {var}
         * @return {String}
         */
        _transformString: function (v) {
            if (v === null || v === undefined) return null;

            return v.toString ? v.toString() : String(v);
        },

        /**
         * Returns trasform value for boolean property type.
         * @param v {var}
         * @return {Boolean}
         */
        _transformBoolean: function (v) {
            var nv

            if (v === null || v === undefined) return null;
            if (qx.lang.Type.isString(v)) nv = v.toLowerCase();
            if (nv === 'true' || nv === '1' || v === 1) return true;
            if (nv === 'false' || nv === '0' || v === 0) return false;

            return v
        },

        /**
         * Returns trasform value for number property type.
         * @param v {var}
         * @return {Number}
         */
        _transformNumber: function (v) {
            var nv

            if (v === null || v === undefined) return null;
            if (qx.lang.Type.isString(v)) nv = new Number(v);
            if (qx.lang.Type.isNumber(nv)) return nv;

            return v
        },

        /**
         * Returns trasform value for date property type.
         * @param v {var}
         * @return {Date}
         */
        _transformDate: function (v) {
            var nv

            if (v === null || v === undefined) return null;
            if (qx.lang.Type.isString(v)) nv = new Date(v);
            if (qx.lang.Type.isDate(nv)) return nv;

            return v
        },

        /**
         * Returns trasform value for text property type.
         * @param v {var}
         * @return {String}
         */
        _transformText: function (v) {
            return this._transformString(v);
        },

        /**
         * Returns trasform value for character property type.
         * @param v {var}
         * @return {String}
         */
        _transformCharacter: function (v) {
            return this._transformString(v);
        },

        /**
         * Returns trasform value for integer property type.
         * @param v {var}
         * @return {Integer}
         */
        _transformInteger: function (v) {
            return this._transformNumber(v);
        },

        /**
         * Returns trasform value for serial property type.
         * @param v {var}
         * @return {Integer}
         */
        _transformSerial: function (v) {
            return this._transformInteger(v);
        },

        /**
         * Returns trasform value for float property type.
         * @param v {var}
         * @return {Number}
         */
        _transformFloat: function (v) {
            return this._transformNumber(v);
        }

    }
});