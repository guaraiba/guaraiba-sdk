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
        actions = [],

        execute = function (model) {
            actions.push(function (next) {
                console.info('FIXTURE LOAD: ' + model.getModelName());
                var file = util.format('%s/data/fixtures/%s/%s.json',
                    guaraiba.resourcePath,
                    dbSchema.getName(),
                    model.getModelName()
                );

                fs.exists(file, function (exists) {
                    if (exists) {
                        console.info('FIXTURE LOAD: ' + model.getModelName());
                        var items = require(file), count = items.length;
                        if (count == 0) {
                            next();
                        } else {
                            items.forEach(function (params) {
                                var record = new (model.getRecordClass())(params, dbSchema);
                                record.save(function (err) {
                                    if (err) {
                                        console.error(err);
                                    }
                                    (count == 1) ? next() : count--;
                                });
                            });
                        }
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

        async.series(actions, function (err, results) {
            if (err) {
                console.error(err);
                process.abort();
            } else {
                console.info("END FIXTURE");
                commit();
                //process.stdin.destroy();
            }
        });
    }, complete, complete)

});
