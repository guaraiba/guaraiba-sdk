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
 * This mixin offers the basic properties and features to add timestamp fields in guaraiba.orm.Record.
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
                if (!this.getCreatedAt()) {
                    this.setCreatedAt(date);
                    this.setUpdatedAt(date);
                } else if (!this.getUpdatedAt()) {
                    this.setUpdatedAt(this.getCreatedAt());
                }
            } else {
                this.setUpdatedAt(date);
            }

            done(true);
        }
    }
});
