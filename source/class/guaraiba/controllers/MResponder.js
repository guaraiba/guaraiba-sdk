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
 * Provides strategies for responding based on desired format.
 * A responder determines the best way to respond to a request
 */
qx.Mixin.define('guaraiba.controllers.MResponder', {

    properties: {
        /** Path to template. */
        template: {
            check: 'String',
            transform: '_transformTemplate',
            nullable: true
        },

        /** Path to layout. */
        layout: {
            check: 'String',
            transform: '_transformLayout',
            nullable: true
        }
    },

    members: {
        _jrFormats: ['xhtml', 'pdf', 'docx', 'pptx', 'xlsx', 'rtf', 'xls', 'csv', 'odt', 'ods', 'xml4swf', 'jpeg'],

        /**
         * Transform value of template property and determine the real template path.
         * Gets created programmatically based on controller name.
         *
         * @param template {String}
         * @return {String|null} Absolute path to template resource.
         * @internal
         */
        _transformTemplate: function (template) {
            if (template) {
                // Set template paths
                if (template.match(/^\//)) {
                    // If template includes full views path just use it
                    return template;
                } else {
                    // Assume they only included the action, so add the controller path
                    return this.getControllerPath().replace('/controllers/', '/views/') + '/' + template;
                }
            }

            return null;
        },

        /**
         * Transform value of layout property and determine the real layout path.
         * Gets created programmatically based on controller name.
         *
         * @param layout {String}
         * @return {String|null} Absolute path to layout resource.
         * @internal
         */
        _transformLayout: function (layout) {
            // Set layout paths
            if (layout.match(/^\//)) {
                // If layout includes full views path just use it
                return layout;
            } else {
                // Assume they only included the controller, so append it to the layouts path
                return this.getControllerPath().replace(/\/controllers\/.*$/, '/layouts/') + layout;
                ;
            }
        },

        /**
         * Get format and content type acceptable to all parties.
         * See if any format formats match the accept header.
         * Controllers should at least one format with a valid contentType.
         *
         * @param formatOverride {String?} Format to used and overwriting the request format.
         * @return {Map|null} - Format and content type (e.g: {format: json, contentType: 'application/json'})
         * @internal
         */
        __calculateFormatAndContentType: function (formatOverride) {
            var format = guaraiba.response.Format.getInstance(),
                accepts = this.getRequest().getHeaders().accept,
                requestedFormat = this.getFormat(),
                supportedFormats = this.getRespondsWith(),
                contentType, i;

            // Figure out what formats avaliable. If a format was requested as an argument use it
            var formats = formatOverride
                ? [formatOverride]
                : qx.lang.Array.contains(supportedFormats, requestedFormat)
                ? [requestedFormat]
                : supportedFormats;

            // Split on comma -- some user-agents include whitespace with the comma
            accepts = (accepts || '').split(/\s*(,|;)\s*/);
            formats = formats || [];

            // Look through supported formats and see if knows about any of them
            for (i in formats) {
                if ((contentType = format.getAcceptContentType(accepts, formats[i]))) {
                    return {
                        format: formats[i],
                        contentType: contentType
                    }
                }
            }

            return null;
        },

        getHelpers: function () {
            var helpers = new Map(),
                helperName,
                helperMethod;

            for (helperName in this) {
                helperMethod = this[helperName]
                if (helperName.match(/[a-z][a-z0-9]*([A-Z][a-z0-9]*)*Helper$/) && qx.lang.Type.isFunction(helperMethod)) {
                    helpers.set(helperName.replace(/Helper$/, ''), qx.lang.Function.bind(helperMethod, this));
                }
            }

            return helpers;
        },

        /**
         * Performs content-negotiation, and renders a response.
         *
         * @param content {Object|String} The content to use in the response.
         * @param options {Map ? null} Respond options. The options map has the following keys:
         *   <table>
         *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
         *     <tr><th>format</th><td>String</td><td>The desired format for the response.</td></tr>
         *     <tr><th>template</th><td>String</td><td>The path (without file extensions) to the template to use to render this response.</td></tr>
         *     <tr><th>layout</th><td>String</td><td>The path (without file extensions) to the layout to use to render the template for this response.</td></tr>
         *     <tr><th>statusCode</th><td>Number</td><td>The HTTP status-code to use for the response.</td></tr>
         *     <tr><th>status</th><td>String|Object</td><td>The desired flash message, can be a string or an errors hash.</td></tr>
         *     <tr><th>silent</th><td>Boolean</td><td>Disables flash messages if set to true.</td></tr>
         *   </table>

         * @return {boolean}
         */
        respond: function (content, options) {
            var vThis = this,
                opts = options || {},
                content = content || {},
                negotiated,

                /**
                 * Send formatted content to response.
                 *
                 * @param formattedContent {var} The formatted content to be sent to the response.
                 */
                done = function (formattedContent) {
                    var headers = { 'Content-Type': opts.contentType };
                    guaraiba.utils.mixin(headers, opts.headers);
                    vThis.output(opts.statusCode || 200, headers, formattedContent);
                };

            // Get format and content type acceptable to all parties.
            if (!(opts.format && opts.contentType)) {
                if ((negotiated = this.__calculateFormatAndContentType(opts.format))) {
                    guaraiba.utils.mixin(opts, negotiated);
                } else {
                    this.respondWithStatusUnsupportedMediaType('This format is not supported.');
                    return false;
                }

                // Error during content negotiation may result in an error response, so don't continue.
                if (this.getCompleted()) {
                    return false;
                }
            }

            content.getRequestParams = function () {
                return vThis.getParams()
            };

            if (opts.format == 'html') {
                // HTML is special case, needs opts, is async

                var engine = opts.engine || this.getConfiguration().getDefaultTemplateEngine();

                this.setLayout(opts.layout || this.getLayout() || 'empty.html.' + engine);
                this.setTemplate(opts.template || this.getTemplate() || this.getActionName() + '.html.' + engine);

                var layout = new guaraiba.template.Layout(this.getLayout(), this.getTemplate(), content, this.getHelpers());
                layout.render(done);

            } else if (this._jrFormats.indexOf(opts.format) >= 0) {
                // Formats (pdf, xhtml, docx, odt ...) used to generate response with jrxml template.

                this.setTemplate(opts.template || this.getTemplate() || this.getActionName() + '.jrxml');

                var resource = qx.util.ResourceManager.getInstance(),
                    adapter = new guaraiba.template.Adapter(null, 'jrxml', resource.toUri(this.getTemplate()));

                try {
                    done(adapter.render(content, this.getHelpers()));
                } catch (e) {
                    this.respondError(e, 'html');
                }
            } else {
                done(this.getResponse().formatContent(content, opts, this.getParams()));
            }

            return true;
        },

        /**
         * Lowest-level response function, actually outputs the response
         *
         * @param statusCode {Number} Either an URL, or an object literal containing controller/action/format attributes to base the redirect on.
         * @param headers {Object} HTTP headers to include in the response
         * @param content {String} The response-body
         */
        output: function (statusCode, headers, content) {
            // No repeatsies
            if (this.getCompleted()) {
                return;
            }

            this.setCompleted(true);

            var vThis = this,
                session = this.getSession(),

                callback = function () {
                    var response = vThis.getResponse(),
                        method = vThis.getRequest().getMethod();

                    response.setHeaders(statusCode, headers);

                    // Run after filters, then finish out the response
                    vThis.execFilters(vThis.getActionName(), 'after', function () {
                        if (method == 'HEAD' || method == 'OPTIONS') {
                            response.finish();
                        } else {
                            response.finalize(content);
                        }
                    });
                };

            // Save access time into session for expiry and verifying sameOriginToken
            var session = this.getSession();
            session.set('accessTime', this.__accessTime);
            session.save(callback);
        }
    }
});
