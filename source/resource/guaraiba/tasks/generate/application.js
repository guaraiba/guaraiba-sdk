desc('Generate new guaraiba server application.');
task('new-app', { async: true }, function () {
    var colors = require('../colors'),
        promptly = require('promptly'),
        settings = {},
        inflection = require('inflection'),
        format = require('util').format,

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

        actions = {
            start: function () {
                console.log('------------------------------------------------');
                console.info('Creating new guaraiba application.');
                actions.stepAppName()
            },

            stepAppName: function () {
                console.log('------------------------------------------------');
                var msg = 'Application name in :'.prompt;
                promptly.prompt(msg, { default: 'app-server', validator: validateAppName }, function (err, value) {
                    settings.appName = value;
                    actions.stepNamespace();
                });
            },

            stepNamespace: function () {
                console.log('------------------------------------------------');
                var msg = 'Application namespace:'.prompt;
                promptly.prompt(msg, { default: 'app-server', validator: validateNamespace }, function (err, value) {
                    settings.appName = value;
                    actions.stepGetRecordTableName();
                });
            },

            end: function () {
                console.log('------------------------------------------------');
                var cmd = "python node_modules/qooxdoo/create-application.py -t server -p source/resource/skeleton",
                    options = {
                        printStdout: true,
                        printStderr: true,
                        breakOnError: false,
                        interactive: true
                    };

                jake.exec(cmd, options, function () {
                    complete();
                });
            }
        };

    actions.start();
});