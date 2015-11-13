task('default', { async: true }, function () {
    jake.run('--tasks');
    complete();
});

require('./compiling');
require('./generate');
require('./fixture');
require('./migrate');