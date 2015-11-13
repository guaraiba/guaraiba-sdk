desc(
    'Dump data from model entity an save this in resource directory with self model path.\n' +
    '\t\t\t\t// Dump all models:\n'.info +
    '\t\t\t\tjake fixture:dump\n'.choose +
    '\t\t\t\t// Dump any model that contain Book, Article, or User word in name:\n'.info +
    '\t\t\t\tjake fixture:dump[Book,Article,User]\n'.choose
);
task('dump', { async: true }, function () {
    var i, overrideOption = -1,
        fs = require('fs'),
        util = require('util'),
        async = require('async'),
        promptly = require('promptly'),
        prettyData = require('pretty-data').pd,
        filters = qx.lang.Array.fromArguments(arguments),
        dbSchema = qx.core.BaseInit.getApplication().getDBSchema(),
        models = dbSchema.getModels(),
        actions = [],

        dump = function (model, file, next) {
            model.all().orderBy(model.getIdFieldName()).then(function (err, records) {
                if (!err) {
                    var item, data = [];
                    records.forEach(function (record) {
                        item = record.toDataObject();
                        if (model.isSerialId()) {
                            delete item[model.getIdFieldName()];
                        }
                        data.push(item);
                    });
                    fs.writeFile(file, prettyData.json(data), function (err) {
                        if (err) throw err;
                        next();
                    });
                } else {
                    console.error(err.message);
                    next();
                }
            });
        },

        execute = function (model) {
            actions.push(function (next) {
                console.info('FIXTURE DUMP: ' + model.getModelName());
                var file = util.format('%s/data/fixtures/%s/%s.json',
                    guaraiba.resourcePath,
                    dbSchema.getName(),
                    model.getModelName()
                );

                fs.exists(file, function (exists) {
                    if (exists) {
                        if (overrideOption === 1 /* Override all */) {
                            console.warn("OVERRIDE " + model.getModelName());
                            dump(model, file, next);
                        } else if (overrideOption === 3 /* Skip all */) {
                            console.warn("SKIP " + model.getModelName());
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
                                + '------------------------------------------------\n[' + '4'.choose + ']:'
                            promptly.choose(msg, [1, 2, 3, 4, 'x'], { default: 4 }, function (err, option) {
                                    switch (option) {
                                        case 1: /* Override all */
                                            overrideOption = option;
                                        case 2: /* Override this */
                                            console.warn("OVERRIDE: " + model.getModelName());
                                            dump(model, file, next);
                                            break;
                                        case 3: /* Skip all */
                                            overrideOption = option;
                                        case 4: /* Skip this */
                                            console.warn("SKIP " + model.getModelName());
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
            console.info("END FIXUTE");
            process.stdin.destroy();
            complete();
        }
    });
});
