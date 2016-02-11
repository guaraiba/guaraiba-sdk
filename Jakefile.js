desc('Generate new guaraiba server application.');
task('new-app', { async: true }, function () {
    var name = process.env.name || 'app-server',
        cmd = "python node_modules/qooxdoo/create-application.py -t server -p source/resource/skeleton -n " + name;

    jake.exec(cmd, { printStdout: true, printStderr: true, breakOnError: false, interactive: true }, function () {
        complete();
    });
});

task('default', { async: true }, function () {
    jake.run('--tasks');
    console.log('');
    complete();
});