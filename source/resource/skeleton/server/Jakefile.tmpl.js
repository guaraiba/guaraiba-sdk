try {
    require('./source/script/${Namespace}-server');
    var resource = qx.util.ResourceManager.getInstance();
    require(resource.toUri('guaraiba/tasks/Jakefile.js'));
} catch (ex) {
    console.log('');
    console.log('----------------------------------------------------------------------');
    console.log('* Please compile project by first time with ( jake ${Name}:build:dev )');
    console.log('* After this you can run more jake tasks.');
    console.log('----------------------------------------------------------------------');
}

namespace('${Name}', function () {
    require('./tasks/build');
});

task('default', { async: true }, function () {
    jake.run('--tasks');
    console.log('');
    complete();
});