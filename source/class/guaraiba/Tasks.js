/**
 * Copyright ©:
 *      2015 Yoandry Pacheco Aguila
 *
 * License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *      See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *      Yoandry Pacheco Aguila < yoandrypa@gmail.com >
 *
 */

var jake = require('jake');

/**
 * This class offers the basic properties and features to create an start guaraiba server applications.
 *
 * @ignore(namespace,task,desc)
 */
qx.Class.define('guaraiba.Tasks', {
    statics: {
        /**
         *
         * @param nameSpace {String} Task namespace.
         * @param taskName {String} Task name.
         * @param async {Boolean?false} The task execution will be synchronous or asynchronous.
         * @param action {Function} Method to execute when task is called.
         * @param scope {Object} Scope to execute task method passed in the action parameter.
         * @param desciption {String} Task desctiption.
         */
        registerTask: function (nameSpace, taskName, async, action, scope, desciption) {
            var createTask = function () {
                desc(desciption);
                task(taskName, [], { async: async }, function () {
                    action.apply(scope || this, arguments);
                });
            };

            nameSpace ? namespace(nameSpace, createTask) : createTask();
        }
    }
});