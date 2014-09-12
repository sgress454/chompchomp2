module.exports = {
  inputs: {
    boardsize: {
      type: 'integer'
    },
    tilesize: {
      type: 'integer'
    },
    from: {
      type: 'integer'
    },
    to: {
      type: 'integer'
    }
  },
  exits: {
    success: {
      type: 'object'
    },
    error: false
  },
  fn: function($i, $x) {

      // To and From must both be ints
      var from = parseInt($i.from);
      var to = parseInt($i.to);
      var boardSize = $i.boardsize;

      if (isNaN(to) || isNaN(from)) {
        return $x.error('E_SPACE_NAN');
      }

      var numSquares = boardSize * boardSize;

      // To and From must be on the board
      if (to < 0 || from < 0 || to >= numSquares || from >= numSquares) {
        return $x.error('E_SPACE_OUT_OF_RANGE');
      }

      // Determine row and column of "from" tile
      var fromCol = from % boardSize;
      var fromRow = Math.floor(from / boardSize);

      // Determine row and column of "from" tile
      var toCol = to % boardSize;
      var toRow = Math.floor(to / boardSize);

      var yOffset = (toRow - fromRow) * $i.tilesize;
      var xOffset = (toCol - fromCol) * $i.tilesize;

      // Determine if this was a jump move or not
      var isJump = (Math.abs(toCol - fromCol) == 2 || Math.abs(toRow - fromRow) == 2);

      return $x.success({x: xOffset, y: yOffset, jump: isJump});

  }
};
