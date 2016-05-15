var colors = require('../colors');

desc(
    'Generate new guaraiba server application.\n' +
    '\t\t\t  Interactive mode:\n'.info +
    '\t\t\t   guaraiba new-app\n'.choose +
    '\t\t\t  Quiet mode:\n'.info +
    '\t\t\t   guaraiba new-app name=myproyect namespace=myproyect.test\n'.choose +
    '\t\t\t   guaraiba new-app n=myproyect ns=myproyect.test\n'.choose
);

task('new-app', { async: true }, function () {
    var promptly = require('promptly'),
        settings = {
            out: process.cwd(),
            appName: process.env.name || process.env.n,
            appNamespace: process.env.namespace || process.env.ns,
            options: {
                printStdout: true,
                printStderr: true,
                breakOnError: false,
                interactive: true
            }
        },

        validateAppName = function (value) {
            if (!value.match(/^[a-z]+[a-z0-9]*([\-\._ ][a-z]+[a-z0-9]*)*$/i)) {
                throw Error('Invalid application name.'.error);
            }

            return value;
        },

        validateNamespace = function (value) {
            if (!value.match(/^[a-z]+[a-z0-9]*(\.[a-z]+[a-z0-9]*)*$/i)) {
                throw Error('Invalid namespace.'.error);
            }

            return value;
        },

        error = function (msg) {
            msg = msg.replace(/WARN/, '').trim();

            if (msg) {
                if (msg.match(/Error:/)) {
                    console.error(msg);
                    process.abort();
                } else {
                    console.warn(msg);
                }
            }
        },

        actions = {
            start: function () {
                console.log('------------------------------------------------');
                console.log('Creating new guaraiba application.'.info);
                actions.stepAppName()
            },

            stepAppName: function () {
                if (settings.appName && validateAppName(settings.appName)) {
                    actions.stepNamespace();
                } else {
                    console.log('------------------------------------------------');
                    var msg = 'Application name in :'.prompt;
                    promptly.prompt(msg, { default: 'app-server', validator: validateAppName }, function (err, value) {
                        settings.appName = value;
                        actions.stepNamespace();
                    });
                }
            },

            stepNamespace: function () {
                if (settings.appNamespace && validateNamespace(settings.appNamespace)) {
                    actions.stepGenerate();
                } else {
                    console.log('------------------------------------------------');
                    var msg = 'Application namespace:'.prompt;
                    promptly.prompt(msg, {
                        default: 'app-server',
                        validator: validateNamespace
                    }, function (err, value) {
                        settings.appNamespace = value;
                        actions.stepGenerate();
                    });
                }
            },

            stepGenerate: function () {
                console.log('------------------------------------------------');
                var module = require('module'),
                    path = require('path'),
                    spawn = require('child_process').spawn,
                    qooxdooAppCreator = module._resolveFilename('qooxdoo/create-application.py'),
                    guaraibaPath = path.dirname(module._resolveFilename('guaraiba')),
                    skeletonPath = path.join(guaraibaPath, '/source/resource/skeleton'),
                    childProcess = spawn('python', [qooxdooAppCreator,
                        '-t', 'server',
                        '-p', skeletonPath,
                        '--cache=' + guaraibaPath,
                        '-n', settings.appName,
                        '-s', settings.appNamespace,
                        '-o', settings.out
                    ]);

                childProcess.stdout.addListener("data", function (data) {
                    console.info(data.toString().trim());
                });

                childProcess.stderr.addListener("data", function (data) {
                    error(data.toString());
                });

                childProcess.addListener('exit', function (code) {
                    complete();
                });
            }
        };

    actions.start();
});