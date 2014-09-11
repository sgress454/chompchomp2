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

    data.player1 = req.session.user.id;

    Game.create(data, function(err, game) {
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
      if (!game.public && game.invitee !== req.session.user.id) {
        return res.forbidden();
      }

      // Otherwise update the game and return OK
      Game.update({id: id}, {player2: req.session.user.id}).exec(function(err) {
        if (err) {return res.negotiate(err);}
        return res.ok();
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
                    var board = result.board;
                    var winner = result.winner;
                    var turn = result.turn;
                    var otherPlayer = playerId == 1 ? 2 : 1;
                    Game.update({id: id}, {
                      turn: turn,
                      board: board,
                      winner: winner
                    }).exec(function(err) {
                      if (err) {return res.negotiate(err);}
                      return res.ok({
                        turn: turn,
                        board: board,
                        winner: winner
                      });
                    });
                  }
               });
      } catch (e) {
        console.log(e);
      }
    });


  }

};

