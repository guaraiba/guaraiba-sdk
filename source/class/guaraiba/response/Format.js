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
 * This class offers the basic properties and features to process contents in the correspondent format and content-type.
 */
qx.Class.define('guaraiba.response.Format', {
    type: 'singleton',
    extend: qx.core.Object,

    statics: {
        /**
         * Not transforms the content.<br/>
         * This will be rendering later in a template in the controller.<br/>
         * It is used when the response format is html, xhtml, pdf, docx, pptx, xlsx, rtf, xls,
         * csv, odt, ods, xml4swf or jpeg.
         *
         * @param content {Object?} Respont content.
         * @return {Object}
         */
        templateFormatter: function (content) {
            guaraiba.responder.strategies.M
            return content;
        },

        /**
         * Transforms the given content into a string.<br/>
         * It is used when the response format is txt.
         *
         * @param content {Object?} Respont content.
         * @return {String}
         */
        txtFormatter: function (content) {
            var result = content || '';

            if (qx.lang.Type.isFunction(content.toString) && content.toString != {}.toString) {
                result = content.toString();
            } else {
                result = JSON.stringify(content);
            }

            return result;
        },

        /**
         * Transforms the given content into a JSON.<br/>
         * It is used when the response format is json.
         *
         * @param content {Object?} Respont content.
         * @return {String} String in JSON format.
         */
        jsonFormatter: function (content) {
            return content ? JSON.stringify(content) : ''
        },

        /**
         * Transforms the given content into a JS.<br/>
         * It is used when the response format is js.
         *
         * @param content {Object?} Respont content.
         * @param params {Map} Reguest parameters.
         * @return {String} String in JS format.
         */
        jsFormatter: function (content, params) {
            if (!params.callback) {
                throw new Error('JSONP callback not defined.');
            }
            return params.callback + '(' + (content ? JSON.stringify(content) : '') + ');';
        },

        /**
         * Transforms the given content into a xml.<br/>
         * It is used when the response format is xml.
         *
         * @param content {Object?} Respont content.
         * @return {String} String in XML document format.
         */
        xmlFormatter: function (content) {
            if (!content) {
                return '';
            }

            var toXml = content.toXml || content.toXML;

            if (typeof toXml == 'function') {
                return toXml.call(content);
            } else {
                return guaraiba.utils.XML.stringify(content, { name: content.type || '' });
            }
        }
    },

    members: {
        __formats: {},

        /**
         * Add new format
         *
         * @param name {String} - Format name.
         * @param contentType {String|String[]} - Content-types associate with this format.
         * @param formatter {Function} - Function to process content and return new content in the given format an content-type.
         */
        addFormat: function (name, contentType, formatter) {
            this.__formats[name] = {
                name: name,
                contentType: contentType,
                formatter: formatter,
                preferredContentType: contentType[0],
                acceptsContentTypePattern: new RegExp(contentType.join('|').replace(/(\/)/g, "\\$1"))
            };
        },

        /**
         * Get format object with given name.
         *
         * @param name {String} Format name.
         * @return {Map} Map format configuration .{ name: ..., contentType: ..., formatter: function...,  preferredContentType: ..., acceptsContentTypePattern: ...}
         */
        getFormat: function (name) {
            return this.__formats[name];
        },

        /**
         * Get preferred content type for given format.
         *
         * @param formatName {String} - Format name.
         * @return {String|null} - Preferred content-type for given format
         */
        getPreferredContentType: function (formatName) {
            return (this.getFormat(formatName) || {}).preferredContentType;
        },

        /**
         * Get accept content type for given format.
         *
         * If agent accepts wildcard respond with preferred content type.
         *
         * @param accepts {String|String[]} - Accepts content-types
         * @param formatName {String} - Format name.
         * @return {String|null} - Accept content-type for given format.
         */
        getAcceptContentType: function (accepts, formatName) {
            accepts = qx.lang.Type.isString(accepts) ? accepts.split(/\s*(,|;)\s*/) : accepts;
            var format = this.getFormat(formatName) || {},
                match, i;

            // Agent accepts wildcard respond with preferred content type.
            if (qx.lang.Array.contains(accepts, "*/*")) {
                return format.preferredContentType
            }

            for (i in accepts) {
                if ((match = accepts[i].match(format.acceptsContentTypePattern))) {
                    return match;
                }
            }

            return null;
        }
    },

    /**
     * @ignore(guaraiba)
     * @ignore(process.*)
     *
     * @param statics {Object}
     */
    defer: function (statics) {
        var vThis = guaraiba.response.Format.getInstance();

        vThis.addFormat('txt', ['text/plain'], statics.txtFormatter);
        vThis.addFormat('json', ['application/json', 'text/json'], statics.jsonFormatter);
        vThis.addFormat('xml', ['application/xml', 'text/xml'], statics.xmlFormatter);
        vThis.addFormat('js', ['application/javascript', 'text/javascript'], statics.jsFormatter);
        vThis.addFormat('html', ['text/html'], statics.templateFormatter);
        vThis.addFormat('xhtml', ['text/html'], statics.templateFormatter);
        vThis.addFormat('pdf', ['application/pdf'], statics.templateFormatter);
        vThis.addFormat('docx', ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], statics.templateFormatter);
        vThis.addFormat('pptx', ['application/vnd.openxmlformats-officedocument.presentationml.presentation'], statics.templateFormatter);
        vThis.addFormat('xlsx', ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], statics.templateFormatter);
        vThis.addFormat('rtf', ['application/rtf'], statics.templateFormatter);
        vThis.addFormat('xls', ['application/vnd.ms-excel'], statics.templateFormatter);
        vThis.addFormat('csv', ['text/csv'], statics.templateFormatter);
        vThis.addFormat('odt', ['application/vnd.oasis.opendocument.text'], statics.templateFormatter);
        vThis.addFormat('ods', ['application/vnd.oasis.opendocument.spreadsheet'], statics.templateFormatter);
        vThis.addFormat('xml4swf', ['application/xml'], statics.templateFormatter);
        vThis.addFormat('jpeg', ['image/jpeg'], statics.templateFormatter);
    }
});