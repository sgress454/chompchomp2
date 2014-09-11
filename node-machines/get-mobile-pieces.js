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
    var tilesToCheck, spaces, playerPieces;
    if (!pieces) {
      tilesToCheck = _.where(Object.keys(game.board), function(tile) {return game.board[tile] == player;});
    } else {
      tilesToCheck = pieces['player'+player];
    }

    var mobilePieces = _.without(_.map(tilesToCheck, function(tile) {
      var col = tile % boardSize;
      var row = Math.floor(tile / boardSize);

      if (null !== getValidSpace(col - 1, row - 1)) {return tile;}
      if (null !== getValidSpace(col, row - 1)) {return tile;}
      if (null !== getValidSpace(col + 1, row - 1)) {return tile;}
      if (null !== getValidSpace(col - 1, row)) {return tile;}
      if (null !== getValidSpace(col + 1, row)) {return tile;}
      if (null !== getValidSpace(col - 1, row + 1)) {return tile;}
      if (null !== getValidSpace(col, row + 1)) {return tile;}
      if (null !== getValidSpace(col + 1, row + 1)) {return tile;}
      if (null !== getValidSpace(col - 2, row - 2)) {return tile;}
      if (null !== getValidSpace(col, row - 2)) {return tile;}
      if (null !== getValidSpace(col + 2, row - 2)) {return tile;}
      if (null !== getValidSpace(col - 2, row)) {return tile;}
      if (null !== getValidSpace(col + 2, row)) {return tile;}
      if (null !== getValidSpace(col - 2, row + 2)) {return tile;}
      if (null !== getValidSpace(col, row + 2)) {return tile;}
      if (null !== getValidSpace(col + 2, row + 2)) {return tile;}

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
