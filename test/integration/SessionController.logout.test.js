var assert = require('assert');
var request = require('request');
var async = require('async');

var j = request.jar();
request = request.defaults({jar:j});

describe('SessionController.logout()', function () {

  describe('with logged out user', function () {

    it('should return a 403 status code', function (done) {
      var options = {
        url: 'http://'+sails.config.host+':'+sails.config.port+'/me/logout',
        method: 'post'
      };

      request(options, function (err, res, body) {
        if(err) return cb(err);
        assert(res.statusCode === 403, res.statusCode);
        done();
      });
    });

  });


  describe('with logged in user', function () {
    var statusCode;

    before(function(done) {
      async.auto({
        bootstrapUser: function (next) {
          User.create({
            firstName: 'logout',
            lastName: 'user',
            email: 'logout.user@example.com',
            username: "logout.user",
            password: 'abc123'
          }).exec(next);
        },

        login: ['bootstrapUser', function(next, results) {
          var options = {
            url: 'http://'+sails.config.host+':'+sails.config.port+'/_login?id=' + results.bootstrapUser.id,
            method: 'get'
          };

          request(options, function(err, res, body) {
            if(err) return next(err);
            next();
          });
        }],

        logout: ['login', function(next, results) {
          var options = {
            url: 'http://'+sails.config.host+':'+sails.config.port+'/me/logout',
            method: 'post'
          };

          request(options, function(err, res, body) {
            if(err) return next(err);
            statusCode = res.statusCode;
            next();
          });
        }]
      }, done);
    });

    /**
     * Tests
     */

    it('should return a 200 status code', function() {
      assert(statusCode === 200);
    });

    it('should log me out', function(done) {
      var options = {
        url: 'http://'+sails.config.host+':'+sails.config.port+'/me',
        method: 'get'
      };

      request(options, function(err, res, body) {
        assert(!err);
        assert(res.statusCode === 403);
        done();
      });
    });

  });
});
