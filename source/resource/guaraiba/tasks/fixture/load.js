desc(
    'Load data (update or create) from the "data/fixture/[model].json" files and inserted into corresponding entity database.\n' +
    '\t\t\t\t// Load all models:\n'.info +
    '\t\t\t\tjake fixture:load\n'.choose +
    '\t\t\t\t// Load any model that contain Book, Article, or User word:\n'.info +
    '\t\t\t\tjake fixture:load[Book,Article,User]\n'.choose
);
task('load', { async: true }, function () {
    var i,
        fs = require('fs'),
        util = require('util'),
        async = require('async'),
        promptly = require('promptly'),
        filters = qx.lang.Array.fromArguments(arguments),
        dbSchema = qx.core.BaseInit.getApplication().getDBSchema(),
        models = dbSchema.getModels(),
        loadFileActions = [],

        execute = function (model) {
            loadFileActions.push(function (nextFile) {
                console.info('FIXTURE LOAD START FROM: ' + model.getModelName());
                var file = util.format('%s/data/fixtures/%s/%s.json',
                    guaraiba.resourcePath,
                    dbSchema.getName(),
                    model.getModelName()
                );

                fs.exists(file, function (exists) {
                    if (exists) {
                        var items = require(file),
                            saveActions = [];

                        items.forEach(function (params) {
                            saveActions.push(function (nextSave) {
                                var record = new (model.getRecordClass())(params, dbSchema);
                                record.save(function (err) {
                                    err && console.error(err);
                                    nextSave();
                                });
                            });
                        });

                        async.series(saveActions, function (err, results) {
                            if (err) {
                                console.error(err);
                                process.abort();
                            } else {
                                console.info('FIXTURE LOAD FINISH FROM: ' + model.getModelName());
                                nextFile();
                            }
                        });
                    } else {
                        console.warn('SKIP: ' + model.getModelName() + ' - (NOT FOUND FIXTURE)');
                        next();
                    }
                });
            });
        };

    dbSchema.transaction(function (schema, commit, rollback) {
        if (filters.length == 0) {
            for (i in models) {
                execute(models[i]);
            }
        } else {
            for (i in models) {
                filters.forEach(function (f) {
                    if (i.match(f)) {
                        execute(models[i]);
                    } else {
                        console.warn("SKIP " + models[i].getModelName());
                    }
                }, this);
            }
        }

        async.series(loadFileActions, function (err, results) {
            if (err) {
                console.error(err);
                process.abort();
            } else {
                console.info("FINISH LOAD FIXTURE");
                commit();
            }
        });
    }, complete, complete);

});
