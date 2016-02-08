desc(
    'Reload (clean and load) instances of model classes in databases.\n' +
    '\t\t\t\t// Reload all models:\n'.info +
    '\t\t\t\tjake fixture:reload\n'.choose +
    '\t\t\t\t// Clean any model that contain book, article, or user word:\n'.info +
    '\t\t\t\tjake fixture:reload[Book,Article,User]\n'.choose
);
task('reload', ['clean','load'], { async: true }, function () {
    complete();
});
