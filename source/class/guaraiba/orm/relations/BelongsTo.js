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
 * This class offers the basic features and properties to create BelongsTo relations.
 */
qx.Class.define('guaraiba.orm.relations.BelongsTo', {
    extend: qx.core.Object,
    include: [guaraiba.utils.MInflection],

    /**
     * Declare belongsTo relation
     *
     * @param currentRecord {guaraiba.orm.Record} Current record instance.
     * @param foreignModel {guaraiba.orm.Model} Instance of foreign model to relate to the current record.
     * @param foreignKey {String?} Foreign key name.
     */
    construct: function (currentRecord, foreignModel, foreignKey) {

        if (!foreignKey) {
            foreignKey = foreignModel.getModelName();
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
         * Get the records related to the current record.
         *
         * @param callback {Function} Callback function with two argument Ex: function(err, record) {...}
         * @param scope {Object?} Callback function scope.
         */
        get: function (callback, scope) {
            var id = this.getCurrentRecord().get(this._toCamelCase(this.getForeignKey(), true));

            this.getForeignModel().find(id, callback, scope);
        }
    }
});
