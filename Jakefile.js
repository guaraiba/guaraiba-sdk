desc('Generate new guaraiba server application.');

task('default', { async: true }, function () {
    jake.run('--tasks');
    console.log('');
    complete();
});

require('./source/resource/guaraiba/tasks/generate/application');