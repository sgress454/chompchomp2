var assert = require('assert');
var request = require('request');

var j = request.jar();
request = request.defaults({jar:j});

describe('GameController.join()', function () {

  var player1, player2, player3, publicGame, privateGame;
  before(function(done) {

    async.auto({
      player1: function(cb) {
        User.create({
          firstName: 'join.game.player1',
          lastName: 'player1',
          email: 'player1.join.game@example.com',
          username: 'player1_join',
          password: 'abc123'
        }).exec(function(err, _user) {
          player1 = _user;
          return cb(err);
        });
      },
      player2: function(cb) {
        User.create({
          firstName: 'join.game.player2',
          lastName: 'player2',
          email: 'player2.join.game@example.com',
          username: 'player2_join',
          password: 'abc123'
        }).exec(function(err, _user) {
          player2 = _user;
          return cb(err);
        });
      },
      player3: function(cb) {
        User.create({
          firstName: 'join.game.player3',
          lastName: 'player3',
          email: 'player3.join.game@example.com',
          username: 'player3_join',
          password: 'abc123'
        }).exec(function(err, _user) {
          player3 = _user;
          return cb(err);
        });
      },
      publicGame: ['player1', function(cb, results) {
        Game.create({
          player1: player1.id
        }).exec(function(err, _game) {
          publicGame = _game;
          return cb(err);
        });
      }],
      privateGame: ['player1', 'player2', function(cb, results) {
        Game.create({
          player1: player1.id,
          public: false,
          invitee: player2.email
        }).exec(function(err, _game) {
          privateGame = _game;
          return cb(err);
        });
      }]
    }, done);

  });

  describe('without a logged-in user', function() {

    it('should return a 403 status code', function(done) {
      var opts = {
        url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+publicGame.id+'/join',
        method: 'PUT'
      };
      request(opts, function(err, res, body) {
        assert(res.statusCode == 403, res.statusCode);
        return done();
      });
    });

  });

  describe('with a logged-in user', function() {

    before(function(done) {

      var opts = {
        url: "http://"+sails.config.host+':'+sails.config.port+'/_login?id='+player2.id,
        method: 'GET'
      };
      request(opts, function(err, res, body) {
        assert(res.statusCode == 200, res.statusCode);
        return done();
      });

    });

    describe('with an invalid game id', function() {

      it('should return a 404 status code', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/-1/join',
          method: 'PUT'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 404, res.statusCode);
          return done();
        });

      });

    });



    describe('attempting to join a public game with one current player', function() {

      var res, body;

      before(function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+publicGame.id+'/join',
          method: 'PUT'
        };
        request(opts, function(err, _res, _body) {
          res = _res;
          body = _body;
          return done();
        });

      });

      it('should return a 200 status code', function() {
        assert(res.statusCode === 200);
      });

      it('should update the game record with the second player', function(done) {

        Game.findOne(publicGame.id, function(err, game) {
          assert(game.player2 === player2.id);
          return done(err);
        });

      });

    });

    describe('attempting to join a public game with two players (game in progress)', function() {

      var res, body;

      before(function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/_login?id='+player3.id,
          method: 'GET'
        };
        request(opts, function(err, _res, _body) {
          assert(_res.statusCode == 200, _res.statusCode);

          var opts = {
            url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+publicGame.id+'/join',
            method: 'PUT'
          };
          request(opts, function(err, _res, _body) {
            res = _res;
            body = _body;
            return done();
          });

        });

      });


      it('should return a 400 status code', function() {
        assert(res.statusCode === 400);
      });

      it('should not update the game record with the second player', function(done) {

        Game.findOne(publicGame.id, function(err, game) {
          assert(game.player2 === player2.id);
          return done(err);
        });

      });

    });

    describe('attempting to join a private game that you aren\'t invited to', function() {

      var res, body;

      before(function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+privateGame.id+'/join',
          method: 'PUT'
        };
        request(opts, function(err, _res, _body) {
          res = _res;
          body = _body;
          return done();
        });

      });

      it('should return a 403 status code', function() {
        assert(res.statusCode === 403);
      });

      it('should not update the game record with the second player', function(done) {

        Game.findOne(privateGame.id, function(err, game) {
          assert(typeof game.player2 == 'undefined');
          return done(err);
        });

      });

    });

    describe('attempting to join a private game that you are invited to', function() {

      var res, body;

      before(function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/_login?id='+player2.id,
          method: 'GET'
        };
        request(opts, function(err, _res, _body) {
          assert(_res.statusCode == 200, _res.statusCode);
          var opts = {
            url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+privateGame.id+'/join',
            method: 'PUT'
          };
          request(opts, function(err, _res, _body) {
            res = _res;
            body = _body;
            return done();
          });
        });

      });


      it('should return a 200 status code', function() {
        assert(res.statusCode === 200);
      });

      it('should update the game record with the second player', function(done) {

        Game.findOne(privateGame.id, function(err, game) {
          assert(game.player2 == player2.id);
          return done(err);
        });

      });

    });

  });

});
