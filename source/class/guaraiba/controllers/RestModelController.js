/**
 * This class offers the basic properties and features to create a REST controller for a entity of the guaraiba ORM.
 */
qx.Class.define('guaraiba.controllers.RestModelController', {
    type: 'abstract',
    extend: guaraiba.controllers.RestController,

    properties: {
        /** ORM model instance */
        restModel: {
            check: 'guaraiba.orm.Model',
            apply: '_applyResModel'
        }
    },

    members: {

        /**
         * Action to create new record with attrs given by request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Object} Request parameters hash. <code>{ items: {field1: 'v1', ... fieldN: 'vN'} }</code>.
         */
        createAction: function (request, response, params) {
            var items = params.items || {},
                qb = this.createQueryBuilder();

            if (qx.lang.Type.isString(items)) {
                items = request.parseJson(items);
            }

            items = this._normalizeData(items);

            var model = this.getModel(),
                record = new (model.getRecordClass())(items, model.getDBSchema());

            record.save(function (err, record) {
                this.respondError(err) || this._prepareItem(record, function (err, item) {
                    if (!this.respondError(err)) {
                        var done = qx.lang.Function.bind(function(){
                            this.respond({
                                type: this.getRecordClassName(),
                                id: record.get(this.getIdFieldName()),
                                data: item
                            });
                        }, this);

                        if (qx.Interface.objectImplements(this, guaraiba.controllers.IAccessControlListToResources)) {
                            this.saveAccessControlListToResources(record, done);
                        } else {
                            done();
                        }
                    }
                });
            }, this);
        },

        /**
         * Action to update record with id and attrs given by request parameters.
         *
         * @param request {guaraiba.Request}
         * @param response {guaraiba.Response}
         * @param params {Object} Request parameters hash with id field: Ex: <code>{ id: 1, items: {field1: 'v1', ... fieldN: 'vN'} }</code>.
         */
        updateAction: function (request, response, params) {
            var items = params.items || {};

            if (qx.lang.Type.isString(items)) {
                items = request.parseJson(items);
            }

            items = this._normalizeData(items);

            this._record.fromDataObject(items);
            this._record.save(function (err, record) {
                this.respondError(err) || this._prepareItem(record, function (err, item) {
                    this.respondError(err) || this.respond({
                        type: this.getRecordClassName(),
                        id: record.get(this.getIdFieldName()),
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
         * @param params {Object} Request parameters hash with id field: Ex: <code>{ id: 1 }</code>.
         */
        destroyAction: function (request, response, params) {
            this._record.destroy(function (err, record) {
                this.respondError(err) || this._prepareItem(record, function (err, item) {
                    var done = qx.lang.Function.bind(function () {
                        this.respond({
                            type: this.getRecordClassName(),
                            id: record.get(this.getIdFieldName()),
                            data: item
                        });
                    }, this);

                    if (qx.Interface.objectImplements(this, guaraiba.controllers.IAccessControlListToResources)) {
                        this.destroyAccessControlListToResources(record, done);
                    } else {
                        done();
                    }
                });
            }, this);
        },

        /**
         * Returns record class name.
         *
         * @return {String}
         */
        getRecordClassName: function () {
            return this.getModel().getRecordClass().classname
        },

        /**
         * Update rest model instance from given record class.
         *
         * @param recordClass {Class} ORM record class.
         * @param dbSchema {guaraiba.orm.DBSchema|String?'default'} Database connection schema instance or identification name.
         */
        setRecordClass: function (recordClass, dbSchema) {
            this.setRestModel(this.getModel(recordClass, dbSchema));
        },

        /**
         * Returns model instance for given record class or model name.
         *
         * @param classOrName {Class|String?} ORM record class or model class name.
         * @param dbSchema {String?'default'} Database schema name.
         * @return {guaraiba.orm.Model}
         */
        getModel: function (classOrName, dbSchema) {
            if (arguments.length == 0) {
                return this.getRestModel();
            } else {
                return this.base(arguments, classOrName, dbSchema);
            }
        },

        /**
         * Create query builder over defined restModel propety.
         *
         * @return {guaraiba.orm.QueryBuilder}
         * @see guaraiba.controllers.RestModelController#resModel
         */
        createQueryBuilder: function () {
            return this.getModel().createQueryBuilder();
        },

        /**
         * Update id field name when resmodel was change.
         *
         * @param model {guaraiba.orm.Model}
         * @internal
         */
        _applyResModel: function (model) {
            this.setIdFieldName(model.getIdFieldName())
        }
    }
});