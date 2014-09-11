var request = require('request');
var assert = require('assert');

// Set up a cookie jar for this test suite
var j = request.jar();
request = request.defaults({jar:j});

describe('UserController.resetPassword()', function() {

  var newUser;

  // Create a user to use with the tests
  before(function(done) {
    User.create({
      firstName: "resetpassword",
      lastName: "user",
      username: "reset.user",
      email: "resetpassword.user@example.com",
      password: "abc123"
    }).exec(function(err, user) {
      newUser = user;
      return done(err);
    });
  });

  describe('with no user logged in', function() {

    it('should return a 403 response', function(done) {

      var opts = {
        url: "http://localhost:1440/me/password",
        method: "PUT",
        json: {
          password: "xyz234",
        }
      };

      request(opts, function(err, res, body) {
        assert(res.statusCode === 403, "Expected 403 status; got " + res.statusCode);
        return done();
      });

    });

  });

  describe('with a user logged in', function() {

    before(function(done) {

      var opts = {
        method: "GET",
        url: "http://localhost:1440/_login?id="+newUser.id,
      };

      request(opts, function(err, res, body) {
        return done(err);
      });

    });

    describe('with valid inputs', function() {

      var res, body;
      before(function(done) {

        var opts = {
          url: "http://localhost:1440/me/password",
          method: "PUT",
          json: {
            firstName: "updated_resetpassword_update",
            lastName: "updated_user",
            username: "reset.user2",
            email: "updated_resetpassword_update.user@example.com",
            password: "xyz234"
          }
        };

        request(opts, function(err, _res, _body) {
          res = _res;
          body = _body;
          return done(err);
        });

      });

      it('should respond with a 200 status', function() {

        assert(res.statusCode === 200, "Expected 200 status; got " + res.statusCode);

      });

      it('should not have a user in the response body', function() {

        assert(body == 'OK');

      });

      describe('should update the user', function() {

        var updatedUser;

        before(function(done) {
          User.findOne(newUser.id).exec(function(err, user) {
            updatedUser = user;
            return done(err);
          });
        });

        it('with a new password hash', function() {

          assert(updatedUser.password != newUser.password);

        });

        it('but should not update any other properties', function() {

          assert(updatedUser.firstName == newUser.firstName);
          assert(updatedUser.lastName == newUser.lastName);
          assert(updatedUser.email == newUser.email);

        });


      });


    });

    describe('with invalid inputs', function () {

      var secondUser;
      var res, body;
      before(function(done) {

        async.series({

          createUser: function(next) {
            User.create({
              firstName: "resetpassword2",
              lastName: "user2",
              username: "reset.user3",
              email: "resetpassword.user@example.com2",
              password: "abc1232"
            }).exec(function(err, user) {
              secondUser = user;
              return next(err);
            });
          },

          loginUser: function(next) {

            var opts = {
              method: "GET",
              url: "http://localhost:1440/_login?id="+secondUser.id,
            };

            request(opts, function(err, res, body) {
              return next(err);
            });

          },

          updateUser: function(next) {

            var opts = {
              url: "http://localhost:1440/me/password",
              method: "PUT",
              json: {
                password: "x",
              }
            };

            request(opts, function(err, _res, _body) {
              res = _res;
              body = _body;
              return next(err);
            });

          }

        }, done);



      });

      it('should respond with a 400 status', function() {

        assert(res.statusCode === 400, "Expected 400 status; got " + res.statusCode);

      });

      it('should not update the user', function(done) {

        User.findOne(secondUser.id).exec(function(err, user) {
          assert(user.firstName == secondUser.firstName, body.firstName+" "+secondUser.firstName);
          assert(user.lastName == secondUser.lastName);
          assert(user.email == secondUser.email);
          assert(user.password == secondUser.password);
          return done(err);
        });


      });


    });

  });

});
