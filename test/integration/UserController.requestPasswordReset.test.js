var assert = require('assert');
var request = require('request');
var async = require('async');
var fs = require('fs');

var j = request.jar();
request = request.defaults({jar:j});

describe('UserController.requestPasswordReset()', function () {

  describe('with a valid email address', function () {

    var res, body, token;

    before(function(done) {

      User.create({
        firstName: 'requestpassword',
        lastName: 'reset',
        email: 'request_password_reset@example.com',
        username: "request.user",
        password: 'abc123'
      }).exec(function(err) {
        if (err) {return done(err);}
        var options = {
          url: 'http://'+sails.config.host+':'+sails.config.port+'/me/password',
          method: 'post',
          json: {
            email: 'request_password_reset@example.com'
          }
        };
        request(options, function (err, _res, _body) {
          res = _res;
          body = _body;
          return done(err);
        });
      });
    });

    it('should return a 200 status code', function () {
      assert(res.statusCode === 200, res.statusCode);
    });

    it('should set a resetPasswordToken on the user', function (done) {
      User.findOne({email:'request_password_reset@example.com'}).exec(function(err, user) {
        if (err) {return done(err);}
        assert(user.resetPasswordToken);
        token = user.resetPasswordToken;
        done();
      });
    });

    it('should send an email to the user', function (done) {
      fs.readFile('.tmp/email.txt', function(err, data) {
        if (err) {return done(err);}
        var emailOptions = JSON.parse(data);
        assert(emailOptions.to == 'request_password_reset@example.com', 'Expected email address "request_password_reset@example.com"; saw "'+emailOptions.to+'"');
        assert(emailOptions.html.match(new RegExp(token)));
        done();
      });
    });

  });

  describe('with an invalid email address', function () {

    it('should return a 404 response', function(done) {

        var options = {
          url: 'http://'+sails.config.host+':'+sails.config.port+'/me/password',
          method: 'post',
          json: {
            email: 'request_bad_password_reset@foobar.com'
          }
        };
        request(options, function (err, res, body) {
          assert(res.statusCode == 404);
          return done(err);
        });

    });

  });

  describe('with no email address', function () {

    it('should return a 400 response', function(done) {

        var options = {
          url: 'http://'+sails.config.host+':'+sails.config.port+'/me/password',
          method: 'post'
        };
        request(options, function (err, res, body) {
          assert(res.statusCode == 400);
          return done(err);
        });

    });

  });

});
