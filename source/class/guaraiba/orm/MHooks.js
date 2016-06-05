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
 * This mixin offers the basic features to do hooks in guaraiba.orm.Record.
 */
qx.Mixin.define('guaraiba.orm.MHooks', {
    members: {

        /**
         * Hook to execute before save record.
         *
         * @param done {Function} Resume function with one boolean argument Ex: function(resume) {...}
         */
        beforeSave: function (done) {
            this._beforeSaveSerialId(function (resume) {
                if (resume === true) {
                    if (this._beforeSaveTimestampRecord) {
                        this._beforeSaveTimestampRecord(done);
                    } else {
                        done.call(this, true);
                    }
                } else {
                    done.call(this, false);
                }
            });
        },

        /**
         * Hook to execute after save record.
         *
         * @param err {Error|Null}
         * @param done {Function} Resume function without arguments.
         */
        afterSave: function (err, done) {
            done();
        },

        /**
         * Hook to execute before destroy record.
         *
         * @param done {Function} Resume function with one boolean argument Ex: function(resume) {...}
         */
        beforeDestroy: function (done) {
            done(true);
        },

        /**
         * Hook to execute after destroy record.
         *
         * @param err {Error|Null}
         * @param done {Function} Resume function without arguments.
         */
        afterDestroy: function (err, done) {
            done();
        }
    }
});
