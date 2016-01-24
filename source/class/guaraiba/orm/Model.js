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
 * This class offers the basic properties and features to create models for persist objects.
 */
qx.Class.define('guaraiba.orm.Model', {
    type: 'abstract',
    extend: qx.core.Object,
    include: [guaraiba.orm.MQuery, guaraiba.utils.MInflection],

    statics: {
        /**
         * Get singleton instance of class model for management given class record.
         *
         * @param recordClass {Class} Class for instances record of this model.
         * @param dbSchema {guaraiba.orm.DBSchema} Database schema.
         * @return {guaraiba.orm.Model}
         */
        getModel: function (recordClass, dbSchema) {
            var ModelClass,
                modelClassName = recordClass.classname + 'Model',
                model = dbSchema.getModel(modelClassName, false);

            if (!model) {
                if (!qx.Class.isDefined(modelClassName)) {
                    ModelClass = qx.Class.define(modelClassName, { extend: guaraiba.orm.Model });
                } else {
                    ModelClass = qx.Class.getByName(modelClassName);
                }

                model = new ModelClass(recordClass, dbSchema);
            }

            return model;
        },

        _cacheRecords: {},

        /**
         * Returns records in cache of given model name.
         *
         * @param modelName {String}
         * @return {Array|Null}
         */
        getCacheRecords: function (modelName) {
            var cache = guaraiba.orm.Model._cacheRecords[modelName];

            if (!cache) {
                cache = guaraiba.orm.Model._cacheRecords[modelName] = {};
            }

            return cache;
        }
    },

    /**
     * Constructor
     *
     * @param recordClass {Class} Class for instances record of this model.
     * @param dbSchema {guaraiba.orm.DBSchema} Instance of register database connection schema.
     */
    construct: function (recordClass, dbSchema) {
        this.setDBSchema(dbSchema);
        this.setRecordClass(recordClass);
    },

    properties: {

        /** Instance of register database connection schema. */
        DBSchema: {
            check: 'guaraiba.orm.DBSchema'
        },

        /** Class for instances record of this model. */
        recordClass: {
            check: 'Class'
        }
    },

    members: {

        /**
         * Get the unique name that identify this model in the database schema adapter.
         *
         * @return {String} Model name.
         */
        getModelName: function () {
            return this.getRecordClass().classname;
        },

        /**
         * Get the unique name that identify this model in the database schema adapter without commun prefix.
         *
         * @return {String} Model name.
         */
        getShortModelName: function () {
            return this.getRecordClass().classname
                .replace(this.getDBSchema().getModelPrefixName(), '')
                .replace(/^\./, '');
        },

        /**
         * Get property definition map for record class.
         *
         * @return {Map} Properties map.
         * @ignore(Map)
         */
        getProperties: function () {
            if (!this.__properties) {
                var rProperties = qx.util.PropertyUtil.getProperties(this.getRecordClass()),
                    mProperties = new Map(),
                    field;

                rProperties && Object.keys(rProperties).forEach(function (name) {
                    field = this._toUnderscoreCase(name);
                    mProperties.set(field, {
                        qxName: name,
                        check: rProperties[name]['check'],
                        defaultValue: rProperties[name]['init'],
                        isRequired: rProperties[name]['nullable'] !== true,
                        isSerial: rProperties[name]['check'] === guaraiba.orm.DBSchema.Serial
                    });
                }, this);

                this.__properties = mProperties;
            }
            return this.__properties;
        },

        /**
         * Returns name of relation (table) in database.
         *
         * @return {String}
         */
        getRelationName: function () {
            var recordClass = this.getRecordClass(),
                prefix = this.getDBSchema().getModelPrefixName(),
                tableName = recordClass.classname.replace(prefix, '').replace(/^(.*models\.)|\./, '');

            return recordClass.tableName || this._toUnderscoreCase(tableName);
        },

        /**
         * Returns name of id field of relation (table) in database.
         *
         * @return {string}
         */
        getIdFieldName: function () {
            return this.getRecordClass().idFieldName || 'id';
        },

        /**
         * Returns KNex connection instance.
         *
         * @return {KNex}
         */
        getKNex: function () {
            return this.getDBSchema().getKNex();
        },

        isSerialId: function () {
            var idFieldName = this._toUnderscoreCase(this.getIdFieldName());

            return this.getProperties().get(idFieldName).isSerial
        },

        /**
         * Clear cache of this model.
         */
        clearCache: function () {
            guaraiba.orm.Model._cacheRecords[this.getModelName()] = {};
        }
    }

});