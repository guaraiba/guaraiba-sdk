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
 * Hooks mixin for guaraiba.orm.Record.
 */
qx.Mixin.define('guaraiba.orm.MTimestampRecord', {
    properties: {
        /** Created at column. */
        createdAt: {
            check: 'guaraiba.orm.DBSchema.Date',
            nullable: true
        },

        /** Updated at column. */
        updatedAt: {
            check: 'guaraiba.orm.DBSchema.Date',
            nullable: true
        }
    },

    members: {
        /**
         * Hook to execute before save record.
         * Set current date in createdAt and updatedAt properties.
         *
         * @param done {Function} Resume function with one boolean argument Ex: function(resume) {...}
         */
        _beforeSaveTimestampRecord: function (done) {
            var date = new Date();

            if (this.isNewRecord()) {
                this.setCreatedAt(date);
            }
            this.setUpdatedAt(date);

            done(true);
        }
    }
});