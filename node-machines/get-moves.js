module.exports = {
  inputs: {
    game: {
      type: 'Game'
    },
    player: {
      type: 'integer'
    },
    from: {
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
    var boardSize = game.boardSize;
    var numSquares = (boardSize * boardSize);

    // From must be int
    var from = parseInt($i.from);

    if (isNaN(from)) {
      return $x.error();
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

    // Return the new board
    return $x.success(validSpaces);


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
