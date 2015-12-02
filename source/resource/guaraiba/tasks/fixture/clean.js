desc(
    'Remove instances of model classes in databases.\n' +
    '\t\t\t\t// Clean all models:\n'.info +
    '\t\t\t\tjake fixture:clean\n'.choose +
    '\t\t\t\t// Clean any model that contain Book, Article, or User word:\n'.info +
    '\t\t\t\tjake fixture:clean[Book,Article,User]\n'.choose
);
task('clean', { async: true }, function () {
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
                console.info('FIXTURE CLEAN: ' + model.getModelName());
                model.remove(function (err) {
                    if (err) console.error(err);
                    next();
                });
            });
        };

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
                    console.warn("SKIP " + models[i].getModelName());
                }
            }, this);
        }, this)
    }

    async.series(actions, function (err, results) {
        if (err) {
            console.error(err);
            process.abort();
        } else {
            console.info("END FIXUTE");
            process.stdin.destroy();
            complete();
        }
    });
});
