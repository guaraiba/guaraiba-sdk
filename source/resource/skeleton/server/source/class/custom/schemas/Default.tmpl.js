/**
 * This class offers the specific properties and features to configure the data base schemas of ${Name} application.
 */
qx.Class.define('${Namespace}.schemas.Default', {
    type: 'singleton',
    extend: guaraiba.orm.DBSchema,

    /**
     * Constructor
     */
    construct: function () {
        this.setModelPrefixName('${Namespace}.models');

        var db = qx.util.ResourceManager.getInstance().toUri('data/app.db');

        this.base(arguments, 'default', {
            client: 'sqlite3',
            connection: db,
            debug: true
        });

        // Include sqlite jdbc driver.
        guaraiba.javaClasspath('guaraiba/java/sqlite-jdbc-3.6.7.jar');
        this.setJdbcSettings({
            driver: 'org.sqlite.JDBC',
            connectString: 'jdbc:sqlite:' + db
        });
    },

    properties: {
        jdbcSettings: {
            check: 'Object'
        }
    },

    members: {
        /**
         * Initialize data base schemas of ${Namespace} application.
         *
         * This method is called immediately after construction of the schemes and
         * in this must be registered each of the model classes.
         */
        init: function () {
            // BEGIN REGISTER RECORD CLASS. DON'T REMOVE OR CHANGE THIS COMMENTARY.
            this.register(${Namespace}.models.People);
            // END REGISTER RECORD CLASS. DON'T REMOVE OR CHANGE THIS COMMENTARY.
        }

    }
});