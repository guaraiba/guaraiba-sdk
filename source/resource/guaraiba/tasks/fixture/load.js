desc(
    'Load data (update or create) from the "data/fixture/[model].json" files and inserted into corresponding entity database.\n' +
    '\t\t\t\t// Load all models:\n'.info +
    '\t\t\t\tjake fixture:load\n'.choose +
    '\t\t\t\tjake fixture:load s=schema_x\n'.choose +
    '\t\t\t\tjake fixture:load schema=schema_x\n'.choose +
    '\t\t\t\t// Load any model that contain Book, Article, or User word in name:\n'.info +
    '\t\t\t\tjake fixture:load[Book,Article,User]\n'.choose +
    '\t\t\t\tjake fixture:load[Book,Article,User] s=schema_x\n'.choose +
    '\t\t\t\tjake fixture:load[Book,Article,User] schema=schema_x\n'.choose
);
task('load', {async: true}, function () {
    var fs = require('fs'),
        util = require('util'),
        async = require('async'),
        filters = qx.lang.Array.fromArguments(arguments),
        dbSchemaName = process.env.dbSchema || process.env.s || 'default',
        dbSchema = qx.core.BaseInit.getApplication().getDBSchema(dbSchemaName),
        models = dbSchema.getModels(),
        loadFileActions = [],

        execute = function (model) {

            loadFileActions.push(function (nextFile) {
                var modelName = model.getModelName(),
                    file = guaraiba.path.join(
                        guaraiba.appDataPath, 'fixtures',
                        dbSchema.getName(),
                        modelName + '.json'
                    );

                console.info('START LOAD TO MODEL: ' + modelName);
                console.log(file);
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
                                console.info('FINISH LOAD TO MODEL: ' + modelName);
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
            if (filters.length == 0) {
                for (var i in models) {
                    execute(models[i]);
                }
            } else {
                for (var i in models) {
                    filters.forEach(function (f) {
                        if (i.match(f)) {
                            execute(models[i]);
                        } else {
                            console.warn('SKIP LOAD TO MODEL: ' + models[i].getModelName());
                        }
                    }, this);
                }
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
