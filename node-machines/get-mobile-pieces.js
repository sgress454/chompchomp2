module.exports = {
  inputs: {
    game: {
      type: 'Game'
    },
    pieces: {
      type: 'object'
    },
    player: {
      type: 'integer'
    }
  },
  exits: {
    success: {
      type: 'array'
    }
  },
  fn: function($i, $x) {

    var player = $i.player;
    var game = $i.game;
    var pieces = $i.pieces;
    var boardSize = game.boardSize;
    var numSquares = (boardSize * boardSize);

    // Get spaces that the player occupies
    var tilesToCheck, valToCheck, spaces, playerPieces;
    if (!pieces) {
      spaces = _.find(game.board, function(tile) {return tile == '0';});
      playerPieces = _.find(game.board, function(tile) {return tile == player;});
    } else {
      spaces = pieces.space;
      playerPieces = pieces['player'+player];
    }
    if (spaces.length > playerPieces.length) {
      tilesToCheck = playerPieces;
      valToCheck = 0;
    } else {
      tilesToCheck = spaces;
      valToCheck = player;
    }

    var mobilePieces = _.without(_.map(tilesToCheck, function(tile) {
      var col = tile % boardSize;
      var row = Math.floor(tile / boardSize);

      if (null !== getValidSpace(col - 1, row - 1, valToCheck)) {return tile;}
      if (null !== getValidSpace(col, row - 1, valToCheck)) {return tile;}
      if (null !== getValidSpace(col + 1, row - 1, valToCheck)) {return tile;}
      if (null !== getValidSpace(col - 1, row, valToCheck)) {return tile;}
      if (null !== getValidSpace(col + 1, row, valToCheck)) {return tile;}
      if (null !== getValidSpace(col - 1, row + 1, valToCheck)) {return tile;}
      if (null !== getValidSpace(col, row + 1, valToCheck)) {return tile;}
      if (null !== getValidSpace(col + 1, row + 1, valToCheck)) {return tile;}
      if (null !== getValidSpace(col - 2, row - 2, valToCheck)) {return tile;}
      if (null !== getValidSpace(col, row - 2, valToCheck)) {return tile;}
      if (null !== getValidSpace(col + 2, row - 2, valToCheck)) {return tile;}
      if (null !== getValidSpace(col - 2, row, valToCheck)) {return tile;}
      if (null !== getValidSpace(col + 2, row, valToCheck)) {return tile;}
      if (null !== getValidSpace(col - 2, row + 2, valToCheck)) {return tile;}
      if (null !== getValidSpace(col, row + 2, valToCheck)) {return tile;}
      if (null !== getValidSpace(col + 2, row + 2, valToCheck)) {return tile;}

      return null;

    }), null);

    // Return the new board
    return $x.success(mobilePieces);


    // Given a column, row and tile value, return the
    // space # if it is a) a valid tile and b) has the specified value,
    // otherwise return undefined.
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
