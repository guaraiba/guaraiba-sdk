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
     * Constructor
     *
     * @param request {guaraiba.Request}
     * @param response {guaraiba.Response}
     * @param params {Object} Request parameters hash.
     */
    construct: function (request, response, params) {
        this.base(arguments, request, response, params);
        this.beforeOnly('_requireRecord', ['show', 'update', 'destroy']);
        this.beforeOnly('_parseFilters', ['index', 'count']);
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
            check: 'Object',
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
         * @param params {Object} Request parameters hash.
         */
        indexAction: function (request, response, params) {
            this._prepareCount(qx.lang.Function.bind(function (qb) {
                qb.then(function (err, count) {
                    if (!this.respondError(err)) {
                        count = count[0].count * 1;
                        if (count == 0) {
                            this.respond({
                                type: this.getRecordClassName(),
                                count: 0,
                                data: []
                            });
                        } else {
                            this._prepareSelectAll(qx.lang.Function.bind(function (qb) {
                                qb.then(function (err, records) {
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
                            }, this));
                        }
                    }
                }, this);
            }, this));
        },

        /**
         * Action to count the records filterings with conditions given in the request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Object} Request parameters hash.
         */
        countAction: function (request, response, params) {
            this._prepareCount(qx.lang.Function.bind(function (qb) {
                qb.then(function (err, count) {
                    this.respondError(err) || this.respond({
                        type: this.getRecordClassName(),
                        count: count[0].count * 1
                    });
                }, this);
            }, this));
        },

        /**
         * Action to find record with id given by request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Object} Request parameters hash with id field: Ex: <code>{ id: 1 }</code>.
         */
        showAction: function (request, response, params) {
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
        _requireRecord: function (done) {
            var params = this.getParams(),
                idFieldName = this.getIdFieldName(),
                id = params.id || params[idFieldName];

            this._prepareSelectById(qx.lang.Function.bind(function (qb) {
                qb.then(function (err, record) {
                    if (!this.respondError(err)) {
                        if (record) {
                            this._record = record;
                        } else {
                            this.respordWithStatusNotFound(Error(
                                "Not found record of " + this.getRecordClassName() +
                                " with (" + idFieldName + " = '" + id + "')."
                            ));
                        }
                        done.call(this);
                    }
                }, this);
            }, this));
        },

        /**
         * Decode params filters.
         *
         * @param done {Function} Callback function
         */
        _parseFilters: function (done) {
            var params = this.getParams();

            params.filters = params.filters || {};
            if (qx.lang.Type.isString(params.filters)) {
                params.filters = this.getRequest().parseJson(params.filters);
            }

            done.call(this);
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
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        _prepareCount: function (done) {
            var qb = this.createQueryBuilder().count('*');

            this._prepareWhereConditions(qb, done);
        },

        /**
         * Prepare query to select all records.
         *
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        _prepareSelectAll: function (done) {
            var params = this.getParams(),
                qb = this.createQueryBuilder();

            if (params.end != '-') {
                params.start = (params.start || 0) * 1;
                params.end = (params.end || (params.start + this.getPageSize() - 1)) * 1;

                var offset = params.start,
                    limit = Math.max(0, params.end - params.start + 1);

                qb.offset(params.start, limit);
            }

            this._prepareOrderBy(qb, qx.lang.Function.bind(function (qb) {
                this._prepareWhereConditions(qb, done);
            }, this));
        },

        /**
         * Prepare query to select one record with id given by request parameters
         * to be used in show, update or destroy actions.
         *
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        _prepareSelectById: function (done) {
            var params = this.getParams(),
                idFieldName = this.getIdFieldName(),
                qb = this.createQueryBuilder().first('*').where(idFieldName, params.id || params[idFieldName]);

            if (qx.Interface.objectImplements(this, guaraiba.controllers.IAccessControlListToResources)) {
                this.applyAccessControlListWhereConditionsToResources(qb, done);
            } else {
                done.call(this, qb);
            }
        },

        /**
         * Prepare sql where clause, constructed from the request parameters to be used in index or count actions.
         *
         * @param qb {guaraiba.orm.QueryBuilder}
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         */
        _prepareWhereConditions: function (qb, done) {
            var params = this.getParams(),
                acceptFilters = this.getAcceptFilters(),
                fields;

            if (qx.lang.Type.isArray(acceptFilters)) {
                // Allow filter only by fields defined in controller.
                fields = acceptFilters;
            } else if (acceptFilters === true) {
                // Allow filter for any fields passed by parameter.
                fields = Object.keys(params.filters);
            }

            if (fields) {
                // Extract value of each filter fields from params.
                fields = guaraiba.array.intersect(fields, Object.keys(params.filters));

                // Add andWhere condition for each field in params.filters.
                fields.forEach(function (field) {
                    if (field != '_quick_search_') {
                        var _field = this._toUnderscoreCase(field);

                        if (qx.lang.Type.isObject(params.filters[field])) {
                            if (params.filters[field].v === null) {
                                if (params.filters[field].o == '=') {
                                    qb.andWhereNull(_field);
                                } else {
                                    qb.andWhereNotNull(_field);
                                }
                            } else {
                                qb.andWhere(_field, params.filters[field].o || '=', params.filters[field].v);
                            }
                        } else if (qx.lang.Type.isArray(params.filters[field])) {
                            qb.andWhereIn(_field, params.filters[field]);
                        } else {
                            if (params.filters[field] === null) {
                                qb.andWhereNull(_field);
                            } else {
                                qb.andWhere(_field, params.filters[field]);
                            }
                        }
                    }
                }, this);
            }

            // Add orWhere like condition for each field of text type.
            if (params.filters._quick_search_) {
                var textFiels = [];

                this.getModel().getProperties().forEach(function (propertie) {
                    if (propertie.check == guaraiba.orm.DBSchema.String || propertie.check == guaraiba.orm.DBSchema.Text) {
                        textFiels.push(this._toUnderscoreCase(propertie.qxName));
                    }
                }, this);

                if (textFiels.length) {
                    qb.andWhere(function (knex) {
                        textFiels.forEach(function (field) {
                            knex.orWhere(field, 'LIKE', '%' + params.filters._quick_search_ + '%');
                        }, this);
                    });
                }
            }

            if (qx.Interface.objectImplements(this, guaraiba.controllers.IAccessControlListToResources)) {
                this.applyAccessControlListWhereConditionsToResources(qb, done);
            } else {
                done.call(this, qb);
            }
        },

        /**
         * Prepare sql order by clause, constructed from the request parameters to be used in index actions.
         *
         * @param qb {guaraiba.orm.QueryBuilder}
         * @param done {Function} Callback function with guaraiba.orm.QueryBuilder argument Ex: function(qb) {...}
         * @return {guaraiba.orm.QueryBuilder}
         */
        _prepareOrderBy: function (qb, done) {
            var params = this.getParams(),
                orders = params.order ? this._parseOrderBy(params.order) : this.getDefaultOrder();

            if (orders) {
                Object.keys(orders).forEach(function (field) {
                    qb.orderBy(this._toUnderscoreCase(field), orders[field]);
                }, this);
            }

            done.call(this, qb);
        },

        /**
         * Returns array with each order field.
         *
         * @param strOrderBy {String} String with order field Ex: "createAt, name".
         * @return {Array}
         */
        _parseOrderBy: function (strOrderBy) {
            var items = strOrderBy.replace(/\s+,\s+/g, ',').split(/,/),
                order, orders = {};

            items.forEach(function (item) {
                order = item.split(/\s+/);
                orders[order[0]] = order[1] || 'ASC';
            })

            return orders;
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