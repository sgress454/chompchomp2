var assert = require('assert');
var request = require('request');

var j = request.jar();
request = request.defaults({jar:j});

describe('GameController.create()', function () {

  var user;

  before(function(done) {
    User.create({
      firstName: 'create.game',
      lastName: 'player',
      email: 'player.create.game@example.com',
      username: 'creategame',
      password: 'abc123'
    }).exec(function(err, _user) {
      user = _user;
      return done();
    });
  });

  describe('without a logged-in user', function() {

    it('should return a 403 status code', function(done) {
      var opts = {
        url: "http://"+sails.config.host+':'+sails.config.port+'/game',
        method: 'POST',
        json: {}
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
        url: "http://"+sails.config.host+':'+sails.config.port+'/_login?id='+user.id,
        method: 'GET'
      };
      request(opts, function(err, res, body) {
        assert(res.statusCode == 200, res.statusCode);
        return done();
      });

    });

    it('should return a 400 status code if a minimum board size of 7 is not specified in the request', function(done) {
      var opts = {
        url: "http://"+sails.config.host+':'+sails.config.port+'/game',
        method: 'POST',
        json: {
          player1: user.id,
          boardSize: 6
        }
      };
      request(opts, function(err, res, body) {
        assert(res.statusCode == 400, res.statusCode);
        return done();
      });
    });

    describe('with valid inputs', function(done) {
      var res, body;

      before(function(done) {
        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game',
          method: 'POST',
          json: {
            boardSize: 9
          }
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

      it('should create a correct game record', function(done) {
        Game.findOne(body.id, function(err, game) {
          assert(game);
          assert(game.boardSize === 9);
          assert(game.board.length === 81, game.board.length);
          assert(game.board[0] === 1, game.board[0]);
          assert(game.board[8] === 2, game.board[8]);
          assert(game.board[72] === 2, game.board[72]);
          assert(game.board[80] === 1, game.board[80]);
          assert(game.player1 === user.id);
          return done();
        });
      });

    });

  });



});
