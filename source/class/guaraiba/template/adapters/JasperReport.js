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
 * The JasperReports Library is the world's most popular open source reporting engine.
 * It is entirely written in Java and it is able to use data coming from any kind of data source and produce
 * pixel-perfect documents that can be viewed, printed or exported in a variety of document formats including
 * HTML, PDF, Excel, OpenOffice and Word.
 *
 *
 * Full documentation is at {@link https://community.jaspersoft.com/project/jasperreports-library}
 */
qx.Class.define('guaraiba.template.adapters.JasperReport', {
    type: 'singleton',
    extend: guaraiba.template.adapters.Common,

    construct: function () {
        this._engine = guaraiba.template.engines.JasperReport.getInstance();
    },

    properties: {
        /** Path to the report design in jrxml format. */
        jrxml: {
            check: 'String',
            nullable: true
        }
    },

    members: {
        /**
         * Compile template written in jrxml code.
         *
         * @return {Array} Jasper files retults of compile each jrxml files.
         */
        compile: function () {
            return this._engine.compile(this.getJrxml());
        }
    }
});