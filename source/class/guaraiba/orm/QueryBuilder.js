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
 * This class offers the basic properties and features to create models for persist objects.
 */
qx.Class.define('guaraiba.orm.QueryBuilder', {
    extend: qx.core.Object,

    /**
     * Constructor
     *
     * @param modelOrSchema {guaraiba.orm.Model|guaraiba.orm.DBSchema} Model instances.
     */
    construct: function (modelOrSchema) {
        var knex = modelOrSchema.getKNex();

        if (modelOrSchema instanceof guaraiba.orm.Model) {
            this._hydrateResultRecord = true;
            this._model = modelOrSchema;
            this._dbSchema = modelOrSchema.getDBSchema();
            this._query = new knex(modelOrSchema.getRelationName());
        } else {
            this._hydrateResultRecord = false;
            this._dbSchema = modelOrSchema;
            this._query = new knex();
        }
    },

    members: {
        _model: null,
        _dbSchema: null,
        _query: null,

        /**
         * Execute the prepared query and call callback function with error and data params.
         *
         * @param callback {Function} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object} Callback function scope.
         */
        then: function (callback, scope) {
            var vThis = this,
                debug = this._dbSchema.isDebug(),
                trx = this._dbSchema.getTransaction();

            if (debug) this.debug(this._query.toString());
            if (trx) this._query.transacting(trx);

            this._query.then(function (data) {
                callback && callback.call(scope, null, vThis._hydrateRecord(data));
            })['catch'](function (err) {
                if (callback) {
                    callback.call(scope, err, null);
                } else {
                    throw err;
                }
            });
        },

        /**
         * Execute the prepared query using transaction and call callback function with error and data params.
         *
         * @param callback {Function} Callback function with two argument Ex: function(err, data) {...}
         * @param scope {Object} Callback function scope.
         */
        thenTransaction: function (callback, scope) {
            this._query.transacting(this._dbSchema.getTransaction());

            this.then(callback, scope);
        },

        // START SELECTINS SECTION //

        /**
         * Define columns to select in current query.
         *
         * @param columns {String|Array} Columns to select.
         * @return {guaraiba.orm.QueryBuilder}
         */
        select: function (columns) {
            this._hydrateResultRecord = (this._hydrateResultRecord !== false) && (columns == '*');
            this._query.select.apply(this._query, arguments);

            return this;
        },

        /**
         * Sets a distinct clause on the query.
         *
         * @param columns {String|Array} Columns to select.
         * @returns {guaraiba.orm.QueryBuilder}
         */
        distinct: function (columns) {
            this._hydrateResultRecord = (this._hydrateResultRecord !== false) && (columns == '*');
            this._query.distinct.apply(this._query, arguments);

            return this;
        },

        /**
         * Init query builder for find first instance of model selecting all columns.
         *
         * @param columns {String|Array} Columns to select.
         * @return {guaraiba.orm.QueryBuilder}
         */
        first: function (columns) {
            this._hydrateResultRecord = (this._hydrateResultRecord !== false) && (columns == '*');
            this._query.first.apply(this._query, arguments);

            return this;
        },

        /**
         * Define SQL FROM clause for SELECT or UPDATE query.
         *
         * @param tableName {String} Table name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        from: function (tableName) {
            this._query.from.apply(this._query, arguments);

            return this;
        },

        /**
         * Define SQL ORDER BY clause.
         *
         * @param column {String} Column name by that is sorted.
         * @param direction {String?'ASC'} Direction of sorting. (ASC or DESC)
         * @return {guaraiba.orm.QueryBuilder}
         */
        orderBy: function (column, direction) {
            this._query.orderBy(column, direction);

            return this;
        },

        /**
         * Limit the number of rows results.
         *
         * @param limit {Integer} Maximum number of rows.
         * @param offset {Integer?} Offset rows.
         * @return {guaraiba.orm.QueryBuilder}
         */
        limit: function (limit, offset) {
            this._query.limit(limit);

            if (typeof offset != 'undefined') {
                this._query.offset(offset);
            }

            return this;
        },

        /**
         * Offset the start of rows results.
         *
         * @param offset {Integer} Offset rows.
         * @param limit {Integer} Maximum number of rows.
         * @return {guaraiba.orm.QueryBuilder}
         */
        offset: function (offset, limit) {
            this._query.offset(offset);

            if (typeof limit != 'undefined') {
                this._query.limit(limit);
            }

            return this;
        },

        // END SELECTINS SECTION //

        // START WRITINGS SECTION //

        /**
         * Insert new records.
         *
         * @param data {Map|Array} Record or map object to insert.
         * @param returning {String?} Returning columns.
         * @return {guaraiba.orm.QueryBuilder}
         */
        insert: function (data, returning) {
            if (!qx.lang.Type.isArray(data)) {
                data = [data];
            }

            this._query.insert(data);
            returning && this.returning(returning);

            return this;
        },

        /**
         * Define SQL INTO clause for INSERT query.
         *
         * @param tableName {String} Table name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        into: function (tableName) {
            this._hydrateResultRecord = false;
            this._query.into.apply(this._query, arguments);

            return this;
        },

        /**
         * Update records.
         *
         * @param data {Map} Record to instert.
         * @param returning {String?} Returning columns.
         * @return {guaraiba.orm.QueryBuilder}
         */
        update: function (data, returning) {
            this._query.update(data);
            returning && this.returning(returning);

            return this;
        },

        /**
         * Delete records.
         *
         * @param returning {String?} Returning columns.
         * @return {guaraiba.orm.QueryBuilder}
         */
        remove: function (returning) {
            this._query.del();
            returning && this.returning(returning);

            return this;
        },

        /**
         * Add returning column option to current insert or update query.
         *
         * @param columns {String?} Returning columns.
         * @return {guaraiba.orm.QueryBuilder}
         */
        returning: function (columns) {
            this._hydrateResultRecord = (this._hydrateResultRecord !== false) && (columns == '*');
            this._query.returning(columns);

            return this;
        },

        // END WRITINGS SECTION //

        // START AGGEGATRO FUNCTION SECCTION //

        /**
         * Add aggregator function to currernt query.
         *
         * @param aggregator {String} Aggregator function Ex: ('count', 'min', 'max', or 'avg')
         * @param column {String} Column to apply aggregator function.
         * @return {guaraiba.orm.QueryBuilder}
         */
        _aggregator: function (aggregator, column) {
            this._hydrateResultRecord = false;
            this._query[aggregator](column);

            return this;
        },

        /**
         * Adds the aggregator function "count" in the currernt query.
         *
         * @param column {String?} Column to count.
         * @return {guaraiba.orm.QueryBuilder}
         */
        count: function (column) {
            return this._aggregator('count', column || '*');
        },

        /**
         * Adds the aggregator function "min" in the currernt query.
         *
         * @param column {String} Column to count.
         * @return {guaraiba.orm.QueryBuilder}
         */
        min: function (column) {
            return this._aggregator('min', column);
        },

        /**
         * Adds the aggregator function "max" in the currernt query.
         *
         * @param column {String} Column to count.
         * @return {guaraiba.orm.QueryBuilder}
         */
        max: function (column) {
            return this._aggregator('max', column);
        },

        /**
         * Adds the aggregator function "sum" in the currernt query.
         *
         * @param column {String} Column to count.
         * @return {guaraiba.orm.QueryBuilder}
         */
        sum: function (column) {
            return this._aggregator('sum', column);
        },

        /**
         * Adds the aggregator function "avg" in the currernt query.
         *
         * @param column {String} Column to count.
         * @return {guaraiba.orm.QueryBuilder}
         */
        avg: function (column) {
            return this._aggregator('avg', column);
        },

        /**
         * Adds the clause "group by" in the current query.
         *
         * @param column {String} Column to count.
         * @return {guaraiba.orm.QueryBuilder}
         */
        groupBy: function (column) {
            this._query.groupBy(column);

            return this;
        },

        // END AGGEGATRO FUNCTION SECCTION //

        // START JOIN SECTION //

        /**
         * Adds the clause "join" in the current query.
         *
         * @param joinType {String} Allow values 'innerJoin', 'leftJoin', 'rightJoin', 'outerJoin' or 'crossJoin'.
         * @param foreignEntity {guaraiba.orm.Model|String} Model instance or name of model or table.
         * @param localkey {String?} Name of local field to use "ON (localkey operator foreignKey)".
         * @param operator {String?} Operator to use "ON (localkey operator foreignKey)".
         * @param foreignKey {String?} Name of foreign field to use "ON (localkey operator foreignKey)".
         * @return {guaraiba.orm.QueryBuilder}
         * @internal
         */
        _join: function (joinType, foreignEntity, localkey, operator, foreignKey) {
            var model;

            if (foreignEntity instanceof guaraiba.orm.Model) {
                model = foreignEntity;
            } else if (qx.lang.Type.isString(foreignEntity)) {
                model = this._dbSchema.getModel(foreignEntity, false);
            }

            if (model) {
                foreignEntity = model.getRelationName();
            }

            if (arguments.length == 2) {
                localkey = foreignEntity + '_id';
                operator = '=';
                foreignKey = model ? model.getIdFieldName() : 'id';
            } else if (arguments.length == 3) {
                operator = '=';
                foreignKey = model ? model.getIdFieldName() : 'id';
            } else if (arguments.length == 4) {
                foreignKey = operator;
                operator = '=';
            }

            if (!foreignKey.match(/\./)) {
                foreignKey = foreignEntity + '.' + foreignKey;
            }

            this._query[joinType](foreignEntity, localkey, operator, foreignKey);

            return this;
        },

        /**
         * Adds the clause "inner join" in the current query.
         *
         * @param foreignEntity {guaraiba.orm.Model|String} Model instance or name of model or table.
         * @param localkey {String?} Name of local field to use "ON (localkey operator foreignKey)".
         * @param operator {String?} Operator to use "ON (localkey operator foreignKey)".
         * @param foreignKey {String?} Name of foreign field to use "ON (localkey operator foreignKey)".
         * @return {guaraiba.orm.QueryBuilder}
         */
        innerJoin: function (foreignEntity, localkey, operator, foreignKey) {
            var args = qx.lang.Array.fromArguments(arguments);
            args.unshift('innerJoin')
            return this._join.apply(this, args);
        },

        /**
         * Adds the clause "left join" in the current query.
         *
         * @param foreignEntity {guaraiba.orm.Model|String} Model instance or name of model or table.
         * @param localkey {String?} Name of local field to use "ON (localkey operator foreignKey)".
         * @param operator {String?} Operator to use "ON (localkey operator foreignKey)".
         * @param foreignKey {String?} Name of foreign field to use "ON (localkey operator foreignKey)".
         * @return {guaraiba.orm.QueryBuilder}
         */
        leftJoin: function (foreignEntity, localkey, operator, foreignKey) {
            var args = qx.lang.Array.fromArguments(arguments);
            args.unshift('leftJoin')
            return this._join.apply(this, args);
        },

        /**
         * Adds the clause "right join" in the current query.
         *
         * @param foreignEntity {guaraiba.orm.Model|String} Model instance or name of model or table.
         * @param localkey {String?} Name of local field to use "ON (localkey operator foreignKey)".
         * @param operator {String?} Operator to use "ON (localkey operator foreignKey)".
         * @param foreignKey {String?} Name of foreign field to use "ON (localkey operator foreignKey)".
         * @return {guaraiba.orm.QueryBuilder}
         */
        rightJoin: function (foreignEntity, localkey, operator, foreignKey) {
            var args = qx.lang.Array.fromArguments(arguments);
            args.unshift('rightJoin')
            return this._join.apply(this, args);
        },

        /**
         * Adds the clause "outer join" in the current query.
         *
         * @param foreignEntity {guaraiba.orm.Model|String} Model instance or name of model or table.
         * @param localkey {String?} Name of local field to use "ON (localkey operator foreignKey)".
         * @param operator {String?} Operator to use "ON (localkey operator foreignKey)".
         * @param foreignKey {String?} Name of foreign field to use "ON (localkey operator foreignKey)".
         * @return {guaraiba.orm.QueryBuilder}
         */
        outerJoin: function (foreignEntity, localkey, operator, foreignKey) {
            var args = qx.lang.Array.fromArguments(arguments);
            args.unshift('outerJoin')

            return this._join.apply(this, args);
        },

        /**
         * Adds the clause "cross join" in the current query.
         *
         * @param foreignEntity {guaraiba.orm.Model|String} Model instance or name of model or table.
         * @param localkey {String?} Name of local field to use "ON (localkey operator foreignKey)".
         * @param operator {String?} Operator to use "ON (localkey operator foreignKey)".
         * @param foreignKey {String?} Name of foreign field to use "ON (localkey operator foreignKey)".
         * @return {guaraiba.orm.QueryBuilder}
         */
        crossJoin: function (foreignEntity, localkey, operator, foreignKey) {
            var args = qx.lang.Array.fromArguments(arguments);
            args.unshift('crossJoin');

            return this._join.apply(this, args);
        },

        /**
         * Adds the custom clause "join"  in the current query.
         *
         * @param sql {String}
         * @param bindings {Array?}
         * @return {guaraiba.orm.QueryBuilder}
         */
        joinRaw: function (sql, bindings) {
            this._query.joinRaw(sql, this._normalizeValue(bindings));

            return this;
        },

        // END JOIN SECCTION //

        // START WHERE SECTION //

        /**
         * Adds the condition "(column operatior value)" or "(column1 = value1) AND (column2 = value2) ..." in the current query.
         *
         * @param column {String|Map} Column name or map multi columns and values.
         * @param operator {String?} SQL conditional operatior.
         * @param values {Any?} Value to compare.
         * @return {guaraiba.orm.QueryBuilder}
         */
        where: function (column, operator, values) {
            if (typeof values == 'undefined') {
                values = operator;
                operator = '='
            }
            values = this._normalizeValue(values);
            this._query.where(column, operator, values);

            return this;
        },

        /**
         * Adds the condition "column IN ..." in the current query.
         *
         * @param column {String} Column name.
         * @param values {Array|guaraiba.orm.QueryBuilder} Array values or sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereIn: function (column, values) {
            this._query.whereIn(column, this._normalizeValue(values));

            return this;
        },

        /**
         * Adds the condition "column NOT IN ..." in the current query.
         *
         * @param column {String} Column name.
         * @param values {Array|guaraiba.orm.QueryBuilder} Array values or sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereNotIn: function (column, values) {
            this._query.whereNotIn(column, this._normalizeValue(values));

            return this;
        },

        /**
         * Adds the condition "column IS NULL" in the current query.
         *
         * @param column {String} Column name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereNull: function (column) {
            this._query.whereNull(column);

            return this;
        },

        /**
         * Adds the condition "column IS NOT NULL" in the current query.
         *
         * @param column {String} Column name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereNotNull: function (column) {
            this._query.whereNotNull(column);

            return this;
        },

        /**
         * Adds the condition "EXISTS (SUB QUERY)" in the current query.
         *
         * @param qb {guaraiba.orm.QueryBuilder} Sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereExists: function (qb) {
            this._query.whereExists(qb._query);

            return this;
        },

        /**
         * Adds the condition "NOT EXISTS (SUB QUERY)" in the current query.
         *
         * @param qb {guaraiba.orm.QueryBuilder} Sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereNotExists: function (qb) {
            this._query.whereNotExists(qb._query);

            return this;
        },

        /**
         * Adds the condition "column BETWEEN range[0] AND range[1]" in the current query.
         *
         * @param column {String} Column name.
         * @param range {Array} Array of two values.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereBetween: function (column, range) {
            range[0] = this._normalizeValue(range[0]);
            range[1] = this._normalizeValue(range[1]);
            this._query.whereBetween(column, range);

            return this;
        },

        /**
         * Adds the condition "column NOT BETWEEN range[0] AND range[1]" in the current query.
         *
         * @param column {String} Column name.
         * @param range {Array} Array of two values.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereNotBetween: function (column, range) {
            range[0] = this._normalizeValue(range[0]);
            range[1] = this._normalizeValue(range[1]);
            this._query.whereNotBetween(column, range);

            return this;
        },

        /**
         * Add custom conditions in the current query.
         *
         * @param conditions {String} Query custom conditions.
         * @param bindings {Array} Array of parameters.
         * @return {guaraiba.orm.QueryBuilder}
         */
        whereRaw: function (conditions, bindings) {
            this._query.whereRaw(conditions, this._normalizeValue(bindings));

            return this;
        },

        // START AND WHERE SECTION //

        /**
         * Adds the condition "(column operatior value)" or "(column1 = value1) AND (column2 = value2) ..." in the current query.
         *
         * @param column {String|Map} Column name or map multi columns and values.
         * @param operator {String?} SQL conditional operatior.
         * @param values {Any?} Value to compare.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhere: function (column, operator, values) {
            if (typeof values == 'undefined') {
                values = operator;
                operator = '='
            }
            values = this._normalizeValue(values);
            this._query.andWhere(column, operator, values);

            return this;
        },

        /**
         * Adds the condition "column IN ..." in the current query.
         *
         * @param column {String} Column name.
         * @param values {Array|guaraiba.orm.QueryBuilder} Array values or sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhereIn: function (column, values) {
            return this.whereIn(column, values);
        },

        /**
         * Adds the condition "column NOT IN ..." in the current query.
         *
         * @param column {String} Column name.
         * @param values {Array|guaraiba.orm.QueryBuilder} Array values or sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhereNotIn: function (column, values) {
            return this.whereNotIn(column, values);
        },

        /**
         * Adds the condition "column IS NULL" in the current query.
         *
         * @param column {String} Column name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhereNull: function (column) {
            return this.whereNull(column);
        },

        /**
         * Adds the condition "column IS NOT NULL" in the current query.
         *
         * @param column {String} Column name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhereNotNull: function (column) {
            return this.whereNotNull(column);
        },

        /**
         * Adds the condition "column BETWEEN range[0] AND range[1]" in the current query.
         *
         * @param column {String} Column name.
         * @param range {Array} Array of two values.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhereBetween: function (column, range) {
            return this.whereBetween(column, range);
        },

        /**
         * Adds the condition "column NOT BETWEEN range[0] AND range[1]" in the current query.
         *
         * @param column {String} Column name.
         * @param range {Array} Array of two values.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhereNotBetween: function (column, range) {
            return this.whereNotBetween(column, range);
        },

        /**
         * Add custom conditions in the current query.
         *
         * @param conditions {String} Query custom conditions.
         * @param bindings {Array} Array of parameters.
         * @return {guaraiba.orm.QueryBuilder}
         */
        andWhereRaw: function (conditions, bindings) {
            this._query.andWhereRaw(conditions, this._normalizeValue(bindings));

            return this;
        },

        // START OR WHERE SECTION //

        /**
         * Adds the condition "(column operatior value)" or "(column1 = value1) AND (column2 = value2) ..." in the current query.
         *
         * @param column {String|Map} Column name or map multi columns and values.
         * @param operator {String?} SQL conditional operatior.
         * @param values {Any?} Value to compare.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhere: function (column, operator, values) {
            if (typeof values == 'undefined') {
                values = operator;
                operator = '='
            }
            values = this._normalizeValue(values);
            this._query.orWhere(column, operator, values);

            return this;
        },

        /**
         * Adds the condition "column IN ..." in the current query.
         *
         * @param column {String} Column name.
         * @param values {Array|guaraiba.orm.QueryBuilder} Array values or sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhereIn: function (column, values) {
            this._query.orWhereIn(column, this._normalizeValue(values));

            return this;
        },

        /**
         * Adds the condition "column NOT IN ..." in the current query.
         *
         * @param column {String} Column name.
         * @param values {Array|guaraiba.orm.QueryBuilder} Array values or sub query builder.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhereNotIn: function (column, values) {
            this._query.orWhereNotIn(column, this._normalizeValue(values));

            return this;
        },

        /**
         * Adds the condition "column IS NULL" in the current query.
         *
         * @param column {String} Column name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhereNull: function (column) {
            this._query.orWhereNull(column);

            return this;
        },

        /**
         * Adds the condition "column IS NOT NULL" in the current query.
         *
         * @param column {String} Column name.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhereNotNull: function (column) {
            this._query.orWhereNotNull(column);

            return this;
        },

        /**
         * Adds the condition "column BETWEEN range[0] AND range[1]" in the current query.
         *
         * @param column {String} Column name.
         * @param range {Array} Array of two values.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhereBetween: function (column, range) {
            range[0] = this._normalizeValue(range[0]);
            range[1] = this._normalizeValue(range[1]);
            this._query.orWhereBetween(column, range);

            return this;
        },

        /**
         * Adds the condition "column NOT BETWEEN range[0] AND range[1]" in the current query.
         *
         * @param column {String} Column name.
         * @param range {Array} Array of two values.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhereNotBetween: function (column, range) {
            range[0] = this._normalizeValue(range[0]);
            range[1] = this._normalizeValue(range[1]);
            this._query.orWhereNotBetween(column, range);

            return this;
        },

        /**
         * Adds a custom conditions in the current query.
         *
         * @param conditions {String} Query custom conditions.
         * @param bindings {Array} Array of parameters.
         * @return {guaraiba.orm.QueryBuilder}
         */
        orWhereRaw: function (conditions, bindings) {
            this._query.orWhereRaw(conditions, this._normalizeValue(bindings));

            return this;
        },

        // END WHERE SECTION //

        /**
         * Returns query as string.
         *
         * @return {String}
         */
        toString: function () {
            return this._query.toString();
        },

        /**
         * Returns query as SQL string.
         *
         * @return {String}
         */
        toSQL: function () {
            return this._query.toSQL();
        },

        /**
         * Returns KNex query instance.
         *
         * @return {KNex}
         */
        toKnex: function () {
            return this._query;
        },

        /**
         * Create guaraiba record class instances from result query.
         *
         * This method seted or udated record in the cache of model.
         *
         * @param data {Object|Array} Row or rows data.
         * @return {guaraiba.orm.Record|Array|null}
         * @internal
         */
        _hydrateRecord: function (data) {
            var vThis = this,
                result = null;

            if (!vThis._hydrateResultRecord) {
                return data;
            }

            if (qx.lang.Type.isArray(data)) {
                result = [];
                data.forEach(function (n) {
                    result.push(vThis._hydrateRecord(n));
                }, this);
            } else if (qx.lang.Type.isObject(data)) {
                var idFieldName = this._model.getIdFieldName(),
                    cache = guaraiba.orm.Model.getCacheRecords(this._model.getModelName());

                result = cache[data[idFieldName]];
                if (!result) {
                    result = new (this._model.getRecordClass())(data, this._dbSchema);
                    cache[data[idFieldName]] = result;
                } else {
                    result.fromDataObject(data);
                }

                result.setNewRecord(false);
            }

            return result;
        },

        /**
         * Normalizes values used in the clauses where or join.
         *
         * @param values {var|guaraiba.orm.QueryBuilder|Array} Value or values to normalize.
         * @return {var|KNex|Array}
         * @internal
         */
        _normalizeValue: function (values) {
            if (qx.lang.Type.isArray(values)) {
                values.forEach(function (v, i) {
                    values[i] = this._normalizeValue(v);
                }, this)
            } else {
                if (values instanceof guaraiba.orm.QueryBuilder) values = values.toKnex();
                if (qx.lang.Type.isDate(values)) values = values.toISOString();
                if (qx.lang.Type.isBoolean(values)) values = values ? 'true' : 'false';
            }

            return values;
        }
    }

});