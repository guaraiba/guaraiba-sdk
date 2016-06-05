desc(
    'Remove instances of model classes in databases.\n' +
    '\t\t\t\t// Clean all models:\n'.info +
    '\t\t\t\tjake fixture:clean\n'.choose +
    '\t\t\t\tjake fixture:clean s=schema_x\n'.choose +
    '\t\t\t\tjake fixture:clean schema=schema_x\n'.choose +
    '\t\t\t\t// Clean any model that contain Book, Article, or User word in name:\n'.info +
    '\t\t\t\tjake fixture:clean[Book,Article,User]\n'.choose +
    '\t\t\t\tjake fixture:clean[Book,Article,User] s=schema_x\n'.choose +
    '\t\t\t\tjake fixture:clean[Book,Article,User] schema=schema_x\n'.choose
);
task('clean', { async: true }, function () {
    var async = require('async'),
        filters = qx.lang.Array.fromArguments(arguments),
        dbSchemaName = process.env.dbSchema || process.env.s || 'default',
        dbSchema = qx.core.BaseInit.getApplication().getDBSchema(dbSchemaName),
        models = dbSchema.getModels(),
        actions = [],

        execute = function (model) {
            actions.push(function (next) {
                console.info('START CLEAN TO MODEL: ' + model.getModelName());
                model.remove(function (err) {
                    if (err) {
                        console.error(err.message);
                        process.abort();
                    } else {
                        console.info('FINISH CLEAN TO MODEL: ' + model.getModelName());
                        next();
                    }
                });
            });
        };

    dbSchema.transaction(function (schema, commit, rollback) {
        console.info('START CLEAN FIXTURE OVER DATABASE SCHEMA: ' + dbSchemaName);

        if (Object.keys(models).length == 0) {
            console.warn('NO MODELS REGISTERED IN THE DATABASE SCHEMA: ' + dbSchemaName);
        } else {
            if (filters.length == 0) {
                Object.keys(models).reverse().forEach(function (i) {
                    execute(models[i]);
                }, this);
            } else {
                Object.keys(models).reverse().forEach(function (i) {
                    filters.forEach(function (f) {
                        if (i.match(f)) {
                            execute(models[i]);
                        } else {
                            console.warn('SKIP CLEAN TO MODEL: ' + models[i].getModelName());
                        }
                    }, this);
                }, this);
            }
        }

        async.series(actions, function (err, results) {
            if (err) {
                console.error(err.message);
                rollback();
                process.abort();
            } else {
                console.info('FINISH CLEAN FIXTURE OVER DATABASE SCHEMA: ' + dbSchemaName);
                commit();

            }
        });
    }, complete, complete);
});
