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
 * Relations mixin for guaraiba.orm.Record.
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
