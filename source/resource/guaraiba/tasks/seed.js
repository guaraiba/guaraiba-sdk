namespace('seed', function () {
    require('./colors');

    var dbSchemaName = process.env.dbSchema || process.env.s || 'default',
        knex = qx.core.BaseInit.getApplication().getDBSchema(dbSchemaName).getKNex();

    try {

        desc(
            'Creates a new seed, with the (name) of the seed being added.\n' +
            '     ======================================================================\n'.choose +
            '     Interactive mode:\n'.info +
            '       jake db:seed:make\n'.choose +
            '     Quiet mode:\n'.info +
            '       jake db:seed:make n=load_books\n'.choose +
            '       jake db:seed:make n=load_articles s=schema_x\n'.choose +
            '       jake db:seed:make name=load_articles dbSchema=schema_x\n'.choose +
            '     ======================================================================\n'.choose
        );
        task('make', { async: true }, function () {
            var name = process.env.name || process.env.n,
                make = function (name) {
                    console.info('MAKE SEED (' + name + ') OVER (' + dbSchemaName + ') DATABASE SCHEMA.');
                    knex.seed.make(name).then(function (file) {
                        console.info('SEED FILE: ' + file);
                        complete();
                    });
                };

            if (!name) {
                var promptly = require('promptly'),
                    msg = 'Name of seed in underscore_case'.prompt,
                    validateName = function (value) {
                        if (!value.match(/^[a-z][a-z0-9]*([_-][a-z0-9]+)*$/)) {
                            throw Error('Invalid name for seed file.'.error);
                        }

                        return value;
                    };

                promptly.prompt(msg, { validator: validateName }, function (err, name) { make(name)});
            } else {
                make(name);
            }

        });

        desc(
            'Runs all seeds that have not yet been run.\n' +
            '     ======================================================================\n'.choose +
            '       jake db:seed:run\n'.choose +
            '       jake db:seed:run s=schema_x\n'.choose +
            '       jake db:seed:run dbSchema=schema_x\n'.choose +
            '     ======================================================================\n'.choose
        );
        task('run', { async: true }, function () {
            console.info('RUN SEEDS OVER (' + dbSchemaName + ') DATABASE SCHEMA.');

            knex.seed.run().then(function () {
                complete();
            });
        });

    } catch (ex) {
        console.log('======================================================================');
        console.log(ex.getComment ? ex.getComment() : ex.toString());
        console.log('======================================================================');
    }
});
