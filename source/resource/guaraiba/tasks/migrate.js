namespace('db', function () {
    require('./colors');

    var dbSchemaName = process.env.dbSchema || process.env.s || 'default',
        knex = qx.core.BaseInit.getApplication().getDBSchema(dbSchemaName).getKNex();

    try {
        desc(
            'Creates a new migration, with the (name) of the migration being added.\n' +
            '\t\t\t  Interactive mode over default database schema:\n'.info +
            '\t\t\t   jake db:make-migration\n'.choose +
            '\t\t\t  Quiet mode:\n'.info +
            '\t\t\t   jake db:make-migration n=create_books\n'.choose +
            '\t\t\t   jake db:make-migration n=create_articles s=schema_x\n'.choose +
            '\t\t\t   jake db:make-migration name=alter_articles dbSchema=schema_x\n'.choose
        );
        task('make-migration', { async: true }, function () {
            var name = process.env.name || process.env.n,
                make = function (name) {
                    console.info('MAKE MIGRATION (' + name + ') OVER (' + dbSchemaName + ') DATABASE SCHEMA.');
                    knex.migrate.make(name).then(function () {
                        complete();
                    });
                };

            if (!name) {
                var promptly = require('promptly'),
                    msg = 'Name of migration in underscore_case:'.prompt,
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
            '\t\t\t   jake db:migrate\n'.choose +
            '\t\t\t   jake db:migrate s=schema_x\n'.choose +
            '\t\t\t   jake db:migrate dbSchema=schema_x\n'.choose
        );
        task('migrate', { async: true }, function () {
            console.info('MIGRATE DATABASE OVER (' + dbSchemaName + ') SCHEMA.');

            knex.migrate.latest().then(function (files) {
                complete();
            });
        });

        desc(
            'Rolls back the latest migration group.\n' +
            '\t\t\t   jake db:rollback\n'.choose +
            '\t\t\t   jake db:rollback s=schema_x\n'.choose +
            '\t\t\t   jake db:rollback dbSchema=schema_x\n'.choose
        );
        task('rollback', { async: true }, function () {
            console.info('ROLLBACK THE DATABASE MIGRATION OVER (' + dbSchemaName + ') SCHEMA.');

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
