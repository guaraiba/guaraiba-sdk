/**
 * Copyright ©:
 *      2015 Yoandry Pacheco Aguila
 *
 * License:
 *      LGPL-3.0: http://spdx.org/licenses/LGPL-3.0.html#licenseText
 *      EPL-1.0: http://spdx.org/licenses/EPL-1.0.html#licenseText
 *      See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *      Yoandry Pacheco Aguila < yoandrypa@gmail.com >
 *
 */

/**
 * This mixin offers the basic features for execute requireAuth method before any controller action.
 */
qx.Mixin.define('guaraiba.controllers.MSafety', {
    members: {
        /**
         * Filter to allow access to actions only when user was authenticated.
         *
         * @param done {Function}
         */
        requireAuth: function (done) {
            var session = this.getSession(),
                format = this.getFormat();

            if (!session.get('profile')) {
                if (!format || format === 'html') {
                    // Record the page the user was trying to get to, will try to return them there after login.
                    session.set('successRedirect', this.getRequest().getUrl());

                    this.redirect('/login');
                } else {
                    this.respondWithStatusNetworkAuthenticationRequired();
                }
            }

            done();
        }
    }
});