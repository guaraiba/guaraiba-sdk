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
 * This class offers the basic features for create guaraiba application.
 *
 * @asset(guaraiba/*)
 * @asset(public/*)
 *
 * @require(guaraiba.Configuration)
 * @require(guaraiba.orm.DBSchema)
 * @require(guaraiba.Router)
 */
qx.Class.define("guaraiba.Application", {
    extend: qx.application.Basic,

    /**
     * @param configuration {guaraiba.Configuration}
     * @param router {guaraiba.Router}
     */
    construct: function (configuration, router) {
        // Register logger interface.
        if (qx.core.Environment.get("runtime.name") == "rhino") {
            qx.log.Logger.register(qx.log.appender.RhinoConsole);
        } else if (qx.core.Environment.get("runtime.name") == "node.js") {
            qx.log.Logger.register(guaraiba.Console);
        }

        if (!configuration.getSessionSecret()) {
            qx.log.Logger.error('Session configuration not found in config file.');
            process.abort();
        }

        guaraiba.app = this;
        guaraiba.config = configuration;
        guaraiba.router = router;
        guaraiba.router.init();
        guaraiba.jasperReport = guaraiba.template.engines.JasperReport.getInstance();

        this.base(arguments);
    },

    /*
     *****************************************************************************
     MEMBERS
     *****************************************************************************
     */
    members: {

        __nativeAppication: null,
        __worker: null,

        /**
         * Called when the application relevant classes are loaded and ready.
         */
        main: function () {
            guaraiba.Tasks.registerTask(null, 'start', false, this.start, this, 'Start server application.');

            if (!String(process.argv[1]).match(/jake$/)) {
                var args = process.argv.slice(2);

                if (args[0] == 'jake') {
                    args.shift()
                }

                if (args.length == 0) {
                    args.push('--tasks');
                }

                this.runJakeTask(args);
            }
        },

        /**
         * Run guaraiba framework or application tasks.
         *
         * @param args {Array}
         */
        runJakeTask: function (args) {
            process.chdir(guaraiba.path.dirname(process.mainModule.filename))

            var jake = require('jake');
            jake.run.apply(jake, args.length > 0 ? args : ['-help']);

            if (args[0] == '--tasks') {
                process.exit();
            }
        },

        /**
         * Star guaraiba server application.
         */
        start: function () {
            // Include the cluster module
            var app = this,
                cluster = require('cluster'),
                walk = require('walk'),
                config = app.getConfiguration();

            require('strong-cluster-connect-store').setup();

            // Code to run if we're in the master process
            if (cluster.isMaster) {

                // Count the machine's CPUs
                var maxWorkers = config.getMaxWorkers(),

                    reloadWorkers = function () {
                        qx.lang.Object.getValues(cluster.workers).forEach(function (worker) {
                            worker.toRestart = true;
                        }, this);
                        checkWorkers();
                    },

                // Handle worker messages
                //    onMessage = function (message) {
                //        app.debug('We got a message!');
                //        app.debug(guaraiba.prettyData.json(message));
                //    },

                // Check workers to restart
                    checkWorkers = function () {
                        for (var i in cluster.workers) {
                            if (cluster.workers[i].toRestart && cluster.workers[i].state === 'listening') {
                                cluster.workers[i].disconnect();
                                var to_restart = qx.lang.Object.getValues(cluster.workers).filter(function (cluster) {
                                    return cluster.toRestart;
                                }, this);
                                app.warn('Disconnected worker #' + cluster.workers[i].id + ', to restart: ', to_restart.length);
                                break;
                            }
                        }
                    },

                // Create worker
                    createWorker = function () {
                        var worker = cluster.fork();
                        //worker.on('message', onMessage);
                        worker.on('online', function () {
                            app.info('Worker #' + worker.id + ' is online...');
                            checkWorkers();
                        });
                        return worker;
                    };

                // Watch version file
                if (config.getEnvironment() === 'development') {
                    var walker = walk.walk(guaraiba.appRoot + '/../class', {
                        followLinks: false,
                        filters: ["data", "jakelib", "node_modules", /\.idea/] // directories with these keys will be skipped
                    });

                    walker.on("directories", function (root, dirStatsArray, next) {
                        dirStatsArray.forEach(function (dir) {
                            guaraiba.fs.watch(root + '/' + dir.name + '/', function (cur, prev) {
                                app.debug('New version found!, reloading workers...');
                                reloadWorkers();
                            });
                        });
                        next();
                    });
                }

                maxWorkers = (maxWorkers === 'auto') ? require('os').cpus().length / 2 : maxWorkers;

                // Create a worker for each CPU
                for (var i = 0; i < maxWorkers; i++) {
                    createWorker();
                }

                // Listen for dying workers
                cluster.on('exit', function (worker) {
                    // Replace the dead worker, we're not sentimental
                    if (worker.suicide) {
                        app.warn('Worker ' + worker.id + ' restarted...');
                    } else {
                        app.error('Worker ' + worker.id + ' died :(');
                    }
                    createWorker();
                });

                // Disconnect
                cluster.on('disconnect', function (worker) {
                    app.warn('Disconnect, restarting worker #' + worker.id);
                    worker.kill();
                });

                app.runCustomServices();
            } else {
                // Code to run if we're in a worker process
                app.run(cluster.worker);
            }
        },

        /**
         * Run new application thread over given worker.
         *
         * @param worker {Integer} - Id of application worker process.
         */
        run: function (worker) {
            var resource = qx.util.ResourceManager.getInstance(),
                keyPath = resource.toUri(guaraiba.config.getSSLSecurityKeyPath()),
                certPath = resource.toUri(guaraiba.config.getSSLSecurityCertPath()),
                options = {
                    key: guaraiba.fs.readFileSync(keyPath),
                    cert: guaraiba.fs.readFileSync(certPath)
                };

            this.__worker = worker;

            guaraiba.https.createServer(options, this.getNativeApplication())
                .listen(process.env.PORT || guaraiba.config.getPort() || 3000);
        },

        /**
         * Run custom services .
         */
        runCustomServices: function () {

        },

        /**
         * Get instance of guaraiba.Configuration class.
         *
         * @return {guaraiba.Configuration}
         */
        getConfiguration: function () {
            return guaraiba.config;
        },

        /**
         * Get native server application (NodeJS connect module instance).
         *
         * @return {NodeJS.Connect}
         */
        getNativeApplication: function () {
            var vThis = this,
                logger = require('morgan'),
                serveFavicon = require('serve-favicon'),
                serveStatic = require('serve-static'),
                methodOverride = require('method-override'),
                bodyParser = require('body-parser'),
                session = require('express-session'),
                resource = qx.util.ResourceManager.getInstance(),
                config = this.getConfiguration();

            if (!config.getSessionStore()) {
                var ClusterStore = require('strong-cluster-connect-store')(session);
                config.setSessionStore(new ClusterStore());
            }

            if (!this.__nativeAppication) {
                this.__nativeAppication = guaraiba.connect();
                this.__nativeAppication.use(serveFavicon(resource.toUri('public/images/favicon.ico')));
                this.__nativeAppication.use(logger('combined', { stream: config.getLogStream() }));
                this.__nativeAppication.use(bodyParser.json());
                this.__nativeAppication.use(bodyParser.urlencoded({ extended: true }));
                this.__nativeAppication.use(methodOverride('x-http-method-override'));
                this.__nativeAppication.use(methodOverride('_method'));
                this.__nativeAppication.use(session(config.getSessionOptions()));
                this.__setServerStatic(this.__nativeAppication, serveStatic);
                this.__nativeAppication.use(function (nativeRequest, nativeResponse) {
                    vThis.__router(nativeRequest, nativeResponse);
                });

            }

            return this.__nativeAppication;
        },

        /**
         * Set server static resourse path.
         *
         * @param nativeAppication {NodeJS.Connect}
         * @param serveStatic {NodeJS.ServeStatic}
         * @internal
         */
        __setServerStatic: function (nativeAppication, serveStatic) {
            this.getServerStaticPaths().forEach(function (sp) {
                nativeAppication.use(sp.urlPattern, serveStatic(sp.resoursePath));
            }, this);
        },

        /**
         * Returns list of static resourse paths.
         *
         * @return {Array} As this [ { urlPattern: '/public', resoursePath: '/opt/MyApp/public'}, ...]
         * @internal
         */
        getServerStaticPaths: function () {
            return [
                { urlPattern: '/public', resoursePath: guaraiba.path.join(guaraiba.resourcePath, 'public') }
            ]
        },

        /**
         * Get database schema connection.
         *
         * @param name {String ? 'default'} Unique name that identify database schema configuration.
         * @return {guaraiba.orm.DBSchema}
         * @throws {qx.core.AssertionError}
         */
        getDBSchema: function (name) {
            return this.getConfiguration().getDBSchema(name);
        },

        /**
         * This method is the entry point of each request and is responsible for routing to the indicated resource.
         *
         * @param nativeRequest {NodeJS.http.ServerRequest}
         * @param nativeResponse {NodeJS.http.ServerResponse}
         * @internal
         */
        __router: function (nativeRequest, nativeResponse) {
            var request = new guaraiba.Request(nativeRequest, this),
                response = new guaraiba.Response(nativeResponse, this),
                params = request.getParams(),
                controller, controllerClass;

            if (params && params.controller) {
                this.debug("'Worker #" + this.__worker.id + ' REQUEST: ' + guaraiba.Json.encode(params))

                controllerClass = params.controller.replace(/\//g, '.');

                if (qx.Class.isDefined(controllerClass)) {
                    controllerClass = qx.Class.getByName(controllerClass);
                    controller = new controllerClass(request, response, params);
                    controller._handleAction(params.action);
                } else {
                    response.send('Controller class ' + controllerClass + ' not found', 404);
                }
            } else {
                response.send('Route not found', 404);
            }
        },

        /**
         * Converts the value of the "settings" command line option to qx settings.
         *
         * @param args {String[]} Rhino arguments object
         */
        _argumentsToSettings: function (args) {
            var opts;
            for (var i = 0, l = args.length; i < l; i++) {
                if (args[i].indexOf("settings=") == 0) {
                    opts = args[i].substr(9);
                    break;
                }
                else if (args[i].indexOf("'settings=") == 0) {
                    opts = /'settings\=(.*?)'/.exec(args[i])[1];
                    break;
                }
            }
            if (opts) {
                opts = opts.replace(/\\\{/g, "{").replace(/\\\}/g, "}");
                opts = qx.lang.Json.parse(opts);
                for (var prop in opts) {
                    var value = opts[prop];
                    if (typeof value == "string") {
                        value = value.replace(/\$/g, " ");
                    }
                    try {
                        qx.core.Environment.add(prop, value);
                    } catch (ex) {
                        this.error("Unable to define command-line setting " + prop + ": " + ex);
                    }
                }
            }
        }
    },

    /**
     * @ignore(guaraiba)
     * @ignore(process.*)
     *
     * @param statics {Object}
     */
    defer: function (statics) {
        var path = require('path'),
            fs = require('fs'),
            appRoot, resPath;

        if (String(process.argv[1]).match(/jake$/)) {
            appRoot = process.cwd();
        } else {
            appRoot = path.dirname(process.argv[1])
        }

        // Locate the path to resources.
        if (fs.existsSync(path.join(appRoot, 'resource'))) {
            resPath = path.join(appRoot, 'resource');
        } else if (fs.existsSync(path.join(appRoot, '../resource'))) {
            resPath = fs.realpathSync(path.join(appRoot, '../resource'));
        } else if (fs.existsSync(path.join(appRoot, '../../resource'))) {
            resPath = fs.realpathSync(path.join(appRoot, '../../resource'));
        } else if (fs.existsSync(path.join(appRoot, 'source/resource'))) {
            resPath = fs.realpathSync(path.join(appRoot, 'source/resource'));
            appRoot = fs.realpathSync(path.join(appRoot, 'source/script'));
        }

        // Link to NodeJS modules and other guaraiba application var.
        qx.Bootstrap.objectMergeWith(guaraiba, {
            cwd: process.cwd(),
            exit: process.exit,
            appRoot: appRoot,
            resourcePath: resPath,
            env: process.env,
            utils: require('utilities'),
            path: path,
            fs: fs,
            connect: require('connect'),
            glob: require("glob"),
            extended: new require("extended"),
            async: require('async'),
            inflection: require('inflection'),
            underscore: require('underscore'),
            passport: require('passport'),
            mime: require('mime'),
            url: require('url'),
            http: require('http'),
            https: require('https'),
            Json: qx.lang.Json,
            prettyData: require('pretty-data').pd,
            array: require('array-extended'),
            utf8: require('utf8'),
            tmp: require('temporary'),
            java: require('java'),

            javaClasspath: function (jarFile) {
                jarFile = qx.util.ResourceManager.getInstance().toUri(jarFile);

                if (fs.existsSync(jarFile)) {
                    guaraiba.java.classpath.push(jarFile);
                } else {
                    var err = Error('FILE NOT FOUND (' + jarFile + ')');
                    qx.log.Logger.error(err);
                    throw err;
                }
            }
        }, true);

        guaraiba.Json.encode = guaraiba.Json.encode || guaraiba.Json.stringify;
        guaraiba.Json.decode = guaraiba.Json.decode || guaraiba.Json.parse;
    }
});