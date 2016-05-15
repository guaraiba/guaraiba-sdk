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
                    done.call(this, true);
                }, this);
            } else {
                done.call(this, true);
            }
        }
    }
});
