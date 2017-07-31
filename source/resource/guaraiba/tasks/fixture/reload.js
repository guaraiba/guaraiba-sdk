desc(
    'Reload (clean and load) instances of model classes in databases.\n' +
    'Reload all models:\n'.info +
    '  db:fixture:reload\n'.choose +
    'Clean any model that contain book, article, or user word:\n'.info +
    '  db:fixture:reload[Book,Article,User]\n'.choose
);
task('reload', { async: true }, function () {
    var args = Array.prototype.slice.call(arguments),
        clean = jake.Task['fixture:clean'],
        load = jake.Task['fixture:load'];

    clean.addListener('complete', function () {
        load.invoke.apply(load, args);
    });

    load.addListener('complete', function () {
        complete();
    });

    clean.invoke.apply(clean, args);
});