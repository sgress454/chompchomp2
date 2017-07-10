/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Machine = require('node-machine');
module.exports = {

  create: function(req, res) {

    var data = _.pick(req.params.all(), ['public', 'boardSize', 'rules', 'invitee']);

    if (data.boardSize && (isNaN(data.boardSize) || data.boardSize < 7)) {
      return res.badRequest('E_BAD_BOARDSIZE');
    }

    data.player1 = req.session.user.id;

    Game.create(data, function(err, game) {
      game.player1 = req.session.user;
      Game.subscribe(req, game);
      Game.publishCreate(game);
      if (err) {return res.negotiate(err);}
      return res.json(game);
    });

  },

  join: function (req, res) {

    var id = req.param('id');

    Game.findOne(id).exec(function(err, game) {
      if (err) {return res.negotiate(err);}

      // Invalid game ID?  Send a 404.
      if (!game) {return res.notFound();}

      // If the game is already full, send a 400
      if (game.player1 && game.player2) {
        return res.badRequest('GAME_IN_PROGRESS');
      }

      // If the game is private and the user isn't invited, send a 403
      if (!game.public && game.invitee !== req.session.user.email) {
        return res.forbidden();
      }

      Game.subscribe(req, game);

      // Otherwise update the game and return OK
      Game.update({id: id}, {player2: req.session.user.id}).exec(function(err) {
        Game.publishUpdate(id, {player2: req.session.user});
        if (err) {return res.negotiate(err);}
        return res.ok();
      });

    });

  },

  play: function(req, res) {
    return res.view("game");
  },

  find: function (req, res) {
    var user = req.session.user;

    async.auto({
      gamesInProgress: function(cb) {
        Game.find({
          winner: 0,
          or: [{player1: user.id, player2: {'!': null}}, {player2: user.id, player1: {'!': null}}]
        }).populate('player1').populate('player2').exec(cb);
      },
      gamesJoinable: function(cb) {
        Game.find({
          player2: null,
          invitee: [null, user.email]
        }).populate('player1').populate('player2').exec(cb);
      },
      gamesPlayed: function(cb) {
        Game.find({
          winner: {'!': 0},
          or: [{player1: user.id}, {player2: user.id}]
        }).populate('player1').populate('player2').exec(cb);
      }
    }, function done(err, results) {
      if (err) {return res.serverError(err);}
      Game.subscribe(req, results.gamesJoinable);
      Game.subscribe(req, results.gamesInProgress);
      Game.watch(req);
      return res.json({
        gamesInProgress: results.gamesInProgress,
        gamesJoinable: results.gamesJoinable,
        gamesPlayed: results.gamesPlayed
      });
    });

  },

  move: function (req, res) {

    var id = req.param('id');
    var playerId = req.session.user.id;

    Game.findOne(id).exec(function(err, game) {
      if (err) {return res.negotiate(err);}

      // Invalid game ID?  Send a 404.
      if (!game) {return res.notFound();}

      // If the logged in player is not in this game, return a 404
      if (game.player1 !== playerId && game.player2 !== playerId) {
        return res.notFound();
      }

      try {
        Machine.build(require("../../node-machines/validate-move.js"))
               .configure({game: game, playerId: playerId, to: req.param('to'), from: req.param('from')})
               .exec({
                  invalid: res.badRequest,
                  valid: function(result) {
                    console.log("RESULT OF VALIDATE MOVE", result);
                    var board = result.board;
                    var winner = result.winner;
                    var turn = result.turn;
                    var otherPlayer = playerId == 1 ? 2 : 1;
                    var update = {
                      turn: turn,
                      board: board,
                      winner: winner
                    };
                    var move = result;
                    move.from = req.param('from');
                    move.to = req.param('to');
                    move.lastTurn = game.turn;

                    if (winner) {update.endedAt = new Date();}
                    Game.update({id: id}, update).exec(function(err) {
                      if (err) {return res.negotiate(err);}
                      Game.message(id, _.extend({action: "move"}, move));
                      if (update.winner) {
                        Game.publishUpdate(id, {winner: winner, endedAt: update.endedAt});
                      }
                      return res.ok(result);
                    });
                  }
               });
      } catch (e) {
        console.log(e);
      }
    });


  }

};

