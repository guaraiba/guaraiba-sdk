desc(
    'Load data (update or create) from the "data/fixture/[dbSchema]/[model].json" files\n' +
    'and inserted into corresponding entity database.\n' +
    'Load all models:\n'.info +
    '  db:fixture:load\n'.choose +
    '  db:fixture:load s=schema_x\n'.choose +
    '  db:fixture:load dbSchema=schema_x\n'.choose +
    'Load any model that contain Book, Article, or User word in name:\n'.info +
    '  db:fixture:load[Book,Article,User]\n'.choose +
    '  db:fixture:load[Book,Article,User] s=schema_x\n'.choose +
    '  db:fixture:load[Book,Article,User] dbSchema=schema_x\n'.choose
);
task('load', { async: true }, function () {
    var fs = require('fs'),
        util = require('util'),
        async = require('async'),
        filters = arguments.length ? qx.lang.Array.fromArguments(arguments) : [/.*/],
        dbSchemaName = process.env.dbSchema || process.env.s || 'default',
        dbSchema = qx.core.BaseInit.getApplication().getDBSchema(dbSchemaName),
        fixturesPath = dbSchema.getKNex().client.config.fixtures.directory,
        models = dbSchema.getModels(),
        loadFileActions = [],

        load = function (model, file) {

            loadFileActions.push(function (nextFile) {
                var modelName = model.getModelName(),
                    relFilePath = file.replace(guaraiba.appRoot + '/', '');

                console.info('START LOAD TO MODEL (' + modelName + ') FROM (' + relFilePath + ')');
                fs.exists(file, function (exists) {
                    if (exists) {
                        var items = require(file),
                            saveActions = [];

                        items.forEach(function (params) {
                            saveActions.push(function (nextSave) {
                                var record = new (model.getRecordClass())(params, dbSchema);
                                record.save(function (err) {
                                    if (err) {
                                        console.error(err.message);
                                        process.abort();
                                    } else {
                                        nextSave();
                                    }
                                });
                            });
                        });

                        async.series(saveActions, function (err, results) {
                            if (err) {
                                console.error(err.message);
                                process.abort();
                            } else {
                                console.info('FINISH LOAD TO MODEL (' + modelName + ') FROM (' + relFilePath + ')');
                                nextFile();
                            }
                        });
                    } else {
                        console.warn('SKIP LOAD TO MODEL: ' + modelName + ' - (NOT FOUND FIXTURE)');
                        nextFile();
                    }
                });
            });
        };

    dbSchema.transaction(function (schema, commit, rollback) {
        console.info('START LOAD FIXTURE OVER DATABASE SCHEMA: ' + dbSchemaName);

        if (Object.keys(models).length == 0) {
            console.warn('NO MODELS REGISTERED IN THE DATABASE SCHEMA: ' + dbSchemaName);
        } else {
            for (var i in models) {
                filters.forEach(function (f) {
                    if (i.match(f)) {
                        var modelName = models[i].getModelName(),
                            fixtures = models[i].getFixtures();

                        if (fixtures != null) {
                            Object.keys(fixtures).forEach(function (name, idx) {
                                load(models[i], guaraiba.path.join(fixturesPath, modelName + '.' + name + '.json'));
                            });
                        } else {
                            load(models[i], guaraiba.path.join(fixturesPath, modelName + '.json'));
                        }
                    } else {
                        console.warn('SKIP LOAD TO MODEL: ' + models[i].getModelName());
                    }
                }, this);
            }
        }

        async.series(loadFileActions, function (err, results) {
            if (err) {
                console.error(err.message);
                rollback();
                process.abort();
            } else {
                console.info('FINISH LOAD FIXTURE OVER DATABASE SCHEMA: ' + dbSchemaName);
                commit();
            }
        });
    }, complete, complete);
});