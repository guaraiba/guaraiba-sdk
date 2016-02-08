namespace('build', function () {
    desc('Build Server application for development.');
    task('dev', { async: true }, function () {
        jake.exec('python generate.py', { printStdout: true }, function () {
            complete();
        });
    });

    desc('Build Server applications for production.');
    task('prod', { async: true }, function () {
        jake.exec('python generate.py build', { printStdout: true }, function () {
            complete();
        });
    });
});