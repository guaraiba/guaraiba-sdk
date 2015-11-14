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
 * This mixin offers the basic features to do work with serial id in guaraiba.orm.Record.
 */
qx.Mixin.define('guaraiba.orm.MSerial', {
    members: {
        /**
         * Hook to execute before save record.
         * Calculate next id and update last id for current record entity.
         *
         * @param done {Function} Resume function with one boolean argument Ex: function(resume) {...}
         */
        _beforeSaveSerialId: function (done) {
            var model = this.getModel(),
                idFieldName = model.getIdFieldName(),
                idFieldValue = this.get(idFieldName);

            if (model.isSerialId() && idFieldValue === null) {
                model.max(idFieldName, function (err, data) {
                    if (err) throw err;
                    this.set(idFieldName, (data[0] || {}).max + 1 || 1);
                    done(true);
                }, this);
            } else {
                done(true);
            }
        }
    }
});
