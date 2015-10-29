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
 * This mixin offers the basic features to inflection string.
 */
qx.Mixin.define('guaraiba.utils.MInflection', {

    members: {
        /**
         * This function adds underscore support to every String object.
         *
         * @param str {String} The subject string.
         * @param allUpperCase {Boolean?false} Default is to lowercase and add underscore prefix.
         * @return {String}
         */
        _toUnderscoreCase: function (str, allUpperCase) {
            return guaraiba.inflection.underscore(str, allUpperCase);
        },

        /**
         * This function adds camelization support to every String object.
         *
         * @param str {String} The subject string.
         * @param lowFirstLetter {Boolean?false} Default is to capitalize the first letter of the results. Passing true will lowercase it.
         * @return {String}
         */
        _toCamelCase: function (str, lowFirstLetter) {
            return guaraiba.inflection.camelize(str, lowFirstLetter);
        },

        /**
         * This function adds dasherization support to every String object.
         *
         * @param str {String} The subject string.
         * @return {String}
         */
        _toDasherize: function (str) {
            return guaraiba.inflection.dasherize(str);
        },

        /**
         * This function adds singularization support to every String object.
         *
         * @param str {String} The subject string.
         * @param singular {String?} Overrides normal output with said String.
         * @return {String}
         */
        _toSingular: function (str, singular) {
            return guaraiba.inflection.singularize(str, singular);
        },

        /**
         * This function adds pluralization support to every String object.
         *
         * @param str {String} The subject string.
         * @param plural {String?} Overrides normal output with said String.
         * @return {String}
         */
        _toPlural: function (str, plural) {
            return guaraiba.inflection.pluralize(str, plural);
        },

        /**
         * This function adds tableize support to every String object.
         *
         * @param str {String} The subject string.
         * @return {String}
         */
        _toTableCase: function (str) {
            return guaraiba.inflection.tableize(str);
        },

        /**
         * This function adds classification support to every String object.
         *
         * @param str {String} The subject string.
         * @return {String}
         */
        _toClassCase: function (str) {
            return guaraiba.inflection.classify(str);
        }
    }
});
