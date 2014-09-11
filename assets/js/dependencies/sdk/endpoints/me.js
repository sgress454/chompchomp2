angular.module('chompchomp_api');
angular.module('chompchomp_api').config(["chompchomp_endpointsProvider",

  function(chompchomp_endpoints) {

      angular.extend(chompchomp_endpoints.$get(), {

        /**
         * chompchomp.signup()
         *
         * POST /me/signup
         *
         * ----------------------------------------------------------------
         * chompchomp.signup(data)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @param  {Object} data The required new user data
         * @return {Object}
         */

        signup: function (data) {

          var request = {
            url: '/me/signup',
            method: 'POST',
            params: data
          };

          return request;

        },

        /**
         * chompchomp.login()
         *
         * POST /me/login
         *
         * ----------------------------------------------------------------
         * chompchomp.login(email, password)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @param  {String} email Email of the user to log in
         * @param  {String} password Password of the user to log in
         * @return {Object}
         */

        login: function (email, password) {

          var request = {
            url: '/me/login',
            method: 'POST',
            params: {
              email: email,
              password: password
            }
          };

          return request;

        },

        /**
         * chompchomp.logout()
         *
         * POST /me/logout
         *
         * ----------------------------------------------------------------
         * chompchomp.logout()
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @return {Object}
         */

        logout: function () {

          var request = {
            url: '/me/logout',
            method: 'POST'
          };

          return request;

        },

        /**
         * chompchomp.updateProfile()
         *
         * PUT /me
         *
         * ----------------------------------------------------------------
         * chompchomp.updateProfile(data)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @param  {Object} data The required new user data
         * @return {Object}
         */

        updateProfile: function (data) {

          var request = {
            url: '/me',
            method: 'PUT',
            params: data
          };

          return request;

        },


        /**
         * chompchomp.getProfile()
         *
         * GET /me
         *
         * ----------------------------------------------------------------
         * chompchomp.getProfile(data)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @return {Object}
         */

        getProfile: function (data) {

          var request = {
            url: '/me',
            method: 'GET'
          };

          return request;

        },


        /**
         * chompchomp.requestNewPassword()
         *
         * POST /me/password
         *
         * ----------------------------------------------------------------
         * chompchomp.requestNewPassword(email)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @param  {String} email The email address of the user requesting password reset
         * @return {Object}
         */

        requestNewPassword: function (email) {

          var request = {
            url: '/me/password',
            params: {
              email: email
            },
            method: 'POST'
          };

          return request;

        },

       /**
         * chompchomp.verifyIdentity()
         *
         * GET /me/verify
         *
         * ----------------------------------------------------------------
         * chompchomp.verifyIdentity(token)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @param  {String} token A password reset token linked to a user
         * @return {Object}
         */

        verifyIdentity: function (token) {

          var request = {
            url: '/me/verify',
            params: {
              token: token
            },
            method: 'GET'
          };

          return request;

        },

       /**
         * chompchomp.chooseNewPassword()
         *
         * GET /me/password
         *
         * ----------------------------------------------------------------
         * chompchomp.chooseNewPassword(password)
         * .then(...)
         * .catch(...)
         * ----------------------------------------------------------------
         *
         * @param  {String} password New password for the user
         * @return {Object}
         */

        chooseNewPassword: function (password) {

          var request = {
            url: '/me/password',
            params: {
              password: password
            },
            method: 'PUT'
          };

          return request;

        },


      });


  }

]);

