desc(
    'Dump data from model entity an save this in resource directory with self model path.\n' +
    '\t\t\t  Dump all models:\n'.info +
    '\t\t\t    jake db:fixture:dump\n'.choose +
    '\t\t\t    jake db:fixture:dump s=schema_x\n'.choose +
    '\t\t\t    jake db:fixture:dump dbSchema=schema_x\n'.choose +
    '\t\t\t  Dump any model that contain Book, Article, or User word in name:\n'.info +
    '\t\t\t    jake db:fixture:dump[Book,Article,User]\n'.choose +
    '\t\t\t    jake db:fixture:dump[Book,Article,User] s=schema_x\n'.choose +
    '\t\t\t    jake db:fixture:dump[Book,Article,User] dbSchema=schema_x\n'.choose
);
task('dump', { async: true }, function () {
    var overrideOption = -1,
        fs = require('fs'),
        async = require('async'),
        promptly = require('promptly'),
        prettyData = require('pretty-data').pd,
        filters = qx.lang.Array.fromArguments(arguments),
        dbSchemaName = process.env.dbSchema || process.env.s || 'default',
        dbSchema = qx.core.BaseInit.getApplication().getDBSchema(dbSchemaName),
        fixturesPath = dbSchema.getKNex().client.config.fixtures.directory,
        models = dbSchema.getModels(),
        actions = [],

        dump = function (model, file, next) {
            var fixtures = model.getFixtures(),
                save = function (err, records, fileName, last) {
                    if (!err) {
                        var item, data = [];
                        records.forEach(function (record) {
                            item = record.toDataObject();
                            data.push(item);
                        });
                        fs.writeFile(fileName, prettyData.json(data), function (err) {
                            if (err) {
                                console.error(err.message);
                                process.abort();
                            } else {
                                last && next();
                            }
                        });
                    } else {
                        console.error(err.message);
                        process.abort();
                    }
                };

            if (fixtures != null) {
                Object.keys(fixtures).forEach(function (name, idx) {
                    fixtures[name].then(function (err, records) {
                        save(err, records, file.replace(/\.json/, '.' + name + '.json'), idx == Object.keys.length - 1);
                    });
                });
            } else {
                model.all().orderBy(model.getIdFieldName()).then(function (err, records) {
                    save(err, records, file, true);
                });
            }
        },

        execute = function (model, dbSchema) {
            actions.push(function (next) {
                console.info('START DUMP TO MODEL: ' + model.getModelName());
                var file = guaraiba.path.join(fixturesPath, model.getModelName() + '.json');

                fs.exists(file, function (exists) {
                    if (exists) {
                        if (overrideOption === 1 /* Override all */) {
                            console.warn('OVERRIDE DUMP TO MODEL: ' + model.getModelName());
                            dump(model, file, next);
                        } else if (overrideOption === 3 /* Skip all */) {
                            console.warn('SKIP DUMP TO MODEL: ' + model.getModelName());
                            next();
                        } else {
                            file = file.replace(guaraiba.cwd, '.');
                            console.warn('The file "' + file + '" already exists.');
                            console.warn('Choose one of the following options:');
                            var msg = 'Choose action:\n'.prompt
                                + '------------------------------------------------\n'
                                + '     1. Override all.\n'.choose
                                + '     2. Override this.\n'.choose
                                + '     3. Skip all.\n'.choose
                                + '     4. Skip this.\n'.choose
                                + '     x. Abort.\n'.choose
                                + '------------------------------------------------\n[' + '4'.choose + ']:';

                            promptly.choose(msg, [1, 2, 3, 4, 'x'], { default: 4 }, function (err, option) {
                                    switch (option) {
                                        case 1: /* Override all */
                                            overrideOption = option;
                                        case 2: /* Override this */
                                            console.warn('OVERRIDE DUMP TO MODEL: ' + model.getModelName());
                                            dump(model, file, next);
                                            break;
                                        case 3: /* Skip all */
                                            overrideOption = option;
                                        case 4: /* Skip this */
                                            console.warn('SKIP DUMP TO MODEL: ' + model.getModelName());
                                            next();
                                            break;
                                        case 'x': /* Abort */
                                            process.abort();
                                            break;
                                    }
                                }
                            );
                        }
                    } else {
                        jake.mkdirP(file.replace(/\/[^\/]+$/, ''));
                        dump(model, file, next);
                    }
                });
            });
        };

    console.info('START DUMP FIXTURE OVER DATABASE SCHEMA: ' + dbSchemaName);

    if (Object.keys(models).length == 0) {
        console.warn('NO MODELS REGISTERED IN THE DATABASE SCHEMA: ' + dbSchemaName);
    } else {
        if (filters.length == 0) {
            for (var i in models) {
                execute(models[i], dbSchema);
            }
        } else {
            for (var i in models) {
                filters.forEach(function (f) {
                    if (i.match(f)) {
                        execute(models[i], dbSchema);
                    } else {
                        console.warn('SKIP DUMP TO MODEL: ' + models[i].getModelName());
                    }
                }, this);
            }
        }
    }

    async.series(actions, function (err, results) {
        if (err) {
            console.error(err.message);
            process.abort();
        } else {
            console.info('FINISH DUMP FIXTURE OVER DATABASE SCHEMA: ' + dbSchemaName);
            complete();
        }
    });
});
