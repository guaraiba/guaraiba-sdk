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
 * Full documentation is at {@link https://community.jaspersoft.com/project/jasperreports-library}
 *
 * @asset(guaraiba/java/*)
 * @ignore(Buffer)
 */
qx.Class.define('guaraiba.template.engines.JasperReport', {
    type: 'singleton',
    extend: qx.core.Object,

    construct: function () {
        var java = guaraiba.java = (guaraiba.java || require('java'));

        guaraiba.javaClasspath('guaraiba/java/commons-beanutils-1.8.2.jar');
        guaraiba.javaClasspath('guaraiba/java/commons-collections-3.2.1.jar');
        guaraiba.javaClasspath('guaraiba/java/commons-digester-2.1.jar');
        guaraiba.javaClasspath('guaraiba/java/commons-javaflow-20060411.jar');
        guaraiba.javaClasspath('guaraiba/java/commons-logging-1.1.jar');
        guaraiba.javaClasspath('guaraiba/java/groovy-all-2.0.1.jar');
        guaraiba.javaClasspath('guaraiba/java/iText-2.1.7.jar');
        guaraiba.javaClasspath('guaraiba/java/jackson-annotations-2.0.5.jar');
        guaraiba.javaClasspath('guaraiba/java/jackson-core-2.0.5.jar');
        guaraiba.javaClasspath('guaraiba/java/jackson-databind-2.0.5.jar');
        guaraiba.javaClasspath('guaraiba/java/jasperreports-5.5.0.jar');
        guaraiba.javaClasspath('guaraiba/java/jcommon-1.0.15.jar');
        guaraiba.javaClasspath('guaraiba/java/jfreechart-1.0.12.jar');
        guaraiba.javaClasspath('guaraiba/java/json-simple-1.1.1.jar');
        guaraiba.javaClasspath('guaraiba/java/log4j-1.2.15.jar');
        guaraiba.javaClasspath('guaraiba/java/poi-3.7-20101029.jar');
        guaraiba.javaClasspath('guaraiba/java/servlet-api-2.4.jar');
        guaraiba.javaClasspath('guaraiba/java/barcode4j-2.1.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-anim.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-awt-util.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-bridge.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-css.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-dom.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-ext.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-gvt.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-parser.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-script.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-svg-dom.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-svggen.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-util.jar');
        guaraiba.javaClasspath('guaraiba/java/batik-xml.jar');
        guaraiba.javaClasspath('guaraiba/java/xml-apis-ext.jar');
        guaraiba.javaClasspath('guaraiba/java/commons-pool-1.6.jar');
        guaraiba.javaClasspath('guaraiba/java/js-mongodb-datasource-0.5.0.jar');
        guaraiba.javaClasspath('guaraiba/java/mongo-java-driver-2.7.3.jar');
        guaraiba.javaClasspath('guaraiba/java/spring.jar');
        guaraiba.javaClasspath('guaraiba/java/jasperreports-json.jar');
        //        guaraiba.javaClasspath('guaraiba/java/jasperreports-chart-themes-5.2.0.jar');
        guaraiba.javaClasspath('guaraiba/java/postgresql-9.3-1102.jdbc4.jar');

        this.JasperFillManager = java.import('net.sf.jasperreports.engine.JasperFillManager');
        this.JasperExportManager = java.import('net.sf.jasperreports.engine.JasperExportManager');
        this.JRExporterParameter = java.import('net.sf.jasperreports.engine.JRExporterParameter');
        this.JsonQueryExecuterFactory = java.import('net.sf.jasperreports.engine.query.JsonQueryExecuterFactory');
        this.JsonDataSource = java.import('net.sf.jasperreports.engine.data.JsonDataSource');
        this.JREmptyDataSource = java.import('net.sf.jasperreports.engine.JREmptyDataSource');
        this.JasperPrint = java.import('net.sf.jasperreports.engine.JasperPrint');
        this.ArrayList = java.import('java.util.ArrayList');
        this.HashMap = java.import('java.util.HashMap');
        this.ByteArrayInputStream = java.import('java.io.ByteArrayInputStream');
        this.ByteArrayOutputStream = java.import('java.io.ByteArrayOutputStream');
        this.DriverManager = java.import('java.sql.DriverManager');
        this.Date = java.import('java.util.Date');
        this.File = java.import('java.io.File');
    },

    members: {
        /**
         * Compile template written in jrxml code.
         *
         * @param jrxmlFiles {String|Array} Path to jrxml template files.
         * @return {Array}
         */
        compile: function (jrxmlFiles) {
            var fs = guaraiba.fs,
                jasperFiles = [];

            jrxmlFiles = qx.lang.Type.isArray(jrxmlFiles) ? jrxmlFiles : [jrxmlFiles];

            jrxmlFiles.forEach(function (jrxmlPath) {
                var jasperPath = jrxmlPath.replace(/jrxml$/, 'jasper');

                if (!fs.existsSync(jasperPath) || fs.statSync(jrxmlPath).mtime > fs.statSync(jasperPath).mtime) {
                    this.debug('Compiling ' + jrxmlPath + '.');
                    this.JasperCompileManager = this.JasperCompileManager
                        || guaraiba.java.import('net.sf.jasperreports.engine.JasperCompileManager');

                    this.JasperCompileManager.compileReportToFileSync(jrxmlPath, jasperPath);
                }

                jasperFiles.push(jasperPath);
            }, this)

            return jasperFiles;
        },

        /**
         * Export report to XHTML format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} XHTM source code.
         */
        exportToXHTML: function (content, jasperFiles, dataSourceOrConnection) {
            var uuid = require('node-uuid'),
                imgPath = uuid.v4(),
                params = this._getParamsHashMap(content),
                report = new this.ByteArrayOutputStream(),
                jasperPrint = new this.ArrayList(),
                exporter;

            jasperFiles.forEach(function (jasperFile) {
                jasperPrint.addSync(
                    this.JasperFillManager.fillReportSync(jasperFile, params, dataSourceOrConnection)
                )
            }, this);

            this.JRXhtmlExporter = this.JRXhtmlExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRXhtmlExporter');
            this.JRHtmlExporterParameter = this.JRHtmlExporterParameter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRHtmlExporterParameter');

            exporter = new this.JRXhtmlExporter();
            exporter.setParameterSync(this.JRExporterParameter.JASPER_PRINT_LIST, jasperPrint);
            exporter.setParameterSync(this.JRExporterParameter.OUTPUT_STREAM, report);
            exporter.setParameterSync(this.JRHtmlExporterParameter.IMAGES_DIR_NAME, guaraiba.resourcePath + '/public/' + imgPath);
            exporter.setParameterSync(this.JRHtmlExporterParameter.IMAGES_URI, '/public/' + imgPath + '/');
            if (typeof content.PAGE_INDEX != 'undefined') {
                exporter.setParameterSync(this.JRExporterParameter.PAGE_INDEX, content.PAGE_INDEX * 1);
            }
            if (typeof content.START_PAGE_INDEX !== 'undefined') {
                exporter.setParameterSync(this.JRExporterParameter.PAGE_INDEX, content.START_PAGE_INDEX * 1);
            }
            if (typeof content.END_PAGE_INDEX !== 'undefined') {
                exporter.setParameterSync(this.JRExporterParameter.PAGE_INDEX, content.END_PAGE_INDEX * 1);
            }

            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to PDF format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} PDF binary code.
         */
        exportToPDF: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRPdfExporter = this.JRPdfExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRPdfExporter');
            this.JRPdfExporterParameter = this.JRPdfExporterParameter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRPdfExporterParameter');

            exporter = this._getExporter(this.JRPdfExporter, jasperFiles, content, dataSourceOrConnection);
            exporter.setParameterSync(this.JRPdfExporterParameter.IS_CREATING_BATCH_MODE_BOOKMARKS, true);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to DOCX format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} DOCX binary code.
         */
        exportToDOCX: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRDocxExporter = this.JRDocxExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.ooxml.JRDocxExporter');

            exporter = this._getExporter(this.JRDocxExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to PPTX format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} PPTX binary code.
         */
        exportToPPTX: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRPptxExporter = this.JRPptxExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.ooxml.JRPptxExporter');

            exporter = this._getExporter(this.JRPptxExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to XLSX format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} XLSX binary code.
         */
        exportToXLSX: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRXlsxExporter = this.JRXlsxExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter');

            exporter = this._getExporter(this.JRXlsxExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to RTF format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} RTF binary code.
         */
        exportToRTF: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRRtfExporter = this.JRRtfExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRRtfExporter');

            exporter = this._getExporter(this.JRRtfExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to XLS format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} XLS binary code.
         */
        exportToXLS: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRXlsExporter = this.JRXlsExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRXlsExporter');
            this.JRXlsExporterParameter = this.JRXlsExporterParameter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRXlsExporterParameter');

            exporter = this._getExporter(this.JRXlsExporter, jasperFiles, content, dataSourceOrConnection);
            exporter.setParameterSync(this.JRExporterParameter.IS_ONE_PAGE_PER_SHEET, true);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to CVS format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} CVS binary code.
         */
        exportToCSV: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRCsvExporter = this.JRCsvExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRCsvExporter');

            exporter = this._getExporter(this.JRCsvExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to ODT format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} ODT binary code.
         */
        exportToODT: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JROdtExporter = this.JROdtExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.oasis.JROdtExporter');

            exporter = this._getExporter(this.JROdtExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to ODS format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} ODS binary code.
         */
        exportToODS: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JROdsExporter = this.JROdsExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.oasis.JROdsExporter');

            exporter = this._getExporter(this.JROdsExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to XML4SWF format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} XML4SWF binary code.
         */
        exportToXML4SWF: function (content, jasperFiles, dataSourceOrConnection) {
            var exporter, report;

            this.JRXml4SwfExporter = this.JRXml4SwfExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRXml4SwfExporter');

            exporter = this._getExporter(this.JRXml4SwfExporter, jasperFiles, content, dataSourceOrConnection);
            report = exporter.getParameterSync(this.JRExporterParameter.OUTPUT_STREAM);
            exporter.exportReportSync();
            report.flushSync();

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Export report to JPEG format.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.

         * @return {Buffer} JPEG binary code.
         */
        exportToJPEG: function (content, jasperFiles, dataSourceOrConnection) {
            var params = this._getParamsHashMap(content),
                report = new this.ByteArrayOutputStream(),
                jasperPrint = new this.ArrayList(),
                exporter, pageImage,
                ZOOM_RATIO = content.ZOOM_RATIO * 1 || 1,
                PAGE_INDEX = content.PAGE_INDEX * 1 || 0;

            jasperFiles.forEach(function (jasperFile) {
                jasperPrint.addSync(
                    this.JasperFillManager.fillReportSync(jasperFile, params, dataSourceOrConnection)
                )
            }, this);
            this.JRGraphics2DExporter = this.JRGraphics2DExporter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRGraphics2DExporter');
            this.JRGraphics2DExporterParameter = this.JRGraphics2DExporterParameter
                || guaraiba.java.import('net.sf.jasperreports.engine.export.JRGraphics2DExporterParameter');
            this.BufferedImage = this.BufferedImage
                || guaraiba.java.import('java.awt.image.BufferedImage');
            this.ImageIO = this.ImageIO
                || guaraiba.java.import('javax.imageio.ImageIO');

            pageImage = new this.BufferedImage(
                jasperPrint.getSync(0).getPageWidthSync() * ZOOM_RATIO + 1,
                jasperPrint.getSync(0).getPageHeightSync() * ZOOM_RATIO + 1,
                this.BufferedImage.TYPE_INT_RGB
            );

            exporter = new this.JRGraphics2DExporter();
            exporter.setParameterSync(this.JRExporterParameter.JASPER_PRINT_LIST, jasperPrint);
            exporter.setParameterSync(this.JRGraphics2DExporterParameter.GRAPHICS_2D, pageImage.createGraphicsSync());
            exporter.setParameterSync(this.JRGraphics2DExporterParameter.ZOOM_RATIO, guaraiba.java.newFloat(ZOOM_RATIO));
            exporter.setParameterSync(this.JRExporterParameter.PAGE_INDEX, PAGE_INDEX * 1);
            exporter.exportReportSync();
            pageImage.flushSync();

            this.ImageIO.writeSync(pageImage, "jpeg", report);

            return new Buffer(report.toByteArraySync());
        },

        /**
         * Returns HashMap with report params.
         *
         * @param content {Object} Content pass to respond method in controller action.
         * @return {guaraiba.template.engines.JasperReport.HashMap}
         */
        _getParamsHashMap: function (content) {
            var hashMap = new this.HashMap(),
                params = (qx.lang.Type.isFunction(content.reportParams) ? content.reportParams() : content.reportParams) || {};

            for (var key in params) {
                hashMap.putSync(key, params[key]);
            }

            return hashMap;
        },

        /**
         * Create, configure an returns jasper report exporter class instance.
         *
         * @param ExporterClass {String}
         * @param jasperFiles {Array} Path to jasper files compiled report design.
         * @param content {Object} Content pass to respond method in controller action.
         * @param dataSourceOrConnection {
         *      net.sf.jasperreports.engine.data.JsonDataSource |
         *      java.sql.Connection |
         *      net.sf.jasperreports.engine.JREmptyDataSource
         * } Java instance of DataSource or Connection.
         *
         * @return {net.sf.jasperreports.engine.export.JRAbstractExporter}
         */
        _getExporter: function (ExporterClass, jasperFiles, content, dataSourceOrConnection) {
            var params = this._getParamsHashMap(content),
                report = new this.ByteArrayOutputStream(),
                exporter = new ExporterClass(),
                jasperPrint = new this.ArrayList();

            jasperFiles.forEach(function (jasperFile) {
                jasperPrint.addSync(
                    this.JasperFillManager.fillReportSync(jasperFile, params, dataSourceOrConnection)
                )
            }, this);

            exporter.setParameterSync(this.JRExporterParameter.JASPER_PRINT_LIST, jasperPrint);
            exporter.setParameterSync(this.JRExporterParameter.OUTPUT_STREAM, report);
            if (typeof content.PAGE_INDEX !== 'undefined') {
                exporter.setParameterSync(this.JRExporterParameter.PAGE_INDEX, content.PAGE_INDEX * 1);
            }
            if (typeof content.START_PAGE_INDEX !== 'undefined') {
                exporter.setParameterSync(this.JRExporterParameter.START_PAGE_INDEX, content.START_PAGE_INDEX * 1);
            }
            if (typeof content.END_PAGE_INDEX !== 'undefined') {
                exporter.setParameterSync(this.JRExporterParameter.END_PAGE_INDEX, content.END_PAGE_INDEX * 1);
            }

            return exporter;
        },

        /**
         * Render content in template.
         *
         * @param content {Object} Data to renderer in the report template.
         * @param jasperFiles {String|Array} File(s) with compiled report in jasper format.
         * @return {String}
         */
        render: function (content, jasperFiles) {
            var format = content.getRequestParams().format,
                method = 'exportTo' + format.toUpperCase(),
                dataSourceOrConnection = content.dataSource || content.connection || this.getEmptyDataSource();

            if (!this[method]) {
                throw new Error('Unknown (' + format + ') JRXML output format.');
            }

            jasperFiles = qx.lang.Type.isArray(jasperFiles) ? jasperFiles : [jasperFiles];

            var result = this[method].call(this, content, jasperFiles, dataSourceOrConnection);
            dataSourceOrConnection.close && dataSourceOrConnection.close();

            return result;
        },

        /**
         * Get java instance of net.sf.jasperreports.engine.data.JsonDataSource from json file.
         *
         * @param file {String} Json file path.
         * @param selectExpression {String} Json query expression.
         * @return {net.sf.jasperreports.engine.data.JsonDataSource}
         */
        getJsonDataSource: function (file, selectExpression) {
            return new this.JsonDataSource(file, selectExpression || 'data');
        },

        /**
         * Get java instance of java.sql.Connection to remote or local database.
         *
         * @param driver {String} JDBC driver name. Ex: "org.postgresql.Driver".
         * @param connectString {String} JDBC connection string. Ex: "jdbc:postgresql://127.0.0.1:5432/db_test".
         * @param username {String?} Username to access to database.
         * @param password {String?} Password to access to database.
         * @return {java.sql.Connection}
         */
        getSqlDataSource: function (driver, connectString, username, password) {
            // Import driver class
            guaraiba.java.import(driver);
            // Create connection to data base from connection parameters.
            return this.DriverManager.getConnectionSync(connectString, username, password);
        },

        /**
         * Get java instance of net.sf.jasperreports.engine.JREmptyDataSource.
         *
         * @return {net.sf.jasperreports.engine.JREmptyDataSource}
         */
        getEmptyDataSource: function () {
            return new this.JREmptyDataSource();
        },

        /**
         * Get java ArrayList instance with elements of given JavaScript array.
         *
         * @param list {Array} JavaScript items array.
         * @return {java.util.ArrayList}
         */
        getArrayList: function (list) {
            var result = new this.ArrayList()

            list.forEach(function (item) {
                result.addSync(item);
            });

            return result;
        }
    }
});