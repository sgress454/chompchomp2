var request = require('request');
var assert = require('assert');

// Set up a cookie jar for this test suite
var j = request.jar();
request = request.defaults({jar:j});

describe('UserController.update()', function() {

  var newUser;

  // Create a user to use with the tests
  before(function(done) {
    User.create({
      firstName: "update",
      lastName: "user",
      email: "update.user@example.com",
      username: "update.user",
      password: "abc123"
    }).exec(function(err, user) {
      newUser = user;
      return done(err);
    });
  });

  describe('with no user logged in', function() {

    it('should return a 403 response', function(done) {

      var opts = {
        url: "http://localhost:1440/me",
        method: "PUT",
        json: {
          firstName: "updated_update",
          lastName: "updated_user",
          email: "updated_update.user@example.com",
          password: "xyz234"
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
          url: "http://localhost:1440/me",
          method: "PUT",
          json: {
            firstName: "updated_update",
            lastName: "updated_user",
            username: "update.user2",
            email: "updated_update.user@example.com",
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

      it('should respond with an updated user object', function() {

        assert(body.firstName == "updated_update");
        assert(body.lastName == "updated_user");
        assert(body.email == "updated_update.user@example.com");

      });

      it('should not include the password in the response', function() {

        assert(!body.password);

      });

      describe('should update the user', function() {

        var updatedUser;

        before(function(done) {
          User.findOne(newUser.id).exec(function(err, user) {
            updatedUser = user;
            return done(err);
          });
        });

        it('with properties matching those sent in the update', function() {

          assert(updatedUser.firstName == "updated_update");
          assert(updatedUser.lastName == "updated_user");
          assert(updatedUser.email == "updated_update.user@example.com");

        });

        it('with a new password hash', function() {

          assert(updatedUser.password != newUser.password);

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
              firstName: "update2",
              lastName: "user2",
              username: "update.user3",
              email: "update.user@example.com2",
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
              url: "http://localhost:1440/me",
              method: "PUT",
              json: {
                firstName: "updated_update2",
                lastName: "updated_user2",
                email: "updated_update.user@example.com2",
                password: "x"
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
