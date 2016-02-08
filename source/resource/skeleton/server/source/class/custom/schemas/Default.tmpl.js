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

        this.base(arguments, 'default', {
            client: 'pg',
            connection: 'postgres://${Name}:${Namespace}@127.0.0.1:5432/${Name}',
            debug: true
        });

        this.setJdbcSettings({
            driver: 'org.postgresql.Driver',
            connectString: 'jdbc:postgresql://127.0.0.1:5432/${Name}',
            username: '${Name}',
            password: 'password'
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
        },

        driverSettings: function (driver) {
            // Setting driver to convert int8 (oid=20) DB field type into a result javascript integer type.
            driver.types.setTypeParser(20, parseInt);
        }

    }
});