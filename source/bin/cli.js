#!/usr/bin/env node

var path = require('path'),
    fs = require('fs'),
    jake = require('jake'),
    args = process.argv.slice(2);

process.chdir(path.dirname(process.mainModule.filename)+'/../..');

if (args[0] == 'jake') {
    args.shift()
}

jake.run.apply(jake, args.length > 0 ? args : ['--tasks']);