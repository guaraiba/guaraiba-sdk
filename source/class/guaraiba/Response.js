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
 * This class offers the basic properties and features to create http responses.
 */
qx.Class.define('guaraiba.Response', {
    extend: qx.core.Object,

    /**
     * @param nativeResponse {NodeJS.http.ServerResponse} Native response object from NodeJS.
     * @param app {guaraiba.Application} Reference to application instance.
     */
    construct: function (nativeResponse, app) {
        // Set original response reference
        this.setNativeResponse(nativeResponse);
        // Set application reference
        this.setApplication(app);
    },

    properties: {
        /** Reference to application instance. */
        application: {
            check: 'guaraiba.Application'
        },
        /** @type {NodeJS.http.ServerResponse} Reference to native response object from NodeJS. */
        nativeResponse: {}
    },

    members: {

        /**
         * Get content in given options format (txt, html, xml, json, js, pdf, doc, ...)
         *
         * @param content {String}
         * @param options {Map}
         * @param params {Object} Request parameters hash.
         * @return {String|Json|Xml|Stream}
         */
        formatContent: function (content, options, params) {
            return guaraiba.response.Format
                .getInstance()
                .getFormat(options.format)
                .formatter(content, params);
        },

        /**
         * Set http headers
         *
         * @param statusCode {Integer}
         * @param headers {Map}
         */
        setHeaders: function (statusCode, headers) {
            var contentType = headers['Content-Type'];

            contentType += '; charset=' + this.getApplication().getConfiguration().getCharsets();
            headers['Content-Type'] = contentType;

            this.getNativeResponse().statusCode = statusCode;
            for (var p in headers) {
                this.getNativeResponse().setHeader(p, headers[p]);
            }
        },

        /**
         * Send content, status and headers into response.
         *
         * @param content {String}
         * @param statusCode {Integer}
         * @param headers {Map}
         */
        send: function (content, statusCode, headers) {
            // Hacky
            if (this._ended) {
                return;
            }
            var s = statusCode || 200;
            var h = headers || {};
            this.setHeaders(s, h);
            this.finalize(content);
        },

        /**
         * Write content and finalize response.
         *
         * @param content {String}
         */
        finalize: function (content) {
            this.writeBody(content);
            this.finish();
        },

        /**
         * Send file into response.
         *
         * @param filepath {String}
         * @param options {Map}
         */
        sendFile: function (filepath, options) {
            var vThis = this,
                opts = options || {},
                contentType = guaraiba.mime.lookup(filepath),
                now = new Date(),
                expireTime = guaraiba.config.getCacheControlExpires(contentType),
                expireDate = new Date(now.getTime() + (expireTime * 1000)),
                encoding = 'binary';

            guaraiba.fs.stat(filepath, function (err, stat) {
                var headers;

                if (err) throw err;

                headers = guaraiba.utils.mixin({
                    'Content-Type': contentType,
                    'Last-Modified': stat.mtime.toUTCString(),
                    'Expires': expireDate.toUTCString(),
                    'Cache-Control': 'max-age=' + expireTime,
                    'Content-Length': stat.size || (stat.blksize * stat.blocks)
                }, opts.headers || {});

                vThis.setHeaders(200, headers);

                // From Paperboy, http://github.com/felixge/node-paperboy
                guaraiba.fs.open(filepath, 'r', 0666, function (err, fd) {
                    var pos = 0,
                        len = 0,
                        streamChunk = function () {
                            guaraiba.fs.read(fd, 16 * 1024, pos, encoding,
                                function (err, chunk, bytesRead) {
                                    if (!chunk) {
                                        guaraiba.fs.close(fd);
                                        vThis.resp._length = len;
                                        vThis.resp.end();
                                        return;
                                    }
                                    len += chunk.length;
                                    vThis.resp.write(chunk, encoding);
                                    pos += bytesRead;

                                    streamChunk();
                                });
                        }
                    streamChunk();
                });
            });
        },

        /**
         * Write content into response.
         *
         * @param content {String}
         */
        writeBody: function (content) {
            var content = content || '',
                resp = this.getNativeResponse();

            resp._length = resp._length || 0;
            resp._length += content.length;
            resp.write(content);
        },

        /**
         * Finish response.
         */
        finish: function () {
            this.getNativeResponse().end();
            this._ended = true;
        }
    }
});