/**
 * This class offers the specific properties and features to configure the ${Name} application.
 *
 * @require(guaraiba.Passport)
 */
qx.Class.define('${Namespace}.Configuration', {
    type: 'singleton',
    extend: guaraiba.Configuration,

    members: {

        init: function () {
            // this.setPort(3002);
            // this.setMaxWorkers(4);
            // this.sessionSecret('a3d68565c5bd86c8d13af3b98c23e6bb');
            this.setDefaultFormat('json');
            this.setAllowCORS(false);

            // Register database schemas.
            var path = guaraiba.path,
                db = path.join(guaraiba.resourcePath,'${Namespace}/data/app.db'),
                migrations = path.join(guaraiba.resourcePath, '${Namespace}/data/migrations'),
                seeds = path.join(guaraiba.resourcePath, '${Namespace}/data/seeds'),
                
                knexSetting = {
                    client: 'sqlite3',
                    connection: db,
                    debug: true,
                    migrations: {
                        directory: migrations,
                        tableName: 'default_migrations'
                    },
                    seeds: {
                        directory: seeds
                    }
                },

                jdbcSettings = { driver: 'org.sqlite.JDBC', connectString: 'jdbc:sqlite:' + db }

            this.registerDBSchema(new ${Namespace}.schemas.Default(knexSetting, jdbcSettings));
        }

    }
});