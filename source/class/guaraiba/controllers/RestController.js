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
 * This class offers the basic properties and features to create a REST controller.
 */
qx.Class.define('guaraiba.controllers.RestController', {
    type: 'abstract',
    extend: guaraiba.Controller,
    include: [guaraiba.controllers.MSafety, guaraiba.utils.MInflection],

    /**
     * @param request {guaraiba.Request}
     * @param response {guaraiba.Response}
     * @param params {Map?} Params map object.
     */
    construct: function (request, response, params) {
        this._acceptFilters = true;

        this.base(arguments, request, response, params);
        this.beforeOnly(this._requireRecord, ['show', 'update', 'destroy']);
    },

    properties: {
        /** Default page size used in the SQL LIMIT clause. */
        pageSize: {
            check: 'Number',
            init: 10
        },

        /** Name of id field of table or model. */
        idFieldName: {
            check: 'String',
            init: 'id'
        },

        /** Default order used in the SQL ORDER BY clause. */
        defaultOrder: {
            check: 'String',
            nullable: true
        },

        /**
         * @type {Array|Boolean}
         * List of fields that cant be used in prepare where condition.
         * If value is true then cant be used all fileds from filters request params.
         */
        acceptFilters: {
            nullable: true
        }
    },

    members: {
        _record: null,

        /**
         * Action to select all the records filterings with conditions given in the request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map?} Params map object.
         */
        index: function (request, response, params) {
            this._prepareCount().then(function (err, count) {
                if (!this.respondError(err)) {
                    count = count[0].count * 1;
                    if (count == 0) {
                        this.respond({
                            type: this.getRecordClassName(),
                            count: 0,
                            data: []
                        });
                    } else {
                        this._prepareSelectAll().then(function (err, records) {
                            this.respondError(err) || this._prepareItems(records, function (err, items) {
                                this.respondError(err) || this.respond({
                                    type: this.getRecordClassName(),
                                    count: count,
                                    data: items,
                                    start: params.start,
                                    end: Math.max(0, params.start + records.length - 1),
                                    order: params.order
                                });
                            });
                        }, this);
                    }
                }
            }, this);
        },

        /**
         * Action to count the records filterings with conditions given in the request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map?} Params map object.
         */
        count: function (request, response, params) {
            this._prepareCount().then(function (err, count) {
                this.respondError(err) || this.respond({
                    type: this.getRecordClassName(),
                    count: count[0].count * 1
                });
            }, this);
        },

        /**
         * Action to find record with id given by request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map} Params map object with id field: Ex: <code>{ id: 1 }</code>.
         */
        show: function (request, response, params) {
            this._prepareItem(this._record, function (err, item) {
                this.respondError(err) || this.respond({
                    type: this.getRecordClassName(),
                    count: 1,
                    data: item
                });
            });
        },

        /**
         * Find the record with id given as parameter of request.
         * Responds with page not found if the record doesn't exist in database.
         *
         * @param done {Function} Callback function
         */
        _requireRecord: function requireRecord(done) {
            var params = this.getParams(),
                idFieldName = this.getIdFieldName(),
                id = params.id || params[idFieldName];

            this._prepareSelectById().then(function (err, record) {
                if (!this.respondError(err)) {
                    if (record) {
                        this._record = record;
                    } else {
                        this.respordWithStatusNotFound("Not found record of " + this.getRecordClassName() + " with (" + idFieldName + " = '" + id + "').");
                    }
                    done();
                }
            }, this);
        },

        /**
         * Prepare item as a Map with the fields of the record returned by toDataObject method.
         * Item is same record if the method don't exist.
         *
         * @param record {guaraiba.orm.Record|Map}
         * @param done {Function} Callback function with two argument Ex: function(err, item) {...}
         */
        _prepareItem: function (record, done) {
            done.call(this, null, record.toDataObject ? record.toDataObject() : record);
        },

        /**
         * Prepare items as a array of Map with fields of records.
         *
         * @param records {Array} Collection of guaraiba.orm.Record or Maps.
         * @param done {Function} Callback function with two argument Ex: function(err, items) {...}
         */
        _prepareItems: function (records, done) {
            var vThis = this, actions = [];

            records.forEach(function (record, index) {
                actions.push(function (done) {
                    vThis._prepareItem(record, done);
                });
            });

            guaraiba.async.parallel(actions, function (err, items) {
                done.call(vThis, err, items);
            });
        },

        /**
         * Prepare query to count records over defined idFieldName property.
         *
         * @return {guaraiba.orm.QueryBuilder}
         * @see guaraiba.controllers.RestController#idFieldName
         */
        _prepareCount: function () {
            var qb = this.createQueryBuilder().count('*');

            return this._prepareWhereConditions(qb);
        },

        /**
         * Prepare query to select all records.
         *
         * @return {guaraiba.orm.QueryBuilder}
         */
        _prepareSelectAll: function () {
            var params = this.getParams(),
                qb = this.createQueryBuilder();

            if (params.end != '-') {
                params.start = (params.start || 0) * 1;
                params.end = (params.end || (params.start + this.getPageSize() - 1)) * 1;

                var offset = params.start,
                    limit = Math.max(0, params.end - params.start + 1);

                qb.offset(params.start, limit);
            }

            this._prepareOrderBy(qb);

            return this._prepareWhereConditions(qb);
        },

        /**
         * Prepare query to select one record with id given by request parameters
         * to be used in show, update or destroy actions.
         *
         * @return {guaraiba.orm.QueryBuilder}
         */
        _prepareSelectById: function () {
            var params = this.getParams(),
                idFieldName = this.getIdFieldName(),
                qb = this.createQueryBuilder().first('*').where(idFieldName, params.id || params[idFieldName]);

            return qb;
        },

        /**
         * Prepare sql where clausule, constructed from the request parameters to be used in index or count actions.
         *
         * @param qb {guaraiba.orm.QueryBuilder}
         * @return {guaraiba.orm.QueryBuilder}
         */
        _prepareWhereConditions: function (qb) {
            var params = this.getParams(),
                acceptFilters = this.getAcceptFilters(),
                op, fields;

            params.filters = params.filters || {};

            if (qx.lang.Type.isString(params.filters)) {
                params.filters = this.getRequest().parseJson(params.filters);
            }

            if (qx.lang.Type.isArray(acceptFilters)) {
                // Allow filter only by fields defined in controller.
                fields = acceptFilters
            } else if (acceptFilters === true) {
                // Allow filter for any fields passed by parameter.
                fields = Object.keys(params.filters)
            } else {
                // Dont not use any filters.
                return qb;
            }

            // Extract value of each filter fields from params.
            fields = guaraiba.array.intersect(fields, Object.keys(params.filters));
            fields.forEach(function (field) {
                var _field = this._toUnderscoreCase(field);

                if (qx.lang.Type.isObject(params.filters[field])) {
                    qb.andWhere(_field, params.filters[field].o || '=', params.filters[field].v);
                } else if (qx.lang.Type.isArray(params.filters[field])) {
                    qb.andWhereIn(_field, params.filters[field]);
                } else {
                    qb.andWhere(_field, params.filters[field]);
                }
            }, this);

            return qb;
        },

        /**
         * Prepare sql order by clausule, constructed from the request parameters to be used in index actions.
         *
         * @param qb {guaraiba.orm.QueryBuilder}
         * @return {guaraiba.orm.QueryBuilder}
         */
        _prepareOrderBy: function (qb) {
            var params = this.getParams();

            params.order = params.order || this.getDefaultOrder();

            if (params.order) {
                var order = params.order.split(' ');
                qb.orderBy(this._toUnderscoreCase(order[0]), order[1]);
            }
        },

        /**
         * Normalize data tranformed all field name to underscore case and removed fileds with undefined value.
         *
         * @param data {Map}
         * @return {Map}
         * @internal
         */
        _normalizeData: function (data) {
            var nData = {},
                idFieldName = this.getIdFieldName(),
                _name, value;

            Object.keys(data).forEach(function (name) {
                _name = this._toUnderscoreCase(name)

                value = data[name];
                if (typeof value != 'undefined') {
                    if (_name != idFieldName || value !== '' || value !== null) {
                        nData[_name] = value;
                    }
                }
            }, this);

            return nData;
        }
    }
});