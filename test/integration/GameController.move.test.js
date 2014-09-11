var assert = require('assert');
var request = require('request');

var j = request.jar();
request = request.defaults({jar:j});

describe.only('GameController.move()', function () {

  var game, otherGame, player2TurnGame, player1, player2;

  before(function(done) {

    async.auto({
      player1: function(cb) {
        User.create({
          firstName: 'move.player1',
          lastName: 'player1',
          email: 'player1.move@example.com',
          username: 'player1_move',
          password: 'abc123'
        }).exec(function(err, _user) {
          player1 = _user;
          return cb(err);
        });
      },
      player2: function(cb) {
        User.create({
          firstName: 'move.player2',
          lastName: 'player2',
          email: 'player2.move@example.com',
          username: 'player2_move',
          password: 'abc123'
        }).exec(function(err, _user) {
          player2 = _user;
          return cb(err);
        });
      },
      game: ['player1', 'player2', function(cb, results) {
        Game.create({
          player1: player1.id,
          player2: player2.id,
          boardSize: 5,
          board: [1,1,0,0,2,
                  0,0,0,0,2,
                  0,0,0,0,0,
                  0,0,0,0,0,
                  2,0,0,0,1]
        }).exec(function(err, _game) {
          game = _game;
          return cb(err);
        });
      }],
      player2TurnGame: ['player1', 'player2', function(cb, results) {
        Game.create({
          player1: player1.id,
          player2: player2.id,
          turn: 2
        }).exec(function(err, _game) {
          player2TurnGame = _game;
          return cb(err);
        });
      }],
      otherGame: ['player2', function(cb, results) {
        Game.create({
          player1: player2.id,
        }).exec(function(err, _game) {
          otherGame = _game;
          return cb(err);
        });
      }]

    }, done);

  });

  describe('with a logged-out user', function() {

    it('should return a 403 status code', function(done) {
      var opts = {
        url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
        method: 'POST'
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
        url: "http://"+sails.config.host+':'+sails.config.port+'/_login?id='+player1.id,
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
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/-1/move',
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 404, res.statusCode);
          return done();
        });

      });

    });

    describe('with the id of a game the player hasn\'t joined', function() {

      it('should return a 404 status code', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+otherGame.id+'/move',
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 404, res.statusCode);
          return done();
        });

      });

    });

    describe('with the id of a game where it\'s not the player\'s turn', function() {

      it('should return a 400 status code', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+player2TurnGame.id+'/move',
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });

    });

    describe('invalid moves', function() {

      it('not having a `from` in the request should result in a 400 response', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            to: 25
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });

      it('not having a `to` in the request should result in a 400 response', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            from: 25
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });

      it('having a non-integer `from` in the request should result in a 400 response', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            from: 'abc',
            to: 0
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });

      it('having a non-integer `to` in the request should result in a 400 response', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            to: 'abc',
            from: 0
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });


      it('attempting to move off the board should return a 400 status code', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            from: 0,
            to: 25
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });

      it('attempting to move from a tile the player doesn\'t occupy should result in a 400 status code', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            from: 2,
            to: 3
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });

      it('attempting to move to a tile that is occupied should result in a 400 status code', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            from: 0,
            to: 1
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });

      it('attempting to move out of range should return a 400 status code', function(done) {

        var opts = {
          url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
          json: {
            from: 0,
            to: 19
          },
          method: 'POST'
        };
        request(opts, function(err, res, body) {
          assert(res.statusCode == 400, res.statusCode);
          return done();
        });

      });


    });

    describe('valid moves', function() {

      describe('moving one space', function() {
        var res, body;
        before(function(done) {

          var opts = {
            url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
            json: {
              from: 0,
              to: 5
            },
            method: 'POST'
          };
          request(opts, function(err, _res, _body) {
            res = _res;
            body = _body;
            return done(err);
          });
        });

        it('should return a 200 status code', function() {
          assert(res.statusCode === 200, res.statusCode);
        });

        it('should respond with a body indicating that it is the next player\'s turn', function() {
          assert(body.turn === 2);
        });

        it('should respond with a body indicating that the piece was cloned', function() {
          var expectedBoard= [1,1,0,0,2,
                              1,0,0,0,2,
                              0,0,0,0,0,
                              0,0,0,0,0,
                              2,0,0,0,1];
          for (var i = 0; i < expectedBoard.length; i++) {
            assert(body.board[i] == expectedBoard[i], "Expected "+expectedBoard[i]+" in spot "+i+"; found "+body.board[i]);
          }
        });

      });

      describe('moving two spaces', function() {

        var res, body;
        before(function(done) {

          var board = [1,1,0,0,2,
                       0,0,0,0,2,
                       0,0,0,0,0,
                       0,0,0,0,0,
                       2,0,0,0,1];
          Game.update({id: game.id}, {turn:1, board: board}).exec(function(err) {
            if (err) {return done(err);}

            var opts = {
              url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
              json: {
                from: 0,
                to: 10
              },
              method: 'POST'
            };
            request(opts, function(err, _res, _body) {
              res = _res;
              body = _body;
              return done(err);
            });

          });

        });

        it('should return a 200 status code', function() {
          assert(res.statusCode === 200, res.statusCode);
        });

        it('should respond with a body indicating that it is the next player\'s turn', function() {
          assert(body.turn === 2);
        });

        it('should respond with a body indicating that the piece jumped', function() {
          var expectedBoard= [0,1,0,0,2,
                              0,0,0,0,2,
                              1,0,0,0,0,
                              0,0,0,0,0,
                              2,0,0,0,1];
          for (var i = 0; i < expectedBoard.length; i++) {
            assert(body.board[i] == expectedBoard[i], "Expected "+expectedBoard[i]+" in spot "+i+"; found "+body.board[i]);
          }
        });

      });

      describe('moving to a space adjacent to the other player\'s pieces', function() {

        var res, body;
        before(function(done) {

          var board = [1,1,0,0,2,
                       0,0,0,0,2,
                       0,0,0,0,0,
                       0,0,0,0,0,
                       2,0,0,0,1];
          Game.update({id: game.id}, {turn:1, board: board}).exec(function(err) {
            if (err) {return done(err);}

            var opts = {
              url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
              json: {
                from: 1,
                to: 3
              },
              method: 'POST'
            };
            request(opts, function(err, _res, _body) {
              res = _res;
              body = _body;
              return done(err);
            });

          });

        });

        it('should return a 200 status code', function() {
          assert(res.statusCode === 200, res.statusCode);
        });

        it('should respond with a body indicating that it is the next player\'s turn', function() {
          assert(body.turn === 2);
        });

        it('should respond with a body indicating that the piece jumped and captured the other player\'s pieces', function() {
          var expectedBoard= [1,0,0,1,1,
                              0,0,0,0,1,
                              0,0,0,0,0,
                              0,0,0,0,0,
                              2,0,0,0,1];
          for (var i = 0; i < expectedBoard.length; i++) {
            assert(body.board[i] == expectedBoard[i], "Expected "+expectedBoard[i]+" in spot "+i+"; found "+body.board[i]);
          }
        });

      });


      describe('capturing all of the other player\'s pieces', function() {

        var res, body;
        before(function(done) {

          var board = [1,1,0,0,2,
                       0,0,0,0,2,
                       0,0,0,0,0,
                       0,0,0,0,0,
                       0,0,0,0,0];
          Game.update({id: game.id}, {turn:1, board: board}).exec(function(err) {
            if (err) {return done(err);}

            var opts = {
              url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
              json: {
                from: 1,
                to: 3
              },
              method: 'POST'
            };
            request(opts, function(err, _res, _body) {
              res = _res;
              body = _body;
              return done(err);
            });

          });

        });

        it('should return a 200 status code', function() {
          assert(res.statusCode === 200, res.statusCode);
        });

        it('should respond with a body indicating that it is nobody\'s turn', function() {
          assert(body.turn === 0);
        });

        it('should respond with a body indicating that player 1 is the winner', function() {
          assert(body.winner === 1);
        });

        it('should respond with a body indicating that the piece cloned and captured the other player\'s pieces', function() {
          var expectedBoard= [1,0,0,1,1,
                              0,0,0,0,1,
                              0,0,0,0,0,
                              0,0,0,0,0,
                              0,0,0,0,0];
          for (var i = 0; i < expectedBoard.length; i++) {
            assert(body.board[i] == expectedBoard[i], "Expected "+expectedBoard[i]+" in spot "+i+"; found "+body.board[i]);
          }
        });

      });

      describe('putting the other player in a position where they can\'t move, and have fewer pieces', function() {

        var res, body;
        before(function(done) {

          var board = [0,0,0,0,0,
                       0,1,1,1,1,
                       0,1,0,1,1,
                       0,1,1,2,2,
                       0,1,1,2,2];

          Game.update({id: game.id}, {turn:1, board: board}).exec(function(err) {
            if (err) {return done(err);}

            var opts = {
              url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
              json: {
                from: 17,
                to: 12
              },
              method: 'POST'
            };
            request(opts, function(err, _res, _body) {
              res = _res;
              body = _body;
              console.log(body);
              return done(err);
            });

          });

        });

        it('should return a 200 status code', function() {
          assert(res.statusCode === 200, res.statusCode);
        });

        it('should respond with a body indicating that it is nobody\'s turn', function() {
          assert(body.turn === 0);
        });

        it('should respond with a body indicating that player 1 is the winner', function() {
          assert(body.winner === 1);
        });

        it('should respond with a body indicating that the piece cloned and captured the other player\'s pieces', function() {
          var expectedBoard= [0,0,0,0,0,
                              0,1,1,1,1,
                              0,1,1,1,1,
                              0,1,1,1,2,
                              0,1,1,2,2];
          for (var i = 0; i < expectedBoard.length; i++) {
            assert(body.board[i] == expectedBoard[i], "Expected "+expectedBoard[i]+" in spot "+i+"; found "+body.board[i]);
          }
        });

      });

      describe('putting the other player in a position where they can\'t move, and have more pieces', function() {

        var res, body;
        before(function(done) {

          var board = [0,1,2,2,2,
                       1,2,2,2,2,
                       1,2,1,2,2,
                       1,1,1,2,2,
                       0,1,1,2,2];
          Game.update({id: game.id}, {turn:1, board: board}).exec(function(err) {
            if (err) {return done(err);}

            var opts = {
              url: "http://"+sails.config.host+':'+sails.config.port+'/game/'+game.id+'/move',
              json: {
                from: 1,
                to: 0
              },
              method: 'POST'
            };
            request(opts, function(err, _res, _body) {
              res = _res;
              body = _body;
              return done(err);
            });

          });

        });

        it('should return a 200 status code', function() {
          assert(res.statusCode === 200, res.statusCode);
        });

        it('should respond with a body indicating that it is still player 1\'s turn', function() {
          assert(body.turn === 1);
        });

        it('should respond with a body indicating that the piece cloned and captured the other player\'s pieces', function() {
          var expectedBoard= [1,1,2,2,2,
                              1,1,2,2,2,
                              1,2,1,2,2,
                              1,1,1,2,2,
                              0,1,1,2,2];
          for (var i = 0; i < expectedBoard.length; i++) {
            assert(body.board[i] == expectedBoard[i], "Expected "+expectedBoard[i]+" in spot "+i+"; found "+body.board[i]);
          }
        });

      });

    });


  });



});
