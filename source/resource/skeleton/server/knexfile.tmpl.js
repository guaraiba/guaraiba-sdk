module.exports = {
    client: 'pg',
    connection: 'postgres://postgres:153247869@127.0.0.1:5432/${Name}',
    debug: true,
    migrations: {
        directory: './source/resource/data/migrations/default',
        tableName: 'default_migrations'
    },
    seeds: {
        directory: './source/resource/data/seeds/default'
    }
};