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
 * This mixin offers the basic features to do query in guaraiba.orm.Record.
 */
qx.Mixin.define('guaraiba.orm.MQuery', {
    members: {

        /**
         * Create query builder linked with this model.
         *
         * @return {guaraiba.orm.QueryBuilder}
         */
        createQueryBuilder: function () {
            return new guaraiba.orm.QueryBuilder(this);
        },

        /**
         * Init query builder for find instances of model selecting all columns.
         * Call "then" after call this method will hydrate the rows as guaraiba.orm.Record.
         *
         * @param callback {Function?} Callback function with two argument Ex: function(err, records) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        all: function (callback, scope) {
            var qb = this.createQueryBuilder();

            callback && qb.then(callback, scope || this);

            return qb;
        },

        /**
         * Init query builder for find first instance of model selecting all columns.
         * Call "then" after call this method will hydrate the rows as guaraiba.orm.Record.
         *
         * @param callback {Function?} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        first: function (callback, scope) {
            var qb = this.createQueryBuilder();

            qb.first('*');
            callback && qb.then(callback, scope || this);

            return qb;
        },

        /**
         * Find record by id.
         *
         * This method search record first in the cache of model.
         *
         * @param id {var} Indentificator key value.
         * @param callback {Function} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        find: function (id, callback, scope) {
            var idFieldName = this.getIdFieldName(),
                cache = guaraiba.orm.Model.getCacheRecords(this.getModelName()),
                qb = this.createQueryBuilder();

            if (cache[id]) {
                callback.call(scope || this, null, cache[id]);
            } else {
                qb.first('*').where(idFieldName, id).then(callback, scope);
            }

            return qb;
        },

        /**
         * Init query builder for find instances of model selecting custem columns.
         * Call "then" after call this method doesn't will hydrate the rows as guaratiba.orm.Record.
         *
         * @param columns {String|Array} Columns to select.
         * @param callback {Function?} Callback function with two argument Ex: function(err, records) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        select: function (columns, callback, scope) {
            var qb = this.createQueryBuilder();

            if (!qx.lang.Type.isArray(columns)) {
                columns = [columns];
            }

            qb.select.apply(qb, columns);
            callback && qb.then(callback, scope || this);

            return qb;
        },

        /**
         * Limit the number of rows result.
         *
         * @param limit {Integer} Maximum number of rows.
         * @param offset {Integer?} Offset of rows.
         * @param callback {Function?} Callback function with two argument Ex: function(err, records) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        limit: function (limit, offset, callback, scope) {
            var qb = this.createQueryBuilder();

            if (qx.lang.Type.isFunction(offset)) {
                scope = callback;
                callback = offset;
                offset = undefined;
            }

            qb.limit(limit, offset);
            callback && qb.then(callback, scope || this);

            return qb;
        },

        /**
         * Offset the start of rows results.
         *
         * @param offset {Integer} Offset of rows.
         * @param limit {Integer?} Maximum number of rows.
         * @param callback {Function?} Callback function with two argument Ex: function(err, records) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        offset: function (offset, limit, callback, scope) {
            var qb = this.createQueryBuilder();

            if (qx.lang.Type.isFunction(limit)) {
                scope = callback;
                callback = limit;
                limit = undefined;
            }

            qb.offset(offset, limit);
            callback && qb.then(callback, scope || this);

            return qb;
        },

        /**
         * Create new instance of Model class, saved in database.
         *
         * @param data {guaraiba.orm.Record|Map|Array} Record or map object to create.
         * @param callback {Function?} Callback function with two argument Ex: function(err, ids) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        create: function (data, callback, scope) {
            var qb = this.createQueryBuilder(),
                records = [];

            if (qx.lang.Type.isArray(data)) {
                data.forEach(function (d) {
                    records.push(this._normalizeData(d));
                }, this);
            } else {
                records.push(this._normalizeData(data));
            }

            qb.insert(records, '*');
            callback && qb.then(function (err, records) {
                if (!this.isErrorThenCallback(err, callback, scope)) {
                    callback.call(scope, null, records);
                }
            }, this);

            return qb;
        },

        /**
         * Updates the respective record.
         *
         * @param data {guaraiba.orm.Record|Map} Record or map object to create.
         * @param callback {Function?} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        update: function (data, callback, scope) {
            var qb = this.createQueryBuilder();

            if (data instanceof guaraiba.orm.Record) {
                data = data.toDataObject();
            }

            data = this._normalizeData(data);

            qb.update(data, '*');
            callback && qb.then(function (err, record) {
                if (!this.isErrorThenCallback(err, callback, scope)) {
                    callback.call(scope, null, record);
                }
            }, this);

            return qb;
        },

        /**
         * Delete the selected record
         *
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        remove: function (callback, scope) {
            var qb = this.createQueryBuilder();

            qb.remove('*');
            callback && qb.then(function (err, data) {
                if (!this.isErrorThenCallback(err, callback, scope)) {
                    callback.call(scope, null, data);
                }
            }, this);

            return qb;
        },

        /**
         * Find one record, same as `all`, limited by 1 and return object, not collection,
         * if not found, create using data provided as second argument
         *
         * @param options {Object?} Search conditions: {where: {name: 'me', age: {gt: 20}}}
         * @param data {Object?} object to create.
         * @param callback {Function} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        findOrCreate: function findOrCreate(options, data, callback, scope) {
            var qb = this.createQueryBuilder();

            if (qx.lang.Type.isFunction(data)){
                scope = callback;
                callback = data;
                data = null;
            }

            this.first().where(options).then(function (err, record) {
                if (!this.isErrorThenCallback(err, callback, scope)) {
                    if (!record) {
                        data = qx.lang.Object.mergeWith(data || {}, options);

                        var clazz = this.getRecordClass(),
                            record = new clazz(data, this.getDBSchema());

                        record.save(callback, scope);
                    } else {
                        callback.call(scope, null, record)
                    }
                }
            }, this);
        },

        /**
         * Update or Create the given record.
         *
         * @param data {guaraiba.orm.Record|Map} Record or map object to create.
         * @param callback {Function} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        updateOrCreate: function (data, callback, scope) {
            var idFieldName = this.getIdFieldName();

            if (data instanceof guaraiba.orm.Record) {
                data = data.toDataObject();
            }

            scope = scope || this;

            if (data[idFieldName] === null || data[idFieldName] === '' || typeof data[idFieldName] == 'undefined') {
                delete data[idFieldName];
                this.create(data, callback, scope);
            } else {
                this.update(data).where(idFieldName, data[idFieldName]).then(function (err, records) {
                    if (!this.isErrorThenCallback(err, callback, scope)) {
                        if (records.length == 0) {
                            this.create(data, callback, scope);
                        } else {
                            callback.call(scope, null, records)
                        }
                    }
                }, this);
            }
        },

        /**
         * Add aggregator function to currernt query.
         *
         * @param aggregator {String} Aggregator function Ex: ('count', 'min', 'max', or 'avg')
         * @param column {String?'*'} Column to apply aggregator function.
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         * @internal
         */
        _aggregator: function (aggregator, column, callback, scope) {
            if (qx.lang.Type.isFunction(column)) {
                scope = callback;
                callback = column;
                column = undefined;
            }

            var qb = this.createQueryBuilder();

            qb[aggregator](column);
            callback && qb.then(function (err, data) {
                if (!this.isErrorThenCallback(err, callback, scope)) {
                    callback.call(scope, null, data);
                }
            }, this);

            return qb;
        },

        /**
         * Adds the aggregator function "count" in the currernt query.
         *
         * @param column {String?} Column to count.
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        count: function (column, callback, scope) {
            return this._aggregator('count', column, callback, scope);
        },

        /**
         * Adds the aggregator function "min" in the currernt query.
         *
         * @param column {String?} Column to count.
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        min: function (column, callback, scope) {
            return this._aggregator('min', column, callback, scope);
        },

        /**
         * Adds the aggregator function "max" in the currernt query.
         *
         * @param column {String?} Column to count.
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        max: function (column, callback, scope) {
            return this._aggregator('max', column, callback, scope);
        },

        /**
         * Adds the aggregator function "sum" in the currernt query.
         *
         * @param column {String?} Column to count.
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        sum: function (column, callback, scope) {
            return this._aggregator('sum', column, callback, scope);
        },

        /**
         * Adds the aggregator function "avg" in the currernt query.
         *
         * @param column {String?} Column to count.
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        avg: function (column, callback, scope) {
            return this._aggregator('avg', column, callback, scope);
        },

        /**
         * Adds the clause "group by" in the current query.
         *
         * @param column {String} Column to count.
         * @param callback {Function?} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {guaraiba.orm.QueryBuilder}
         */
        groupBy: function (column, callback, scope) {
            var qb = this.createQueryBuilder();
            qb.groupBy(column);
            callback && qb.then(function (err, data) {
                if (!this.isErrorThenCallback(err, callback, scope)) {
                    callback.call(scope, null, data);
                }
            }, this);

            return qb;
        },

        /**
         * Normalize data tranformed all field name to underscore case and removed fileds with undefined value.
         *
         * @param data {guaraiba.orm.Record|Map} Record to be normalized.
         * @return {Map}
         * @internal
         */
        _normalizeData: function (data) {
            var idFieldName = this.getIdFieldName(),
                nData = {}, value;

            if (data instanceof guaraiba.orm.Record) {
                data = data.toDataObject();
            }

            if (data[idFieldName] === null || data[idFieldName] === '' || typeof data[idFieldName] == 'undefined') {
                delete data[idFieldName];
            }

            this.getProperties().forEach(function (property, dbField) {
                value = ( typeof data[dbField] == 'undefined' ) ? data[property.qxName] : data[dbField];

                if (typeof value != 'undefined') {
                    nData[dbField] = value;
                }
            }, this);

            return nData;
        },

        /**
         * Returns true and call callback function if err is not null.
         *
         * @param err {Error?null}
         * @param callback {Function?} Callback function with error as first argument Ex: function(err, data) {...}
         * @param scope {Object?} Callback function scope.
         * @return {boolean}
         * @internal
         */
        isErrorThenCallback: function (err, callback, scope) {
            if (err) {
                callback.call(scope || this, err);
                return true;
            }
            return false;
        }
    }
});
