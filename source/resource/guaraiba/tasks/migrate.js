namespace('migrate', function () {
    require('./colors');

    try {
        desc('Creates a new migration, with the (name) of the migration being added.');
        task('make', { async: true }, function (name) {
            var knex = qx.core.BaseInit.getApplication().getDBSchema().getKNex();

            if (!name) {
                var promptly = require('promptly'),
                    msg = 'Name of migration in underscore_case:'.prompt,
                    validateName = function (value) {
                        if (!value.match(/^[a-z][a-z0-9]*([_-][a-z0-9]+)*$/)) {
                            throw Error('Invalid name for migration file.'.error);
                        }

                        return value;
                    };

                promptly.prompt(msg, { validator: validateName }, function (err, name) {
                    knex.migrate.make(name).then(function () {
                        complete();
                    });
                });
            } else {
                knex.migrate.make(name).then(function () {
                    complete();
                });
            }

        });

        desc('Runs all migrations that have not yet been run.');
        task('latest', { async: true }, function () {
            var knex = qx.core.BaseInit.getApplication().getDBSchema().getKNex();

            knex.migrate.latest().then(function (files) {
                complete();
            });
        });

        desc('Rolls back the latest migration group.');
        task('rollback', { async: true }, function () {
            var knex = qx.core.BaseInit.getApplication().getDBSchema().getKNex();

            knex.migrate.rollback().then(function () {
                complete();
            });
        });
    } catch (ex) {
        console.log('----------------------------------------------------------------------');
        console.log(ex.getComment ? ex.getComment() : ex.toString());
        console.log('----------------------------------------------------------------------');
    }
});
