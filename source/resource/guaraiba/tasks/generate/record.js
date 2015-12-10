desc('Add a new record class into application model.');
task('record', { async: true }, function () {
    var fs = require('fs'),
        colors = require('../colors'),
        promptly = require('promptly'),
        prettyJson = require('prettyjson'),
        beautify = require('js-beautify').js_beautify,
        app = qx.core.BaseInit.getApplication(),
        appNamespace = app.constructor.classname.replace('.Application', ''),
        settings = { fields: {} },
        inflection = require('inflection'),
        format = require('util').format,

        validateClassName = function (value) {
            if (!value.match(/^([a-z]+\.)*([A-Z][a-z]+)+$/)) {
                throw Error('Invalid name for record class.'.error);
            }

            if (!value.match(/\./)) {
                value = appNamespace + '.models.' + value;
            }

            settings.path = 'source/class/' + value.replace(/\./g, '/') + '.js';

            if (fs.existsSync(settings.path)) {
                throw Error(String('File [' + settings.path + '] already exists.').error, settings.path);
            }

            return value;
        },

        validateRelationName = function (value) {
            if (!value.match(/^([a-z]+_?[a-z]+)+$/)) {
                throw Error('Invalid name for relation (table or view).'.error);
            }

            return value;
        },

        validateFieldName = function (value) {
            if (!value.match(/^[a-z]+([A-Z][a-z]+)*$/)) {
                throw Error('Invalid name for record field.'.error);
            }

            return value;
        },

        actions = {
            start: function () {
                console.log('------------------------------------------------');
                console.info('Creating new record class for application model.');
                actions.stepGetRecordClass()
            },

            stepGetRecordClass: function () {
                console.log('------------------------------------------------');
                var msg = 'Name of record class in UpperCamelCase:'.prompt;
                promptly.prompt(msg, { validator: validateClassName }, function (err, value) {
                    settings.className = value;
                    actions.stepGetRecordTableName();
                });
            },

            stepGetRecordTableName: function () {
                console.log('------------------------------------------------');
                var defaultName = inflection.underscore(settings.className.split('.').pop()),
                    msg = 'Name of relation (view or table) in underscore_case ['.prompt + defaultName.choose + ']:'.prompt;

                promptly.prompt(msg, { validator: validateRelationName, default: defaultName }, function (err, value) {
                    settings.tableName = value != defaultName ? value : '';
                    actions.stepIsTimestampRecord();
                });
            },

            stepIsTimestampRecord: function () {
                console.log('------------------------------------------------');
                var msg = 'Is timestamp record '.prompt + '(Y/n)'.choose + ':?'.prompt;
                promptly.choose(msg, ['y', 'n'], { default: 'y' }, function (err, value) {
                    settings.timestamp = (value == 'y');
                    actions.stepAddField();
                });
            },

            stepAddField: function () {
                console.log('------------------------------------------------');
                var msg = 'Name of field in lowerCamelCase:'.prompt;
                promptly.prompt(msg, { validator: validateFieldName }, function (err, value) {
                    settings.fields[value] = { name: value }
                    actions.stepGetFieldType(value);
                });
            },

            stepGetFieldType: function (name) {
                console.log('------------------------------------------------');
                var types = ['Boolean', 'Character', 'Date', 'Float', 'Integer', 'Number', 'Serial', 'String', 'Text'],
                    values = types.map(function (t, i) {return i}),
                    msg = 'Choose type for '.prompt + name.choose + ' field:\n'.prompt
                        + '------------------------------------------------\n'
                        + types.map(function (t, i) {return i + '. ' + t}).join('\n').choose + '\n'
                        + '------------------------------------------------\n[' + 'String'.choose + ']:'
                promptly.choose(msg, values, { default: 7 }, function (err, value) {
                    settings.fields[name].type = 'guaraiba.orm.DBSchema.' + types[value];
                    actions.stepAllowNull(name);
                });
            },

            stepAllowNull: function (name) {
                console.log('------------------------------------------------');
                var msg = 'Allow null value in '.prompt + name.choose + ' field '.prompt + '(Y/n)'.choose + '?:'.prompt
                promptly.choose(msg, ['y', 'n'], { default: 'y' }, function (err, value) {
                    settings.fields[name].allowNull = (value == 'y');
                    actions.stepListAllFields();
                });
            },

            stepChooseNextAction: function () {
                console.log('------------------------------------------------');
                var msg = 'Choose action:\n'.prompt
                    + '------------------------------------------------\n'
                    + '     1. Add new field.\n'.choose
                    + '     2. List all fields.\n'.choose
                    + '     3. Remove all fields.\n'.choose
                    + '     4. Create record class.\n'.choose
                    + '     x. Abort.\n'.choose
                    + '------------------------------------------------\n[' + '1'.choose + ']:'
                promptly.choose(msg, ['1', '2', '3', '4', 'x'], { default: 1 }, function (err, value) {
                    if (value == '1') actions.stepAddField();
                    else if (value == '2') actions.stepListAllFields();
                    else if (value == '3') actions.stepRemoveAllField();
                    else if (value == '4') actions.stepCreateFile();
                    else if (value == 'x') process.abort();
                });
            },

            stepListAllFields: function () {
                console.log('------------------------------------------------');
                console.log(prettyJson.render(settings.fields));
                actions.stepChooseNextAction();
            },

            stepRemoveAllField: function () {
                settings.fields = {};
                actions.stepAddField();
            },

            stepCreateFile: function () {
                console.log('------------------------------------------------');
                var stream = fs.createWriteStream(settings.path);
                stream.once('open', function (fd) {
                    var template = '' +
                            'qx.Class.define(%j, {' +
                            '    extend: guaraiba.orm.Record,' +
                            '    include: [%s],\n\n' +
                            '    statics: {tableName:%j},\n\n' +
                            '    properties: {%s}' +
                            '});',

                        code = format(template,
                            settings.className,
                            settings.timestamp ? 'guaraiba.orm.MTimestampRecord' : '',
                            settings.tableName,
                            Object.keys(settings.fields).map(function (name) {
                                return format('%s: {check: %s, nullable: %j}',
                                    name,
                                    settings.fields[name].type,
                                    settings.fields[name].allowNull
                                )
                            }).join(',\n\n')
                        );

                    code = code.replace('    include: [],\n', '');
                    code = code.replace('    statics: {tableName:""},\n\n', '');
                    code = beautify(code, { indent_size: 4 });

                    stream.write(code);
                    stream.end();
                    actions.stepRegisterModel(code);
                });
            },

            stepRegisterModel: function (code) {
                console.log('------------------------------------------------');
                console.log(colors.warn(code));
                console.log('------------------------------------------------');

                var schema = 'source/class/' + appNamespace + '/schemas/Default.js';
                if (fs.existsSync(schema)) {
                    console.info('Registering record class in default schema:');
                    var replace = require('replace');
                    replace({
                        regex: /(\s*)(\/\/ END REGISTER RECORD CLASS\. DON'T REMOVE OR CHANGE THIS COMMENTARY\..*)/,
                        replacement: '$1this.register(' + settings.className + ');$1$2',
                        paths: [schema],
                        silent: true,
                    });
                } else {
                    console.info('You need register class in your schema adding: ',
                        colors.data(' this.register('),
                        colors.choose(settings.className),
                        colors.data(')')
                    );
                    console.info('Find schemas in:',
                        colors.choose('source/class/' + appNamespace + '/schemas')
                    );
                }
                console.log('------------------------------------------------');

                var msg = 'Do you whant create RestController '.prompt + '(Y/n)'.choose + ':?'.prompt;
                promptly.choose(msg, ['y', 'n'], { default: 'y' }, function (err, value) {
                    if (value == 'y') {
                        actions.stepCreateController();
                    } else {
                        actions.end();
                    }
                });
            },

            stepCreateController: function () {
                var clazz = inflection.pluralize(settings.className);

                clazz = clazz.replace(appNamespace, appNamespace + '.controllers');
                clazz = clazz.replace('.models.', '.');

                var path = 'source/class/' + clazz.replace(/\./g, '/') + '.js',
                    stream = fs.createWriteStream(path);

                stream.once('open', function (fd) {
                    var code,
                        template = '' +
                            'qx.Class.define(%j, {' +
                            '    extend: guaraiba.controllers.RestModelController,\n\n' +
                            '    /**\n' +
                            '     * @param request {guaraiba.Request}\n' +
                            '     * @param response {guaraiba.Response}\n' +
                            '     * @param params {Object?} Params hash.\n' +
                            '     */' +
                            '    construct: function (request, response, params) {' +
                            '        this.base(arguments, request, response, params);' +
                            '        this.setRecordClass(%s);' +
                            '        this.setAcceptFilters(true);' +
                            '    }' +
                            '});';

                    code = format(template, clazz, settings.className);
                    code = beautify(code, { indent_size: 4 });

                    stream.write(code);
                    stream.end();
                    actions.stepRegisterRouter(code, clazz);
                });
            },

            stepRegisterRouter: function (code, clazz) {
                console.log('------------------------------------------------');
                console.log(colors.warn(code));
                console.log('------------------------------------------------');

                console.info('Registering controller class in Router class:');
                var replace = require('replace');
                replace({
                    regex: /(\s*)(\/\/ END REGISTER RESOURCE ROUTERS\. DON'T REMOVE OR CHANGE THIS COMMENTARY\..*)/,
                    replacement: '$1this.resource(' + clazz + ');$1$2',
                    paths: ['source/class/' + appNamespace + '/Router.js'],
                    silent: true,
                });
                console.log('------------------------------------------------');
                console.log(colors.warn('  this.resource(' + clazz + ')'));
                actions.end();
            },

            end: function () {
                console.log('------------------------------------------------');
                jake.Task['build:dev'].execute();
                complete();
            }
        };

    actions.start();
});