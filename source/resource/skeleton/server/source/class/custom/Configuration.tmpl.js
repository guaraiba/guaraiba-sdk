/**
 * This class offers the specific properties and features to configure the ${Name} application.
 *
 * @require(guaraiba.Passport)
 */
qx.Class.define('${Namespace}.Configuration', {
    type: 'singleton',
    extend: guaraiba.Configuration,

    construct: function () {
        this.base(arguments);

        // this.setPort(3002);
        // this.setMaxWorkers(4);
        // this.sessionSecret('a3d68565c5bd86c8d13af3b98c23e6bb');

        // Registrar el esquema por defecto de la base de datos del sistema.
        this.registerDBSchema(${Namespace}.schemas.Default.getInstance());
        this.setDefaultFormat('json');
        this.setAllowCORS(false);

        // Configure profile map for local passport authentication.
        this.getPassport('local').setProfileMap({
            username: 'username',
            name: 'name',
            lastAccessDate: 'lastAccessDate',
            lastAccessAddress: 'lastAccessAddress'
        });
    }
});