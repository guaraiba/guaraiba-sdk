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
 * This class offers the basic properties and features to process partial template.
 *
 * @asset(views/*)
 */
qx.Class.define('guaraiba.template.Partial', {
    extend: qx.core.Object,

    statics: {
        /** Cache of template file content. */
        cache: {}
    },

    /**
     * @param templatePath {String} - Path to template file.
     * @param data {Object} - Data to renderer in template.
     * @param helpers {Map} - Helpers methods.
     */
    construct: function (templatePath, data, helpers) {
        this._id = guaraiba.utils.string.uuid();
        this._data = data || {};
        this._templatePath = templatePath
        this._partials = [];
        this._content = '';
        this._helpers = this.__cloneHelpers(helpers);

        // Hang a `renderPartial` method on the execution-context for the
        // template rendering (e.g., will be the EJS global `renderPartial`
        // function to add sub-templates
        //this._data.renderPartial = qx.lang.Function.bind(function (templatePath, data) {
        //    if (!templatePath.match(/^\//)) {
        //        templatePath = guaraiba.path.dirname(this._templatePath) + '/' + templatePath;
        //    }
        //
        //    var partial = new guaraiba.template.Partial(templatePath, data || this._data, this._helpers);
        //
        //    this._partials.push(partial);
        //
        //    return '###partial###' + partial._id;
        //}, this);

        this._helpers.set('renderPartial', qx.lang.Function.bind(function (templatePath, data) {
            if (!templatePath.match(/^\//)) {
                templatePath = guaraiba.path.dirname(this._templatePath) + '/' + templatePath;
            }

            var partial = new guaraiba.template.Partial(templatePath, data || this._data, this._helpers);

            this._partials.push(partial);

            return '###partial###' + partial._id;
        }, this));
    },

    members: {
        _id: null,
        _data: null,
        _templatePath: null,
        _partials: null,
        _content: '',
        _helpers: null,

        /**
         * Return info from template file.
         *
         * @return {Map} - Template file info {{file: *, ext: *, baseName: String, baseNamePath: String}}
         */
        getTemplateData: function () {
            var resource = qx.util.ResourceManager.getInstance(),
                file = resource.toUri(this._templatePath),
                fileExt = guaraiba.path.extname(file),
                fileBaseName = guaraiba.path.basename(file, fileExt).replace(/\.html$/, ''),
                noExtFile = file.replace(/\.html.*$/, '');

            return {
                file: file,
                ext: fileExt,
                baseName: fileBaseName,
                baseNamePath: noExtFile
            };
        },

        /**
         * Rendering the data in template
         *
         * @param done {Function} Callback function.
         */
        render: function (done) {
            var vThis = this,
                templateData = this.getTemplateData(),
                cache = guaraiba.template.Partial.cache;

            // Use cached template content if possible
            if (cache[templateData.file]) {
                vThis._renderSelf(cache[templateData.file], templateData.ext, templateData.file);
                vThis._renderPartials(done);
            } else { // Otherwise fetch off disk
                // Get the template from the FS then cache it for subsequent requests
                guaraiba.fs.readFile(templateData.file, 'utf8', function (err, templateContent) {
                    var env = guaraiba.config.getEnvironment();
                    if (err) {
                        done(env != 'development' ? '### ERROR ###' : err.message);
                        vThis.error(err)
                    } else {
                        if (env != 'development') {
                            cache[templateData.file] = templateContent;
                        }

                        vThis._renderSelf(templateContent, templateData.ext, templateData.file);
                        vThis._renderPartials(done);
                    }
                });
            }
        },

        /**
         * Render self template.
         *
         * @param templateContent {String} - Template content.
         * @param extOrEngine {String} - File extension or engine name.
         * @param templatePath {String} - Template file path.
         * @internal
         */
        _renderSelf: function (templateContent, extOrEngine, templatePath) {
            var adapter = new guaraiba.template.Adapter(templateContent, extOrEngine, templatePath);
            try {
                this._content = adapter.render(this._data, this._helpers);
            } catch (e) {
                this._content = e.toString();
                this.error(e);
            }
        },

        /**
         * Render partials partial template.
         *
         * @param doneRender {Function} Callback function.
         * @internal
         */
        _renderPartials: function (doneRender) {
            var vThis = this;

            if (this._partials.length) {
                var actions = this._partials.map(function (partial) {
                    return function (doneAction) {
                        partial.render(function (content) {
                            vThis._content = vThis._content.replace('###partial###' + partial._id, content);
                            doneAction();
                        });
                    };
                });

                guaraiba.async.series(actions, function () {
                    doneRender(vThis._content);
                });
            } else {
                doneRender(this._content);
            }

        },

        __cloneHelpers: function (helpers) {
            var newHelpers = new Map();

            helpers.forEach(function (method, name) {
                newHelpers.set(name, method);
            });

            return newHelpers;
        }
    }
});
