angular.module('chompchomp').controller('GameCtrl', [

  '$rootScope',
  '$scope',
  'api',

  function($rootScope, $scope, $api) {

    $scope.$watch("gameId", function(newVal) {
      $api.getGame($scope.gameId).then(function(game) {
        window.scope = $scope.game = game;
        $scope.board = $scope.game.board;
        $scope.player = $scope.chomp.user.id == $scope.game.player1.id ? 1 : 2;
        $scope.turn = $scope.game.turn;

        $scope.$watch("turn", function(newVal) {

          $scope.destinations = [];
          $scope.mobilePieces = [];

          if ($scope.turn == $scope.player) {
            machines['get-mobile-pieces'].configure({game: $scope.game, player: $scope.player}).exec({
              success: function(pieces) {
                $scope.mobilePieces = pieces;
              }
            });
          }
        });

      });
    });

    io.socket.on('game', function(message) {
      if (message.id == $scope.gameId) {
        if (message.verb == "messaged") {
          var response = message.data;
          $scope.game.board = $scope.board = response.board;
          $scope.turn = response.turn;
          $scope.selectedTile = null;
          $scope.destinations = [];
          if ($scope.turn == $scope.player) {
            machines['get-mobile-pieces'].configure({game: $scope.game, player: $scope.player}).exec({
              success: function(pieces) {
                $scope.mobilePieces = pieces;
              }
            });
          }
          $scope.$apply();
        }
      }
    });

    $scope.isMobile = function(tile) {
      return $scope.mobilePieces.indexOf(tile.toString())!==-1;
    };

    $scope.isDestination = function(tile) {
      return $scope.destinations.indexOf(tile)!==-1;
    };

    $scope.clickTile = function(tile) {

      if ($scope.isMobile(tile)) {
        $scope.selectedTile = tile;
        machines['get-moves'].configure({game: $scope.game, from: tile}).exec({
          success: function(tiles) {
            console.log(tiles);
            $scope.destinations = tiles;
          }
        });
      }

      else if ($scope.isDestination(tile)) {
        $api.move($scope.gameId, $scope.selectedTile, tile)
           .then(function(response) {
            $scope.game.board = $scope.board = response.board;
            $scope.turn = response.turn;
            $scope.selectedTile = null;
            $scope.destinations = [];
           })
           .catch(function(response) {
            console.log(response);
           });
      }

      else {
        $scope.selectedTile = null;
        $scope.destinations = [];
      }

    };

  }
]);
