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
 * This class offers the basic features and properties to create HasMany relations.
 */
qx.Class.define('guaraiba.orm.relations.HasMany', {
    extend: qx.core.Object,
    include: [guaraiba.utils.MInflection],

    /**
     * Declare hasMany relation
     *
     * @param currentRecord {guaraiba.orm.Record} Current record instance.
     * @param foreignModel {guaraiba.orm.Model} Instance of foreign model to relate to the current record.
     * @param foreignKey {String?} Foreign key name.
     */
    construct: function (currentRecord, foreignModel, foreignKey) {

        if (!foreignKey) {
            foreignKey = currentRecord.getModel().getModelName();
            foreignKey = foreignKey.replace(foreignModel.getDBSchema().getModelPrefixName(), '');
            foreignKey = foreignKey.replace(/\./g, '_');
            foreignKey = foreignKey.replace(/^_+/g, '');
            foreignKey = this._toUnderscoreCase(foreignKey) + '_id';
        }

        this.set({
            currentRecord: currentRecord,
            foreignModel: foreignModel,
            foreignKey: foreignKey
        });
    },

    properties: {
        /** Reference to instance of current record. */
        currentRecord: {
            check: 'guaraiba.orm.Record'
        },

        /** Reference to instance of model of current record. */
        foreignModel: {
            check: 'guaraiba.orm.Model'
        },

        /** Name of foreign key. */
        foreignKey: {
            check: 'String'
        }
    },

    members: {
        /**
         * Find all instances of Model, matched by query
         * make sure you have marked as `index: true` fields for filter or sort
         *
         * @param options {Object?} Ex: {where: { key: val, key2: {gt: 'val2'}, limit: {Number}, offset: {Number} }
         * @param callback {Function} Callback function with two argument Ex: function(err, records) {...}
         * @param scope {Object?} Callback function scope.
         */
        all: function (options, callback, scope) {
            if (qx.lang.Type.isFunction(options)) {
                scope = callback;
                callback = options;
                options = {}
            }

            options = options || {};
            options.where = options.where || {};
            options.where[this.getForeignKey()] = this.getCurrentRecord().getId();

            this.getForeignModel().all(options, callback, scope);
        },

        /**
         * Updates the respective record
         *
         * @param options {Map} Ex: { where:{uid:'10'}, update:{ Name:'New name' } }
         * @param callback {Function?} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        update: function (options, callback, scope) {
            options = options || {};
            options.where = options.where || {};
            options.where[this.getForeignKey()] = this.getCurrentRecord().getId();
            options.update = options.update || {};
            options.update[this.getForeignKey()] = this.getCurrentRecord().getId();

            this.getForeignModel().update(options, callback, scope);
        },

        /**
         * Find object by id
         *
         * @param id {String|Number} Identifier of object (primary key value)
         * @param callback {Function} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        find: function (id, callback, scope) {
            this.findOne({ where: { id: id } }, callback, scope);
        },

        /**
         * Find one record, same as `all`, limited by 1 and return object, not collection
         *
         * @param options {Object?} Search conditions: {where: {name: 'me', age: {gt: 20}}}
         * @param callback {Function} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        findOne: function (options, callback, scope) {
            if (qx.lang.Type.isFunction(options)) {
                scope = callback;
                callback = options;
                options = {}
            }

            options = options || {};
            options.where = options.where || {};
            options.where[this.getForeignKey()] = this.getCurrentRecord().getId();

            this.getForeignModel().findOne(options, callback, scope);
        },

        /**
         * Iterate through dataset and perform async method iterator. This method
         * designed to work with large datasets loading data by batches.
         *
         * @param options {Object?} Query conditions. Same as for `all` may contain optional member `batchSize` to specify size of batch loaded from db.
         * @param iterator {Function} Iterator function with two argument called on each obj. Ex: function(record, next) {...}.
         * @param callback {Function} Callback function with one argument Ex: function(err) {...}
         * @param scope {Object?} Callback function scope.
         */
        iterate: function map(options, iterator, callback, scope) {
            if (qx.lang.Type.isFunction(options)) {
                scope = callback;
                callback = options;
                options = {}
            }

            options = options || {};
            options.where = options.where || {};
            options.where[this.getForeignKey()] = this.getCurrentRecord().getId();

            this.getForeignModel().iterate(options, iterator, callback, scope);
        },

        /**
         * Return count of matched records
         *
         * @param conditions {Object?} Search conditions: {name: 'me', age: {gt: 20}}
         * @param callback {Function} Callback function with two argument Ex: function(err, count) {...}
         * @param scope {Object?} Callback function scope.
         */
        count: function (conditions, callback, scope) {
            if (qx.lang.Type.isFunction(conditions)) {
                scope = callback;
                callback = conditions;
                conditions = {}
            }

            conditions = conditions || {};
            conditions[this.getForeignKey()] = this.getCurrentRecord().getId();

            this.getForeignModel().count(conditions, callback, scope);
        },

        /**
         * Create new instance of Model class, saved in database
         *
         * @param data {Object} object to create.
         * @param callback {Function?} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        create: function (data, callback, scope) {
            data[this.getForeignKey()] = this.getCurrentRecord().getId();

            this.getForeignModel().create(data, callback, scope);
        },

        /**
         * Find one record, same as `all`, limited by 1 and return object, not collection,
         * if not found, create using data provided as second argument
         *
         * @param options {Object?} Search conditions: {where: {name: 'me', age: {gt: 20}}}
         * @param data {Object} object to create.
         * @param callback {Function} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        findOrCreate: function findOrCreate(options, data, callback, scope) {
            this.findOne(options, function (err, record) {
                if (!err && !record) {
                    this.create(data, callback, scope);
                } else {
                    callback.call(scope, err, record)
                }
            }, this)
        },

        /**
         * Update or create record.
         *
         * @param data {Object} object to update or create.
         * @param callback {Function?} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        updateOrCreate: function (data, callback, scope) {
            data[this.getForeignKey()] = this.getCurrentRecord().getId();

            this.getForeignModel().updateOrCreate(data, callback, scope);
        },

        /**
         * Destroy all records
         *
         * @param callback {Function?} Callback function with one argument Ex: function(err) {...}
         * @param scope {Object?} Callback function scope.
         */
        destroyAll: function (callback, scope) {
            scope = scope || this;
            try {
                this.iterate(function (err, record) {
                    if (err) throw err;
                    record.destroy(function (err, record) {
                        if (err) throw err;
                    });
                }, this);
            } catch (err) {
                if (callback) {
                    callback.call(scope, err, null);
                } else {
                    throw err;
                }
            }
        }
    }
});
