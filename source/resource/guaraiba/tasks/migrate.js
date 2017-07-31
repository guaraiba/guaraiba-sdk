namespace('migrate', function () {
    require('./colors');

    var dbSchemaName = process.env.dbSchema || process.env.s || 'default',
        knex = qx.core.BaseInit.getApplication().getDBSchema(dbSchemaName).getKNex();

    try {

        desc(
            'Creates a new migration, with the (name) of the migration being added.\n' +
            'Interactive mode over default database schema:\n'.info +
            '  jake db:migrate:make\n'.choose +
            'Quiet mode:\n'.info +
            '  jake db:migrate:make n=create_books\n'.choose +
            '  jake db:migrate:make n=create_articles s=schema_x\n'.choose +
            '  jake db:migrate:make name=alter_articles dbSchema=schema_x\n'.choose
        );
        task('make', { async: true }, function () {
            var name = process.env.name || process.env.n,
                make = function (name) {
                    console.info('MAKE MIGRATION (' + name + ') OVER (' + dbSchemaName + ') DATABASE SCHEMA.');
                    knex.migrate.make(name).then(function (file) {
                        console.info('MIGRATE FILE: ' + file);
                        complete();
                    });
                };

            if (!name) {
                var promptly = require('promptly'),
                    msg = 'Name of migration in underscore_case'.prompt,
                    validateName = function (value) {
                        if (!value.match(/^[a-z][a-z0-9]*([_-][a-z0-9]+)*$/)) {
                            throw Error('Invalid name for migration file.'.error);
                        }

                        return value;
                    };

                promptly.prompt(msg, { validator: validateName }, function (err, name) { make(name)});
            } else {
                make(name);
            }

        });


        desc(
            'Runs all migrations that have not yet been run.\n' +
            '  jake db:migrate:run\n'.choose +
            '  jake db:migrate:run s=schema_x\n'.choose +
            '  jake db:migrate:run dbSchema=schema_x\n'.choose
        );
        task('run', { async: true }, function () {
            console.info('RUN MIGRATIONS OVER (' + dbSchemaName + ') DATABASE SCHEMA.');

            knex.migrate.latest().then(function (files) {
                complete();
            });
        });

        desc(
            'Rolls back the latest migrations group.\n' +
            '  jake db:migrate:rollback\n'.choose +
            '  jake db:migrate:rollback s=schema_x\n'.choose +
            '  jake db:migrate:rollback dbSchema=schema_x\n'.choose
        );
        task('rollback', { async: true }, function () {
            console.info('ROLLBACK LAST MIGRATIONS GROUP OVER (' + dbSchemaName + ') DATABASE SCHEMA.');

            knex.migrate.rollback().then(function () {
                complete();
            });
        });

        desc(
            'View the current version for the migration.\n' +
            '  jake db:migrate:status\n'.choose +
            '  jake db:migrate:status s=schema_x\n'.choose +
            '  jake db:migrate:status dbSchema=schema_x\n'.choose
        );
        task('status', { async: true }, function () {
            knex.migrate.currentVersion().then(function () {
                console.info(arguments)
                complete();
            });
        });

    } catch (ex) {
        console.log('======================================================================');
        console.log(ex.getComment ? ex.getComment() : ex.toString());
        console.log('======================================================================');
    }
});
