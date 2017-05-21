task('default', { async: true }, function () {
    jake.run('--tasks');
    complete();
});

if (guaraiba.Tasks.itIsDeveloping()) {
    require('./compiling');
    require('./generate');
}

require('./migrate');
require('./seed');
require('./fixture');