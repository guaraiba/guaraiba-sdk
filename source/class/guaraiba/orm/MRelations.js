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
 * This mixin offers the basic features to do relations in guaraiba.orm.Record.
 */
qx.Mixin.define('guaraiba.orm.MRelations', {
    members: {

        /**
         * Declare hasMany relation
         *
         * @param foreignRecordClass {guaraiba.orm.Record} Foreign record class.
         * @param foreignKey {String?} Foreign key name
         * @return {guaraiba.orm.Model} Foreign model
         */
        hasMany: function (foreignRecordClass, foreignKey) {
            var foreignModel = guaraiba.orm.Model.getModel(foreignRecordClass, this.__dbSchema),
                relation = new guaraiba.orm.relations.HasMany(this, foreignModel, foreignKey);

            return relation;
        },

        /**
         * Declare belongsTo relation
         *
         * @param foreignRecordClass {guaraiba.orm.Record} Foreign record class.
         * @param foreignKey {String?} Foreign key name
         * @return {guaraiba.orm.Model} Foreign model
         */
        belongsTo: function (foreignRecordClass, foreignKey) {
            var foreignModel = guaraiba.orm.Model.getModel(foreignRecordClass, this.__dbSchema),
                relation = new guaraiba.orm.relations.BelongsTo(this, foreignModel, foreignKey);

            return relation;
        }
    }
});
