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
 * This class offers the basic properties and features to process any supported engine template.
 * Supported engines:
 * <table>
 *     <tr><th>Adapter engine</th><th>Extension</th></tr>
 *     <tr><th>EJS: {@link guaraiba.template.adapters.Ejs}</th><td>.ejs</td></tr>
 *     <tr><th>JASE: {@link guaraiba.template.adapters.Jade}</th><td>.jade</td></tr>
 *     <tr><th>HANDLEBARS: {@link guaraiba.template.adapters.Handlebars}</th><td>.hbs or .handlebars</td></tr>
 *     <tr><th>SWIG: {@link guaraiba.template.adapters.Swig}</th><td>.swig</td></tr>
 * </table>
 *
 */
qx.Class.define('guaraiba.template.Adapter', {
    extend: qx.core.Object,

    /**
     * @param template {String} - Template code written in the correspond engine.
     * @param engineName {String} - Engine name.
     * @param templatePath {String?} - Template file path.
     */
    construct: function (template, engineName, templatePath) {
        this.__template = template;
        this.__templatePath = templatePath;
        this.__setEngine(engineName);
    },

    members: {
        __template: null,
        __templatePath: null,
        __engineName: null,
        __engine: null,
        __fn: null,

        /**
         * Define adapter engine.
         *
         * Supported engines: ('ejs', 'jade', 'ms', 'hbs', 'handlebars', 'swig', 'jrxml').
         *
         * @param engineName {String} - Engine name.
         * @internal
         */
        __setEngine: function (engineName) {

            this.__engineName = engineName.replace('.', '') || 'ejs';

            switch (this.__engineName) {
                case 'ejs':
                    this.__engine = guaraiba.template.adapters.Ejs.getInstance();
                    break;
                case 'jade':
                    this.__engine = guaraiba.template.adapters.Jade.getInstance();
                    break;
                case 'hbs':
                case 'handlebars':
                    this.__engineName = 'handlebars';
                    this.__engine = guaraiba.template.adapters.Handlebars.getInstance();
                    break;
                case 'jrxml':
                    this.__engine = guaraiba.template.adapters.JasperReport.getInstance();
                    this.__engine.setJrxml(this.__templatePath);
                    break;
            }
        },

        /**
         * Render data in template.
         *
         * @param data {Object} - Data to renderer in template.
         * @param helpers {Map} - Helpers methods.
         * @return {String}
         */
        render: function (data, helpers) {
            this.__fn = this.__fn || this.__engine.compile(this.__template);

            return this.__engine.render(data || {}, this.__fn, helpers);
        }
    }
});
