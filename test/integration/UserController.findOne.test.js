var request = require('request');
var assert = require('assert');

// Set up a cookie jar for this test suite
var j = request.jar();
request = request.defaults({jar:j});

describe('UserController.findOne()', function() {

  var newUser;

  // Create a user to use with the tests
  before(function(done) {
    User.create({
      firstName: "find",
      lastName: "user",
      email: "find.user@example.com",
      username: "find.user",
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
        method: "GET",
      };

      request(opts, function(err, res, body) {
        assert(res.statusCode === 403, "Expected 403 status; got " + res.statusCode);
        return done();
      });

    });

  });

  describe('with a user logged in', function() {

    var res, body;

    before(function(done) {

      var opts = {
        method: "GET",
        url: "http://localhost:1440/_login?id="+newUser.id,
      };

      request(opts, function(err, _res, _body) {

        var opts = {
          url: "http://localhost:1440/me",
          method: "GET"
        };

        request(opts, function(err, _res, _body) {
          res = _res;
          body = JSON.parse(_body);
          return done(err);
        });

      });

    });

    it('should respond with a 200 status', function() {

      assert(res.statusCode === 200, "Expected 200 status; got " + res.statusCode);

    });

    it('should respond with the correct user object', function() {

      assert(body.firstName == newUser.firstName);
      assert(body.lastName == newUser.lastName);
      assert(body.email == newUser.email);

    });

    it('should not include the password in the response', function() {

      assert(!body.password);

    });

  });

});
