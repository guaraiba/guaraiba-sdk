/**
 * Copyright ©:
 *      2015 Yoandry Pacheco Aguila
 *
 * License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *      See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *      Yoandry Pacheco Aguila < yoandrypa@gmail.com >
 *
 */

var util = require('util');

/**
 * This class offers the basic features and properties to create database schema.
 *
 * This class required knex modules.
 *
 * @ignore(complete)
 */
qx.Mixin.define('guaraiba.orm.MTask', {

    members: {

        /**
         * Register tasks to management database schema.
         */
        registerTasks: function () {
            guaraiba.Tasks.registerTask('fixture', 'load', true, this.fixtureLoadTask, this,
                'Load into databases the new instances of model classes from fixture files.'
            );

            guaraiba.Tasks.registerTask('fixture', 'dump', true, this.fixtureDumpTask, this,
                'Dump all instances of model classes in fixture files.'
            );

            guaraiba.Tasks.registerTask('fixture', 'clean', true, this.fixtureCleanTask, this,
                'Remove all instances of model classes in databases.'
            );

            guaraiba.Tasks.registerTask('migrate', 'make', true, this.migrateMakeTask, this,
                'Creates a new migration, with the (name) of the migration being added.'
            );

            guaraiba.Tasks.registerTask('migrate', 'latest', true, this.migrateLatestTask, this,
                'Runs all migrations that have not yet been run.'
            );

            guaraiba.Tasks.registerTask('migrate', 'rollback', true, this.migrateRollbackTask, this,
                'Rolls back the latest migration group.'
            );
        },

        /**
         * Load data (update or create) from the "data/fixture/[model].json" files and inserted into
         * corresponding entity database.
         *
         * <pre class='javascript'>
         *
         *      // Load all model entity:
         *      node source/script/app.js fixture:load
         *
         *      // Load any model that contain book, article, or user word:
         *      node source/script/app.js fixture:load[Book,Article,User]
         *
         * </pre>
         */
        fixtureLoadTask: function () {
            var vThis = this,
                i, filters = qx.lang.Array.fromArguments(arguments),
                schemaName = this.getName(),
                actions = [],

                execute = function (model) {
                    actions.push(function (next) {
                        qx.log.Logger.info('FIXTURE LOAD: ' + model.getModelName());
                        var file = util.format('%s/data/fixtures/%s/%s.json',
                            guaraiba.resourcePath,
                            schemaName,
                            model.getModelName()
                        );

                        guaraiba.fs.exists(file, function (exists) {
                            if (exists) {
                                qx.log.Logger.info('FIXTURE LOAD: ' + model.getModelName());
                                var items = require(file), count = items.length;
                                if (count == 0) {
                                    next();
                                } else {
                                    items.forEach(function (params) {
                                        var record = new (model.getRecordClass())(params, vThis);
                                        record.save(function (err) {
                                            if (err) {
                                                qx.log.Logger.error(err);
                                            }
                                            (count == 1) ? next() : count--;
                                        });
                                    });
                                }
                            } else {
                                qx.log.Logger.warn('SKIP: ' + model.getModelName() + ' - (NOT FOUND FIXTURE)');
                                next();
                            }
                        });
                    });
                };

            if (filters.length == 0) {
                for (i in this.__models) {
                    execute(this.__models[i]);
                }
            } else {
                for (i in this.__models) {
                    filters.forEach(function (f) {
                        if (i.match(f)) {
                            execute(this.__models[i]);
                        } else {
                            qx.log.Logger.warn("SKIP " + this.__models[i].getModelName());
                        }
                    }, this);
                }
            }

            guaraiba.async.series(actions, function (err, results) {
                if (err) {
                    qx.log.Logger.error(err);
                    process.abort();
                } else {
                    qx.log.Logger.info("END FIXUTE");
                    process.stdin.destroy();
                    complete();
                }
            });
        },

        /**
         * Dump data from model entity an save this in resource directory with self model path.
         *
         * <pre class='javascript'>
         *
         *      // Dump all model entity:
         *      node source/script/app.js fixture:dump
         *
         *      // Dump any model that contain book, article, or user word in name:
         *      node source/script/app.js fixture:dump[Book,Article,User]
         *
         * </pre>
         */
        fixtureDumpTask: function () {
            var i, overrideOption = -1,
                promptly = require('promptly'),
                jake = require('jake'),
                filters = qx.lang.Array.fromArguments(arguments),
                schemaName = this.getName(),
                actions = [],

                dump = function (model, file, next) {
                    model.all().orderBy(model.getIdFieldName()).then(function (err, records) {
                        if (err) throw err;
                        var item, data = [];
                        records.forEach(function (record) {
                            item = record.toDataObject();
                            if (model.isSerialId()) {
                                delete item[model.getIdFieldName()];
                            }
                            data.push(item);
                        });
                        guaraiba.fs.writeFile(file, guaraiba.prettyData.json(data), function (err) {
                            if (err) throw err;
                            next();
                        });
                    });
                },

                execute = function (model) {
                    actions.push(function (next) {
                        qx.log.Logger.info('FIXTURE DUMP: ' + model.getModelName());
                        var file = util.format('%s/data/fixtures/%s/%s.json',
                            guaraiba.resourcePath,
                            schemaName,
                            model.getModelName()
                        );

                        guaraiba.fs.exists(file, function (exists) {
                            if (exists) {
                                if (overrideOption === 1 /* Override all */) {
                                    qx.log.Logger.warn("OVERRIDE " + model.getModelName());
                                    dump(model, file, next);
                                } else if (overrideOption === 3 /* Skip all */) {
                                    qx.log.Logger.warn("SKIP " + model.getModelName());
                                } else {
                                    qx.log.Logger.warn('The file "' + file + '" already exists.');
                                    qx.log.Logger.warn('Choose one of the following options:');
                                    promptly.choose(('' +
                                        '-------------------------------\n' +
                                        '            1-Override all\n' +
                                        '            2-Override this\n' +
                                        '            3-Skip all\n' +
                                        '            4-Skip this\n' +
                                        '            5-Abort:'),
                                        [1, 2, 3, 4, 5],
                                        function (err, option) {
                                            switch (option) {
                                                case 1: /* Override all */
                                                    overrideOption = option;
                                                case 2: /* Override this */
                                                    qx.log.Logger.warn("OVERRIDE: " + model.getModelName());
                                                    dump(model, file, next);
                                                    break;
                                                case 3: /* Skip all */
                                                    overrideOption = option;
                                                case 4: /* Skip this */
                                                    qx.log.Logger.warn("SKIP " + model.getModelName());
                                                    next();
                                                    break;
                                                case 5: /* Abort */
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
                for (i in this.__models) {
                    execute(this.__models[i]);
                }
            } else {
                for (i in this.__models) {
                    filters.forEach(function (f) {
                        if (i.match(f)) {
                            execute(this.__models[i]);
                        } else {
                            qx.log.Logger.warn("SKIP " + this.__models[i].getModelName());
                        }
                    }, this);
                }
            }

            guaraiba.async.series(actions, function (err, results) {
                if (err) {
                    qx.log.Logger.error(err);
                    process.abort();
                } else {
                    qx.log.Logger.info("END FIXUTE");
                    process.stdin.destroy();
                    complete();
                }
            });
        },

        /**
         * Remove from data base all instances of model entity.
         *
         * <pre class='javascript'>
         *
         *      // Clean all model entity:
         *      node source/script/app.js fixture:dump
         *
         *      // Clean any model that contain book, article, or user word in name:
         *      node source/script/app.js fixture:dump[Book,Article,User]
         *
         * </pre>
         */
        fixtureCleanTask: function () {
            var i, filters = qx.lang.Array.fromArguments(arguments),
                actions = [],

                execute = function (model) {
                    actions.push(function (next) {
                        qx.log.Logger.info('FIXTURE CLEAN: ' + model.getModelName());
                        model.remove(function (err) {
                            if (err) qx.log.Logger.error(err);
                            next();
                        });
                    });
                };

            if (filters.length == 0) {
                for (i in this.__models) {
                    execute(this.__models[i]);
                }
            } else {
                for (i in this.__models) {
                    filters.forEach(function (f) {
                        if (i.match(f)) {
                            execute(this.__models[i]);
                        } else {
                            qx.log.Logger.warn("SKIP " + this.__models[i].getModelName());
                        }
                    }, this);
                }
            }

            guaraiba.async.series(actions, function (err, results) {
                if (err) {
                    qx.log.Logger.error(err);
                    process.abort();
                } else {
                    qx.log.Logger.info("END FIXUTE");
                    process.stdin.destroy();
                    complete();
                }
            });
        },

        /**
         * Create new migrate file.
         *
         * <pre class='javascript'>
         *
         *      // Create migrate file for people entity:
         *      node source/script/app.js migrate:make[people]
         *
         * </pre>
         *
         * @param name {String} String used in the prefix file name.
         */
        migrateMakeTask: function (name) {
            var knex = this.__knex;

            knex.migrate.make(name).then(function () {
                complete();
            });
        },

        /**
         * Run migrate.
         *
         * <pre class='javascript'>
         *
         *      // Run migrate files upto latest version:
         *      node source/script/app.js migrate:latest
         *
         * </pre>
         */
        migrateLatestTask: function () {
            var knex = this.__knex;

            knex.migrate.latest().then(function (files) {
                complete();
            });
        },

        /**
         * Run rollback.
         *
         * <pre class='javascript'>
         *
         *      // Run migrate files upto latest version:
         *      node source/script/app.js migrate:latest
         *
         * </pre>
         */
        migrateRollbackTask: function () {
            var knex = this.__knex;

            knex.migrate.rollback().then(function () {
                complete();
            });
        }
    }
});