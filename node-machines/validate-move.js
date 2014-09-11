module.exports = {
  inputs: {
    game: {
      type: 'Game'
    },
    playerId: {
      type: 'integer'
    },
    to: {
      type: 'integer'
    },
    from: {
      type: 'integer'
    }
  },
  exits: {
    valid: {
      type: 'array'
    },
    invalid: false
  },
  fn: function($i, $x) {

      var game = $i.game;

      // If it's not this player's turn, return a 400
      if ((game.player1 == $i.playerId && game.turn == 2) || (game.player2 == $i.playerId && game.turn == 1)) {
        return $x.invalid('E_WRONG_TURN');
      }

      var player = game.player1 == $i.playerId ? 1 : 2;
      var otherPlayer = player == 1 ? 2 : 1;

      // To and From must both be ints
      var from = parseInt($i.from);
      var to = parseInt($i.to);
      var boardSize = game.boardSize;
      var numSquares = (boardSize * boardSize);


      if (isNaN(to) || isNaN(from)) {
        return $x.invalid('E_SPACE_NAN');
      }

      // To and From must be on the board
      if (to < 0 || from < 0 || to >= numSquares || from >= numSquares) {
        return $x.invalid('E_SPACE_OUT_OF_RANGE');
      }

      // From must be a space the player occupies
      if (game.board[from] != player) {
        return $x.invalid('E_FROM_WRONG_PLAYER '+from+' '+game.board[from]+' '+player);
      }

      // Determine row and column of "from" tile
      var fromCol = from % boardSize;
      var fromRow = Math.floor(from / boardSize);

      // Determine valid spaces to move to
      var validSpaces = _.without([
        // First adjacent spaces
        getValidSpace(fromCol - 1, fromRow - 1),
        getValidSpace(fromCol, fromRow - 1),
        getValidSpace(fromCol + 1, fromRow - 1),
        getValidSpace(fromCol - 1, fromRow),
        getValidSpace(fromCol + 1, fromRow),
        getValidSpace(fromCol - 1, fromRow + 1),
        getValidSpace(fromCol, fromRow + 1),
        getValidSpace(fromCol + 1, fromRow + 1),
        // Then the jump spaces
        getValidSpace(fromCol - 2, fromRow - 2),
        getValidSpace(fromCol, fromRow - 2),
        getValidSpace(fromCol + 2, fromRow - 2),
        getValidSpace(fromCol - 2, fromRow),
        getValidSpace(fromCol + 2, fromRow),
        getValidSpace(fromCol - 2, fromRow + 2),
        getValidSpace(fromCol, fromRow + 2),
        getValidSpace(fromCol + 2, fromRow + 2)
      ], null);

      if (validSpaces.indexOf(to) === -1) {
        return $x.invalid('E_SPACE_BLOCKED');
      }

      // Looks like the move is valid.  First, place the piece in the spot.
      game.board[to] = player;

      // Determine row and column of "from" tile
      var toCol = to % boardSize;
      var toRow = Math.floor(to / boardSize);

      // If this was a jump move, remove the piece from its former location
      if (Math.abs(toCol - fromCol) == 2 || Math.abs(toRow - fromRow) == 2) {
        game.board[from] = 0;
      }

      var captureableSpaces = _.compact([
        getValidSpace(toCol - 1, toRow - 1, otherPlayer),
        getValidSpace(toCol, toRow - 1, otherPlayer),
        getValidSpace(toCol + 1, toRow - 1, otherPlayer),
        getValidSpace(toCol - 1, toRow, otherPlayer),
        getValidSpace(toCol + 1, toRow, otherPlayer),
        getValidSpace(toCol - 1, toRow + 1, otherPlayer),
        getValidSpace(toCol, toRow + 1, otherPlayer),
        getValidSpace(toCol + 1, toRow + 1, otherPlayer),
      ]);

      // Change them all to be the player that moved
      _.each(captureableSpaces, function(space) {
        game.board[space] = player;
      });

      // Find all the game pieces
      var pieces = _.reduce(game.board, function(memo, player, tile) {
        if (player === 1) {
          memo.player1.push(tile);
        } else if (player === 2) {
          memo.player2.push(tile);
        } else {
          memo.space.push(tile);
        }
        return memo;
      }, {player1: [], player2: [], space: []});

      // If the board is full, pick a winner
      if (pieces.player1.length + pieces.player2.length == numSquares) {
        if (pieces.player1.length > pieces.player2.length) {
          winner = 1;
          turn = 0;
        } else {
          winner = 2;
          turn = 0;
        }
        return $x.valid({board: game.board, winner: winner, turn: turn});
      } else {
        // Otherwise check that the other player can move
        var Machine = require('node-machine');
        var getMobilePieces = Machine.build(require('./get-mobile-pieces.js'));
        getMobilePieces.configure({game: game, pieces: pieces, player: otherPlayer}).exec({
          success: function(mobilePieces) {
            console.log(mobilePieces);
            if (mobilePieces.length) {
              winner = 0;
              turn = otherPlayer;
            }
            else if (pieces['player'+player].length > pieces['player'+otherPlayer].length) {
              winner = player;
              turn = 0;
            } else {
              winner = 0;
              turn = player;
            }
            return $x.valid({board: game.board, winner: winner, turn: turn});
          }
        });
      }

      function getValidSpace(col, row, tileVal) {

        tileVal = tileVal || 0;

        if (row >= boardSize || col >= boardSize || row < 0 || col < 0) {
          return null;
        }
        var space = (row * boardSize) + col;
        if (game.board[space] == tileVal) {return space;}
        return null;
      }



  }
};
