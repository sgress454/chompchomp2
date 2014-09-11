var assert = require('assert');
var request = require('request');

var j = request.jar();
request = request.defaults({jar:j});

describe('SessionController.login()', function () {

  var newUser;

  // Create a user to use with the tests
  before(function(done) {
    User.create({
      firstName: "login",
      lastName: "user",
      email: "login.user@example.com",
      username: "login.user",
      password: "abc123"
    }).exec(function(err, user) {
      newUser = user;
      return done(err);
    });
  });

  it('with an invalid email should return a 403 response code', function(done) {
    var options = {
      url: 'http://'+sails.config.host+':'+sails.config.port+'/me/login',
      method: 'post',
      json: {
        email: 'foo@foo.com',
        password: 'cats'
      }
    };

    request(options, function(err, res, body) {
      assert(res.statusCode === 403, "Expected 403 status; got: "+res.statusCode);
      done(err);
    });
  });

  it('with an invalid password should return a 403 response code', function(done) {

    var options = {
      url: 'http://'+sails.config.host+':'+sails.config.port+'/me/login',
      method: 'post',
      json: {
        email: 'login.user@example.com',
        password: 'cats'
      }
    };

    request(options, function(err, res, body) {
      assert(res.statusCode === 403, "Expected 403 status; got: "+res.statusCode);
      done(err);
    });
  });

  describe('with valid credentials', function () {

    var res;
    var body;

    before(function(done) {

      var options = {
        url: 'http://'+sails.config.host+':'+sails.config.port+'/me/login',
        method: 'post',
        json: {
          email: 'login.user@example.com',
          password: 'abc123'
        }
      };

      request(options, function(err, _res, _body) {
        if(err) return next(err);
        res = _res;
        body = _body;
        done();
      });
    });

    it('should return a 200 status code', function() {
      assert(res.statusCode === 200, "Expected 200 status; got: "+res.statusCode);
    });

    it('should log you in', function(done) {
      var options = {
        url: 'http://'+sails.config.host+':'+sails.config.port+'/me',
        method: 'get'
      };

      request(options, function(err, res, body) {
        body = JSON.parse(body);
        assert(res.statusCode === 200);
        assert(body.id == newUser.id);
        done(err);
      });
    });

  });

});
