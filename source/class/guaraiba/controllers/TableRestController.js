/**
 * This class offers the basic properties and features to create a REST controller for a table of the database.
 */
qx.Class.define('guaraiba.controllers.TableRestController', {
    type: 'abstract',
    extend: guaraiba.controllers.RestController,
    include: [guaraiba.controllers.MSafety],

    properties: {
        /** Name of table in database */
        tableName: {
            check: 'String',
            nullable: false
        }
    },

    members: {

        /**
         * Action to create new record with attrs given by request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map} Params map object. <code>{ items: {field1: 'v1', ... fieldN: 'vN'} }</code>.
         */
        create: function (request, response, params) {
            var items = params.items || {},
                qb = this.createQueryBuilder();

            if (qx.lang.Type.isString(items)) {
                items = request.parseJson(items);
            }

            items = this._normalizeData(items);

            qb.insert(items, '*').then(function (err, record) {
                this.respondError(err) || this._prepareItem(record, function (err, item) {
                    this.respondError(err) || this.respond({
                        type: this.getRecordClassName(),
                        id: record[this.getIdFieldName()],
                        data: item
                    });
                });
            }, this);
        },

        /**
         * Action to update record with id and attrs given by request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map} Params map object with id field: Ex: <code>{ id: 1, items: {field1: 'v1', ... fieldN: 'vN'} }</code>.
         */
        update: function (request, response, params) {
            var qb = this.createQueryBuilder(),
                idFieldName = this.getIdFieldName(),
                id = params.id || params[idFieldName],
                items = params.items || {};

            if (qx.lang.Type.isString(items)) {
                items = request.parseJson(items);
            }

            qb.update(items, '*').where(idFieldName, id).then(function (err, record) {
                this.respondError(err) || this._prepareItem(record, function (err, item) {
                    this.respondError(err) || this.respond({
                        type: this.getRecordClassName(),
                        id: record[this.getIdFieldName()],
                        data: item
                    });
                });
            }, this);
        },

        /**
         * Action to remove record with id given by request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Map} Params map object with id field: Ex: <code>{ id: 1 }</code>.
         */
        destroy: function (request, response, params) {
            var qb = this.createQueryBuilder(),
                idFieldName = this.getIdFieldName(),
                id = params.id || params[idFieldName];

            qb.remove('*').where(idFieldName, id).then(function (err, record) {
                this.respondError(err) || this._prepareItem(record, function (err, item) {
                    this.respondError(err) || this.respond({
                        type: this.getRecordClassName(),
                        id: record[this.getIdFieldName()],
                        data: item
                    });
                });
            }, this);
        },

        /**
         * Returns record class name.
         *
         * @return {String}
         */
        getRecordClassName: function () {
            return this.getTableName();
        },

        /**
         * Create query builder over defined tableName propety.
         *
         * @return {guaraiba.orm.QueryBuilder}
         * @see guaraiba.controllers.ModelRestController#tableName
         */
        createQueryBuilder: function () {
            return this.getDBSchema().createQueryBuilder().from(this.getTableName());
        }
    }
});