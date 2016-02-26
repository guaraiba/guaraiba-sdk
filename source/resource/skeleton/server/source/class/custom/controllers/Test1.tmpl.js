qx.Class.define("${Namespace}.controllers.Test1", {
    extend: guaraiba.Controller,

    members: {

        indexAction: function (request, response, params) {
            var session = this.getSession(),
                data = session.get('data') || 0;

            this.respond({
                name: 'TEST-001',
                description: 'Session get an set with ejs template engine for html format.',
                sessionId: session.get('id'),
                data: data++,
                items: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }],
                func1: function (text) {
                    return 'F1: ' + text + ','
                },
                func2: function (text) {
                    return text.toUpperCase()
                }
            }, { engine: 'ejs' });

            session.set('data', data);
        },

        t1Action: function (request, response, params) {
            var session = this.getSession(),
                data = session.get('data') || 0;

            this.respond({
                name: 'TEST-001',
                description: 'Session get an set with ejs template engine for html format.',
                sessionId: session.get('id'),
                data: data++,
                items: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }],
                func1: function (text) {
                    return 'F1: ' + text + ','
                },
                func2: function (text) {
                    return text.toUpperCase()
                }
            }, { engine: 'ejs' });

            session.set('data', data);
        },

        t2Action: function (request, response, params) {
            var session = this.getSession(),
                data = session.get('data') || 0;

            this.respond({
                name: 'TEST-002',
                description: 'Session get an set with jade template engine for html format.',
                sessionId: session.get('id'),
                data: data++,
                items: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }],
                func1: function (text) {
                    return 'F1: ' + text + ','
                },
                func2: function (text) {
                    return text.toUpperCase()
                }
            }, { engine: 'jade' });

            session.set('data', data);
        },

        t3Action: function (request, response, params) {
            var session = this.getSession(),
                data = session.get('data') || 0;

            this.respond([{
                    name: 'TEST-003',
                    description: 'Session get an set with mustache template engine for html format.',
                    sessionId: session.get('id'),
                    data: data++,
                    items: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }],
                    helpers: {
                        func1: function (text) {
                            return 'F1: ' + text + ','
                        },
                        func2: function (text) {
                            return text.toUpperCase()
                        }
                    }

                }],
                { engine: 'mu' }
            );

            session.set('data', data);
        },

        t4Action: function (request, response, params) {
            var session = this.getSession(),
                data = session.get('data') || 0;

            this.respond(
                {
                    name: 'TEST-004',
                    description: 'Session get an set with handlebars template engine for html format.',
                    sessionId: session.get('id'),
                    items: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }],
                    data: data++,
                    helpers: {
                        func1: function (text) {
                            return 'F1: ' + text + ','
                        },
                        func2: function (text) {
                            return text.toUpperCase()
                        }
                    }
                },
                { engine: 'hbs' }
            );
            session.set('data', data);
        },

        t5Action: function (request, response, params) {
            var jasperReport = guaraiba.template.engines.JasperReport.getInstance();

            this.respond({
                connection: jasperReport.getSqlDataSource(
                    'org.postgresql.Driver',
                    'jdbc:postgresql://127.0.0.1:5432/polymita',
                    'postgres',
                    '153247869'
                ),
                getParams: function () {
                    return params;
                }
            });
        },

        t6Action: function (request, response, params) {
            var vThis = this,
                jasperReport = guaraiba.template.engines.JasperReport.getInstance(),
                data = {
                    items: [
                        { a: 1, b: Math.round(Math.random() * 100) },
                        { a: 2, b: Math.round(Math.random() * 100) },
                        { a: 3, b: Math.round(Math.random() * 100) },
                        { a: 4, b: Math.round(Math.random() * 100) },
                        { a: 5, b: Math.round(Math.random() * 100) }
                    ]
                };

            var file = new guaraiba.tmp.File('guaraiba');
            file.writeFile(JSON.stringify(data), function (err) {
                vThis.respond({
                    dataSource: jasperReport.getJsonDataSource(file.path, 'items'),
                    reportParams: function () {
                        return {
                            name: 'TEST-006',
                            description: 'Session get an set with handlebars template engine for html format.'
                        }
                    }
                });
                file.unlink();
            });
        },

        t7Action: function (request, response, params) {
            this.respond({
                data: ${Namespace}.Router.getInstance().first('/test/t6.xml?a=5')
            });
        },

        t8Action: function (request, response, params) {
            this.respond({
                data: ${Namespace}.Router.getInstance().first('/test/t6.xml?a=5')
            });
        }

    }
});
