/**
* Game.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    player1: {
      model: "user",
      required: true
    },

    player2: {
      model: "user",
      defaultsTo: null
    },

    boardSize: {
      type: "integer",
      required: true,
      min: 5,
      defaultsTo: 7
    },

    board: {
      type: "json"
    },

    rules: {
      type: "json"
    },

    moves: {
      type: "json"
    },

    turn: {
      type: "integer",
      defaultsTo: 1
    },

    winner: {
      type: "integer",
      defaultsTo: 0
    },

    "public": {
      type: "boolean",
      defaultsTo: true
    },

    invitee: {
      type: "string",
      defaultsTo: null
    },

    endedAt: {
      type: "date"
    }

  },

  beforeCreate: function(values, cb) {
    if (!values.board) {
      values.board = [];
      for (var i = 0; i < (values.boardSize * values.boardSize); i++) {
        values.board[i] = 0;
      }
      values.board[0] = 1;
      values.board[values.boardSize - 1] = 2;
      values.board[values.boardSize * (values.boardSize - 1)] = 2;
      values.board[(values.boardSize * values.boardSize) - 1] = 1;
    }
    return cb();
  }
};

